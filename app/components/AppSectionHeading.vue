<script setup lang="ts">
defineProps<{ tag?: string }>();
</script>

<template>
  <component :is="tag ?? 'h2'" class="section-heading">
    <slot />
  </component>
</template>
