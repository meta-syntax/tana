import { describe, it, expect } from 'vitest'
import { useBookmarkSelection } from './use-bookmark-selection'

describe('useBookmarkSelection', () => {
  it('初期状態: 選択なし・選択モードOFF', () => {
    const { selectedCount, hasSelection, isSelectionMode } = useBookmarkSelection()
    expect(selectedCount.value).toBe(0)
    expect(hasSelection.value).toBe(false)
    expect(isSelectionMode.value).toBe(false)
  })

  it('toggleSelection: 選択の追加と解除', () => {
    const { toggleSelection, isSelected, selectedCount } = useBookmarkSelection()

    toggleSelection('a')
    expect(isSelected('a')).toBe(true)
    expect(selectedCount.value).toBe(1)

    toggleSelection('b')
    expect(selectedCount.value).toBe(2)

    toggleSelection('a')
    expect(isSelected('a')).toBe(false)
    expect(selectedCount.value).toBe(1)
  })

  it('selectAll: 全選択', () => {
    const { selectAll, selectedCount, isSelected } = useBookmarkSelection()

    selectAll(['a', 'b', 'c'])
    expect(selectedCount.value).toBe(3)
    expect(isSelected('a')).toBe(true)
    expect(isSelected('b')).toBe(true)
    expect(isSelected('c')).toBe(true)
  })

  it('deselectAll: 全解除', () => {
    const { selectAll, deselectAll, selectedCount } = useBookmarkSelection()

    selectAll(['a', 'b'])
    deselectAll()
    expect(selectedCount.value).toBe(0)
  })

  it('enterSelectionMode: 選択モードON', () => {
    const { enterSelectionMode, isSelectionMode } = useBookmarkSelection()

    enterSelectionMode()
    expect(isSelectionMode.value).toBe(true)
  })

  it('exitSelectionMode: 選択モードOFF + 選択クリア', () => {
    const { enterSelectionMode, exitSelectionMode, isSelectionMode, toggleSelection, selectedCount } = useBookmarkSelection()

    enterSelectionMode()
    toggleSelection('a')
    toggleSelection('b')

    exitSelectionMode()
    expect(isSelectionMode.value).toBe(false)
    expect(selectedCount.value).toBe(0)
  })
})
