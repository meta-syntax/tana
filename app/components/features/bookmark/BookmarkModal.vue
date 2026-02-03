<script setup lang="ts">
import type { Bookmark, BookmarkInput } from '~/types'

interface Props {
  bookmark?: Bookmark | null
}

const props = withDefaults(defineProps<Props>(), {
  bookmark: null
})

const emit = defineEmits<{
  save: [data: BookmarkInput]
}>()

const isOpen = defineModel<boolean>('open', { required: true })

const isEditMode = computed(() => !!props.bookmark)
const modalTitle = computed(() => (
  isEditMode.value ? 'ブックマークを編集' : '新しいブックマーク'
))
const modalDescription = computed(() => (
  isEditMode.value ? 'ブックマークの情報を更新します' : 'URLを入力してブックマークを追加します'
))

// OGP取得
const { loading: ogpLoading, fetchOgp } = useOgp()

// フォームデータ
const formData = ref<BookmarkInput>({
  url: '',
  title: '',
  description: '',
  thumbnail_url: null
})

// バリデーションエラー
const errors = ref<{ url?: string }>({})

// OGP取得済みのURLを追跡（重複取得防止）
const lastFetchedUrl = ref<string | null>(null)

// モーダルが開いたときにフォームを初期化
watch(isOpen, (open) => {
  if (open) {
    if (props.bookmark) {
      formData.value = {
        url: props.bookmark.url,
        title: props.bookmark.title || '',
        description: props.bookmark.description || '',
        thumbnail_url: props.bookmark.thumbnail_url || null
      }
      lastFetchedUrl.value = props.bookmark.url
    } else {
      formData.value = {
        url: '',
        title: '',
        description: '',
        thumbnail_url: null
      }
      lastFetchedUrl.value = null
    }
    errors.value = {}
  } else {
    // モーダルが閉じられたらloadingをリセット
    loading.value = false
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

// OGP自動取得（URL入力のblur時）
const handleUrlBlur = async () => {
  const url = formData.value.url

  // バリデーション
  if (!validateUrl(url)) {
    return
  }

  // 編集モードで既存URLの場合、または既に取得済みの場合はスキップ
  if (url === lastFetchedUrl.value) {
    return
  }

  // OGP情報を取得
  const ogpData = await fetchOgp(url)

  if (ogpData) {
    // タイトルが空の場合のみ自動入力
    if (!formData.value.title && ogpData.title) {
      formData.value.title = ogpData.title
    }
    // 説明が空の場合のみ自動入力
    if (!formData.value.description && ogpData.description) {
      formData.value.description = ogpData.description
    }
    // サムネイルは常に更新
    if (ogpData.image) {
      formData.value.thumbnail_url = ogpData.image
    }
  }

  lastFetchedUrl.value = url
}

// 保存処理
const loading = ref(false)

const handleSubmit = async () => {
  // 既に処理中の場合は何もしない（多重送信防止）
  if (loading.value) {
    return
  }

  if (!validateUrl(formData.value.url)) {
    return
  }

  loading.value = true

  emit('save', {
    url: formData.value.url,
    title: formData.value.title || null,
    description: formData.value.description || null,
    thumbnail_url: formData.value.thumbnail_url || null
  })

  // loadingのリセットは親コンポーネントがモーダルを閉じたときに行われる
}
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
        @submit.prevent="handleSubmit"
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
