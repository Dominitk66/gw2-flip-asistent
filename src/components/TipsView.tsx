import { useMemo, useState } from 'react'
import type { TipRow } from '../lib/tips.ts'
import { scoreCandidate } from '../lib/scoring.ts'
import TipsTable, { type ScoredTip, type SortKey } from './TipsTable.tsx'

interface Props {
  tips: TipRow[]
  budgetCopper: number
}

export default function TipsView({ tips, budgetCopper }: Props) {
  const [search, setSearch] = useState('')
  const [minMargin, setMinMargin] = useState('')
  const [minVolume, setMinVolume] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('profitPerGoldPerDay')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function onSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const rows = useMemo<ScoredTip[]>(() => {
    const q = search.trim().toLowerCase()
    const mm = parseFloat(minMargin.replace(',', '.'))
    const mv = parseFloat(minVolume.replace(',', '.'))

    const scored = tips
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
      .filter((t) => {
        if (q && !t.name.toLowerCase().includes(q)) return false
        if (Number.isFinite(mm) && t.marginPct < mm) return false
        if (Number.isFinite(mv) && t.dailyVolumeEstimate < mv) return false
        return true
      })

    const dir = sortDir === 'desc' ? -1 : 1
    scored.sort((a, b) => (a[sortKey] - b[sortKey]) * dir)
    return scored
  }, [tips, budgetCopper, search, minMargin, minVolume, sortKey, sortDir])

  return (
    <>
      <div className="filters">
        <input
          className="f-search"
          placeholder="Hľadať položku…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label>
          Min. marža %
          <input
            type="number"
            min="0"
            value={minMargin}
            onChange={(e) => setMinMargin(e.target.value)}
          />
        </label>
        <label>
          Min. objem/deň
          <input
            type="number"
            min="0"
            value={minVolume}
            onChange={(e) => setMinVolume(e.target.value)}
          />
        </label>
        <span className="count">{rows.length} položiek</span>
      </div>
      <TipsTable rows={rows} sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
    </>
  )
}
