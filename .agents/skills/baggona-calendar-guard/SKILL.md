---
name: baggona-calendar-guard
description: Mandatory rules and strict layout/data validation guards for Baggona Panchanga 90-Day Calendar, DailyDarshanaPage, color coding, Priest contact ("Shreeram Pandit"), and deep link determinism.
---

# Baggona Calendar & Daily Darshana Master Consistency Guard

This skill defines mandatory architectural constraints and verification checks for Baggona Panchanga calendar generation (`icsCalendarGenerator.ts`), deep-link PWA (`DailyDarshanaPage.tsx`), and priest directory (`sevaPriestDirectory.ts`).

## 1. 100% Deterministic Energy & Day Data Alignment Rule

- **Single Source of Truth**: The function `calculateDeterministicRhythmDay(targetDateStr, birthNakIdx, birthRashiIdx, startDateStr)` in `src/features/seva/icsCalendarGenerator.ts` is the ONLY valid calculation engine for rhythm day parameters.
- **No Divergent Math**: `DailyDarshanaPage.tsx` and `.ics` file generator MUST both use `calculateDeterministicRhythmDay`. Manual offset math (e.g. `transitNak = (birthNakIdx + daysElapsed) % 27`) is STRICTLY FORBIDDEN.
- **Deep Link Redirection Alignment**: When a devotee opens a deep link for a future date (e.g., `date=2026-09-05`), the energy score, vibe badge, Tara Bala, and Chandra Bala displayed MUST match the calendar entry for that date 100% identically.

## 2. 3-Color Dynamic Coding Guard (Red / Yellow / Green)

All UI cards, progress bars, status badges, and `.ics` calendar events MUST dynamically use the exact 3 status colors based on `energyScore` and caution state:

| Day Category | Conditions | Badge Emoji & Text | Theme Color | Border / Accent | `.ics` / Google Color |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Green (Auspicious / High Energy)** | Score ≥ 75%, Favourable Tara & Chandra | `🟢 HIGH ENERGY DAY` / `🟢 ಉತ್ತಮ ಶಕ್ತಿ ದಿನ` | Emerald Green | `#10B981` | `googleColorId: "10"`, `icalColor: "green"` |
| **Yellow (Balanced / Steady)** | Score 50% – 74% | `🟡 BALANCED DAY` / `🟡 ಸಮತೋಲಿತ ದಿನ` | Amber Gold | `#F59E0B` | `googleColorId: "5"`, `icalColor: "gold"` |
| **Red (Caution / Rest / Chandrashtama)** | Score < 50% OR Chandrashtama OR Difficult Tara | `🔴 CAUTION DAY` / `🔴 ಎಚ್ಚರಿಕೆಯ ದಿನ` | Crimson Red | `#EF4444` | `googleColorId: "11"`, `icalColor: "crimson"` |

## 3. Priest Name & Direct Phone Call Rule ("Shreeram Pandit")

- **Canonical Priest Name**: The default priest MUST ALWAYS be **Shreeram Pandit**:
  - `kn`: `"ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"`
  - `en`: `"Shreeram Pandit"`
  - `hi`: `"श्रीराम पंडित"`
  - `te`: `"శ్రీరామ్ పండితులు"`
  - `ta`: `"ஸ்ரீராம் பண்டிதர்"`
- **Call Banner Phrase**: Call action buttons in all 5 languages MUST follow the explicit wording:
  - *"If you need a calendar, call Shreeram Pandit: 9972339362"* (`"ಕ್ಯಾಲೆಂಡರ್ ಬೇಕಿದ್ದಲ್ಲಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರಿಗೆ ಕರೆ ಮಾಡಿ: 9972339362"`).
- **Direct Phone Dialing**: Must link to `tel:9972339362`. No WhatsApp redirection allowed.

## 4. Gold Banner Image Graphic Requirement

- The header image `/public/baggona_panchanga_gold_banner.jpg` MUST display **Baggona Panchanga** (`ಬಗ್ಗೋಣ ಪಂಚಾಂಗ · BAGGONA PANCHANGA`) prominently inside the graphic image itself.

## 5. Pre-Push Build Validation Guard

Before pushing any changes to Git:
1. Run `npm run build` to verify 0 TypeScript compiler errors.
2. Run `npm run test` (or `npx vitest run`) to verify all unit tests pass.
