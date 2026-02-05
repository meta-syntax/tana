import type { Ref } from 'vue'
import type { Bookmark, BookmarkInput } from '~/types'

interface UseBookmarkFormOptions {
  bookmark: Ref<Bookmark | null | undefined>
  isOpen: Ref<boolean>
}

export const useBookmarkForm = (options: UseBookmarkFormOptions) => {
  const { bookmark, isOpen } = options

  const { loading: ogpLoading, fetchOgp } = useOgp()

  const isEditMode = computed(() => !!bookmark.value)

  const formData = ref<BookmarkInput>({
    url: '',
    title: '',
    description: '',
    thumbnail_url: null,
    tag_ids: []
  })

  const errors = ref<{ url?: string }>({})

  const lastFetchedUrl = ref<string | null>(null)

  const loading = ref(false)

  // モーダルが開いたときにフォームを初期化
  watch(isOpen, (open) => {
    if (open) {
      if (bookmark.value) {
        formData.value = {
          url: bookmark.value.url,
          title: bookmark.value.title || '',
          description: bookmark.value.description || '',
          thumbnail_url: bookmark.value.thumbnail_url || null,
          tag_ids: (bookmark.value.tags ?? []).map(t => t.id)
        }
        lastFetchedUrl.value = bookmark.value.url
      } else {
        formData.value = {
          url: '',
          title: '',
          description: '',
          thumbnail_url: null,
          tag_ids: []
        }
        lastFetchedUrl.value = null
      }
      errors.value = {}
    } else {
      loading.value = false
    }
  })

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

  const handleUrlBlur = async () => {
    const url = formData.value.url

    if (!validateUrl(url)) {
      return
    }

    if (url === lastFetchedUrl.value) {
      return
    }

    const ogpData = await fetchOgp(url)

    if (ogpData) {
      if (!formData.value.title && ogpData.title) {
        formData.value.title = ogpData.title
      }
      if (!formData.value.description && ogpData.description) {
        formData.value.description = ogpData.description
      }
      if (ogpData.image) {
        formData.value.thumbnail_url = ogpData.image
      }
    }

    lastFetchedUrl.value = url
  }

  const handleSubmit = (onSave: (data: BookmarkInput) => void) => {
    if (loading.value) {
      return
    }

    if (!validateUrl(formData.value.url)) {
      return
    }

    loading.value = true

    onSave({
      url: formData.value.url,
      title: formData.value.title || null,
      description: formData.value.description || null,
      thumbnail_url: formData.value.thumbnail_url || null,
      tag_ids: formData.value.tag_ids ?? []
    })
  }

  return {
    formData,
    errors,
    isEditMode,
    ogpLoading,
    loading,
    handleUrlBlur,
    handleSubmit
  }
}
