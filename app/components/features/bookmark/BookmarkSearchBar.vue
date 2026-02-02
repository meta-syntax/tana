<script setup lang="ts">
interface Props {
  isSearching: boolean
  searchResultText: string
}

defineProps<Props>()

const searchQuery = defineModel<string>({ required: true })
</script>

<template>
  <div class="space-y-2">
    <UInput
      v-model="searchQuery"
      placeholder="タイトル、URL、説明文で検索..."
      size="lg"
      :ui="{ base: 'w-full' }"
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
