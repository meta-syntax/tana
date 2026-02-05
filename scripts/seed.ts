import { createClient } from '@supabase/supabase-js'
import metascraper from 'metascraper'
import metascraperTitle from 'metascraper-title'
import metascraperDescription from 'metascraper-description'
import metascraperImage from 'metascraper-image'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const USER_ID = 'fe8fabb9-42c3-4d17-bd09-594ebb1c3420'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('環境変数 SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const scraper = metascraper([metascraperTitle(), metascraperDescription(), metascraperImage()])

const tags = [
  { name: 'フロントエンド', color: '#3b82f6' },
  { name: 'バックエンド', color: '#10b981' },
  { name: 'デザイン', color: '#f59e0b' },
  { name: 'ツール', color: '#8b5cf6' },
  { name: 'ニュース', color: '#ef4444' },
  { name: 'AI', color: '#ec4899' },
  { name: 'インフラ', color: '#06b6d4' },
  { name: '学習', color: '#84cc16' }
]

// [url, tagIndices]
const seedUrls: [string, number[]][] = [
  // フロントエンド
  ['https://nuxt.com', [0]],
  ['https://vuejs.org', [0]],
  ['https://react.dev', [0]],
  ['https://angular.dev', [0]],
  ['https://svelte.dev', [0]],
  ['https://nextjs.org', [0]],
  ['https://astro.build', [0]],
  ['https://solidjs.com', [0]],
  ['https://vitejs.dev', [0, 3]],
  ['https://pinia.vuejs.org', [0]],
  ['https://vueuse.org', [0]],
  ['https://nuxt.com/modules', [0]],

  // CSS / デザイン
  ['https://tailwindcss.com', [0, 2]],
  ['https://ui.nuxt.com', [0, 2]],
  ['https://ui.shadcn.com', [0, 2]],
  ['https://www.figma.com', [2, 3]],
  ['https://storybook.js.org', [0, 2]],
  ['https://fonts.google.com', [2]],
  ['https://heroicons.com', [2]],

  // バックエンド
  ['https://supabase.com', [1]],
  ['https://www.prisma.io', [1]],
  ['https://orm.drizzle.team', [1]],
  ['https://hono.dev', [1]],
  ['https://expressjs.com', [1]],
  ['https://nodejs.org', [1]],
  ['https://deno.com', [1]],
  ['https://bun.sh', [1, 3]],
  ['https://www.typescriptlang.org', [0, 1]],
  ['https://zod.dev', [0, 1]],

  // ツール
  ['https://github.com', [3]],
  ['https://code.visualstudio.com', [3]],
  ['https://turbo.build', [3]],
  ['https://vitest.dev', [0, 3]],
  ['https://playwright.dev', [3]],
  ['https://eslint.org', [0, 3]],
  ['https://prettier.io', [3]],
  ['https://www.docker.com', [3, 6]],
  ['https://biomejs.dev', [0, 3]],

  // インフラ / デプロイ
  ['https://vercel.com', [6]],
  ['https://www.netlify.com', [6]],
  ['https://www.cloudflare.com', [6]],
  ['https://aws.amazon.com', [1, 6]],

  // AI
  ['https://openai.com', [5]],
  ['https://www.anthropic.com', [5]],
  ['https://huggingface.co', [5]],

  // ニュース / コミュニティ
  ['https://zenn.dev', [4]],
  ['https://qiita.com', [4]],
  ['https://dev.to', [4]],

  // 学習
  ['https://developer.mozilla.org/ja/', [0, 7]],
  ['https://web.dev', [0, 7]],
  ['https://roadmap.sh', [7]]
]

interface OgpResult {
  title: string | null
  description: string | null
  image: string | null
}

const fetchOgp = async (url: string): Promise<OgpResult> => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ja,en;q=0.9'
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(15000)
  })
  const html = await response.text()
  const metadata = await scraper({ html, url })
  return {
    title: metadata.title || null,
    description: metadata.description || null,
    image: metadata.image || null
  }
}

async function main() {
  console.log(`シードデータの投入を開始します（${seedUrls.length} 件）`)

  // OGP取得
  console.log('OGPデータを取得中...')
  const bookmarks: { url: string, title: string | null, description: string | null, thumbnail_url: string | null, tagIndices: number[] }[] = []
  let successCount = 0
  let failCount = 0

  // 5件ずつ並列で取得
  for (let i = 0; i < seedUrls.length; i += 5) {
    const batch = seedUrls.slice(i, i + 5)
    const results = await Promise.allSettled(
      batch.map(async ([url, tagIndices]) => {
        const ogp = await fetchOgp(url)
        return { url, tagIndices, ogp }
      })
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { url, tagIndices, ogp } = result.value
        bookmarks.push({
          url,
          title: ogp.title,
          description: ogp.description,
          thumbnail_url: ogp.image,
          tagIndices
        })
        successCount++
        console.log(`  ✓ ${ogp.title ?? url}`)
      } else {
        const [url, tagIndices] = batch[results.indexOf(result)]!
        bookmarks.push({
          url,
          title: null,
          description: null,
          thumbnail_url: null,
          tagIndices
        })
        failCount++
        console.log(`  ✗ ${url} (${result.reason})`)
      }
    }
  }
  console.log(`OGP取得完了: 成功 ${successCount} / 失敗 ${failCount}`)

  // 既存データの削除
  console.log('既存データを削除中...')
  await supabase.from('bookmark_tags').delete().gte('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('bookmarks').delete().eq('user_id', USER_ID)
  await supabase.from('tags').delete().eq('user_id', USER_ID)

  // タグの投入
  console.log('タグを投入中...')
  const { data: insertedTags, error: tagError } = await supabase
    .from('tags')
    .insert(tags.map(tag => ({ ...tag, user_id: USER_ID })))
    .select()

  if (tagError || !insertedTags) {
    console.error('タグの投入に失敗しました:', tagError)
    process.exit(1)
  }
  console.log(`  ${insertedTags.length} 件のタグを投入しました`)

  // ブックマークの投入
  console.log('ブックマークを投入中...')
  const { data: insertedBookmarks, error: bookmarkError } = await supabase
    .from('bookmarks')
    .insert(bookmarks.map(({ tagIndices: _, ...bookmark }) => ({ ...bookmark, user_id: USER_ID })))
    .select()

  if (bookmarkError || !insertedBookmarks) {
    console.error('ブックマークの投入に失敗しました:', bookmarkError)
    process.exit(1)
  }
  console.log(`  ${insertedBookmarks.length} 件のブックマークを投入しました`)

  // bookmark_tags の投入
  console.log('ブックマークとタグの紐付けを投入中...')
  const bookmarkTags = bookmarks.flatMap((bookmark, i) =>
    bookmark.tagIndices.map(tagIndex => ({
      bookmark_id: insertedBookmarks[i]!.id,
      tag_id: insertedTags[tagIndex]!.id
    }))
  )

  const { error: btError } = await supabase
    .from('bookmark_tags')
    .insert(bookmarkTags)

  if (btError) {
    console.error('紐付けの投入に失敗しました:', btError)
    process.exit(1)
  }
  console.log(`  ${bookmarkTags.length} 件の紐付けを投入しました`)

  console.log('シードデータの投入が完了しました')
}

main().catch(console.error)
