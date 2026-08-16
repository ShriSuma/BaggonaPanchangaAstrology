---
name: baggona-pdf-layout-guard
description: >-
  Mandatory rules to prevent PDF "row formation" layout bugs in Baggona Panchanga.
  Use this skill whenever modifying PDF generation, html2canvas rendering,
  hidden PDF container styles, or the pdfGenerator.ts utility. Prevents the
  critical bug where PDF pages render horizontally instead of vertically stacked.
---

# Baggona PDF Layout Guard Skill

Use this skill whenever you are modifying, debugging, or creating PDF export functionality involving `html2canvas`, `jsPDF`, hidden off-screen containers, or any `.pdf-page` / `.pdf-section` CSS classes.

## 1. Root Cause: "Row Formation" PDF Layout Bug

The PDF generation pipeline clones hidden DOM containers and renders them with `html2canvas`. If the cloned elements inherit flex/grid display modes, the `.pdf-page` divs render **side-by-side (in a row)** instead of **vertically stacked**, producing garbled PDFs.

### Two interacting causes:
1. **html2canvas clone styling** — The `generatePDFFromElement()` function in `src/utils/pdfGenerator.ts` clones the source container. If `.pdf-page` children use `display: flex` they may lay out horizontally.
2. **Hidden container positioning** — If the off-screen source container uses extreme coordinates (e.g., `left: -20000`), html2canvas can compute incorrect bounding boxes, causing layout corruption.

## 2. MANDATORY Rules for `pdfGenerator.ts`

### Rule 2.1: Force Block Display on PDF Page Elements (CRITICAL)
After cloning the container, **always** walk the DOM and force `.pdf-page` and `.pdf-section` elements to `display: block`:

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

**NEVER remove this block.** It exists in `pdfGenerator.ts` lines 44-60.

### Rule 2.2: Wrapper Must Use Standard Coordinates
The off-screen rendering wrapper must use `left: 0; top: 0`:

```typescript
wrapper.style.position = "fixed";
wrapper.style.left = "0px";
wrapper.style.top = "0px";
wrapper.style.width = "900px";
```

**NEVER set left to negative values like `-9999px` or `-20000px`.** This causes html2canvas coordinate calculation failures.

## 3. MANDATORY Rules for Hidden PDF Containers

### Rule 3.1: Hidden Container Style Pattern
All off-screen PDF source containers (like `hiddenHost` in `PrasadaKit.tsx`) **MUST** use this exact pattern:

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

**NEVER use `left: -20000` or any extreme negative positioning.** Use `overflow: hidden; height: 0` to hide the container while keeping it at valid coordinates.

### Rule 3.2: Width Consistency
The hidden container width (900px), the wrapper width (900px), and the `.pdf-page` width (900px) **MUST all match**. Mismatched widths cause aspect ratio distortion in the rendered PDF.

## 4. Key File Locations

| File | Purpose |
|------|---------|
| `src/utils/pdfGenerator.ts` | Core PDF rendering engine with html2canvas + jsPDF |
| `src/components/seva/PrasadaKit.tsx` | Seva/Prasada PDF containers (`hiddenHost` style) |
| `src/components/seva/pdf/SevaPrintTemplates.tsx` | PDF page templates (`.pdf-page` styled divs) |
| `src/components/pdf/PremiumPDFTemplate.tsx` | Premium astrology PDF template |
| `src/pages/BaggonaPredictionsPage.tsx` | Calls `generatePDFFromElement()` for downloads |

## 5. Verification Checklist

Before declaring any PDF-related change complete:

- [ ] Run `npx tsc --noEmit` — zero errors
- [ ] Open dev server, navigate to Seva & Prasada tab
- [ ] Download at least one PDF (Blessing Letter or Calendar)
- [ ] Verify: Pages stack **vertically**, not in a row
- [ ] Verify: No blank white pages at start/end
- [ ] Verify: All text renders (no clipping or overflow)
- [ ] Verify: QR code image appears in PDF (not blank placeholder)
