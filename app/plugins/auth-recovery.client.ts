/**
 * SSR で session は復元されたが user (claims) の復元に失敗した場合、
 * クライアント側で user を再取得するリカバリプラグイン。
 *
 * onAuthStateChange は session の差分しか見ないため、
 * session が一致していると getClaims() が呼ばれず user が null のまま残る問題を解消する。
 */
export default defineNuxtPlugin({
  name: 'auth-recovery',
  async setup() {
    const session = useSupabaseSession()
    const user = useSupabaseUser()

    if (session.value && !user.value) {
      const supabase = useSupabaseClient()
      const { data } = await supabase.auth.getClaims()
      user.value = data?.claims ?? null
    }
  }
})
