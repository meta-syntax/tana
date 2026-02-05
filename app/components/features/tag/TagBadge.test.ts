import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import TagBadge from './TagBadge.vue'

describe('TagBadge', () => {
  it('タグ名が表示される', async () => {
    const wrapper = await mountSuspended(TagBadge, {
      props: { name: 'Vue', color: '#22c55e' }
    })

    expect(wrapper.text()).toContain('Vue')
  })

  it('背景色と文字色が正しくスタイルに反映される（明るい色→黒文字）', async () => {
    const wrapper = await mountSuspended(TagBadge, {
      props: { name: 'イエロー', color: '#eab308' }
    })

    const span = wrapper.find('span')
    expect(span.attributes('style')).toContain('background-color: #eab308')
    expect(span.attributes('style')).toContain('color: #000000')
  })

  it('背景色と文字色が正しくスタイルに反映される（暗い色→白文字）', async () => {
    const wrapper = await mountSuspended(TagBadge, {
      props: { name: 'インディゴ', color: '#6366f1' }
    })

    const span = wrapper.find('span')
    expect(span.attributes('style')).toContain('background-color: #6366f1')
    expect(span.attributes('style')).toContain('color: #ffffff')
  })

  it('removable=false（デフォルト）: 削除ボタン非表示', async () => {
    const wrapper = await mountSuspended(TagBadge, {
      props: { name: 'Vue', color: '#22c55e' }
    })

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('removable=true: 削除ボタン表示＆クリックでremoveイベント発火', async () => {
    const wrapper = await mountSuspended(TagBadge, {
      props: { name: 'Vue', color: '#22c55e', removable: true }
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)

    await button.trigger('click')
    expect(wrapper.emitted('remove')).toBeTruthy()
  })
})
