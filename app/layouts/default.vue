<script setup lang="ts">
import { Motion } from "motion-v";
import AppSidebar from "~/components/AppSidebar/AppSidebar.vue";

const route = useRoute();

// Apply persisted CSS custom properties as soon as possible client-side
useInvoiceConfig();
</script>

<template>
  <div :style="{ display: 'flex', height: '100dvh', overflow: 'hidden' }">
    <ClientOnly>
      <FEHelpers />
    </ClientOnly>

    <AppSidebar />

    <!-- Content area shifted right by sidebar (64px) -->
    <main
      id="main-content"
      :style="{ flex: '1', overflow: 'auto', paddingLeft: '64px' }"
    >
      <a
        href="#main-content"
        :style="{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }"
        class="skip-link"
      >Skip to main content</a>

      <Motion
        :key="route.path"
        :initial="{ opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }"
      >
        <slot />
      </Motion>
    </main>
  </div>
</template>

<style>
@media (prefers-reduced-motion: reduce) {
  /* motion-v picks this up via its reducedMotion option when set globally */
}

.skip-link:focus {
  position: fixed !important;
  left: 70px !important;
  top: 0.5rem !important;
  width: auto !important;
  height: auto !important;
  overflow: visible !important;
  z-index: 999;
  background: #ffe44d;
  color: #1a1a1a;
  padding: 0.5rem 1rem;
  border-radius: 0 0 8px 8px;
  font-weight: 700;
  text-decoration: none;
}
</style>
