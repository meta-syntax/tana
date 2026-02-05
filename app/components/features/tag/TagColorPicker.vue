<script setup lang="ts">
import { TAG_COLORS } from '~/constants/tag-colors'

const color = defineModel<string>({ required: true })
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="tagColor in TAG_COLORS"
      :key="tagColor.value"
      type="button"
      class="size-7 rounded-full border-2 transition-all hover:scale-110"
      :class="color === tagColor.value ? 'border-highlighted shadow-sm' : 'border-transparent'"
      :style="{ backgroundColor: tagColor.value }"
      :title="tagColor.label"
      @click="color = tagColor.value"
    />
  </div>
</template>
