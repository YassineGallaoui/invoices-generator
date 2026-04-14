export default defineNuxtConfig({
  compatibilityDate: "2026-04-12",
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },

  devServer: {
    port: 3001,
  },

  modules: [
    "nuxt-auth-utils",
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
    databaseUrl: process.env.DATABASE_URL ?? "",
    public: {
      env: process.env.NUXT_PUBLIC_ENV ?? "dev",
    },
  },

  app: {
    pageTransition: false,
    head: {
      htmlAttrs: { lang: "en" },
      title: "Invoice Generator",
      link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Create, preview, and download professional invoices as PDF.",
        },
      ],
    },
  },

  site: {
    url: process.env.NUXT_SITE_URL || "https://example.com",
    name: "Invoice Generator",
    description: "Create, preview, and download professional invoices as PDF.",
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
