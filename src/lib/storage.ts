/**
 * Tenká, typovaná obálka nad localStorage. Dáta ostávajú len v prehliadači
 * (súkromné, zadarmo). Pri chybe (plné/zakázané úložisko) sa appka nezrúti.
 */
export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('Nepodarilo sa uložiť do localStorage:', key, e)
  }
}
