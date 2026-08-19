---
name: baggona-daily-darshana-token-guard
description: Mandatory rules and strict layout/data validation guards for Baggona Panchanga DailyDarshanaPage.tsx and tokenCipher.ts. Enforces authentic birth Kundli calculation (DOB/TOB), transit vs natal separation, Base64URL resilient decoding with TextDecoder, gold banner display with Kannada text "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥", 4-tab system integrity, and pre-push build validation.
---

# Baggona Daily Darshana & Token Cipher Master Consistency Guard

This skill defines mandatory architectural constraints, calculation rules, and verification protocols for **Daily Darshana Page** (`src/pages/DailyDarshanaPage.tsx`) and **Devotee Token Cipher Engine** (`src/utils/tokenCipher.ts`).

---

## 1. Daily Darshana Page (`DailyDarshanaPage.tsx`) Architecture Rules

### A. Authentic Natal Birth Kundli Calculation Rule
- **No Transit Overriding in `birthKundli`**: The `birthKundli` state MUST be computed purely from the devotee's birth parameters (`birthDateStr`, `birthTimeStr`, `userLat`, `userLng`, `userPincode`) via `calculateKundli(...)`.
- **FORBIDDEN**: Modifying or overriding the Moon planet in `birthKundli` with transit token values (`decoded?.r` or `decoded?.nk`). Transit parameters belong to daily panchang/Gochara, NOT the natal chart.

### B. DOB & TOB Extraction Hierarchy
When determining birth parameters for `birthKundli`:
1. **URL Query Parameters**: `?dob=YYYY-MM-DD&tob=HH:mm`
2. **Decoded Token Payload**: `(decoded as any)?.dob`, `(decoded as any)?.tob`
3. **Stored Session Profile**: `storedSession?.birthDate`, `storedSession?.birthTime`
4. **Devotee Default Fallback**: If devotee name contains `"Manoj"` or `"ಮನೋಜ್"`, default birth parameters MUST be **`1993-03-16`** and **`01:40`** (at Gokarna `14.5479`, `74.3187`), which correctly computes:
   - **Ascendant / Lagna**: `Dhanu Lagna` (Sagittarius, ~249.72°)
   - **Moon Sign / Rashi**: `Dhanu Rashi` (Sagittarius, Index 8)
   - **Moon Star / Nakshatra**: `Mula Nakshatra` (Index 18)

### C. Transit vs Natal Chart Separation
- **`birthKundli`**: Computes the permanent Natal Birth Chart using `birthDateStr` and `birthTimeStr`.
- **`transitKundli`**: Computes the temporary Gochara (Transit Chart) for today's date (`dateParam` at `06:00 AM`).

### D. Gold Banner Graphic Header Guard
- **Mandatory Header Image**: `/baggona_panchanga_gold_banner.jpg` MUST be rendered near the top of `DailyDarshanaPage.tsx` under the title tag.
- **Graphic Text Requirement**: The banner image MUST feature 3D gold embossed Kannada text **`॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥`** and English text **`Baggona Panchanga`**.
- **Subtitle Requirement**: Must display `{dict.creationSubtitle}` below the banner image.

### E. 4-Tab Navigation Preservation
The 4 main tabs MUST remain fully operational and intact:
1. **`darshana`**: Daily Darshana, Rhythm Meter, Kaala Timings, Priest Contact ("Shreeram Pandit").
2. **`kundali`**: Janma Kundali Chart (South Indian Layout), Lagna, Moon Rashi, Nakshatra, Planetary Table.
3. **`gochara`**: Gochara Planetary Transits, Ashtamama Shani / Rahu / Ketu / Guru transit analysis.
4. **`dasha`**: Vimshottari Dasha Bhukti Timeline & Life Stage Predictions.

---

## 2. Devotee Token Cipher Engine (`tokenCipher.ts`) Rules

### A. Base64URL Resilient Text Decoder
- `fromBase64Url` MUST utilize `new TextDecoder("utf-8", { fatal: false })` to convert decoded binary bytes into UTF-8 strings.
- This prevents `URIError: URI malformed` crashes when URL tokens contain truncated multi-byte Indic character strings (Kannada, Telugu, Tamil, Hindi).

### B. Payload Structure & Field Alignment
`DevoteeTokenPayload` MUST support both compact key shorthands and full key names:

| Compact Key | Full Key Name | Type | Description / Default |
| :--- | :--- | :--- | :--- |
| `n` | `name` | `string` | Devotee Display Name |
| `nk` | `nakshatra` | `number` | Nakshatra Index (0–26) |
| `r` | `rashi` | `number` | Rashi Index (0–11) |
| `g` | `gotra` | `string` | Gotra Name |
| `p` | `pandit` | `string` | Priest Name (default `"ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"`) |
| `d` | `date` | `string` | Panchanga Date (YYYY-MM-DD) |
| `l` | `lang` | `string` | Locale (`kn`, `en`, `hi`, `te`, `ta`) |
| `tm` | `time` | `string` | Alert Time (HH:mm) |
| `dob` | `dob` | `string` | Date of Birth (YYYY-MM-DD) |
| `tob` | `tob` | `string` | Time of Birth (HH:mm) |
| `pc` | `pincode` | `string` | Pincode (default `"581326"`) |
| `lt` | `lat` | `number` | Latitude (default `14.54`) |
| `lg` | `lng` | `number` | Longitude (default `74.31`) |
| `loc` | `locationName`| `string` | Location Name (default `"Gokarna"`) |

### C. Security & Graceful Failure
- **Checksum Verification**: Valid `bgn_v1_` tokens with minor checksum mismatches log a warning and fallback to resilient extraction.
- **Corrupted / Garbage Tokens**: Invalid tokens or tokens with `hasAnyPayloadKey === false` MUST return `null`.

---

## 3. Mandatory Validation Checklist

Before committing or pushing any edits to `DailyDarshanaPage.tsx` or `tokenCipher.ts`:

```bash
# 1. Run full Vitest unit test suite (Must pass 100%)
npx vitest run

# 2. Run TypeScript & Vite production build (Must pass with 0 errors)
npm run build
```

Verify that testing Manoj Poornamatha (`1993-03-16 01:40 AM` at Gokarna) returns:
- `ascendant`: `249.72°` -> **Dhanu Lagna**
- `rashi`: `Dhanu` (Index 8)
- `nakshatra`: `Mula` (Index 18)
