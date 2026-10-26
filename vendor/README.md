# Approved UI archive

`poc-ui-0.1.1.tgz` contains the unpublished private package `@poc/ui@0.1.1`.

- Workshop: [ui-workshop](https://github.com/NazgoooAtanasov/ui-workshop).
- Storybook approval: 2026-10-26, followed by merging [workshop PR #2](https://github.com/NazgoooAtanasov/ui-workshop/pull/2).
- Package source: [`e3b2b302d28df52f7da8cd82d44adb4ff29670e4`](https://github.com/NazgoooAtanasov/ui-workshop/commit/e3b2b302d28df52f7da8cd82d44adb4ff29670e4).
- The component implementation matches the approved PR head `444ca54687354ae7f8fed3382247f58f7354b598`; the source commit also updates the package version and README archive name.
- Built with Node 24.16.0 and pnpm 10.15.1 using `pnpm pack --pack-destination <directory>`.
- SHA-256: `ae437ddd1c99f3ff61e7852ce78ab9816945f03028b0e873febdad2751e623e2`.

This patch release changes the primary Button's default/focus fill to black and
its hover fill to `#262626`. Compiled JavaScript, TypeScript declarations, and
the font notice are unchanged from `0.1.0`; application usage stays unchanged.

The archive contains compiled JavaScript, TypeScript declarations, CSS, the font
notice, package metadata, and the workshop README. React is a peer supplied by
the consumer. The archive is committed here so Vercel can install it from this
repository's checkout.

Install from the consumer repository root:

```sh
pnpm add ./vendor/poc-ui-0.1.1.tgz
```

Each approved release gets a new versioned archive. A compatible update replaces
the dependency reference and lockfile while keeping application component usage.
Previous archives remain available in Git history.
The Inter notice copied to `public/licenses/Inter-OFL.txt` comes from the package.

Official documentation: [pnpm pack](https://pnpm.io/10.x/cli/pack),
[local package installation](https://pnpm.io/10.x/cli/add).
