<script setup lang="ts">
import type { CardSize } from '~/types'

const { cardSize, setCardSize } = useCardSize()

const sizes: { value: CardSize, icon: string }[] = [
  { value: 'large', icon: 'i-heroicons-squares-2x2' },
  { value: 'medium', icon: 'i-heroicons-queue-list' },
  { value: 'small', icon: 'i-heroicons-list-bullet' }
]
</script>

<template>
  <div class="flex">
    <UButton
      v-for="size in sizes"
      :key="size.value"
      :icon="size.icon"
      :variant="cardSize === size.value ? 'solid' : 'outline'"
      size="lg"
      class="first:rounded-r-none last:rounded-l-none [&:not(:first-child):not(:last-child)]:rounded-none"
      @click="setCardSize(size.value)"
    />
  </div>
</template>
