import { describe, it, expect } from 'vitest'
import {
  formatCopper,
  goldToCopper,
  splitCopper,
  formatCompact,
  parseCoins,
} from '../src/lib/format'

describe('splitCopper', () => {
  it('rozloží medené na g/s/c', () => {
    expect(splitCopper(12_345)).toEqual({ g: 1, s: 23, c: 45, negative: false })
    expect(splitCopper(905)).toEqual({ g: 0, s: 9, c: 5, negative: false })
  })

  it('označí záporné', () => {
    expect(splitCopper(-250)).toEqual({ g: 0, s: 2, c: 50, negative: true })
  })
})

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

describe('formatCompact', () => {
  it('skráti veľké čísla', () => {
    expect(formatCompact(2_400_000)).toBe('2,4M')
    expect(formatCompact(18_000)).toBe('18k')
    expect(formatCompact(540)).toBe('540')
  })
})

describe('parseCoins', () => {
  it('rozparsuje mince s jednotkami', () => {
    expect(parseCoins('1g 50s 20c')).toBe(15_020)
    expect(parseCoins('2s23c')).toBe(223)
    expect(parseCoins('4c')).toBe(4)
  })

  it('holé číslo = medené', () => {
    expect(parseCoins('250')).toBe(250)
  })

  it('prázdne/neplatné → 0', () => {
    expect(parseCoins('')).toBe(0)
    expect(parseCoins('abc')).toBe(0)
  })
})
