<script setup lang="ts">
interface Props {
  title: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  confirm: []
}>()

const isOpen = defineModel<boolean>('open', { required: true })

const modalTitle = 'ブックマークを削除'
const modalDescription = computed(() => (
  `「${props.title}」を削除しますか？この操作は取り消せません。`
))

const loading = ref(false)

const handleConfirm = () => {
  if (loading.value) return

  loading.value = true
  emit('confirm')
}

// モーダルが閉じられたらloadingをリセット
watch(isOpen, (open) => {
  if (!open) {
    loading.value = false
  }
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
  >
    <template #content>
      <div class="p-6">
        <div class="flex items-start gap-4">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="size-5 text-red-600"
            />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-highlighted">
              {{ modalTitle }}
            </h3>
            <p class="mt-2 text-sm text-muted">
              {{ modalDescription }}
            </p>
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
