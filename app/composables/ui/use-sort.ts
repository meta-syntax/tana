import type { BookmarkSort, SortField, SortOrder } from '~/types'

const COOKIE_KEY = 'tana-sort'
const DEFAULT_SORT: BookmarkSort = { field: 'created_at', order: 'desc' }

const VALID_FIELDS: readonly SortField[] = ['created_at', 'title', 'url', 'sort_order']
const VALID_ORDERS: readonly SortOrder[] = ['asc', 'desc']

const isSortField = (value: string): value is SortField =>
  VALID_FIELDS.includes(value as SortField)

const isSortOrder = (value: string): value is SortOrder =>
  VALID_ORDERS.includes(value as SortOrder)

/** ソート文字列("created_at-desc")をBookmarkSort型に変換 */
const parseSortString = (value: string): BookmarkSort | null => {
  const parts = value.split('-')
  if (parts.length < 2) return null
  const order = parts.pop()
  const field = parts.join('-')
  if (!order || !isSortField(field) || !isSortOrder(order)) return null
  return { field, order }
}

export const useSort = () => {
  const sortCookie = useCookie<string>(COOKIE_KEY, {
    default: () => `${DEFAULT_SORT.field}-${DEFAULT_SORT.order}`
  })

  const sort = computed<BookmarkSort>({
    get: () => parseSortString(sortCookie.value) ?? DEFAULT_SORT,
    set: (val) => { sortCookie.value = `${val.field}-${val.order}` }
  })

  return { sort }
}
