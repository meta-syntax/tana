<script setup lang="ts">
import type { CardSize } from '~/types'

interface Props {
  bookmarkId: string
  bookmarkUrl: string
  summary: string | null
  cardSize: CardSize
}

const props = defineProps<Props>()

const { loading, error, summarize } = useAiSummarize()
const localSummary = ref<string | null>(props.summary)
const isExpanded = ref(false)

watch(() => props.summary, (newSummary) => {
  if (newSummary) {
    localSummary.value = newSummary
  }
})

const handleSummarize = async () => {
  const result = await summarize(props.bookmarkId, props.bookmarkUrl)
  if (result) {
    localSummary.value = result
    isExpanded.value = true
  }
}
</script>

<template>
  <!-- large -->
  <div
    v-if="cardSize === 'large'"
    class="mt-2"
    @click.prevent
  >
    <template v-if="localSummary">
      <button
        class="flex items-center gap-1 text-xs text-muted hover:text-highlighted transition-colors"
        @click="isExpanded = !isExpanded"
      >
        <UIcon
          name="i-heroicons-sparkles"
          class="size-3"
        />
        <span>AI要約</span>
        <UIcon
          :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          class="size-3"
        />
      </button>
      <p
        v-if="isExpanded"
        class="mt-1 text-xs text-muted leading-relaxed"
      >
        {{ localSummary }}
      </p>
    </template>
    <template v-else>
      <UButton
        size="xs"
        variant="ghost"
        icon="i-heroicons-sparkles"
        :loading="loading"
        @click="handleSummarize"
      >
        AIで要約
      </UButton>
      <span
        v-if="error"
        class="ml-1 text-xs text-red-500"
      >
        {{ error }}
      </span>
    </template>
  </div>

  <!-- medium -->
  <div
    v-else-if="cardSize === 'medium'"
    class="mt-1.5"
    @click.prevent
  >
    <template v-if="localSummary">
      <button
        class="flex items-center gap-1 text-xs text-muted hover:text-highlighted transition-colors w-full text-left"
        @click="isExpanded = !isExpanded"
      >
        <UIcon
          name="i-heroicons-sparkles"
          class="size-3 shrink-0"
        />
        <span :class="isExpanded ? '' : 'line-clamp-1'">{{ localSummary }}</span>
        <UIcon
          :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          class="size-3 shrink-0"
        />
      </button>
    </template>
    <template v-else>
      <UButton
        size="xs"
        variant="ghost"
        icon="i-heroicons-sparkles"
        :loading="loading"
        @click="handleSummarize"
      >
        AIで要約
      </UButton>
      <span
        v-if="error"
        class="ml-1 text-xs text-red-500"
      >
        {{ error }}
      </span>
    </template>
  </div>

  <!-- small（要約済みのみ表示） -->
  <div
    v-else-if="cardSize === 'small' && localSummary"
    class="mt-1"
    @click.prevent
  >
    <button
      class="flex items-center gap-1 text-xs text-muted hover:text-highlighted transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <UIcon
        name="i-heroicons-sparkles"
        class="size-3.5 shrink-0"
      />
      <UIcon
        :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
        class="size-3"
      />
    </button>
    <p
      v-if="isExpanded"
      class="mt-1 text-xs text-muted leading-relaxed"
    >
      {{ localSummary }}
    </p>
  </div>
</template>
