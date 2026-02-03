<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl

useHead({
  titleTemplate: (title) => {
    return title ? `${title} | Tana` : 'Tana - ブックマークを、いつでも取り出せる資産に。'
  }
})

useSeoMeta({
  description: '個人向けブックマーク管理Webアプリ。URLの保存・編集・削除に加え、OGP自動取得とサムネイル表示で、見返しやすいコレクションを作れます。',
  ogSiteName: 'Tana',
  ogType: 'website',
  ogImage: `${siteUrl}/og-image.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Tana - 個人向けブックマーク管理アプリ',
  ogLocale: 'ja_JP',
  twitterCard: 'summary_large_image',
  twitterImage: `${siteUrl}/og-image.png`
})
</script>

<template>
  <UApp :toaster="{ position: 'top-center' }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
