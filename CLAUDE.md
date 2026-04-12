# CLAUDE.md

This file is auto-loaded by Claude Code. It's the single source of truth for how
to work in this repo. Keep answers and implementations consistent with it.

## What this project is

A Nuxt 4 boilerplate with a responsive grid system, dev overlays, and
opinionated tooling. Intentionally **feature-light** — no auth/DB/testing/i18n
shipped by default. Mirrors the sibling Next.js boilerplate under
`../nextjs-boilerplates/nextjs-boilerplate/`.

## Stack

- **Nuxt 4** (Vue 3.5+) with strict TypeScript.
- **Package manager**: `pnpm` (never npm / yarn / bun here).
- **Styling**: SCSS + [`msccss`](https://www.npmjs.com/package/msccss) utility
  classes + Vue `<style module>` / `<style scoped>`. **No Tailwind, no
  CSS-in-JS, no UI kits.**
- **Animation**: [`motion-v`](https://motion.dev) (Motion for Vue). **Do not
  add Framer Motion / GSAP / animejs** unless explicitly asked.
- **Dev overlays**: `yg-vanilla-js-helpers` (grid + stats, toggles alt+g / alt+s).
- **Nuxt modules**: `@nuxt/eslint`, `@nuxt/image`, `@nuxt/icon`, `@nuxt/fonts`,
  `@nuxtjs/seo`.
- **Tooling**: ESLint 9 (flat) + Prettier + Husky + `lint-staged` + `ncu`.

## Commands (always use pnpm)

| Task | Command |
| --- | --- |
| Dev server | `pnpm dev` |
| Production build | `pnpm build` |
| Static generate | `pnpm generate` |
| Preview build | `pnpm start` |
| Lint | `pnpm lint` / `pnpm lint:fix` |
| Format | `pnpm format` / `pnpm format:check` |
| Dep updates | `pnpm deps:check` / `pnpm deps:update[:minor|:patch]` |

**Before declaring a task complete**, always run `pnpm lint` and `pnpm build`
(or the `/verify` slash command). The pre-commit hook runs the same flow.

## Project layout

```
app/
  app.vue                  # NuxtLayout + NuxtPage
  layouts/default.vue      # Navbar + motion-v transition + Footer
  pages/                   # kebab-case filenames
  components/              # PascalCase folders + files, nested by feature
  composables/             # auto-imported useX()
  utils/                   # auto-imported pure helpers
  assets/styles/main.scss  # global styles; msccss provides --spacing-unit
                           # --background-color --foreground-color
public/                    # static assets
server/                    # (add server routes here when needed)
nuxt.config.ts             # runtimeConfig.public.env = NUXT_PUBLIC_ENV
```

## Conventions

### Components / files

- **PascalCase** SFC filenames and folders: `AppNavbar.vue`, `CardAnalyticsMain.vue`.
- Prefix components by role: `App*` for shell, `Button*`, `Card*`, `Form*`, `Icon*`.
- **kebab-case** for pages and layouts (Nuxt convention): `user-profile.vue`.
- Subcomponents live beside their parent: `components/AppNavbar/AppNavbar.vue`
  + `AppNavbarLink.vue`.

### Vue authoring

- Always `<script setup lang="ts">` + Composition API. No Options API, no classes.
- Order of SFC blocks: `<script>` → `<template>` → `<style>`.
- **Nuxt auto-imports** `ref`, `computed`, `watch`, `useRoute`, `useRouter`,
  `useRuntimeConfig`, `useFetch`, `useAsyncData`, `useHead`, `useSeoMeta`,
  `definePageMeta`, etc. **Do not** manually import from `vue` / `#app` /
  `vue-router` when they're auto-imported.
- Components in `app/components/` are auto-registered — use them directly in
  templates without importing.

### SSR-safety (hard rule)

- Never touch `window`, `document`, `localStorage`, or `navigator` at module
  load time. Use `onMounted` or `<ClientOnly>`.
- For packages that reach for the DOM at import time (e.g.
  `yg-vanilla-js-helpers`), use dynamic `await import()` inside `onMounted`.
  See [FEHelpers.vue](app/components/FEHelpers.vue) for the pattern.

### Styling

- Prefer `msccss` utilities (`flex`, `jc-between`, `mt-6`, `fs-2xl`,
  `col-*`, `sm-col-*`, `md-col-*`, `lg-col-*`, `offset-*`, `sub-grid`).
- Reach for `<style module>` for component-scoped CSS; `<style scoped>` is
  fine for simple cases. Only add global selectors when unavoidable.
- Use `msccss`'s breakpoint variables via `@use "msccss/scss/utils/variables"`
  rather than hardcoding px values.
- Mobile-first: base styles target mobile, `sm-`/`md-`/`lg-` prefixes layer up.

### Routing / data

- `useFetch` and `useAsyncData` over raw `fetch()` — they handle SSR + hydration.
- Server routes live in `server/api/` and `server/routes/`.
- Never leak `runtimeConfig` private keys to `public` — anything under
  `runtimeConfig.public` is shipped to the client bundle.

## Standards we don't compromise on

When implementing anything user-facing, all five apply simultaneously. If
you're unsure, call the matching `.claude/agents/*-auditor` agent before
finishing.

### 🔒 Security

- No secrets in code, `.env.example`, or logs. Secrets belong in `.env` and
  are **never** committed (see `.gitignore`).
- Sanitize every string before using `v-html`. Default to `{{ }}`
  interpolation. `v-html` with untrusted input = instant review.
- Validate and narrow all user/query input at the server boundary (zod or a
  hand-rolled schema) — do not trust `useRoute().query`.
- Configure a restrictive Content-Security-Policy when adding third-party
  scripts. Avoid inline scripts/styles.
- Keep `runtimeConfig.public.*` to truly public values.
- `pnpm audit` on new dependency additions; flag CVEs before landing.

### ♿ Accessibility (WCAG 2.2 AA)

- Use semantic HTML first (`<button>`, `<nav>`, `<main>`, `<h1-6>`, `<label>`).
  ARIA is the escape hatch, not the default.
- Every interactive element is reachable and operable by keyboard, with a
  visible focus state.
- Images need `alt` (empty string for decorative). Icons from `@nuxt/icon`
  need `aria-label` or `aria-hidden="true"`.
- Form controls have associated `<label>` or `aria-label`.
- Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for UI components / large text.
  Do not convey meaning with color alone.
- Respect `prefers-reduced-motion` — see the Motion section.
- Landmark structure on every page: one `<h1>`, one `<main>`, skip-to-content
  link on layouts with complex nav.

### ⚡ Performance (Core Web Vitals)

- Target LCP < 2.5s, CLS < 0.1, INP < 200ms.
- Server-render by default. Reach for `<ClientOnly>` only for browser-API code.
- Images: `<NuxtImg>` / `<NuxtPicture>` with `width`, `height`, `sizes`,
  `loading="lazy"` (except above-the-fold), and modern formats (WebP/AVIF).
- Fonts: `@nuxt/fonts` with `display: swap` and preload of critical weights;
  never ship unused variants.
- Avoid layout shift: reserve space for images, ads, iframes, dynamic components.
- Code-split heavy or non-critical components via `defineAsyncComponent` or
  route-level splitting.
- Don't import whole libraries when a single helper will do.
- Re-check bundle impact with `pnpm build` — the summary shows per-chunk sizes.

### 🎨 Peak design (not cookie-cutter)

- Typography is a system, not an afterthought: consistent scale (use `fs-*`
  utilities), generous line-height (1.4–1.7 for body), confident display
  weights.
- Rhythm: consistent spacing scale (`mt-*`, `py-*`); compose with the
  `msccss` grid. Avoid one-off pixel values.
- Density: **whitespace is a design element** — don't fill every cell.
- Contrast of form: mix weights, scales, alignments. One or two hero moments
  per view; everything else supports them.
- Use `color-mix()` and CSS custom properties to build tonal palettes from
  `--background-color` / `--foreground-color` rather than hardcoding hex.
- Motion reinforces hierarchy (see below), it doesn't decorate.

When asked for a "production-ready" design, deliver craft, not a template
layout. Ask for brand direction if the request is generic.

### ✨ Motion

- Library: **`motion-v` only**. Do not introduce competing animation libs.
- **Every animation must respect `prefers-reduced-motion: reduce`.** Guard
  transitions with a `useReducedMotion()`-style composable or the
  `motion-v` `reducedMotion` option, or wrap CSS animations in
  `@media (prefers-reduced-motion: no-preference)`.
- Purpose over polish: transitions should explain state changes (enter, exit,
  focus) — not loop infinitely, not distract from content.
- Default durations: 150–300 ms for UI feedback, 300–500 ms for page
  transitions, 600+ ms only for hero-scale moments with easing.
- Easing: prefer `[0.22, 1, 0.36, 1]` (easeOutExpo-ish) for enter,
  `[0.64, 0, 0.78, 0]` for exit. No `linear` on perceived-quality moments.
- Never animate `top`/`left`/`width`/`height` where `transform` / `opacity`
  will do.

## What to never do here

- ❌ Add Tailwind, styled-components, Chakra, MUI, shadcn, bootstrap.
- ❌ Add React, Next helpers, or `clsx`. We are in Vue.
- ❌ `npm install` / `yarn add`. Use pnpm.
- ❌ Write `useState`/`useEffect` imports from `vue` — they don't exist there.
- ❌ Suppress lint / type errors with `eslint-disable` or `@ts-ignore` without
  a 1-line justification comment.
- ❌ Invent new top-level directories. Stick to the layout above.
- ❌ Touch `.husky/pre-commit` to add `--no-verify` workarounds.

## Available slash commands

- `/verify` — run `pnpm lint` and `pnpm build`.
- `/new-component <Name>` — scaffold a Vue component folder.
- `/new-page <kebab-name>` — scaffold a page.
- `/audit [file-or-dir]` — run the five auditor agents in parallel.

## Available subagents (in `.claude/agents/`)

- `accessibility-auditor` — WCAG 2.2 AA checks.
- `performance-auditor` — Core Web Vitals / bundle / SSR pitfalls.
- `design-critic` — typography, rhythm, density, polish.
- `security-auditor` — XSS, input validation, env leakage, deps.
- `motion-reviewer` — motion-v usage + reduced-motion compliance.

Invoke them with the Agent tool. Use them **proactively** after any
user-facing change — they're cheap and catch regressions early.
