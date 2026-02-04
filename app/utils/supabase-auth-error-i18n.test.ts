import { describe, it, expect } from 'vitest'
import { translateSupabaseAuthError } from './supabase-auth-error-i18n'

describe('translateSupabaseAuthError', () => {
  it.each([
    ['email_exists', 'このメールアドレスは既に登録されています。'],
    ['user_already_exists', 'このメールアドレスは既に登録されています。'],
    ['invalid_credentials', 'メールアドレスまたはパスワードが正しくありません。'],
    ['email_not_confirmed', 'メール認証が完了していません。受信メールをご確認ください。'],
    ['email_provider_disabled', '現在、メールでの新規登録は停止されています。'],
    ['over_request_rate_limit', '試行回数が多すぎます。しばらく待ってからお試しください。'],
    ['weak_password', 'パスワードが弱すぎます。より強固なパスワードを設定してください。'],
    ['email_address_invalid', 'メールアドレスの形式が正しくありません。'],
    ['validation_failed', '入力内容に誤りがあります。ご確認ください。'],
    ['captcha_failed', '認証に失敗しました。もう一度お試しください。'],
    ['user_banned', 'このアカウントは利用停止中です。'],
    ['request_timeout', 'リクエストがタイムアウトしました。時間をおいて再度お試しください。'],
    ['unexpected_failure', 'サーバーで問題が発生しました。時間をおいて再度お試しください。']
  ])('エラーコード "%s" → 正しい日本語メッセージを返す', (code, expected) => {
    expect(translateSupabaseAuthError({ code })).toBe(expected)
  })

  it('未知のエラーコード → デフォルトフォールバック', () => {
    expect(translateSupabaseAuthError({ code: 'unknown_error_code' }))
      .toBe('認証に失敗しました。時間をおいて再度お試しください。')
  })

  it('カスタムフォールバックを指定できる', () => {
    const custom = 'カスタムメッセージ'
    expect(translateSupabaseAuthError({ code: 'unknown_error_code' }, custom))
      .toBe(custom)
  })

  it('null → フォールバック', () => {
    expect(translateSupabaseAuthError(null))
      .toBe('認証に失敗しました。時間をおいて再度お試しください。')
  })

  it('undefined → フォールバック', () => {
    expect(translateSupabaseAuthError(undefined))
      .toBe('認証に失敗しました。時間をおいて再度お試しください。')
  })

  it('codeプロパティなしのオブジェクト → フォールバック', () => {
    expect(translateSupabaseAuthError({ message: 'some error' }))
      .toBe('認証に失敗しました。時間をおいて再度お試しください。')
  })
})
