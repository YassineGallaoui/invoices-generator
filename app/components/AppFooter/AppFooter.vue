<template>
  <footer :class="[$style.footer, 'mt-6 py-4 pb-6']">
    <div class="container pt-4">
      <div class="row">
        <div class="section flex column col-4 md-col-4 lg-col-6 mb-4">
          <span class="text-bold">Nuxt Boilerplate</span>
          <span :class="$style.smallText">
            (6 columns on desktop, 4 on tablet and mobile)
          </span>
          <span>motto</span>
        </div>
        <div class="section flex column col-2 md-col-2 lg-col-3 mb-4">
          <span class="text-bold">SECTION 1</span>
          <span :class="$style.smallText">
            (3 columns on desktop, 2 on tablet and mobile)
          </span>
          <ul class="pl-0">
            <li><NuxtLink to="/">random 1</NuxtLink></li>
            <li><NuxtLink to="/">random 2</NuxtLink></li>
            <li><NuxtLink to="/">random 3</NuxtLink></li>
          </ul>
        </div>
        <div class="section flex column col-2 md-col-2 lg-col-3 mb-4">
          <span class="text-bold">SECTION 2</span>
          <span :class="$style.smallText">
            (3 columns on desktop, 2 on tablet and mobile)
          </span>
          <ul class="pl-0">
            <li><NuxtLink to="/">random 4</NuxtLink></li>
            <li><NuxtLink to="/">random 5</NuxtLink></li>
            <li><NuxtLink to="/">random 6</NuxtLink></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<style module lang="scss">
.footer {
  position: relative;
  z-index: 0;
  border-top: solid 1px
    color-mix(in srgb, var(--foreground-color) 15%, transparent);

  ul {
    margin-top: 1rem;
    list-style: none;
  }
}

.smallText {
  font-size: 0.8rem;
  opacity: 0.6;
}
</style>
