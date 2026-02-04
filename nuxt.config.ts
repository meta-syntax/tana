// https://nuxt.com/docs/api/configuration/nuxt-config
const isTest = process.env.NUXT_TEST === '1'

export default defineNuxtConfig({

  modules: ['@nuxt/eslint', '@nuxtjs/supabase', '@nuxt/ui', '@vueuse/nuxt'],

  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],

  devtools: { enabled: true },

  app: {
    pageTransition: { name: 'page', mode: 'out-in', duration: 50 },
    layoutTransition: { name: 'layout', mode: 'out-in', duration: 50 },
    head: {
      htmlAttrs: { lang: 'ja' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      siteUrl: ''
    }
  },
  compatibilityDate: '2025-07-15',

  nitro: {
    compressPublicAssets: true,
    prerender: isTest
      ? {}
      : {
          routes: ['/'],
          crawlLinks: true
        },
    routeRules: {
      '/_nuxt/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  supabase: {
    redirect: false,
    types: '~/types/database.types'
  }
})
