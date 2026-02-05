import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import TagColorPicker from './TagColorPicker.vue'
import { TAG_COLORS } from '~/constants/tag-colors'

describe('TagColorPicker', () => {
  it('TAG_COLORS 分のボタンが表示される', async () => {
    const wrapper = await mountSuspended(TagColorPicker, {
      props: { 'modelValue': TAG_COLORS[0]!.value, 'onUpdate:modelValue': vi.fn() }
    })

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(TAG_COLORS.length)
  })

  it('選択中の色のボタンに border-highlighted クラスが付く', async () => {
    const selectedColor = TAG_COLORS[2]!.value

    const wrapper = await mountSuspended(TagColorPicker, {
      props: { 'modelValue': selectedColor, 'onUpdate:modelValue': vi.fn() }
    })

    const buttons = wrapper.findAll('button')
    const selectedButton = buttons[2]!
    expect(selectedButton.classes()).toContain('border-highlighted')

    // 他のボタンは border-transparent
    const otherButton = buttons[0]!
    expect(otherButton.classes()).toContain('border-transparent')
  })

  it('クリックで modelValue が更新される', async () => {
    const onUpdate = vi.fn()

    const wrapper = await mountSuspended(TagColorPicker, {
      props: { 'modelValue': TAG_COLORS[0]!.value, 'onUpdate:modelValue': onUpdate }
    })

    const buttons = wrapper.findAll('button')
    await buttons[3]!.trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(TAG_COLORS[3]!.value)
  })
})
