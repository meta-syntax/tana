<script setup lang="ts">
interface Props {
  domain: string
  relativeTime: string
}

defineProps<Props>()
</script>

<template>
  <div class="mt-3 flex items-center justify-between text-xs text-gray-400">
    <span class="flex items-center gap-1">
      <UIcon
        name="i-heroicons-globe-alt"
        class="size-3.5"
      />
      {{ domain }}
    </span>
    <span>{{ relativeTime }}</span>
  </div>
</template>
