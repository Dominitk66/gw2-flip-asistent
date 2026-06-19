# Changelog

Denník zmien projektu **GW2 Flip Asistent**. Písané pre ľudí, nie pre
programátorov.

## [Unreleased]

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
