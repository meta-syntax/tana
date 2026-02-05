import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

interface UseAuthFormOptions {
  mode: 'login' | 'register'
}

const authSchema = z.object({
  email: z
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
})

export type AuthSchema = z.output<typeof authSchema>

export const useAuthForm = (options: UseAuthFormOptions) => {
  const { mode } = options
  const { signIn, signUp, loading, redirectIfAuthenticated } = useAuth()

  redirectIfAuthenticated()

  const state = reactive({
    email: '',
    password: ''
  })

  const onSubmit = async (event: FormSubmitEvent<AuthSchema>) => {
    if (mode === 'login') {
      await signIn(event.data.email, event.data.password)
    } else {
      await signUp(event.data.email, event.data.password)
    }
  }

  return {
    schema: authSchema,
    state,
    loading,
    onSubmit
  }
}
