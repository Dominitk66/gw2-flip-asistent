/**
 * Denník obchodov — čisté funkcie. Počíta, či reálne zarábaš: z otvorených
 * (kúpené, nepredané) a zatvorených (predané) obchodov spočíta realizovaný
 * zisk po dani. Reuse `netSellRevenue` zo scoring.ts.
 */
import { netSellRevenue } from './scoring.ts'

export type TradeStatus = 'open' | 'closed'

export interface LedgerEntry {
  id: string
  name: string
  /** Nákupná cena za 1 ks (medené). */
  buyPrice: number
  quantity: number
  /** Predajná cena za 1 ks (medené); null = ešte nepredané (otvorené). */
  sellPrice: number | null
  /** ISO dátum vytvorenia. */
  date: string
  status: TradeStatus
}

export interface EntryResult {
  invested: number
  /** Čistý výnos po dani (0 ak otvorené). */
  netRevenue: number
  /** Realizovaný zisk = výnos − investícia (0 ak otvorené). */
  realizedProfit: number
}

export function entryResult(e: LedgerEntry): EntryResult {
  const invested = e.buyPrice * e.quantity
  if (e.status !== 'closed' || e.sellPrice === null) {
    return { invested, netRevenue: 0, realizedProfit: 0 }
  }
  const netRevenue = netSellRevenue(e.sellPrice) * e.quantity
  return { invested, netRevenue, realizedProfit: netRevenue - invested }
}

export interface LedgerTotals {
  /** Celkovo viazaný kapitál (otvorené + zatvorené). */
  invested: number
  /** Realizovaný zisk — len zatvorené obchody, po dani. */
  realizedProfit: number
  /** ROI = realizovaný zisk / investícia do zatvorených. */
  roiPct: number
  openCount: number
  closedCount: number
}

export function ledgerTotals(entries: LedgerEntry[]): LedgerTotals {
  let investedAll = 0
  let investedClosed = 0
  let realizedProfit = 0
  let openCount = 0
  let closedCount = 0

  for (const e of entries) {
    const r = entryResult(e)
    investedAll += r.invested
    if (e.status === 'closed' && e.sellPrice !== null) {
      investedClosed += r.invested
      realizedProfit += r.realizedProfit
      closedCount++
    } else {
      openCount++
    }
  }

  const roiPct = investedClosed > 0 ? (realizedProfit / investedClosed) * 100 : 0
  return { invested: investedAll, realizedProfit, roiPct, openCount, closedCount }
}
