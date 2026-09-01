---
name: baggona-astrology-master
description: Master skill for the Baggona Panchanga Astrology project. Defines strict rules on API model selection (gemini-3.5-flash-lite), quota protection, project architecture, 5-language locale system, and development guidelines.
---

# Baggona Astrology Master Skill

This is the primary authority skill for the Baggona Panchanga Astrology codebase. Activate or reference this skill when performing core architecture changes, API integrations, engine updates, or multi-language features.

## 1. API Quota & Rate Limit Protection (CRITICAL)
- **Model Standard**: Codebase MUST exclusively use `gemini-3.5-flash-lite` for all Gemini AI calls (e.g. in `src/core/GeminiEngine.ts` and `BhavishyaView.tsx`).
- **DO NOT CHANGE MODEL**: Never change `gemini-3.5-flash-lite` to `gemini-1.5-flash` or `gemini-2.0-flash`. Standard models trigger strict rate limits (e.g., 20 requests/day) and lock the user out for days.
- **3-Attempt Automatic Retry**: All Gemini requests must implement an automatic 3-retry loop with exponential backoff (2s, 3s, 4.5s) to handle transient 429 / 503 errors gracefully.
- **API Call Conservation**: Batch API requests or execute sequentially where needed to avoid concurrency throttle. Never fire duplicate calls for data already computed by the local C++/JS engines (`TraditionalBaggonaEngine.ts` / `BaggonaPredictionEngine.ts`).

## 2. 5-Language Native Locale Engine
- The project supports **5 Indian & Global Languages**: Kannada (`kn`), Telugu (`te`), Tamil (`ta`), Hindi (`hi`), and English (`en`).
- **No Machine Translation Leaks**: Hand-authored 5-language dictionaries (`premiumPdfLocale.ts`, `sevaLocale.ts`) MUST be used for names, Grahas, Rashis, Nakshatras, Weekdays, and Section Headers.
- **Proper Nouns**: User names (`session.input.name`) are NEVER machine-translated.
- **Greeting Line**: Use `greetingLine(lang, name)` which returns pure native script (e.g., `ನಮಸ್ಕಾರ ಪ್ರಮೋದ್ ಕೊಡಗಿ,`).

## 3. Architecture & Code Structure
- **Framework**: React 18, Vite 5, Tailwind CSS, TypeScript.
- **Engines**: 
  - `TraditionalBaggonaEngine.ts`: Offline 100% mathematical Panchanga, Vara, Tithi, Nakshatra, Yoga, Karana, Dasha/Bhukti calculator.
  - `GeminiEngine.ts`: Gemini API interface for AI narrative predictions.
  - `BaggonaPredictionEngine.ts`: Classical B.V. Raman prediction rules.
- **State Management**: Zustand store (`useKundliViewerStore`, `useAppStore`).

## 4. Verification & Testing Protocol
- Always run `npm run build` to verify zero TypeScript errors before declaring a task complete.
- Test dev server using `npm run dev -- --port 5173`.
- Commit all changes to the active release branch (`release/seva-and-prasada` or feature branch).

## 5. Calendar & Daily Darshana Guard Rules
- **Deterministic Math**: Always use `calculateDeterministicRhythmDay` in `icsCalendarGenerator.ts` to ensure calendar `.ics` entries and `DailyDarshanaPage.tsx` deep link data match 100% deterministically.
- **Dynamic 3-Color Coding**: Green for High Energy (≥75%), Yellow for Balanced (50%–74%), Red for Caution (<50% or Chandrashtama/Difficult Tara).
- **Priest Name**: Default priest MUST ALWAYS be **Shreeram Pandit** (`"ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"`). Direct call action MUST state: *"If you need a calendar, call Shreeram Pandit: 9972339362"*.
- **Reference Guard Skill**: For full details, see `.agents/skills/baggona-calendar-guard/SKILL.md`.

## 6. Daily Darshana Audio Rules (STRICT MANDATE)
- **Zero Pre-Recorded Static Audio Files**: NEVER use or play pre-recorded `.webm` or static audio clips on the Daily Darshana page. All speech must be dynamically synthesized in real-time from live text via Sarvam AI Indic Neural TTS (`bulbul:v3`) with in-browser Web Speech Synthesis fallback.
- **Mandatory Button Loaders**: Every voice / dhwani button on `DailyDarshanaPage.tsx`, `DailyPoojaSankalpaModal.tsx`, and `RemedyJapa11Counter.tsx` MUST show an explicit loading indicator (spinner + `⏳ ಧ್ವನಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...` / `Synthesizing...`) while the neural TTS network request is in flight so the user receives instant visual feedback.

