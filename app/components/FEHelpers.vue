<script setup lang="ts">
// const { public: publicCfg } = useRuntimeConfig();
// if (publicCfg.env === "prod") { /* skip helpers in prod */ }

onMounted(async () => {
  const { grid, stats } = await import("yg-vanilla-js-helpers");
  grid.init({
    show: true,
    columnsColor: "#ffffff11",
    columnsBorderColor: "#ffffff33",
    columnsBorderStyle: "solid",
    columnsBorderWidth: "1px",
  });
  stats.init();
});
</script>

<template>
  <!-- dev overlays are injected into <body> by yg-vanilla-js-helpers init() -->
  <div />
</template>
