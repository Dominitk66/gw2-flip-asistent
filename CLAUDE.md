# Pravidlá pre Claude Code v tomto projekte

Tento súbor obsahuje pravidlá, ktoré sa Claude Code AI asistent zaväzuje
dodržiavať pri každej zmene v tomto projekte. Tieto pravidlá vychádzajú zo
skúseností pri stavbe aplikácie **KobesFlow** (Kobes Production s.r.o.),
kde sa za 4 mesiace ukázalo, čo funguje a čo nie.

**Cieľ týchto pravidiel:** aby projekt zostal udržateľný aj po mesiacoch
vývoja, dal sa bezpečne odovzdať budúcemu IT oddeleniu a aby každá zmena
bola predvídateľná.

---

## 1. Komunikácia

- **Píš a odpovedaj v slovenčine.** Užívateľ nie je programátor, vysvetľuj
  veci ľudskou rečou. Žiadny technický žargón bez vysvetlenia.
- Pri opise zmien **používaj analógie** (napr. „commit = ako Ctrl+S vo Worde
  s popisom" namiesto „git commit").
- Keď navrhuješ riešenie, **vždy stručne odôvodni prečo** — užívateľ chce
  rozumieť, nie len odsúhlasiť.

---

## 2. Pred každou väčšou zmenou — 2–3 mikro-rozhodnutia

Predtým, než začneš rozsiahly refactor alebo novú feature, **polož užívateľovi
2–3 cielené otázky** vo formáte:

> 1. Default value pre X: (a) Y, (b) Z?
> 2. Permission gating: (a) admin only, (b) feature-specific flag?
> 3. UI placement: (a) modal, (b) inline?
>
> Moje odporúčanie: **1a, 2b, 3a**.

Užívateľ odpíše buď `ok defaults` alebo `1b, 2a, 3a`. Až **PO POTVRDENÍ** začni
implementovať. Šetrí to obrovský čas — predídeš veľkému refactoru ktorý
nesedí s predstavou užívateľa.

**Výnimka:** drobné bug-fixy a triviálne zmeny (preklep, presunutie tlačidla)
môžeš spraviť priamo bez otázok.

---

## 3. Po každej zmene — 4 kontroly + commit + push + deploy

**Pravidlo bez výnimiek.** Aj „len malá zmena". Po každej významnej úprave:

```bash
# 1. TypeScript check (overenie typov)
npm run typecheck

# 2. Unit testy (overenie že logika neprestala fungovať)
npm test

# 3. Lint (kvalita kódu — žiadne nepoužité veci, čisté formátovanie)
npm run lint

# 4. Build (overenie že frontend sa poskladá bez chyby)
npm run build
```

**Iba ak VŠETKY 4 sú zelené:**

```bash
git add <konkrétne súbory>        # ❌ NIKDY git add -A (omyl: .env, credentials)
git commit -m "Krátky popis: čo + kto požiadal"
git push origin main
# Ak je projekt na Cloudflare Workers:
npx wrangler deploy
```

**Vždy oznám užívateľovi výsledok** (typecheck ✓, X testov ✓, deploy ✓, version ID).

---

## 4. Commit message — slovenčinou, s vysvetlením prečo

Štruktúra každej commit správy:

```
Typ: Krátky popis (kto požiadal)

Vysvetlenie príčiny — prečo sa zmena stala:
- aký bol problém / pripomienka
- ako sme to vyriešili
- aké alternatívy sme zamietli a prečo

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Typy:** `Fix:`, `Pridané:`, `Zmenené:`, `Refaktor:`, `Migrácia 00XX:`, `Cleanup:`

**Píš pre seba o 6 mesiacov.** Vtedy si nebudeš pamätať detaily — commit
message ti to pripomenie.

---

## 5. Denník zmien — CHANGELOG.md

Po každej významnej zmene **aktualizuj `CHANGELOG.md`** v koreňovom priečinku.

Štruktúra:
```markdown
# Changelog

## [Unreleased]

### Pridané — <Téma> (YYYY-MM-DD)
Stručný popis pre business stakeholderov (1–2 odstavce). Kto požiadal, aký
bol problém, čo sa zmenilo, ako to ovplyvní užívateľov.

### Opravené — <Bug> (YYYY-MM-DD)
...
```

**CHANGELOG je v slovenčine** (čítajú to aj non-IT ľudia z firmy).
**Píš pre business**, nie pre programátora.

Pri každom novom roku pridať `## [verzia.X.Y] — YYYY-MM-DD` sekciu a presunúť
`Unreleased` obsah do nej.

---

## 6. Forward-only migrácie

**Migrácie databázy sú forward-only.** Žiadne mazania, žiadne prepisovania.

- Vytvor priečinok `migrations/` v koreni
- Súbory: `0001_init.sql`, `0002_add_users.sql`, `0003_xxx.sql`, ...
- Číslovanie **sekvenčné, bez medzier** (CI to kontroluje)
- **NIKDY neuprav starú migráciu** — ak treba opraviť, vytvor novú
- Každá migrácia má **doc-komentár hore**: kto požiadal, prečo, čo robí, alternatívy

Aplikácia migrácií (príklad pre Cloudflare D1):
```bash
npx wrangler d1 execute DB --remote --file=migrations/00XX_xxx.sql
npx wrangler d1 execute DB --local  --file=migrations/00XX_xxx.sql
```

**Vždy aplikuj migráciu PRED commitom backend zmien**, ktoré ju používajú.

---

## 7. Pravidlá pre kód

### TypeScript

- **Strict mode od dňa 1** v `tsconfig.json`
- **Žiadne `any`** — radšej `unknown` + narrowing
- **Žiadne `@ts-ignore`** bez vysvetlenia v komentári

### Štruktúra

- **Súbor s 500+ riadkami → premýšľaj o rozdelení**
- **Súbor s 1000+ riadkami → rozhodni sa rozdelenie ihneď**
- Shared helpery (`todayStr`, `formatDate`, atď.) **vždy v centrálnych
  `utils/`** priečinkoch. Nikdy ich nezduplikuj.

### Komentáre

- **Komentár vysvetľuje PREČO, nie ČO** (kód ukáže čo)
- Pri každej netriviálnej logike krátky business kontext: „Pripomienka užívateľa: ..."
- Pri každej špeciálnej hodnote / fallbacku vysvetli prečo to číslo

### Common gotchas — vyhnúť sa

- ❌ `Number(0) || null === null` — JS falsy gotcha. Použiť `Number.isFinite(x) ? x : null`
- ❌ Backticks `` ` `` vo vnútri template literals v SQL stringoch — predčasné ukončenie
- ❌ `git add -A` ako pravidlo — risk pre `.env` súbor
- ❌ Mazanie / prepisovanie starých migrácií
- ❌ `npm ci` na Windows-vytvorenom lock súbore v Linux CI — EBADPLATFORM. Použiť `npm install`

---

## 8. Testy — od dňa 1

**Aspoň 5–10 testov na biznis-kritickú logiku hneď od začiatku.**

Priority pre testy:
1. **Peniaze** — fakturácia, KPI, marže, dane
2. **Workflow status** — stavové prechody, validácie
3. **Parsing** — XLS/CSV importy
4. **Permission checks** — kto môže čo

Framework: **Vitest** (rýchlejší ako Jest, native Vite integration).
Lokácia: `tests/` v koreni.

**Pri každom bug-fixe** najprv napíš test ktorý zachytí bug, potom oprav.
Test ostane navždy — regresia sa neopakuje.

---

## 9. Permissions per feature, nie len roly

Nestačí len `admin / user`. Treba per-feature flagy v databáze:
- `can_edit_orders`, `can_see_revenue`, `can_delete_users`, ...

**Backend overuje KAŽDÝ endpoint:**
```typescript
if (!ctx.isAdmin && !ctx.perms.can_edit_orders) {
  return c.json({ ok: false, error: 'Nemáš oprávnenie' }, 403)
}
```

**Frontend skrýva tlačidlá** ale **NIKDY nespolieha** iba na FE check —
to je iba UX, security je vždy na backend.

---

## 10. Bezpečnostné pravidlá

- **Heslá:** PBKDF2 100 000+ iterations, soľ minimálne 16 bytov. Nie SHA bez salt.
- **JWT:** v `httpOnly + Secure + SameSite=Strict` cookie. **NIE v localStorage.**
- **Secrets:** v Cloudflare Workers Secrets (`wrangler secret put`), NIE v `wrangler.toml`/.env
- **`.env` + `.dev.vars`** vždy v `.gitignore` od dňa 1
- **Rate limiting** na auth endpointoch (5 attempts / 15 min)
- **GDPR:** pri SK personal data — notifikácia + delete-account flow

Pri každom novom endpointe ktorý spracúva citlivé dáta: **opýtaj sa
užívateľa na permission model**, nie default „admin only".

---

## 11. Frontend pravidlá (React + Vite + TypeScript)

- **Code splitting** cez `React.lazy` ALEBO `lazyWithRetry` wrapper pre stale-chunk
  recovery po deploy-i (bez tohto sa stretneš s bielou obrazovkou keď máš open tab
  pri novom nasadení)
- **ErrorBoundary** okolo `<Routes>` ako safety net
- **Žiadny inline-CSS-string** pre dynamic colors — používaj CSS premenné
- **useEffect bez deps array** = bug-magnet, vždy explicit deps + `eslint-disable-next-line`
  s komentárom **prečo**, ak je úmyselne mount-only

---

## 12. Dokumentácia pre budúce IT

Tieto súbory **udržiavaj aktuálne** od prvého týždňa:

- **`README.md`** — čo appka robí, ako spustiť dev, ako deploy-núť
- **`CHANGELOG.md`** — denník zmien v slovenčine
- **`HANDOVER.md`** — praktický manuál pre IT pri prevzatí:
  - Kde sú účty (Cloudflare, GitHub, doména)
  - Kde sú secrets a ako ich rotovať
  - Lokálny dev setup krok-za-krokom
  - Známe issues a workarounds
  - Checklist pre prevzatie
- **`docs/db-schema.md`** — aktuálna schéma databázy (snapshot, nie všetkých migrácií)
- **`docs/decisions/`** — ADR (Architecture Decision Records) pre veľké rozhodnutia.
  Formát: `001-prvá-veľká-voľba.md`, `002-...md`. Každý súbor: prečo, alternatívy, dôsledky.

---

## 13. Čo NIKDY nerobiť bez explicitného povolenia užívateľa

- ❌ Mazanie súborov / priečinkov
- ❌ `git reset --hard`, `git push --force`, `git checkout --`
- ❌ Mazanie commitov z histórie
- ❌ Migrácie ktoré DROP-ujú stĺpec / tabuľku s dátami
- ❌ Inštalácia nových `npm` balíčkov mimo dependency-update commitu
- ❌ Rozsiahly refactor (viac ako 5 súborov naraz) bez mikro-rozhodnutí
- ❌ Zmena niečoho v `.github/workflows/*` (CI/CD config) — môže rozbiť deploy
- ❌ Zmena niečoho v `wrangler.toml` / `package.json` bez upozornenia

**Vždy si vyžiadaj explicitné „áno spravme to":**
> Toto vyžaduje DROP COLUMN s dátami v stĺpci X. Pokračovať? **Áno / Nie / Najprv backup**

---

## 14. Štýl odpovedí

- **Markdown formátovanie** — odrážky, tabuľky, code bloky pre kód
- **Emoji ✓ ✗ ⚠ 🟢 🔴** na rozlíšenie statusov v texte
- **Vždy uveď konkrétne ID / version / file path** keď reportuješ úspech
  („Deployed version `abc123`. 8 súborov v `frontend/pages/`")
- **Test scenario v sekcii „Test pre teba"** na konci odpovede ak ide o
  user-facing zmenu — popíš krok-za-krokom čo má užívateľ skúsiť aby overil

---

## 15. Keď niečo nefunguje (debug protokol)

1. **Spusti príslušnú kontrolu** (typecheck / test / build) na overenie kde je chyba
2. **Prečítaj chybové hlášky pozorne** — TypeScript / Vitest hovoria celkom konkrétne
3. **Nezačni „opravovať" náhodne** — najprv si overí v relevantnom súbore čo sa deje
4. **Pri opakovanom failnutí** povedz užívateľovi pravdivo „neviem prečo to padá,
   skúsme prístup A alebo B" namiesto strielania
5. **Po fix-e znova spusti všetky 4 kontroly** — overiť že si nič nerozbil

---

## 16. Kategórie užívateľského feedbacku — ako ich brať

Pri každej user-side pripomienke kategorizuj:

- 🔴 **BUG** — niečo robí inak ako sa očakáva → priorita 1, fixni hneď
- 🟡 **FEATURE REQUEST** — chceli by mať novú funkciu → mikro-rozhodnutia, potom impl
- 🟠 **UX issue** — funguje ale je nepríjemné → 1-2 vety návrh, potom impl
- 🟢 **OPTIMALIZÁCIA** — nie urgentné, „bolo by fajn" → si poznač, vráť sa neskôr

Pri každej zmene **vždy uveď do commitu kto požiadal** („pripomienka Beáty",
„Janka pri testovaní zistila", „Rasťovský návrh"). Tým budúce IT vidí ktoré
zmeny prišli z reálnej spätnej väzby a ktoré boli proaktívne.

---

## 17. Lokálne vs. remote prostredie

- **Lokálny dev:** spustí cez `npm run dev` + lokálna D1 databáza (cez `wrangler dev`)
- **Production deploy:** cez `npx wrangler deploy` (alebo GitHub Actions automaticky
  po push do main)

**Migrácie aplikuj VŽDY na obidve prostredia:**
```bash
npx wrangler d1 execute DB --local  --file=migrations/00XX.sql
npx wrangler d1 execute DB --remote --file=migrations/00XX.sql
```

Ak lokálna DB nemá nejaký starší stĺpec ktorý remote má — lokálne deploye
budú padať s `no such column`. Pravidelne synchronizuj.

---

## Záver — moje osobné pravidlá ako AI asistent

1. **Disciplína > Rýchlosť.** Lepšie pomalšie, ale správne.
2. **Pýtam sa pred robením.** 2–3 otázky šetria hodiny.
3. **Dokumentujem všetko** — pre budúce IT, pre seba o 6 mesiacov.
4. **Hovorím pravdu, aj zlú.** „Toto vyžaduje refactor X súborov, risk je Y."
5. **Nemažem bez povolenia.** Bezpečnejšie pre tvoje dáta.

Toto sú pravidlá ktoré sa mi za 4 mesiace na KobesFlow projekte ukázali ako
najpodstatnejšie. Dodržiavaj ich, a aplikácia ostane udržateľná aj o rok,
aj o päť rokov.

---

*Posledná aktualizácia: 2026-05-15*
*Vychádza z KobesFlow projektu (Kobes Production s.r.o.)*
