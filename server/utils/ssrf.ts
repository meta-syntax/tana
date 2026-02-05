import { resolve as dnsResolve } from 'node:dns/promises'

// SSRF対策: プライベートIPアドレスの検証
const PRIVATE_IP_PATTERNS = [
  /^127\./, // 127.0.0.0/8
  /^10\./, // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
  /^192\.168\./, // 192.168.0.0/16
  /^169\.254\./, // 169.254.0.0/16 (リンクローカル)
  /^0\./, // 0.0.0.0/8
  /^::1$/, // IPv6 ループバック
  /^fe80:/i, // IPv6 リンクローカル
  /^fc00:/i, // IPv6 ユニークローカル
  /^fd[0-9a-f]{2}:/i // IPv6 ユニークローカル
]

export const isPrivateIp = (ip: string): boolean => {
  return PRIVATE_IP_PATTERNS.some(pattern => pattern.test(ip))
}

export const validateHost = async (hostname: string): Promise<void> => {
  // localhost を直接ブロック
  if (hostname === 'localhost' || hostname === '0.0.0.0') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Access to internal hosts is not allowed'
    })
  }

  // IPアドレスが直接指定されている場合
  if (/^[\d.]+$/.test(hostname) || hostname.includes(':')) {
    if (isPrivateIp(hostname)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Access to internal hosts is not allowed'
      })
    }
    return
  }

  // DNS解決してIPを検証
  try {
    const addresses = await dnsResolve(hostname)
    for (const addr of addresses) {
      if (isPrivateIp(addr)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Access to internal hosts is not allowed'
        })
      }
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to resolve hostname'
    })
  }
}

export const validateUrl = (rawUrl: string): URL => {
  if (!rawUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL is required'
    })
  }

  let targetUrl: URL
  try {
    targetUrl = new URL(rawUrl)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid URL format'
    })
  }

  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only HTTP and HTTPS protocols are allowed'
    })
  }

  return targetUrl
}
