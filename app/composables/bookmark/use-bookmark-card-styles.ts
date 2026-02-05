import type { Ref } from 'vue'
import type { CardSize } from '~/types'

export const useBookmarkCardStyles = (cardSize: Ref<CardSize>, isDraggable?: Ref<boolean>) => {
  const cardClasses = computed(() => {
    const draggable = isDraggable?.value ?? false
    return [
      'group relative overflow-hidden border border-(--tana-border) bg-default',
      draggable
        ? 'transition-[box-shadow,border-color,opacity] duration-300'
        : 'transition-all duration-300',
      cardSize.value === 'large'
        ? draggable
          ? 'rounded-xl hover:shadow-lg'
          : 'rounded-xl hover:-translate-y-1 hover:shadow-lg'
        : 'rounded-lg hover:shadow-md'
    ]
  })

  const thumbnailWrapperClasses = computed(() => ({
    'max-h-64 opacity-100': cardSize.value === 'large',
    'max-h-28 opacity-100': cardSize.value === 'medium',
    'max-h-0 opacity-0': cardSize.value === 'small'
  }))

  const contentClasses = computed(() => ({
    'p-4': cardSize.value === 'large',
    'p-2.5': cardSize.value !== 'large'
  }))

  const titleClasses = computed(() => [
    'font-medium text-highlighted transition-colors hover:text-(--tana-accent)',
    cardSize.value === 'large' ? 'line-clamp-2' : 'line-clamp-1 text-sm'
  ])

  const descriptionClasses = computed(() => ({
    'max-h-20 opacity-100 mt-2': cardSize.value === 'large',
    'max-h-0 opacity-0 mt-0': cardSize.value !== 'large'
  }))

  return {
    cardClasses,
    thumbnailWrapperClasses,
    contentClasses,
    titleClasses,
    descriptionClasses
  }
}
