<script setup lang="ts">
interface Props {
  userEmail?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  signOut: []
}>()
</script>

<template>
  <header class="relative overflow-hidden bg-(--tana-ink) text-white">
    <div class="absolute inset-0 bg-[radial-gradient(800px_circle_at_10%_20%,rgba(249,115,22,0.18),transparent_60%)]" />
    <UContainer class="relative py-8">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-sm text-white/60">
            ようこそ、Tanaへ
          </p>
          <h1 class="text-3xl font-bold lg:text-4xl">
            ダッシュボード
          </h1>
          <p class="text-white/70">
            保存したブックマークを、素早く検索・整理できます。
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <div class="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70">
            {{ props.userEmail }}
          </div>
          <UButton
            variant="ghost"
            class="border border-white/20 text-white hover:bg-white/10"
            @click="emit('signOut')"
          >
            ログアウト
          </UButton>
        </div>
      </div>
    </UContainer>
  </header>
</template>
