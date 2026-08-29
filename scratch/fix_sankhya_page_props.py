with open('src/pages/SankhyaShastraPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_badge = '''                {activeResult && (
                  <div className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                    ಸಂಖ್ಯಾ ಫಲ: {activeResult.compoundNumber} ({activeResult.singleDigitNumber}) · {activeResult.grahaRuling[selectedLang] || activeResult.grahaRuling.kn}
                  </div>
                )}'''

new_badge = '''                {activeResult && (
                  <div className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                    ಸಂಖ್ಯಾ ಫಲ: {activeResult.userNumber} ({activeResult.rootNumber}) · {activeResult.rootRulerName[selectedLang] || activeResult.rootRulerName.kn}
                  </div>
                )}'''

old_result_block = '''                          {/* Prashna Verdict Header */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-amber-900">
                                {isKn ? "ಪ್ರಶ್ನಾ ಸಂಖ್ಯೆ:" : "Prashna Number:"}{" "}
                                <span className="text-base text-amber-950 font-black">{msg.result.compoundNumber}</span>{" "}
                                (ಏಕಾಂಕ: <span className="font-bold text-emerald-800">{msg.result.singleDigitNumber}</span>)
                              </div>
                              <div className="text-xs text-amber-800 font-semibold mt-0.5">
                                {isKn ? "ಅಧಿಪತಿ ಗ್ರಹ:" : "Ruling Planet:"}{" "}
                                <span className="font-bold text-amber-950">
                                  {msg.result.grahaRuling[selectedLang] || msg.result.grahaRuling.kn}
                                </span>{" "}
                                · {isKn ? "ದೇವತೆ:" : "Deity:"}{" "}
                                <span className="font-bold text-amber-950">
                                  {msg.result.deity[selectedLang] || msg.result.deity.kn}
                                </span>
                              </div>
                            </div>

                            <div className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
                              {msg.result.verdict[selectedLang] || msg.result.verdict.kn}
                            </div>
                          </div>

                          {/* Auspicious Alignment Matrix */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="rounded-lg bg-amber-50/80 p-2 border border-amber-200">
                              <span className="font-bold text-amber-900 block">{isKn ? "ಶುಭ ವಾರ:" : "Lucky Day:"}</span>
                              <span className="text-amber-950 font-semibold">{msg.result.favorableDay[selectedLang] || msg.result.favorableDay.kn}</span>
                            </div>
                            <div className="rounded-lg bg-amber-50/80 p-2 border border-amber-200">
                              <span className="font-bold text-amber-900 block">{isKn ? "ಶುಭ ದಿನಾಂಕಗಳು:" : "Lucky Dates:"}</span>
                              <span className="text-amber-950 font-semibold">{msg.result.favorableDates.join(", ")}</span>
                            </div>
                            <div className="rounded-lg bg-amber-50/80 p-2 border border-amber-200">
                              <span className="font-bold text-amber-900 block">{isKn ? "ಶುಭ ಬಣ್ಣ:" : "Lucky Color:"}</span>
                              <span className="text-amber-950 font-semibold">{msg.result.favorableColor[selectedLang] || msg.result.favorableColor.kn}</span>
                            </div>
                            <div className="rounded-lg bg-amber-50/80 p-2 border border-amber-200">
                              <span className="font-bold text-amber-900 block">{isKn ? "ಶುಭ ರತ್ನ:" : "Gemstone:"}</span>
                              <span className="text-amber-950 font-semibold">{msg.result.favorableGemstone[selectedLang] || msg.result.favorableGemstone.kn}</span>
                            </div>
                          </div>

                          {/* Detailed AI Prediction */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">
                            <div className="text-xs font-bold text-amber-950 border-b border-amber-200 pb-1">
                              📜 {isKn ? "ದೈವಿಕ ಪ್ರಶ್ನಾ ಫಲ (Detailed Vedic Numerology Guidance):" : "Detailed Vedic Numerology Guidance:"}
                            </div>
                            <div className="text-xs text-amber-950 leading-relaxed font-medium">
                              {sanitizeAIText(msg.text)}
                            </div>
                          </div>

                          {/* Sacred Remedy */}
                          <div className="rounded-xl border border-amber-300 bg-amber-100/60 p-3.5 shadow-sm space-y-1">
                            <div className="text-xs font-bold text-amber-950">
                              🪔 {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಪರಿಹಾರ (Sacred Remedy):" : "Sacred Gokarna Mahabaleshwara Remedy:"}
                            </div>
                            <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                              {msg.result.remedy[selectedLang] || msg.result.remedy.kn}
                            </p>
                          </div>'''

new_result_block = '''                          {/* Prashna Verdict Header */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-amber-900">
                                {isKn ? "ಪ್ರಶ್ನಾ ಸಂಖ್ಯೆ:" : "Prashna Number:"}{" "}
                                <span className="text-base text-amber-950 font-black">{msg.result.userNumber}</span>{" "}
                                (ಮೂಲಾಂಕ: <span className="font-bold text-emerald-800">{msg.result.rootNumber}</span>)
                              </div>
                              <div className="text-xs text-amber-800 font-semibold mt-0.5">
                                {isKn ? "ಅಧಿಪತಿ ಗ್ರಹ:" : "Ruling Planet:"}{" "}
                                <span className="font-bold text-amber-950">
                                  {msg.result.rootRulerName[selectedLang] || msg.result.rootRulerName.kn}
                                </span>{" "}
                                · {isKn ? "ದೇವತೆ:" : "Deity:"}{" "}
                                <span className="font-bold text-amber-950">
                                  {msg.result.rootDeity[selectedLang] || msg.result.rootDeity.kn}
                                </span>
                              </div>
                            </div>

                            <div className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
                              {msg.result.verdictLabel[selectedLang] || msg.result.verdictLabel.kn} (ಬಲ: {msg.result.prashnaBalaScore}%)
                            </div>
                          </div>

                          {/* Auspicious Alignment Matrix */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="rounded-lg bg-amber-50/80 p-2 border border-amber-200">
                              <span className="font-bold text-amber-900 block">{isKn ? "ಪ್ರಶ್ನಾ ಲಗ್ನ:" : "Prashna Lagna:"}</span>
                              <span className="text-amber-950 font-semibold">{msg.result.prashnaLagnaName[selectedLang] || msg.result.prashnaLagnaName.kn}</span>
                            </div>
                            <div className="rounded-lg bg-amber-50/80 p-2 border border-amber-200">
                              <span className="font-bold text-amber-900 block">{isKn ? "ಕಾರ್ಯ ಸ್ಥಾನ:" : "Karya House:"}</span>
                              <span className="text-amber-950 font-semibold">{msg.result.primaryKaryaLabel[selectedLang] || msg.result.primaryKaryaLabel.kn}</span>
                            </div>
                            <div className="rounded-lg bg-amber-50/80 p-2 border border-amber-200">
                              <span className="font-bold text-amber-900 block">{isKn ? "ಲಗ್ನ ಗತಿ:" : "Sign Mobility:"}</span>
                              <span className="text-amber-950 font-semibold">{msg.result.signMobilityLabel[selectedLang] || msg.result.signMobilityLabel.kn}</span>
                            </div>
                            <div className="rounded-lg bg-amber-50/80 p-2 border border-amber-200">
                              <span className="font-bold text-amber-900 block">{isKn ? "ಫಲ ಕಾಲಾವಧಿ:" : "Time Horizon:"}</span>
                              <span className="text-amber-950 font-semibold">{msg.result.timeHorizonLabel[selectedLang] || msg.result.timeHorizonLabel.kn}</span>
                            </div>
                          </div>

                          {/* Detailed AI Prediction */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">
                            <div className="text-xs font-bold text-amber-950 border-b border-amber-200 pb-1">
                              📜 {isKn ? "ದೈವಿಕ ಪ್ರಶ್ನಾ ಫಲ (Detailed Vedic Numerology Guidance):" : "Detailed Vedic Numerology Guidance:"}
                            </div>
                            <div className="text-xs text-amber-950 leading-relaxed font-medium">
                              {sanitizeAIText(msg.text)}
                            </div>
                          </div>

                          {/* Sacred Remedy */}
                          <div className="rounded-xl border border-amber-300 bg-amber-100/60 p-3.5 shadow-sm space-y-1">
                            <div className="text-xs font-bold text-amber-950">
                              🪔 {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಪರಿಹಾರ (Sacred Remedy):" : "Sacred Gokarna Mahabaleshwara Remedy:"}
                            </div>
                            <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                              {msg.result.remedyRecommendation[selectedLang] || msg.result.remedyRecommendation.kn}
                            </p>
                          </div>'''

old_pdf = '''<SankhyaShastraPdfTemplate result={activeResult} devoteeName={devoteeName} lang={selectedLang} messages={messages} />'''
new_pdf = '''<SankhyaShastraPdfTemplate result={activeResult} personName={devoteeName} lang={selectedLang} messages={messages} />'''

if old_badge in content and old_result_block in content and old_pdf in content:
    content = content.replace(old_badge, new_badge, 1)
    content = content.replace(old_result_block, new_result_block, 1)
    content = content.replace(old_pdf, new_pdf, 1)
    with open('src/pages/SankhyaShastraPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS_FIXED_PROPS")
else:
    print("MATCH FAILED")
