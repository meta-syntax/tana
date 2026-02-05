import { expect, test } from '@nuxt/test-utils/playwright'

const TAG_NAME = `E2Eタグ_${Date.now()}`
const TAG_NAME_EDITED = `${TAG_NAME}_編集済`

test.describe('タグCRUD', () => {
  test('追加 → 編集 → 削除', async ({ page, goto }) => {
    await goto('/dashboard', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/dashboard')

    // タグ管理モーダルを開く
    await page.getByRole('button', { name: 'タグ管理' }).click()
    await expect(page.getByText('タグの追加・編集・削除ができます')).toBeVisible()

    const modal = page.getByRole('dialog', { name: 'タグ管理' })

    // --- 追加 ---
    await modal.getByPlaceholder('新しいタグ名...').fill(TAG_NAME)
    await modal.getByRole('button', { name: '追加' }).click()

    // 追加されたタグがモーダル内に表示される
    await expect(modal.getByText(TAG_NAME, { exact: true })).toBeVisible()

    // --- 編集 ---
    await modal.getByRole('button', { name: `${TAG_NAME}を編集` }).click()

    // 編集モードのinputが表示されるのを待つ
    const editInput = modal.getByRole('textbox').nth(1)
    await expect(editInput).toBeVisible()
    await editInput.clear()
    await editInput.fill(TAG_NAME_EDITED)
    await modal.getByRole('button', { name: '保存' }).click()

    // 編集後の名前が表示される
    await expect(modal.getByText(TAG_NAME_EDITED, { exact: true })).toBeVisible()

    // --- 削除 ---
    await modal.getByRole('button', { name: `${TAG_NAME_EDITED}を削除` }).click()

    // 削除確認モーダルで「削除する」をクリック
    await page.getByRole('button', { name: '削除する' }).click()

    // トースト確認
    await expect(page.getByText('タグを削除しました', { exact: true })).toBeVisible()

    // タグがモーダル内の一覧から消えている
    await expect(modal.getByText(TAG_NAME_EDITED, { exact: true })).not.toBeVisible()
  })
})
