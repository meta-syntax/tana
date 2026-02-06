export interface TagSuggestion {
  name: string
  tag_id: string | null
  is_existing: boolean
}

export interface SuggestTagsResponse {
  suggestions: TagSuggestion[]
}

export interface SummarizeResponse {
  summary: string
  cached: boolean
}
