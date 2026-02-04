import { describe, it, expect, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { within } from '@testing-library/vue'
import BookmarkSearchBar from './BookmarkSearchBar.vue'

const mockSetPerPage = vi.fn()
const mockSetCardSize = vi.fn()

mockNuxtImport('usePerPage', () => {
  return () => ({
    perPage: ref(12),
    setPerPage: mockSetPerPage
  })
})

mockNuxtImport('useCardSize', () => {
  return () => ({
    cardSize: ref('large'),
    setCardSize: mockSetCardSize,
    gridClass: ref('grid gap-4 sm:grid-cols-2 lg:grid-cols-3')
  })
})

describe('BookmarkSearchBar', () => {
  const defaultProps = {
    'modelValue': '',
    'onUpdate:modelValue': vi.fn(),
    'isSearching': false,
    'searchResultText': '',
    'sort': { field: 'created_at' as const, order: 'desc' as const }
  }

  it('検索入力が表示される', async () => {
    const wrapper = await mountSuspended(BookmarkSearchBar, {
      props: defaultProps
    })

    const queries = within(wrapper.element as HTMLElement)
    const input = queries.getByRole('textbox')
    expect(input).toBeDefined()
    expect(input.getAttribute('placeholder')).toContain('検索')
  })

  it('検索入力のv-model双方向バインド', async () => {
    const wrapper = await mountSuspended(BookmarkSearchBar, {
      props: defaultProps
    })

    // @vue/test-utilsのsetValueを使うためwrapperからfind
    await wrapper.find('input').setValue('テスト検索')

    const updateEvents = wrapper.emitted('update:modelValue')
    expect(updateEvents).toBeTruthy()
  })

  it('検索結果テキスト表示', async () => {
    const wrapper = await mountSuspended(BookmarkSearchBar, {
      props: {
        ...defaultProps,
        searchResultText: '5件の結果'
      }
    })

    expect(wrapper.text()).toContain('5件の結果')
  })

  it('検索中はスピナーが表示される', async () => {
    const wrapper = await mountSuspended(BookmarkSearchBar, {
      props: {
        ...defaultProps,
        isSearching: true,
        searchResultText: '5件の結果'
      }
    })

    // isSearching=trueの場合、arrow-pathアイコン（スピナー）が表示される
    expect(wrapper.html()).toContain('arrow-path')
  })

  it('非検索時は虫眼鏡アイコン', async () => {
    const wrapper = await mountSuspended(BookmarkSearchBar, {
      props: {
        ...defaultProps,
        isSearching: false
      }
    })

    expect(wrapper.html()).toContain('magnifying-glass')
  })

  it('ソートセレクトがcomboboxとして描画される', async () => {
    const wrapper = await mountSuspended(BookmarkSearchBar, {
      props: defaultProps
    })

    const queries = within(wrapper.element as HTMLElement)
    const comboboxes = queries.getAllByRole('combobox')
    expect(comboboxes.length).toBeGreaterThanOrEqual(1)

    // 初期値が「新しい順」
    const sortCombobox = comboboxes[0]!
    expect(sortCombobox.textContent).toContain('新しい順')
  })

  it('サイズスイッチャーのボタンが3つ表示される', async () => {
    const wrapper = await mountSuspended(BookmarkSearchBar, {
      props: defaultProps
    })

    // サイズスイッチャー: large(squares-2x2), medium(queue-list), small(list-bullet)
    expect(wrapper.html()).toContain('squares-2x2')
    expect(wrapper.html()).toContain('queue-list')
    expect(wrapper.html()).toContain('list-bullet')
  })
})
