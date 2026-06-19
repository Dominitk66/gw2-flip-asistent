import { useEffect, useMemo, useState } from 'react'
import { parseCoins, formatCopper, goldToCopper } from '../lib/format.ts'
import { planBulkFlip, breakEvenSellPrice } from '../lib/calc.ts'
import Coins from './Coins.tsx'

export interface CalcPrefill {
  name: string
  buy: number
  sell: number
}

interface Props {
  prefill: CalcPrefill | null
}

export default function Calculator({ prefill }: Props) {
  const [name, setName] = useState('')
  const [buyStr, setBuyStr] = useState('4c')
  const [sellStr, setSellStr] = useState('10c')
  const [mode, setMode] = useState<'budget' | 'quantity'>('budget')
  const [qtyStr, setQtyStr] = useState('1000')
  const [budgetGold, setBudgetGold] = useState('100')

  // Keď príde položka z Tipov, predvyplň polia.
  useEffect(() => {
    if (!prefill) return
    setName(prefill.name)
    setBuyStr(formatCopper(prefill.buy))
    setSellStr(formatCopper(prefill.sell))
  }, [prefill])

  const buy = parseCoins(buyStr)
  const sell = parseCoins(sellStr)

  const result = useMemo(() => {
    if (mode === 'budget') {
      return planBulkFlip({ buy, sell, budget: goldToCopper(budgetGold) })
    }
    return planBulkFlip({ buy, sell, quantity: Number(qtyStr) || 0 })
  }, [buy, sell, mode, qtyStr, budgetGold])

  const breakEven = breakEvenSellPrice(buy)

  return (
    <div className="calc">
      <div className="calc-form">
        <label>
          Položka
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="(voliteľné)"
          />
        </label>
        <label>
          Nákupná cena (1 ks)
          <input
            value={buyStr}
            onChange={(e) => setBuyStr(e.target.value)}
            placeholder="napr. 4c"
          />
        </label>
        <label>
          Predajná cena (1 ks)
          <input
            value={sellStr}
            onChange={(e) => setSellStr(e.target.value)}
            placeholder="napr. 10c"
          />
        </label>
        <div className="calc-mode">
          <label className="radio">
            <input
              type="radio"
              name="calcmode"
              checked={mode === 'budget'}
              onChange={() => setMode('budget')}
            />
            Podľa rozpočtu
          </label>
          <label className="radio">
            <input
              type="radio"
              name="calcmode"
              checked={mode === 'quantity'}
              onChange={() => setMode('quantity')}
            />
            Podľa množstva
          </label>
        </div>
        {mode === 'budget' ? (
          <label>
            Rozpočet (zlato)
            <input
              type="number"
              min="0"
              value={budgetGold}
              onChange={(e) => setBudgetGold(e.target.value)}
            />
          </label>
        ) : (
          <label>
            Množstvo (ks)
            <input
              type="number"
              min="0"
              value={qtyStr}
              onChange={(e) => setQtyStr(e.target.value)}
            />
          </label>
        )}
      </div>

      <div className="calc-cards">
        <div className="mcard">
          <div className="ml">Zisk na kus (po dani)</div>
          <div className="mv profit"><Coins value={result.unitProfit} /></div>
        </div>
        <div className="mcard">
          <div className="ml">Počet kusov</div>
          <div className="mv">{result.units.toLocaleString('sk-SK')}</div>
        </div>
        <div className="mcard">
          <div className="ml">Investícia</div>
          <div className="mv"><Coins value={result.invested} /></div>
        </div>
        <div className="mcard ok">
          <div className="ml">Celkový zisk</div>
          <div className="mv profit"><Coins value={result.totalProfit} /></div>
        </div>
        <div className="mcard">
          <div className="ml">ROI</div>
          <div className="mv profit">{result.roiPct.toFixed(0)} %</div>
        </div>
        <div className="mcard">
          <div className="ml">Break-even predaj</div>
          <div className="mv"><Coins value={breakEven} /></div>
        </div>
      </div>

      <p className="foot">
        Break-even = od akej predajnej ceny už nie si v strate (kvôli daniam).
        Koľko sa reálne za deň predá, vidíš v záložke Tipy. Ceny zadávaj ako
        „4c", „2s 23c" alebo „1g 50s".
      </p>
    </div>
  )
}
