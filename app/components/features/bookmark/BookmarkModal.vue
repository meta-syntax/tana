<script setup lang="ts">
import type { Bookmark, Tag, TagWithCount } from '~/types'

interface Props {
  bookmark?: Bookmark | null
  tags?: (Tag | TagWithCount)[]
}

const props = withDefaults(defineProps<Props>(), {
  bookmark: null,
  tags: () => []
})

const emit = defineEmits<{
  'save': [data: import('~/types').BookmarkInput]
  'create-tag': [input: { name: string, color: string }]
}>()

const isOpen = defineModel<boolean>('open', { required: true })

const modalTitle = computed(() => (
  isEditMode.value ? 'ブックマークを編集' : '新しいブックマーク'
))
const modalDescription = computed(() => (
  isEditMode.value ? 'ブックマークの情報を更新します' : 'URLを入力してブックマークを追加します'
))

const {
  formData, errors, isEditMode, ogpLoading, loading,
  handleUrlBlur, handleSubmit
} = useBookmarkForm({
  bookmark: toRef(props, 'bookmark'),
  isOpen
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="modalTitle"
    :description="modalDescription"
  >
    <template #body>
      <!-- フォーム -->
      <form
        class="space-y-5"
        @submit.prevent="handleSubmit((data) => emit('save', data))"
      >
        <!-- URL -->
        <div>
          <label
            for="url"
            class="mb-1.5 block text-sm font-medium text-highlighted"
          >
            URL <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <UInput
              id="url"
              v-model="formData.url"
              placeholder="https://example.com"
              size="lg"
              :color="errors.url ? 'error' : undefined"
              @blur="handleUrlBlur"
            />
            <!-- OGP取得中インジケーター -->
            <div
              v-if="ogpLoading"
              class="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <UIcon
                name="i-heroicons-arrow-path"
                class="size-5 animate-spin text-gray-400"
              />
            </div>
          </div>
          <p
            v-if="errors.url"
            class="mt-1.5 text-sm text-red-500"
          >
            {{ errors.url }}
          </p>
          <p
            v-else-if="ogpLoading"
            class="mt-1.5 text-sm text-muted"
          >
            ページ情報を取得中...
          </p>
        </div>

        <!-- サムネイルプレビュー -->
        <div
          v-if="formData.thumbnail_url"
          class="overflow-hidden rounded-lg border border-default"
        >
          <img
            :src="formData.thumbnail_url"
            alt="サムネイルプレビュー"
            class="h-40 w-full object-cover"
            @error="formData.thumbnail_url = null"
          >
        </div>

        <!-- Title -->
        <div>
          <label
            for="title"
            class="mb-1.5 block text-sm font-medium text-highlighted"
          >
            タイトル
          </label>
          <UInput
            id="title"
            v-model="formData.title"
            placeholder="ページのタイトル（空欄の場合はURLが表示されます）"
            size="lg"
          />
        </div>

        <!-- Description -->
        <div>
          <label
            for="description"
            class="mb-1.5 block text-sm font-medium text-highlighted"
          >
            説明
          </label>
          <UTextarea
            id="description"
            v-model="formData.description"
            placeholder="メモや説明を追加..."
            size="lg"
            :rows="3"
          />
        </div>

        <!-- Tags -->
        <TagSelect
          :model-value="formData.tag_ids ?? []"
          :tags="props.tags"
          @update:model-value="formData.tag_ids = $event"
          @create-tag="emit('create-tag', $event)"
        />

        <!-- アクションボタン -->
        <div class="flex justify-end gap-3 pt-2">
          <UButton
            type="button"
            variant="ghost"
            color="neutral"
            @click="isOpen = false"
          >
            キャンセル
          </UButton>
          <UButton
            type="submit"
            :loading="loading"
            :disabled="ogpLoading"
            class="bg-(--tana-accent) text-white hover:bg-(--tana-accent-strong)"
          >
            {{ isEditMode ? '更新する' : '追加する' }}
          </UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>
