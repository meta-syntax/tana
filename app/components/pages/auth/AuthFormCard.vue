<script setup lang="ts">
import type { VNode } from 'vue'

interface Props {
  title: string
  footerText: string
  footerLinkTo: string
}

const props = defineProps<Props>()

defineSlots<{
  form(): VNode[]
}>()
</script>

<template>
  <UCard class="border border-white/10 bg-white/95 text-[#111] shadow-2xl">
    <template #header>
      <div class="space-y-2 text-center">
        <NuxtLink
          to="/"
          class="text-xl font-bold tracking-tight text-gray-500 hover:text-gray-700"
        >
          <span class="text-(--tana-accent)">T</span>ana
        </NuxtLink>
        <h2 class="text-3xl font-bold text-[#111]">
          {{ props.title }}
        </h2>
      </div>
    </template>

    <slot name="form" />

    <template #footer>
      <div class="text-center">
        <NuxtLink
          :to="props.footerLinkTo"
          class="text-sm text-gray-500 underline-offset-4 hover:text-gray-700 hover:underline"
        >
          {{ props.footerText }}
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>
