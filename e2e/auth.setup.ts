import { expect, test as setup } from '@nuxt/test-utils/playwright'

const authFile = 'e2e/.auth/user.json'

setup('ログインしてstorageStateを保存', async ({ page, goto }) => {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD

  if (!email || !password) {
    throw new Error('E2E_TEST_EMAIL と E2E_TEST_PASSWORD を環境変数に設定してください')
  }

  await goto('/login', { waitUntil: 'hydration' })

  await page.getByPlaceholder('name@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill(password)
  await page.getByRole('button', { name: 'ログインして続ける' }).click()

  await page.waitForURL('/dashboard')
  await expect(page).toHaveURL('/dashboard')

  await page.context().storageState({ path: authFile })
})
