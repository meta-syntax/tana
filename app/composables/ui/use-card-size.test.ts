import { describe, it, expect } from 'vitest'
import { useCardSize } from './use-card-size'

describe('useCardSize', () => {
  it('デフォルト値が "large"', () => {
    const { cardSize } = useCardSize()
    expect(cardSize.value).toBe('large')
  })

  it('setCardSize() でサイズ変更', () => {
    const { cardSize, setCardSize } = useCardSize()
    setCardSize('medium')
    expect(cardSize.value).toBe('medium')
    setCardSize('small')
    expect(cardSize.value).toBe('small')
  })

  it('large → 正しいTailwindクラス', () => {
    const { setCardSize, gridClass } = useCardSize()
    setCardSize('large')
    expect(gridClass.value).toContain('sm:grid-cols-2')
    expect(gridClass.value).toContain('lg:grid-cols-3')
  })

  it('medium → 正しいTailwindクラス', () => {
    const { setCardSize, gridClass } = useCardSize()
    setCardSize('medium')
    expect(gridClass.value).toContain('grid-cols-2')
    expect(gridClass.value).toContain('sm:grid-cols-3')
    expect(gridClass.value).toContain('lg:grid-cols-4')
  })

  it('small → 正しいTailwindクラス', () => {
    const { setCardSize, gridClass } = useCardSize()
    setCardSize('small')
    expect(gridClass.value).toContain('grid-cols-2')
    expect(gridClass.value).toContain('xl:grid-cols-5')
  })
})
