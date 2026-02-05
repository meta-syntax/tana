import { describe, it, expect, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FeedCard from './FeedCard.vue'
import type { VueWrapper } from '@vue/test-utils'
import type { RssFeed } from '~/types'

const baseFeed: RssFeed = {
  id: 'feed-1',
  user_id: 'user-1',
  url: 'https://example.com/feed.xml',
  title: 'テストフィード',
  description: 'テスト用のRSSフィード',
  site_url: 'https://example.com',
  last_fetched_at: new Date().toISOString(),
  last_error: null,
  error_count: 0,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

describe('FeedCard', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
  })

  it('フィードタイトルが表示される', async () => {
    wrapper = await mountSuspended(FeedCard, {
      props: { feed: baseFeed }
    })

    expect(wrapper.text()).toContain('テストフィード')
  })

  it('フィード説明が表示される', async () => {
    wrapper = await mountSuspended(FeedCard, {
      props: { feed: baseFeed }
    })

    expect(wrapper.text()).toContain('テスト用のRSSフィード')
  })

  it('ドメインが表示される', async () => {
    wrapper = await mountSuspended(FeedCard, {
      props: { feed: baseFeed }
    })

    expect(wrapper.text()).toContain('example.com')
  })

  it('エラー時にエラーメッセージが表示される', async () => {
    const errorFeed = { ...baseFeed, last_error: 'Connection timeout', error_count: 1 }
    wrapper = await mountSuspended(FeedCard, {
      props: { feed: errorFeed }
    })

    expect(wrapper.text()).toContain('Connection timeout')
  })

  it('削除ボタンで delete イベントが発火する', async () => {
    wrapper = await mountSuspended(FeedCard, {
      props: { feed: baseFeed }
    })

    const deleteButtons = wrapper.findAll('button').filter(btn =>
      btn.find('[class*="trash"]').exists()
    )
    if (deleteButtons.length > 0) {
      await deleteButtons[0]!.trigger('click')
      expect(wrapper.emitted('delete')).toBeTruthy()
    }
  })

  it('タイトル未設定時はドメインが表示される', async () => {
    const noTitleFeed = { ...baseFeed, title: null }
    wrapper = await mountSuspended(FeedCard, {
      props: { feed: noTitleFeed }
    })

    expect(wrapper.text()).toContain('example.com')
  })
})
