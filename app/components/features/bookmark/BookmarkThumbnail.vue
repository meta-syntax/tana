<script setup lang="ts">
interface Props {
  url: string
  thumbnailUrl?: string | null
  title: string
}

defineProps<Props>()
</script>

<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    class="block"
  >
    <div class="relative aspect-video overflow-hidden bg-muted">
      <img
        v-if="thumbnailUrl"
        :src="thumbnailUrl"
        :alt="title"
        loading="lazy"
        width="640"
        height="360"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      >
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-linear-to-br from-elevated to-muted"
      >
        <UIcon
          name="i-heroicons-link"
          class="size-12 text-gray-300"
        />
      </div>
    </div>
  </a>
</template>
