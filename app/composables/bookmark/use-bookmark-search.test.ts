import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useBookmarkSearch } from './use-bookmark-search'
import type { Bookmark } from '~/types'

const createMockBookmark = (id: string): Bookmark => ({
  id,
  user_id: 'user-1',
  url: `https://example-${id}.com`,
  title: `Bookmark ${id}`,
  description: null,
  thumbnail_url: null,
  rss_feed_id: null,
  summary: null,
  sort_order: 1000,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
})

describe('useBookmarkSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const defaultOptions = () => ({
    bookmarks: ref<Bookmark[]>([]),
    searchQuery: ref(''),
    selectedTagIds: ref<string[]>([]),
    totalCount: ref(0),
    loading: ref(false)
  })

  it('displayState: loading時 → initial-loading', () => {
    const opts = defaultOptions()
    opts.loading.value = true

    const { displayState } = useBookmarkSearch(opts)
    expect(displayState.value).toBe('initial-loading')
  })

  it('displayState: 検索中 → searching', async () => {
    const opts = defaultOptions()
    opts.bookmarks.value = [createMockBookmark('1')]
    opts.totalCount.value = 1

    const { displayState } = useBookmarkSearch(opts)

    // 検索クエリをセットしてブックマークを更新
    opts.searchQuery.value = 'test'
    opts.bookmarks.value = [createMockBookmark('2')]
    await nextTick()

    // setTimeout前なのでisSearching=true
    expect(displayState.value).toBe('searching')
  })

  it('displayState: タグフィルタリング中 → filtering', async () => {
    const opts = defaultOptions()
    opts.bookmarks.value = [createMockBookmark('1')]
    opts.totalCount.value = 1

    const { displayState } = useBookmarkSearch(opts)

    // タグフィルタを適用してブックマークを更新
    opts.selectedTagIds.value = ['tag-1']
    opts.bookmarks.value = [createMockBookmark('2')]
    await nextTick()

    // setTimeout前なのでisSearching=true、タグフィルタのみなのでfiltering
    expect(displayState.value).toBe('filtering')
  })

  it('displayState: タグフィルタリング完了後 → list', async () => {
    const opts = defaultOptions()
    opts.bookmarks.value = [createMockBookmark('1')]
    opts.totalCount.value = 1

    const { displayState } = useBookmarkSearch(opts)

    opts.selectedTagIds.value = ['tag-1']
    opts.bookmarks.value = [createMockBookmark('2')]
    await nextTick()

    vi.advanceTimersByTime(300)
    await nextTick()

    expect(displayState.value).toBe('list')
  })

  it('displayState: 検索結果なし → search-empty', async () => {
    const opts = defaultOptions()
    opts.bookmarks.value = [createMockBookmark('1')]

    const { displayState } = useBookmarkSearch(opts)

    opts.searchQuery.value = 'notfound'
    opts.bookmarks.value = []
    await nextTick()

    vi.advanceTimersByTime(300)
    await nextTick()

    expect(displayState.value).toBe('search-empty')
  })

  it('displayState: タグフィルター結果なし → search-empty', async () => {
    const opts = defaultOptions()
    opts.bookmarks.value = [createMockBookmark('1')]
    opts.totalCount.value = 1

    const { displayState } = useBookmarkSearch(opts)

    opts.selectedTagIds.value = ['tag-1']
    opts.bookmarks.value = []
    await nextTick()

    vi.advanceTimersByTime(300)
    await nextTick()

    expect(displayState.value).toBe('search-empty')
  })

  it('displayState: 初期空 → initial-empty', () => {
    const opts = defaultOptions()

    const { displayState } = useBookmarkSearch(opts)
    expect(displayState.value).toBe('initial-empty')
  })

  it('displayState: 通常 → list', () => {
    const opts = defaultOptions()
    opts.bookmarks.value = [createMockBookmark('1')]
    opts.totalCount.value = 1

    const { displayState } = useBookmarkSearch(opts)
    expect(displayState.value).toBe('list')
  })

  it('searchResultText: クエリなし → 空文字', () => {
    const opts = defaultOptions()

    const { searchResultText } = useBookmarkSearch(opts)
    expect(searchResultText.value).toBe('')
  })

  it('searchResultText: クエリあり → N件の結果', async () => {
    const opts = defaultOptions()
    opts.bookmarks.value = [createMockBookmark('1')]
    opts.searchQuery.value = 'test'
    opts.totalCount.value = 5

    const { searchResultText } = useBookmarkSearch(opts)

    // watchのimmediate:trueでsetTimeoutが走る
    vi.advanceTimersByTime(300)
    await nextTick()

    expect(searchResultText.value).toBe('5件の結果')
  })
})
