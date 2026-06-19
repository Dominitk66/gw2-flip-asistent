/**
 * Kalkulačka hromadného flipu — čisté funkcie. Pomáha naplánovať nákup väčšieho
 * množstva (najmä lacných položiek): koľko zarobíš, ROI a od akej ceny už nie
 * si v strate. Reuse daňových výpočtov zo scoring.ts (žiadna duplicita).
 */
import { flipProfit, flipMarginPct, netSellRevenue } from './scoring.ts'

export interface BulkFlipInput {
  buy: number
  sell: number
  /** Buď zadáš množstvo… */
  quantity?: number
  /** …alebo rozpočet (v medených) — počet kusov dopočítame. */
  budget?: number
}

export interface BulkFlipResult {
  unitProfit: number
  marginPct: number
  units: number
  invested: number
  totalProfit: number
  roiPct: number
}

export function planBulkFlip(input: BulkFlipInput): BulkFlipResult {
  const unitProfit = flipProfit(input.buy, input.sell)
  const marginPct = flipMarginPct(input.buy, input.sell)

  let units = 0
  if (input.quantity !== undefined) {
    units = Math.max(0, Math.floor(input.quantity))
  } else if (input.budget !== undefined && input.buy > 0) {
    units = Math.max(0, Math.floor(input.budget / input.buy))
  }

  const invested = units * input.buy
  const totalProfit = units * unitProfit
  const roiPct = invested > 0 ? (totalProfit / invested) * 100 : 0

  return { unitProfit, marginPct, units, invested, totalProfit, roiPct }
}

/**
 * Najnižšia celá predajná cena, pri ktorej čistý výnos po dani pokryje nákup
 * (break-even). Pri lacných položkách je vyššia, než by sa zdalo, kvôli
 * minimálnym poplatkom 1 medený.
 */
export function breakEvenSellPrice(buy: number): number {
  if (buy <= 0) return 0
  const cap = buy * 2 + 100 // net ≈ 0,85×sell, takže strop bohato stačí
  for (let sell = buy; sell <= cap; sell++) {
    if (netSellRevenue(sell) >= buy) return sell
  }
  return cap
}
