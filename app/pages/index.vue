<template>
  <div class="relative container col-12 mt-6">
    <div class="row">
      <h1 class="col-12">Welcome to the Homepage</h1>
      <div class="col-12 sub-grid">
        <div class="container-box bg-green col-3 md-col-2 lg-col-4">
          col-3 md-col-2 lg-col-4
        </div>
        <div class="container-box bg-yellow col-1 md-col-6 lg-col-3">
          col-1 md-col-3 lg-col-3
        </div>
        <div class="container-box bg-blue col-4 md-col-8 lg-col-5">
          col-4 md-col-6 lg-col-5
        </div>
      </div>

      <div class="col-12 sub-grid">
        <div
          class="container-box sub-grid bg-green col-4 md-col-6 lg-col-8 lg-offset-1"
        >
          <span class="container-box bg-green col-4 md-col-6 lg-col-8">
            col-4 md-col-6 lg-col-8 lg-offset-1
          </span>
          <span class="container-box bg-yellow col-4 md-col-2 lg-col-4">
            col-4 md-col-2 lg-col-4
          </span>
          <span
            class="container-box bg-blue col-3 md-col-4 lg-col-5 lg-offset-3"
          >
            col-3 md-col-4 lg-col-5 lg-offset-3
          </span>
        </div>
        <div
          class="container-box bg-blue col-2 md-col-7 lg-col-5 offset-2 md-offset-1 lg-offset-5"
        >
          col-2 md-col-7 lg-col-5 offset-2 md-offset-1 lg-offset-5
        </div>
      </div>

      <div class="col-8 lg-col-6">
        <div class="flex jc-between ai-center">
          <h2>Content</h2>
          <span class="fs-xs">col-8 lg-col-6</span>
        </div>
        <span>This boilerplate has:</span>
        <ul style="margin: 0 0 0 1.5rem">
          <li>Nuxt 4 (Vue 3)</li>
          <li>
            msccss library (styling classes utility: flex, margins, paddings,
            text, etc. Only intensively used features)
          </li>
          <li>yg-vanilla-js-helpers library (grid system + screen info)</li>
          <li>page transitions powered by motion-v</li>
          <li>@nuxt/image, @nuxt/icon, @nuxt/fonts, @nuxtjs/seo</li>
        </ul>
      </div>

      <div class="col-8 lg-col-4 lg-offset-8">
        <div class="flex jc-between ai-center">
          <h2>Test</h2>
          <span class="fs-xs">col-8 lg-col-4 lg-offset-8</span>
        </div>
        <ul style="margin: 0 0 0 1.5rem">
          <li>Press alt+g (or option+g) to toggle the grid</li>
          <li>Press alt+s (or option+s) to toggle the screen info</li>
          <li>Resize the browser window to see the columns change</li>
        </ul>
      </div>
    </div>
  </div>
</template>
