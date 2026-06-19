import { describe, it, expect } from 'vitest'
import {
  listingFee,
  exchangeFee,
  netSellRevenue,
  flipProfit,
  flipMarginPct,
  allocateBudget,
  scoreCandidate,
} from '../src/lib/scoring'

// Biznis-kritické testy („peniaze") — viď CLAUDE.md, priorita 1.

describe('dane na Trading Post (15 %)', () => {
  it('netSellRevenue odráta 5 % + 10 % = 15 %', () => {
    // 10000 medených → -500 (listing) -1000 (exchange) = 8500
    expect(netSellRevenue(10_000)).toBe(8_500)
  })

  it('poplatky majú minimum 1 medený aj pri drobných cenách', () => {
    // sellPrice 5: listing = max(1, round(0.25)) = 1; exchange = max(1, round(0.5)) = 1
    expect(listingFee(5)).toBe(1)
    expect(exchangeFee(5)).toBe(1)
    expect(netSellRevenue(5)).toBe(3)
  })

  it('nulová alebo záporná cena nedáva žiadny výnos', () => {
    expect(netSellRevenue(0)).toBe(0)
    expect(netSellRevenue(-100)).toBe(0)
  })
})

describe('zisk a marža z flipu', () => {
  it('kladný zisk pri dostatočnom rozdiele', () => {
    // net(200) = 200 - 10 - 20 = 170; zisk = 170 - 100 = 70
    expect(flipProfit(100, 200)).toBe(70)
    expect(flipMarginPct(100, 200)).toBe(70)
  })

  it('záporný zisk keď daň zožerie malý rozdiel (falošný flip)', () => {
    // net(110) = 110 - 6 - 11 = 93; zisk = 93 - 100 = -7
    expect(flipProfit(100, 110)).toBe(-7)
  })
})

describe('alokácia rozpočtu', () => {
  it('obmedzená rozpočtom keď je objem veľký', () => {
    const a = allocateBudget({ budget: 1_000, buyPrice: 100, dailyVolume: 1_000 })
    expect(a.units).toBe(10) // 1000/100 = 10 < 25 % z 1000 = 250
    expect(a.invested).toBe(1_000)
  })

  it('obmedzená objemom keď je rozpočet veľký', () => {
    const a = allocateBudget({ budget: 100_000, buyPrice: 100, dailyVolume: 40 })
    expect(a.units).toBe(10) // 25 % zo 40 = 10 < 1000 čo si môžeš dovoliť
    expect(a.invested).toBe(1_000)
  })

  it('nula kusov pri nulovej cene, rozpočte alebo objeme (žiadny JS falsy bug)', () => {
    expect(allocateBudget({ budget: 1_000, buyPrice: 0, dailyVolume: 100 }).units).toBe(0)
    expect(allocateBudget({ budget: 0, buyPrice: 100, dailyVolume: 100 }).units).toBe(0)
    expect(allocateBudget({ budget: 1_000, buyPrice: 100, dailyVolume: 0 }).units).toBe(0)
  })
})

describe('scoreCandidate — hlavná metrika zisk/kapitál/deň', () => {
  it('pri rovnakej marži vyhrá likvidnejšia položka (rýchlejšia obrátka)', () => {
    const base = { buyPrice: 50, sellPrice: 100, budget: 100 }
    const likvidna = scoreCandidate({ ...base, dailyVolume: 1_000 })
    const nelikvidna = scoreCandidate({ ...base, dailyVolume: 8 })
    expect(likvidna.profitPerGoldPerDay).toBeGreaterThan(
      nelikvidna.profitPerGoldPerDay,
    )
  })

  it('počíta očakávaný denný zisk a maržu konzistentne', () => {
    const s = scoreCandidate({
      buyPrice: 100,
      sellPrice: 200,
      dailyVolume: 1_000,
      budget: 100_000,
    })
    expect(s.unitProfit).toBe(70)
    expect(s.marginPct).toBe(70)
    expect(s.units).toBe(250) // objemom obmedzené: 25 % z 1000
    expect(s.expectedDailyProfit).toBeGreaterThan(0)
    expect(s.profitPerGoldPerDay).toBeGreaterThan(0)
  })

  it('žiadny zisk/metrika keď sa nedá nič kúpiť', () => {
    const s = scoreCandidate({
      buyPrice: 100,
      sellPrice: 200,
      dailyVolume: 0,
      budget: 100_000,
    })
    expect(s.units).toBe(0)
    expect(s.expectedDailyProfit).toBe(0)
    expect(s.profitPerGoldPerDay).toBe(0)
  })

  it('stratový flip má nekladnú metriku', () => {
    const s = scoreCandidate({
      buyPrice: 100,
      sellPrice: 110, // daň zožerie rozdiel
      dailyVolume: 1_000,
      budget: 100_000,
    })
    expect(s.unitProfit).toBeLessThan(0)
    expect(s.profitPerGoldPerDay).toBeLessThanOrEqual(0)
  })
})
