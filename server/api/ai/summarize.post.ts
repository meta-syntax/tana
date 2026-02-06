import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types'
import type { SummarizeResponse } from '~/types/ai'

export default defineEventHandler(async (event): Promise<SummarizeResponse> => {
  const userId = await requireAuth(event)
  checkAiRateLimit(userId, 'summarize')

  const body = await readBody<{ bookmark_id: string, url: string }>(event)

  if (!body?.bookmark_id || !body?.url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'bookmark_id と url が必要です'
    })
  }

  const client = await serverSupabaseClient<Database>(event)

  // ブックマーク所有権確認 + 既存summary確認
  const { data: bookmark, error: fetchError } = await client
    .from('bookmarks')
    .select('id, summary')
    .eq('id', body.bookmark_id)
    .single()

  if (fetchError || !bookmark) {
    console.error('Bookmark fetch error:', fetchError?.message ?? 'not found')
    throw createError({
      statusCode: 404,
      statusMessage: 'ブックマークが見つかりません'
    })
  }

  // キャッシュヒット: 既存summaryがあれば即返却
  if (bookmark.summary) {
    return { summary: bookmark.summary, cached: true }
  }

  // SSRF防御
  const targetUrl = validateUrl(body.url)
  await validateHost(targetUrl.hostname)

  // ページHTMLを取得
  let html: string
  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.9'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw createError({
        statusCode: 502,
        statusMessage: `ページの取得に失敗しました: ${response.status}`
      })
    }

    html = await response.text()
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw createError({ statusCode: 504, statusMessage: 'ページ取得がタイムアウトしました' })
    }
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({ statusCode: 502, statusMessage: 'ページの取得に失敗しました' })
  }

  // テキスト抽出（script/style除去、4000文字切り詰め）
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000)

  if (!text || text.length < 50) {
    throw createError({
      statusCode: 422,
      statusMessage: 'ページから十分なテキストを抽出できませんでした'
    })
  }

  // Claude Haikuで要約
  const anthropic = getAnthropicClient()
  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-latest',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `以下のウェブページの内容を日本語で2〜3文に要約してください。簡潔かつ情報量の多い要約を心がけてください。

${text}`
      }
    ]
  })

  const summary = extractMessageText(message).trim()

  if (!summary) {
    throw createError({
      statusCode: 500,
      statusMessage: '要約の生成に失敗しました'
    })
  }

  // 結果をDBに保存（キャッシュ）
  await client
    .from('bookmarks')
    .update({ summary })
    .eq('id', body.bookmark_id)

  return { summary, cached: false }
})
