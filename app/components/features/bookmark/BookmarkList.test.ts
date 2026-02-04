import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { within } from '@testing-library/vue'
import BookmarkList from './BookmarkList.vue'
import { createMockBookmarks, defaultStats, defaultSort, resetIdCounter } from './__tests__/helpers'

mockNuxtImport('useRelativeTime', () => {
  return () => ({
    relativeTime: ref('1時間前'),
    updateRelativeTime: vi.fn()
  })
})

mockNuxtImport('useCardSize', () => {
  return () => ({
    cardSize: ref('large'),
    setCardSize: vi.fn(),
    gridClass: ref('grid gap-4 sm:grid-cols-2 lg:grid-cols-3')
  })
})

mockNuxtImport('usePerPage', () => {
  return () => ({
    perPage: ref(12),
    setPerPage: vi.fn()
  })
})

describe('BookmarkList', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetIdCounter()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const defaultProps = {
    'bookmarks': createMockBookmarks(3),
    'loading': false,
    'totalCount': 3,
    'page': 1,
    'perPage': 12,
    'sort': defaultSort,
    'stats': defaultStats,
    'searchQuery': '',
    'onUpdate:searchQuery': vi.fn()
  }

  it('displayState: initial-loading のとき、ローディング表示', async () => {
    const wrapper = await mountSuspended(BookmarkList, {
      props: {
        ...defaultProps,
        bookmarks: [],
        loading: true,
        totalCount: 0
      }
    })

    const queries = within(wrapper.element as HTMLElement)
    expect(queries.queryByTestId('bookmark-loading')).not.toBeNull()
  })

  it('displayState: initial-empty のとき、初期空状態を表示', async () => {
    const wrapper = await mountSuspended(BookmarkList, {
      props: {
        ...defaultProps,
        bookmarks: [],
        loading: false,
        totalCount: 0,
        searchQuery: ''
      }
    })

    expect(wrapper.text()).toContain('はじめかた')
  })

  it('統計情報（total、thisWeek）の表示', async () => {
    const wrapper = await mountSuspended(BookmarkList, {
      props: defaultProps
    })

    expect(wrapper.text()).toContain('10件')
    expect(wrapper.text()).toContain('+3')
  })

  it('「URLを追加」ボタン → addイベント', async () => {
    const wrapper = await mountSuspended(BookmarkList, {
      props: defaultProps
    })

    const queries = within(wrapper.element as HTMLElement)
    const addButton = queries.getByRole('button', { name: /URLを追加/ })
    expect(addButton).toBeDefined()

    addButton.click()
    expect(wrapper.emitted('add')).toBeTruthy()
  })

  it('bookmarks配列の数だけBookmarkCardが描画される', async () => {
    const bookmarks = createMockBookmarks(3)

    const wrapper = await mountSuspended(BookmarkList, {
      props: {
        ...defaultProps,
        bookmarks
      }
    })

    vi.advanceTimersByTime(500)
    await wrapper.vm.$nextTick()

    const cards = wrapper.findAll('[data-testid="bookmark-card"]')
    expect(cards.length).toBeGreaterThanOrEqual(3)
  })

  it('ページネーション: totalPages > 1で表示', async () => {
    const wrapper = await mountSuspended(BookmarkList, {
      props: {
        ...defaultProps,
        totalCount: 30,
        perPage: 12
      }
    })

    vi.advanceTimersByTime(500)
    await wrapper.vm.$nextTick()

    const queries = within(wrapper.element as HTMLElement)
    expect(queries.queryByTestId('bookmark-pagination')).not.toBeNull()
  })

  it('ページネーション: totalPages <= 1で非表示', async () => {
    const wrapper = await mountSuspended(BookmarkList, {
      props: {
        ...defaultProps,
        totalCount: 3,
        perPage: 12
      }
    })

    vi.advanceTimersByTime(500)
    await wrapper.vm.$nextTick()

    const queries = within(wrapper.element as HTMLElement)
    expect(queries.queryByTestId('bookmark-pagination')).toBeNull()
  })

  it('空状態の「追加」ボタン動作', async () => {
    const wrapper = await mountSuspended(BookmarkList, {
      props: {
        ...defaultProps,
        bookmarks: [],
        loading: false,
        totalCount: 0,
        searchQuery: ''
      }
    })

    const queries = within(wrapper.element as HTMLElement)
    const addButton = queries.getByRole('button', { name: /最初のブックマークを追加する/ })
    addButton.click()
    expect(wrapper.emitted('add')).toBeTruthy()
  })
})
