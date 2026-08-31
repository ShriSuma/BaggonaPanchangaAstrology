---
name: ALL
description: Comprehensive catalog of all available Antigravity skills. Triggered by /ALL, /all, /All, or @ALL to list every skill name, description, and example use case.
---

# Master Skill Catalog (ALL)

When the user enters `/ALL`, `/all`, `/All`, or mentions `ALL`, display this complete, structured directory of all skills available in this Antigravity workspace environment.

---

## 1. Project-Specific Skills (Baggona Panchanga Astrology)

### 1. `baggona-astrology-master`
- **Description**: Master skill for the Baggona Panchanga Astrology project. Defines strict rules on API model selection (`gemini-3.5-flash-lite`), quota protection, 5-language locale engine, and project architecture.
- **Example When to Use**: Mention `@baggona-astrology-master` when making core architectural changes, updating engines, or managing API quota rules.

### 2. `baggona-pdf-generator`
- **Description**: Layout rules for Baggona Panchanga PDF generation (continuous & A4 multi-page printable formats), Indic font rendering, zero-blank section validation, and luxury gold design.
- **Example When to Use**: Mention `@baggona-pdf-generator` when fixing PDF text overlapping, updating page layouts, or adding printable A4 formats.

### 3. `baggona-bhavishya-ui`
- **Description**: Instructions and rules for the Baggona Bhavishya (Life Stage Predictions) Page, AI narrative engine, PDF Language selector, and UI error handling.
- **Example When to Use**: Mention `@baggona-bhavishya-ui` when adding new prediction buttons, modifying `BhavishyaView.tsx`, or tuning UI state logic.

### 4. `baggona-seva-prasada-guard`
- **Description**: Master instructions, layout protection rules, 5-page Ashirvada PDF download layout, QR code scannability, Indic font rendering, and vertical layout stacking for Seva & Prasada pages.
- **Example When to Use**: Mention `@baggona-seva-prasada-guard` whenever modifying Seva & Prasada pages, PDF download utilities, or QR code generators.

### 5. `baggona-daily-darshana-token-guard`
- **Description**: Mandatory rules and layout/data validation guards for `DailyDarshanaPage.tsx` and `tokenCipher.ts`. Enforces authentic birth Kundli calculation (DOB/TOB), transit vs natal separation, Base64URL resilient decoding with `TextDecoder`, gold banner display with Kannada text `"॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥"`, 4-tab system integrity, and pre-push build validation.
- **Example When to Use**: Mention `@baggona-daily-darshana-token-guard` whenever modifying `DailyDarshanaPage.tsx`, `tokenCipher.ts`, or testing devotee URL tokens.

### 6. `baggona-panchanga-book-publisher`
- **Description**: Master blueprint, architecture, rules, and computational pipelines for the automated 104-page Baggona Panchanga Book Publisher Engine (ಪಂಚಾಂಗ ಪುಸ್ತಕ ಪ್ರಕಾಶನ ಎಂಜಿನ್). Generates press-ready, exact-replica 104-page annual Panchanga book PDFs for any Samvatsara with 1-click deterministic accuracy.
- **Example When to Use**: Mention `@baggona-panchanga-book-publisher` whenever working on the automated 104-page annual Panchanga book generator, Drik ephemeris tables, Graha Chakras, or press-ready printing outputs.

### 7. `ALL`
- **Description**: Complete catalog of all Antigravity skills, descriptions, and example trigger scenarios.
- **Example When to Use**: Type `/ALL`, `/all`, or `/All` whenever you need a full list of all available agent capabilities.

---

## 2. Core Development & Web Skills

### 5. `modern-web-guidance`
- **Description**: Search tool and guidelines for modern web development (CSS Grid, Flexbox, glassmorphism, responsive design, animations).
- **Example When to Use**: When designing or styling modern web interfaces, dialogs, cards, or CSS layouts.

### 6. `chrome-devtools`
- **Description**: Debugging, troubleshooting, performance profiling, and browser automation via DevTools.
- **Example When to Use**: When debugging web app layout issues, network requests, or performance bottlenecks.

### 7. `chrome-extensions`
- **Description**: Guidelines for building, debugging, and publishing Chrome Extensions (Manifest V3).
- **Example When to Use**: When developing extension popups, background service workers, or content scripts.

### 8. `a11y-debugging`
- **Description**: Accessibility auditing and debugging based on WCAG / web.dev standards.
- **Example When to Use**: When auditing tap targets, keyboard navigation, color contrast, or ARIA labels.

### 9. `debug-optimize-lcp`
- **Description**: Guides debugging and optimizing Largest Contentful Paint (LCP) and Core Web Vitals.
- **Example When to Use**: When web page load speeds or hero image rendering need performance tuning.

### 10. `memory-leak-debugging`
- **Description**: Diagnoses memory leaks and high heap usage in JavaScript/Node.js.
- **Example When to Use**: When analyzing heap snapshots, heap memory growth, or unhandled listeners.

---

## 11. Firebase & Cloud App Skills

### 11. `firebase-basics`
- **Description**: Foundational setup, CLI commands, project initialization, and config management for Firebase.
- **Example When to Use**: Setting up new Firebase projects or initializing SDK configs.

### 12. `firebase-firestore`
- **Description**: Data modeling, security rules, real-time queries, and index optimization for Cloud Firestore.
- **Example When to Use**: Writing Firestore queries, designing NoSQL collections, or setting security rules.

### 13. `firebase-auth-basics`
- **Description**: Authentication setup, sign-in providers, user management, and security tokens.
- **Example When to Use**: Implementing user login, registration, OAuth, or auth state listeners.

### 14. `firebase-ai-logic-basics`
- **Description**: Integration of Firebase AI Logic (Gemini API) into web & mobile applications.
- **Example When to Use**: Setting up Gemini API multimodal prompts or structured output with Firebase.

---

## 15. Google Cloud & Data Pipeline Skills

### 15. `bigquery-sql`
- **Description**: BigQuery SQL optimization, execution best practices, cost reduction, and analytical queries.
- **Example When to Use**: Writing complex analytical SQL, window functions, or tuning BigQuery query costs.

### 16. `building-data-apps`
- **Description**: Building interactive data applications, dashboards, and reporting interfaces.
- **Example When to Use**: Creating interactive charts, dashboards, or data visualization pages.

### 17. `managing-python-dependencies`
- **Description**: Proper virtual environment and dependency management for Python projects.
- **Example When to Use**: Adding Python packages, creating venvs, or setting up `requirements.txt`.

---

## 18. Scientific & Specialized Domain Skills

### 18. `literature-search-arxiv` / `pubmed-database`
- **Description**: Literature search and article retrieval from academic databases (arXiv, PubMed).
- **Example When to Use**: Finding research papers, literature citations, or scientific abstracts.

### 19. `predictingthepast`
- **Description**: Ancient text restoration, dating, and attribution (Aeneas/Ithaca models).
- **Example When to Use**: Analyzing or contextualizing ancient inscriptions or classical epigraphic texts.

---

## Quick Reference Summary

| Command / Skill Name | Domain | Primary Purpose |
| :--- | :--- | :--- |
| `/ALL` or `ALL` | Meta Catalog | Displays this entire directory of skills and usage examples. |
| `@baggona-astrology-master` | Baggona Core | Master architecture, API model rules (`gemini-3.5-flash-lite`), 5-language locale. |
| `@baggona-pdf-generator` | PDF Generation | Continuous & A4 multi-page printable PDFs, font rendering, zero-blank rules. |
| `@baggona-bhavishya-ui` | UI & Predictions | Bhavishya page (`BhavishyaView.tsx`), AI narrative retries, PDF language selector. |
| `@modern-web-guidance` | Frontend Design | Best practices for HTML5, Tailwind CSS, animations, and responsive web design. |
