import { describe, it, expect } from 'vitest'
import { rarityColor } from '../src/lib/rarity'

describe('rarityColor', () => {
  it('vráti farbu pre známe vzácnosti', () => {
    expect(rarityColor('Fine')).toBe('#7ab7e0')
    expect(rarityColor('Exotic')).toBe('#ffa84d')
  })

  it('neznáma alebo prázdna → neutrálna svetlá', () => {
    expect(rarityColor('')).toBe('#e8eaed')
    expect(rarityColor(undefined)).toBe('#e8eaed')
    expect(rarityColor('Nieco')).toBe('#e8eaed')
  })
})
