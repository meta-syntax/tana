<script setup lang="ts">
import type { VNode } from 'vue'

defineSlots<{
  default(): VNode[]
}>()
</script>

<template>
  <div
    data-layout="auth"
    class="relative min-h-screen overflow-hidden bg-(--tana-ink) text-white"
  >
    <div class="absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_10%,rgba(249,115,22,0.22),transparent_60%)]" />
    <div class="absolute bottom-[-20%] right-[-10%] h-80 w-80 rounded-full bg-white/10 blur-3xl" />

    <slot />
  </div>
</template>
