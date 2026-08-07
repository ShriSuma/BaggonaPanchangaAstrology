---
name: baggona-bhavishya-ui
description: Instructions and layout rules for the Baggona Bhavishya (Life Stage Predictions) Page and Premium PDF integration.
---

# Baggona Bhavishya UI & Logic Skill

This skill contains specific instructions regarding the `BhavishyaView.tsx` page and the Premium PDF generation.

## 1. Page Flow
- **Life Stage Predictions**: Automatically generated on load using `usePredictionEngine.ts` calling `askGeminiBatch`.
- **Premium PDF**: An expanded, multi-category PDF incorporating Yogas, Doshas, and Deep Insights. 
- The generation of the Premium PDF should ALWAYS reuse the layout defined in `PremiumPDFTemplate.tsx`.

## 2. API Constraints
- The UI triggers `askGeminiBatch` using `@google/generative-ai` on the client side.
- **Model Name**: Must always be `gemini-3.5-flash-lite` to comply with user rate limit rules.
- If an API error occurs, the UI must display the error message explicitly via the `catch` block in `usePredictionEngine.ts`, ensuring the user knows if their API key failed or if they hit rate limits.

## 3. PDF Generation Architecture
- PDF generation leverages `html2canvas` and `jsPDF`.
- The `PremiumPDFTemplate` component is rendered off-screen (e.g., `left-[-9999px]`).
- Do NOT use standard browser printing (`window.print`) for the Premium PDF; it must remain a seamless, styled download.
