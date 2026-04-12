---
description: Scaffold a new Nuxt page with accessibility-aware defaults (one h1, useSeoMeta, motion-respecting). Usage: /new-page kebab-name
argument-hint: kebab-name
---

Scaffold a new page at `app/pages/$ARGUMENTS.vue`.

Rules:

- Name must be **kebab-case**. Convert PascalCase/camelCase if given.
- Refuse if a file already exists at that path (tell the user).
- Use the template below. It ships with:
  - `useSeoMeta` for title + description (leave placeholder text the user
    must fill in — do NOT invent marketing copy).
  - One `<h1>` as the first heading.
  - The repo's container + grid classes.
- After writing, run `pnpm lint`.
- Remind the user the route is now at `/$ARGUMENTS`.

Template:

```vue
<script setup lang="ts">
useSeoMeta({
  title: "TODO: page title",
  description: "TODO: one-sentence description",
});
</script>

<template>
  <section class="relative container col-12 mt-6">
    <h1 class="col-12">TODO: page heading</h1>
    <!-- Compose with msccss grid utilities. Keep it semantic: <section>,
         <article>, <aside>, and meaningful headings. -->
  </section>
</template>
```

Report the route path and remind: "This page is wrapped by the default
layout's `motion-v` transition automatically."
