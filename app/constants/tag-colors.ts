export interface TagColor {
  label: string
  value: string
}

export const TAG_COLORS: TagColor[] = [
  { label: 'レッド', value: '#ef4444' },
  { label: 'オレンジ', value: '#f97316' },
  { label: 'イエロー', value: '#eab308' },
  { label: 'グリーン', value: '#22c55e' },
  { label: 'ティール', value: '#14b8a6' },
  { label: 'ブルー', value: '#3b82f6' },
  { label: 'インディゴ', value: '#6366f1' },
  { label: 'パープル', value: '#a855f7' },
  { label: 'ピンク', value: '#ec4899' },
  { label: 'グレー', value: '#6b7280' }
]

export const DEFAULT_TAG_COLOR = '#3b82f6'
