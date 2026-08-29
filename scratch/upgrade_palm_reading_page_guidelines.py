filepath = "src/pages/PalmReadingPage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add Multimodal Photo Upload Guidelines Card right above Upload Zone
upload_guidelines_ui = '''
        {/* Multimodal Palm Photo Capture & Upload Guidelines Card */}
        <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-100/90 via-amber-50 to-orange-100 p-4 text-xs space-y-2 shadow-inner">
          <div className="font-extrabold text-amber-950 flex items-center gap-1.5 border-b border-amber-300/80 pb-1.5">
            <span>📸</span>
            <span>{isKn ? "ನಿಖರ ಹಸ್ತ ರೇಖಾ ವಿಶ್ಲೇಷಣೆಗೆ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾರ್ಗದರ್ಶಿ (Photo Guidelines)" : "Multimodal Palm Photo Capture Guidelines"}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-amber-900">
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
              <strong className="text-amber-950 block mb-0.5">🖐️ ೧. ಮುಂಭಾಗದ ಹಸ್ತ (Front Palm):</strong>
              {isKn ? "ಆಯುರ್, ಬುದ್ಧಿ ಹಾಗೂ ಹೃದಯ ರೇಖೆಗಳು ಸ್ಪಷ್ಟವಾಗಿ ಕಾಣಿಸುವಂತೆ ಬೆಳಗಿನ ಬೆಳಕಿನಲ್ಲಿ ನೇರ ಫೋಟೋ ತೆಗೆಯಿರಿ." : "Capture front palm under clear lighting for major lines."}
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
              <strong className="text-amber-950 block mb-0.5">📐 ೨. ಪಾರ್ಶ್ವ ಹಸ್ತ (Side View):</strong>
              {isKn ? "ಬುಧ ಪರ್ವತದ ಕೆಳಗಿನ ವಿವಾಹ ಹಾಗೂ ಸಂತಾನ ರೇಖೆಗಳು ಕಾಣಲು ಹಸ್ತದ ಪಕ್ಕದ ಫೋಟೋ ಉಪಯುಕ್ತ." : "Side view captures marriage and children lines near Mercury."}
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
              <strong className="text-amber-950 block mb-0.5">💅 ೩. ಹಸ್ತದ ಹಿಂಭಾಗ (Back View):</strong>
              {isKn ? "ಬೆರಳುಗಳ ನಖ ಹಾಗೂ ಆಕಾರದಿಂದ ಜಾತಕರ ಮಾನಸಿಕ ಸ್ವಭಾವ ಹಾಗೂ ಆರೋಗ್ಯ ಪರೀಕ್ಷೆ ಸಿದ್ಧಿಸುತ್ತದೆ." : "Back view examines nails & finger shape for temperament."}
            </div>
          </div>
        </div>
'''

if "Multimodal Palm Photo Capture Guidelines" not in content:
    content = content.replace('{/* Hand Selector */}', upload_guidelines_ui + '\n        {/* Hand Selector */}')

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Upgraded PalmReadingPage.tsx with Multimodal Palm Photo Guidelines.")
