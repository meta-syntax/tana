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

  it('displayState: loading時 → initial-loading', () => {
    const bookmarks = ref<Bookmark[]>([])
    const searchQuery = ref('')
    const totalCount = ref(0)
    const loading = ref(true)

    const { displayState } = useBookmarkSearch({ bookmarks, searchQuery, totalCount, loading })
    expect(displayState.value).toBe('initial-loading')
  })

  it('displayState: 検索中 → searching', async () => {
    const bookmarks = ref<Bookmark[]>([createMockBookmark('1')])
    const searchQuery = ref('')
    const totalCount = ref(1)
    const loading = ref(false)

    const { displayState } = useBookmarkSearch({ bookmarks, searchQuery, totalCount, loading })

    // 検索クエリをセットしてブックマークを更新
    searchQuery.value = 'test'
    bookmarks.value = [createMockBookmark('2')]
    await nextTick()

    // setTimeout前なのでisSearching=true
    expect(displayState.value).toBe('searching')
  })

  it('displayState: 検索結果なし → search-empty', async () => {
    const bookmarks = ref<Bookmark[]>([createMockBookmark('1')])
    const searchQuery = ref('')
    const totalCount = ref(0)
    const loading = ref(false)

    const { displayState } = useBookmarkSearch({ bookmarks, searchQuery, totalCount, loading })

    searchQuery.value = 'notfound'
    bookmarks.value = []
    await nextTick()

    vi.advanceTimersByTime(300)
    await nextTick()

    expect(displayState.value).toBe('search-empty')
  })

  it('displayState: 初期空 → initial-empty', () => {
    const bookmarks = ref<Bookmark[]>([])
    const searchQuery = ref('')
    const totalCount = ref(0)
    const loading = ref(false)

    const { displayState } = useBookmarkSearch({ bookmarks, searchQuery, totalCount, loading })
    expect(displayState.value).toBe('initial-empty')
  })

  it('displayState: 通常 → list', () => {
    const bookmarks = ref([createMockBookmark('1')])
    const searchQuery = ref('')
    const totalCount = ref(1)
    const loading = ref(false)

    const { displayState } = useBookmarkSearch({ bookmarks, searchQuery, totalCount, loading })
    expect(displayState.value).toBe('list')
  })

  it('searchResultText: クエリなし → 空文字', () => {
    const bookmarks = ref<Bookmark[]>([])
    const searchQuery = ref('')
    const totalCount = ref(0)
    const loading = ref(false)

    const { searchResultText } = useBookmarkSearch({ bookmarks, searchQuery, totalCount, loading })
    expect(searchResultText.value).toBe('')
  })

  it('searchResultText: クエリあり → N件の結果', async () => {
    const bookmarks = ref([createMockBookmark('1')])
    const searchQuery = ref('test')
    const totalCount = ref(5)
    const loading = ref(false)

    const { searchResultText } = useBookmarkSearch({ bookmarks, searchQuery, totalCount, loading })

    // watchのimmediate:trueでsetTimeoutが走る
    vi.advanceTimersByTime(300)
    await nextTick()

    expect(searchResultText.value).toBe('5件の結果')
  })

  it('isSearchEmpty: 検索結果0件で検索中でない → true', async () => {
    const bookmarks = ref([createMockBookmark('1')])
    const searchQuery = ref('')
    const totalCount = ref(0)
    const loading = ref(false)

    const { isSearchEmpty } = useBookmarkSearch({ bookmarks, searchQuery, totalCount, loading })

    searchQuery.value = 'notfound'
    bookmarks.value = []
    await nextTick()

    vi.advanceTimersByTime(300)
    await nextTick()

    expect(isSearchEmpty.value).toBe(true)
  })
})
