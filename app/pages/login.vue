<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const {
  email,
  password,
  isSignUp,
  loading,
  handleAuth,
  redirectIfAuthenticated
} = useAuth()

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

async function onSubmit(event: FormSubmitEvent<LoginSchema>) {
  email.value = event.data.email
  password.value = event.data.password
  await handleAuth()
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-[var(--tana-ink)] text-white">
    <div class="absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_10%,rgba(249,115,22,0.22),transparent_60%)]" />
    <div class="absolute bottom-[-20%] right-[-10%] h-80 w-80 rounded-full bg-white/10 blur-3xl" />

    <UContainer class="relative py-16 lg:py-24">
      <div class="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <div class="space-y-6">
          <UBadge
            color="primary"
            variant="soft"
            class="w-fit bg-[#f97316]/15 text-[#fdba74] ring-1 ring-[#f97316]/35"
          >
            セキュアログイン
          </UBadge>
          <h1 class="text-4xl font-bold tracking-tight lg:text-5xl">
            あなたのブックマークを、<br class="hidden sm:block">
            もっと見返しやすく。
          </h1>
          <p class="text-lg text-white/70">
            URLを保存して自動でOGP情報を取得。サムネイルと検索で、必要なリンクにすぐ辿り着けます。
          </p>
          <div class="grid gap-4 sm:grid-cols-2">
            <UCard class="bg-white/5 ring-1 ring-white/10">
              <div class="space-y-2">
                <p class="text-sm text-white/60">
                  OGP自動取得
                </p>
                <p class="text-base font-semibold">
                  タイトル・説明を補完
                </p>
              </div>
            </UCard>
            <UCard class="bg-white/5 ring-1 ring-white/10">
              <div class="space-y-2">
                <p class="text-sm text-white/60">
                  レスポンシブ対応
                </p>
                <p class="text-base font-semibold">
                  スマホでも快適に閲覧
                </p>
              </div>
            </UCard>
          </div>
        </div>

        <UCard class="border border-white/10 bg-white/95 text-[#111] shadow-2xl">
          <template #header>
            <div class="space-y-2 text-center">
              <p class="text-sm text-gray-500">
                Tana アカウント
              </p>
              <h2 class="text-3xl font-bold text-[#111]">
                {{ isSignUp ? '新規登録' : 'ログイン' }}
              </h2>
            </div>
          </template>

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
                :ui="{ root: 'w-full', base: 'w-full bg-white text-[#111] placeholder:text-gray-400' }"
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
                :ui="{ root: 'w-full', base: 'w-full bg-white text-[#111] placeholder:text-gray-400' }"
              />
            </UFormField>

            <UButton
              type="submit"
              size="lg"
              block
              :loading="loading"
              class="bg-[var(--tana-accent)] text-[#111] hover:bg-[#ea580c]"
            >
              {{ isSignUp ? '新規登録して始める' : 'ログインして続ける' }}
            </UButton>
          </UForm>

          <template #footer>
            <div class="text-center">
              <UButton
                variant="ghost"
                class="text-gray-600 hover:text-[#111]"
                @click="isSignUp = !isSignUp"
              >
                {{ isSignUp ? 'すでにアカウントをお持ちですか？ログイン' : 'アカウントをお持ちでない方はこちら' }}
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
