import type { Bookmark, BookmarkSort } from '~/types'

let idCounter = 0

export const createMockBookmark = (overrides?: Partial<Bookmark>): Bookmark => {
  idCounter++
  return {
    id: `bookmark-${idCounter}`,
    user_id: 'test-user-id',
    url: `https://example-${idCounter}.com`,
    title: `テストブックマーク ${idCounter}`,
    description: `テスト説明文 ${idCounter}`,
    thumbnail_url: `https://example-${idCounter}.com/og.png`,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides
  }
}

export const createMockBookmarks = (count: number, overrides?: Partial<Bookmark>): Bookmark[] => {
  return Array.from({ length: count }, () => createMockBookmark(overrides))
}

export const defaultStats = { total: 10, thisWeek: 3 }

export const defaultSort: BookmarkSort = { field: 'created_at', order: 'desc' }

export const resetIdCounter = (): void => {
  idCounter = 0
}
