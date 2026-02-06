import { describe, expect, it } from 'vitest'
import { handleAiError } from './handle-ai-error'

describe('handleAiError', () => {
  it('429ステータスで利用上限メッセージを返す', () => {
    const error = { statusCode: 429, statusMessage: 'Rate limited' }
    expect(handleAiError(error, 'フォールバック')).toBe('本日の利用上限に達しました')
  })

  it('その他のstatusCodeでフォールバックメッセージを返す', () => {
    const error = { statusCode: 500, statusMessage: 'Internal error' }
    expect(handleAiError(error, 'サーバーエラー')).toBe('サーバーエラー')
  })

  it('400ステータスでフォールバックメッセージを返す', () => {
    const error = { statusCode: 400, statusMessage: 'Bad request' }
    expect(handleAiError(error, 'リクエストエラー')).toBe('リクエストエラー')
  })

  it('非オブジェクトエラーでフォールバックメッセージを返す', () => {
    expect(handleAiError('string error', 'フォールバック')).toBe('フォールバック')
  })

  it('nullエラーでフォールバックメッセージを返す', () => {
    expect(handleAiError(null, 'フォールバック')).toBe('フォールバック')
  })

  it('undefinedエラーでフォールバックメッセージを返す', () => {
    expect(handleAiError(undefined, 'フォールバック')).toBe('フォールバック')
  })

  it('statusCodeプロパティのないオブジェクトでフォールバックメッセージを返す', () => {
    const error = { message: 'something went wrong' }
    expect(handleAiError(error, 'フォールバック')).toBe('フォールバック')
  })
})
