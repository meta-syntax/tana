import { translateSupabaseAuthError } from '~/utils/supabase-auth-error-i18n'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const toast = useToast()

  const email = ref('')
  const password = ref('')
  const isSignUp = ref(false)
  const loading = ref(false)

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })

    if (error) throw error

    toast.add({
      title: '登録完了',
      description: 'ログインしてください',
      color: 'success'
    })

    isSignUp.value = false
    email.value = ''
    password.value = ''
  }

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    await navigateTo('/login')
  }

  const handleAuth = async () => {
    loading.value = true

    try {
      if (isSignUp.value) {
        await signUp()
      } else {
        await signIn()
      }
    } catch (error) {
      console.error(error)
      const fallback = isSignUp.value
        ? '登録に失敗しました。時間をおいて再度お試しください。'
        : 'ログインに失敗しました。時間をおいて再度お試しください。'
      const message = translateSupabaseAuthError(error, fallback)
      toast.add({
        title: 'エラー',
        description: message,
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  const redirectIfAuthenticated = () => {
    watchEffect(() => {
      if (user.value) {
        navigateTo('/dashboard')
      }
    })
  }

  const redirectIfUnauthenticated = () => {
    watchEffect(() => {
      if (!user.value) {
        navigateTo('/login')
      }
    })
  }

  return {
    user,
    email,
    password,
    isSignUp,
    loading,
    handleAuth,
    signOut,
    redirectIfAuthenticated,
    redirectIfUnauthenticated
  }
}
