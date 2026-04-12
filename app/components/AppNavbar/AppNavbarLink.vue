<script setup lang="ts">
const openMobile = ref(false);
const close = () => (openMobile.value = false);
</script>

<template>
  <div
    class="lg-sub-grid col-11 md-col-7 lg-col-11 sm-col-1 sm-offset-3"
  >
    <div
      class="mobileBtnContainer sm-col-1 sm-offset-1 flex-row jc-end flex-align-items-center md-d-none"
    >
      <button
        class="mobileBtn"
        :class="{ show: openMobile }"
        aria-label="toggle mobile menu"
        @click="openMobile = !openMobile"
      />
    </div>
    <div
      class="navLinks sm-position-absolute md-position-absolute lg-position-relative sub-grid col-11 md-col-7 lg-col-11"
      :class="{ show: openMobile }"
    >
      <ul class="sub-grid col-11 md-col-7 lg-col-11 container-sm align-center">
        <li class="flex ai-center ac-center">
          <NuxtLink
            to="/about"
            class="fs-6xl lg-fs-md sm-fs-2xl"
            @click="close"
          >
            About
          </NuxtLink>
        </li>
        <li
          class="offset-10 md-offset-6 lg-offset-10 flex jc-end flex ai-center ac-center"
        >
          <NuxtLink
            to="/login"
            aria-label="click to login or signup"
            class="fs-6xl lg-fs-md sm-fs-2xl"
            @click="close"
          >
            Login
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
@use "msccss/scss/utils/variables" as variables;

.mobileBtnContainer {
  display: none;

  @media (max-width: variables.$breakpoint-md) {
    position: relative;
    display: flex;
    z-index: 2;
  }
}

.mobileBtn {
  display: none;

  @media screen and (max-width: #{variables.$breakpoint-md - 1}) {
    position: relative;
    display: flex;
    width: 2rem;
    aspect-ratio: 1;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    z-index: 2;
    cursor: pointer;

    &:before,
    &:after {
      content: "";
      display: block;
      position: absolute;
      width: 2rem;
      height: 2px;
      background-color: var(--foreground-color);
      transition: transform 0.2s linear;
      transform: rotate(0) translateY(-250%);
    }

    &:after {
      transform: rotate(0) translate(20%, 250%) scaleX(0.6);
    }

    &.show {
      &:before {
        transform: rotate(45deg) translateY(0) scaleX(0.8);
      }

      &:after {
        transform: rotate(-45deg) translate(0%, 0) scaleX(0.8);
      }
    }
  }
}

.navLinks {
  a {
    text-decoration: none;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  @media screen and (max-width: #{variables.$breakpoint-md - 1}) {
    position: absolute;
    height: 100dvh;
    width: 100dvw;
    background-color: var(--background-color);
    top: 0;
    left: 0;
    transform: translateX(10dvw);
    opacity: 0;
    z-index: -2;
    pointer-events: none;
    height: 100dvh !important;
    transition:
      transform 0.1s linear,
      opacity 0.1s linear;

    ul {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    &.show {
      transform: translateX(0dvw);
      opacity: 1;
      z-index: 1;
      height: 100dvh;
      pointer-events: all;
      inset: 0;
      background-color: var(--background-color);

      a {
        pointer-events: all;
      }
    }
  }
}
</style>
