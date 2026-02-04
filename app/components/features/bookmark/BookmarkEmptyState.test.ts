import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { within } from '@testing-library/vue'
import BookmarkEmptyState from './BookmarkEmptyState.vue'

describe('BookmarkEmptyState', () => {
  describe('type="search"', () => {
    it('「検索結果がありません」テキストが表示される', async () => {
      const wrapper = await mountSuspended(BookmarkEmptyState, {
        props: { type: 'search', searchQuery: 'テスト検索' }
      })

      expect(wrapper.text()).toContain('検索結果がありません')
    })

    it('検索クエリが表示される', async () => {
      const wrapper = await mountSuspended(BookmarkEmptyState, {
        props: { type: 'search', searchQuery: 'Vue.js' }
      })

      expect(wrapper.text()).toContain('Vue.js')
    })

    it('「検索をクリア」ボタン → clearSearchイベント', async () => {
      const wrapper = await mountSuspended(BookmarkEmptyState, {
        props: { type: 'search', searchQuery: 'テスト' }
      })

      const queries = within(wrapper.element as HTMLElement)
      const clearButton = queries.getByRole('button', { name: /検索をクリア/ })
      expect(clearButton).toBeDefined()

      clearButton.click()
      expect(wrapper.emitted('clearSearch')).toBeTruthy()
    })
  })

  describe('type="initial"', () => {
    it('HowToGuideの3ステップが表示される', async () => {
      const wrapper = await mountSuspended(BookmarkEmptyState, {
        props: { type: 'initial' }
      })

      expect(wrapper.text()).toContain('はじめかた')
      expect(wrapper.text()).toContain('URLを入力')
      expect(wrapper.text()).toContain('OGPを自動取得')
      expect(wrapper.text()).toContain('コレクションに保存')
    })

    it('「追加」ボタン → addイベント', async () => {
      const wrapper = await mountSuspended(BookmarkEmptyState, {
        props: { type: 'initial' }
      })

      const queries = within(wrapper.element as HTMLElement)
      const addButton = queries.getByRole('button', { name: /最初のブックマークを追加する/ })
      expect(addButton).toBeDefined()

      addButton.click()
      expect(wrapper.emitted('add')).toBeTruthy()
    })
  })
})
