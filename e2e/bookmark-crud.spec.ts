import { expect, test } from '@nuxt/test-utils/playwright'

const TEST_URL = 'https://playwright.dev'
const TEST_TITLE = `E2Eテスト用ブックマーク_${Date.now()}`

test.describe('ブックマークCRUD', () => {
  test('追加 → 一覧に表示 → 削除', async ({ page, goto }) => {
    await goto('/dashboard', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/dashboard')

    // ブックマーク追加
    await page.getByRole('button', { name: 'URLを追加' }).click()
    await page.getByLabel('URL').fill(TEST_URL)
    await page.getByLabel('タイトル').fill(TEST_TITLE)
    await page.getByRole('button', { name: '追加する' }).click()

    // トースト確認
    await expect(page.getByText('ブックマークを追加しました', { exact: true })).toBeVisible()

    // 一覧に表示されることを確認
    await expect(page.getByText(TEST_TITLE).first()).toBeVisible()

    // 削除: カード内のゴミ箱ボタン（error色のUButton）をクリック
    const card = page.locator('.group', { hasText: TEST_TITLE }).first()
    await card.hover()
    await card.locator('button[class*="error"], button:has([class*="trash"])').first().click()

    // 削除確認モーダルで「削除する」をクリック
    await page.getByRole('button', { name: '削除する' }).click()

    // トースト確認
    await expect(page.getByText('ブックマークを削除しました', { exact: true })).toBeVisible()
  })
})
