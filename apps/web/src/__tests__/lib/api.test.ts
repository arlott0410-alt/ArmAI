import { describe, it, expect } from 'vitest'
import { getBaseUrl } from '../../lib/api'

describe('getBaseUrl', () => {
  it('returns a non-empty string', () => {
    const base = getBaseUrl()
    expect(typeof base).toBe('string')
    expect(base.length).toBeGreaterThan(0)
  })

  it('returns URL ending with /api', () => {
    const base = getBaseUrl()
    expect(base.endsWith('/api')).toBe(true)
  })

  it('returns same value on multiple calls (stable)', () => {
    expect(getBaseUrl()).toBe(getBaseUrl())
  })
})
