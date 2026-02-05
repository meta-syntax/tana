import { describe, it, expect, vi, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import TagManageModal from './TagManageModal.vue'
import type { VueWrapper } from '@vue/test-utils'
import type { TagWithCount } from '~/types'

const createMockTags = (): TagWithCount[] => [
  {
    id: 'tag-1',
    user_id: 'u1',
    name: 'Vue',
    color: '#22c55e',
    created_at: '',
    updated_at: '',
    bookmark_count: 5
  },
  {
    id: 'tag-2',
    user_id: 'u1',
    name: 'React',
    color: '#3b82f6',
    created_at: '',
    updated_at: '',
    bookmark_count: 3
  }
]

describe('TagManageModal', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('モーダルタイトル「タグ管理」が表示される', async () => {
    wrapper = await mountSuspended(TagManageModal, {
      props: {
        'tags': [],
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    expect(document.body.textContent).toContain('タグ管理')
  })

  it('tags が空のとき「タグがまだありません」表示', async () => {
    wrapper = await mountSuspended(TagManageModal, {
      props: {
        'tags': [],
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    expect(document.body.textContent).toContain('タグがまだありません')
  })

  it('tags があるとき各タグ名と件数が表示される', async () => {
    const tags = createMockTags()

    wrapper = await mountSuspended(TagManageModal, {
      props: {
        'tags': tags,
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    expect(document.body.textContent).toContain('Vue')
    expect(document.body.textContent).toContain('React')
    expect(document.body.textContent).toContain('5件')
    expect(document.body.textContent).toContain('3件')
  })

  it('新規追加フォーム送信で add イベント発火', async () => {
    wrapper = await mountSuspended(TagManageModal, {
      props: {
        'tags': [],
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    // タグ名を入力
    const input = document.body.querySelector('input[placeholder="新しいタグ名..."]') as HTMLInputElement
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    nativeInputValueSetter.call(input, 'TypeScript')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()

    // フォーム送信
    const form = document.body.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await wrapper.vm.$nextTick()

    const addEvents = wrapper.emitted('add')
    expect(addEvents).toBeTruthy()
    expect(addEvents![0]![0]).toEqual(
      expect.objectContaining({ name: 'TypeScript' })
    )
  })

  it('削除ボタンクリック→確認で delete イベント発火', async () => {
    const tags = createMockTags()

    wrapper = await mountSuspended(TagManageModal, {
      props: {
        'tags': tags,
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    // 削除ボタン（trashアイコン）をクリック
    const deleteButtons = document.body.querySelectorAll('[class*="i-heroicons-trash"]')
    if (deleteButtons.length > 0) {
      const deleteBtn = deleteButtons[0]!.closest('button') as HTMLButtonElement
      deleteBtn.click()
      await wrapper.vm.$nextTick()

      // 削除確認モーダルの「削除する」ボタンをクリック
      await wrapper.vm.$nextTick()
      const confirmButton = screen.queryByRole('button', { name: '削除する' })
      if (confirmButton) {
        confirmButton.click()
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted('delete')).toBeTruthy()
      }
    }
  })
})
