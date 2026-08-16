---
name: baggona-qr-code-guard
description: >-
  Mandatory rules to ensure QR codes are always scannable in Baggona Panchanga
  application and PDF downloads. Use this skill whenever modifying QR code
  generation, Google Calendar URL creation, calendar sync modals, or any
  component that generates QR codes for the Seva & Prasada pages.
---

# Baggona QR Code Guard Skill

Use this skill whenever you are creating, modifying, or debugging QR code generation in the Baggona Panchanga project — including on-screen QR codes, PDF-embedded QR codes, Google Calendar links, Apple iCal links, or Web Sanctum deep links.

## 1. Root Cause: Unscannable QR Codes

QR codes have a **hard data capacity limit** based on version and error correction level:

| QR Version | Error Correction L | Error Correction M | Error Correction H |
|------------|-------------------|-------------------|-------------------|
| Version 10 | 652 bytes | 513 bytes | 331 bytes |
| Version 25 | 1,853 bytes | 1,455 bytes | 940 bytes |
| Version 40 (MAX) | **2,953 bytes** | 2,331 bytes | 1,502 bytes |

### What Causes the Bug
The `generateGoogleCalendarUrl()` function produces URLs containing:
- **Unicode emojis** (🕉️, 🙏, ⚡, 🌙, 🔴, 🟡, 🟢, etc.) — each emoji is 4+ bytes, URL-encoded to 12+ bytes
- **Kannada/Sanskrit text** — each character is 3 bytes UTF-8, URL-encoded to 9 bytes
- **Long encrypted tokens** — Base64 devotee tokens add 200+ bytes
- **Verbose descriptions** — deity mantras, energy meters, kaala timings

When URL-encoded, the full Google Calendar URL exceeds **3,000+ bytes**, making QR codes **physically impossible to scan**.

## 2. MANDATORY: Two-URL Architecture (CRITICAL)

### Rule 2.1: Full URL for Browser Buttons ONLY
The full rich Google Calendar URL (`generateGoogleCalendarUrl()`) with emojis, Unicode text, and complete details is used **ONLY** for:
- "Add to Google Calendar" button clicks (`window.open(url, "_blank")`)
- Direct browser navigation links

### Rule 2.2: Compact URL for QR Codes ONLY
QR codes **MUST always** use the compact URL (`generateCompactGoogleCalendarUrlForQR()`) which:
- Uses **ASCII-only text** (no emojis, no Unicode)
- Keeps total URL length **under 600 characters**
- Still includes the 90-day recurrence rule and Sanctum link

```typescript
// ✅ CORRECT — QR code uses compact URL
if (target === "google") {
  return generateCompactGoogleCalendarUrlForQR(options);
}

// ✅ CORRECT — Button click uses full URL
const url = generateGoogleCalendarUrl({ day, lang, panditName, ... });
window.open(url, "_blank");
```

```typescript
// ❌ WRONG — NEVER put full URL in QR code
QRCode.toDataURL(generateGoogleCalendarUrl(options)); // WILL NOT SCAN!
```

## 3. MANDATORY: QR Code Generation Rules

### Rule 3.1: Always Use Error Correction Level "L"
Level L gives maximum data capacity (2,953 bytes at version 40). Higher levels (M, Q, H) reduce capacity.

```typescript
QRCode.toDataURL(payload, {
  errorCorrectionLevel: "L",  // ← MANDATORY for calendar URLs
  margin: 2,
  width: 280,
  color: { dark: "#78350F", light: "#FFFFFF" }
});
```

### Rule 3.2: Always Provide ASCII-Only Fallback
Every QR generation call **MUST** have a try/catch with a compact ASCII fallback:

```typescript
try {
  qrUrl = await QRCode.toDataURL(payload, { errorCorrectionLevel: "L", ... });
} catch (err) {
  // Compact ASCII-only fallback — guaranteed to fit in QR
  const fallback = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${
    encodeURIComponent("Baggona 90-Day Panchanga Calendar")
  }&recur=RRULE:FREQ=DAILY;COUNT=90&ctz=Asia/Kolkata`;
  qrUrl = await QRCode.toDataURL(fallback, { errorCorrectionLevel: "L", ... });
}
```

### Rule 3.3: Maximum Payload Size Check
Before generating any QR code, verify the payload length:
- **< 600 chars** = Safe for all QR scanners
- **600-1000 chars** = Works but may need larger QR image
- **> 1000 chars** = Risk of scanning failure on older phones
- **> 2000 chars** = WILL NOT SCAN on most devices

### Rule 3.4: No Emojis in QR Payloads
**NEVER** include emoji characters (🕉️🙏⚡🌙🔴🟡🟢📱📅✨🪔) in any string that will be encoded into a QR code. Each emoji is 4 bytes raw but becomes 12+ bytes when URL-encoded.

## 4. Key File Locations

| File | QR Code Role |
|------|-------------|
| `src/features/seva/icsCalendarGenerator.ts` | `generateCompactGoogleCalendarUrlForQR()` — compact QR URL |
| `src/features/seva/icsCalendarGenerator.ts` | `generateGoogleCalendarUrl()` — full button URL (NOT for QR) |
| `src/features/seva/icsCalendarGenerator.ts` | `generateQrPayloadByTarget()` — routes to compact URL for "google" |
| `src/components/seva/SevaCalendarSyncModal.tsx` | On-screen QR code generation in the sync modal |
| `src/components/seva/PrasadaKit.tsx` | PDF QR code generation for downloads |
| `src/components/seva/pdf/SevaPrintTemplates.tsx` | `SevaQRCodePrint` — QR code page in PDF |

## 5. Testing QR Codes

### Automated Check
After any QR-related change, verify the generated URL length:
```typescript
const url = generateCompactGoogleCalendarUrlForQR(options);
console.assert(url.length < 1000, `QR URL too long: ${url.length} chars`);
```

### Manual Check
1. Open dev server → Seva & Prasada tab
2. Select **"Google Cal"** QR destination
3. Scan the on-screen QR code with phone camera
4. Verify: Opens Google Calendar with "Baggona Panchanga - 90 Day Seva Calendar"
5. Verify: Event has `RRULE:FREQ=DAILY;COUNT=90` recurrence
6. Download a PDF (Blessing Letter)
7. Scan the QR code **in the downloaded PDF**
8. Verify: Same Google Calendar event opens

### Cross-Platform Check
- Test on Android (Google Lens / Camera app)
- Test on iPhone (native Camera QR scanner)
- Test with dedicated QR scanner app
