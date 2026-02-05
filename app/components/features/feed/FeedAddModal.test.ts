import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import FeedAddModal from './FeedAddModal.vue'
import type { VueWrapper } from '@vue/test-utils'

describe('FeedAddModal', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('タイトルが表示される', async () => {
    wrapper = await mountSuspended(FeedAddModal, {
      props: {
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    expect(document.body.textContent).toContain('RSSフィード')
  })

  it('空URLでは追加ボタンが無効', async () => {
    wrapper = await mountSuspended(FeedAddModal, {
      props: {
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    const addButton = screen.getByRole('button', { name: '追加する' })
    expect(addButton.hasAttribute('disabled') || addButton.getAttribute('aria-disabled') === 'true').toBe(true)
  })

  it('キャンセルボタンでモーダルが閉じる', async () => {
    wrapper = await mountSuspended(FeedAddModal, {
      props: {
        'open': true,
        'onUpdate:open': vi.fn()
      },
      attachTo: document.body
    })

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
    cancelButton.click()
    await wrapper.vm.$nextTick()

    const updateEvents = wrapper.emitted('update:open')
    expect(updateEvents).toBeTruthy()
    expect(updateEvents!.some(e => e[0] === false)).toBe(true)
  })
})
