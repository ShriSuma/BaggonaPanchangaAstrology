# Seva and Prasada — Feature Documentation

A new premium section for Gokarna Kshetra. Once a visitor's **Janana Patrika** (birth chart) exists in the app, this tab turns that chart into three things they can carry home:

1. a **seva recommendation** drawn from their own doshas,
2. a **personal six-month calendar** that colours every single day for them alone,
3. a **printable Prasada kit** — wall calendar, blessing letter and pooja-shelf card.

Everything is generated on the device. No AI call, no network call, no server. The same birth details always produce exactly the same calendar.

---

## 1. Where it lives

| | |
|---|---|
| Page id | `seva` |
| Navigation | Side drawer → **Premium Insights** group |
| Gating | Rendered only when `useKundliViewerStore().session` exists — the same condition used by Baggona, Predictions, Insights, Bhavishya and AI Astrologer |
| Fallback | If the page is opened without a chart (e.g. after a reload), it shows a short message and a **Go to Birth Chart** button instead of erroring |

The page has three sub-tabs: **Recommended Seva**, **Six-Month Calendar**, **Prasada Kit**.

---

## 2. Files

### Added

| File | Purpose |
|---|---|
| `src/features/seva/sevaLocale.ts` | The whole 5-language vocabulary for the feature — rashis, nakshatras, tithis, weekdays, months, colours, directions, taras, UI labels, letter text and Sanskrit shlokas |
| `src/features/seva/sevaPresentation.ts` | Shared wording and colour palette used by both the screen and the print sheets; builds the "why this day" explanation lines |
| `src/features/seva/useSevaData.ts` | Hook that computes the rhythm and the seva list from the active session |
| `src/core/TaraBalaEngine.ts` | Tara Bala, Chandra Bala, rashi lords, weekday lords, graha friendship, tithi grouping |
| `src/core/DailyRhythmEngine.ts` | Scores 180 consecutive days and groups them into months |
| `src/core/GokarnaSevaEngine.ts` | Reads the chart for doshas and ranks the sevas |
| `src/data/gokarnaSevas.ts` | Catalog of 13 Gokarna sevas with 5-language descriptions |
| `src/components/seva/SevaCalendar.tsx` | Month strip, 7-column grid, legend, month counters |
| `src/components/seva/SevaDayDetail.tsx` | Single-day panel: energy bar, lucky signs, panchanga facts, reasons, mantra |
| `src/components/seva/SevaRecommendations.tsx` | Primary seva card plus further options, each expandable |
| `src/components/seva/PrasadaKit.tsx` | Kit contents, seva record inputs, three PDF download buttons |
| `src/components/seva/pdf/SevaPrintTemplates.tsx` | The three print sheets |
| `src/pages/SevaPage.tsx` | Page shell, hero, sub-tabs |

### Modified

| File | Change |
|---|---|
| `src/stores/appStore.ts` | Added `"seva"` to the `AppPage` union |
| `src/App.tsx` | Renders `<SevaPage />` for `currentPage === "seva"` |
| `src/components/Layout.tsx` | Added the nav button inside the existing `session && (...)` block |

Nothing else in the codebase was touched. No existing engine, page or PDF path was modified.

---

## 3. How a day is scored

Every day is measured **against the person's own birth Moon**, which is what makes the calendar personal rather than a generic panchanga.

### The five inputs

| Input | Weight | What it measures |
|---|---|---|
| Tara Bala | 0.34 | Transit Moon nakshatra counted from the janma nakshatra |
| Chandra Bala | 0.30 | Transit Moon rashi counted from the janma rashi |
| Tithi group | 0.14 | Nanda / Bhadra / Jaya / Rikta / Purna |
| Vara | 0.11 | Friendship between the weekday lord and the janma rashi lord |
| Vimshottari | 0.11 | The running bhukti lord's relationship to the janma rashi lord |

### Tara Bala scores

`count = ((transitNakshatra − janmaNakshatra + 27) mod 27) + 1`, then `tara = ((count − 1) mod 9) + 1`.

| Tara | Score | |
|---|---|---|
| 1 Janma | 48 | mixed, favours rest |
| 2 Sampat | 95 | gain |
| 3 Vipat | 16 | hurdles |
| 4 Kshema | 85 | safety |
| 5 Pratyari | 22 | resistance |
| 6 Sadhaka | 90 | accomplishment |
| 7 Vadha | 10 | loss |
| 8 Mitra | 88 | friendly |
| 9 Parama Mitra | 100 | strongest |

### Chandra Bala scores

`house = ((transitRashi − janmaRashi + 12) mod 12) + 1`

| House | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Score | 68 | 60 | 90 | 32 | 55 | 85 | 78 | **12** | 58 | 88 | 96 | 26 |

House 8 is **Chandrashtama** and is flagged separately on screen and in print.

### Tithi group scores

| Group | Tithis in paksha | Score |
|---|---|---|
| Nanda | 1, 6, 11 | 75 |
| Bhadra | 2, 7, 12 | 86 |
| Jaya | 3, 8, 13 | 80 |
| Rikta | 4, 9, 14 | 30 |
| Purna | 5, 10, 15 | 90 |

### Graha friendship

Standard natural friendship table. `same = 85`, `friend = 90`, `neutral = 65`, `enemy = 40`.

The dasha contribution is `0.6 × friendship(janmaRashiLord, bhuktiLord) + 0.4 × naturalBenevolence(bhuktiLord)`, where benevolence runs Jupiter 90, Venus 85, Mercury 75, Moon 75, Sun 65, Mars 55, Saturn 50, Rahu 45, Ketu 45.

### Bands and classical guardrails

| Band | Range | Colour |
|---|---|---|
| High Energy | ≥ 70 | green |
| Steady | 45 – 69 | amber |
| Rest and Pray | < 45 | grey |

Two hard caps stop a bad day from being dressed up as a good one, whatever the other factors say:

- a **difficult tara** (Vipat, Pratyari, Vadha) caps the score at **55**, so it can never read as High Energy;
- **Chandrashtama** caps the score at **38**, so it always reads as Rest and Pray.

### Money days

A separate Artha score: `0.42 × chandraArtha + 0.28 × tara + 0.16 × tithi + 0.14 × varaArtha`.

- Chandra Artha by house: 11 → 100, 2 → 96, 10 → 82, 3 → 80, 6 → 76, 1 → 62, 9 → 55, 7 → 58, 5 → 50, 4 → 30, 12 → 20, 8 → 8
- Vara Artha: Thursday 95, Friday 90, Wednesday 85, Monday 70, Sunday 65, Tuesday 55, Saturday 45

A day is marked as a **money day** only when the score is ≥ 72 **and** it is not Chandrashtama, not a Rikta tithi, and not a difficult tara.

### Lucky signs

Deterministic, never random.

- **Numbers** — the classical graha numbers of the weekday lord and the janma rashi lord (Sun 1, Moon 2, Jupiter 3, Rahu 4, Mercury 5, Venus 6, Ketu 7, Saturn 8, Mars 9)
- **Colour** — the weekday lord's colour, shown as both a name and a swatch
- **Direction** — the weekday lord's direction

The Prasada card also carries a **standing** number, colour and direction from the janma rashi lord, which does not change day to day.

### Vrata and personal markers

Each day additionally carries flags for Ekadashi, Purnima, Amavasya, Pradosha, Sankashti Chaturthi and — the personal one — **Janma Nakshatra day**, the roughly monthly return of the Moon to the person's own birth star.

### Sampling

- Panchanga days run from sunrise, so each day is sampled at **06:00 local time**.
- Local offset is **IST (+05:30)** for Indian birth coordinates, otherwise `round(longitude / 15)` hours.
- 180 days are computed in one pass using `astronomy-engine` through the existing `siderealLongitudes`, honouring the user's ayanamsa and node-type settings.

---

## 4. Seva recommendation rules

`analyseChartForSeva` raises findings; each finding names the sevas it supports. A finding's full weight goes to its first seva, 55% to the second, 35% to the rest. Scores are summed and sorted.

| Finding | Weight | Condition | Sevas raised |
|---|---|---|---|
| Kala Sarpa | 95 | All seven grahas on one side of the Rahu–Ketu axis | Sarpa Samskara, Rudrabhisheka |
| Pitru dosha | 90 | Sun with Rahu/Ketu, or a malefic in the 9th | Pinda Pradana, Tripindi Shraddha, Narayana Bali |
| Sade Sati | 88 | Transit Saturn in the 12th, 1st or 2nd from the natal Moon | Shani Tila Homa, Maha Mrityunjaya Homa |
| Kuja dosha | 80 | Mars in house 1, 2, 4, 7, 8 or 12 | Kuja Shanti, Ganapati Homa |
| Afflicted Chandra | 74 | Moon in 6/8/12, or with Saturn, Rahu or Ketu | Rudrabhisheka, Maha Mrityunjaya Homa |
| Several weak grahas | 72 | Three or more grahas debilitated or in a dusthana | Navagraha Shanti, Rudrabhisheka |
| Nodal axis | 70 | Rahu in house 1, 5, 7 or 9 | Sarpa Samskara, Ganapati Homa |
| Eighth house | 68 | A malefic in the 8th | Maha Mrityunjaya Homa, Ayushya Homa |
| Saturn in a dusthana | 66 | Saturn in 6, 8 or 12 | Shani Tila Homa, Navagraha Shanti |
| Afflicted Guru | 64 | Jupiter debilitated, or with Rahu or Ketu | Ganapati Homa, Navagraha Shanti, Satyanarayana |
| Gokarna baseline | 55 | Always | Rudrabhisheka, Ganapati Homa, Satyanarayana Pooja |

Every recommendation shown on screen carries the sentence explaining what in the chart raised it, so nothing looks arbitrary.

### Catalog

Rudrabhisheka · Pinda Pradana · Narayana Bali · Tripindi Shraddha · Sarpa Samskara · Ganapati Homa · Chandi Homa · Maha Mrityunjaya Homa · Navagraha Shanti Homa · Kuja Shanti · Shani Tila Homa · Satyanarayana Pooja · Ayushya Homa

Each entry carries purpose, benefit, where at Gokarna, best timing, duration and a Sanskrit shloka — all in five languages.

---

## 5. Language purity

The hard requirement was that a Kannada calendar contains **only** Kannada, a Tamil one only Tamil, and so on, with no stray English or drifting machine translation.

The design decision that guarantees this:

- **No runtime translation of any kind.** No Gemini call, no translation API, no `i18nHydrate` for this feature. Every phrase is hand-authored once per language in `sevaLocale.ts`.
- **Lookup is by numeric index, never by matching an English word.** Rashis are `RASHI_L5[0..11]`, nakshatras `NAKSHATRA_L5[0..26]`, weekdays `WEEKDAY_L5[0..6]`, tithis `TITHI_L5[0..14]`. There is no string-matching step where a spelling mismatch could fall back to English.
- **`pick(phrase, lang)`** is the single accessor. The `L5` type is `Record<"en"|"kn"|"te"|"ta"|"hi", string>`, so TypeScript refuses to compile a phrase that is missing a language.
- **Numbers stay in Arabic numerals** (1, 2, 3), which is normal written practice in all five languages.
- **Shlokas and beeja mantras stay in Devanagari Sanskrit in every language**, with the *meaning* translated underneath. Marked `lang="sa"`.
- Wording was kept deliberately plain — short sentences a first-time visitor can act on, not astrological jargon.

This also means the feature works fully **offline**, costs nothing per user, and cannot be rate-limited.

---

## 6. Print output

Three PDFs, produced by the existing `generatePDFFromElement` helper via the `.pdf-page` strategy (one div = one page).

| Sheet | Pages | Contents |
|---|---|---|
| **Six-Month Calendar** | 2 | Header with name / rashi / nakshatra / gotra, legend, three months per page, closing shloka and disclaimer |
| **Blessing Letter** | 1 | Double-gold-ruled frame, salutation by name, the seva that was performed with its date and place, how to read the calendar, the seva's shloka, closing blessing and signature |
| **Prasada Card** | 1 | Standing lucky number / colour / direction, today's line, strongest days, money days, the personal beeja mantra |

Print-specific choices:

- Pages are **900 × 1273 px**, which is the A4 aspect ratio at the width `generatePDFFromElement` captures at.
- **All styling is inline hex**, not utility classes. html2canvas parses inline styles reliably and this sidesteps any colour-function issues in the CSS pipeline.
- Backgrounds are **cream `#FFFDF7`** with dark text — light on ink, and readable when photocopied.
- **No emoji.** Markers are plain Unicode geometry (`◆` money, `✦` pooja, `★` birth star, `❖` ornament) which render identically in canvas capture.
- The existing JPEG + compression settings in `pdfGenerator.ts` are reused, so file sizes stay small.

---

## 7. Extra features added beyond the original brief

- **Janma Nakshatra day marker** — the Moon's monthly return to the person's own birth star, flagged in red on the calendar. A natural, personal reason to visit the temple every month.
- **Chandrashtama warning** — the classical low day, called out explicitly rather than buried in a score.
- **Vrata markers** — Ekadashi, Purnima, Amavasya, Pradosha and Sankashti Chaturthi.
- **"Why this day"** — four to six plain sentences per day, so the guidance is explained rather than asserted.
- **Per-day beeja mantra** in Sanskrit with a chanting instruction.
- **Month at a glance** — strongest days, money days and gentle days as tappable chips.
- **Month counters** — how many high, money and rest days each month holds.
- **Seva record fields** — the operator picks which seva was performed and on what date; it prints on the blessing letter.
- **Disclaimer** on screen and on both printed sheets, in the reader's own language.

---

## 8. Verification

| Check | Result |
|---|---|
| `tsc --noEmit` (strict) | Clean, exit 0 |
| `vite build` (production) | Clean, exit 0 — 1405 modules transformed |
| Test suite | Run before commit |
| Files touched outside the feature | 3, all additive |

---

## 9. Operations — printing and packaging

Kept here for internal reference.

**Paper and printing**

- Calendar: 2 sheets, **A4 170–200 gsm matte**, colour, single-sided. Printing both sheets on one A3 also works and looks better on a wall.
- Blessing letter: 1 sheet, **A4 120 gsm ivory or parchment**, colour.
- Prasada card: print on **A4 250–300 gsm**, then trim to **A5**. Optional matte lamination so it survives the pooja shelf.
- Ask the press for **matte**, not gloss — gloss fights the cream background and shows fingerprints.

**Assembly**

1. Fold the letter once, place it in a **red or maroon envelope** with the name written by hand in the person's own language.
2. Roll the two calendar sheets together, tie with a **thin gold or red thread**.
3. Prasada card goes in a small **transparent sleeve**, together with the temple prasada — vibhuti, kumkum, akshate and a piece of the offering.
4. Everything into one **cloth bag** (unbleached cotton or khadi, maroon or saffron) with the Baggona Panchanga mark. Cloth over plastic: it gets reused, and it is what people expect from a kshetra.

**Presentation counter**

- Hand it over with both hands, and say the person's name and nakshatra out loud. That one gesture is what people remember.
- Keep a printed sample of each sheet on the counter so visitors can see what they are paying for before they book.
- QR code on the bag pointing at the app, so they can reopen the same calendar on their phone.

**Volume tip**

The calendar is the only part that must be printed per person. The envelope, thread, cloth bag and sleeve can all be bought in bulk and pre-assembled, so counter time per pilgrim stays under two minutes.
