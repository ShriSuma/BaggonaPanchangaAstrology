---
name: baggona-seva-prasada-guard
description: >-
  Master instructions, rules, and layout guards for Baggona Seva & Prasada page,
  5-page A4 PDF Ashirvada download generation, QR code scannability, Indic font rendering,
  and vertical layout stacking. MANDATORY validation skill whenever modifying Seva & Prasada
  components, PDF download utilities, or QR code generators.
---

# Baggona Seva & Prasada Page and PDF Download Guard Skill

This skill defines the mandatory guidelines, architectural contracts, and layout protection rules for the **Seva & Prasada Page**, the **5-Page A4 PDF Ashirvada Download**, the **Scannable QR Code Engine**, and the **Web Sanctum Darshana Page**.

---

## 1. Executive Summary & Domain Scope

The Seva & Prasada system is a central feature of Baggona Panchanga Astrology, offering devotees:
1. **Interactive Seva & Prasada Web Experience** (`SevaPage.tsx`, `PrasadaKit.tsx`)
2. **5-Page A4 Printable Ashirvada PDF Download** (`SevaPrintTemplates.tsx`, `pdfGenerator.ts`)
3. **Dual QR Code Calendar & Sanctum Sync** (`SevaCalendarSyncModal.tsx`, `icsCalendarGenerator.ts`)
4. **Royal Web Sanctum Darshana Page** (`DailyDarshanaPage.tsx`)

> [!IMPORTANT]
> Whenever any code modification is made to Seva & Prasada pages, PDF export functions, or QR code generators, **this skill must be consulted and validated**.

---

## 2. The 5-Page A4 Ashirvada PDF Layout Standard

The downloadable Ashirvada PDF comprises exactly **5 structured pages**, rendered in high-resolution A4 format (900px canvas width, `scale: 2`).

### Page 1: Royal Golden Prasada Samputa & Chief Priest Benediction Letter
- **Header:** Sacred Gokarna Mahabaleshwara Kshetra Emblem & Brass Diya graphics (`🪔 🕉️`).
- **Devotee Details:** Devotee Name, Gotra (if provided), Nakshatra, Rashi, Booking ID, and Date.
- **Benediction Text:** Deterministic Chief Priest Benediction narrative from Chaitanya Pandit in the selected native language script.
- **Aesthetic:** Luxury Gold Parchment background (`linear-gradient(180deg, #FFFDF0 0%, #FDF6E2 50%, #F5E6BE 100%)`) with 2px solid `#D4AF37` borders.

### Page 2: Devotee Janma Kundali & Planetary Positions Sphuta Table
- **Janma Kundali Chart:** Full 12-house South Indian or North Indian chart layout with clear planet abbreviations.
- **Graha Sphutas Table:** Complete 9-planet table detailing Graha, Rashi, House, Degrees, and Dignity Status (Exalted / Moolatrikona / Swakshetra).
- **Birth Attributes:** Janma Lagna, Moon Sign, Birth Nakshatra, and Rashi Lord.

### Page 3: 100% Gochara Planetary Transits & Vimshottari Dasha-Bhukti
- **Chandra Bala & Tara Bala Meters:** Quantitative scores (%) and transit effects.
- **Major Planet Transits:** Guru (Jupiter), Shani (Saturn), and Rahu-Ketu transit positions and house influences.
- **Vimshottari Dasha-Bhukti:** Current running Dasha and Bhukti lords with specific Vedic remedies and mantra chanting guidance.

### Page 4: 90-Day Seva & Prasada Daily Focus Schedule
- **Actionable Daily Focus Cards:** 4 localized categories per day:
  1. 🚗 **Vehicle & Asset Purchase:** Suitability for vehicle registration and investments.
  2. 💰 **Financial Growth & Business:** Guidance on wealth expansion and recovery of dues.
  3. 🧠 **Mind State & Peace (*Manas*):** *Chitta Ekagrata* / Moon strength & Chandrashtama warnings.
  4. 🪔 **Spiritual Harmony:** Deity blessings & temple seva grace.
- **Kaala Timings:** Daily Rahu Kaala, Gulika Kaala, and Yamaganda timings.

### Page 5: Devotional Scannable QR Code Page
- **QR Code Placement:** Prominent high-contrast scannable QR code centered on the page.
- **Functionality:** Directs scanning mobile devices to the personalized 90-day Google Calendar sync or the Web Sanctum Darshana page.
- **Devotee Instruction:** Clear native script step-by-step scanning instructions for Android (Google Lens / Camera) and iOS (Camera App).

---

## 3. MANDATORY Layout Protection Rules (Preventing PDF Bugs)

### Rule 3.1: Vertical Stacking vs. "Row Formation" Bug Prevention
When `html2canvas` clones hidden DOM containers, flex/grid child elements can collapse horizontally into a single row. To prevent this critical bug:
- In `pdfGenerator.ts`, **always** walk the cloned DOM and force `.pdf-page` and `.pdf-section` elements to `display: block`:
  ```typescript
  const allElements = clone.querySelectorAll("*") as NodeListOf<HTMLElement>;
  for (const el of allElements) {
    if (el.classList.contains("pdf-page")) {
      el.style.display = "block";
      el.style.width = "900px";
      el.style.pageBreakAfter = "auto";
    }
    if (el.classList.contains("pdf-section")) {
      el.style.display = "block";
      el.style.width = "100%";
    }
  }
  ```

### Rule 3.2: Off-Screen Rendering Wrapper Coordinates
The hidden host wrapper (`hiddenHost` in `PrasadaKit.tsx`) MUST use standard zero coordinates:
```typescript
const hiddenHost: React.CSSProperties = {
  position: "fixed",
  left: 0,
  top: 0,
  width: 900,
  opacity: 0,
  pointerEvents: "none",
  zIndex: -1,
  overflow: "hidden",
  height: 0
};
```
> [!CAUTION]
> **NEVER use extreme negative coordinates like `left: -20000px`.** Extreme offsets cause `html2canvas` bounding box calculation failures, resulting in garbled or blank PDF pages.

### Rule 3.3: Width Uniformity
The hidden container width (`900px`), wrapper width (`900px`), and `.pdf-page` width (`900px`) **MUST match exactly**.

---

## 4. MANDATORY QR Code Scannability & Redirect Guard

### Rule 4.1: Two-URL Architecture
- **Full URL:** Used ONLY for browser button clicks (`window.open(url, "_blank")`). Contains full Unicode text and emojis.
- **Compact ASCII URL:** Used ONLY for QR code generation (`generateCompactGoogleCalendarUrlForQR()`).
  - Must be **ASCII-only** (zero emojis, zero multi-byte Unicode characters).
  - Must be **under 600 characters** in length.
  - Contains `RRULE:FREQ=DAILY;COUNT=90` recurrence parameter.

### Rule 4.2: Error Correction Level "L"
All QR code generators (`QRCode.toDataURL()`) MUST use `errorCorrectionLevel: "L"` for maximum data capacity:
```typescript
QRCode.toDataURL(payload, {
  errorCorrectionLevel: "L",
  margin: 2,
  width: 280,
  color: { dark: "#78350F", light: "#FFFFFF" }
});
```

### Rule 4.3: Automatic ASCII Fallback
Every QR code generation call MUST wrap in a try/catch block that falls back to a minimal ASCII Google Calendar template string if payload encoding fails.

---

## 5. Indic Font Rendering & Script Purity Rules

### Rule 5.1: 5-Language Native Script Isolation
The application supports 5 languages (`kn`, `en`, `hi`, `te`, `ta`). Text rendered in PDF pages or web cards MUST use pure native script translations without mixing raw English variable keys or untranslated placeholders.

### Rule 5.2: Font Loading in Canvas
All PDF templates MUST ensure Google Fonts (`Noto Sans Kannada`, `Noto Sans Devanagari`, `Noto Sans Telugu`, `Noto Sans Tamil`, `Cinzel`, `Inter`) are loaded prior to `html2canvas` capture, with `useCORS: true` enabled.

---

## 6. Code Registry Map

| File | Responsibilities |
| :--- | :--- |
| `src/pages/SevaPage.tsx` | Main Seva & Prasada booking, tab navigation, and UI state |
| `src/components/seva/PrasadaKit.tsx` | Hidden PDF container host, PDF download buttons, and modal dialogs |
| `src/components/seva/pdf/SevaPrintTemplates.tsx` | 5-page A4 printable PDF templates (`.pdf-page` divs) |
| `src/utils/pdfGenerator.ts` | Core html2canvas + jsPDF engine with DOM clone style enforcement |
| `src/features/seva/icsCalendarGenerator.ts` | 90-day RFC 5545 series .ics engine & compact QR URL generator |
| `src/components/seva/SevaCalendarSyncModal.tsx` | Interactive QR code calendar sync modal |
| `src/pages/DailyDarshanaPage.tsx` | Royal Golden Web Sanctum Darshana page |
| `src/features/seva/sevaPresentation.ts` | 5-language localized focus guidance (`getDailyActionableGuidance`) |

---

## 7. Verification Checklist for Modifications

Before committing changes to any Seva & Prasada files:

- [ ] Run `npx tsc --noEmit` to verify zero TypeScript errors.
- [ ] Run `npm test` to verify zero unit test regressions.
- [ ] Verify PDF Downloads:
  - [ ] Pages stack **vertically** (5 distinct pages).
  - [ ] No blank pages or clipped text.
  - [ ] Luxury gold border (`#D4AF37`) and Indic fonts render accurately.
- [ ] Verify QR Codes:
  - [ ] On-screen QR code in sync modal scans cleanly on mobile phone.
  - [ ] QR code printed on Page 5 of the downloaded PDF scans cleanly.
  - [ ] Scanned QR opens valid Google Calendar 90-day event or Sanctum URL.

---

## 8. Download Filename Standardisation Guard

Whenever a calendar file (`.ics`) or Aashirvada PDF document (`.pdf`) is generated and downloaded in Seva & Prasada or Daily Darshana pages, the filename MUST strictly adhere to the following standard format:

### Naming Convention
`${Priest_Name}_${Devotee_Name}_${Date}.${ext}`

### Rules & Examples
1. **Sanitization Logic**:
   - `str.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "")`
   - Spaces and non-alphanumeric characters are replaced with single underscores.
2. **Calendar Download (`.ics`)**:
   - `Sri_Chaitanya_Pandit_Pramod_Kodagi_2026-08-18.ics`
3. **Ashirvada PDF Download (`.pdf`)**:
   - `Sri_Chaitanya_Pandit_Pramod_Kodagi_2026-08-18.pdf`

