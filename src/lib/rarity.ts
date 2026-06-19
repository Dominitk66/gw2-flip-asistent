/**
 * Farby podľa vzácnosti položky (ako v hre), upravené pre čitateľnosť na tmavom
 * pozadí. Vstup je `rarity` z GW2 API (napr. "Fine", "Exotic").
 */
const COLORS: Record<string, string> = {
  Junk: '#9aa0a6',
  Basic: '#ffffff',
  Fine: '#7ab7e0',
  Masterwork: '#5ad15a',
  Rare: '#f5d637',
  Exotic: '#ffa84d',
  Ascended: '#fb5fa6',
  Legendary: '#b06ef0',
}

/** Farba názvu podľa vzácnosti; neznáma/prázdna → neutrálna svetlá. */
export function rarityColor(rarity: string | undefined): string {
  if (!rarity) return '#e8eaed'
  return COLORS[rarity] ?? '#e8eaed'
}
