/**
 * Overenie spoľahlivosti tipu — rozlíši reálny zárobok od „nafúknutého".
 * Pracuje s históriou snímok (tracker), ktorú zbiera collector každú hodinu.
 *
 * Pravidlá:
 *  - málo snímok → „Nové" (ešte si nie sme istí),
 *  - aktuálna predajná cena výrazne nad bežným priemerom → „Podozrivé" (spike),
 *  - ziskové veľa hodín po sebe a bez výkyvu → „Overené".
 */
import { flipMarginPct } from './scoring.ts'

export interface TrackPoint {
  t: string
  buy: number
  sell: number
  vol: number
}

export interface TrackRecord {
  points: TrackPoint[]
}

export type ConfidenceLevel = 'ok' | 'new' | 'bad'

export interface Confidence {
  level: ConfidenceLevel
  label: string
  streakHours: number
}

const MIN_MARGIN = 5
const HOURS_PER_DAY = 24
const SPIKE_FACTOR = 1.5

function dayWord(d: number): string {
  if (d === 1) return 'deň'
  if (d >= 2 && d <= 4) return 'dni'
  return 'dní'
}

export function assessConfidence(rec: TrackRecord | undefined): Confidence {
  const points = rec?.points ?? []
  if (points.length < 3) {
    return {
      level: 'new',
      label: `sledujem ${points.length} h`,
      streakHours: points.length,
    }
  }

  // Koľko hodín po sebe (od konca) bol tip ziskový.
  let streak = 0
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i]
    if (flipMarginPct(p.buy, p.sell) >= MIN_MARGIN) streak++
    else break
  }

  // Spike: aktuálna predajná cena výrazne nad priemerom posledných hodín.
  const recent = points.slice(-HOURS_PER_DAY)
  const avgSell = recent.reduce((a, p) => a + p.sell, 0) / recent.length
  const current = points[points.length - 1].sell
  const spike = avgSell > 0 && current > avgSell * SPIKE_FACTOR

  if (spike) {
    return { level: 'bad', label: 'cena skočila', streakHours: streak }
  }
  if (streak >= HOURS_PER_DAY) {
    const days = Math.floor(streak / HOURS_PER_DAY)
    return {
      level: 'ok',
      label: `stabilné ${days} ${dayWord(days)}`,
      streakHours: streak,
    }
  }
  return { level: 'new', label: `sledujem ${streak} h`, streakHours: streak }
}
