# Update PalmReadingPage.tsx & SankhyaShastraPage.tsx

# 1. PalmReadingPage.tsx
palm_path = "src/pages/PalmReadingPage.tsx"
with open(palm_path, "r", encoding="utf-8") as f:
    palm = f.read()

if "sanitizeAIText" not in palm:
    palm = palm.replace(
        'import { PalmReadingPdfTemplate } from "../components/palmreading/PalmReadingPdfTemplate";',
        'import { PalmReadingPdfTemplate } from "../components/palmreading/PalmReadingPdfTemplate";\nimport { sanitizeAIText } from "../utils/textFormatter";'
    )

# Sanitize message text in chat timeline
palm = palm.replace("{msg.text}", "{sanitizeAIText(msg.text)}")

# Add bottom PDF button inside chat form bar
bottom_pdf_btn_palm = '''          {/* Bottom PDF Download Action Bar */}
          {activeResult && (
            <div className="flex justify-end pt-3 border-t border-amber-200">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 px-5 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-950 disabled:opacity-50"
              >
                <span>📄</span>
                <span>{isGeneratingPdf ? (isKn ? "⌛ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating PDF...") : (isKn ? "ಪೂರ್ಣ ವರದಿ ಹಾಗೂ ಪ್ರಶ್ನೋತ್ತರ PDF ಡೌನ್‌ಲೋಡ್" : "Download Full Report & Q&A PDF")}</span>
              </button>
            </div>
          )}
'''

if "Bottom PDF Download Action Bar" not in palm:
    palm = palm.replace("</Card>\n      )", bottom_pdf_btn_palm + "\n        </Card>\n      )")

# Pass messages prop to PDF template
palm = palm.replace(
    '<PalmReadingPdfTemplate result={activeResult} personName={devoteeName} lang={selectedLang} />',
    '<PalmReadingPdfTemplate result={activeResult} personName={devoteeName} lang={selectedLang} messages={messages} />'
)

with open(palm_path, "w", encoding="utf-8") as f:
    f.write(palm)

print("Updated PalmReadingPage.tsx with text sanitization, bottom PDF button & Q&A export.")

# 2. SankhyaShastraPage.tsx
sankhya_path = "src/pages/SankhyaShastraPage.tsx"
with open(sankhya_path, "r", encoding="utf-8") as f:
    sankhya = f.read()

if "sanitizeAIText" not in sankhya:
    sankhya = sankhya.replace(
        'import { SankhyaShastraPdfTemplate } from "../components/sankhyashastra/SankhyaShastraPdfTemplate";',
        'import { SankhyaShastraPdfTemplate } from "../components/sankhyashastra/SankhyaShastraPdfTemplate";\nimport { sanitizeAIText } from "../utils/textFormatter";'
    )

# Sanitize message text in chat timeline
sankhya = sankhya.replace("{msg.text}", "{sanitizeAIText(msg.text)}")

# Add bottom PDF button inside chat form bar
bottom_pdf_btn_sankhya = '''          {/* Bottom PDF Download Action Bar */}
          {activeResult && (
            <div className="flex justify-end pt-3 border-t border-amber-200">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 px-5 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-950 disabled:opacity-50"
              >
                <span>📄</span>
                <span>{isGeneratingPdf ? (isKn ? "⌛ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating PDF...") : (isKn ? "ಪ್ರಶ್ನಾ ಫಲ ಹಾಗೂ ಪ್ರಶ್ನೋತ್ತರ PDF ಡೌನ್‌ಲೋಡ್" : "Download Prashna Report & Q&A PDF")}</span>
              </button>
            </div>
          )}
'''

if "Bottom PDF Download Action Bar" not in sankhya:
    sankhya = sankhya.replace("</Card>\n      )", bottom_pdf_btn_sankhya + "\n        </Card>\n      )")

# Pass messages prop to PDF template
sankhya = sankhya.replace(
    '<SankhyaShastraPdfTemplate result={activeResult} personName={devoteeName} lang={selectedLang} />',
    '<SankhyaShastraPdfTemplate result={activeResult} personName={devoteeName} lang={selectedLang} messages={messages} />'
)

with open(sankhya_path, "w", encoding="utf-8") as f:
    f.write(sankhya)

print("Updated SankhyaShastraPage.tsx with text sanitization, bottom PDF button & Q&A export.")
