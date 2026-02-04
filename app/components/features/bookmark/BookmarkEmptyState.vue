<script setup lang="ts">
interface Props {
  type: 'initial' | 'search'
  searchQuery?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: []
  clearSearch: []
}>()

const isSearchEmpty = computed(() => props.type === 'search')
</script>

<template>
  <!-- 検索結果が0件 -->
  <div
    v-if="isSearchEmpty"
    class="rounded-2xl border border-dashed border-(--tana-border) bg-default p-12 text-center"
  >
    <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
      <UIcon
        name="i-heroicons-magnifying-glass"
        class="size-8 text-gray-400"
      />
    </div>
    <h3 class="text-lg font-semibold text-highlighted">
      検索結果がありません
    </h3>
    <p class="mt-2 text-sm text-gray-500">
      「{{ searchQuery }}」に一致するブックマークはありません
    </p>
    <UButton
      variant="outline"
      class="mt-6"
      @click="emit('clearSearch')"
    >
      検索をクリア
    </UButton>
  </div>

  <!-- ブックマークが0件（初期状態）: how-toガイド -->
  <BookmarkHowToGuide
    v-else
    @add="emit('add')"
  />
</template>
