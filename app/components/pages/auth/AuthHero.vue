<script setup lang="ts">
import type { VNode } from 'vue'

interface Props {
  description: string
}

const props = defineProps<Props>()

defineSlots<{
  headline(): VNode[]
}>()
</script>

<template>
  <div class="space-y-6">
    <NuxtLink
      to="/"
      class="text-xl font-bold tracking-tight text-white/60 hover:text-white/80"
    >
      <span class="text-(--tana-accent)">T</span>ana
    </NuxtLink>
    <h1 class="text-4xl font-bold tracking-tight lg:text-5xl">
      <slot name="headline" />
    </h1>
    <p class="text-lg text-white/70">
      {{ props.description }}
    </p>
    <div class="grid gap-4 sm:grid-cols-2">
      <UCard class="bg-white/5 ring-1 ring-white/10">
        <div class="space-y-2">
          <p class="text-sm text-white/60">
            自動で情報取得
          </p>
          <p class="text-base font-semibold">
            URLを入れるだけで完了
          </p>
        </div>
      </UCard>
      <UCard class="bg-white/5 ring-1 ring-white/10">
        <div class="space-y-2">
          <p class="text-sm text-white/60">
            どこからでも
          </p>
          <p class="text-base font-semibold">
            PC・スマホどちらでも使える
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>
