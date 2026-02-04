import type { CardSize } from '~/types'

const COOKIE_KEY = 'tana-card-size'

export function useCardSize() {
  const cardSize = useCookie<CardSize>(COOKIE_KEY, { default: () => 'large' })

  const setCardSize = (size: CardSize) => {
    cardSize.value = size
  }

  const gridClass = computed(() => {
    switch (cardSize.value) {
      case 'large':
        return 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-300'
      case 'medium':
        return 'grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 transition-all duration-300'
      case 'small':
        return 'grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 transition-all duration-300'
    }
  })

  return {
    cardSize: readonly(cardSize),
    setCardSize,
    gridClass
  }
}
