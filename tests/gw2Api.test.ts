import { describe, it, expect, vi } from 'vitest'
import { chunk, fetchPrices, type ItemPrice } from '../src/lib/gw2Api'

// Testy parsovania a dávkovania GW2 API klienta (bez reálnej siete).

describe('chunk', () => {
  it('rozdelí pole na kusy danej veľkosti', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })

  it('prázdne pole → prázdny výsledok', () => {
    expect(chunk([], 200)).toEqual([])
  })

  it('hodí chybu pri neplatnej veľkosti', () => {
    expect(() => chunk([1], 0)).toThrow()
  })
})

function fakePrice(id: number): ItemPrice {
  return {
    id,
    whitelisted: true,
    buys: { quantity: 100, unit_price: 10 },
    sells: { quantity: 100, unit_price: 20 },
  }
}

describe('fetchPrices', () => {
  it('rozdelí >200 ID na viac requestov a spojí výsledok', async () => {
    const ids = Array.from({ length: 250 }, (_, i) => i + 1)
    const f = vi.fn(async (url: string | URL | Request) => {
      const idStr = String(url).split('ids=')[1] ?? ''
      const count = idStr ? idStr.split(',').length : 0
      const data = Array.from({ length: count }, (_, i) => fakePrice(i))
      return { ok: true, status: 200, json: async () => data } as Response
    })
    const res = await fetchPrices(ids, f as unknown as typeof fetch)
    expect(f).toHaveBeenCalledTimes(2) // 200 + 50
    expect(res).toHaveLength(250)
  })

  it('hodí chybu pri HTTP zlyhaní (napr. 503)', async () => {
    const f = vi.fn(
      async () => ({ ok: false, status: 503, json: async () => [] }) as Response,
    )
    await expect(
      fetchPrices([1], f as unknown as typeof fetch),
    ).rejects.toThrow('503')
  })
})
