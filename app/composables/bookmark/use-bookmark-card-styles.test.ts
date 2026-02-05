import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useBookmarkCardStyles } from './use-bookmark-card-styles'
import type { CardSize } from '~/types'

describe('useBookmarkCardStyles', () => {
  describe('cardSize = large', () => {
    const cardSize = ref<CardSize>('large')
    const styles = useBookmarkCardStyles(cardSize)

    it('cardClasses に rounded-xl が含まれる', () => {
      expect(styles.cardClasses.value.join(' ')).toContain('rounded-xl')
    })

    it('thumbnailWrapperClasses に max-h-64 が含まれる', () => {
      expect(styles.thumbnailWrapperClasses.value).toHaveProperty('max-h-64 opacity-100', true)
    })

    it('contentClasses に p-4 が含まれる', () => {
      expect(styles.contentClasses.value).toHaveProperty('p-4', true)
    })

    it('titleClasses に line-clamp-2 が含まれる', () => {
      expect(styles.titleClasses.value.join(' ')).toContain('line-clamp-2')
    })

    it('descriptionClasses に max-h-20 が含まれる', () => {
      expect(styles.descriptionClasses.value).toHaveProperty('max-h-20 opacity-100 mt-2', true)
    })
  })

  describe('cardSize = medium', () => {
    const cardSize = ref<CardSize>('medium')
    const styles = useBookmarkCardStyles(cardSize)

    it('cardClasses に rounded-lg が含まれる', () => {
      expect(styles.cardClasses.value.join(' ')).toContain('rounded-lg')
    })

    it('thumbnailWrapperClasses に max-h-28 が含まれる', () => {
      expect(styles.thumbnailWrapperClasses.value).toHaveProperty('max-h-28 opacity-100', true)
    })

    it('contentClasses に p-2.5 が含まれる', () => {
      expect(styles.contentClasses.value).toHaveProperty('p-2.5', true)
    })

    it('titleClasses に line-clamp-1 が含まれる', () => {
      expect(styles.titleClasses.value.join(' ')).toContain('line-clamp-1')
    })

    it('descriptionClasses に max-h-0 が含まれる', () => {
      expect(styles.descriptionClasses.value).toHaveProperty('max-h-0 opacity-0 mt-0', true)
    })
  })

  describe('cardSize = small', () => {
    const cardSize = ref<CardSize>('small')
    const styles = useBookmarkCardStyles(cardSize)

    it('cardClasses に rounded-lg が含まれる', () => {
      expect(styles.cardClasses.value.join(' ')).toContain('rounded-lg')
    })

    it('thumbnailWrapperClasses に max-h-0 が含まれる', () => {
      expect(styles.thumbnailWrapperClasses.value).toHaveProperty('max-h-0 opacity-0', true)
    })

    it('contentClasses に p-2.5 が含まれる', () => {
      expect(styles.contentClasses.value).toHaveProperty('p-2.5', true)
    })

    it('titleClasses に line-clamp-1 が含まれる', () => {
      expect(styles.titleClasses.value.join(' ')).toContain('line-clamp-1')
    })

    it('descriptionClasses に max-h-0 が含まれる', () => {
      expect(styles.descriptionClasses.value).toHaveProperty('max-h-0 opacity-0 mt-0', true)
    })
  })
})
