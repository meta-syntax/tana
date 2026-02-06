import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export const getAnthropicClient = (): Anthropic => {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'ANTHROPIC_API_KEY is not configured'
      })
    }
    client = new Anthropic({ apiKey })
  }
  return client
}

export const extractMessageText = (message: Anthropic.Message): string => {
  const firstBlock = message.content[0]
  return firstBlock && firstBlock.type === 'text' ? firstBlock.text : ''
}
