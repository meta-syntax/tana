<script setup lang="ts">
definePageMeta({
  layout: 'marketing'
})
</script>

<template>
  <UContainer class="relative py-16 lg:py-24">
    <HomeNav />

    <div class="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <HomeHero />
      <HomePreviewPanel />
    </div>
  </UContainer>
</template>
