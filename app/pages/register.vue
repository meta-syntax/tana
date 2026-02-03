<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

const { signUp, loading, redirectIfAuthenticated } = useAuth()

redirectIfAuthenticated()

const registerSchema = z.object({
  email: z
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
})

type RegisterSchema = z.output<typeof registerSchema>

const state = reactive({
  email: '',
  password: ''
})

const onSubmit = async (event: FormSubmitEvent<RegisterSchema>) => {
  await signUp(event.data.email, event.data.password)
}
</script>

<template>
  <UContainer class="relative py-16 lg:py-24">
    <div class="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
      <AuthHero description="無料でアカウントを作成して、ブックマーク管理を始めましょう。">
        <template #headline>
          Tanaを始めよう
        </template>
      </AuthHero>

      <AuthFormCard
        title="新規登録"
        footer-text="アカウントをお持ちの方はこちら"
        footer-link-to="/login"
      >
        <template #form>
          <UForm
            :schema="registerSchema"
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
              新規登録して始める
            </UButton>
          </UForm>
        </template>
      </AuthFormCard>
    </div>
  </UContainer>
</template>
