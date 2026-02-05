import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useRelativeTime } from './use-relative-time'

describe('useRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('null → 空文字列', () => {
    const date = ref<string | null>(null)
    const { relativeTime, updateRelativeTime } = useRelativeTime(date)
    updateRelativeTime()
    expect(relativeTime.value).toBe('')
  })

  it('undefined → 空文字列', () => {
    const date = ref<string | undefined>(undefined)
    const { relativeTime, updateRelativeTime } = useRelativeTime(date)
    updateRelativeTime()
    expect(relativeTime.value).toBe('')
  })

  it('0分以内 → "たった今"', () => {
    const date = ref('2025-01-15T12:00:00Z')
    const { relativeTime, updateRelativeTime } = useRelativeTime(date)
    updateRelativeTime()
    expect(relativeTime.value).toBe('たった今')
  })

  it('1〜59分 → "X分前"', () => {
    const date = ref('2025-01-15T11:30:00Z')
    const { relativeTime, updateRelativeTime } = useRelativeTime(date)
    updateRelativeTime()
    expect(relativeTime.value).toBe('30分前')
  })

  it('1〜23時間 → "X時間前"', () => {
    const date = ref('2025-01-15T06:00:00Z')
    const { relativeTime, updateRelativeTime } = useRelativeTime(date)
    updateRelativeTime()
    expect(relativeTime.value).toBe('6時間前')
  })

  it('1〜30日 → "X日前"', () => {
    const date = ref('2025-01-10T12:00:00Z')
    const { relativeTime, updateRelativeTime } = useRelativeTime(date)
    updateRelativeTime()
    expect(relativeTime.value).toBe('5日前')
  })

  it('31日以上 → toLocaleDateString("ja-JP") 形式', () => {
    const date = ref('2024-11-01T00:00:00Z')
    const { relativeTime, updateRelativeTime } = useRelativeTime(date)
    updateRelativeTime()
    const expected = new Date('2024-11-01T00:00:00Z').toLocaleDateString('ja-JP')
    expect(relativeTime.value).toBe(expected)
  })

  it('dateのref変更後に updateRelativeTime() で更新される', () => {
    const date = ref('2025-01-15T12:00:00Z')
    const { relativeTime, updateRelativeTime } = useRelativeTime(date)
    updateRelativeTime()
    expect(relativeTime.value).toBe('たった今')

    date.value = '2025-01-15T09:00:00Z'
    updateRelativeTime()
    expect(relativeTime.value).toBe('3時間前')
  })
})
