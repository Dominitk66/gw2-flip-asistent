# GW2 Flip Asistent

Osobný nástroj, ktorý radí, čo kúpiť a predať na **Guild Wars 2 Trading Post**,
aby si zarobil zlato flippingom (nákup lacno → predaj drahšie). Zarátava 15 %
daň, denný objem predaja (likviditu) aj stabilitu ceny a prispôsobuje tipy
tvojmu rozpočtu.

> ⚠️ Nástroj len **radí**. Samotný nákup/predaj klikáš v hre ty — Guild Wars 2
> zakazuje automatické obchodovanie. Appka je preto plne v rámci pravidiel.

## Ako to funguje (100 % zadarmo cez GitHub)

1. **Dashboard** — statická web stránka (GitHub Pages), ktorú otvoríš v prehliadači.
2. **Zberač dát** — GitHub Actions raz za ~hodinu potichu stiahne ceny z GW2 API
   a uloží históriu (kvôli výpočtu denného objemu a trendu).
3. **Mozog (scoring)** — beží v prehliadači: pri otvorení/refreshi stiahne živé
   ceny + históriu a zoradí tipy podľa **zisk/kapitál/deň**.

Tvoj GW2 API kľúč (ak ho zadáš) ostáva **len v tvojom prehliadači** — nikam sa
neposiela.

## Stack

TypeScript (strict) · React + Vite · Vitest · GitHub Pages + GitHub Actions.
Žiadny platený server ani databáza.

## Lokálny vývoj

```bash
npm install        # nainštaluje závislosti (raz)
npm run dev        # spustí dashboard na http://localhost:5173
```

## Kontroly kvality (spúšťať pred každým commitom)

```bash
npm run typecheck  # kontrola typov TypeScript
npm test           # unit testy (Vitest)
npm run lint       # kvalita kódu (ESLint)
npm run build      # overenie že sa frontend poskladá
```

## Nasadenie

Po nastavení GitHub Pages (Fáza 0/2) sa stránka zbuilduje a nasadí automaticky
po `git push` do vetvy `main`.

## Stav projektu

Staviame po fázach — viď [CHANGELOG.md](CHANGELOG.md).
