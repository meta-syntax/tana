<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: '新規登録',
  description: 'Tanaに無料登録して、ブックマーク管理を始めましょう。',
  ogTitle: '新規登録 | Tana',
  ogDescription: 'Tanaに無料登録して、ブックマーク管理を始めましょう。'
})

const { schema, state, loading, onSubmit } = useAuthForm({ mode: 'register' })
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
            :schema="schema"
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
