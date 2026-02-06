<script setup lang="ts">
definePageMeta({
  layout: 'marketing'
})

const runtimeConfig = useRuntimeConfig()

useSeoMeta({
  title: 'Tana - ブックマークを、いつでも取り出せる資産に。',
  ogTitle: 'Tana - ブックマークを、いつでも取り出せる資産に。',
  ogDescription: 'AI搭載の個人向けブックマーク管理アプリ。OGP自動取得、AIによるページ要約・タグ提案、RSSフィード自動収集で、ブックマークを「使える資産」に。',
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
