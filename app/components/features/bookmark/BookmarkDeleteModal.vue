<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 1
})

const emit = defineEmits<{
  confirm: []
}>()

const isOpen = defineModel<boolean>('open', { required: true })

const isBulk = computed(() => props.count > 1)

const modalTitle = computed(() =>
  isBulk.value ? 'ブックマークを一括削除' : 'ブックマークを削除'
)

// タイトルを50文字に制限
const truncatedTitle = computed(() => {
  return props.title.length > 50
    ? props.title.slice(0, 50) + '...'
    : props.title
})

// アクセシビリティのために必要（画面には表示されない）
const modalDescription = computed(() =>
  isBulk.value
    ? `${props.count}件のブックマークを削除しようとしています。この操作は取り消せません。`
    : `「${truncatedTitle.value}」を削除しようとしています。この操作は取り消せません。`
)

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
    :title="modalTitle"
    :description="modalDescription"
  >
    <template #content>
      <div class="modal-content p-6">
        <div class="flex items-start gap-4">
          <div class="modal-icon flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100">
            <UIcon
              name="i-heroicons-exclamation-circle"
              class="size-6 text-red-600"
            />
          </div>
          <div class="modal-text flex-1 space-y-3">
            <h3 class="sr-only">
              {{ modalTitle }}
            </h3>
            <div class="space-y-2">
              <p class="text-sm text-highlighted">
                <template v-if="isBulk">
                  <span class="font-medium">{{ count }}件</span>のブックマークを削除しますか？
                </template>
                <template v-else>
                  「<span class="font-medium">{{ truncatedTitle }}</span>」を削除しますか？
                </template>
              </p>
              <p class="modal-warning text-sm font-semibold text-red-600">
                ⚠️ この操作は取り消せません。
              </p>
            </div>
          </div>
        </div>
        <div class="modal-actions mt-6 flex justify-end gap-3">
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

<style scoped>
@keyframes fadeInZoom {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes spinIn {
  from {
    opacity: 0;
    transform: rotate(-180deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(1rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInBottom {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content {
  animation: fadeInZoom 0.2s ease-out;
}

.modal-icon {
  animation: spinIn 0.3s ease-out;
}

.modal-text {
  animation: slideInRight 0.3s ease-out;
}

.modal-warning {
  animation: slideInBottom 0.5s ease-out 0.1s both;
}

.modal-actions {
  animation: slideInBottom 0.3s ease-out 0.15s both;
}
</style>
