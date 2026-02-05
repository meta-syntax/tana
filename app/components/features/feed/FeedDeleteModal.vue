<script setup lang="ts">
interface Props {
  title: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  confirm: []
}>()

const isOpen = defineModel<boolean>('open', { required: true })

const modalTitle = 'フィードを削除'

const truncatedTitle = computed(() => {
  return props.title.length > 50
    ? props.title.slice(0, 50) + '...'
    : props.title
})

const modalDescription = computed(() =>
  `「${truncatedTitle.value}」を削除しようとしています。`
)

const loading = ref(false)

const handleConfirm = () => {
  if (loading.value) return
  loading.value = true
  emit('confirm')
}

watch(isOpen, (open) => {
  if (!open) {
    loading.value = false
  }
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="modalTitle"
    :description="modalDescription"
  >
    <template #content>
      <div class="p-6">
        <div class="flex items-start gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100">
            <UIcon
              name="i-heroicons-exclamation-circle"
              class="size-6 text-red-600"
            />
          </div>
          <div class="flex-1 space-y-3">
            <h3 class="sr-only">
              {{ modalTitle }}
            </h3>
            <div class="space-y-2">
              <p class="text-sm text-highlighted">
                「<span class="font-medium">{{ truncatedTitle }}</span>」を削除しますか？
              </p>
              <p class="text-sm text-gray-500">
                フィードを削除しても、既に追加されたブックマークはそのまま残ります。
              </p>
            </div>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <UButton
            variant="ghost"
            color="neutral"
            :disabled="loading"
            @click="isOpen = false"
          >
            キャンセル
          </UButton>
          <UButton
            color="error"
            :loading="loading"
            :disabled="loading"
            @click="handleConfirm"
          >
            削除する
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
