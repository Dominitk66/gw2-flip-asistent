import { describe, it, expect } from 'vitest'
import { formatCopper, goldToCopper } from '../src/lib/format'

describe('formatCopper', () => {
  it('rozloží medené na zlaté/strieborné/medené', () => {
    expect(formatCopper(12_345)).toBe('1g 23s 45c')
    expect(formatCopper(905)).toBe('9s 5c')
    expect(formatCopper(7)).toBe('7c')
  })

  it('záporné číslo má mínus', () => {
    expect(formatCopper(-250)).toBe('−2s 50c')
  })
})

describe('goldToCopper', () => {
  it('prevedie zlato na medené', () => {
    expect(goldToCopper(200)).toBe(2_000_000)
    expect(goldToCopper('1.5')).toBe(15_000)
    expect(goldToCopper('1,5')).toBe(15_000)
  })

  it('neplatný alebo záporný vstup → 0', () => {
    expect(goldToCopper('abc')).toBe(0)
    expect(goldToCopper(-5)).toBe(0)
  })
})
