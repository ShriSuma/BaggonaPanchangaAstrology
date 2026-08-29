filepath = "src/pages/PalmReadingPage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Enhance priest message card formatting inside chat timeline
old_priest_render = '''                  {msg.result?.kundliData && (
                    <div className="mb-3 rounded-xl border border-amber-300 bg-amber-100/80 p-2.5 text-xs text-amber-950 font-bold flex flex-wrap gap-3">
                      <div>🏛️ {isKn ? "ಲಗ್ನ (ಅಂಶ):" : "Lagna:"} {msg.result.kundliData.lagna}</div>
                      <div>🌙 {isKn ? "ರಾಶಿ:" : "Rashi:"} {msg.result.kundliData.rashi}</div>
                      <div>⭐ {isKn ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"} {msg.result.kundliData.nakshatra}</div>
                      <div>🔥 {isKn ? "ಮಾಂದಿ:" : "Maandi:"} {msg.result.kundliData.maandi}</div>
                    </div>
                  )}

                  {sanitizeAIText(msg.text)}'''

new_priest_render = '''                  {msg.result ? (
                    <div className="space-y-4">
                      {/* Kundli Badge if generated */}
                      {msg.result.kundliData && (
                        <div className="rounded-xl border border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-3 text-xs text-amber-950 font-bold flex flex-wrap gap-3 shadow-inner">
                          <div>🏛️ {isKn ? "ಲಗ್ನ (ಅಂಶ):" : "Lagna:"} <span className="text-emerald-800 font-extrabold">{msg.result.kundliData.lagna}</span></div>
                          <div>🌙 {isKn ? "ರಾಶಿ:" : "Rashi:"} <span className="text-amber-900 font-extrabold">{msg.result.kundliData.rashi}</span></div>
                          <div>⭐ {isKn ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"} <span className="text-amber-900 font-extrabold">{msg.result.kundliData.nakshatra}</span></div>
                          <div>🔥 {isKn ? "ಮಾಂದಿ:" : "Maandi:"} <span className="text-rose-900 font-extrabold">{msg.result.kundliData.maandi}</span></div>
                        </div>
                      )}

                      {/* Section 1: 5 Major Palm Lines Card */}
                      <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">
                        <div className="text-xs font-bold text-amber-950 border-b border-amber-200 pb-1 flex items-center justify-between">
                          <span>🖐️ {isKn ? "೧. ಪಂಚ ರೇಖಾ ವಿಶ್ಲೇಷಣೆ (Major Lines Inspection)" : "1. Major Palm Lines Inspection"}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                            <span className="font-bold text-amber-900">{msg.result.lifeLine.lineName[selectedLang] || msg.result.lifeLine.lineName.kn}:</span>{" "}
                            <span className="font-semibold text-emerald-800">[{msg.result.lifeLine.status[selectedLang] || msg.result.lifeLine.status.kn}]</span>{" "}
                            <span className="text-amber-950">{msg.result.lifeLine.indication[selectedLang] || msg.result.lifeLine.indication.kn}</span>
                          </div>
                          <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                            <span className="font-bold text-amber-900">{msg.result.headLine.lineName[selectedLang] || msg.result.headLine.lineName.kn}:</span>{" "}
                            <span className="font-semibold text-emerald-800">[{msg.result.headLine.status[selectedLang] || msg.result.headLine.status.kn}]</span>{" "}
                            <span className="text-amber-950">{msg.result.headLine.indication[selectedLang] || msg.result.headLine.indication.kn}</span>
                          </div>
                          <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                            <span className="font-bold text-amber-900">{msg.result.heartLine.lineName[selectedLang] || msg.result.heartLine.lineName.kn}:</span>{" "}
                            <span className="font-semibold text-emerald-800">[{msg.result.heartLine.status[selectedLang] || msg.result.heartLine.status.kn}]</span>{" "}
                            <span className="text-amber-950">{msg.result.heartLine.indication[selectedLang] || msg.result.heartLine.indication.kn}</span>
                          </div>
                          <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                            <span className="font-bold text-amber-900">{msg.result.fateLine.lineName[selectedLang] || msg.result.fateLine.lineName.kn}:</span>{" "}
                            <span className="font-semibold text-emerald-800">[{msg.result.fateLine.status[selectedLang] || msg.result.fateLine.status.kn}]</span>{" "}
                            <span className="text-amber-950">{msg.result.fateLine.indication[selectedLang] || msg.result.fateLine.indication.kn}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Narrative Predictions */}
                      <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">
                        <div className="text-xs font-bold text-amber-950 border-b border-amber-200 pb-1">
                          📜 {isKn ? "೨. ಹಸ್ತ ರೇಖಾ ದೈವಿಕ ಭವಿಷ್ಯವಾಣಿ (Hastarekha Guidance)" : "2. Hastarekha Guidance & Predictions"}
                        </div>
                        <div className="text-xs text-amber-950 leading-relaxed whitespace-pre-wrap font-medium">
                          {sanitizeAIText(msg.text)}
                        </div>
                      </div>

                      {/* Section 3: Sacred Gokarna Remedy */}
                      <div className="rounded-xl border border-orange-300 bg-gradient-to-r from-amber-100 to-orange-100 p-3.5 shadow-sm text-xs space-y-1">
                        <div className="font-bold text-amber-950 flex items-center gap-1.5">
                          <span>🪔</span>
                          <span>{isKn ? "೩. ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸಿದ್ಧ ಪರಿಹಾರ & ಮಂತ್ರ (Sacred Remedy)" : "3. Sacred Gokarna Remedy & Mantra"}</span>
                        </div>
                        <div className="text-amber-900 font-semibold leading-normal">
                          {msg.result.remedyRecommendation[selectedLang] || msg.result.remedyRecommendation.kn}
                        </div>
                      </div>
                    </div>
                  ) : (
                    sanitizeAIText(msg.text)
                  )}'''

if old_priest_render in content:
    content = content.replace(old_priest_render, new_priest_render)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Enriched PalmReadingPage.tsx with 5 structured section cards.")
