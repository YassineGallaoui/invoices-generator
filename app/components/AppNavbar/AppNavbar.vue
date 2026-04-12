<script setup lang="ts">
import AppNavbarLink from "./AppNavbarLink.vue";
</script>

<template>
  <nav :class="$style.navContainer">
    <div class="container py-1">
      <div class="row">
        <div class="col-1 flex justify-start align-center">
          <NuxtLink to="/" class="fs-2xl sm-fs-2xl lg-fs-md">Home</NuxtLink>
        </div>
        <AppNavbarLink />
      </div>
    </div>
  </nav>
</template>

<style module lang="scss">
.navContainer {
  position: fixed;
  background-color: color-mix(
    in srgb,
    var(--background-color) 92%,
    transparent
  );
  border-bottom: solid 1px
    color-mix(in srgb, var(--foreground-color) 8%, transparent);
  width: 100dvw;
  z-index: 10;

  a {
    text-decoration: none;
  }
}
</style>
