import type { H3Event } from 'h3'

export const requireRouteParam = (event: H3Event, name: string): string => {
  const value = getRouterParam(event, name)
  if (!value) {
    throw createError({ statusCode: 400, statusMessage: `${name} is required` })
  }
  return value
}
