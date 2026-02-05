import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import TagFilter from './TagFilter.vue'
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

describe('TagFilter', () => {
  it('tags が空のとき何も表示されない', async () => {
    const wrapper = await mountSuspended(TagFilter, {
      props: {
        'tags': [],
        'modelValue': [],
        'onUpdate:modelValue': vi.fn()
      }
    })

    expect(wrapper.findAll('button')).toHaveLength(0)
  })

  it('tags があるとき各タグのボタンが表示される', async () => {
    const tags = createMockTags()

    const wrapper = await mountSuspended(TagFilter, {
      props: {
        'tags': tags,
        'modelValue': [],
        'onUpdate:modelValue': vi.fn()
      }
    })

    expect(wrapper.text()).toContain('Vue')
    expect(wrapper.text()).toContain('React')
    expect(wrapper.findAll('button')).toHaveLength(2)
  })

  it('タグクリックで selectedTagIds に追加', async () => {
    const tags = createMockTags()
    const onUpdate = vi.fn()

    const wrapper = await mountSuspended(TagFilter, {
      props: {
        'tags': tags,
        'modelValue': [],
        'onUpdate:modelValue': onUpdate
      }
    })

    const buttons = wrapper.findAll('button')
    await buttons[0]!.trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(['tag-1'])
  })

  it('選択済みタグクリックで selectedTagIds から削除', async () => {
    const tags = createMockTags()
    const onUpdate = vi.fn()

    const wrapper = await mountSuspended(TagFilter, {
      props: {
        'tags': tags,
        'modelValue': ['tag-1'],
        'onUpdate:modelValue': onUpdate
      }
    })

    const buttons = wrapper.findAll('button')
    await buttons[0]!.trigger('click')

    expect(onUpdate).toHaveBeenCalledWith([])
  })
})
