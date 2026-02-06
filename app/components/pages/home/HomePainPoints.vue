<script setup lang="ts">
const painPoints = [
  {
    icon: 'i-heroicons-bookmark-slash',
    title: '保存したのに見つからない',
    description: 'ブラウザのブックマークに埋もれて、いざ必要なときに出てこない。'
  },
  {
    icon: 'i-heroicons-clock',
    title: '「あとで読む」が溜まる一方',
    description: 'タブを開きっぱなし、メモに貼りっぱなし。結局読まないまま忘れてしまう。'
  },
  {
    icon: 'i-heroicons-tag',
    title: '整理が面倒で放置してしまう',
    description: 'フォルダ分けやタグ付けは手間がかかる。気づけば「未分類」が山積みに。'
  },
  {
    icon: 'i-heroicons-question-mark-circle',
    title: '開いてみるまで中身がわからない',
    description: 'タイトルだけのブックマーク一覧。一つずつ開かないと何のページだったか思い出せない。'
  }
]
</script>

<template>
  <section class="space-y-8">
    <div class="space-y-3 text-center">
      <h2 class="text-3xl font-bold tracking-tight lg:text-4xl">
        こんな経験、ありませんか？
      </h2>
      <p class="text-white/60">
        ブックマーク管理の「あるある」
      </p>
    </div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <UCard
        v-for="point in painPoints"
        :key="point.title"
        class="bg-white/5 ring-1 ring-white/10"
      >
        <div class="space-y-3">
          <UIcon
            :name="point.icon"
            class="size-8 text-(--tana-accent)"
          />
          <p class="text-lg font-semibold">
            {{ point.title }}
          </p>
          <p class="text-sm text-white/60">
            {{ point.description }}
          </p>
        </div>
      </UCard>
    </div>
  </section>
</template>
