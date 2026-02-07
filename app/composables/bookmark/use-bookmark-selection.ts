export const useBookmarkSelection = () => {
  const selectedIds = ref<Set<string>>(new Set())
  const isSelectionMode = ref(false)

  const selectedCount = computed(() => selectedIds.value.size)
  const hasSelection = computed(() => selectedIds.value.size > 0)

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds.value)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    selectedIds.value = next
  }

  const selectAll = (ids: string[]) => {
    selectedIds.value = new Set(ids)
  }

  const deselectAll = () => {
    selectedIds.value = new Set()
  }

  const isSelected = (id: string) => selectedIds.value.has(id)

  const enterSelectionMode = () => {
    isSelectionMode.value = true
  }

  const exitSelectionMode = () => {
    isSelectionMode.value = false
    selectedIds.value = new Set()
  }

  return {
    selectedIds,
    isSelectionMode,
    selectedCount,
    hasSelection,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,
    enterSelectionMode,
    exitSelectionMode
  }
}
