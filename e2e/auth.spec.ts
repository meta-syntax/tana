import { expect, test } from '@nuxt/test-utils/playwright'

test.describe('認証ガード', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('未認証で /dashboard にアクセスすると /login にリダイレクトされる', async ({ page, goto }) => {
    await goto('/dashboard', { waitUntil: 'hydration' })
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('認証フロー', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('ログイン → ダッシュボード到達 → ログアウト', async ({ page, goto }) => {
    const email = process.env.E2E_TEST_EMAIL!
    const password = process.env.E2E_TEST_PASSWORD!

    // ログイン
    await goto('/login', { waitUntil: 'hydration' })

    await page.getByPlaceholder('name@example.com').fill(email)
    await page.getByPlaceholder('••••••••').fill(password)
    await page.getByRole('button', { name: 'ログインして続ける' }).click()

    await page.waitForURL('/dashboard')
    await expect(page).toHaveURL('/dashboard')

    // ログアウト
    await page.getByRole('button', { name: 'ログアウト' }).click()
    await expect(page).toHaveURL(/\/login/)
  })
})
