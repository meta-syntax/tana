<script setup lang="ts">
interface Props {
  tagName: string
  bookmarkCount: number
}

const props = defineProps<Props>()

const isOpen = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  confirm: []
}>()

const handleConfirm = () => {
  emit('confirm')
  isOpen.value = false
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="タグを削除"
    :description="`「${props.tagName}」を削除しますか？`"
  >
    <template #body>
      <p
        v-if="props.bookmarkCount > 0"
        class="text-sm text-muted"
      >
        このタグは {{ props.bookmarkCount }}件のブックマークに紐付けられています。
        タグを削除してもブックマーク自体は削除されません。
      </p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          @click="isOpen = false"
        >
          キャンセル
        </UButton>
        <UButton
          color="error"
          @click="handleConfirm"
        >
          削除する
        </UButton>
      </div>
    </template>
  </UModal>
</template>
