<script setup lang="ts">
interface Props {
  selectedCount: number
  totalCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select-all': []
  'delete': []
  'cancel': []
}>()

const isAllSelected = computed(() => props.selectedCount === props.totalCount)
</script>

<template>
  <div
    class="fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit items-center gap-3 rounded-xl border border-(--tana-border) bg-default px-4 py-3 shadow-lg backdrop-blur-sm"
  >
    <span
      v-if="selectedCount > 0"
      class="text-sm font-medium text-highlighted"
    >
      {{ selectedCount }}件選択中
    </span>

    <UButton
      v-if="!isAllSelected"
      variant="ghost"
      color="neutral"
      size="sm"
      @click="emit('select-all')"
    >
      すべて選択
    </UButton>

    <UButton
      v-if="selectedCount > 0"
      color="error"
      size="sm"
      icon="i-heroicons-trash"
      @click="emit('delete')"
    >
      削除
    </UButton>

    <UButton
      variant="ghost"
      color="neutral"
      size="sm"
      icon="i-heroicons-x-mark"
      aria-label="選択をキャンセル"
      @click="emit('cancel')"
    />
  </div>
</template>
