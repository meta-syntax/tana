<script setup lang="ts">
import type { Bookmark, BookmarkInput } from '~/types'

interface Props {
  open: boolean
  bookmark?: Bookmark | null
}

const props = withDefaults(defineProps<Props>(), {
  bookmark: null
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [data: BookmarkInput]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const isEditMode = computed(() => !!props.bookmark)
const modalTitle = computed(() => (
  isEditMode.value ? 'ブックマークを編集' : '新しいブックマーク'
))
const modalDescription = computed(() => (
  isEditMode.value ? 'ブックマークの情報を更新します' : 'URLを入力してブックマークを追加します'
))

// フォームデータ
const formData = ref<BookmarkInput>({
  url: '',
  title: '',
  description: ''
})

// バリデーションエラー
const errors = ref<{ url?: string }>({})

// モーダルが開いたときにフォームを初期化
watch(() => props.open, (open) => {
  if (open) {
    if (props.bookmark) {
      formData.value = {
        url: props.bookmark.url,
        title: props.bookmark.title || '',
        description: props.bookmark.description || ''
      }
    } else {
      formData.value = {
        url: '',
        title: '',
        description: ''
      }
    }
    errors.value = {}
  }
})

// URL バリデーション
const validateUrl = (url: string): boolean => {
  if (!url.trim()) {
    errors.value.url = 'URLを入力してください'
    return false
  }

  try {
    new URL(url)
    errors.value.url = undefined
    return true
  } catch {
    errors.value.url = '有効なURLを入力してください'
    return false
  }
}

// 保存処理
const loading = ref(false)

const handleSubmit = async () => {
  if (!validateUrl(formData.value.url)) {
    return
  }

  loading.value = true

  try {
    emit('save', {
      url: formData.value.url,
      title: formData.value.title || null,
      description: formData.value.description || null
    })
  } finally {
    loading.value = false
  }
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
        <!-- ヘッダー -->
        <div class="mb-6">
          <h2 class="text-xl font-bold text-(--tana-ink)">
            {{ isEditMode ? 'ブックマークを編集' : '新しいブックマーク' }}
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            {{ isEditMode ? 'ブックマークの情報を更新します' : 'URLを入力してブックマークを追加します' }}
          </p>
        </div>

        <!-- フォーム -->
        <form
          class="space-y-5"
          @submit.prevent="handleSubmit"
        >
          <!-- URL -->
          <div>
            <label
              for="url"
              class="mb-1.5 block text-sm font-medium text-(--tana-ink)"
            >
              URL <span class="text-red-500">*</span>
            </label>
            <UInput
              id="url"
              v-model="formData.url"
              placeholder="https://example.com"
              size="lg"
              :color="errors.url ? 'error' : undefined"
              @blur="validateUrl(formData.url)"
            />
            <p
              v-if="errors.url"
              class="mt-1.5 text-sm text-red-500"
            >
              {{ errors.url }}
            </p>
          </div>

          <!-- Title -->
          <div>
            <label
              for="title"
              class="mb-1.5 block text-sm font-medium text-(--tana-ink)"
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
              class="mb-1.5 block text-sm font-medium text-(--tana-ink)"
            >
              説明
            </label>
            <UTextarea
              id="description"
              v-model="formData.description"
              placeholder="メモや説明を追加..."
              :rows="3"
            />
          </div>

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
              class="bg-(--tana-accent) text-white hover:bg-(--tana-accent-strong)"
            >
              {{ isEditMode ? '更新する' : '追加する' }}
            </UButton>
          </div>
        </form>
      </div>
    </template>
  </UModal>
</template>
