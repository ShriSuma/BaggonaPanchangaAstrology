---
name: baggona-astrology-master
description: Master skill for the Baggona Panchanga Astrology project. Contains strict guidelines on API models, architecture, and UI structure to avoid repeating previous mistakes.
---

# Baggona Astrology Master Skill

This skill contains the master instructions and constraints for the Baggona Panchanga Astrology project. YOU MUST FOLLOW THESE RULES strictly when generating predictions, editing files, or handling API models.

## 1. API Models & Rate Limiting
- **CRITICAL**: The user is subject to strict rate limits (e.g., 20 requests per day) with standard Gemini models (like `gemini-1.5-flash`).
- To circumvent this and ensure the application remains functional, the project exclusively uses `gemini-3.5-flash-lite` as the standard model in the codebase (e.g., in `src/core/GeminiEngine.ts`).
- **NEVER** "fix" or change `gemini-3.5-flash-lite` back to `gemini-1.5-flash` or any other model unless explicitly instructed by the user. Doing so will immediately break the UI and PDF generation with rate limit errors or model availability errors.

## 2. Architecture & File Naming
- The project is built using React, Vite, and TypeScript.
- The original core engine `BvRamanPredictionEngine.ts` has been renamed to `BaggonaPredictionEngine.ts` across the project. Do not reintroduce B.V. Raman naming.
- All translations should seamlessly fall back to `gtx` (Google Translate free endpoint) if no `GOOGLE_TRANSLATE_API_KEY` is present.
- Premium PDF generation uses `lib/premiumPdfCore.mjs` and `PremiumPDFTemplate.tsx`.

## 3. Tool Usage Best Practices
- Avoid using regex for string replacements via python scripts. Use `replace_file_content` or standard python `replace()` to avoid escape character issues.
- Do not run `cat` in bash to create/append to files.
- Thoroughly check `useEffect` and `useState` dependencies when dealing with API fetch logic in the UI components like `BhavishyaView.tsx`.
- Surface API errors clearly in the UI. If `setPredictions` catches an error, ensure it renders properly instead of just failing silently to "No predictions available".

## 4. UI & Features
- The Raman Bhavishya section is completely focused on "Life Stage Predictions" combined with Premium PDF.
- PDF downloads use `html2canvas` and `jsPDF`. The `PremiumPDFTemplate` is rendered hidden off-screen until needed.

Always remember: Do not modify the API model string unless you are 100% sure the user has access to it and rate limit restrictions won't break the experience.
