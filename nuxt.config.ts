export default defineNuxtConfig({
  compatibilityDate: "2026-04-12",
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },

  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/icon",
    "@nuxt/fonts",
    "@nuxtjs/seo",
  ],

  css: [
    "msccss/dist/main.min.css",
    "yg-vanilla-js-helpers/dist/styles/grid.min.css",
    "yg-vanilla-js-helpers/dist/styles/stats.min.css",
    "~/assets/styles/main.scss",
  ],

  runtimeConfig: {
    public: {
      env: process.env.NUXT_PUBLIC_ENV ?? "dev",
    },
  },

  app: {
    pageTransition: false,
    head: {
      htmlAttrs: { lang: "en" },
      title: "nuxt boilerplate",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Generic Nuxt 4 boilerplate, with grid system and custom routing",
        },
      ],
    },
  },

  site: {
    url: process.env.NUXT_SITE_URL || "https://example.com",
    name: "nuxt boilerplate",
    description:
      "Generic Nuxt 4 boilerplate, with grid system and custom routing",
    defaultLocale: "en",
  },

  ogImage: {
    // Disable runtime OG image generation to keep the boilerplate
    // build- and dev-time zero-config. Flip this off (and set
    // NUXT_OG_IMAGE_SECRET) when you want dynamic OG images.
    enabled: false,
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
});
