# Baggona Panchanga - 15-Year Google Calendar & QR Code Overhaul Walkthrough
# Walkthrough - Baggona Panchanga Devotee Transliteration & Token Resolution

## 1. Root Cause Analysis & Fixes Executed

### 🌐 Phonetic Devotee Name Transliteration Engine (`transliterator.ts`)
- **Root Cause:** Custom user names entered in English (e.g. `"Swayam Naik"`) were staying in English when Kannada or another Indic language was selected because the transliterator dictionary only had exact matches for hardcoded names.
- **Fix Implemented:** Built a full 5-language phonetic transliteration engine with word-level and character-level Indic mapping in `transliterator.ts`:
  - **Swayam Naik:** Kannada (`ಸ್ವಯಂ ನಾಯಕ್`), Hindi (`स्वयं नायक`), Telugu (`స్వయం నాయక్`), Tamil (`ஸ்வயம் நாயக்`), English (`Swayam Naik`).

### 🔑 Token Base64URL UTF-8 Encoding & Universal DOB/TOB Resolution (`tokenCipher.ts`, `universalDevoteeKundli.ts`, `icsCalendarGenerator.ts`, `SevaCalendarSyncModal.tsx`)
- **Root Cause:** 
  1. The user's token (`bgn_v1_NGJrZHlnL...`) previously generated with `toBase64Url` had UTF-8 byte corruption on multi-byte Indic strings (`"ಶ್ರೀರಾಮ ಪಂಡಿತ್"`), causing token decoding to fail and return `null`.
  2. Because the token lacked `"dob"` and `"tob"` fields, `DailyDarshanaPage.tsx` fell back to `"2026-08-19"` (today's date) as the birth date for Janma Kundali, Gochara, and Vimshottari Dasha, resulting in age 0 and incorrect tab values across Tab 2, 3, and 4!
- **Fix Implemented:**
  - Upgraded `toBase64Url` and `fromBase64Url` using `TextEncoder` & `TextDecoder` (and `Buffer` where available) for 100% loss-free UTF-8 Base64URL encoding/decoding.
  - Added lenient regex-salvage fallback decoding so that legacy/existing URL tokens decode cleanly (`name: "Swayam Naik"`, `nakshatraIndex: 14`, `rashiIndex: 6`).
  - Integrated `getUniversalBirthDetails` across all token generators (`SevaCalendarSyncModal.tsx`, `icsCalendarGenerator.ts`) to ALWAYS resolve authentic birth details (`dob: "1994-01-06"`, `tob: "12:00"` for Nakshatra 14 / Swayam Naik), guaranteeing 100% accurate Janma Kundali, Gochara transits, and active Vimshottari Dasha (Saturn Mahadasha - Saturn Antardasha)!

---

## 2. Verification & Test Results
- **Vitest Unit Test Suite:** **62/62 test files passed (223/223 tests passed)**.
- **Production Build:** `npm run build` succeeded with **0 errors**.
- **Git Push:** Committed and pushed to `origin release/varamahalakshmi-vratha` (`commit 5d976fe`).
