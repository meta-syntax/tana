<script setup lang="ts">
interface Props {
  open: boolean
  title: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const modalTitle = 'ブックマークを削除'
const modalDescription = computed(() => (
  `「${props.title}」を削除しますか？この操作は取り消せません。`
))

const handleConfirm = () => {
  isOpen.value = false
  emit('confirm')
}
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
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="size-5 text-red-600"
            />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-(--tana-ink)">
              {{ modalTitle }}
            </h3>
            <p class="mt-2 text-sm text-gray-500">
              {{ modalDescription }}
            </p>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
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
      </div>
    </template>
  </UModal>
</template>
