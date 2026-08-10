---
name: baggona-pdf-generator
description: Guidelines and layout rules for Baggona Panchanga PDF generation (continuous & A4 multi-page printable formats), Indic font rendering, zero-blank section validation, and luxury gold design.
---

# Baggona PDF Generator Skill

Use this skill whenever working on PDF export functionality, PDF styling, A4 page printing, or resolving PDF rendering bugs in `PdfTemplate.tsx`, `PremiumPDFTemplate.tsx`, or `BhavishyaView.tsx`.

## 1. Single-Page vs A4 Multi-Page Printable PDF Formats
- **Continuous / Extended Premium PDF**: Rendered by `PdfTemplate.tsx` with dynamic height `[pdfWidth, pdfHeight]` based on `html2canvas` aspect ratio. Used for digital viewing.
- **A4 Multi-Page Printable PDF**: Rendered by `PremiumPDFTemplate.tsx` with strict A4 page height (297mm) and page breaks (`page-break-after: always`). Used when the user wants an A4 printable document.

## 2. Zero-Blank Section & Mandatory Content Guarantee
- **Header Check Rule**: NEVER render a section header (`<h2>`) if the section body text is empty or shorter than 15 characters.
- **`hasContent` Guard**: All section renders in `PdfTemplate.tsx` MUST be wrapped with `hasContent(items)`:
  ```tsx
  const hasContent = (items?: { impact?: string }[]) => {
    if (!items || items.length === 0) return false;
    return items.some(item => (item.impact || "").trim().length > 10);
  };
  ```
- **Fallback Generation**: If Gemini AI fails or returns empty JSON for any section (`characteristics`, `darkSecret`, `yogas`, `doshas`, `timeline`, `gochara`, `summary`), use `ensureValidSection` to populate rich translated fallbacks from the offline mathematical engine.
- **Strict Pre-Render Audit**: Before initializing `html2canvas` / `jsPDF`, verify all 7 sections have valid text. If any section is missing, throw an error and abort download to prevent giving an incomplete PDF to the user.

## 3. Indic Font Rendering & Ligature Collision Protection
- **No CSS `letter-spacing` / `tracking-wider` on Indic Text**: In Kannada, Telugu, Tamil, and Hindi, CSS `tracking` (letter-spacing) separates base consonants from sub-script subscript ligatures (e.g. turning `ವ್ಯಕ್ತಿತ್ವ` into broken garbled letters). ALWAYS set `tracking-normal` on Indic text.
- **Generous Line Height**: Set `leading-relaxed` or `leading-loose` (`line-height: 1.6` - `1.8`) to prevent vertical ascender/descender collisions.
- **Font Family**: Use `font-sans` or `Noto Sans` for clean, unclipped Indic headings.

## 4. Ultra-Premium Royal Gold Card Layout
- **User Details Box**: Styled as a royal parchment card with gradient `from-amber-50 via-orange-50/40 to-amber-100/80`, 2px golden border `border-amber-600/60`, inner frame borders, and corner emblems (`❖`).
- **Intro Header**: `introGreeting` (`ನಮಸ್ಕಾರ ಪ್ರಮೋದ್ ಕೊಡಗಿ,`) MUST be rendered as a **BIG 3XL Bold Heading** at the top of the intro card.
