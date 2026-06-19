/**
 * Zostavenie rebríčka flip príležitostí z cien na Trading Post.
 *
 * Čisté funkcie (testovateľné, bežia v Node aj v prehliadači). Zoznam je
 * nezávislý od rozpočtu — konkrétne „kúp X kusov za Y" dopočíta dashboard
 * podľa rozpočtu užívateľa (scoring.ts), keď si tip rozklikne.
 */
import type { ItemPrice } from './gw2Api.ts'
import { flipProfit, flipMarginPct } from './scoring.ts'

export interface TipRow {
  id: number
  name: string
  icon: string
  /** Najvyšší existujúci buy order (sem mieri tvoj nákup). */
  buy: number
  /** Najnižší existujúci sell order (tesne pod tým predávaš). */
  sell: number
  /** Koľko kusov je práve v predaji (ponuka). */
  supply: number
  /** Koľko buy orderov čaká (dopyt) — zatiaľ proxy likvidity. */
  demand: number
  /** Zisk na 1 kus po 15 % dani. */
  unitProfit: number
  marginPct: number
  /** Odhad denného objemu (zatiaľ proxy, kým nemáme históriu). */
  dailyVolumeEstimate: number
  /** Skóre na zoradenie (vyššie = lepšie). */
  score: number
}

export interface BuildTipsOptions {
  minMarginPct?: number
  maxMarginPct?: number
  minDailyVolume?: number
  limit?: number
}

export const DEFAULT_MIN_MARGIN_PCT = 5
/**
 * Strop marže. Reálne flipy majú maržu rádovo jednotky až nízke desiatky %.
 * Marža v stovkách až miliónoch % = takmer isto manipulovaný alebo mŕtvy
 * listing (napr. 1–2 kusy za nezmyselne vysokú cenu). Tým ho odfiltrujeme.
 */
export const DEFAULT_MAX_MARGIN_PCT = 100
/** Min. likvidita = menšia z (ponuka, dopyt). Musí byť dosť na OBOCH stranách. */
export const DEFAULT_MIN_DAILY_VOLUME = 100
export const DEFAULT_TIP_LIMIT = 100

/**
 * Proxy denného objemu, kým sa nenazbiera história: MENŠIA z dvoch strán —
 * ponuka (koľko je v predaji) vs dopyt (koľko buy orderov čaká). Vyžaduje
 * likviditu na oboch stranách, čím odfiltruje tenké/manipulované listingy
 * (napr. 2 kusy za nezmyselnú cenu). Nahradíme reálnym objemom z histórie
 * snímok (neskôr).
 */
export function estimateDailyVolume(price: ItemPrice): number {
  return Math.min(price.buys.quantity, price.sells.quantity)
}

/**
 * Skóre príležitosti (nezávislé od rozpočtu): kombinuje maržu a likviditu.
 * Logaritmus pri objeme bráni tomu, aby pár extrémne likvidných položiek
 * úplne preválcovalo dobré stredne-objemové flipy.
 */
export function opportunityScore(marginPct: number, dailyVolume: number): number {
  if (marginPct <= 0 || dailyVolume <= 0) return 0
  return marginPct * Math.log10(1 + dailyVolume)
}

/**
 * Z cien zostaví zoradený rebríček tipov. Mená/ikony sa doplnia neskôr
 * (zberač ich stiahne len pre víťazov, nie pre celý trh).
 */
export function buildTips(
  prices: ItemPrice[],
  options: BuildTipsOptions = {},
): TipRow[] {
  const minMargin = options.minMarginPct ?? DEFAULT_MIN_MARGIN_PCT
  const maxMargin = options.maxMarginPct ?? DEFAULT_MAX_MARGIN_PCT
  const minVol = options.minDailyVolume ?? DEFAULT_MIN_DAILY_VOLUME
  const limit = options.limit ?? DEFAULT_TIP_LIMIT

  const rows: TipRow[] = []
  for (const p of prices) {
    const buy = p.buys.unit_price
    const sell = p.sells.unit_price
    if (buy <= 0 || sell <= 0) continue

    const marginPct = flipMarginPct(buy, sell)
    // Pod minimom = neoplatí sa; nad maximom = takmer isto manipulácia.
    if (marginPct < minMargin || marginPct > maxMargin) continue

    const dailyVolumeEstimate = estimateDailyVolume(p)
    if (dailyVolumeEstimate < minVol) continue

    rows.push({
      id: p.id,
      name: `#${p.id}`,
      icon: '',
      buy,
      sell,
      supply: p.sells.quantity,
      demand: p.buys.quantity,
      unitProfit: flipProfit(buy, sell),
      marginPct,
      dailyVolumeEstimate,
      score: opportunityScore(marginPct, dailyVolumeEstimate),
    })
  }

  rows.sort((a, b) => b.score - a.score)
  return rows.slice(0, limit)
}
