<script setup lang="ts">
defineProps<{
  to: string;
  icon: string;
  label: string;
}>();
</script>

<template>
  <NuxtLink
    :to="to"
    :class="$style.link"
    :active-class="$style.active"
    :aria-label="label"
  >
    <Icon :name="icon" aria-hidden="true" :class="$style.icon" />
    <span :class="$style.label">{{ label }}</span>
  </NuxtLink>
</template>

<style module lang="scss">
.link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  width: 52px;
  padding: 0.5rem 0.25rem;
  border-radius: 8px;
  text-decoration: none;
  color: color-mix(in srgb, var(--foreground-color) 55%, transparent);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: color-mix(in srgb, var(--foreground-color) 7%, transparent);
    color: var(--foreground-color);
  }

  &:focus-visible {
    outline: 2px solid var(--foreground-color);
    outline-offset: 2px;
    color: var(--foreground-color);
  }
}

.active {
  background-color: color-mix(in srgb, var(--foreground-color) 9%, transparent);
  color: var(--foreground-color);
}

.icon {
  font-size: 1.25rem;
}

.label {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1;
}
</style>
