<script setup lang="ts">
import type { Bookmark, BookmarkInput, Tag, TagInput, TagSuggestion, TagWithCount } from '~/types'

interface Props {
  bookmark?: Bookmark | null
  tags?: (Tag | TagWithCount)[]
  onCreateTag?: (input: TagInput) => Promise<Tag | null>
}

const props = withDefaults(defineProps<Props>(), {
  bookmark: null,
  tags: () => [],
  onCreateTag: undefined
})

const emit = defineEmits<{
  save: [data: BookmarkInput]
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

// AIタグ提案
const { loading: aiTagLoading, error: aiTagError, suggestions, suggestTags, clearSuggestions } = useAiTagSuggestion()

const canSuggestTags = computed(() =>
  !!(formData.value.title || formData.value.description) && !ogpLoading.value
)

const handleSuggestTags = () => {
  suggestTags(formData.value.title || '', formData.value.description || '')
}

const creatingTagName = ref<string | null>(null)
const createdTagNames = ref<Set<string>>(new Set())

const isSuggestionSelected = (suggestion: TagSuggestion): boolean => {
  const tagIds = formData.value.tag_ids ?? []
  if (suggestion.is_existing && suggestion.tag_id) {
    return tagIds.includes(suggestion.tag_id)
  }
  return createdTagNames.value.has(suggestion.name)
}

const handleSelectSuggestion = async (suggestion: TagSuggestion) => {
  if (isSuggestionSelected(suggestion)) return

  if (suggestion.is_existing && suggestion.tag_id) {
    const currentIds = formData.value.tag_ids ?? []
    if (!currentIds.includes(suggestion.tag_id)) {
      formData.value.tag_ids = [...currentIds, suggestion.tag_id]
    }
  } else if (props.onCreateTag) {
    creatingTagName.value = suggestion.name
    const tag = await props.onCreateTag({ name: suggestion.name, color: '#6366f1' })
    creatingTagName.value = null
    if (tag) {
      createdTagNames.value.add(suggestion.name)
      const currentIds = formData.value.tag_ids ?? []
      if (!currentIds.includes(tag.id)) {
        formData.value.tag_ids = [...currentIds, tag.id]
      }
    }
  }
}

const handleCreateTagFromSelect = async (input: { name: string, color: string }) => {
  if (props.onCreateTag) {
    const tag = await props.onCreateTag(input)
    if (tag) {
      const currentIds = formData.value.tag_ids ?? []
      if (!currentIds.includes(tag.id)) {
        formData.value.tag_ids = [...currentIds, tag.id]
      }
    }
  }
}

// OGP取得完了後のタグ提案ヒント
const showSuggestHint = ref(false)
let suggestHintTimer: ReturnType<typeof setTimeout> | null = null

watch(ogpLoading, (loading, prevLoading) => {
  if (prevLoading && !loading && canSuggestTags.value && suggestions.value.length === 0) {
    showSuggestHint.value = true
    if (suggestHintTimer) clearTimeout(suggestHintTimer)
    suggestHintTimer = setTimeout(() => {
      showSuggestHint.value = false
    }, 5000)
  }
})

const handleSuggestTagsWithHint = () => {
  showSuggestHint.value = false
  if (suggestHintTimer) clearTimeout(suggestHintTimer)
  handleSuggestTags()
}

// モーダルが閉じたら提案をクリア
watch(isOpen, (open) => {
  if (!open) {
    clearSuggestions()
    createdTagNames.value.clear()
    showSuggestHint.value = false
    if (suggestHintTimer) clearTimeout(suggestHintTimer)
  }
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

        <!-- AIタグ提案 -->
        <div>
          <div class="mb-2 flex flex-col gap-1.5">
            <div class="flex items-center gap-2">
              <UButton
                size="xs"
                variant="soft"
                icon="i-heroicons-sparkles"
                :loading="aiTagLoading"
                :disabled="!canSuggestTags"
                :class="{ 'animate-pulse': showSuggestHint }"
                @click="handleSuggestTagsWithHint"
              >
                AIでタグを提案
              </UButton>
              <span
                v-if="aiTagError"
                class="text-xs text-red-500"
              >
                {{ aiTagError }}
              </span>
            </div>
            <Transition
              enter-active-class="transition-opacity duration-300"
              leave-active-class="transition-opacity duration-300"
              enter-from-class="opacity-0"
              leave-to-class="opacity-0"
            >
              <p
                v-if="showSuggestHint"
                class="text-xs text-muted"
              >
                ページ情報を元にタグを提案できます
              </p>
            </Transition>
          </div>

          <!-- 提案結果 -->
          <div
            v-if="suggestions.length > 0"
            class="mb-3 flex flex-wrap gap-1.5"
          >
            <UButton
              v-for="(suggestion, index) in suggestions"
              :key="index"
              size="xs"
              :variant="isSuggestionSelected(suggestion) ? 'solid' : (suggestion.is_existing ? 'soft' : 'outline')"
              :disabled="isSuggestionSelected(suggestion)"
              :loading="creatingTagName === suggestion.name"
              @click="handleSelectSuggestion(suggestion)"
            >
              <template
                v-if="isSuggestionSelected(suggestion)"
                #leading
              >
                <UIcon
                  name="i-heroicons-check"
                  class="size-3"
                />
              </template>
              {{ suggestion.name }}
              <template
                v-if="!suggestion.is_existing && !isSuggestionSelected(suggestion)"
                #trailing
              >
                <span class="text-xs text-muted">(新規)</span>
              </template>
            </UButton>
          </div>
        </div>

        <!-- Tags -->
        <TagSelect
          :model-value="formData.tag_ids ?? []"
          :tags="props.tags"
          @update:model-value="formData.tag_ids = $event"
          @create-tag="handleCreateTagFromSelect"
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
