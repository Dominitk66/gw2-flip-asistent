import { useEffect, useMemo, useState } from 'react'
import { loadJson, saveJson } from '../lib/storage.ts'
import { type LedgerEntry, entryResult, ledgerTotals } from '../lib/ledger.ts'
import { parseCoins, formatCopper } from '../lib/format.ts'
import Coins from './Coins.tsx'

export interface JournalPrefill {
  name: string
  buyPrice: number
  sellPrice: number
}

interface Props {
  prefill: JournalPrefill | null
}

const KEY = 'gw2flip.journal'

export default function TradeJournal({ prefill }: Props) {
  const [entries, setEntries] = useState<LedgerEntry[]>(() =>
    loadJson<LedgerEntry[]>(KEY, []),
  )
  const [name, setName] = useState('')
  const [buyStr, setBuyStr] = useState('')
  const [qtyStr, setQtyStr] = useState('')
  const [sellStr, setSellStr] = useState('')
  const [closeInputs, setCloseInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    saveJson(KEY, entries)
  }, [entries])

  // Predvyplnenie z Tipov.
  useEffect(() => {
    if (!prefill) return
    setName(prefill.name)
    setBuyStr(formatCopper(prefill.buyPrice))
    setSellStr(formatCopper(prefill.sellPrice))
  }, [prefill])

  const totals = useMemo(() => ledgerTotals(entries), [entries])

  function addEntry() {
    const buyPrice = parseCoins(buyStr)
    const quantity = Math.floor(Number(qtyStr) || 0)
    if (buyPrice <= 0 || quantity <= 0) return
    const sellTrim = sellStr.trim()
    const sellPrice = sellTrim ? parseCoins(sellTrim) : null
    const entry: LedgerEntry = {
      id: crypto.randomUUID(),
      name: name.trim() || 'Bez názvu',
      buyPrice,
      quantity,
      sellPrice,
      date: new Date().toISOString(),
      status: sellPrice !== null ? 'closed' : 'open',
    }
    setEntries((prev) => [entry, ...prev])
    setName('')
    setBuyStr('')
    setQtyStr('')
    setSellStr('')
  }

  function deleteEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  function closeTrade(id: string) {
    const raw = closeInputs[id]
    if (!raw) return
    const sellPrice = parseCoins(raw)
    if (sellPrice <= 0) return
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, sellPrice, status: 'closed' } : e,
      ),
    )
    setCloseInputs((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  return (
    <div className="journal">
      <div className="calc-cards" style={{ marginBottom: '1.25rem' }}>
        <div className="mcard">
          <div className="ml">Viazaný kapitál</div>
          <div className="mv"><Coins value={totals.invested} /></div>
        </div>
        <div className="mcard ok">
          <div className="ml">Realizovaný zisk</div>
          <div className="mv profit"><Coins value={totals.realizedProfit} /></div>
        </div>
        <div className="mcard">
          <div className="ml">ROI</div>
          <div className="mv profit">{totals.roiPct.toFixed(0)} %</div>
        </div>
        <div className="mcard">
          <div className="ml">Otvorené pozície</div>
          <div className="mv">{totals.openCount}</div>
        </div>
      </div>

      <div className="calc-form">
        <label>
          Položka
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="napr. Sweet Bean Bun"
          />
        </label>
        <label>
          Nákup (1 ks)
          <input
            value={buyStr}
            onChange={(e) => setBuyStr(e.target.value)}
            placeholder="napr. 4c"
          />
        </label>
        <label>
          Množstvo
          <input
            type="number"
            min="1"
            value={qtyStr}
            onChange={(e) => setQtyStr(e.target.value)}
            placeholder="napr. 5000"
          />
        </label>
        <label>
          Predaj (1 ks, voliteľné)
          <input
            value={sellStr}
            onChange={(e) => setSellStr(e.target.value)}
            placeholder="prázdne = nepredané"
          />
        </label>
        <button className="add-btn" onClick={addEntry}>
          + Pridať obchod
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="info">
          Zatiaľ žiadne obchody. Pridaj prvý hore, alebo tlačidlom 📒 priamo
          z Tipov.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="tips">
            <thead>
              <tr>
                <th className="l">Položka</th>
                <th className="num">Nákup</th>
                <th className="num">Ks</th>
                <th className="num">Predaj</th>
                <th className="l">Stav</th>
                <th className="num">Zisk (po dani)</th>
                <th className="num">Akcie</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const r = entryResult(e)
                return (
                  <tr key={e.id}>
                    <td className="l">{e.name}</td>
                    <td className="num"><Coins value={e.buyPrice} /></td>
                    <td className="num">{e.quantity.toLocaleString('sk-SK')}</td>
                    <td className="num">
                      {e.sellPrice !== null ? <Coins value={e.sellPrice} /> : '—'}
                    </td>
                    <td className="l">
                      {e.status === 'closed' ? (
                        <span className="badge badge-ok">Zatvorené</span>
                      ) : (
                        <span className="badge badge-new">Otvorené</span>
                      )}
                    </td>
                    <td className="num profit">
                      {e.status === 'closed' ? (
                        <Coins value={r.realizedProfit} />
                      ) : (
                        <span className="close-inline">
                          <input
                            placeholder="predaj/ks"
                            value={closeInputs[e.id] ?? ''}
                            onChange={(ev) =>
                              setCloseInputs((prev) => ({
                                ...prev,
                                [e.id]: ev.target.value,
                              }))
                            }
                          />
                          <button
                            className="row-act"
                            title="Označiť ako predané"
                            onClick={() => closeTrade(e.id)}
                          >
                            ✓
                          </button>
                        </span>
                      )}
                    </td>
                    <td className="num">
                      <button
                        className="row-act"
                        title="Zmazať"
                        onClick={() => deleteEntry(e.id)}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="foot">
        Denník je uložený len v tomto prehliadači (súkromné, zadarmo). Neskôr
        pribudne „Načítať z hry" cez API kľúč — natiahne reálne obchody
        automaticky.
      </p>
    </div>
  )
}
