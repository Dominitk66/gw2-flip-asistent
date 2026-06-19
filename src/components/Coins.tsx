import { splitCopper } from '../lib/format.ts'

/** Zobrazí sumu v medených ako farebné mince (zlatá/strieborná/medená). */
export default function Coins({ value }: { value: number }) {
  const p = splitCopper(value)
  return (
    <span className="coins">
      {p.negative ? '−' : ''}
      {p.g > 0 && <span className="cg">{p.g}g</span>}
      {(p.g > 0 || p.s > 0) && <span className="cs">{p.s}s</span>}
      <span className="cc">{p.c}c</span>
    </span>
  )
}
