# Premium PDFV1 Implementation Plan - Accuracy Hardening & Enhancement

## Overview
This plan addresses all critical accuracy gaps, mathematical precision issues, and validation improvements identified during the audit. No new user-facing features (QR codes, links, etc.) - only core accuracy fixes and one new attractive Adhyaya.

---

## Phase 1: Critical Bug Fixes (Week 1)

### 1.1 Fix Indic Font Rendering - `tracking-wider` Bug
**Files:** `src/components/RamanBhavishya/PdfTemplate.tsx`
**Issue:** CSS `tracking-wider`/`tracking-normal` breaks Indic conjunct ligatures
**Fix:** Ensure ALL Indic text uses `tracking-normal` with `leading-relaxed` (1.6-1.8 line-height)

```tsx
// Search for and replace any tracking-wider on Indic text containers
// Ensure these classes on all text elements rendering Kannada/Hindi/Telugu/Tamil:
className="tracking-normal leading-relaxed"  // or leading-loose
style={{ letterSpacing: 'normal', lineHeight: '1.7' }}
```

**Affected Areas:**
- Soul Mirror truth paragraphs (lines 747-786)
- Characteristics narratives (lines 847-866)
- Dark Secret narratives (lines 899-917)
- Current Phase narratives (lines 951-969)
- All chapter content paragraphs

### 1.2 Add Navamsha Lords to Fallback Engine
**File:** `src/features/premiumPdf/dynamicBhavishyaEngine.ts`
**Function:** `analyzeKundali()` (lines 166-422)
**Add:** Navamsha lord computation for all 12 houses

```typescript
// Add after line 223 (houses computation)
const navamshaLords: Record<number, GrahaKey> = {};
for (let h = 1; h <= 12; h++) {
  const rIdx = (lagnaRashiIndex + h - 1) % 12;
  // Navamsha: each rashi = 30°, each navamsha = 3°20' = 10/3°
  // Navamsha rashi = (rashi * 9 + navamsha_pada - 1) % 12
  // For house cusp at 0° of rashi: navamsha_rashi = (rIdx * 9) % 12
  const navamshaRashi = (rIdx * 9) % 12;
  navamshaLords[h] = RASHI_LORD_GRAHAS[navamshaRashi];
}
// Add to ParsedKundaliChart return object
```

### 1.3 Complete Argala/Virodha Argala Analysis
**File:** `src/features/premiumPdf/dynamicBhavishyaEngine.ts`
**Function:** `analyzeKundali()` (lines 364-372)
**Enhance:** Full BPHS Ch.31 implementation

```typescript
// Replace lines 364-372 with complete implementation:
// Shubha Argala: planets in 2nd, 4th, 11th from a house
// Virodha Argala: obstruction from 12th, 10th, 3rd respectively
// Also check: benefic planets give shubha argala, malefic give papa argala
// Argala strength based on planet dignity

const computeArgala = (house: number) => {
  const argalaHouses = [2, 4, 11].map(h => (house + h - 1) % 12 + 1);
  const virodhaHouses = [12, 10, 3].map(h => (house + h - 1) % 12 + 1);
  
  let shubhaArgala = 0, papaArgala = 0, virodhaArgala = 0;
  
  argalaHouses.forEach((h, i) => {
    const occupants = houses[h]?.occupants || [];
    occupants.forEach(p => {
      const isBenefic = ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(p.graha);
      if (isBenefic) shubhaArgala++;
      else papaArgala++;
    });
  });
  
  virodhaHouses.forEach((h, i) => {
    const occupants = houses[h]?.occupants || [];
    if (occupants.length > 0) virodhaArgala++;
  });
  
  return { shubhaArgala, papaArgala, virodhaArgala, isObstructed: virodhaArgala > shubhaArgala };
};

// Compute for Lagna (house 1) and all key houses
```

### 1.4 Fix Maandi Inquest Prompt
**File:** `src/features/premiumPdf/premiumPrompts.ts`
**Function:** `buildPremiumPrompts()` → `maandiInquest` (lines 1692-1712)
**Fix:** Strengthen forbidden words, add explicit house/lord context

```typescript
const maandiInquest = `${header(...)}
CRITICAL MANDATE - READ WITH UTMOST CARE:
1. STRICTLY FORBIDDEN WORDS: NEVER use "Maandi", "Gulika", "Upagraha", "Mandi", "मांदी", "गुलिक", "మాంది", "குளிகன்" anywhere.
2. DYNAMIC TITLE: Create evocative title based on ${mHouse}th house themes (resilience, vigilance, peace, mastery, transcendence).
3. EMOTIONAL TOUCH: Write 2 substantial paragraphs (6-7 lines each). Speak directly to 'you'.
4. PARAGRAPH 1: Lived reality - obstacles at 99% completion, silent burdens, unvoiced struggles.
5. PARAGRAPH 2: Spiritual breakthrough - divine crucible refining soul, attitude shift, Gokarna Mahabaleshwara blessing.

Natal Context:
- Native Name: ${input.name}
- Natal Ascendant (Lagna): ${h1.sign}
- Natal Moon Sign: ${rashiName(input.moonRashiIndex, lang)}
- Running Period: ${dashaLine}
- Inquest Focus: ${mHouse}th House (${mRashiStr}) - Lord: ${h7.lordName} in ${h7.lordWhere}
- Occupants: ${h7.occStr || 'None'}

${JSON_RULE}
{"title": "evocative title without forbidden words", "paragraph1": "6-7 lines", "paragraph2": "6-7 lines"}`;
```

### 1.5 Add Cross-Chapter Deduplication Validation
**File:** `src/features/premiumPdf/bhavishyaV1Validator.ts`
**Function:** `validateBhavishyaV1Content()` - add after line 439

```typescript
// Cross-chapter paragraph deduplication
if (payload) {
  const allParagraphs: string[] = [];
  const chapterKeys = ['soulMirror', 'characteristics', 'darkSecret', 'currentPhase', 'maandiInquest', 
                       'yogas', 'doshas', 'gochara', 'timeline', 'annualForecast', 'summary', 'dashaGocharaCompass'];
  
  chapterKeys.forEach(key => {
    const data = (payload.premiumData as any)[key];
    if (Array.isArray(data)) {
      data.forEach(item => {
        const text = item.impact || item.paragraph1 || item.paragraph2 || item.truth1Text || item.truth2Text || item.truth3Text || '';
        const paras = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 20);
        paras.forEach(p => {
          const exists = allParagraphs.some(existing => areParagraphsDuplicates(existing, p));
          if (!exists) allParagraphs.push(p);
          else {
            missing.push(`Duplicate paragraph detected in ${getLocalizedSectionName(key, baseLang)}: "${p.substring(0, 50)}..."`);
          }
        });
      });
    } else if (data && typeof data === 'object') {
      // Handle object structures (soulMirror, dashaGocharaCompass, maandiInquest)
      Object.values(data).forEach(val => {
        if (typeof val === 'string' && val.length > 20) {
          const exists = allParagraphs.some(existing => areParagraphsDuplicates(existing, val));
          if (!exists) allParagraphs.push(val);
          else {
            missing.push(`Duplicate paragraph detected in ${getLocalizedSectionName(key, baseLang)}`);
          }
        }
      });
    }
  });
}
```

---

## Phase 2: Mathematical Precision (Week 2)

### 2.1 Vargottama Validation Guard
**File:** `src/features/premiumPdf/bhavishyaV1Validator.ts`
**Add:** After line 219 (soulMirror validation)

```typescript
// Vargottama Validation
const vargottamaPlanets = payload.premiumData?.yogas?.filter(y => 
  y.name.toLowerCase().includes('vargottama')
) || [];

const natalVargottama = session.result.planets.filter(p => p.isVargottama);
if (natalVargottama.length > 0 && vargottamaPlanets.length === 0) {
  missing.push(getLocalizedSectionName("vargottamaMissing", baseLang));
}

// Add to dictionary in getLocalizedSectionName():
vargottamaMissing: {
  kn: "ವರ್ಗೋತ್ತಮ ಗ್ರಹಗಳ ಯೋಗ ಲಭ್ಯವಿಲ್ಲ (Vargottama Yoga Missing)",
  hi: "वर्गोत्तम ग्रहों का योग अनुपलब्ध",
  te: "వర్గోత్తమ గ్రహాల యోగం లేవు",
  ta: "வர்கோத்தம கிரகங்களின் யோகம் இல்லை",
  en: "Vargottama Planetary Yoga Missing"
}
```

### 2.2 Fix Combustion Orb Precision
**File:** `src/features/premiumPdf/bhavishyaV1Service.ts`
**Lines:** 636-651 (combustion calculation)
**Fix:** Use exact classical orbs from BPHS

```typescript
// Replace lines 638-645 with precise orbs:
const combustionOrbs: Record<string, number> = {
  Moon: 12,      // 12°
  Mars: 17,      // 17°
  Mercury: p.isRetrograde ? 12 : 14,  // 12° retrograde, 14° direct
  Jupiter: 11,   // 11°
  Venus: p.isRetrograde ? 8 : 10,     // 8° retrograde, 10° direct
  Saturn: 15     // 15°
};
```

### 2.3 Strengthen Degree Leak Prevention
**File:** `src/features/premiumPdf/yogaDoshaGocharaEnricher.ts`
**Function:** `cleanDegreesFromText()` - enhance patterns

```typescript
// Add after line 103:
  // Additional patterns for degree leaks in AI outputs:
  s = s.replace(/\b\d+[\.,]\d+\s*(?:degrees?|°|डिग्री|ಡಿಗ್ರಿ|డిగ్రి|டிக்ரி)\b/gi, "");
  s = s.replace(/\b\d+°\d*'?\b/g, "");
  s = s.replace(/at\s+\d+\s*(?:degrees?|°)/gi, "");
  s = s.replace(/within\s+\d+[\.,]?\d*\s*°/gi, "in close conjunction");
  s = s.replace(/orb\s*(?:of\s*)?\d+[\.,]?\d*\s*°/gi, "");
  s = s.replace(/longitude\s*(?:of\s*)?\d+[\.,]?\d*/gi, "");
  s = s.replace(/sidereal\s+longitude/gi, "rashi position");
```

---

## Phase 3: New Attractive Adhyaya (Week 3)

### 3.1 Add "Adhyaya 11: Prashna & Immediate Guidance" 
**Files:** 
- `src/features/premiumPdf/premiumPrompts.ts` - add new prompt
- `src/features/premiumPdf/dynamicBhavishyaEngine.ts` - add fallback
- `src/components/RamanBhavishya/PdfTemplate.tsx` - render new section
- `src/features/premiumPdf/bhavishyaV1Validator.ts` - add validation

**Concept:** Prashna (Horary) chart for the moment of PDF generation - answers immediate pressing questions without needing birth time.

**Prompt Addition** (in `buildPremiumPrompts` return object):
```typescript
const prashnaGuidance = `${header(input, "prashnaGuidance", "You are a compassionate Vedic astrologer providing immediate Prashna guidance for " + input.name + " based on the moment of this reading.")}
CRITICAL PRASHNA MANDATE:
Generate a Prashna (Horary) chart for the exact moment this reading is generated: ${new Date().toISOString()}.
Analyze the Prashna Lagna, Moon, and planetary positions for immediate answers.

Write EXACTLY 4 PARAGRAPHS (5-6 lines each):
1. Prashna Lagna & Moon analysis - what the moment reveals about current mental state
2. Immediate question resolution - answer the most pressing unspoken question
3. Next 48-hour guidance - specific actionable steps
4. 【Prashna Shield】 - protective mantra/remedy for immediate peace

${JSON_RULE}
{"prashnaGuidance": [{"impact": "4 paragraphs"}]} `;
```

**Fallback Addition** (in `dynamicBhavishyaEngine.ts`):
```typescript
export function buildDynamicPrashnaFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  const now = new Date();
  const prashnaLagna = now.getHours() % 12; // Simplified
  const prashnaMoon = Math.floor((now.getMonth() * 2.5 + now.getDate()) % 12);
  
  // Generate 4 paragraphs based on prashna chart
  // ... implementation similar to other fallbacks
}
```

**PDF Template Rendering** (in `PdfTemplate.tsx` after Summary chapter):
```tsx
{/* ── Adhyaya 11: Prashna & Immediate Guidance ───────────────────────────── */}
{hasContent(premiumData?.prashnaGuidance) && (
  <div data-section="prashna-guidance" className={sectionClass}>
    {renderChapterBanner(
      11,
      "🔮",
      "ಪ್ರಶ್ನಾ ದೃಷ್ಟಿ & ತಾತ್ಕಾಲಿಕ ಮಾರ್ಗದರ್ಶನ",
      "Prashna Insight & Immediate Guidance",
      translations.prashnaGuidanceTitle
    )}
    <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-6">
      <div className="absolute top-3 left-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
      <div className="absolute top-3 right-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
      <div className="absolute bottom-3 left-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
      <div className="absolute bottom-3 right-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
      
      {premiumData!.prashnaGuidance!.map((pg, idx) => (
        <div key={idx} className="space-y-6" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
          {cleanSectionNarrative(pg.impact || "").map((cleaned, pIdx) => {
            const trimmed = cleaned.trim();
            const isShield = trimmed.startsWith('【') || trimmed.startsWith('[');
            if (isShield) {
              return (
                <div key={pIdx} className="bg-amber-100/90 border-2 border-amber-600/60 rounded-xl text-amber-950 p-6 shadow-sm text-xl leading-relaxed text-left font-medium break-words whitespace-pre-wrap">
                  {cleaned}
                </div>
              );
            }
            return (
              <p key={pIdx} className="text-xl leading-relaxed text-amber-950 text-justify font-medium break-words whitespace-pre-wrap">
                {cleaned}
              </p>
            );
          })}
        </div>
      ))}
    </div>
  </div>
)}
```

**Validation Addition** (in `bhavishyaV1Validator.ts`):
```typescript
// Add to dictionary:
prashnaGuidance: {
  kn: "ಅಧ್ಯಾಯ ೧೧: ಪ್ರಶ್ನಾ ದೃಷ್ಟಿ & ತಾತ್ಕಾಲಿಕ ಮಾರ್ಗದರ್ಶನ",
  hi: "अध्याय ११: प्रश्न दृष्टि एवं तात्कालिक मार्गदर्शन",
  te: "అధ్యాయం 11: ప్రశ్న దృష్టి & తాత్కాలిక మార్గదర్శనం",
  ta: "அத்தியாயம் 11: பிரச்னா பார்வை & உடனடி வழிகாட்டுதல்",
  en: "Chapter 11: Prashna Insight & Immediate Guidance"
}

// Add validation in validateBhavishyaV1Content():
const hasPrashna = pd.prashnaGuidance &&
  pd.prashnaGuidance.length > 0 &&
  pd.prashnaGuidance.some(p => (p.impact || "").trim().length >= 100);
if (!hasPrashna) {
  missing.push(getLocalizedSectionName("prashnaGuidance", baseLang));
}
```

---

## Phase 4: Enhanced Validation Rules (Week 4)

### 4.1 Pre-Render Audit Enhancement
**File:** `src/features/premiumPdf/bhavishyaV1Service.ts`
**Function:** `captureBhavishyaV1Pdf()` - strengthen lines 2152-2205

```typescript
// Add before html2canvas rendering:
const preRenderChecks = [
  { check: () => payload?.premiumData?.soulMirror?.truth1Text?.length >= 80, name: "Soul Mirror Truth 1" },
  { check: () => payload?.premiumData?.characteristics?.some(c => c.impact?.length >= 100), name: "Characteristics" },
  { check: () => payload?.premiumData?.darkSecret?.some(d => d.impact?.length >= 100), name: "Dark Secret" },
  { check: () => payload?.premiumData?.currentPhase?.some(c => c.impact?.length >= 200), name: "Current Phase" },
  { check: () => payload?.premiumData?.yogas?.some(y => y.impact?.length >= 200), name: "Yogas" },
  { check: () => payload?.premiumData?.doshas?.some(d => d.impact?.length >= 200), name: "Doshas" },
  { check: () => payload?.premiumData?.gochara?.some(g => g.impact?.length >= 200), name: "Gochara" },
  { check: () => payload?.premiumData?.timeline?.length >= 6, name: "Timeline (6 months)" },
  { check: () => payload?.premiumData?.summary?.some(s => s.impact?.length >= 150), name: "Summary" },
  { check: () => payload?.premiumData?.prashnaGuidance?.some(p => p.impact?.length >= 100), name: "Prashna Guidance" },
  { check: () => !payload?.translations?.nameValue?.includes("undefined"), name: "Name not undefined" },
  { check: () => !JSON.stringify(payload).includes("Sorry, I encountered"), name: "No AI error leakage" },
];

const failedChecks = preRenderChecks.filter(c => !c.check());
if (failedChecks.length > 0) {
  throw new BhavishyaValidationError(
    `Pre-render validation failed: ${failedChecks.map(c => c.name).join(", ")}`,
    failedChecks.map(c => c.name)
  );
}
```

### 4.2 Zero-Blank Section Guarantee
**File:** `src/components/RamanBhavishya/PdfTemplate.tsx`
**Function:** `hasContent()` - enhance line 268

```typescript
const hasContent = (items?: { impact?: string }[]) => {
  if (!items || items.length === 0) return false;
  return items.some(item => {
    const text = (item.impact || item.paragraph1 || item.paragraph2 || item.truth1Text || item.truth2Text || item.truth3Text || "").trim();
    // Must have substantial content in target script (not just punctuation)
    if (text.length < 15) return false;
    // Must contain actual Indic characters for non-English
    if (langKey !== "en" && !/[\u0900-\u0D7F]/.test(text)) return false;
    return true;
  });
};
```

---

## File Change Summary

| File | Changes |
|------|---------|
| `PdfTemplate.tsx` | Font fixes, Prashna chapter rendering, hasContent enhancement |
| `dynamicBhavishyaEngine.ts` | Navamsha lords, Argala/Virodha, Prashna fallback |
| `premiumPrompts.ts` | Maandi Inquest fix, Prashna prompt |
| `bhavishyaV1Validator.ts` | Cross-chapter dedup, Vargottama guard, Prashna validation |
| `bhavishyaV1Service.ts` | Combustion orbs, pre-render audit |
| `yogaDoshaGocharaEnricher.ts` | Degree leak patterns |

---

## Testing Checklist

- [ ] All 5 languages render without broken conjuncts
- [ ] No English words in regional PDF outputs
- [ ] No degree symbols (°, degrees, डिग्री, ಡಿಗ್ರಿ) in any output
- [ ] All 11 chapters present and validated
- [ ] Cross-chapter deduplication catches duplicates
- [ ] Vargottama planets correctly identified
- [ ] Combustion orbs match classical texts
- [ ] Prashna chapter generates meaningful guidance
- [ ] Pre-render audit catches missing sections
- [ ] Priest review score ≥ 95%

---

## Implementation Order

1. **Start with:** `PdfTemplate.tsx` font fixes (immediate visual impact)
2. **Then:** `dynamicBhavishyaEngine.ts` Navamsha + Argala (mathematical foundation)
3. **Then:** `premiumPrompts.ts` Maandi fix + Prashna prompt
4. **Then:** `bhavishyaV1Validator.ts` cross-chapter dedup + Vargottama
5. **Then:** `bhavishyaV1Service.ts` combustion orbs + pre-render audit
6. **Then:** `yogaDoshaGocharaEnricher.ts` degree leak patterns
7. **Finally:** `PdfTemplate.tsx` Prashna chapter rendering
8. **Test:** Full regression with 100 test charts