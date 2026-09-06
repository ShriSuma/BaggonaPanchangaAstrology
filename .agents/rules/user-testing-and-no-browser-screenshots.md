# User Testing & No Browser Screenshot Rule (ಬಳಕೆದಾರರ ಪರೀಕ್ಷೆ ಮತ್ತು ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ನಿರ್ಬಂಧ ನಿಯಮ)

## Mandatory Directive
1. **User Does All Manual Testing**:
   - The agent MUST NOT use browser subagents or browser screenshot tools to test, click, or take screenshots of the UI.
   - The user will personally test all UI changes, forms, PDF downloads, and user interactions in their own browser.

2. **Agent Responsibilities**:
   - Make all code modifications, unit tests (`npm test`), and type checks (`npx tsc --noEmit` / build) accurately.
   - Run the application dev server locally (`npm run dev`).
   - Provide the local application URL directly to the user (e.g. `http://localhost:5173/` or `http://localhost:5173/bhavishya`) so the user can test it themselves immediately.
   - Report the changes clearly and concisely.
