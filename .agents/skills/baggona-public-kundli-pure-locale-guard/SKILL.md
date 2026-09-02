---
name: baggona-public-kundli-pure-locale-guard
description: Mandatory rules and validation guards for Baggona Panchanga Public Kundli, pure language localization (zero English token leakage into Indic text), 100% dynamic astronomical calculations (Maandi, Lagna, Dasha, Bhavas), and upward floating red coin deduction animations.
---

# Baggona Public Kundli Pure Locale & Dynamic Engine Guard

This skill enforces strict language purity, dynamic Parashari astronomical calculations, and coin deduction animations for the Baggona Panchanga Public Kundli platform.

## Core Mandates

### 1. Pure Language Localization (Zero English Leaks)
- **No English Identifiers in Indic Content**: Under NO circumstance should English strings (e.g. `"Virgo"`, `"Scorpio"`, `"Anuradha"`, `"Sun"`) appear in Kannada, Hindi, Telugu, or Tamil paragraphs.
- **Mandatory Translation Maps**:
  - `RASHI_NAMES_5L[rashi]?.[lang]`
  - `NAKSHATRA_NAMES_5L[nakshatra]?.[lang]`
  - `GRAHA_NAMES_5L[planet]?.[lang]`
- **Local Numeral Formatting**: For Kannada, all house numbers, padas, ages, and Ghatis must use Kannada numerals (`೦–೯`) via `toKnDigits`.

### 2. 100% Dynamically Computed Astrological Profile
- Every planetary placement, house placement, Vimshottari Dasha entry, Bhukti date, and Upagraha (Maandi / Gulika) MUST be dynamically computed based on the devotee's birth coordinates, date, time, and birthplace sun times (`computeMaandi`).
- Amshakas must always be calculated Parashari Navamsha indices (1–12) via `patrikaNavamshaFromDegree(degree)`.

### 3. Upward Floating Coin Deduction Animation (-1,000 in Red)
- When coins are deducted (such as 1,000 coins for unlocking Tab 3 Personality & Hidden Secrets, or 500 coins for custom questions or chart generation):
  - A red animated badge (`-1,000 Coins (₹100)` or `-500 Coins (₹50)`) MUST float UPWARDS and fade out using `@keyframes coin-deduct-float-up`.
  - Rendered both as an eye-level screen toast and directly above the action button (Tab 3 Personality button).
  - Synchronized with `useWalletStore`.

## Validation Protocol

Before completing any task or committing changes:
```bash
npm test -- src/tests/publicKundliPage.test.tsx --run
npx tsc --noEmit
npm run build
```
