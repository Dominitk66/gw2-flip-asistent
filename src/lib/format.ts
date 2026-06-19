/**
 * Formátovanie meny GW2 a čísel. Interne počítame v medených (copper); hráč ich
 * vidí ako zlaté/strieborné/medené (g/s/c).
 */
import { COPPER_PER_GOLD } from './scoring.ts'

export interface CoinParts {
  g: number
  s: number
  c: number
  negative: boolean
}

/** Rozloží medené na zložky zlaté/strieborné/medené (+ či je záporné). */
export function splitCopper(total: number): CoinParts {
  const negative = total < 0
  let v = Math.round(Math.abs(total))
  const g = Math.floor(v / COPPER_PER_GOLD)
  v -= g * COPPER_PER_GOLD
  const s = Math.floor(v / 100)
  const c = v - s * 100
  return { g, s, c, negative }
}

/** Medené → čitateľný reťazec „1g 23s 45c" (vynechá prázdne vyššie rády). */
export function formatCopper(total: number): string {
  const { g, s, c, negative } = splitCopper(total)
  let out: string
  if (g > 0) out = `${g}g ${s}s ${c}c`
  else if (s > 0) out = `${s}s ${c}c`
  else out = `${c}c`
  return negative ? `−${out}` : out
}

/** Zadané zlato (aj desatinné, čiarka aj bodka) → medené. Neplatné → 0. */
export function goldToCopper(gold: string | number): number {
  const n =
    typeof gold === 'number' ? gold : parseFloat(String(gold).replace(',', '.'))
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.round(n * COPPER_PER_GOLD)
}

/** Veľké počty kompaktne: 2 400 000 → „2,4M", 18 000 → „18k". */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  return String(Math.round(n))
}
