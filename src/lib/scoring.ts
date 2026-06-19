/**
 * Scoring engine — „mozog" appky.
 *
 * Čisté funkcie (žiadne side-efekty), aby sa dali ľahko testovať a aby bežali
 * rovnako v prehliadači aj v zberači dát. Toto je biznis-kritická logika
 * („peniaze") — preto má najviac testov.
 *
 * MENA: všetko počítame interne v medených (copper), čo je najmenšia jednotka
 * v GW2. 1 zlatý = 100 strieborných = 10 000 medených. Pracujeme s celými
 * číslami (žiadne desatinné peniaze → žiadne zaokrúhľovacie chyby).
 */

/** Koľko medených je 1 zlatý. */
export const COPPER_PER_GOLD = 10_000

/**
 * Daň na Trading Post = spolu 15 %:
 *  - 5 % poplatok za vystavenie (listing) sell ordera,
 *  - 10 % poplatok pri samotnom predaji (exchange).
 * GW2 každý poplatok zaokrúhľuje na celé medené, minimálne 1 medený.
 * (Model je presný na ~1 medený; pre rozhodovanie o flipoch úplne postačuje.)
 */
export const LISTING_FEE_RATE = 0.05
export const EXCHANGE_FEE_RATE = 0.1

/** Poplatok za vystavenie sell ordera (5 %, min. 1 medený). */
export function listingFee(sellPrice: number): number {
  if (sellPrice <= 0) return 0
  return Math.max(1, Math.round(sellPrice * LISTING_FEE_RATE))
}

/** Poplatok pri predaji (10 %, min. 1 medený). */
export function exchangeFee(sellPrice: number): number {
  if (sellPrice <= 0) return 0
  return Math.max(1, Math.round(sellPrice * EXCHANGE_FEE_RATE))
}

/** Koľko ti reálne príde na účet po predaji za danú cenu (po odrátaní daní). */
export function netSellRevenue(sellPrice: number): number {
  if (sellPrice <= 0) return 0
  return sellPrice - listingFee(sellPrice) - exchangeFee(sellPrice)
}

/**
 * Čistý zisk z jedného flipu (1 kus): koľko ti zostane, keď kúpiš za `buyPrice`
 * a predáš za `sellPrice`. Môže byť aj záporný (vtedy to nie je flip).
 */
export function flipProfit(buyPrice: number, sellPrice: number): number {
  return netSellRevenue(sellPrice) - buyPrice
}

/** Marža v % vzhľadom na nákupnú cenu (zisk / nákup × 100). */
export function flipMarginPct(buyPrice: number, sellPrice: number): number {
  if (buyPrice <= 0) return 0
  return (flipProfit(buyPrice, sellPrice) / buyPrice) * 100
}

/**
 * Koľko % denného objemu si trúfneme odkrojiť. Keby si kúpil viac, než sa za
 * deň reálne predá, zásoba ti zamrzne. 25 % je opatrný default — tunable.
 */
export const DEFAULT_VOLUME_SHARE = 0.25

/**
 * Aj ten najlikvidnejší flip má nejaký minimálny čas obrátky (čas, kým sa
 * naplní buy order + kým sa zásoba predá). 0,5 dňa bráni nereálne vysokým
 * skóre pri položkách s obrovským objemom. Tunable.
 */
export const MIN_CYCLE_DAYS = 0.5

export interface AllocationInput {
  /** Dostupný kapitál v medených. */
  budget: number
  /** Za koľko medených kúpiš 1 kus (tvoj buy order). */
  buyPrice: number
  /** Odhad, koľko kusov sa danej položky predá za deň. */
  dailyVolume: number
  /** Koľko % denného objemu si trúfneš (default DEFAULT_VOLUME_SHARE). */
  maxShareOfVolume?: number
}

export interface Allocation {
  /** Koľko kusov kúpiť. */
  units: number
  /** Koľko medených to bude stáť. */
  invested: number
}

/**
 * Koľko kusov kúpiť: menšie z dvoch obmedzení —
 *  1) koľko si môžeš dovoliť za rozpočet,
 *  2) koľko sa reálne predá (podiel z denného objemu).
 * Nikdy nenavrhne kúpiť viac, než sa za deň predá.
 */
export function allocateBudget(input: AllocationInput): Allocation {
  const share = input.maxShareOfVolume ?? DEFAULT_VOLUME_SHARE
  if (input.buyPrice <= 0 || input.budget <= 0 || input.dailyVolume <= 0) {
    return { units: 0, invested: 0 }
  }
  const byBudget = Math.floor(input.budget / input.buyPrice)
  const byVolume = Math.floor(input.dailyVolume * share)
  const units = Math.max(0, Math.min(byBudget, byVolume))
  return { units, invested: units * input.buyPrice }
}

export interface CandidateInput {
  buyPrice: number
  sellPrice: number
  dailyVolume: number
  budget: number
  volumeShare?: number
}

export interface CandidateScore {
  /** Zisk z 1 kusu po dani. */
  unitProfit: number
  /** Marža v %. */
  marginPct: number
  /** Koľko kusov kúpiť (alokácia). */
  units: number
  /** Koľko medených investuješ. */
  invested: number
  /** Odhad, koľko dní trvá predať tvoju zásobu (min. MIN_CYCLE_DAYS). */
  cycleDays: number
  /** Očakávaný zisk za deň pri tvojom rozpočte. */
  expectedDailyProfit: number
  /**
   * HLAVNÁ METRIKA na zoradenie: zisk na 1 vložený medený za deň.
   * Odmeňuje vysokú maržu aj rýchlu obrátku (likviditu) — presne to, čo chceme
   * pri „výhodné, ale efektívne".
   */
  profitPerGoldPerDay: number
}

/**
 * Ohodnotí jednu položku ako flip príležitosť. Výsledné `profitPerGoldPerDay`
 * je číslo, podľa ktorého rebríček zoradíme (vyššie = lepšie).
 */
export function scoreCandidate(c: CandidateInput): CandidateScore {
  const share = c.volumeShare ?? DEFAULT_VOLUME_SHARE
  const unitProfit = flipProfit(c.buyPrice, c.sellPrice)
  const marginPct = flipMarginPct(c.buyPrice, c.sellPrice)

  const { units, invested } = allocateBudget({
    budget: c.budget,
    buyPrice: c.buyPrice,
    dailyVolume: c.dailyVolume,
    maxShareOfVolume: share,
  })

  const sellRatePerDay = c.dailyVolume * share
  // cycleDays = ako dlho predávaš svoju zásobu; floor cez MIN_CYCLE_DAYS, aby
  // ultra-likvidné položky nemali nereálne nekonečnú obrátku.
  const cycleDays =
    units > 0 && sellRatePerDay > 0
      ? Math.max(units / sellRatePerDay, MIN_CYCLE_DAYS)
      : Infinity

  const expectedDailyProfit =
    Number.isFinite(cycleDays) && cycleDays > 0
      ? (units * unitProfit) / cycleDays
      : 0

  const profitPerGoldPerDay = invested > 0 ? expectedDailyProfit / invested : 0

  return {
    unitProfit,
    marginPct,
    units,
    invested,
    cycleDays,
    expectedDailyProfit,
    profitPerGoldPerDay,
  }
}
