import { defineVitestConfig } from '@nuxt/test-utils/config'
import { resolve } from 'node:path'

export default defineVitestConfig({
  resolve: {
    alias: {
      '#supabase/server': resolve(__dirname, 'node_modules/@nuxtjs/supabase/dist/runtime/server/services')
    }
  },
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom'
      }
    },
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.ts', 'server/**/*.test.ts']
  }
})
