<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import type { BookmarkSort, PerPage } from '~/types'

interface Props {
  isSearching: boolean
  searchResultText: string
  sort: BookmarkSort
}

const props = defineProps<Props>()

const searchQuery = defineModel<string>({ required: true })

const emit = defineEmits<{
  'update:sort': [sort: BookmarkSort]
}>()

const sortOptions: SelectItem[] = [
  { label: '新しい順', value: 'created_at-desc' },
  { label: '古い順', value: 'created_at-asc' },
  { label: 'タイトル A→Z', value: 'title-asc' },
  { label: 'タイトル Z→A', value: 'title-desc' }
]

const sortValue = computed({
  get: () => `${props.sort.field}-${props.sort.order}`,
  set: (val: string) => {
    const [field, order] = val.split('-') as [BookmarkSort['field'], BookmarkSort['order']]
    emit('update:sort', { field, order })
  }
})

// パーページ
const { perPage, setPerPage } = usePerPage()

const perPageOptions: SelectItem[] = [
  { label: '12件', value: 12 },
  { label: '24件', value: 24 },
  { label: '48件', value: 48 }
]

const perPageValue = computed({
  get: () => perPage.value,
  set: (val: number) => setPerPage(val as PerPage)
})
</script>

<template>
  <div class="space-y-2">
    <div class="flex flex-col gap-2 sm:flex-row">
      <UInput
        v-model="searchQuery"
        placeholder="タイトル、URL、説明文で検索..."
        size="lg"
        class="flex-1"
      >
        <template #leading>
          <div class="flex items-center justify-center">
            <UIcon
              v-if="isSearching"
              name="i-heroicons-arrow-path"
              class="size-5 animate-spin text-gray-400"
            />
            <UIcon
              v-else
              name="i-heroicons-magnifying-glass"
              class="size-5 text-gray-400"
            />
          </div>
        </template>
      </UInput>

      <div class="flex gap-2">
        <USelect
          v-model="sortValue"
          :items="sortOptions"
          size="lg"
          class="w-full sm:w-44"
          icon="i-heroicons-arrows-up-down"
        />

        <USelect
          v-model="perPageValue"
          :items="perPageOptions"
          size="lg"
          class="w-24"
        />

        <BookmarkSizeSwitcher />
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <p
        v-if="searchResultText && !isSearching"
        class="text-sm text-gray-500"
      >
        {{ searchResultText }}
      </p>
    </Transition>
  </div>
</template>
