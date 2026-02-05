<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error.statusCode === 404)

const title = computed(() =>
  is404.value ? 'ページが見つかりません' : 'エラーが発生しました'
)

const description = computed(() =>
  is404.value
    ? 'お探しのページは存在しないか、移動された可能性があります。'
    : 'サーバーでエラーが発生しました。しばらくしてからもう一度お試しください。'
)

const handleClearError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-default px-4">
    <div class="text-center">
      <p class="text-6xl font-bold text-muted">
        {{ error.statusCode }}
      </p>
      <h1 class="mt-4 text-2xl font-semibold text-highlighted">
        {{ title }}
      </h1>
      <p class="mt-2 text-muted">
        {{ description }}
      </p>
      <div class="mt-8">
        <UButton
          size="lg"
          class="bg-(--tana-accent) text-white hover:bg-(--tana-accent-strong)"
          @click="handleClearError"
        >
          ホームに戻る
        </UButton>
      </div>
    </div>
  </div>
</template>
