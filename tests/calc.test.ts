import { describe, it, expect } from 'vitest'
import { planBulkFlip, breakEvenSellPrice } from '../src/lib/calc'

describe('planBulkFlip', () => {
  it('podľa rozpočtu spočíta počet kusov a celkový zisk', () => {
    // buy 4c, sell 10c, rozpočet 20g (200 000c) → 50 000 ks, zisk 4c/ks
    const r = planBulkFlip({ buy: 4, sell: 10, budget: 200_000 })
    expect(r.units).toBe(50_000)
    expect(r.unitProfit).toBe(4)
    expect(r.invested).toBe(200_000)
    expect(r.totalProfit).toBe(200_000)
    expect(r.roiPct).toBe(100)
  })

  it('podľa množstva', () => {
    const r = planBulkFlip({ buy: 100, sell: 200, quantity: 10 })
    expect(r.unitProfit).toBe(70)
    expect(r.units).toBe(10)
    expect(r.invested).toBe(1_000)
    expect(r.totalProfit).toBe(700)
    expect(r.roiPct).toBe(70)
  })

  it('nulová nákupná cena → žiadne kusy ani ROI (žiadny falsy bug)', () => {
    const r = planBulkFlip({ buy: 0, sell: 200, budget: 100_000 })
    expect(r.units).toBe(0)
    expect(r.roiPct).toBe(0)
  })
})

describe('breakEvenSellPrice', () => {
  it('pre lacnú položku zohľadní min. poplatky', () => {
    expect(breakEvenSellPrice(4)).toBe(6)
  })

  it('pre drahšiu položku ~ nákup / 0,85', () => {
    expect(breakEvenSellPrice(100)).toBe(118)
  })

  it('nula → nula', () => {
    expect(breakEvenSellPrice(0)).toBe(0)
  })
})
