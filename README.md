# React Router consumer

The application side of the Figma-to-React proof of concept. Shared component
source lives in the separate `ui-workshop` repository. This application adopts
approved builds through local package archives.

## Run locally

Use Node 24 and pnpm 10.15.1, matching the workshop.

```sh
nvm use
pnpm install
pnpm dev
```

Open http://localhost:5174. This port keeps the consumer separate from other
local development servers.

- `/`: overview and navigation.
- `/components`: the approved Button, with variant, size, disabled, and action controls.

## Check and build

```sh
pnpm typecheck
pnpm build
PORT=4174 pnpm start
```

`pnpm typecheck` generates route types before checking TypeScript. `pnpm build`
runs the type check and builds both client and server code.

The production preview above runs at http://localhost:4174.

## Framework and hosting

[Live app](https://react-router-poc-two.vercel.app) ·
[Vercel project](https://vercel.com/atanas-atanasovs-projects-c9bca4be/react-router-poc)

The app uses React Router Framework mode with server rendering enabled. The
Vercel preset is configured in `react-router.config.ts` and enabled when
`VERCEL=1`. Local builds use the standard Node server output so `pnpm start`
works.

`vercel.json` selects the React Router framework and runs `pnpm build`. The
Vercel project uses Node 24, exposes system environment variables, and sets
`ENABLE_EXPERIMENTAL_COREPACK=1` to use the pinned pnpm version.

The project connects to this GitHub repository. Pushes to `main` deploy the
production app; other branches receive preview deployments. Approved package
archives are committed under `vendor/` so Git-based Vercel builds can install
them without access to a sibling checkout.

To check the Vercel build locally, run `VERCEL=1 pnpm build`. Vercel provides
this variable when system environment variables are enabled for the project.

React Router is pinned to `7.18.4` because the current Vercel adapter (`1.3.7`)
declares React Router 7 peer dependencies. React `19.3.1` matches the workshop.

## Package handoff

The current approved library, `@poc/ui@0.1.1`, is installed from
`vendor/poc-ui-0.1.1.tgz`. [The archive receipt](vendor/README.md) records the
workshop source commit, approval, and checksum. Installation uses pnpm:

```sh
pnpm add ./vendor/poc-ui-0.1.1.tgz
```

The components route imports `Button` and its types from `@poc/ui`. The root
imports `@poc/ui/styles.css` once. Button actions and demo state belong to this
application; the Button implementation stays in the workshop.

The application shell uses system fonts. The Button stylesheet includes Inter
Bold, and its font notice is served from `public/licenses/Inter-OFL.txt`.

A compatible update changes the archive, its dependency reference and
`pnpm-lock.yaml`, preserving the existing component usage.

## Where things live

- `app/root.tsx`: the HTML document, shared layout, navigation and error boundary.
- `app/routes.ts`: the route definitions.
- `app/routes/`: route components and page metadata.
- `app/app.css`: the application shell styles.
- `react-router.config.ts`: server rendering and the Vercel preset.

## Official documentation

- [React Router Framework mode](https://reactrouter.com/7.18.4/start/framework/installation)
- [Route configuration](https://reactrouter.com/7.18.4/start/framework/routing)
- [React Router on Vercel](https://vercel.com/docs/frameworks/frontend/react-router)
- [Vercel system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables#vercel)
- [pnpm local package installation](https://pnpm.io/10.x/cli/add)
- [Vercel package managers and Corepack](https://vercel.com/docs/package-managers)
- [Vercel deployment environments](https://vercel.com/docs/deployments/environments)
