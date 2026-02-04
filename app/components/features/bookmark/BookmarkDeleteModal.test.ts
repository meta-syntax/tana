import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import BookmarkDeleteModal from './BookmarkDeleteModal.vue'
import type { VueWrapper } from '@vue/test-utils'

describe('BookmarkDeleteModal', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('ブックマークタイトルが表示される', async () => {
    wrapper = await mountSuspended(BookmarkDeleteModal, {
      props: {
        'title': 'テストブックマーク',
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    expect(document.body.textContent).toContain('テストブックマーク')
  })

  it('50文字超のタイトルは切り詰め+「...」', async () => {
    const longTitle = 'あ'.repeat(60)

    wrapper = await mountSuspended(BookmarkDeleteModal, {
      props: {
        'title': longTitle,
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    const bodyText = document.body.textContent ?? ''
    expect(bodyText).toContain('あ'.repeat(50) + '...')
    expect(bodyText).not.toContain('あ'.repeat(51))
  })

  it('「削除する」ボタン → confirmイベント発行', async () => {
    wrapper = await mountSuspended(BookmarkDeleteModal, {
      props: {
        'title': 'テストブックマーク',
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    const confirmButton = screen.getByRole('button', { name: '削除する' })
    expect(confirmButton).not.toBeNull()

    confirmButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('「キャンセル」ボタン → モーダル閉じる', async () => {
    wrapper = await mountSuspended(BookmarkDeleteModal, {
      props: {
        'title': 'テストブックマーク',
        'open': true,
        'onUpdate:open': vi.fn()
      },
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

  it('確認後はloading表示、二重クリック防止', async () => {
    wrapper = await mountSuspended(BookmarkDeleteModal, {
      props: {
        'title': 'テストブックマーク',
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    const confirmButton = screen.getByRole('button', { name: '削除する' })
    confirmButton.click()
    await wrapper.vm.$nextTick()

    // 2回目のクリック
    confirmButton.click()
    await wrapper.vm.$nextTick()

    // confirmイベントは1回だけ
    expect(wrapper.emitted('confirm')!.length).toBe(1)
  })

  it('モーダル閉じるとloading状態リセット', async () => {
    wrapper = await mountSuspended(BookmarkDeleteModal, {
      props: {
        'title': 'テストブックマーク',
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    // 削除ボタンでloading状態にする
    const confirmButton = screen.getByRole('button', { name: '削除する' })
    confirmButton.click()
    await wrapper.vm.$nextTick()

    // モーダルを閉じる
    await wrapper.setProps({ open: false })
    await wrapper.vm.$nextTick()

    // 再度開く
    await wrapper.setProps({ open: true })
    await wrapper.vm.$nextTick()

    // 再度削除ボタンがクリックできる
    const newConfirmButton = screen.getByRole('button', { name: '削除する' })
    newConfirmButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('confirm')!.length).toBe(2)
  })
})
