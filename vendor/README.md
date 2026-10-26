# Approved UI archive

`poc-ui-0.1.0.tgz` contains the unpublished private package `@poc/ui@0.1.0`.

- Workshop: [ui-workshop](https://github.com/NazgoooAtanasov/ui-workshop).
- Storybook approval: 2026-10-26, followed by merging [workshop PR #1](https://github.com/NazgoooAtanasov/ui-workshop/pull/1).
- Package source: [`8e1cb5980e83338e91ab23f1bab9abce40c47d22`](https://github.com/NazgoooAtanasov/ui-workshop/commit/8e1cb5980e83338e91ab23f1bab9abce40c47d22).
- The component implementation matches the approved PR head `050bf3ddcfe9334e681f21c6d3fe1dbb79efd364`; the source commit also clarifies the README approval gate.
- Built with Node 24.16.0 and pnpm 10.15.1 using `pnpm pack --pack-destination <directory>`.
- SHA-256: `2735aa353aa3e84d04743976fea96f43111c1552b33ceb30c34a6e3795a7fffe`.

The archive contains compiled JavaScript, TypeScript declarations, CSS, the font
notice, package metadata, and the workshop README. React is a peer supplied by
the consumer. The archive is committed here so Vercel can install it from this
repository's checkout.

Install from the consumer repository root:

```sh
pnpm add ./vendor/poc-ui-0.1.0.tgz
```

Each approved release gets a new versioned archive. A compatible update replaces
the dependency reference and lockfile while keeping application component usage.
The Inter notice copied to `public/licenses/Inter-OFL.txt` comes from the package.

Official documentation: [pnpm pack](https://pnpm.io/10.x/cli/pack),
[local package installation](https://pnpm.io/10.x/cli/add).
