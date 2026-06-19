import type { TipRow } from '../lib/tips.ts'
import { rarityColor } from '../lib/rarity.ts'
import { formatCompact } from '../lib/format.ts'
import Coins from './Coins.tsx'

/** Tip s dopočítanými hodnotami podľa rozpočtu (z scoreCandidate). */
export interface ScoredTip extends TipRow {
  units: number
  expectedDailyProfit: number
  profitPerGoldPerDay: number
}

/** Stĺpce, podľa ktorých sa dá zoradiť (všetko číselné). */
export type SortKey =
  | 'buy'
  | 'sell'
  | 'unitProfit'
  | 'marginPct'
  | 'dailyVolumeEstimate'
  | 'profitPerGoldPerDay'

interface Props {
  rows: ScoredTip[]
  sortKey: SortKey
  sortDir: 'asc' | 'desc'
  onSort: (key: SortKey) => void
}

export default function TipsTable({ rows, sortKey, sortDir, onSort }: Props) {
  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDir === 'desc' ? ' ▾' : ' ▴') : ''

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th className="num sortable" onClick={() => onSort(k)}>
      {label}
      {arrow(k)}
    </th>
  )

  return (
    <div className="table-wrap">
      <table className="tips">
        <thead>
          <tr>
            <th className="l">Položka</th>
            <Th k="buy" label="Nákup" />
            <Th k="sell" label="Predaj" />
            <Th k="unitProfit" label="Zisk/ks" />
            <Th k="marginPct" label="Marža" />
            <Th k="dailyVolumeEstimate" label="Objem/deň" />
            <th className="num">Kúp</th>
            <Th k="profitPerGoldPerDay" label="Zisk/deň" />
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td className="l">
                <span className="item">
                  {t.icon && (
                    <img src={t.icon} alt="" width={24} height={24} loading="lazy" />
                  )}
                  <a
                    href={`https://www.gw2bltc.com/en/item/${t.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: rarityColor(t.rarity) }}
                  >
                    {t.name}
                  </a>
                </span>
              </td>
              <td className="num"><Coins value={t.buy} /></td>
              <td className="num"><Coins value={t.sell} /></td>
              <td className="num profit"><Coins value={t.unitProfit} /></td>
              <td className="num">{t.marginPct.toFixed(0)} %</td>
              <td className="num">{formatCompact(t.dailyVolumeEstimate)}</td>
              <td className="num">
                {t.units > 0 ? t.units.toLocaleString('sk-SK') : '—'}
              </td>
              <td className="num profit">
                {t.units > 0 ? <Coins value={t.expectedDailyProfit} /> : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
