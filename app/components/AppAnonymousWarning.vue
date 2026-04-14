<script setup lang="ts">
const { loggedIn } = useUserSession();
</script>

<template>
  <div v-if="!loggedIn" :class="$style.banner" role="status" aria-live="polite">
    <Icon name="ph:warning" aria-hidden="true" :class="$style.icon" />
    <span>
      Your invoices are saved in <strong>this browser only</strong>. Clearing
      browser data will permanently erase them.
      <NuxtLink to="/register" :class="$style.link">Create an account</NuxtLink>
      to sync across devices.
    </span>
  </div>
</template>

<style module lang="scss">
.banner {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background-color: color-mix(in srgb, #ffe44d 25%, transparent);
  border: 1px solid color-mix(in srgb, #ffe44d 60%, transparent);
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  font-size: 0.8rem;
  line-height: 1.4;
  color: color-mix(in srgb, var(--foreground-color) 90%, transparent);
}

.icon {
  flex-shrink: 0;
  margin-top: 0.05em;
  font-size: 1rem;
}

.link {
  color: inherit;
  font-weight: 700;
  text-underline-offset: 2px;
}
</style>
