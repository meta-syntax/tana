import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockCreateError = vi.fn((opts: { statusCode: number, statusMessage: string }) => {
  const error = new Error(opts.statusMessage) as Error & { statusCode: number, statusMessage: string }
  error.statusCode = opts.statusCode
  error.statusMessage = opts.statusMessage
  return error
})

vi.stubGlobal('createError', mockCreateError)

const mockDnsResolve = vi.fn()
vi.mock('node:dns/promises', () => ({
  default: { resolve: (...args: unknown[]) => mockDnsResolve(...args) },
  resolve: (...args: unknown[]) => mockDnsResolve(...args)
}))

describe('isPrivateIp', () => {
  let isPrivateIp: (ip: string) => boolean

  beforeEach(async () => {
    const mod = await import('./ssrf')
    isPrivateIp = mod.isPrivateIp
  })

  it.each([
    ['127.0.0.1', true],
    ['127.255.255.255', true],
    ['10.0.0.1', true],
    ['10.255.255.255', true],
    ['172.16.0.1', true],
    ['172.31.255.255', true],
    ['192.168.0.1', true],
    ['192.168.255.255', true],
    ['169.254.1.1', true],
    ['0.0.0.0', true],
    ['::1', true],
    ['fe80::1', true],
    ['fc00::1', true],
    ['fd12::1', true]
  ])('%s はプライベートIP (true)', (ip, expected) => {
    expect(isPrivateIp(ip)).toBe(expected)
  })

  it.each([
    ['8.8.8.8', false],
    ['93.184.216.34', false],
    ['172.32.0.1', false],
    ['192.167.1.1', false],
    ['11.0.0.1', false]
  ])('%s はパブリックIP (false)', (ip, expected) => {
    expect(isPrivateIp(ip)).toBe(expected)
  })
})

describe('validateHost', () => {
  let validateHost: (hostname: string) => Promise<void>

  beforeEach(async () => {
    mockDnsResolve.mockReset()
    const mod = await import('./ssrf')
    validateHost = mod.validateHost
  })

  it('localhost をブロックする', async () => {
    expect(validateHost('localhost')).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Access to internal hosts is not allowed'
    })
  })

  it('0.0.0.0 をブロックする', async () => {
    expect(validateHost('0.0.0.0')).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Access to internal hosts is not allowed'
    })
  })

  it('プライベートIPを直接指定した場合ブロックする', async () => {
    expect(validateHost('192.168.1.1')).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Access to internal hosts is not allowed'
    })
  })

  it('パブリックIPを直接指定した場合は通過する', async () => {
    await expect(validateHost('93.184.216.34')).resolves.toBeUndefined()
  })

  it('DNS解決結果がプライベートIPの場合ブロックする', async () => {
    mockDnsResolve.mockResolvedValue(['192.168.0.1'])

    expect(validateHost('evil.example.com')).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Access to internal hosts is not allowed'
    })
  })

  it('DNS解決結果がパブリックIPの場合は通過する', async () => {
    mockDnsResolve.mockResolvedValue(['93.184.216.34'])

    await expect(validateHost('example.com')).resolves.toBeUndefined()
  })

  it('DNS解決に失敗した場合エラーを投げる', async () => {
    mockDnsResolve.mockRejectedValue(new Error('ENOTFOUND'))

    expect(validateHost('nonexistent.example.com')).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Failed to resolve hostname'
    })
  })
})

describe('validateUrl', () => {
  let validateUrl: (rawUrl: string) => URL

  beforeEach(async () => {
    const mod = await import('./ssrf')
    validateUrl = mod.validateUrl
  })

  it('空文字列の場合エラーを投げる', () => {
    expect(() => validateUrl('')).toThrow()
  })

  it('無効なURL形式の場合エラーを投げる', () => {
    expect(() => validateUrl('not-a-url')).toThrow()
    try {
      validateUrl('not-a-url')
    } catch (e: any) {
      expect(e.statusMessage).toBe('Invalid URL format')
    }
  })

  it('ftpプロトコルの場合エラーを投げる', () => {
    expect(() => validateUrl('ftp://example.com/file')).toThrow()
    try {
      validateUrl('ftp://example.com/file')
    } catch (e: any) {
      expect(e.statusMessage).toBe('Only HTTP and HTTPS protocols are allowed')
    }
  })

  it('HTTPSのURLを正常にパースする', () => {
    const result = validateUrl('https://example.com/path')
    expect(result).toBeInstanceOf(URL)
    expect(result.hostname).toBe('example.com')
  })

  it('HTTPのURLを正常にパースする', () => {
    const result = validateUrl('http://example.com/path')
    expect(result).toBeInstanceOf(URL)
    expect(result.protocol).toBe('http:')
  })
})
