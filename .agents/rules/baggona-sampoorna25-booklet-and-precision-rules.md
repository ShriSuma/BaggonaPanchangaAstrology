# Sampoorna 25-Chapter Royal Booklet & Extended Precision Rules (ಸಂಪೂರ್ಣ ೨೫ ಅಧ್ಯಾಯಗಳ ಪುಸ್ತಕ ವಿನ್ಯಾಸ & ಹೆಚ್ಚುವರಿ ನಿಖರತಾ ನಿಯಮಗಳು)

> Additive rule file layered cleanly on top of existing Baggona rules (`baggona-sampoorna25-a4-and-accuracy-guard.md` and all other `.agents/rules/*.md` remain intact and unmodified).

## 1. Sacred Booklet Flow & Page-by-Page Chapter Mandate
- **Order of Front Matter (`SampoornaMaster25PdfTemplate.tsx`)**:
  1. **Page 1 — Dedicated Royal Booklet Cover (`data-section="cover"`)**:
     - Prominent **Baggona Panchanga** brand crest at the very top (`॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥` / native localized equivalent), Sri Kshetra Gokarna invocation, and Booklet Title.
     - Personalized Devotee Identity Card displaying Devotee Name, Date of Birth, Time of Birth, Place of Birth, Janma Lagna, Chandra Rashi, and Birth Nakshatra + Pada.
     - Heartfelt, emotionally reassuring personal dedication narrative addressed directly to the devotee, affirming that this manuscript was generated exclusively for them and solely for their personal keeping under the blessings of Sri Kshetra Gokarna Mahabaleshwara.
  2. **Page 2 — Complete 25-Chapter Page-Mapped Booklet Index (`data-section="executive-index"`)**:
     - Placed immediately after the Cover Page and **before** the full Kundli Dossier (`user-details`) and Chapters.
     - Lists ALL **25 Chapters (`1–25`)** grouped under the 5 Sacred Volumes alongside Bonus Calendar QR & Gokarna Sanctuary Finale, displaying each chapter's exact **A4 Page Number**.
     - `captureSampoornaMaster25Pdf()` MUST run a **two-pass page number synchronization** against `planSampoorna25A4Pages()` so every page number badge printed in the Index matches the rendered PDF footer page numbers 1-to-1.
  3. **Page 3 — Complete 6-Anga Birth Panchanga & Precision Kundli Dossier (`data-section="user-details"`)**:
     - Displays all 6 Birth Panchanga elements, Yogi/Avayogi/Maandi, Bhrigu Bindu, Live Tarabala/Chandrashtama, Dominant Panchabhuta, Badhaka Sthana, and Detected Yogas/Doshas summaries before Chapter 1 begins.
  4. **Pages 4+ — One Dedicated A4 Page Per Chapter**:
     - Every chapter (`1–25`) starts cleanly on a new A4 page, contains **4 deeply chart-grounded paragraphs (each delivering rich 5–6+ line depth)** answering its question directly, plus a Chapter Precision Anchor strip and practical contemplation guidance box, fitting cleanly inside the A4 borders without clipping or horizontal overflow.

## 2. Extended Parashari & Tajika Accuracy Rules (Additive Precision Gates)
- **Rule A — Functional Lagna Benefic / Yogakaraka / Maraka Gate**:
  - Classify active Mahadasha, Bhukti, Yogi, and Key House Lords against `LAGNA_FUNCTIONAL_MATRIX[lagnaRashiIdx]` (`getFunctionalNature`) before declaring benefic or turbulent outcomes.
- **Rule B — Planetary Combustion (`Asta`) & Retrograde (`Vakri` Chesta Bala) Gate**:
  - Evaluate angular orb against Sun longitude (`Moon 12°`, `Mars 17°`, `Mercury 14°/12°R`, `Jupiter 11°`, `Venus 10°/8°R`, `Saturn 15°`) and `isRetrograde` flags to diagnose delayed external results vs intense internal strength.
- **Rule C — Gandanta & Rashi Sandhi Karmic Junction Gate**:
  - Evaluate Ascendant degree, Moon degree, and active Mahadasha lord degree using `getDegreeVulnerability()` to detect Water-Fire Gandanta knots (`<=3°20'` Fire start / `>=26°40'` Water end) and Rashi Sandhi transitions (`<1°` / `>29°`).
- **Rule D — Domain Sarvashtakavarga (`SAV`) & Lagna Badhaka Sthana Gate**:
  - Extract authentic `computeSarvashtakavarga()` bindus for Houses `1, 2, 5, 7, 10, 11` and compute Movable (`11th`) / Fixed (`9th`) / Dual (`7th`) Lagna Badhaka placements alongside Pushkara Navamsha and Vargottama/Exaltation/Own-sign dignities.
- **Rule E — Live Moment Tarabala & Chandrashtama Hook**:
  - Compute `calculateLiveTodayTarabalaAndChandrashtama()` relative to the exact generation date/time and surface today's Tara score and Chandrashtama awareness directly inside Chapter 1 (`Prashna Drishti`).
- **Rule F — Strict Zero Cross-Script & Age-Safe Purity**:
  - All new localized strings across `kn`, `mr`, `hi`, `te`, `ta`, and `en` MUST use pure native scripts (zero Devanagari `ॐ`/letters in Tamil, zero Kannada letters in non-Kannada locales, zero English words in Indic chapter titles) and strict age-bracket filtering (`<13` minors free of stock-market, surety loans, or marital prescriptions).
