import RssParser from 'rss-parser'

export interface ParsedFeedItem {
  title: string
  url: string
  description: string | null
  publishedAt: string | null
}

export interface ParsedFeed {
  title: string | null
  description: string | null
  siteUrl: string | null
  items: ParsedFeedItem[]
}

const parser = new RssParser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Tana RSS Reader/1.0',
    'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml'
  }
})

export const parseFeed = async (feedUrl: string): Promise<ParsedFeed> => {
  // URL検証 + SSRF対策
  const targetUrl = validateUrl(feedUrl)
  await validateHost(targetUrl.hostname)

  const feed = await parser.parseURL(targetUrl.toString())

  const items: ParsedFeedItem[] = (feed.items ?? [])
    .filter(item => item.link)
    .map(item => ({
      title: item.title ?? item.link!,
      url: item.link!,
      description: item.contentSnippet?.slice(0, 500) ?? item.content?.slice(0, 500) ?? null,
      publishedAt: item.isoDate ?? item.pubDate ?? null
    }))

  return {
    title: feed.title ?? null,
    description: feed.description ?? null,
    siteUrl: feed.link ?? null,
    items
  }
}
