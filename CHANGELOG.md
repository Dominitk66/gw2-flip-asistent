# Changelog

Denník zmien projektu **GW2 Flip Asistent**. Písané pre ľudí, nie pre
programátorov.

## [Unreleased]

### Pridané — Kalkulačka hromadného flipu (2026-06-20)
Nová záložka **Kalkulačka**: zadáš nákupnú a predajnú cenu a buď množstvo alebo
rozpočet — appka spočíta zisk na kus po dani, počet kusov, investíciu, celkový
zisk, ROI a **break-even cenu** (od ktorej už nie si v strate, dôležité pri
lacných položkách). Z ktoréhokoľvek tipu otvoríš kalkulačku jedným klikom
(tlačidlo 🧮), takže nemusíš nič prepisovať.

### Zmenené — Krajší a prehľadnejší dashboard (2026-06-20)
Dashboard dostal nový vzhľad podľa tvojich predstáv: **farebné mince**
(zlato/striebro/meď), položky **farebne podľa vzácnosti** s reálnymi ikonami,
**vyhľadávanie**, **filtre** (marža, objem) a **klikateľné zoradenie** stĺpcov.
Appka je rozdelená na tri záložky — **Tipy · Kalkulačka · Môj denník**
(kalkulačka a denník pribudnú vzápätí).

### Pridané — Dashboard + živá webstránka (2026-06-20)
Appka má konečne tvár! Pridali sme prehľadnú stránku, kde vidíš rebríček
najlepších tipov zoradený podľa zisku na vložený kapitál za deň. Zadáš svoj
rozpočet v zlate a pri každom tipe ti appka povie, koľko kusov kúpiť a aký
denný zisk čakať. Stránku sme zverejnili na bezplatnej adrese
(dominitk66.github.io/gw2-flip-asistent) — otvoríš ju z počítača aj z mobilu.
Vzhľad je tmavý v duchu GW2 (zlatá + tmavá). Dáta aj samotná stránka sa
obnovujú automaticky každú hodinu.

### Pridané — Zberač príležitostí + automatika na pozadí (2026-06-20)
Appka teraz prejde celý Trading Post (~28 000 položiek) a vyberie 100 najlepších
flip príležitostí do zoznamu. Ten sa bude automaticky obnovovať každú hodinu cez
GitHub Actions (zadarmo, na pozadí — aj keď máš stránku zavretú). Pridali sme
dôležité bezpečné filtre: ignorujeme manipulované a „mŕtve" listingy (napr. 2
kusy za 400 zlatých s falošnou maržou) a vyžadujeme dostatok ponuky aj dopytu.
Na reálnych dátach to našlo skutočné perly — lacné položky s ~100 % maržou a
obrovským denným objemom (presne tie „časté malé flipy").

### Pridané — Napojenie na ceny z GW2 (2026-06-20)
Appka sa teraz vie napojiť na oficiálne Guild Wars 2 API a stiahnuť aktuálne
ceny položiek z Trading Post. Otestované naživo na reálnych dátach — a hneď to
ukázalo svoju hodnotu: väčšina „bežných" položiek (Glob of Ectoplasm, rudy) sa
pri aktuálnych cenách flipovať NEOPLATÍ, lebo 15 % daň zožerie celý rozdiel —
zatiaľ čo nenápadné položky majú slušnú maržu. Presne toto bude appka hľadať
za teba naprieč tisíckami položiek.

### Pridané — Mozog appky / scoring engine (2026-06-19)
Pridali sme „mozog" aplikácie — výpočty, ktoré rozhodujú, čo sa oplatí kúpiť a
predať. Počíta čistý zisk po 15 % dani, maržu, koľko kusov kúpiť (nikdy nie viac,
než sa za deň predá) a hlavnú metriku **zisk na vložený kapitál za deň**. Tá
odmeňuje nielen veľký rozdiel ceny, ale aj rýchlosť predaja (likviditu) — presne
to, čo si si želal („výhodné, ale efektívne"). Celé je to pokryté testami, aby
sa peňažné výpočty nikdy nepokazili.

### Pridané — Kostra projektu (2026-06-19)
Založili sme základ aplikácie. Pripravili sme prostredie na vývoj: TypeScript
v prísnom režime, React + Vite (na zostavenie stránky), Vitest (na testy) a
ESLint (na kontrolu kvality kódu). Pridali sme README (čo appka robí a ako ju
spustiť) a tento denník zmien.

Zatiaľ ide len o „prázdnu škrupinu" — appka sa spustí a ukáže úvodnú stránku.
Skutočné funkcie (výpočet tipov, zber cien, dashboard) pribudnú v ďalších
fázach podľa schváleného plánu.
