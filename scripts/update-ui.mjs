import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const directory = fileURLToPath(new URL('..', import.meta.url));
const workshop = 'NazgoooAtanasov/ui-workshop';
const packageName = '@poc/ui';
const base = 'main';
const usage = 'Usage: node scripts/update-ui.mjs --ui-commit <full merged workshop SHA> --ui-version <version>';
const dependencyFiles = 'package.json\npnpm-lock.yaml';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: directory,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    throw new Error(`${command} ${args[0]} failed. The consumer update was not completed.`);
  }
  return result.stdout?.trim() ?? '';
}

function main() {
  const { values } = parseArgs({ options: {
    'ui-commit': { type: 'string' },
    'ui-version': { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  } });
  if (values.help) {
    console.log(usage);
    return;
  }
  const sha = values['ui-commit'];
  const version = values['ui-version'];
  if (!/^[a-f0-9]{40}$/.test(sha ?? '') || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version ?? '')) {
    throw new Error(usage);
  }
  if (process.env.CI !== 'true' && run('git', ['status', '--porcelain'])) {
    throw new Error('Commit or stash existing changes before running the update locally.');
  }

  const origin = run('git', ['config', '--get', 'remote.origin.url']);
  const repository = origin.match(/^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([^/]+\/[^/]+?)(?:\.git)?$/)?.[1];
  if (!repository || repository === workshop) {
    throw new Error('Run this script in a consumer repository with a GitHub origin remote.');
  }
  run('git', ['fetch', 'origin', base]);
  const baseSha = run('git', ['rev-parse', `origin/${base}`]);
  if (run('git', ['rev-parse', 'HEAD']) !== baseSha) {
    throw new Error(`Run from a checkout of the latest origin/${base}.`);
  }

  const release = JSON.parse(run('gh', ['api', `repos/${workshop}/contents/package.json?ref=${sha}`, '--jq', '.content | @base64d']));
  if (release.name !== packageName || release.version !== version) {
    throw new Error('The workshop commit does not contain the requested UI package version.');
  }
  const releaseStatus = run('gh', ['api', `repos/${workshop}/compare/${sha}...main`, '--jq', '.status']);
  if (releaseStatus !== 'ahead' && releaseStatus !== 'identical') {
    throw new Error('The requested workshop commit has not been merged into main.');
  }

  const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
  const prefix = `github:${workshop}#`;
  const current = manifest.dependencies[packageName];
  if (!current?.startsWith(prefix) || !/^[a-f0-9]{40}$/.test(current.slice(prefix.length))) {
    throw new Error(`${packageName} must already use a GitHub dependency pinned to a full workshop SHA.`);
  }
  const specifier = `${prefix}${sha}`;
  if (current === specifier) {
    console.log(`${packageName} ${version} is already pinned to ${sha}. No update PR is needed.`);
    return;
  }
  if (run('gh', ['api', `repos/${workshop}/compare/${current.slice(prefix.length)}...${sha}`, '--jq', '.status']) !== 'ahead') {
    throw new Error('The requested release does not advance the current UI commit.');
  }

  const branch = `chore/update-ui-${version}-${sha.slice(0, 12)}`;
  const marker = `<!-- ui-workshop-update:${sha} -->`;
  const query = new URLSearchParams({ state: 'open', base, per_page: '100' });
  const pulls = JSON.parse(run('gh', ['api', '--paginate', '--slurp', `repos/${repository}/pulls?${query}`])).flat();
  const existing = pulls.find((pull) => pull.head.ref === branch);
  if (existing) {
    if (!existing.body?.includes(marker)) throw new Error('The update branch already has a PR for a different request.');
    console.log(`Update pull request: ${existing.html_url}`);
    return;
  }
  if (pulls.some((pull) => pull.body?.includes('<!-- ui-workshop-update:'))) {
    throw new Error('Merge or close the open UI update PR before requesting another update.');
  }

  const buildEnvironment = { ...process.env };
  delete buildEnvironment.GH_TOKEN;
  delete buildEnvironment.GITHUB_TOKEN;
  const prepared = run('git', ['ls-remote', '--heads', 'origin', `refs/heads/${branch}`]);
  let expected;
  if (prepared) {
    run('git', ['fetch', 'origin', `refs/heads/${branch}`]);
    const preparedSha = run('git', ['rev-parse', 'FETCH_HEAD']);
    const parent = run('git', ['rev-parse', `${preparedSha}^`]);
    run('git', ['merge-base', '--is-ancestor', parent, baseSha]);
    if (run('git', ['diff', '--name-only', parent, preparedSha]) !== dependencyFiles) {
      throw new Error('The prepared update branch changes files outside the dependency update.');
    }
    expected = JSON.parse(run('git', ['show', `${parent}:package.json`]));
    expected.dependencies[packageName] = specifier;
    if (JSON.stringify(JSON.parse(run('git', ['show', `${preparedSha}:package.json`]))) !== JSON.stringify(expected)) {
      throw new Error('The prepared update branch does not match the requested dependency update.');
    }
    run('git', ['switch', '--detach', preparedSha]);
    run('pnpm', ['install', '--frozen-lockfile'], { env: buildEnvironment, stdio: 'inherit' });
  } else {
    run('git', ['var', 'GIT_AUTHOR_IDENT']);
    expected = structuredClone(manifest);
    expected.dependencies[packageName] = specifier;
    run('git', ['switch', '--detach', baseSha]);
    run('pnpm', ['add', `${packageName}@${specifier}`], { env: buildEnvironment, stdio: 'inherit' });
  }
  run('pnpm', ['build'], { env: buildEnvironment, stdio: 'inherit' });
  if (JSON.stringify(JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'))) !== JSON.stringify(expected)) {
    throw new Error('The update changed package metadata beyond the UI dependency. Nothing was pushed.');
  }
  const expectedChanges = prepared ? '' : dependencyFiles;
  if (
    run('git', ['diff', '--name-only', 'HEAD']) !== expectedChanges ||
    run('git', ['ls-files', '--others', '--exclude-standard']) !== ''
  ) {
    throw new Error('The update or build changed unexpected files. Nothing was pushed.');
  }
  if (!prepared) {
    run('git', ['add', '--', 'package.json', 'pnpm-lock.yaml']);
    run('git', ['commit', '-m', `chore(deps): update ${packageName} to ${version}`], { stdio: 'inherit' });
    run('git', ['push', 'origin', `HEAD:refs/heads/${branch}`], { stdio: 'inherit' });
  }

  const bodyDirectory = mkdtempSync(join(tmpdir(), 'consumer-ui-update-pr-'));
  try {
    const bodyPath = join(bodyDirectory, 'body.md');
    writeFileSync(bodyPath, [
      marker,
      '',
      `Adopt ${packageName} ${version} from the merged workshop release.`,
      '',
      `- Workshop commit: https://github.com/${workshop}/commit/${sha}`,
      `- Previous dependency: \`${current}\``,
      `- New dependency: \`${specifier}\``,
      '- Validation: pnpm build (includes typecheck).',
      '- Changes: package.json and pnpm-lock.yaml only.',
      '',
      'Review the consumer preview before merging. The workshop package version is unchanged by this update.',
      '',
    ].join('\n'));
    const url = run('gh', ['pr', 'create', '--repo', repository, '--base', base, '--head', branch,
      '--title', `Update ${packageName} to ${version}`, '--body-file', bodyPath]);
    console.log(`Update pull request: ${url}`);
  } finally {
    rmSync(bodyDirectory, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode ??= 1;
}
