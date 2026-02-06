export const handleAiError = (e: unknown, fallbackMessage: string): string => {
  if (e && typeof e === 'object' && 'statusCode' in e) {
    const statusCode = (e as { statusCode: number }).statusCode
    if (statusCode === 429) {
      return '本日の利用上限に達しました'
    }
  }
  return fallbackMessage
}
