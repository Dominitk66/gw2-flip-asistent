import { describe, it, expect } from 'vitest'
import {
  assessConfidence,
  type TrackPoint,
  type TrackRecord,
} from '../src/lib/confidence'

function rec(points: TrackPoint[]): TrackRecord {
  return { points }
}

function pts(n: number, buy: number, sell: number): TrackPoint[] {
  return Array.from({ length: n }, () => ({ t: '2026-06-20', buy, sell, vol: 1000 }))
}

describe('assessConfidence', () => {
  it('bez histórie alebo málo snímok → Nové', () => {
    expect(assessConfidence(undefined).level).toBe('new')
    expect(assessConfidence(rec(pts(2, 4, 10))).level).toBe('new')
  })

  it('ziskové veľa hodín po sebe, bez výkyvu → Overené', () => {
    const c = assessConfidence(rec(pts(30, 4, 10)))
    expect(c.level).toBe('ok')
    expect(c.label).toContain('stabilné')
  })

  it('náhly skok ceny → Podozrivé', () => {
    const points = [...pts(29, 100, 200), { t: '2026-06-20', buy: 100, sell: 600, vol: 1000 }]
    const c = assessConfidence(rec(points))
    expect(c.level).toBe('bad')
  })

  it('krátka séria → Nové', () => {
    const c = assessConfidence(rec(pts(5, 4, 10)))
    expect(c.level).toBe('new')
    expect(c.label).toContain('h')
  })
})
