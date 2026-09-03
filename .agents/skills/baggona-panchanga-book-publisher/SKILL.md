---
name: baggona-panchanga-book-publisher
description: Master blueprint, architecture, rules, and computational pipelines for the automated 104-page Baggona Panchanga Book Publisher Engine (ಪಂಚಾಂಗ ಪುಸ್ತಕ ಪ್ರಕಾಶನ ಎಂಜಿನ್). Generates press-ready, exact-replica 104-page annual Panchanga book PDFs for any Samvatsara with 1-click deterministic accuracy.
---

# Baggona Panchanga 104-Page Book Publisher Engine (ಪುಸ್ತಕ ಪ್ರಕಾಶನ ಎಂಜಿನ್)

This skill is the **central master authority and technical blueprint** for building and operating the automated **Baggona Panchanga 104-Page Annual Book Publisher Engine**.

Whenever the user references this skill (or asks to generate, replicate, or build annual Baggona Panchanga book PDFs for any Samvatsara), activate this skill to ensure 100% mathematical fidelity, zero typographical errors, and exact press-ready layout replication.

---

## 1. 📁 Master Benchmark References (All 4 Editions)

The engine is ground-truthed against 4 complete consecutive historical and forthcoming editions in `/Users/shreesuma/Downloads/drive-download-20260903T110552Z-1-001/`:
1. **`Final Proof Krodhi Panchanga print.pdf`**: ಶ್ರೀ ಕ್ರೋಧಿ ಸಂವತ್ಸರ (೨೦೨೪–೨೦೨೫, ಶಕ ೧೯೪೬, ೧೪೩ನೇ ಆವೃತ್ತಿ - ೧೨ ಮಾಸಗಳು)
2. **`DOC-20240815-WA0024..pdf`**: ಶ್ರೀ ವಿಶ್ವಾವಸು ಸಂವತ್ಸರ (೨೦೨೫–೨೦೨೬, ಶಕ ೧೯೪೭, ೧೪೪ನೇ ಆವೃತ್ತಿ - ೧೨ ಮಾಸಗಳು)
3. **`1-104 parabhava.pdf`**: ಶ್ರೀ ಪರಾಭವ ಸಂವತ್ಸರ (೨೦೨೬–೨೦೨೭, ಶಕ ೧೯೪೮, ೧೪೫ನೇ ಆವೃತ್ತಿ - **ಅಧಿಕ ಜ್ಯೇಷ್ಠ ಸಹಿತ ೧೩ ಮಾಸಗಳು**, ೧೦೪ ಪುಟಗಳು)
4. **`plavang final.pdf`**: ಶ್ರೀ ಪ್ಲವಂಗ ಸಂವತ್ಸರ (೨೦೨೭–೨೦೨೮, ಶಕ ೧೯೪೯, ೧೪೬ನೇ ಆವೃತ್ತಿ - ೧೨ ಮಾಸಗಳು)

- **Format**: High-density Drik Ganita ephemeris, Kannada typography, dual-page monthly tables, Graha Chakras, and classical Vedic predictions.
- **Engine Core**: `src/core/BaggonaUniversalBookEngine.ts`
- **Quality Audit Guard**: `src/core/BaggonaBookValidationEngine.ts`
- **Super Admin Hub**: `src/features/admin/BaggonaBookPublisherDashboard.tsx` & `src/components/admin/BaggonaBookLoaderModal.tsx`

---

## 2. 📖 Complete 104-Page Chapter & Section Breakdown

```
========================================================================================
             104-PAGE BAGGONA PANCHANGA MASTER BOOK STRUCTURE
========================================================================================
```

### ವಿಭಾಗ ೧: ಮುಖಪುಟ & ಆರಂಭಿಕ ವಿವರಣೆ (Pages 1–10)
- **ಪುಟ ೧ (Page 1)**: ಅವತರಣಿಕೆ (ಪೂರ್ಣ ಪರಿವಿಡಿ), ನಿತ್ಯ ರಾಹುಕಾಲ, ಗುಳಿಕಕಾಲ, ಯಮಗಂಡ ಕಾಲ ಕೋಷ್ಟಕ.
- **ಪುಟ ೨–೫ (Pages 2–5)**: ಪ್ರಾಯೋಜಕತ್ವ / ಪಾರಂಪರಿಕ ಪ್ರಕಟಣೆಗಳು.
- **ಪುಟ ೬ & ೮ (Pages 6 & 8)**: ಶ್ರೀ ಸ್ವರ್ಣವಲ್ಲೀ ಸಂಸ್ಥಾನ ಹಾಗೂ ಇಡಗುಂಜಿ ಶ್ರೀ ಮಹಾಗಣಪತಿ ದೇವಸ್ಥಾನದ ವಾರ್ಷಿಕ ಉತ್ಸವ ಕಾರ್ಯಕ್ರಮಗಳು.
- **ಪುಟ ೭ (Page 7)**: ಜಾಹೀರಾತು & ಧಾರ್ಮಿಕ ಪ್ರಕಟಣೆಗಳು.
- **ಪುಟ ೯ (Page 9)**: ಪ್ರಸ್ತಾವನೆ & ಶ್ರಾದ್ಧ ತಿಥಿ ನಿರ್ಣಯ ಪ್ರಕ್ರಿಯೆ.
- **ಪುಟ ೧೦ (Page 10)**: ಶ್ರೀಮುಖ (ಶ್ರೀಮಜ್ಜಗದ್ಗುರು ಶಂಕರಾಚಾರ್ಯ ಸಂಸ್ಥಾನ ಶ್ರೀ ಸ್ವರ್ಣವಲ್ಲೀ ಮಹಾಸಂಸ್ಥಾನದ ಆಶೀರ್ವಾದ ಪತ್ರ).

### ವಿಭಾಗ ೨: ಸಂವತ್ಸರ ಫಲಶ್ರುತಿ, ಗ್ರಹಣ & ಖಗೋಳ ಲಕ್ಷಣಗಳು (Pages 11–19)
- **ಪುಟ ೧೧–೧೪ (Pages 11–14)**:
  - ಪರಾಭವ ಸಂವತ್ಸರ ಫಲಶ್ರುತಿ ಮತ್ತು ಜಗಲ್ಲಗ್ನ ಕುಂಡಲಿ.
  - ಆರ್ದ್ರಾ ಪ್ರವೇಶ ಕಾಲಫಲಂ, ಮಳೆ-ಬೆಳೆ ನಿರ್ಣಯ, ೧೨ ಸೌರ ಸಂಕ್ರಮಣ ಫಲಗಳು.
  - ವರ್ಷದ ಸೂರ್ಯ ಹಾಗೂ ಚಂದ್ರ ಗ್ರಹಣಗಳ ಸ್ಪರ್ಶ, ಮಧ್ಯ, ಮೋಕ್ಷ ಸಮಯ, ಗ್ರಹಣ ನಕ್ಷತ್ರ-ರಾಶಿ ಫಲಗಳು.
  - ಗುರು-ಶುಕ್ರ ಮೌಢ್ಯ (ಅಸ್ತೋದಯ) ಅವಧಿಗಳು.
- **ಪುಟ ೧೫–೧೬ (Pages 15–16)**: ಹರಿದಾಸ ಕಲಾ ರತ್ನ, ಧಾರ್ಮಿಕ ಸೇವಾ ಪ್ರಕಟಣೆಗಳು.
- **ಪುಟ ೧೭ (Page 17)**: ಕೆಲವು ಶುಭ ಕಾರ್ಯಗಳಿಗೆ ಉಪಯುಕ್ತ ನಕ್ಷತ್ರ-ತಿಥಿ ನಿಯಮಗಳು.
- **ಪುಟ ೧೮ (Page 18)**: ಸಂವತ್ಸರದ ವಾರ್ಷಿಕ ಹಬ್ಬ-ಹರಿದಿನಗಳ ದಿನಾಂಕ ಕೋಷ್ಟಕ.
- **ಪುಟ ೧೯ (Page 19)**: ಜಾತಕ ತತ್ವಗಳು & ನವಗ್ರಹ ಕಾರಕತ್ವಗಳು.

### ವಿಭಾಗ ೩: ದ್ವಾದಶ ರಾಶಿಗಳ ಸಮಗ್ರ ವರ್ಷಭವಿಷ್ಯ (Pages 20–29)
- **ಪುಟ ೨೦–೨೫ (Pages 20–25)**:
  - **ಮೇಷ, ವೃಷಭ, ಮಿಥುನ, ಕರ್ಕಾಟಕ, ಸಿಂಹ, ಕನ್ಯಾ, ತುಲಾ, ವೃಶ್ಚಿಕ, ಧನು, ಮಕರ, ಕುಂಭ, ಮೀನ**:
    - ಆದಾಯ-ವ್ಯಯ, ರಾಜಪೂಜ್ಯ-ಅವಮಾನ ಗಣಿತ ಕೋಷ್ಟಕ.
    - ಕೌಟುಂಬಿಕ, ಆರ್ಥಿಕ, ಆರೋಗ್ಯ, ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ, ವಿದ್ಯಾಭ್ಯಾಸ ಭವಿಷ್ಯ.
    - ಅನುಕೂಲಕರ ಮಾಸಗಳು ಮತ್ತು ಶಾಂತಿ-ಪರಿಹಾರ ಕ್ರಮಗಳು (ಪೂಜೆ, ಮಂತ್ರ, ರತ್ನಧಾರಣೆ).
- **ಪುಟ ೨೬–೨೯ (Pages 26–29)**: ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದೇವಸ್ಥಾನದ ಉತ್ಸವಗಳು, ಶಿವಯೋಗ, ಪಾರಂಪರಿಕ ಸೇವೆಗಳು.

### ವಿಭಾಗ ೪: ನವನಾಯಕ ಫಲಂ & ಗ್ರಹ ಸಂಚಾರ (Pages 30–36)
- **ಪುಟ ೩೦–೩೨ (Pages 30–32)**:
  - ನವನಾಯಕ ಫಲಂ: ರಾಜ, ಮಂತ್ರಿ, ಸೇನಾಧಿಪತಿ, ಸಸ್ಯಾಧಿಪತಿ, ಧಾನ್ಯಾಧಿಪತಿ, ಮೇಘಾಧಿಪತಿ, ರಸಾಧಿಪತಿ, ನೀರಸಾಧಿಪತಿ, ಪಶುಪಾಲಕ ಫಲಗಳು.
  - ಧಾನ್ಯ, ವಸ್ತ್ರ, ಲೋಹ, ಚಿನ್ನ-ಬೆಳ್ಳಿ, ಷೇರು ಮಾರುಕಟ್ಟೆ, ಮಳೆ-ಬೆಳೆ ದಿಕ್ಸೂಚಿ.
- **ಪುಟ ೩೩–೩೬ (Pages 33–36)**: ನವಗ್ರಹ ಸಂಚಾರ ಕೋಷ್ಟಕ (ಗುರು, ಶನಿ, ರಾಹು-ಕೇತು ಸಂಚಾರ ದಿನಾಂಕಗಳು ಮತ್ತು ವಕ್ರಾರಂಭ-ವಕ್ರತ್ಯಾಗ).

### ವಿಭಾಗ ೫: ೧೨ ಮಾಸಗಳ ಸಮಗ್ರ ದಿನ ಪಂಚಾಂಗ & ಗ್ರಹಚಕ್ರಗಳು (Pages 37–96)
**ಚೈತ್ರ ಮಾಸದಿಂದ ಫಾಲ್ಗುಣ ಮಾಸದವರೆಗೆ (೧೨ ಚಾಂದ್ರಮಾನ & ಸೌರಮಾನ ಮಾಸಗಳು)**:
ಪ್ರತಿ ಮಾಸಕ್ಕೂ **೨ ಪೂರ್ಣ ಮುಖಾಮುಖಿ ಪುಟಗಳು**:

1. **ಎಡ ಪುಟ (Even Pages: 40, 42, 44... 90)**:
   - **ಶೀರ್ಷಿಕೆ**: ಸೌರಮಾನ ಮಾಸ, ಚಾಂದ್ರಮಾನ ಮಾಸ, ಋತು, ಆಯನ, ಸಂವತ್ಸರ.
   - **ದಿನ ಕೋಷ್ಟಕ (Columns)**:
     - ದಿನಾಂಕ (English Date) & ವಾರ
     - ತಿಥಿ, ತಿಥಿ ಅಂತ್ಯ ಘಟಿ-ವಿಘಟಿ ಮತ್ತು ಗಂಟೆ-ನಿಮಿಷ
     - ನಕ್ಷತ್ರ, ನಕ್ಷತ್ರ ಅಂತ್ಯ ಘಟಿ-ವಿಘಟಿ ಮತ್ತು ಗಂಟೆ-ನಿಮಿಷ
     - ಯೋಗ, ಯೋಗ ಅಂತ್ಯ ಘಟಿ-ವಿಘಟಿ
     - ಕರಣ, ಕರಣ ಅಂತ್ಯ ಘಟಿ-ವಿಘಟಿ
     - ಸೂರ್ಯೋದಯ & ಸೂರ್ಯಾಸ್ತ (ಗೋಕರ್ಣ / ಸ್ಥಳೀಯ ಮಾನಕ ಕಾಲ)
     - ದಿನಪ್ರಮಾಣ (ಘಟಿ-ವಿಘಟಿ)
     - ಶ್ರಾದ್ಧ ತಿಥಿ & ಧಾರ್ಮಿಕ ಹಬ್ಬಗಳು
     - ವರ್ಜ್ಯ / ಅಮೃತ ಘಟಿಗಳು
   - **ಕೆಳಭಾಗ**: ಮಾಸಾಂತ ಸೂರ್ಯೋದಯ **ಗ್ರಹಕುಂಡಲಿ / ಗ್ರಹಚಕ್ರ (Graha Chakra)** (ರವಿ, ಚಂದ್ರ, ಕುಜ, ಬುಧ, ಗುರು, ಶುಕ್ರ, ಶನಿ, ರಾಹು, ಕೇತು, ಗುಳಿಕ ಮತ್ತು ಲಗ್ನ ಸ್ಪಷ್ಟ).

2. **ಬಲ ಪುಟ (Odd Pages: 41, 43, 45... 91)**:
   - **ದಿವಾ ಲಗ್ನಗಳ ಸಮಾಪ್ತಿ ಕಾಲ (Lagna Ending Times)**:
     - ಮೇಷಾದಿ ಮೀನಾಂತ ೧೨ ಲಗ್ನಗಳ ನಿತ್ಯ ಸಮಾಪ್ತಿ ಕಾಲ (ಗಂಟೆ-ನಿಮಿಷ).
   - **ನಿತ್ಯ ಗ್ರಹಸ್ಪಷ್ಟ (Daily Planetary Coordinates)**:
     - ರವಿ, ಕುಜ, ಬುಧ, ಗುರು, ಶುಕ್ರ, ಶನಿ, ರಾಹು, ಕೇತುಗಳ ದೈನಂದಿನ ರಾಶಿ & ನಕ್ಷತ್ರ ಪಾದ ಸಂಚಾರ.
   - ಸೂರ್ಯ ನಕ್ಷತ್ರ ಪ್ರವೇಶ, ಸಂಕ್ರಮಣ ಪುಣ್ಯಕಾಲ ಮತ್ತು ವಿಶೇಷ ಮುಹೂರ್ತ ಟಿಪ್ಪಣಿಗಳು.

### ವಿಭಾಗ ೬: ಜಾತಕ ಸಾರಾವಳಿ, ಮುಹೂರ್ತಗಳು & ಸಮಾರೋಪ (Pages 97–104)
- **ಪುಟ ೯೭–೯೮ (Pages 97–98)**:
  - ವಿಂಶೋತ್ತರೀ ದಶಾಂತರ್ದಶಾ ಕೋಷ್ಟಕ (Vimshottari Dasha-Antardasha Table).
  - ಜಾತಕ ಕೂಟ ಸಾರಾವಳಿ (ದಿನ, ಗಣ, ಮಾಹೇಂದ್ರ, ಸ್ತ್ರೀದೀರ್ಘ, ಯೋನಿ, ರಾಶಿ, ವಶ್ಯ, ರಜ್ಜು, ವೇಧಾ, ನಾಡಿ ಕೂಟಗಳು).
- **ಪುಟ ೯೯–೧೦೧ (Pages 99–101)**:
  - ಶುದ್ಧ ವಿವಾಹ ಮುಹೂರ್ತಗಳು, ಉಪನಯನ ಮುಹೂರ್ತಗಳು, ಚೌಲ, ನಾಮಕರಣ, ವಾಸ್ತು-ಗೃಹಪ್ರವೇಶ, ವಾಹನ ಖರೀದಿ ಮುಹೂರ್ತಗಳು.
- **ಪುಟ ೧೦೨–೧೦೪ (Pages 102–104)**:
  - ಆಷಾಢ-ಶ್ರಾವಣ ಹುಣ್ಣಿಮೆಗಳ ಮಹಿಮೆ, ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತ, ಚಾತುರ್ಮಾಸ್ಯ ನಿಯಮಗಳು ಮತ್ತು ಸಮಾರೋಪ ಸಂಪರ್ಕ ವಿವರಗಳು.

---

## 3. ⚙️ Astronomical & Ephemeris Engine Architecture

To generate accurate numbers with **0 error**, the engine relies on deterministic algorithms in `src/core/TraditionalBaggonaEngine.ts`:

1. **Ayanamsa**: Chitra-Paksha / Lahiri Ayanamsa (`getAyanamsa(utcDate)`).
2. **True Sun & Moon Longitudes**: High-precision planetary ephemeris (`siderealLongitudes(utcDate, ayanamsa)`).
3. **Panchanga Angas**:
   - Tithi = $(\text{Moon} - \text{Sun}) / 12^\circ$
   - Nakshatra = $\text{Moon} / 13^\circ 20'$
   - Yoga = $(\text{Sun} + \text{Moon}) / 13^\circ 20'$
   - Karana = Half Tithi ($6^\circ$)
4. **Ghati-Vighati Precision**:
   - 1 Day = 60 Ghatis (1 Ghati = 24 minutes, 1 Vighati = 24 seconds).
   - All end times computed from local sunrise (`ghatiVighatiSinceSunrise`).
5. **Dina Lagna Ending Times**:
   - Oblique ascension of signs for Gokarna / coastal Karnataka latitude ($14^\circ 32' \text{ N}, 74^\circ 19' \text{ E}$).
6. **Shraddha Tithi Determination**:
   - Exact Aparahna Kaala calculation ($3/5^{\text{th}}$ to $4/5^{\text{th}}$ of daytime) matching traditional Baggona rules.

---

## 4. 🖨️ Typography & Press-Ready Print Specs

1. **Fonts**: Google Noto Sans Kannada (`NotoSansKannada-Regular.ttf`, `NotoSansKannada-Bold.ttf`) and Baloo Tamma 2 for headers.
2. **Page Budget**: Exactly 104 pages (no overflow, no blank gap pages).
3. **Table Dimensions**:
   - Strict 10-column layout for daily Panchanga tables (Fixed millimeter widths).
   - High-contrast black/dark gray borders for offset single-color or multi-color printing.
4. **SVG Graha Kundlis**: Vector South Indian Diamond/Square Kundli diagrams embedded directly into the PDF.
5. **Direct Offset Press Output**:
   - A4 / Crown 1/8 size book dimensions.
   - Vector text rendering (searchable, infinitely scalable, 0 pixelation).

---

## 5. 🧪 Multi-Year Regression & Validation Protocol

When training or updating the engine:
1. Cross-reference calculated values against past Baggona Panchanga digital editions (e.g. 2023-24, 2024-25, 2025-26, 2026-27).
2. Run automated test suites verifying:
   - 365-day continuous Tithi transitions without skipping.
   - Solar eclipse and lunar eclipse precision down to the exact minute.
   - Month-end Graha Chakra degree matching.
3. Validate zero layout distortion across all 104 printable pages.
