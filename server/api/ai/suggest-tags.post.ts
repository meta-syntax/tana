import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types'
import type { SuggestTagsResponse } from '~/types/ai'

export default defineEventHandler(async (event): Promise<SuggestTagsResponse> => {
  const userId = await requireAuth(event)
  checkAiRateLimit(userId, 'suggest-tags')

  const body = await readBody<{ title: string, description: string }>(event)

  if (!body?.title && !body?.description) {
    throw createError({
      statusCode: 400,
      statusMessage: 'title または description が必要です'
    })
  }

  // ユーザーの既存タグを取得
  const client = await serverSupabaseClient<Database>(event)
  const { data: existingTags } = await client
    .from('tags')
    .select('id, name')
    .eq('user_id', userId)

  const tagNames = (existingTags ?? []).map(t => t.name)

  const anthropic = getAnthropicClient()
  const existingTagsText = tagNames.length > 0
    ? `\n\nユーザーの既存タグ: ${tagNames.join(', ')}`
    : ''

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-latest',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `以下のウェブページ情報から、ブックマーク管理に適したタグを3〜5個提案してください。
タグ名は短く簡潔に（1〜3語）、日本語または英語で。
${existingTagsText}

既存タグがあれば優先的に再利用し、必要に応じて新規タグも提案してください。

タイトル: ${body.title || '(なし)'}
説明: ${body.description || '(なし)'}

JSON配列のみ回答してください（説明不要）:
[{"name": "タグ名"}, ...]`
      }
    ]
  })

  // レスポンスをパース
  const text = extractMessageText(message)
  let suggestions: Array<{ name: string, tag_id: string | null, is_existing: boolean }>

  try {
    const jsonMatch = text.match(/\[[\s\S]*]/)
    const parsed = JSON.parse(jsonMatch?.[0] ?? '[]') as Array<{ name: string }>

    suggestions = parsed.map((item) => {
      const existing = (existingTags ?? []).find(
        t => t.name.toLowerCase() === item.name.toLowerCase()
      )
      return {
        name: item.name,
        tag_id: existing?.id ?? null,
        is_existing: !!existing
      }
    })
  } catch {
    suggestions = []
  }

  return { suggestions }
})
