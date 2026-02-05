import { translateSupabaseAuthError } from '~/utils/supabase-auth-error-i18n'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const toast = useToast()

  const loading = ref(false)

  const signUp = async (email: string, password: string) => {
    loading.value = true

    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      toast.add({
        title: '登録完了',
        description: 'ログインしてください',
        color: 'success'
      })

      await navigateTo('/login')
    } catch (error) {
      console.error(error)
      const message = translateSupabaseAuthError(error, '登録に失敗しました。時間をおいて再度お試しください。')
      toast.add({
        title: 'エラー',
        description: message,
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    loading.value = true

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      await navigateTo('/dashboard')
    } catch (error) {
      console.error(error)
      const message = translateSupabaseAuthError(error, 'ログインに失敗しました。時間をおいて再度お試しください。')
      toast.add({
        title: 'エラー',
        description: message,
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    await navigateTo('/login')
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
}
