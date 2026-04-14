<script setup lang="ts">
import AppSidebar from "~/components/AppSidebar/AppSidebar.vue";
</script>

<template>
  <div style="display: flex; height: 100dvh; overflow: hidden">
    <ClientOnly>
      <FEHelpers />
    </ClientOnly>
    <AppSidebar />
    <!-- Main content pushed right by sidebar width (64px) -->
    <div style="flex: 1; overflow: hidden; padding-left: 64px">
      <slot />
    </div>
  </div>
</template>
