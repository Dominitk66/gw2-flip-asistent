import { useMemo } from 'react'
import type { TipRow } from '../lib/tips.ts'
import { scoreCandidate } from '../lib/scoring.ts'
import { formatCopper } from '../lib/format.ts'

interface Props {
  tips: TipRow[]
  budgetCopper: number
}

interface ScoredTip extends TipRow {
  units: number
  expectedDailyProfit: number
  profitPerGoldPerDay: number
}

export default function TipsTable({ tips, budgetCopper }: Props) {
  // Pre každý tip dopočítame podľa rozpočtu: koľko kúpiť a aký denný zisk.
  // Zoradíme podľa hlavnej metriky (zisk na vložený kapitál za deň).
  const scored = useMemo<ScoredTip[]>(() => {
    return tips
      .map((t) => {
        const s = scoreCandidate({
          buyPrice: t.buy,
          sellPrice: t.sell,
          dailyVolume: t.dailyVolumeEstimate,
          budget: budgetCopper,
        })
        return {
          ...t,
          units: s.units,
          expectedDailyProfit: s.expectedDailyProfit,
          profitPerGoldPerDay: s.profitPerGoldPerDay,
        }
      })
      .sort((a, b) => b.profitPerGoldPerDay - a.profitPerGoldPerDay)
  }, [tips, budgetCopper])

  return (
    <div className="table-wrap">
      <table className="tips">
        <thead>
          <tr>
            <th>#</th>
            <th>Položka</th>
            <th>Nákup</th>
            <th>Predaj</th>
            <th>Zisk/ks</th>
            <th>Marža</th>
            <th>Kúp ks</th>
            <th>Zisk/deň*</th>
          </tr>
        </thead>
        <tbody>
          {scored.map((t, i) => (
            <tr key={t.id}>
              <td className="num muted">{i + 1}</td>
              <td className="item">
                {t.icon && (
                  <img src={t.icon} alt="" width={24} height={24} loading="lazy" />
                )}
                <a
                  href={`https://www.gw2bltc.com/en/item/${t.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.name}
                </a>
              </td>
              <td className="num">{formatCopper(t.buy)}</td>
              <td className="num">{formatCopper(t.sell)}</td>
              <td className="num profit">{formatCopper(t.unitProfit)}</td>
              <td className="num">{t.marginPct.toFixed(0)}%</td>
              <td className="num">
                {t.units > 0 ? t.units.toLocaleString('sk-SK') : '—'}
              </td>
              <td className="num profit">
                {t.units > 0 ? formatCopper(t.expectedDailyProfit) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
