/**
 * Klient pre oficiálne Guild Wars 2 API (api.guildwars2.com/v2).
 *
 * Funkcie berú `fetch` ako parameter (default = globálny fetch), aby:
 *  - sa dali testovať bez siete (podstrčíme falošný fetch),
 *  - bežali rovnako v prehliadači aj v Node (zberač dát).
 *
 * Verejné cenové dáta nepotrebujú API kľúč. Osobné dáta (objednávky, peňaženka)
 * áno — tie rieši samostatná funkcia s kľúčom (Fáza 4).
 */

const API_BASE = 'https://api.guildwars2.com/v2'

/** GW2 API berie naraz maximálne 200 ID na jeden request. */
export const MAX_IDS_PER_REQUEST = 200

/** Jedna úroveň ponuky/dopytu (množstvo za jednotkovú cenu v medených). */
export interface PriceTier {
  quantity: number
  unit_price: number
}

/** Aktuálne ceny položky na Trading Post. */
export interface ItemPrice {
  id: number
  whitelisted: boolean
  /** `buys.unit_price` = najvyšší existujúci buy order. */
  buys: PriceTier
  /** `sells.unit_price` = najnižší existujúci sell order. */
  sells: PriceTier
}

/** Metadáta položky (názov, ikona, vzácnosť…). */
export interface ItemMeta {
  id: number
  name: string
  icon: string
  rarity: string
  level: number
  type: string
}

type FetchFn = typeof fetch

/** Rozdelí pole na kusy s max. veľkosťou `size`. */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) throw new Error('chunk size musí byť > 0')
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}

async function getJson<T>(url: string, f: FetchFn): Promise<T> {
  const res = await f(url)
  if (!res.ok) {
    throw new Error(`GW2 API vrátilo ${res.status} pre ${url}`)
  }
  return (await res.json()) as T
}

/** Zoznam ID všetkých položiek, ktoré majú cenu na Trading Post (~26 tisíc). */
export function fetchAllPriceIds(f: FetchFn = fetch): Promise<number[]> {
  return getJson<number[]>(`${API_BASE}/commerce/prices`, f)
}

/** Ceny pre dané ID (automaticky rozdelí na dávky po 200). */
export async function fetchPrices(
  ids: number[],
  f: FetchFn = fetch,
): Promise<ItemPrice[]> {
  const out: ItemPrice[] = []
  for (const part of chunk(ids, MAX_IDS_PER_REQUEST)) {
    const url = `${API_BASE}/commerce/prices?ids=${part.join(',')}`
    out.push(...(await getJson<ItemPrice[]>(url, f)))
  }
  return out
}

/** Metadáta pre dané ID (automaticky rozdelí na dávky po 200). */
export async function fetchItems(
  ids: number[],
  lang = 'en',
  f: FetchFn = fetch,
): Promise<ItemMeta[]> {
  const out: ItemMeta[] = []
  for (const part of chunk(ids, MAX_IDS_PER_REQUEST)) {
    const url = `${API_BASE}/items?lang=${lang}&ids=${part.join(',')}`
    out.push(...(await getJson<ItemMeta[]>(url, f)))
  }
  return out
}
