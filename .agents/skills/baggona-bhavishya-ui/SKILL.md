---
name: baggona-bhavishya-ui
description: Instructions and rules for the Baggona Bhavishya (Life Stage Predictions) Page, AI narrative engine, PDF Language selector, and UI error handling.
---

# Baggona Bhavishya UI & Prediction Engine Skill

Activate or reference this skill when modifying `BhavishyaView.tsx`, `usePredictionEngine.ts`, or the Raman Bhavishya predictions page.

## 1. Core Page Flow & Features
- **Life Stage Predictions**: Loaded via `usePredictionEngine.ts`.
- **PDF Language Selector**: Radio buttons (`pdfLanguage`: `kn`, `te`, `ta`, `hi`, `en`) allow the user to export the report in any of the 5 supported languages regardless of current app UI language.
- **PDF Export Buttons**:
  1. **Download Premium PDF**: Generates the complete continuous parchment reading (`PdfTemplate.tsx`).
  2. **Download A4 Printable PDF**: Generates the multi-page A4 printable book (`PremiumPDFTemplate.tsx`).

## 2. API Quota & Retry Protection
- **Model**: `gemini-3.5-flash-lite` MUST be used for all AI narrative calls.
- **Automatic 3 Retries**: All API calls use a 3-attempt retry loop with exponential backoff before declaring an error.
- **Quota Saver**: Engine predictions (`usePredictionEngine`) are cached locally in state. Do not re-fetch from AI if session data is unchanged.

## 3. UI Error & State Handling
- Show clear loading spinners and progress text (e.g., "Consulting planetary positions...", "Generating 5-language localized PDF...").
- Catch and display errors clearly in the UI. Never fail silently or leave blank screens.
