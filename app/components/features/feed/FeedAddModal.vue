<script setup lang="ts">
const emit = defineEmits<{
  add: [url: string]
}>()

const isOpen = defineModel<boolean>('open', { required: true })

const url = ref('')
const error = ref('')
const loading = ref(false)

const validate = (): boolean => {
  error.value = ''

  if (!url.value.trim()) {
    error.value = 'URLを入力してください'
    return false
  }

  try {
    const parsed = new URL(url.value.trim())
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      error.value = 'http または https で始まるURLを入力してください'
      return false
    }
  } catch {
    error.value = '有効なURLを入力してください'
    return false
  }

  return true
}

const handleSubmit = () => {
  if (!validate() || loading.value) return
  loading.value = true
  emit('add', url.value.trim())
}

watch(isOpen, (open) => {
  if (!open) {
    url.value = ''
    error.value = ''
    loading.value = false
  }
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="RSSフィードを追加"
    description="RSSフィードのURLを入力してください"
  >
    <template #content>
      <div class="p-6">
        <div class="space-y-4">
          <div class="flex items-start gap-4">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
              <UIcon
                name="i-heroicons-rss"
                class="size-6 text-orange-600"
              />
            </div>
            <div class="flex-1">
              <h3 class="sr-only">
                RSSフィードを追加
              </h3>
              <p class="text-sm text-gray-500">
                RSS/Atomフィードを登録すると、新着記事がブックマークに自動追加されます
              </p>
            </div>
          </div>

          <UFormField
            label="フィードURL"
            :error="error"
          >
            <UInput
              v-model="url"
              placeholder="https://example.com/feed.xml"
              icon="i-heroicons-link"
              class="w-full"
              :disabled="loading"
              @keyup.enter="handleSubmit"
            />
          </UFormField>
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
            :loading="loading"
            :disabled="loading || !url.trim()"
            @click="handleSubmit"
          >
            追加する
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
