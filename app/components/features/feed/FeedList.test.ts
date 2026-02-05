import { describe, it, expect, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FeedList from './FeedList.vue'
import type { VueWrapper } from '@vue/test-utils'
import type { RssFeed } from '~/types'

const createFeed = (overrides: Partial<RssFeed> = {}): RssFeed => ({
  id: 'feed-1',
  user_id: 'user-1',
  url: 'https://example.com/feed.xml',
  title: 'テストフィード',
  description: 'テスト用',
  site_url: 'https://example.com',
  last_fetched_at: new Date().toISOString(),
  last_error: null,
  error_count: 0,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

describe('FeedList', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
  })

  it('フィード一覧が表示される', async () => {
    const feeds = [
      createFeed({ id: 'feed-1', title: 'Feed 1' }),
      createFeed({ id: 'feed-2', title: 'Feed 2' })
    ]

    wrapper = await mountSuspended(FeedList, {
      props: { feeds, loading: false }
    })

    expect(wrapper.text()).toContain('Feed 1')
    expect(wrapper.text()).toContain('Feed 2')
    expect(wrapper.text()).toContain('2件のフィード')
  })

  it('空状態が表示される', async () => {
    wrapper = await mountSuspended(FeedList, {
      props: { feeds: [], loading: false }
    })

    expect(wrapper.text()).toContain('RSSフィードが未登録です')
  })

  it('ローディング中にスケルトンが表示される', async () => {
    wrapper = await mountSuspended(FeedList, {
      props: { feeds: [], loading: true }
    })

    const skeletons = wrapper.findAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('件数が正しく表示される', async () => {
    wrapper = await mountSuspended(FeedList, {
      props: { feeds: [createFeed()], loading: false }
    })

    expect(wrapper.text()).toContain('1件のフィード')
  })
})
