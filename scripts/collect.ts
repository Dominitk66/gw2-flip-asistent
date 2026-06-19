/**
 * Zberač dát — beží v Node (lokálne aj v GitHub Actions na pozadí).
 *
 * Prejde celý Trading Post, nájde najlepšie flip príležitosti a uloží ich do
 * `public/data/tips.json`, ktorý potom číta dashboard. Toto je to „tiché
 * zbieranie na pozadí", vďaka ktorému appka funguje aj keď máš stránku zavretú.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { fetchAllPriceIds, fetchPrices, fetchItems } from '../src/lib/gw2Api.ts'
import { buildTips } from '../src/lib/tips.ts'

const OUT = 'public/data/tips.json'

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
}

main().catch((err: unknown) => {
  console.error('Zber zlyhal:', err)
  process.exit(1)
})
