import { useCallback, useEffect, useState } from 'react'
import type { TipRow } from './lib/tips.ts'
import { goldToCopper } from './lib/format.ts'
import TipsView from './components/TipsView.tsx'

interface TipsFile {
  generatedAt: string
  count: number
  tips: TipRow[]
}

type Tab = 'tipy' | 'kalkulacka' | 'dennik'

const BUDGET_KEY = 'gw2flip.budgetGold'

const TABS: { id: Tab; label: string }[] = [
  { id: 'tipy', label: 'Tipy' },
  { id: 'kalkulacka', label: 'Kalkulačka' },
  { id: 'dennik', label: 'Môj denník' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('tipy')
  const [data, setData] = useState<TipsFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [budgetGold, setBudgetGold] = useState<string>(
    () => localStorage.getItem(BUDGET_KEY) ?? '100',
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${import.meta.env.BASE_URL}data/tips.json?t=${Date.now()}`,
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData((await res.json()) as TipsFile)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Neznáma chyba')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function onBudgetChange(value: string) {
    setBudgetGold(value)
    localStorage.setItem(BUDGET_KEY, value)
  }

  const budgetCopper = goldToCopper(budgetGold)
  const updated = data ? new Date(data.generatedAt).toLocaleString('sk-SK') : null

  return (
    <main className="app">
      <header className="head">
        <h1>GW2 Flip Asistent</h1>
        <p className="subtitle">
          Tipy na nákup a predaj na Trading Post — zoradené podľa zisku na
          vložený kapitál za deň.
        </p>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'tab on' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'tipy' && (
        <>
          <section className="controls">
            <label className="budget">
              Môj rozpočet (zlato)
              <input
                type="number"
                min="0"
                inputMode="decimal"
                value={budgetGold}
                onChange={(e) => onBudgetChange(e.target.value)}
              />
            </label>
            <button onClick={() => void load()} disabled={loading}>
              {loading ? 'Načítavam…' : '↻ Obnoviť'}
            </button>
            {updated && <span className="updated">Dáta z: {updated}</span>}
          </section>

          {loading && <p className="info">Načítavam tipy…</p>}
          {error && <p className="error">Nepodarilo sa načítať tipy: {error}</p>}
          {data && !loading && !error && (
            data.tips.length > 0 ? (
              <TipsView tips={data.tips} budgetCopper={budgetCopper} />
            ) : (
              <p className="info">Zatiaľ žiadne tipy. Skús neskôr.</p>
            )
          )}
        </>
      )}

      {tab === 'kalkulacka' && (
        <p className="info">Kalkulačka — pridávam v ďalšom kroku. 🛠️</p>
      )}
      {tab === 'dennik' && (
        <p className="info">Môj denník — pridávam v ďalšom kroku. 🛠️</p>
      )}

      <footer className="foot">
        <p>
          „Zisk/deň" je odhad pri tvojom rozpočte. Objem je zatiaľ približný
          (presnejší pribudne, ako sa nazbiera história). Nákup a predaj kliká
          v hre vždy hráč — appka len radí.
        </p>
      </footer>
    </main>
  )
}
