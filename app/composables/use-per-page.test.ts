import { describe, it, expect } from 'vitest'
import { usePerPage } from './use-per-page'

describe('usePerPage', () => {
  it('デフォルト値が 12', () => {
    const { perPage } = usePerPage()
    expect(perPage.value).toBe(12)
  })

  it('setPerPage() で 24 に変更可能', () => {
    const { perPage, setPerPage } = usePerPage()
    setPerPage(24)
    expect(perPage.value).toBe(24)
  })

  it('setPerPage() で 48 に変更可能', () => {
    const { perPage, setPerPage } = usePerPage()
    setPerPage(48)
    expect(perPage.value).toBe(48)
  })
})
