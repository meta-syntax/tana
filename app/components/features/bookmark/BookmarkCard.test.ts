import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { within, screen } from '@testing-library/vue'
import BookmarkCard from './BookmarkCard.vue'
import { createMockBookmark, resetIdCounter } from './__tests__/helpers'
import type { VueWrapper } from '@vue/test-utils'

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

function findButtonByIcon(wrapper: VueWrapper, iconName: string): ReturnType<VueWrapper['find']> | undefined {
  return wrapper.findAll('button').find(btn => btn.html().includes(iconName))
}

describe('BookmarkCard', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    resetIdCounter()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('タイトル・説明・ドメイン・相対時間が正しく表示される', async () => {
    const bookmark = createMockBookmark({
      url: 'https://example.com/page',
      title: 'テストタイトル',
      description: 'テスト説明文'
    })

    wrapper = await mountSuspended(BookmarkCard, {
      props: { bookmark },
      attachTo: document.body
    })

    expect(wrapper.text()).toContain('テストタイトル')
    expect(wrapper.text()).toContain('テスト説明文')
    expect(wrapper.text()).toContain('example.com')
    expect(wrapper.text()).toContain('1時間前')
  })

  it('タイトル未設定時はURLがタイトルとして表示される', async () => {
    const bookmark = createMockBookmark({
      url: 'https://example.com/page',
      title: null
    })

    wrapper = await mountSuspended(BookmarkCard, {
      props: { bookmark },
      attachTo: document.body
    })

    const queries = within(wrapper.element as HTMLElement)
    expect(queries.getByRole('heading', { level: 3 }).textContent).toBe('https://example.com/page')
  })

  it('説明がない場合は説明セクションが非表示', async () => {
    const bookmark = createMockBookmark({ description: null })

    wrapper = await mountSuspended(BookmarkCard, {
      props: { bookmark },
      attachTo: document.body
    })

    const queries = within(wrapper.element as HTMLElement)
    expect(queries.queryByTestId('bookmark-description')).toBeNull()
  })

  it('cardSize が large のときにサムネイルが表示される', async () => {
    const bookmark = createMockBookmark()

    wrapper = await mountSuspended(BookmarkCard, {
      props: { bookmark, cardSize: 'large' },
      attachTo: document.body
    })

    const queries = within(wrapper.element as HTMLElement)
    const thumbnail = queries.getByTestId('bookmark-thumbnail')
    expect(thumbnail.classList.contains('max-h-64')).toBe(true)
  })

  it('cardSize が small のときにサムネイルが非表示', async () => {
    const bookmark = createMockBookmark()

    wrapper = await mountSuspended(BookmarkCard, {
      props: { bookmark, cardSize: 'small' },
      attachTo: document.body
    })

    const queries = within(wrapper.element as HTMLElement)
    const thumbnail = queries.getByTestId('bookmark-thumbnail')
    expect(thumbnail.classList.contains('max-h-0')).toBe(true)
  })

  it('cardSize が large のとき説明文が表示される', async () => {
    const bookmark = createMockBookmark({ description: '表示される説明文' })

    wrapper = await mountSuspended(BookmarkCard, {
      props: { bookmark, cardSize: 'large' },
      attachTo: document.body
    })

    expect(wrapper.text()).toContain('表示される説明文')
  })

  it('cardSize が medium のとき説明文が非表示', async () => {
    const bookmark = createMockBookmark({ description: '非表示の説明文' })

    wrapper = await mountSuspended(BookmarkCard, {
      props: { bookmark, cardSize: 'medium' },
      attachTo: document.body
    })

    const queries = within(wrapper.element as HTMLElement)
    const descDiv = queries.getByTestId('bookmark-description')
    expect(descDiv.classList.contains('max-h-0')).toBe(true)
    expect(descDiv.classList.contains('opacity-0')).toBe(true)
  })

  it('編集ボタンクリック → editイベント発行', async () => {
    const bookmark = createMockBookmark()

    wrapper = await mountSuspended(BookmarkCard, {
      props: { bookmark },
      attachTo: document.body
    })

    const editButton = findButtonByIcon(wrapper, 'pencil-square')
    expect(editButton).toBeDefined()

    await editButton!.trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')![0]).toEqual([bookmark])
  })

  it('削除ボタンクリック → 削除確認モーダル表示 → 確認でdeleteイベント発行', async () => {
    const bookmark = createMockBookmark()

    wrapper = await mountSuspended(BookmarkCard, {
      props: { bookmark },
      attachTo: document.body
    })

    // 削除ボタンをクリック
    const deleteButton = findButtonByIcon(wrapper, 'trash')
    expect(deleteButton).toBeDefined()
    await deleteButton!.trigger('click')
    await wrapper.vm.$nextTick()

    // Teleport先の削除確認モーダルの「削除する」ボタンをクリック
    const confirmButton = screen.getByRole('button', { name: '削除する' })
    confirmButton.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')![0]).toEqual([bookmark])
  })

  it('削除モーダルでキャンセル → deleteイベントは発行されない', async () => {
    const bookmark = createMockBookmark()

    wrapper = await mountSuspended(BookmarkCard, {
      props: { bookmark },
      attachTo: document.body
    })

    // 削除ボタンをクリック
    const deleteButton = findButtonByIcon(wrapper, 'trash')
    await deleteButton!.trigger('click')
    await wrapper.vm.$nextTick()

    // Teleport先のキャンセルボタンをクリック
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
    cancelButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('delete')).toBeFalsy()
  })

  it('外部リンクのtarget="_blank", rel="noopener noreferrer"', async () => {
    const bookmark = createMockBookmark({ url: 'https://example.com' })

    wrapper = await mountSuspended(BookmarkCard, {
      props: { bookmark },
      attachTo: document.body
    })

    const links = wrapper.findAll('a[target="_blank"]')
    expect(links.length).toBeGreaterThan(0)

    const link = links[0]!
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })
})
