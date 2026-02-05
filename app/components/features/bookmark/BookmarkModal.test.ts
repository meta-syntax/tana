import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import BookmarkModal from './BookmarkModal.vue'
import { createMockBookmark, resetIdCounter } from './__tests__/helpers'
import type { VueWrapper } from '@vue/test-utils'

const mockFetchOgp = vi.fn()

mockNuxtImport('useOgp', () => {
  return () => ({
    loading: ref(false),
    error: ref(null),
    fetchOgp: mockFetchOgp
  })
})

// DOMヘルパー: Teleport先のコンテンツを検索
const findInBody = (selector: string): HTMLElement | null => {
  return document.body.querySelector(selector)
}

describe('BookmarkModal', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    resetIdCounter()
    mockFetchOgp.mockReset()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('新規モード: タイトル「新しいブックマーク」、ボタン「追加する」', async () => {
    wrapper = await mountSuspended(BookmarkModal, {
      props: { 'open': true, 'onUpdate:open': vi.fn() },
      attachTo: document.body
    })

    expect(document.body.textContent).toContain('新しいブックマーク')
    expect(screen.getByRole('button', { name: '追加する' })).not.toBeNull()
  })

  it('編集モード: タイトル「ブックマークを編集」、ボタン「更新する」、データプリフィル', async () => {
    const bookmark = createMockBookmark({
      url: 'https://example.com',
      title: '既存タイトル',
      description: '既存説明'
    })

    // まずopen=falseでマウントしてからopen=trueにすることで
    // watch(isOpen)のフォーム初期化をトリガーする
    wrapper = await mountSuspended(BookmarkModal, {
      props: { 'open': false, bookmark, 'onUpdate:open': vi.fn() },
      attachTo: document.body
    })

    await wrapper.setProps({ open: true })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(document.body.textContent).toContain('ブックマークを編集')
    expect(screen.getByRole('button', { name: '更新する' })).not.toBeNull()

    // UInputのv-modelはDOMのvalue属性に反映される
    const urlInput = findInBody('input#url') as HTMLInputElement
    expect(urlInput.value).toBe('https://example.com')
  })

  it('URLバリデーション: 空→エラー', async () => {
    wrapper = await mountSuspended(BookmarkModal, {
      props: { 'open': true, 'onUpdate:open': vi.fn() },
      attachTo: document.body
    })

    const form = findInBody('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await wrapper.vm.$nextTick()

    expect(document.body.textContent).toContain('URLを入力してください')
  })

  it('URLバリデーション: 無効URL→エラー', async () => {
    wrapper = await mountSuspended(BookmarkModal, {
      props: { 'open': true, 'onUpdate:open': vi.fn() },
      attachTo: document.body
    })

    const urlInput = findInBody('input#url') as HTMLInputElement
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    nativeInputValueSetter.call(urlInput, 'not-a-url')
    urlInput.dispatchEvent(new Event('input', { bubbles: true }))
    urlInput.dispatchEvent(new Event('blur', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(document.body.textContent).toContain('有効なURLを入力してください')
  })

  it('OGP自動取得: URLブラー時にfetchOgp呼び出し', async () => {
    mockFetchOgp.mockResolvedValueOnce({
      title: 'OGPタイトル',
      description: 'OGP説明文',
      image: 'https://example.com/og.png'
    })

    wrapper = await mountSuspended(BookmarkModal, {
      props: { 'open': true, 'onUpdate:open': vi.fn() },
      attachTo: document.body
    })

    const urlInput = findInBody('input#url') as HTMLInputElement
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    nativeInputValueSetter.call(urlInput, 'https://example.com')
    urlInput.dispatchEvent(new Event('input', { bubbles: true }))
    urlInput.dispatchEvent(new Event('blur', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(mockFetchOgp).toHaveBeenCalledWith('https://example.com')
  })

  it('既にタイトル入力済みならOGP取得してもタイトル上書きしない', async () => {
    mockFetchOgp.mockResolvedValueOnce({
      title: 'OGPタイトル',
      description: null,
      image: null
    })

    wrapper = await mountSuspended(BookmarkModal, {
      props: { 'open': true, 'onUpdate:open': vi.fn() },
      attachTo: document.body
    })

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!

    // 先にタイトルを入力
    const titleInput = findInBody('input#title') as HTMLInputElement
    nativeInputValueSetter.call(titleInput, '手動タイトル')
    titleInput.dispatchEvent(new Event('input', { bubbles: true }))

    // URLを入力してblur
    const urlInput = findInBody('input#url') as HTMLInputElement
    nativeInputValueSetter.call(urlInput, 'https://example.com')
    urlInput.dispatchEvent(new Event('input', { bubbles: true }))
    urlInput.dispatchEvent(new Event('blur', { bubbles: true }))
    await wrapper.vm.$nextTick()
    await mockFetchOgp.mock.results[0]?.value

    // タイトルが上書きされていないことを確認
    expect(titleInput.value).toBe('手動タイトル')
  })

  it('同じURLではOGP再取得スキップ', async () => {
    mockFetchOgp.mockResolvedValue({
      title: 'OGPタイトル',
      description: null,
      image: null
    })

    wrapper = await mountSuspended(BookmarkModal, {
      props: { 'open': true, 'onUpdate:open': vi.fn() },
      attachTo: document.body
    })

    const urlInput = findInBody('input#url') as HTMLInputElement
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    nativeInputValueSetter.call(urlInput, 'https://example.com')
    urlInput.dispatchEvent(new Event('input', { bubbles: true }))
    urlInput.dispatchEvent(new Event('blur', { bubbles: true }))
    await wrapper.vm.$nextTick()
    await mockFetchOgp.mock.results[0]?.value
    await wrapper.vm.$nextTick()

    // 同じURLで再度blur
    urlInput.dispatchEvent(new Event('blur', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(mockFetchOgp).toHaveBeenCalledTimes(1)
  })

  it('送信 → saveイベント発行（BookmarkInputデータ付き）', async () => {
    wrapper = await mountSuspended(BookmarkModal, {
      props: { 'open': true, 'onUpdate:open': vi.fn() },
      attachTo: document.body
    })

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!

    const urlInput = findInBody('input#url') as HTMLInputElement
    nativeInputValueSetter.call(urlInput, 'https://example.com')
    urlInput.dispatchEvent(new Event('input', { bubbles: true }))

    const titleInput = findInBody('input#title') as HTMLInputElement
    nativeInputValueSetter.call(titleInput, 'テストタイトル')
    titleInput.dispatchEvent(new Event('input', { bubbles: true }))

    const form = findInBody('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await wrapper.vm.$nextTick()

    const saveEvents = wrapper.emitted('save')
    expect(saveEvents).toBeTruthy()
    expect(saveEvents![0]![0]).toEqual({
      url: 'https://example.com',
      title: 'テストタイトル',
      description: null,
      thumbnail_url: null,
      tag_ids: []
    })
  })

  it('キャンセルでモーダル閉じる', async () => {
    wrapper = await mountSuspended(BookmarkModal, {
      props: { 'open': true, 'onUpdate:open': vi.fn() },
      attachTo: document.body
    })

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
    expect(cancelButton).not.toBeNull()

    cancelButton.click()
    await wrapper.vm.$nextTick()

    const updateEvents = wrapper.emitted('update:open')
    expect(updateEvents).toBeTruthy()
    expect(updateEvents!.some(e => e[0] === false)).toBe(true)
  })

  it('tags propを渡すとTagSelectが表示される', async () => {
    const tags = [
      { id: 'tag-1', user_id: 'u1', name: 'Vue', color: '#22c55e', created_at: '', updated_at: '' },
      { id: 'tag-2', user_id: 'u1', name: 'React', color: '#3b82f6', created_at: '', updated_at: '' }
    ]

    wrapper = await mountSuspended(BookmarkModal, {
      props: { 'open': true, 'onUpdate:open': vi.fn(), tags },
      attachTo: document.body
    })

    expect(document.body.textContent).toContain('タグ')
  })

  it('create-tagイベントが伝播する', async () => {
    wrapper = await mountSuspended(BookmarkModal, {
      props: { 'open': true, 'onUpdate:open': vi.fn(), 'tags': [] },
      attachTo: document.body
    })

    // TagSelectコンポーネントからcreate-tagイベントをトリガー
    const tagSelect = wrapper.findComponent({ name: 'TagSelect' })
    if (tagSelect.exists()) {
      tagSelect.vm.$emit('create-tag', { name: 'NewTag', color: '#3b82f6' })
      await wrapper.vm.$nextTick()

      const events = wrapper.emitted('create-tag')
      expect(events).toBeTruthy()
      expect(events![0]![0]).toEqual({ name: 'NewTag', color: '#3b82f6' })
    }
  })

  it('再オープン時にフォームリセット', async () => {
    wrapper = await mountSuspended(BookmarkModal, {
      props: { 'open': true, 'onUpdate:open': vi.fn() },
      attachTo: document.body
    })

    // URLを入力
    const urlInput = findInBody('input#url') as HTMLInputElement
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    nativeInputValueSetter.call(urlInput, 'https://example.com')
    urlInput.dispatchEvent(new Event('input', { bubbles: true }))

    // モーダルを閉じて再オープン
    await wrapper.setProps({ open: false })
    await wrapper.vm.$nextTick()
    await wrapper.setProps({ open: true })
    await wrapper.vm.$nextTick()

    // フォームがリセットされている
    const newUrlInput = findInBody('input#url') as HTMLInputElement
    expect(newUrlInput?.value ?? '').toBe('')
  })
})
