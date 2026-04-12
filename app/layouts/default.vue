<script setup lang="ts">
import { AnimatePresence, Motion } from "motion-v";

const route = useRoute();
</script>

<template>
  <div>
    <ClientOnly>
      <FEHelpers />
    </ClientOnly>
    <AppNavbar />
    <main class="py-8">
      <AnimatePresence mode="wait">
        <Motion
          :key="route.path"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: -20 }"
          :transition="{ duration: 0.3 }"
        >
          <slot />
        </Motion>
      </AnimatePresence>
    </main>
    <AppFooter />
  </div>
</template>
