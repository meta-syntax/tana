<script setup lang="ts">
const emit = defineEmits<{
  add: []
}>()

const steps = [
  {
    number: 1,
    icon: 'i-heroicons-link',
    title: 'URLを入力',
    description: 'ブックマークしたいページのURLを入力するだけでOK'
  },
  {
    number: 2,
    icon: 'i-heroicons-sparkles',
    title: 'OGPを自動取得',
    description: 'タイトル・説明・画像を自動で取得します'
  },
  {
    number: 3,
    icon: 'i-heroicons-bookmark',
    title: 'コレクションに保存',
    description: '保存したブックマークは検索・整理できます'
  }
]
</script>

<template>
  <div class="rounded-2xl border border-dashed border-(--tana-border) bg-white p-8 sm:p-12">
    <h3 class="mb-8 text-center text-lg font-semibold text-(--tana-ink)">
      はじめかた
    </h3>

    <div class="mx-auto flex max-w-md flex-col gap-6">
      <div
        v-for="step in steps"
        :key="step.number"
        class="flex items-center gap-4"
      >
        <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-(--tana-accent) text-sm font-bold text-white">
          {{ step.number }}
        </span>
        <div class="flex items-center gap-3">
          <UIcon
            :name="step.icon"
            class="size-5 shrink-0 text-(--tana-accent)"
          />
          <div>
            <p class="font-medium text-(--tana-ink)">
              {{ step.title }}
            </p>
            <p class="text-sm text-gray-500">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 text-center">
      <UButton
        icon="i-heroicons-plus"
        class="bg-(--tana-accent) text-white hover:bg-(--tana-accent-strong)"
        @click="emit('add')"
      >
        最初のブックマークを追加する
      </UButton>
    </div>
  </div>
</template>
