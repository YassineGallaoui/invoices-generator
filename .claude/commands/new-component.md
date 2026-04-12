---
description: Scaffold a new Vue component folder following repo conventions (PascalCase folder + .vue with inline style module). Usage: /new-component ComponentName
argument-hint: ComponentName
---

Scaffold a new Vue component named `$ARGUMENTS` at
`app/components/$ARGUMENTS/$ARGUMENTS.vue`.

Rules:

- Name must be **PascalCase**. Convert kebab-case / camelCase if given. If the
  name does not already carry a role prefix (`App`, `Button`, `Card`, `Form`,
  `Icon`, `Section`, `Layout`), ask the user whether to add one before
  proceeding.
- Refuse if `app/components/$ARGUMENTS/` already exists.
- Create the folder and SFC using the template below. Do NOT create a
  separate `.module.scss` file — inline `<style module lang="scss">`. Only
  extract a sidecar stylesheet when the user explicitly asks.
- After writing, run `pnpm lint`.
- Remind the user that Nuxt auto-registers components under
  `app/components/` — no `import` needed in the consumer.

Template:

```vue
<script setup lang="ts">
// Props, emits, slots, composables go here. Rely on Nuxt auto-imports for
// ref/computed/watch/useRoute/useRouter/useRuntimeConfig/etc.
</script>

<template>
  <div :class="$style.root">
    <!-- Prefer msccss utility classes in the markup; reach for SCSS only
         when utilities can't express the rule. -->
  </div>
</template>

<style module lang="scss">
.root {
  /* Component-scoped styles. Use CSS variables
     (--foreground-color, --background-color, --spacing-unit) so the
     component respects light/dark theming provided by msccss. */
}
</style>
```

Report the path created and a one-line usage hint
(`<$ARGUMENTS /> in any template — auto-imported`).
