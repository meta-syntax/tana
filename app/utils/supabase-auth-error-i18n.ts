type SupabaseAuthErrorCode
  = 'invalid_credentials'
    | 'email_not_confirmed'
    | 'email_exists'
    | 'user_already_exists'
    | 'email_provider_disabled'
    | 'over_request_rate_limit'
    | 'weak_password'
    | 'email_address_invalid'
    | 'validation_failed'
    | 'captcha_failed'
    | 'user_banned'
    | 'request_timeout'
    | 'unexpected_failure'
    | string

const ja: Record<SupabaseAuthErrorCode, string> = {
  email_exists: 'このメールアドレスは既に登録されています。',
  user_already_exists: 'このメールアドレスは既に登録されています。',
  invalid_credentials: 'メールアドレスまたはパスワードが正しくありません。',
  email_not_confirmed: 'メール認証が完了していません。受信メールをご確認ください。',
  email_provider_disabled: '現在、メールでの新規登録は停止されています。',
  over_request_rate_limit: '試行回数が多すぎます。しばらく待ってからお試しください。',
  weak_password: 'パスワードが弱すぎます。より強固なパスワードを設定してください。',
  email_address_invalid: 'メールアドレスの形式が正しくありません。',
  validation_failed: '入力内容に誤りがあります。ご確認ください。',
  captcha_failed: '認証に失敗しました。もう一度お試しください。',
  user_banned: 'このアカウントは利用停止中です。',
  request_timeout: 'リクエストがタイムアウトしました。時間をおいて再度お試しください。',
  unexpected_failure: 'サーバーで問題が発生しました。時間をおいて再度お試しください。'
}

type SupabaseAuthErrorLike = {
  code?: string
}

export const translateSupabaseAuthError = (
  error: unknown,
  fallback = '認証に失敗しました。時間をおいて再度お試しください。'
) => {
  const authError = error as SupabaseAuthErrorLike | null | undefined
  const code = authError?.code

  if (code && ja[code]) {
    return ja[code]
  }

  return fallback
}
