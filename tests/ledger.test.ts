import { describe, it, expect } from 'vitest'
import { entryResult, ledgerTotals, type LedgerEntry } from '../src/lib/ledger'

function entry(p: Partial<LedgerEntry>): LedgerEntry {
  return {
    id: 'x',
    name: 'Test',
    buyPrice: 4,
    quantity: 5_000,
    sellPrice: 10,
    date: '2026-06-20',
    status: 'closed',
    ...p,
  }
}

describe('entryResult', () => {
  it('zatvorený obchod: realizovaný zisk po dani', () => {
    // buy 4c × 5000 = 20000; net(10)=8 × 5000 = 40000; zisk 20000
    const r = entryResult(entry({}))
    expect(r.invested).toBe(20_000)
    expect(r.netRevenue).toBe(40_000)
    expect(r.realizedProfit).toBe(20_000)
  })

  it('otvorený obchod: žiadny realizovaný zisk', () => {
    const r = entryResult(entry({ status: 'open', sellPrice: null }))
    expect(r.invested).toBe(20_000)
    expect(r.netRevenue).toBe(0)
    expect(r.realizedProfit).toBe(0)
  })
})

describe('ledgerTotals', () => {
  it('ráta realizovaný zisk len zo zatvorených; otvorené počíta zvlášť', () => {
    const t = ledgerTotals([
      entry({ id: 'a' }), // zatvorené, zisk 20000, investícia 20000
      entry({ id: 'b', status: 'open', sellPrice: null }), // otvorené, investícia 20000
    ])
    expect(t.realizedProfit).toBe(20_000)
    expect(t.invested).toBe(40_000) // viazaný kapitál spolu
    expect(t.roiPct).toBe(100) // 20000 / 20000 (len zatvorené)
    expect(t.closedCount).toBe(1)
    expect(t.openCount).toBe(1)
  })

  it('prázdny denník → nuly', () => {
    const t = ledgerTotals([])
    expect(t.realizedProfit).toBe(0)
    expect(t.roiPct).toBe(0)
  })
})
