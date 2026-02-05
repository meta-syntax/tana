import { describe, it, expect } from 'vitest'
import { extractHostname } from './display-url'

describe('extractHostname', () => {
  it('正常URL → hostname抽出', () => {
    expect(extractHostname('https://example.com/path')).toBe('example.com')
  })

  it('パス付きURL → hostname のみ', () => {
    expect(extractHostname('https://www.example.com/path/to/page?q=1')).toBe('www.example.com')
  })

  it('http URL も対応', () => {
    expect(extractHostname('http://example.org')).toBe('example.org')
  })

  it('不正URL → そのまま返却', () => {
    expect(extractHostname('not-a-url')).toBe('not-a-url')
  })

  it('空文字 → そのまま返却', () => {
    expect(extractHostname('')).toBe('')
  })
})
