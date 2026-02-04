import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
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
