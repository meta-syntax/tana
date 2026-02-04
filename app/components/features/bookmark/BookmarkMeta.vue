<script setup lang="ts">
import type { CardSize } from '~/types'

interface Props {
  domain: string
  relativeTime: string
  size?: CardSize
}

withDefaults(defineProps<Props>(), {
  size: 'large'
})
</script>

<template>
  <div
    class="flex items-center text-dimmed transition-all duration-300"
    :class="{
      'mt-3 justify-between text-xs': size === 'large',
      'mt-2 justify-between text-[11px]': size === 'medium',
      'mt-1.5 text-[11px]': size === 'small'
    }"
  >
    <span class="flex items-center gap-1 truncate">
      <UIcon
        name="i-heroicons-globe-alt"
        class="size-3 shrink-0"
        :class="{ 'size-3.5': size === 'large' }"
      />
      <span class="truncate">{{ domain }}</span>
    </span>
    <span
      v-if="size !== 'small'"
      class="shrink-0"
    >
      {{ relativeTime }}
    </span>
  </div>
</template>
