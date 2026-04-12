# Nuxt Boilerplate

A minimal [Nuxt 4](https://nuxt.com) boilerplate with a responsive grid system,
dev overlays, and opinionated tooling. Uses `pnpm`.

## Getting Started

Install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see
the result. Edit `app/pages/index.vue` and the page auto-updates.

## What's inside

- **Nuxt 4** (Vue 3.5+) with strict TypeScript.
- **[msccss](https://www.npmjs.com/package/msccss)** — utility-first CSS
  (`flex`, `mt-6`, `fs-2xl`, ...), responsive breakpoints (`sm-`, `md-`, `lg-`).
- **[yg-vanilla-js-helpers](https://www.npmjs.com/package/yg-vanilla-js-helpers)** —
  dev overlays (grid + screen stats).
- **[motion-v](https://motion.dev/docs/vue-quick-start)** — page transitions
  (fade + slide, matching the sibling Next.js boilerplate).
- **Nuxt modules**: `@nuxt/eslint`, `@nuxt/image`, `@nuxt/icon`, `@nuxt/fonts`,
  `@nuxtjs/seo`.
- **Tooling**: ESLint 9 (flat config) + Prettier + Husky pre-commit +
  `lint-staged` + `npm-check-updates`.

## Dev helpers

The grid overlay and screen stats are initialised by `FEHelpers.vue` in the
default layout:

- `alt+g` (`option+g` on macOS) — toggle the grid overlay.
- `alt+s` (`option+s` on macOS) — toggle the screen info stats.

To hide them in production, uncomment the `env === "prod"` guard in
`app/components/FEHelpers.vue`.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm generate` | Full static build (SSG) |
| `pnpm start` | Preview the build locally |
| `pnpm typecheck` | Type-check via `vue-tsc` |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm format` / `pnpm format:check` | Prettier |

## Environment variables

Three example env files ship with the repo:

- `.env.local` → `NUXT_PUBLIC_ENV=dev`
- `.env.prod`  → `NUXT_PUBLIC_ENV=prod`
- `.env.test`  → `NUXT_PUBLIC_ENV=test`

Accessed at runtime via `useRuntimeConfig().public.env`.

## Dependency management

This project includes scripts to safely check and update dependencies:

```bash
pnpm deps:check           # list outdated packages
pnpm deps:update          # interactive picker
pnpm deps:update:minor    # auto-bump minor + patch
pnpm deps:update:patch    # auto-bump patch only (safest)
```

See [DEPENDENCY_MANAGEMENT.md](./DEPENDENCY_MANAGEMENT.md) for the full guide.

## Learn more

- [Nuxt Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org)
- [Motion for Vue](https://motion.dev/docs/vue-quick-start)
