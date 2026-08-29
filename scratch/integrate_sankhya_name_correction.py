filepath = "src/pages/SankhyaShastraPage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add generateNumerologicalNameCorrections import
if "generateNumerologicalNameCorrections" not in content:
    content = content.replace(
        'import { executeSankhyaShastraCalculation, SankhyaShastraResult } from "../features/sankhyashastra/sankhyaShastraEngine";',
        'import { executeSankhyaShastraCalculation, SankhyaShastraResult } from "../features/sankhyashastra/sankhyaShastraEngine";\nimport { generateNumerologicalNameCorrections } from "../features/sankhyashastra/nameCorrectionEngine";'
    )

# Add Name Correction tab content inside timeline
name_correction_ui = '''
          {/* Numerological Name Correction for Luck & Prosperity Card */}
          {devoteeName && (
            <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 p-5 text-white shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-amber-500/40 pb-2">
                <h4 className="font-serif text-sm font-bold text-amber-200 flex items-center gap-2">
                  <span>✨</span>
                  <span>{isKn ? "ಸಂಖ್ಯಾ ನಕ್ಷತ್ರ ಹೆಸರು ತಿದ್ದುಪಡಿ (Numerological Name Correction for Luck)" : "Numerological Name Correction for Luck & Prosperity"}</span>
                </h4>
                <span className="text-xs bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/40">Chaldean Vibration</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {generateNumerologicalNameCorrections(devoteeName).map((sug, idx) => (
                  <div key={idx} className="rounded-xl border border-amber-400/40 bg-amber-900/60 p-3 text-xs space-y-1">
                    <div className="font-extrabold text-amber-300 text-sm">{sug.suggestedSpelling}</div>
                    <div className="text-amber-200 font-semibold">
                      {isKn ? "ಸಂಖ್ಯಾ ಬಲ:" : "Root:"} {sug.suggestedRoot} (Compound: {sug.suggestedCompound})
                    </div>
                    <div className="text-[11px] text-emerald-300 font-bold">{sug.vibrationQuality[selectedLang] || sug.vibrationQuality.kn}</div>
                    <div className="text-[10.5px] text-amber-100/90 leading-normal">{sug.luckImpact[selectedLang] || sug.luckImpact.kn}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
'''

if "Numerological Name Correction for Luck" not in content:
    content = content.replace('          {/* AI Generative Chatbox Timeline', name_correction_ui + '\n          {/* AI Generative Chatbox Timeline')

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Integrated Numerological Name Correction into SankhyaShastraPage.tsx.")
