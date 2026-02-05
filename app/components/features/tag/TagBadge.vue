<script setup lang="ts">
interface Props {
  name: string
  color: string
  removable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  removable: false
})

const emit = defineEmits<{
  remove: []
}>()

// 背景色からコントラスト計算で文字色を白/黒切替
const textColor = computed(() => {
  const hex = props.color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  // YIQ方式
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 150 ? '#000000' : '#ffffff'
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
    :style="{ backgroundColor: props.color, color: textColor }"
  >
    {{ props.name }}
    <button
      v-if="props.removable"
      type="button"
      class="ml-0.5 inline-flex items-center rounded-full p-0.5 hover:opacity-70"
      @click.stop="emit('remove')"
    >
      <UIcon
        name="i-heroicons-x-mark"
        class="size-3"
      />
    </button>
  </span>
</template>
