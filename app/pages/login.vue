<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

useSeoMeta({
  title: 'ログイン',
  description: 'Tanaにログインして、保存したブックマークを管理しましょう。',
  ogTitle: 'ログイン | Tana',
  ogDescription: 'Tanaにログインして、保存したブックマークを管理しましょう。'
})

const { schema, state, loading, onSubmit } = useAuthForm({ mode: 'login' })
</script>

<template>
  <UContainer class="relative flex min-h-[80vh] items-center justify-center py-16 lg:py-24">
    <div class="w-full max-w-105">
      <AuthFormCard
        title="ログイン"
        footer-text="アカウントをお持ちでない方はこちら"
        footer-link-to="/register"
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
              ログインして続ける
            </UButton>
          </UForm>
        </template>
      </AuthFormCard>
    </div>
  </UContainer>
</template>
