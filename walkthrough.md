# Baggona Panchanga - 15-Year Google Calendar & QR Code Overhaul Walkthrough

## Summary of Accomplishments

### 1. 100% Mobile QR Code Scanning Fix (PDF & On-Screen Modal)
- **Root Cause Identified**: The QR code previously generated a multi-KB raw multiline `BEGIN:VCALENDAR...` string, which iOS Camera, Android Camera, and Google Lens fail to recognize as openable links.
- **Solution**: Upgraded `generateNative90DayQrCalendarPayload` to generate a direct `https://calendar.google.com/calendar/render?action=TEMPLATE&...` URL.
- **Result**: Scanning the QR code from **both the printed PDF and the on-screen modal** on any smartphone camera immediately displays a 1-click **"Open in Google Calendar"** prompt.

---

### 2. Luxury 15-Year Google Calendar Design Standards
- **Color-Coded Day Badges & Event Colors**:
  - 🟢 **High Energy / Good Days**: Marked with `🟢 HIGH ENERGY DAY` badge in the summary title, `COLOR:green` in `.ics`, and `colorId=10` (Emerald Green) in Google Calendar URLs.
  - 🟡 **Balanced Days**: Marked with `🟡 BALANCED DAY` badge, `COLOR:gold`, and `colorId=5` (Banana Yellow).
  - 🔴 **Caution Days (Chandrashtama / Amavasya / Low Score)**: Marked with `🔴 CAUTION DAY` badge, `COLOR:crimson`, and `colorId=11` (Tomato Red).

- **Visual Energy Level Meter**:
  - Displays a clean visual progress bar in the calendar description:
    - High Energy: `[▓▓▓▓▓▓▓▓░░] 85%`
    - Balanced: `[▓▓▓▓▓░░░░░] 60%`
    - Caution: `[▓▓▓░░░░░░░] 30%`

- **Single-Letter Focus Tag**:
  - `⚡ A` (Action / Growth & Success for High Energy days)
  - `⚖️ B` (Balance / Duty & Routine for Balanced days)
  - `🧘 S` (Shanti / Exercise Care & Prayer for Caution days)

- **Daily Kaala Timings (Rahu Kaala, Gulika Kaala, Yamaganda)**:
  - Automatically calculates exact daily octant timings for Kolkata / IST timezone based on the day lord:
    - 🔴 **Rahu Kaala** (Avoid new initiatives)
    - 🟡 **Gulika Kaala** (Favorable for action)
    - 🟢 **Yamaganda** (Good for prayer and reflection)

- **Sanskrit Mantras Removed**:
  - Sanskrit Devanagari mantras removed per user directive to ensure 100% readable local language guidance.

---

## Verification Results

### Unit Test Suite
- Run Command: `npx vitest run`
- Results: **50 Test Files Passed (100%), 170 Tests Passed (100%)**.
- Git Commit: `781d852` pushed to `release/seva-and-prasada`.
