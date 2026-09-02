# Mandatory Guard Rules for Public Kundli, Pure Language Localization & Dynamic Engine

Whenever modifying `src/features/publicKundli/publicKundliEngine.ts`, `src/pages/PublicKundliPage.tsx`, `src/components/kundli/JyotishyaSaramshaTable.tsx`, or `src/components/kundli/DwadashaBhavaKundliChart.tsx`, you MUST adhere to and validate against these strict rules before declaring work complete or committing to Git.

---

## 1. Zero Interlanguage Leaks (Strict Pure Language Localization)

1. **No English Token Leakage in Indic Scripts**:
   - When generating or rendering astrological content in Kannada (`kn`), Hindi (`hi`), Telugu (`te`), or Tamil (`ta`), **ZERO English words or sign/star identifiers may leak into the narrative**.
   - Astronomical entities (Rashis, Nakshatras, Grahas, Upagrahas, Lagnas) MUST always be resolved via localized translation dictionaries:
     - `RASHI_NAMES_5L[rashi]?.[lang]` (e.g. `Virgo` -> `ಕನ್ಯಾ` in Kannada, `कन्या` in Hindi).
     - `NAKSHATRA_NAMES_5L[nakshatra]?.[lang]` (e.g. `Anuradha` -> `ಅನುರಾಧಾ`).
     - `GRAHA_NAMES_5L[planet]?.[lang]` (e.g. `Sun` -> `ರವಿ`, `Saturn` -> `ಶನಿ`, `Maandi` -> `ಮಾಂದಿ`).
   - **FORBIDDEN**: Never interpolate raw English variables directly into Kannada/Indic template strings (e.g., never write `${p.maandiRashi} ರಾಶಿಯಲ್ಲಿ` which produces `"Virgo ರಾಶಿಯಲ್ಲಿ"`).
   - **CORRECT**: Always write `${maandiRashiTxt} ರಾಶಿಯಲ್ಲಿ` where `maandiRashiTxt` is resolved from `RASHI_NAMES_5L`.

2. **Authentic Localized Numerals**:
   - For Kannada text, numbers such as Bhava numbers, Pada numbers, ages, and Ghati-Vighati must be rendered with authentic Kannada numerals (`೦, ೧, ೨, ೩, ೪, ೫, ೬, ೭, ೮, ೯`) using `toKnDigits` or `toKnNum` (e.g., `೩ನೇ ಭಾವದಲ್ಲಿ`, `ಪಾದ ೧`).

---

## 2. 100% Mathematically Dynamic Calculations (Zero Static Data)

1. **Parashari Astronomical Calculations**:
   - All positions (Lagna, 9 planets, and Upagraha Maandi/Gulika) MUST be dynamically computed based on the devotee's birth date, birth time, latitude, longitude, and sunrise/sunset.
   - `computeMaandi` determines day vs. night birth using birthplace sunrise and sunset times, calculates the exact Ghati for the weekday, and determines the precise sidereal longitude, Rashi, and house.
   - Navamsha Amshaka (ಅಂಶಕ ೧–೧೨) must always be dynamically derived using `patrikaNavamshaFromDegree(degree)` and formatted with `formatChartHouseNumber(..., lang)`.

2. **Personalized Spoken Astrologer Synthesis**:
   - All 5 sections of Tab 3 (Personality, Hidden Secrets, Why Astrology Right Now, 4 Burning Questions, Maandi Inquest) must be dynamically constructed from the devotee's actual Lagna lord, 10th lord, 7th lord, 6th lord, 5th lord, current Mahadasha, Bhukti, and transits.

---

## 3. Upward Floating Coin Deduction Animation (-1,000 in Red)

1. **Visual & Kinetic Requirements**:
   - When priest coins or user credits are deducted (e.g., 1,000 coins for unlocking Tab 3 Personality, 500 coins for chart generation or custom questions), an animated floating badge MUST appear.
   - The badge MUST display the deduction amount in **bold crimson red** (e.g., `-1,000` or `-1,000 Coins (₹100)`).
   - The animation MUST float **UPWARDS** and fade out using `@keyframes coin-deduct-float-up` (`.animate-coin-deduct-float`).

2. **Placement & Sync**:
   - Displayed prominently both at the screen-level toast (eye-level floating banner) and locally right above the unlocked action button (e.g., over the Tab 3 Personality tab).
   - In addition to local animation state, deduction MUST register with `useWalletStore` so global wallet pill indicators remain synchronized.

---

## 4. 100% Enterprise Security Guard Mandates

1. **Input Sanitization & Anti-XSS (Pillar 3: 100%)**:
   - Every text input (`form.name`, `form.gothra`, `customQuestionInput`, `userQuestion`) MUST pass through `sanitizeDevoteeInput(input, maxLength)` before execution or database persistence.
   - All HTML tags, script elements, event attributes, and control characters must be completely stripped while preserving full Unicode Indic scripts.

2. **AI Quota & Denial-of-Service (DoS) Shield (Pillar 4: 100%)**:
   - All live AI analysis invocations MUST pass through `checkLiveAiRateLimit()` and `recordLiveAiInvocation()` from `src/utils/publicKundliSecurity.ts`.
   - A mandatory 20-second cooldown and a maximum of 3 AI requests per 10 minutes per browser/device must be strictly enforced.
   - In-memory deterministic chart session caching (`getCachedLiveAnalysis`) must be checked first before initiating external API requests.

3. **Public Guest Wallet & Priest Master Wallet Shielding (Pillar 5: 100%)**:
   - Anonymous public visitors MUST NEVER deduct coins from the priest master wallet (`wallets/PRIEST`).
   - Deductions for anonymous visitors must route through `deductGuestCoins` against an isolated local `PublicGuestWallet` (2,500 complimentary guest coins).
   - Only authenticated priests or URLs with an explicit, verified `priestId` parameter may deduct from priest accounts.

---

## 5. Mandatory Pre-Commit & Pre-Push Validation

Every modification affecting Public Kundli or localized astrology must be validated with:

```bash
npm test -- src/tests/publicKundliPage.test.tsx --run
npx tsc --noEmit
npm run build
```

All commands MUST complete with 0 failures and 0 errors before committing or pushing to git.

