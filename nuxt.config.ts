// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/content"],
  // Static site on GitHub Pages: commands query content at runtime, so ship the content DB to the browser.
  ssr: false,
  content: { experimental: { clientDB: true } },
})
