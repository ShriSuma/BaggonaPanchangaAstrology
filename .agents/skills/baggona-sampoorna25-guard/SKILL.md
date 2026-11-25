---
name: baggona-sampoorna25-guard
description: Guard rules for Sampoorna 25-Chapter Master Report A4 PDF pagination, border safety, 6-Anga birth Panchanga header, and 100% astronomical chart accuracy.
---

# Baggona Sampoorna 25-Chapter PDF & Accuracy Guard

Activate whenever editing `SampoornaMaster25PdfTemplate.tsx`, `sampoornaMaster25Service.ts`, or pages invoking `captureSampoornaMaster25Pdf`.

## Checklist
1. **A4 Frame Geometry**: Images inset (`X = 9.5mm`, `W = 191mm`, `Y = 19mm..276.5mm` on Pages 2+), borders (`6mm` / `7.8mm`) and corner emblems drawn AFTER images, running footer strictly inside (`281mm` line, `285.5mm` text).
2. **Proportional Fit**: Oversized sections scale both width & height proportionally or slice across pages—never distort aspect ratio.
3. **Header Completeness**: All 6 Panchanga Angas (Vara, Tithi+Paksha, Nakshatra+Pada, Yoga, Karana, true Birth Hora) + Sunrise/Sunset + Lagna/Rashi/Dasha + Yogi/Avayogi/Maandi rendered cleanly on Page 1.
4. **Live Engine Grounding**: Ephemeris transits (`siderealLongitudes`), `computeSarvashtakavarga`, `hasGocharaVedha`, `detectChartYogas`, `checkNeechaBhanga`, `calculateComprehensiveDoshas`, dynamic Panchabhuta weights, and strict age-bracket filtering across all 25 chapters.
5. **Pure Native Script**: Run cross-script scan and `crossLanguageTokenPurityAudit.test.ts` + `sampoornaMaster25Service.test.tsx`.
