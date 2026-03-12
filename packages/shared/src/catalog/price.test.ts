import { describe, it, expect } from 'vitest'
import { resolveProductPrice } from './types.js'

describe('resolveProductPrice', () => {
  const product = { base_price: 100, sale_price: null as number | null }

  it('returns base_price when no sale and no variant override', () => {
    expect(resolveProductPrice(product)).toBe(100)
  })

  it('returns sale_price when set', () => {
    expect(resolveProductPrice({ ...product, sale_price: 80 })).toBe(80)
  })

  it('returns variant price_override when set', () => {
    expect(resolveProductPrice(product, { price_override: 90 })).toBe(90)
  })

  it('variant override wins over sale_price', () => {
    expect(resolveProductPrice({ ...product, sale_price: 80 }, { price_override: 75 })).toBe(75)
  })
})
