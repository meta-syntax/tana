<script setup lang="ts">
import type { VNode } from 'vue'

defineSlots<{
  default(): VNode[]
}>()
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-(--tana-ink) text-white">
    <div class="absolute inset-0 bg-[radial-gradient(1200px_circle_at_15%_15%,rgba(249,115,22,0.28),transparent_60%)]" />
    <div class="absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-[#f97316]/20 blur-3xl" />
    <div class="absolute bottom-[-20%] left-[-10%] h-96 w-96 rounded-full bg-white/10 blur-3xl" />

    <slot />
  </div>
</template>
