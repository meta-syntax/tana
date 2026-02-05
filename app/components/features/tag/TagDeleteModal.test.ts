import { describe, it, expect, vi, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import TagDeleteModal from './TagDeleteModal.vue'
import type { VueWrapper } from '@vue/test-utils'

describe('TagDeleteModal', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('タグ名が表示される', async () => {
    wrapper = await mountSuspended(TagDeleteModal, {
      props: {
        'tagName': 'Vue',
        'bookmarkCount': 0,
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    expect(document.body.textContent).toContain('Vue')
  })

  it('bookmarkCount > 0 のとき警告テキスト表示', async () => {
    wrapper = await mountSuspended(TagDeleteModal, {
      props: {
        'tagName': 'Vue',
        'bookmarkCount': 5,
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    expect(document.body.textContent).toContain('5件のブックマークに紐付けられています')
  })

  it('bookmarkCount === 0 のとき警告テキスト非表示', async () => {
    wrapper = await mountSuspended(TagDeleteModal, {
      props: {
        'tagName': 'Vue',
        'bookmarkCount': 0,
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    expect(document.body.textContent).not.toContain('件のブックマークに紐付けられています')
  })

  it('「キャンセル」で open が false に', async () => {
    const onUpdateOpen = vi.fn()

    wrapper = await mountSuspended(TagDeleteModal, {
      props: {
        'tagName': 'Vue',
        'bookmarkCount': 0,
        'open': true,
        'onUpdate:open': onUpdateOpen
      },
      attachTo: document.body
    })

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
    cancelButton.click()
    await wrapper.vm.$nextTick()

    expect(onUpdateOpen).toHaveBeenCalledWith(false)
  })

  it('「削除する」で confirm イベント発火＆ open が false に', async () => {
    const onUpdateOpen = vi.fn()

    wrapper = await mountSuspended(TagDeleteModal, {
      props: {
        'tagName': 'Vue',
        'bookmarkCount': 3,
        'open': true,
        'onUpdate:open': onUpdateOpen
      },
      attachTo: document.body
    })

    const deleteButton = screen.getByRole('button', { name: '削除する' })
    deleteButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(onUpdateOpen).toHaveBeenCalledWith(false)
  })
})
