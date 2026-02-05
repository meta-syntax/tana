<script setup lang="ts">
import type { Tag } from '~/types'
import { DEFAULT_TAG_COLOR } from '~/constants/tag-colors'

interface Props {
  tags: Tag[]
}

const props = defineProps<Props>()

const selectedTagIds = defineModel<string[]>({ required: true })

const emit = defineEmits<{
  'create-tag': [input: { name: string, color: string }]
}>()

// InputMenu用アイテム
const tagItems = computed(() =>
  props.tags.map(tag => ({
    label: tag.name,
    value: tag.id,
    icon: 'i-heroicons-tag'
  }))
)

// 新規タグ作成ハンドラ
const handleCreate = (name: string) => {
  emit('create-tag', { name, color: DEFAULT_TAG_COLOR })
}
</script>

<template>
  <div>
    <label class="mb-1.5 block text-sm font-medium text-highlighted">
      タグ
    </label>
    <UInputMenu
      v-model="selectedTagIds"
      :items="tagItems"
      multiple
      value-key="value"
      placeholder="タグを選択または作成..."
      :create-item="{ position: 'bottom', when: 'always' }"
      size="lg"
      icon="i-heroicons-tag"
      @create="handleCreate"
    />
  </div>
</template>
