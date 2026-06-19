/**
 * Zberač dát — beží v Node (lokálne aj v GitHub Actions na pozadí).
 *
 * Prejde celý Trading Post, nájde najlepšie flip príležitosti a uloží ich do
 * `public/data/tips.json`, ktorý potom číta dashboard. Toto je to „tiché
 * zbieranie na pozadí", vďaka ktorému appka funguje aj keď máš stránku zavretú.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fetchAllPriceIds, fetchPrices, fetchItems } from '../src/lib/gw2Api.ts'
import { buildTips } from '../src/lib/tips.ts'
import type { TrackRecord } from '../src/lib/confidence.ts'

const OUT = 'public/data/tips.json'
const TRACKER = 'public/data/tracker.json'
const MAX_POINTS = 72 // ~3 dni hodinovo (drží repo malé)
const PRUNE_MS = 3 * 24 * 60 * 60 * 1000

async function main(): Promise<void> {
  console.log('Sťahujem zoznam položiek na trhu...')
  const ids = await fetchAllPriceIds()
  console.log(`Položiek na trhu: ${ids.length}. Sťahujem ceny (po dávkach)...`)

  const prices = await fetchPrices(ids)
  console.log(`Stiahnuté ceny: ${prices.length}. Počítam tipy...`)

  const top = buildTips(prices)
  console.log(`Vybraných tipov: ${top.length}. Sťahujem názvy položiek...`)

  const metas = await fetchItems(top.map((t) => t.id))
  const metaById = new Map(metas.map((m) => [m.id, m]))
  const tips = top.map((t) => {
    const m = metaById.get(t.id)
    return {
      ...t,
      name: m?.name ?? `#${t.id}`,
      icon: m?.icon ?? '',
      rarity: m?.rarity ?? '',
    }
  })

  const payload = {
    generatedAt: new Date().toISOString(),
    count: tips.length,
    tips,
  }

  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`Hotovo. Zapísané ${tips.length} tipov do ${OUT}`)

  // --- Tracker: história pre overenie spoľahlivosti tipov ---
  const nowIso = payload.generatedAt
  const nowMs = Date.now()
  let items: Record<string, TrackRecord> = {}
  try {
    const parsed = JSON.parse(readFileSync(TRACKER, 'utf8')) as {
      items?: Record<string, TrackRecord>
    }
    items = parsed.items ?? {}
  } catch {
    items = {} // prvý beh — tracker ešte neexistuje
  }

  for (const t of tips) {
    const record = items[t.id] ?? { points: [] }
    record.points.push({
      t: nowIso,
      buy: t.buy,
      sell: t.sell,
      vol: t.dailyVolumeEstimate,
    })
    if (record.points.length > MAX_POINTS) {
      record.points = record.points.slice(-MAX_POINTS)
    }
    items[t.id] = record
  }

  // Vyhoď položky, ktoré sme nevideli viac ako 3 dni (nech repo nenarastá).
  for (const [id, record] of Object.entries(items)) {
    const last = record.points[record.points.length - 1]
    if (!last || nowMs - new Date(last.t).getTime() > PRUNE_MS) {
      delete items[id]
    }
  }

  writeFileSync(TRACKER, JSON.stringify({ generatedAt: nowIso, items }, null, 2))
  console.log(`Tracker: ${Object.keys(items).length} položiek v histórii.`)
}

main().catch((err: unknown) => {
  console.error('Zber zlyhal:', err)
  process.exit(1)
})
