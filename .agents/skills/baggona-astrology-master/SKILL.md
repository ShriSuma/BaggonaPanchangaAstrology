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

## 7. 50-Profile Benchmark, Janma Hora (Kora) & Vajra-Hawala Parashari Rules (MANDATORY)
- **6-Anga Complete Panchanga Mandate**:
  - Every calculation and PDF header MUST include all 6 classical elements: **Vara (Weekday)**, **Tithi**, **Nakshatra**, **Yoga**, **Karana**, and **Janma Hora (Birth Hora)**.
  - Janma Hora is computed astronomically using sunrise/sunset and descending Chaldean planetary order (`Sun -> Venus -> Mercury -> Moon -> Saturn -> Jupiter -> Mars`).
- **Parashari Gemstone Harmony (Hawala vs Vajra)**:
  - **Hawala (ಕೆಂಪು ಹವಳ / Red Coral / Pravala - Mars)**:
    - *Prescribed*: Cancer & Leo (supreme Yogakaraka 5th/10th or 4th/9th), Aries & Scorpio (Lagna Lord), Sagittarius & Pisces (5th or 2nd/9th benefic).
    - *Strictly Prohibited*: Gemini & Virgo (malefic 6th/11th or 3rd/8th dusthana), Taurus & Libra (Maraka 7th/12th or 2nd/7th).
  - **Vajra (ವಜ್ರ / Diamond / Heera - Venus)**:
    - *Prescribed*: Capricorn & Aquarius (supreme Yogakaraka 5th/10th or 4th/9th), Taurus & Libra (Lagna Lord), Gemini & Virgo (5th or 9th Trikona lord).
    - *Strictly Prohibited*: Aries & Scorpio (Maraka 2nd/7th or 7th/12th), Cancer & Leo (enemy 4th/11th or 3rd/10th).
  - *Mutual Incompatibility Rule*: Never prescribe Vajra (Diamond) and Hawala (Red Coral) simultaneously on the same hand without sanctified separation due to elemental Agni-Jala conflict.
- **10-Bracket Age-Adaptive Emotional Fidelity Protocol**:
  - `<2` (Infant): Pediatric immunity, balarishta protection, maternal bonding. Zero career/marriage.
  - `<8` (Early Child): Playful curiosity, speech/cognitive development, primary school adjustment.
  - `<13` (Tween): Academic foundations, artistic/sports sparks, peer dynamics, parental guidance.
  - `<18` (Adolescent): Board exam stress, identity formation, talent cultivation, distraction shields.
  - `<25` (Young Adult): College/early career launch, fierce ambition, athletic/creative breakthroughs.
  - `<30` (Late 20s): Career scaling, Saturn Return onset, relationship/marriage crossroads.
  - `<35` (Early 30s): Established profession, family founding, domestic balance vs ambition.
  - `<40` (Late 30s): Prime leadership peak, midlife crossroads, legacy consolidation.
  - `<60` (40s-50s): Senior summit, second careers, resilience through divorce/adversity, mentorship.
  - `<80+` (Senior): Lifelong companionship, spiritual peace, health maintenance, global wisdom.
- **Vimshottari Turning Point & Gochara Synchronization**:
  - Turning points MUST correlate with major Mahadasha shifts (Jupiter, Venus, Saturn returns).
  - Current life reality (2024–2026) MUST reflect live transit positions (Saturn in Pisces/Aquarius, Jupiter in Taurus/Gemini) mapped to current emotional realities and challenges.

## 8. 20-Minute Live Consultation Voice Dictation & AI Question Refiner Guard Rules (MANDATORY)
- **Zero Word/Phrase Repetition Mandate**:
  - In voice speech recognition, every spoken word MUST appear exactly once in the question transcript. Never allow single-word echoes (e.g., "ಯಾವಾಗ ಯಾವಾಗ..." or "when when..."), acoustic repetitions, or multi-word phrase stutter loops.
  - Multi-pass token deduplication in `consultationSpeechService.ts` (`collapseConsecutiveTokens` and `sanitizeDuplicateSpeechWords`) MUST collapse any number of repetitions (even 10, 20, or 50 times) in a single pass.
  - Suffix-prefix merging MUST never concatenate an incoming chunk if that segment is already contained within `baseText`.
- **Browser Auto-Restart Hygiene**:
  - When the browser Web Speech API auto-ends due to natural silence pauses, the engine MUST destroy the old `SpeechRecognition` instance and create a fresh instance upon auto-restart. This prevents Chromium internal result buffer leaks from re-emitting historical words.
- **Fast 2-3s AI Question Refinement Protocol**:
  - Immediately upon finishing voice dictation (mic stop or natural pause), the system MUST trigger `refineSpokenConsultationQuestion` using model `gemini-3.5-flash-lite`.
  - The Send button and mic MUST remain disabled with an active pulsing indicator (`✨ AI ಪ್ರಶ್ನೆಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದೆ... (೨-೩ ಸೆಕೆಂಡುಗಳು)`) during the review.
  - The AI refiner cleans speech artifacts, fixes broken phrasing, and outputs exactly ONE respectful, meaningful Vedic astrological question in the user's selected language (in native script) within 2-3 seconds.
  - A strict 2.5-second race timeout ensures that if the network or API fails, the sanitized transcript is immediately supplied as fallback so the devotee is never blocked.



