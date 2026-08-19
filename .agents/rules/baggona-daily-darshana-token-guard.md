# Mandatory Guard Rules for DailyDarshanaPage.tsx and tokenCipher.ts

Whenever modifying `src/pages/DailyDarshanaPage.tsx` or `src/utils/tokenCipher.ts`, you MUST adhere to and validate against these strict rules before declaring work complete or committing to Git.

---

## 1. DailyDarshanaPage.tsx Mandates

1. **Authentic Birth Kundli Calculation**:
   - `birthKundli` MUST be computed dynamically using authentic birth parameters (`birthDateStr`, `birthTimeStr`, `userLat`, `userLng`, `userPincode`) via `calculateKundli(...)`.
   - **DO NOT** override Moon planet positions in `birthKundli` with transit token values (`decoded?.r` or `decoded?.nk`). Transit parameters belong exclusively to daily Panchanga and Gochara transit analysis.

2. **Birth Inputs Extraction Hierarchy**:
   - DOB & TOB must be extracted from: `urlParams` (`?dob=...&tob=...`), `decoded.dob`/`decoded.tob`, or `storedSession.birthDate`/`storedSession.birthTime`.
   - Default fallback for devotee Manoj Poornamatha MUST be `1993-03-16` and `01:40` at Gokarna (`14.5479`, `74.3187`), which correctly calculates **Dhanu Lagna**, **Dhanu Rashi**, and **Mula Nakshatra**.

3. **Gold Banner Header Display**:
   - Header image `/baggona_panchanga_gold_banner.jpg` is **MANDATORY** on top of `DailyDarshanaPage.tsx`.
   - Banner image MUST feature Kannada text `॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥` and English `Baggona Panchanga`.
   - Subtitle under the banner image MUST display `{dict.creationSubtitle}`.

4. **4-Tab Navigation Integrity**:
   - Preserve all 4 main tabs (`darshana`, `kundali`, `gochara`, `dasha`) with full chart rendering and localized narrative cards.

---

## 2. tokenCipher.ts Mandates

1. **Zero-Crash Base64URL Decoding**:
   - `fromBase64Url` MUST use `new TextDecoder("utf-8", { fatal: false })` to convert Base64URL binary bytes into UTF-8 strings. Never use unhandled `decodeURIComponent` calls that crash on truncated multi-byte Indic characters.

2. **Payload Fields Preservation**:
   - `DevoteeTokenPayload` MUST preserve: `name` (`n`), `nakshatra` (`nk`), `rashi` (`r`), `gotra` (`g`), `pandit` (`p`), `date` (`d`), `lang` (`l`), `time` (`tm`), `dob`, `tob`, `pincode` (`pc`), `lat` (`lt`), `lng` (`lg`), and `locationName` (`loc`).

3. **Security & Failure Handling**:
   - Tampered tokens or garbage strings where `hasAnyPayloadKey === false` MUST return `null`.

---

## 3. Mandatory Pre-Commit Validation

Every modification to `DailyDarshanaPage.tsx` or `tokenCipher.ts` MUST be verified by executing:

```bash
npx vitest run
npm run build
```

Both commands MUST complete with 0 failures and 0 errors before committing or pushing to remote git branches.
