import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

if (existsSync('.env')) {
  process.loadEnvFile('.env')
}

process.env.NUXT_TEST = '1'

const isCI = !!process.env.CI

export default defineConfig<ConfigOptions>({
  testDir: './e2e',
  workers: 1,
  retries: isCI ? 2 : 0,
  reporter: isCI ? 'github' : 'list',

  timeout: 60_000,

  use: {
    nuxt: {
      rootDir: process.cwd(),
      setupTimeout: 120_000
    },
    locale: 'ja-JP',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'setup',
      testMatch: 'auth.setup.ts'
    },
    {
      name: 'e2e',
      testMatch: '*.spec.ts',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json'
      }
    }
  ]
})
