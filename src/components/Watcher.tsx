import type { TipRow } from '../lib/tips.ts'
import { assessConfidence, type TrackRecord } from '../lib/confidence.ts'
import { flipMarginPct } from '../lib/scoring.ts'
import { rarityColor } from '../lib/rarity.ts'
import Coins from './Coins.tsx'

interface Props {
  tips: TipRow[]
  tracker: Record<string, TrackRecord>
  pinned: number[]
  onTogglePin: (id: number) => void
}

const BAR_COLOR: Record<string, string> = {
  ok: '#5bbb7b',
  new: '#e0b34d',
  bad: '#e0625a',
}

export default function Watcher({ tips, tracker, pinned, onTogglePin }: Props) {
  if (pinned.length === 0) {
    return (
      <p className="info">
        Zatiaľ nič nesleduješ. V záložke Tipy klikni na ☆ pri položke a pridáš
        ju sem — appka ti tu ukáže jej trend a či sa na ňu dá spoľahnúť.
      </p>
    )
  }

  const tipById = new Map(tips.map((t) => [t.id, t]))

  return (
    <div className="watch-grid">
      {pinned.map((id) => {
        const rec = tracker[id]
        const conf = assessConfidence(rec)
        const tip = tipById.get(id)
        const points = rec?.points ?? []
        const last = points[points.length - 1]
        const name = tip?.name ?? `#${id}`
        const buy = tip?.buy ?? last?.buy ?? 0
        const sell = tip?.sell ?? last?.sell ?? 0
        const margins = points.map((p) => flipMarginPct(p.buy, p.sell))
        const maxM = Math.max(1, ...margins)
        const badgeClass =
          conf.level === 'ok'
            ? 'badge badge-ok'
            : conf.level === 'bad'
              ? 'badge badge-bad'
              : 'badge badge-new'

        return (
          <div className="watch-card" key={id}>
            <div className="watch-head">
              <a
                href={`https://www.gw2bltc.com/en/item/${id}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: rarityColor(tip?.rarity) }}
              >
                {name}
              </a>
              <span className={badgeClass}>{conf.label}</span>
            </div>

            <div className="watch-price">
              <Coins value={buy} /> <span className="arrow">→</span>{' '}
              <Coins value={sell} />
            </div>

            <div className="trend">
              {points.length === 0 ? (
                <span className="info">zatiaľ bez histórie</span>
              ) : (
                margins.map((m, i) => (
                  <div
                    key={i}
                    className="bar"
                    style={{
                      height: `${Math.max(6, (m / maxM) * 100)}%`,
                      background: BAR_COLOR[conf.level],
                    }}
                  />
                ))
              )}
            </div>

            <button className="row-act unpin" onClick={() => onTogglePin(id)}>
              ★ Prestať sledovať
            </button>
          </div>
        )
      })}
    </div>
  )
}
