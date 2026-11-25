# Sampoorna 25-Chapter A4 Layout & 100% Accuracy Guard (ಸಂಪೂರ್ಣ ೨೫ ಅಧ್ಯಾಯಗಳ A4 ಪುಟ & ೧೦೦% ನಿಖರತೆ ನಿಯಮ)

> Additive guard layered on top of existing Baggona rules. Existing rules remain untouched.

## 1. Strict A4 Printable Geometry & Border Integrity (`210mm × 297mm`)
- **Vector Borders & Ornaments Drawn Last**:
  - In `captureSampoornaMaster25Pdf()` (`src/services/sampoornaMaster25Service.ts`), all `.pdf-section` raster images MUST be placed **inside** the double gold frame (`X >= 9.5mm`, `W <= 191mm`, content zone `Y = 19.0mm..276.5mm` on Pages 2+, `Y = 10.5mm..276.5mm` on Page 1).
  - Outer gold border (`6mm, 6mm, 198mm, 285mm`), inner gold border (`7.8mm, 7.8mm, 194.4mm, 281.4mm`), and 4 corner `❖` diamond emblems MUST be drawn **AFTER** all `addImage(...)` calls so opaque `#FFF7ED` images never overwrite or break border lines.
- **Running Header & Footer Inside Frame**:
  - Pages 2+ MUST display a clean Running Header bar at `Y = 9.5mm..17.5mm` inside the top border.
  - Every page MUST render the Running Footer strictly **inside** the inner gold border (`separator line at Y = 281mm`, footer text at `Y = 285.5mm`, well above the `289.2mm` inner border bottom). Never place footer text below `288mm`.
- **Zero Squishing / Proportional Scaling & Multi-Page Slicing**:
  - NEVER clamp `renderHeightMm` independently of `renderWidthMm`. If any section exceeds the usable page height, scale width and height proportionally (or slice the canvas cleanly across pages) so text is never vertically squished or clipped.

## 2. Clutter-Free Fixed-Width Print Template (`SampoornaMaster25PdfTemplate.tsx`)
- **Zero Viewport Media Queries (`sm:`, `md:`)**: Print templates render at fixed `width: 900px` and MUST NOT use Tailwind responsive prefixes (`sm:`, `md:`) that collapse grids/headers when downloaded from mobile viewports.
- **No `transform: skew` Overlays or `tracking-widest` on Indic Text**: Keep straight crisp double gold frames, `letter-spacing: normal` on all Kannada/Devanagari/Telugu/Tamil glyphs, and `word-break: break-word`.
- **Hidden Host Rule**: Both `KundliPage.tsx` and `AntarangadaSatyaPage.tsx` MUST position hidden offscreen PDF hosts at `left: 0, top: 0, width: 900, opacity: 0, height: 0, overflow: "hidden"` (never `left: -99999px`).

## 3. Complete 6-Anga Birth Panchanga & 100% Real Chart Accuracy
- **Header Profile Completeness**: The Page 1 Cover + Devotee Details card MUST display: Name, Birth Date/Time/Age, Birth Place & Ayanamsha, Janma Lagna & Lord, Moon Sign & Lord, Nakshatra & Pada, Birth Tithi (with Paksha) & Weekday (Vara), Nitya Yoga & Karana, Sunrise/Sunset & authentic **Janma Hora (Birth Hora)** from `TraditionalBaggonaEngine`, Active Mahadasha/Bhukti + Birth Dasha Balance, and Yogi/Avayogi/Maandi summary.
- **Separate Birth Hora vs Live Prashna Hora**: Never display live current-time hora as Birth Hora in the header; fix Chaldean weekday indices (`[0, 3, 6, 2, 5, 1, 4]` for Sun–Sat) and anchor hours to sunrise.
- **Real Astronomical Computations Across Chapters**:
  - Chapter 5: Compute actual natal Panchabhuta elemental weights (Fire/Earth/Air/Water) from Lagna, Moon, Sun, and planets — never hardcode one element for all charts.
  - Chapter 6: Enforce Parashari Vajra-Hawala Lagna compatibility before prescribing Mars/Red Coral or Venus/Diamond.
  - Chapters 8 & 9: Compute live `siderealLongitudes`, real Moon-relative houses (Sade Sati/Ashtama/Kantaka/Guru Bala), real `computeSarvashtakavarga`, and `hasGocharaVedha`.
  - Chapter 11: Surface real `detectChartYogas`, `checkNeechaBhanga`, and `Pushkara Navamsha` placements.
  - Chapters 12–22: Incorporate real house lords (10th, 2nd/11th, 7th, 5th, 6th) and strictly enforce age-bracket & marital-status adaptation (zero stock-market/loan/surety/marital text for `<13` children/infants).
  - Chapter 23: Integrate real `calculateComprehensiveDoshas` detections with classical cancellations and Gokarna remedies.
- **Cross-Script Hygiene**: Every localized label and narrative string must be free of foreign-script or cross-Indic character leaks (e.g., zero Devanagari or Cyrillic tokens inside Tamil/Telugu/Kannada text).
