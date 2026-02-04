<script setup lang="ts">
definePageMeta({
  layout: 'marketing'
})

const runtimeConfig = useRuntimeConfig()

useSeoMeta({
  title: 'Tana - ブックマークを、いつでも取り出せる資産に。',
  ogTitle: 'Tana - ブックマークを、いつでも取り出せる資産に。',
  ogDescription: '個人向けブックマーク管理Webアプリ。URLの保存・編集・削除に加え、OGP自動取得とサムネイル表示で、見返しやすいコレクションを作れます。',
  ogUrl: runtimeConfig.public.siteUrl
})

useHead({ titleTemplate: '' })
</script>

<template>
  <UContainer class="relative py-16 lg:py-24">
    <HomeNav />

    <div class="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <HomeHero />
      <HomePreviewPanel />
    </div>

    <div class="mt-24 space-y-24 lg:mt-32 lg:space-y-32">
      <HomePainPoints />
      <HomeSolution />
      <HomeCta />
    </div>
  </UContainer>
</template>
