<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'ログイン',
  description: 'Tanaにログインして、保存したブックマークを管理しましょう。',
  ogTitle: 'ログイン | Tana',
  ogDescription: 'Tanaにログインして、保存したブックマークを管理しましょう。'
})

const { signIn, loading, redirectIfAuthenticated } = useAuth()

redirectIfAuthenticated()

const loginSchema = z.object({
  email: z
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
})

type LoginSchema = z.output<typeof loginSchema>

const state = reactive({
  email: '',
  password: ''
})

const onSubmit = async (event: FormSubmitEvent<LoginSchema>) => {
  await signIn(event.data.email, event.data.password)
}
</script>

<template>
  <UContainer class="relative py-16 lg:py-24">
    <div class="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
      <AuthHero description="保存したURLにタイトルと画像を自動で付けて、探しやすく整理。もう埋もれさせない。">
        <template #headline>
          ブックマーク、<br class="hidden sm:block">
          溜めっぱなしにしてない？
        </template>
      </AuthHero>

      <AuthFormCard
        title="ログイン"
        footer-text="アカウントをお持ちでない方はこちら"
        footer-link-to="/register"
      >
        <template #form>
          <UForm
            :schema="loginSchema"
            :state="state"
            class="space-y-4"
            @submit="onSubmit"
          >
            <UFormField
              label="メールアドレス"
              name="email"
              class="w-full"
              required
              :ui="{ label: 'text-gray-800 font-medium' }"
            >
              <UInput
                v-model="state.email"
                type="email"
                placeholder="name@example.com"
                size="lg"
              />
            </UFormField>

            <UFormField
              label="パスワード"
              name="password"
              class="w-full"
              required
              :ui="{ label: 'text-gray-800 font-medium' }"
            >
              <UInput
                v-model="state.password"
                type="password"
                placeholder="••••••••"
                size="lg"
              />
            </UFormField>

            <UButton
              type="submit"
              size="lg"
              block
              :loading="loading"
            >
              ログインして続ける
            </UButton>
          </UForm>
        </template>
      </AuthFormCard>
    </div>
  </UContainer>
</template>
