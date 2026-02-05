<script setup lang="ts">
import type { FeedStatus } from '~/types'

interface Props {
  status: FeedStatus
}

const props = defineProps<Props>()

const badgeConfig = computed(() => {
  switch (props.status) {
    case 'active':
      return { label: '有効', color: 'success' as const, icon: 'i-heroicons-check-circle' }
    case 'error':
      return { label: 'エラー', color: 'error' as const, icon: 'i-heroicons-exclamation-triangle' }
    case 'inactive':
    default:
      return { label: '停止中', color: 'neutral' as const, icon: 'i-heroicons-pause-circle' }
  }
})
</script>

<template>
  <UBadge
    :label="badgeConfig.label"
    :color="badgeConfig.color"
    :icon="badgeConfig.icon"
    variant="subtle"
    size="sm"
  />
</template>
