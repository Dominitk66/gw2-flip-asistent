import { describe, it, expect } from 'vitest'

// Smoke test Fázy 0 — overuje len to, že testovací beh (Vitest) funguje.
// Skutočné biznis-testy (daň, marža, objem, alokácia rozpočtu) prídu vo Fáze 1
// spolu so scoring engine.
describe('kostra projektu', () => {
  it('testovací beh funguje', () => {
    expect(1 + 1).toBe(2)
  })
})
