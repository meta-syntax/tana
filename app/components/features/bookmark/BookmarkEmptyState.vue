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
  <div class="rounded-2xl border border-dashed border-(--tana-border) bg-white p-12 text-center">
    <!-- 検索結果が0件 -->
    <template v-if="isSearchEmpty">
      <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
        <UIcon
          name="i-heroicons-magnifying-glass"
          class="size-8 text-gray-400"
        />
      </div>
      <h3 class="text-lg font-semibold text-(--tana-ink)">
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
    </template>

    <!-- ブックマークが0件（初期状態） -->
    <template v-else>
      <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-(--tana-accent)/10">
        <UIcon
          name="i-heroicons-bookmark"
          class="size-8 text-(--tana-accent)"
        />
      </div>
      <h3 class="text-lg font-semibold text-(--tana-ink)">
        ブックマークがありません
      </h3>
      <p class="mt-2 text-sm text-gray-500">
        URLを追加して、最初のブックマークを保存しましょう
      </p>
      <UButton
        icon="i-heroicons-plus"
        class="mt-6 bg-(--tana-accent) text-white hover:bg-(--tana-accent-strong)"
        @click="emit('add')"
      >
        最初のブックマークを追加
      </UButton>
    </template>
  </div>
</template>
