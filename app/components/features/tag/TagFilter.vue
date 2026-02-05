<script setup lang="ts">
import type { TagWithCount } from '~/types'

interface Props {
  tags: TagWithCount[]
}

const props = defineProps<Props>()

const selectedTagIds = defineModel<string[]>({ required: true })

const toggleTag = (tagId: string) => {
  if (selectedTagIds.value.includes(tagId)) {
    selectedTagIds.value = selectedTagIds.value.filter(id => id !== tagId)
  } else {
    selectedTagIds.value = [...selectedTagIds.value, tagId]
  }
}

const isSelected = (tagId: string) => selectedTagIds.value.includes(tagId)
</script>

<template>
  <div
    v-if="props.tags.length > 0"
    class="flex flex-wrap gap-1.5"
  >
    <button
      v-for="tag in props.tags"
      :key="tag.id"
      type="button"
      class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all hover:scale-105"
      :class="isSelected(tag.id) ? 'border-transparent shadow-sm' : 'border-default bg-default text-muted hover:text-highlighted'"
      :style="isSelected(tag.id) ? { backgroundColor: tag.color, color: '#fff' } : undefined"
      @click="toggleTag(tag.id)"
    >
      <span
        v-if="!isSelected(tag.id)"
        class="size-2 rounded-full"
        :style="{ backgroundColor: tag.color }"
      />
      {{ tag.name }}
      <span class="opacity-60">{{ tag.bookmark_count }}</span>
    </button>
  </div>
</template>
