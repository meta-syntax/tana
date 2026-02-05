import { describe, it, expect, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { within } from '@testing-library/vue'
import LoginPage from './login.vue'

const mockSignIn = vi.fn()

mockNuxtImport('useAuth', () => {
  return () => ({
    signIn: mockSignIn,
    signUp: vi.fn(),
    signOut: vi.fn(),
    loading: ref(false),
    user: ref(null)
  })
})

mockNuxtImport('navigateTo', () => {
  return vi.fn()
})

describe('login ページ', () => {
  it('ログインフォーム（メール、パスワード）が表示される', async () => {
    const wrapper = await mountSuspended(LoginPage)

    // Nuxt UIのUFormField+UInputはlabel[for]とinput[id]の関連付けがtesting-libraryのlabellable判定に適合しないため、
    // input[type]で検索する
    const emailInput = wrapper.find('input[type="email"]')
    expect(emailInput.exists()).toBe(true)

    const passwordInput = wrapper.find('input[type="password"]')
    expect(passwordInput.exists()).toBe(true)
  })

  it('ログインタイトルが表示される', async () => {
    const wrapper = await mountSuspended(LoginPage)

    expect(wrapper.text()).toContain('ログイン')
  })

  it('登録ページへのリンクが存在する', async () => {
    const wrapper = await mountSuspended(LoginPage)

    expect(wrapper.text()).toContain('アカウントをお持ちでない方はこちら')
    const queries = within(wrapper.element as HTMLElement)
    const registerLink = queries.getByRole('link', { name: /こちら/ })
    expect(registerLink).toBeDefined()
  })
})
