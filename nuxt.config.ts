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

  imports: {
    dirs: [
      'composables/bookmark',
      'composables/auth',
      'composables/tag',
      'composables/feed',
      'composables/ui',
      'composables/ai'
    ]
  },

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
          crawlLinks: true,
          ignore: ['/dashboard']
        },
    routeRules: {
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'X-XSS-Protection': '0',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      },
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
