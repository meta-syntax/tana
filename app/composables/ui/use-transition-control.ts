import type { ComputedRef, Ref } from 'vue'

interface UseTransitionControlOptions {
  triggers: Array<Ref | ComputedRef>
  isLoading: Ref<boolean> | ComputedRef<boolean>
}

export const useTransitionControl = (options: UseTransitionControlOptions) => {
  const { triggers, isLoading } = options

  const skipTransition = ref(false)

  watch(triggers, () => {
    skipTransition.value = true
  })

  watch(isLoading, (loading) => {
    if (!loading && skipTransition.value) {
      nextTick(() => {
        skipTransition.value = false
      })
    }
  })

  return {
    skipTransition
  }
}
