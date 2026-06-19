import { describe, it, expect } from 'vitest'
import {
  buildTips,
  estimateDailyVolume,
  opportunityScore,
} from '../src/lib/tips'
import type { ItemPrice } from '../src/lib/gw2Api'

function price(
  id: number,
  buy: number,
  sell: number,
  demand = 1_000,
  supply = 1_000,
): ItemPrice {
  return {
    id,
    whitelisted: true,
    buys: { quantity: demand, unit_price: buy },
    sells: { quantity: supply, unit_price: sell },
  }
}

describe('estimateDailyVolume', () => {
  it('vracia menšiu z dvoch strán (ponuka vs dopyt)', () => {
    expect(estimateDailyVolume(price(1, 10, 20, 777, 1_000))).toBe(777)
    expect(estimateDailyVolume(price(1, 10, 20, 1_000, 300))).toBe(300)
  })
})

describe('opportunityScore', () => {
  it('je nula pri nekladnej marži alebo objeme', () => {
    expect(opportunityScore(0, 1_000)).toBe(0)
    expect(opportunityScore(10, 0)).toBe(0)
  })

  it('rastie s maržou aj s objemom', () => {
    expect(opportunityScore(20, 1_000)).toBeGreaterThan(
      opportunityScore(10, 1_000),
    )
    expect(opportunityScore(10, 10_000)).toBeGreaterThan(
      opportunityScore(10, 100),
    )
  })
})

describe('buildTips', () => {
  it('odfiltruje stratové a málo likvidné položky', () => {
    const prices = [
      price(1, 100, 200, 1_000, 1_000), // veľká marža, likvidné → áno
      price(2, 100, 110, 1_000, 1_000), // daň zožerie rozdiel → nie
      price(3, 100, 200, 5, 1_000), // málo dopytu (pod 100) → nie
    ]
    const ids = buildTips(prices).map((t) => t.id)
    expect(ids).toContain(1)
    expect(ids).not.toContain(2)
    expect(ids).not.toContain(3)
  })

  it('odfiltruje nezmyselne vysokú maržu (manipulácia / mŕtvy listing)', () => {
    // Reálny prípad z trhu: 2 kusy za stovky zlatých, smiešny buy order →
    // margin v miliónoch %. Nesmie sa dostať medzi tipy.
    const tips = buildTips([price(99, 140, 4_000_000, 436, 2)])
    expect(tips).toHaveLength(0)
  })

  it('odfiltruje tenkú ponuku aj pri rozumnej marži', () => {
    // ~53 % marža, ale len 3 kusy v predaji → cena nie je reálna.
    const tips = buildTips([price(98, 100, 180, 5_000, 3)])
    expect(tips).toHaveLength(0)
  })

  it('zoradí podľa skóre a obmedzí počet', () => {
    const prices = [
      price(1, 100, 130, 100, 1_000), // menšia marža (10 %) / objem
      price(2, 100, 230, 10_000, 10_000), // väčšia marža (95 %) + objem → prvé
    ]
    const tips = buildTips(prices, { limit: 1 })
    expect(tips).toHaveLength(1)
    expect(tips[0]?.id).toBe(2)
  })

  it('ignoruje položky s nulovou cenou (žiadny falsy bug)', () => {
    const tips = buildTips([price(1, 0, 200), price(2, 100, 0)])
    expect(tips).toHaveLength(0)
  })
})
