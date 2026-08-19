# Baggona Panchanga - 15-Year Google Calendar & QR Code Overhaul Walkthrough
# Walkthrough - Baggona Panchanga Devotee Transliteration & Token Resolution

## 1. Root Cause Analysis & Fixes Executed

### 🌐 Phonetic Devotee Name Transliteration Engine (`transliterator.ts`)
- **Root Cause:** Custom user names entered in English (e.g. `"Swayam Naik"`) were staying in English when Kannada or another Indic language was selected because the transliterator dictionary only had exact matches for hardcoded names.
- **Fix Implemented:** Built a full 5-language phonetic transliteration engine with word-level and character-level Indic mapping in `transliterator.ts`:
  - **Swayam Naik:** Kannada (`ಸ್ವಯಂ ನಾಯಕ್`), Hindi (`स्वयं नायक`), Telugu (`స్వయం నాయక్`), Tamil (`ஸ்வயம் நாயக்`), English (`Swayam Naik`).

### 🔑 Token Base64URL UTF-8 Encoding & Universal DOB/TOB Resolution (`tokenCipher.ts`, `universalDevoteeKundli.ts`, `icsCalendarGenerator.ts`, `SevaCalendarSyncModal.tsx`, `KundliPage.tsx`)
- **Root Cause Discovered:**
  1. The user entered Swayam Naik's birth profile as **`05-02-2006`** (5th February 2006) at **`14:04`** (2:04 PM IST).
  2. Previously, when generating a token or sharing a link/QR code, `dob` and `tob` were not explicitly attached to `encodeDevoteeToken({ ... })`, nor was `baggona_kundli_session` saved to `localStorage` on Kundli generation.
  3. Consequently, the token omitted `dob` and `tob`, causing `DailyDarshanaPage.tsx` to fall back to the default reference birth date of `1994-01-06`, resulting in incorrect ages and invalid Dasha/Kundali outputs across Tab 2, 3, and 4!
- **Fix Implemented:**
  - Updated `KundliPage.tsx` to persist `baggona_kundli_session` (`birthDate: "2006-02-05"`, `birthTime: "14:04"`) directly to `localStorage` upon Kundli creation.
  - Updated `SevaCalendarSyncModal.tsx` and `icsCalendarGenerator.ts` to ALWAYS include explicit `dob` (`"2006-02-05"`) and `tob` (`"14:04"`) in every generated token payload.
  - Verified Swayam Naik's exact birth chart for **05-Feb-2006 at 14:04 IST**:
    - **Lagna:** Vrishabha Lagna (Taurus - Index 1)
    - **Moon Rashi:** Mesha Rashi (Aries - Index 0)
    - **Moon Nakshatra:** Bharani Nakshatra (Index 1)
    - **Age (Aug 2026):** 20.53 Years
    - **Active Vimshottari Dasha:** Moon Mahadasha - Sun Antardasha (20.21 to 20.71 years / Feb 2026 - Aug 2026)

---

## 2. Verification & Test Results
- **Vitest Unit Test Suite:** **62/62 test files passed (223/223 tests passed)**.
- **Production Build:** `npm run build` succeeded with **0 errors**.
- **Git Push:** Committed and pushed to `origin release/varamahalakshmi-vratha` (`commit 5d976fe`).
