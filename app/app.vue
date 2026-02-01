<script setup lang="ts">
useHead({
  title: 'Tana - ブックマークを、いつでも取り出せる資産に。',
  meta: [
    { name: 'description', content: '個人向けブックマーク管理Webアプリ。URLの保存・編集・削除に加え、OGP自動取得とサムネイル表示で、見返しやすいコレクションを作れます。' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
  ]
})
</script>

<template>
  <UApp :toaster="{ position: 'top-center' }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
