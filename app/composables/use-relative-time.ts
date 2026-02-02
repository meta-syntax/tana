import type { Ref, ComputedRef } from 'vue'

/**
 * 相対時間を計算するComposable
 * @param date - 日付の文字列またはRef/ComputedRef
 * @returns relativeTime - 相対時間の文字列, updateRelativeTime - 時間を更新する関数
 */
export function useRelativeTime(date: Ref<string | null | undefined> | ComputedRef<string | null | undefined>) {
  const relativeTime = ref('')

  const updateRelativeTime = () => {
    if (!date.value) {
      relativeTime.value = ''
      return
    }

    const targetDate = new Date(date.value)
    const now = new Date()
    const diffMs = now.getTime() - targetDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 30) {
      relativeTime.value = targetDate.toLocaleDateString('ja-JP')
    } else if (diffDays > 0) {
      relativeTime.value = `${diffDays}日前`
    } else if (diffHours > 0) {
      relativeTime.value = `${diffHours}時間前`
    } else if (diffMinutes > 0) {
      relativeTime.value = `${diffMinutes}分前`
    } else {
      relativeTime.value = 'たった今'
    }
  }

  return {
    relativeTime: readonly(relativeTime),
    updateRelativeTime
  }
}
