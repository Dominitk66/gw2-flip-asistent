/**
 * Formátovanie meny GW2. Interne počítame v medených (copper); hráč ich vidí
 * ako zlaté/strieborné/medené (g/s/c).
 */
import { COPPER_PER_GOLD } from './scoring.ts'

/** Medené → čitateľný reťazec „1g 23s 45c" (vynechá prázdne vyššie rády). */
export function formatCopper(total: number): string {
  const negative = total < 0
  let c = Math.round(Math.abs(total))
  const g = Math.floor(c / COPPER_PER_GOLD)
  c -= g * COPPER_PER_GOLD
  const s = Math.floor(c / 100)
  const cc = c - s * 100

  let out: string
  if (g > 0) out = `${g}g ${s}s ${cc}c`
  else if (s > 0) out = `${s}s ${cc}c`
  else out = `${cc}c`

  return negative ? `−${out}` : out
}

/** Zadané zlato (aj desatinné, čiarka aj bodka) → medené. Neplatné → 0. */
export function goldToCopper(gold: string | number): number {
  const n =
    typeof gold === 'number' ? gold : parseFloat(String(gold).replace(',', '.'))
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.round(n * COPPER_PER_GOLD)
}
