import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../scripts/update-ui.mjs', import.meta.url));
const sha = 'b'.repeat(40);
const oldSha = 'a'.repeat(40);
const version = '0.2.0';
const branch = `chore/update-ui-${version}-${sha.slice(0, 12)}`;
const prUrl = 'https://github.com/fixture/consumer/pull/1';
const roots = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function command(cwd, executable, args) {
  const result = spawnSync(executable, args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, `${executable} ${args.join(' ')}\n${result.stderr}`);
  return result.stdout.trim();
}

function fixture(mode = 'success') {
  const root = mkdtempSync(join(tmpdir(), 'consumer-ui-update-test-'));
  roots.push(root);
  const seed = join(root, 'seed');
  const remote = join(root, 'remote.git');
  const checkout = join(root, 'checkout');
  const bin = join(root, 'bin');
  mkdirSync(join(seed, 'scripts'), { recursive: true });
  mkdirSync(bin);
  copyFileSync(source, join(seed, 'scripts/update-ui.mjs'));
  writeFileSync(join(seed, 'package.json'), `${JSON.stringify({
    name: 'consumer', version: '1.0.0', private: true,
    dependencies: { '@poc/ui': `github:NazgoooAtanasov/ui-workshop#${mode === 'already_current' ? sha : oldSha}` },
  }, null, 2)}\n`);
  writeFileSync(join(seed, 'pnpm-lock.yaml'), `sha: ${mode === 'already_current' ? sha : oldSha}\n`);
  writeFileSync(join(seed, 'app.txt'), 'Existing application\n');
  command(seed, 'git', ['init', '-b', 'main']);
  command(seed, 'git', ['config', 'user.name', 'Update test']);
  command(seed, 'git', ['config', 'user.email', 'update@example.invalid']);
  command(seed, 'git', ['add', '--all']);
  command(seed, 'git', ['commit', '-m', 'Consumer baseline']);
  command(root, 'git', ['clone', '--bare', seed, remote]);
  command(root, 'git', ['clone', remote, checkout]);
  const git = (...args) => command(checkout, 'git', args);
  git('config', 'user.name', 'Update test');
  git('config', 'user.email', 'update@example.invalid');
  // Keep a GitHub origin for repository detection; Git traffic stays local.
  git('remote', 'set-url', 'origin', 'https://github.com/fixture/consumer.git');
  git('config', `url.file://${remote}.insteadOf`, 'https://github.com/fixture/consumer.git');
  const mainSha = git('rev-parse', 'HEAD');
  if (mode === 'push_rejected') {
    writeFileSync(join(remote, 'hooks/pre-receive'), '#!/bin/sh\nexit 1\n');
    chmodSync(join(remote, 'hooks/pre-receive'), 0o755);
  }

  writeFileSync(join(bin, 'package.json'), '{"type":"module"}\n');
  writeFileSync(join(bin, 'gh'), `#!/usr/bin/env node
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const args=process.argv.slice(2);
const mode=process.env.UPDATE_TEST_MODE;
const path=args.find(arg=>arg.startsWith('repos/'));
if(args[0]==='api' && path.includes('/contents/package.json')) {
 process.stdout.write(JSON.stringify({name:'@poc/ui',version:'${version}'}));
} else if(args[0]==='api' && path.includes('/compare/')) {
 process.stdout.write(path.endsWith('...main') ? (mode==='unmerged'?'behind':'ahead') : (mode==='stale_release'?'behind':'ahead'));
} else if(args[0]==='api' && path.includes('/pulls?')) {
 const pulls=[];
 if(mode==='duplicate') pulls.push({html_url:'${prUrl}',head:{ref:'${branch}'},body:'<!-- ui-workshop-update:${sha} -->'});
 if(mode==='other_update') pulls.push({html_url:'${prUrl}',head:{ref:'chore/update-ui-other'},body:'<!-- ui-workshop-update:other -->'});
 process.stdout.write(JSON.stringify([pulls]));
} else if(args[0]==='pr' && args[1]==='create') {
 if(mode==='pr_failed') process.exit(1);
 writeFileSync(join(process.env.UPDATE_TEST_ROOT,'pr-body.md'),readFileSync(args[args.indexOf('--body-file')+1]));
 process.stdout.write('${prUrl}');
} else process.exit(99);
`);
  writeFileSync(join(bin, 'pnpm'), `#!/usr/bin/env node
import {appendFileSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
if(process.env.GH_TOKEN || process.env.GITHUB_TOKEN) throw new Error('Git credentials leaked to dependency scripts');
const args=process.argv.slice(2);
const mode=process.env.UPDATE_TEST_MODE;
appendFileSync(join(process.env.UPDATE_TEST_ROOT,'pnpm-calls.txt'),args.join(' ')+'\\n');
if(args[0]==='add') {
 if(mode==='install_failed') process.exit(19);
 const manifest=JSON.parse(readFileSync('package.json','utf8'));
 manifest.dependencies['@poc/ui']=args[1].slice('@poc/ui@'.length);
 if(mode==='metadata_changed') manifest.version='99.0.0';
 writeFileSync('package.json',JSON.stringify(manifest,null,2)+'\\n');
 writeFileSync('pnpm-lock.yaml','sha: ${sha}\\n');
 if(mode==='source_changed') writeFileSync('app.txt','Unexpected source edit\\n');
}
if(args[0]==='install' && readFileSync('pnpm-lock.yaml','utf8')!=='sha: ${sha}\\n') process.exit(20);
if(args[0]==='build' && mode==='build_failed') process.exit(17);
`);
  chmodSync(join(bin, 'gh'), 0o755);
  chmodSync(join(bin, 'pnpm'), 0o755);
  function execute(overrides = {}) {
    return spawnSync(process.execPath, [join(checkout, 'scripts/update-ui.mjs'),
      '--ui-commit', overrides.sha ?? sha, '--ui-version', overrides.version ?? version,
    ], {
      cwd: root,
      env: { ...process.env, CI: 'true', PATH: `${bin}:${process.env.PATH}`,
        GH_TOKEN: 'fixture-token', GITHUB_TOKEN: 'fixture-token',
        UPDATE_TEST_ROOT: root, UPDATE_TEST_MODE: overrides.mode ?? mode },
      encoding: 'utf8', timeout: 20_000,
    });
  }
  const remoteGit = (...args) => command(root, 'git', ['--git-dir', remote, ...args]);
  return { root, checkout, mainSha, execute, git, remoteGit };
}

test('updates only the dependency files and opens an auditable PR without changing main', () => {
  const f = fixture();
  const result = f.execute();
  assert.equal(result.status, 0, result.stderr);
  const head = f.remoteGit('rev-parse', `refs/heads/${branch}`);
  assert.equal(f.remoteGit('rev-parse', `${head}^`), f.mainSha);
  assert.equal(f.remoteGit('rev-parse', 'refs/heads/main'), f.mainSha);
  assert.equal(f.git('rev-parse', 'refs/heads/main'), f.mainSha);
  assert.equal(f.remoteGit('diff', '--name-only', f.mainSha, head), 'package.json\npnpm-lock.yaml');
  const manifest = JSON.parse(f.remoteGit('show', `${head}:package.json`));
  assert.equal(manifest.version, '1.0.0');
  assert.equal(manifest.dependencies['@poc/ui'], `github:NazgoooAtanasov/ui-workshop#${sha}`);
  assert.equal(f.remoteGit('show', `${head}:pnpm-lock.yaml`), `sha: ${sha}`);
  const body = readFileSync(join(f.root, 'pr-body.md'), 'utf8');
  assert.ok(body.includes(`<!-- ui-workshop-update:${sha} -->`));
  assert.ok(body.includes(oldSha) && body.includes(version));
  assert.ok(result.stdout.includes(prUrl));
  assert.equal(readFileSync(join(f.root, 'pnpm-calls.txt'), 'utf8'), `add @poc/ui@github:NazgoooAtanasov/ui-workshop#${sha}\nbuild\n`);
});

for (const mode of ['already_current', 'duplicate']) {
  test(`${mode} finishes without another build or PR`, () => {
    const f = fixture(mode);
    const result = f.execute();
    assert.equal(result.status, 0, result.stderr);
    assert.ok(!existsSync(join(f.root, 'pnpm-calls.txt')));
    assert.ok(!existsSync(join(f.root, 'pr-body.md')));
    assert.match(result.stdout, mode === 'duplicate' ? /Update pull request:/ : /No update PR is needed/);
  });
}

for (const [mode, overrides, message] of [
  ['success', { sha: 'main' }, /Usage:/],
  ['success', { version: '0.3.0' }, /requested UI package version/],
  ['unmerged', {}, /has not been merged/],
  ['stale_release', {}, /does not advance/],
  ['other_update', {}, /open UI update PR/],
  ['install_failed', {}, /pnpm add failed/],
  ['build_failed', {}, /pnpm build failed/],
  ['metadata_changed', {}, /package metadata/],
  ['source_changed', {}, /unexpected files/],
  ['push_rejected', {}, /pre-receive hook declined/],
]) {
  test(`${mode} ${JSON.stringify(overrides)} never creates a PR or changes remote main`, () => {
    const f = fixture(mode);
    const result = f.execute(overrides);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, message);
    assert.equal(f.remoteGit('rev-parse', 'refs/heads/main'), f.mainSha);
    assert.equal(f.remoteGit('for-each-ref', '--format=%(refname)', 'refs/heads'), 'refs/heads/main');
    assert.ok(!existsSync(join(f.root, 'pr-body.md')));
  });
}

test('retries PR creation from the previously pushed branch without another commit', () => {
  const f = fixture('pr_failed');
  assert.equal(f.execute().status, 1);
  const head = f.remoteGit('rev-parse', `refs/heads/${branch}`);
  f.git('switch', 'main');
  const retry = f.execute({ mode: 'success' });
  assert.equal(retry.status, 0, retry.stderr);
  assert.equal(f.remoteGit('rev-parse', `refs/heads/${branch}`), head);
  assert.ok(retry.stdout.includes(prUrl));
  assert.equal(readFileSync(join(f.root, 'pnpm-calls.txt'), 'utf8'), `add @poc/ui@github:NazgoooAtanasov/ui-workshop#${sha}\nbuild\ninstall --frozen-lockfile\nbuild\n`);
});

test('a modified prepared branch is rejected without overwriting it', () => {
  const f = fixture('pr_failed');
  assert.equal(f.execute().status, 1);
  writeFileSync(join(f.checkout, 'app.txt'), 'Changed prepared branch\n');
  f.git('add', 'app.txt');
  f.git('commit', '--amend', '--no-edit');
  const tampered = f.git('rev-parse', 'HEAD');
  f.git('push', '--force', 'origin', `HEAD:refs/heads/${branch}`);
  f.git('switch', 'main');
  const retry = f.execute({ mode: 'success' });
  assert.notEqual(retry.status, 0);
  assert.match(retry.stderr, /outside the dependency update/);
  assert.equal(f.remoteGit('rev-parse', `refs/heads/${branch}`), tampered);
  assert.ok(!existsSync(join(f.root, 'pr-body.md')));
});

test('accepts a detached CI checkout of the latest consumer main', () => {
  const f = fixture();
  f.git('switch', '--detach', f.mainSha);
  const result = f.execute();
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes(prUrl));
});

test('rejects a stale consumer checkout before updating dependencies', () => {
  const f = fixture();
  writeFileSync(join(f.checkout, 'app.txt'), 'Local consumer commit\n');
  f.git('add', 'app.txt');
  f.git('commit', '-m', 'Local changes');
  const result = f.execute();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /latest origin\/main/);
  assert.ok(!existsSync(join(f.root, 'pnpm-calls.txt')));
});

test('retries a prepared update when main has advanced independently', () => {
  const f = fixture('pr_failed');
  assert.equal(f.execute().status, 1);
  const head = f.remoteGit('rev-parse', `refs/heads/${branch}`);
  f.git('switch', 'main');
  writeFileSync(join(f.checkout, 'app.txt'), 'New consumer feature\n');
  f.git('add', 'app.txt');
  f.git('commit', '-m', 'Consumer feature');
  f.git('push', 'origin', 'main');
  const mainSha = f.git('rev-parse', 'HEAD');
  const retry = f.execute({ mode: 'success' });
  assert.equal(retry.status, 0, retry.stderr);
  assert.equal(f.remoteGit('rev-parse', `refs/heads/${branch}`), head);
  assert.equal(f.remoteGit('rev-parse', 'refs/heads/main'), mainSha);
  assert.equal(f.remoteGit('diff', '--name-only', `main...${branch}`), 'package.json\npnpm-lock.yaml');
});
