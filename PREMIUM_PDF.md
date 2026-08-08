# Premium PDF — Language, Accuracy and Repetition Fixes

This covers the **Premium PDF** reached from the Bhavishya page, the one with the
**PDF Language** radio buttons above the download buttons.

Four things were wrong, and each is fixed below: the language radio was largely ignored,
the same phrases came back on every reprint, the Gochara chapter was reading the wrong sky,
and the book opened straight into content with no greeting.

No layout, no colour, no page size and no astrological rule was changed.

---

## 1. The language radio button now actually works

### What was happening

The radio button set a local `pdfLanguage`, but `generatePremiumPDF` only used it for the
seven AI calls and the filename. Everything else read `useAppStore().language` — the app's
own language — so choosing Kannada while the app was in English produced a book with
English headings, English labels, English life-stage chapters and English fallback text,
with only the AI chapters in Kannada.

The sibling function `generateA4PDF` in the same file already did it correctly, which is how
this was confirmed to be an oversight rather than a design decision.

### What changed

Inside `generatePremiumPDF` a single `const lang = pdfLanguage` now feeds every branch:

| Consumer | Before | After |
|---|---|---|
| Section headings and labels | app language | `lang` |
| Master prediction engine | app language | `lang` |
| Life-stage chapters | app language, never converted | translated into `lang` when it differs |
| Fallback text when a chapter fails | app language | `lang` |
| Blessing | app language | `lang` |
| Dasha and Bhukti names | machine-translated | locale table in `lang` |
| AI chapters | already correct | unchanged |

The radio also now tracks the app language until the reader touches it, and stops the moment
they do. Previously it was captured once at mount, so changing the app language afterwards
left the radio pointing at a stale value.

---

## 2. No more cross-language mixing or odd wording

The old code sent every heading, the person's **name**, and the birth date string through
`translateText`, a free Google Translate endpoint. That is where the strange words came from:
machine translation of a proper noun produces nonsense, and "25 Mar 1990, 10:30" comes back
mangled.

### What changed

A hand-authored table, `src/features/premiumPdf/premiumPdfLocale.ts`, now supplies every
fixed string in all five languages. It follows the same approach that already worked for the
Seva feature — write each phrase once per language, look it up by key, never translate at runtime.

- **The person's name is never translated.** It prints exactly as entered.
- **Birth date is built from the month table**, so it reads `25 ಮಾರ್ಚ್ 1990, 10:30` rather than
  whatever a translator returns.
- **Rashi, nakshatra and graha names come from the shared table** by numeric index, reusing the
  same vocabulary as the Seva calendar so the whole product speaks consistently.
- TypeScript will not compile a phrase that is missing one of the five languages.

### The AI side

Proper nouns were the biggest leak: asking a model to "translate the yoga names" invites it to
invent something. So the prompts now hand it the graha, rashi and nakshatra names **already in
the target script**. The model never translates a name, so it cannot mistranslate one.

On top of that, every prompt opens with a language contract that is explicit about the real
failure mode, which was never a wrong language but a correct language sprinkled with English:

- no English words anywhere, including inside JSON values
- no Latin letters in the values
- no English spelled out in the local script — the contract names the actual offenders
  (`ಕರಿಯರ್`, `ಬ್ಯಾಲೆನ್ಸ್`, `ಎನರ್ಜಿ`, and their Telugu, Tamil and Hindi equivalents)
- JSON keys stay English; only values change language
- write the way an astrologer speaks to a family at home, not like a textbook

---

## 3. Repeated wording between reprints and between chapters

### Why it happened

Three separate causes, all now addressed.

**Every chapter shared one persona.** `askGemini` wrapped each prompt in the same shell —
*"You are a highly knowledgeable Vedic Astrologer providing an empathetic reading"* — and then the
inner prompt said *"You are an expert Vedic astrologer"* again. Seven calls, one voice, overlapping
data: the model naturally produced seven similar openings.

**No chapter knew the others existed.** Each is a separate API call, so the summary would
re-explain the yogas and the characteristics chapter would drift into the transits.

**Default sampling.** No `generationConfig` was set, so repeat downloads landed on near-identical
phrasing.

### What changed

- `askGemini` gained an optional `raw` mode that sends the prompt exactly as written, so each
  chapter keeps its own distinct persona. Existing callers are untouched — the parameter is
  optional and the old wrapper still applies when it is absent.
- Each chapter now has a **different voice**: the scholar for yogas, the quiet elder for the
  hidden truth, the problem-solver for doshas, the farmer reading the season for the timeline.
- Every prompt carries a **scope contract** naming what the other six chapters cover, with an
  instruction to stay inside its own and not restate the rest.
- Specific banned openings: no "the planets shape your destiny", no "the cosmos", no "the stars
  guide your path". Begin with something true of this chart.
- No two paragraphs may open with the same word.
- A per-download **run id** is embedded, with the instruction that a reprint must be worded
  differently while the astrological facts stay identical.
- `temperature: 1` with `topP: 0.95` for the premium calls only.

---

## 4. Maximum use of the engines

The old prompts fed the model very little: a yoga list, a shadow-self string, and the raw natal
planet array as JSON.

Every chapter now receives one shared, fully grounded fact block:

- lagna, chandra rashi, janma nakshatra, surya rashi
- all nine grahas with rashi, bhava, and retrograde / debilitated / exalted flags
- **the running Mahadasha and Bhukti**, with the age the Bhukti ends
- **live transit positions for today**, each with its house counted from the birth Moon
- the yogas and doshas the B.V. Raman engine actually detected
- the remedies the Parihara engine recommends, so remedies are grounded rather than invented
- the current life phase, overall tone, career and money notes from the master synthesis
- the twelve-month roadmap from the timing layer

Each chapter is told to name the graha, rashi or bhava it is reading a claim from, and that a
statement which could apply to anyone counts as a failure.

### A real accuracy bug found on the way

The Gochara chapter was labelled "Current Transit Positions" but was being handed
`session.result.planets` — the **birth** chart. Every transit reading in every premium PDF was
written against the wrong sky.

It now calls `getTransitsForDate(moonSignIndex, now, ayanamsaModel)`, which computes today's real
positions and the house of each from the birth Moon, honouring the user's ayanamsa setting.

### One more input fix

The characteristics prompt filtered the prediction list with
`p.translatedCategory === "Core Personality"`. Once the app language was not English,
`translatedCategory` held a Kannada or Tamil string, the filter matched nothing, and the model was
asked to describe a personality with no personality data attached. The chapter now draws from the
shared fact block instead.

---

## 5. The new introduction

The book now opens with a greeting before the first chapter, in the reader's own language:

> **ನಮಸ್ಕಾರ ರಮೇಶ್,**
>
> ಈ ಫಲವನ್ನು ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಆಧಾರದ ಮೇಲೆ ನಿಮಗಾಗಿಯೇ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.
>
> ಈ ಸಮಯದಲ್ಲಿ ನೀವು ಗುರು ಮಹಾದಶೆಯಲ್ಲಿ, ಅದರೊಳಗೆ ಶನಿ ಭುಕ್ತಿಯಲ್ಲಿ ನಡೆಯುತ್ತಿದ್ದೀರಿ.
>
> ಇನ್ನು ಕೆಳಗೆ ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಫಲ ಆರಂಭವಾಗುತ್ತದೆ.

It sits between the birth-details box and the first chapter, inside a double-ruled frame matching
the rest of the document.

The running-period line is a **whole sentence per language**, not fragments glued together, because
word order differs across the five. The graha names are substituted from the shared table, so
Kannada gets ಗುರು and Tamil gets குரு with no translation step.

The greeting is written by hand in all five languages and never goes near the AI, so it cannot come
out wrong. Hindi gets the respectful `जी` after the name.

---

## 6. Files

### Added

| File | Purpose |
|---|---|
| `src/features/premiumPdf/premiumPdfLocale.ts` | Hand-authored five-language strings, the greeting, the running-period sentence, the date formatter, and the per-language rules used to build prompts |
| `src/features/premiumPdf/premiumPrompts.ts` | The shared chart-fact block and all seven chapter prompts, with the scope and language contracts |

### Modified

| File | Change |
|---|---|
| `src/components/RamanBhavishya/BhavishyaView.tsx` | `generatePremiumPDF` follows `pdfLanguage` throughout; real transits; new prompts; localised life-stage chapters; radio tracks app language until touched |
| `src/components/RamanBhavishya/PdfTemplate.tsx` | Renders the introduction. The new fields are optional, so the other two exports are unaffected |
| `src/core/GeminiEngine.ts` | Optional `raw` and `temperature` options. Default behaviour unchanged for every existing caller |
| `vitest.config.ts` | Excludes `scratch/` from test discovery |

---

## 7. About `src/core/AstroEngine.ts`

It is not missing from any branch. Checking every ref on the remote, no commit has ever added or
deleted a file by that name — it was renamed to `src/core/EphemerisEngine.ts`, and
`getAyanamsaModel` was dropped in favour of passing the `AyanamsaModel` string directly.

The only things still pointing at the old name are one-off debugging scripts in `scratch/`. They
contain `console.log` calls and no assertions, but were named `*.test.ts`, so Vitest kept picking
them up and reporting four failures that had nothing to do with the app. They are now excluded from
test discovery rather than deleted, so they remain available if you want them.

| Old symbol | Where it lives now |
|---|---|
| `siderealLongitudes` | `src/core/EphemerisEngine.ts`, same signature |
| `getAyanamsaModel("Lahiri")` | Removed. Pass `"lahiri"`, `"drik_ganita"` or `"vakya"` directly |
| `getHinduSunTimes` | `src/core/hinduSunTimes.ts` / `src/core/birthSunTimes.ts` |
| `getNakshatraStart` / `getNakshatraEnd` / `getTithiEnd` | `src/core/VedicCalculations.ts` |

---

## 8. What was deliberately left alone

- Every astrological rule, formula and threshold.
- The page layout, colours, fonts, spacing and page size.
- The other two exports on the page, plain **Download PDF** and **Premium A4 PDF**.
- The separate premium PDF on the Baggona Predictions page, which has no language radio and was
  not the one being reported.
- The pre-existing failures in `i18n`, `muhurtha`, `traditionalBaggona`, `jayashreePrediction` and
  `baggonaRules`. These fail identically on a clean checkout and are unrelated to this work.
