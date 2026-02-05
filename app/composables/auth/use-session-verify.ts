/**
 * セッション状態を確認し、未反映の場合は直接取得を試みる
 * auth / guest ミドルウェアで共通利用
 * @returns セッションが存在する場合 true
 */
export const useSessionVerify = async (): Promise<boolean> => {
  const session = useSupabaseSession()

  if (session.value) return true

  // セッション状態が未反映の場合（SSR側の復元失敗時等）、直接取得を試みる
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()

  if (data.session) {
    return true
  }

  return false
}
