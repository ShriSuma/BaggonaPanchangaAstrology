filepath = "src/pages/LifeGuidancePage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add askCustomLifeQuestion import
if "askCustomLifeQuestion" not in content:
    content = content.replace(
        'import { executeLifeGuidanceCalculation, LifeGuidanceResult, LifeGuidanceTabKey } from "../features/lifeguidance/lifeGuidanceEngine";',
        'import { executeLifeGuidanceCalculation, askCustomLifeQuestion, LifeGuidanceResult, LifeGuidanceTabKey } from "../features/lifeguidance/lifeGuidanceEngine";'
    )

# Add custom Q&A state variables inside component
old_state = '  const [activeTab, setActiveTab] = useState<LifeGuidanceTabKey>("career");'
new_state = '''  const [activeTab, setActiveTab] = useState<LifeGuidanceTabKey | "custom">("career");
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAskingCustom, setIsAskingCustom] = useState<boolean>(false);'''

content = content.replace(old_state, new_state)

# Add SpeechRecognition mic handler with auto-clear logic
mic_handler_code = '''
  // Web Speech API Microphone Toggle with Auto-Clear Logic
  const handleMicToggle = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isKn ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ." : "Speech recognition is not supported in your browser. Please type your question.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    // Auto-clear existing question input before recording fresh speech
    setCustomQuestion("");
    setIsListening(true);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang === "kn" ? "kn-IN" : selectedLang === "hi" ? "hi-IN" : selectedLang === "te" ? "te-IN" : selectedLang === "ta" ? "ta-IN" : "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCustomQuestion(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Mic start error:", err);
      setIsListening(false);
    }
  };

  // Submit custom question for 4-5 paragraph AI answer
  const handleAskCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !customQuestion.trim()) return;

    setIsAskingCustom(true);
    try {
      const ans = await askCustomLifeQuestion(result, customQuestion.trim(), selectedLang, activeKey);
      const updatedResult = {
        ...result,
        customQnA: {
          question: customQuestion.trim(),
          answer: ans
        }
      };
      setResult(updatedResult);
    } catch (err) {
      console.error("Custom QnA error:", err);
    } finally {
      setIsAskingCustom(false);
    }
  };
'''

content = content.replace("  const handleDownloadPdf = async () => {", mic_handler_code + "\n  const handleDownloadPdf = async () => {")

# Add 5th Tab button option to UI
old_tabs_render = '''              {[
                { key: "career", icon: "💼", label: isKn ? "ವೃತ್ತಿ & ಧನ" : "Career" },
                { key: "relationship", icon: "💞", label: isKn ? "ದಾಂಪತ್ಯ & ಕುಟುಂಬ" : "Relationship" },
                { key: "health", icon: "🏥", label: isKn ? "ಆರೋಗ್ಯ & ಆಯುಷ್ಯ" : "Health" },
                { key: "children", icon: "👶", label: isKn ? "ಸಂತಾನ ಭಾಗ್ಯ" : "Children" }
              ].map((tab) => ('''

new_tabs_render = '''              {[
                { key: "career", icon: "💼", label: isKn ? "ವೃತ್ತಿ & ಧನ" : "Career" },
                { key: "relationship", icon: "💞", label: isKn ? "ದಾಂಪತ್ಯ & ಕುಟುಂಬ" : "Relationship" },
                { key: "health", icon: "🏥", label: isKn ? "ಆರೋಗ್ಯ & ಆಯುಷ್ಯ" : "Health" },
                { key: "children", icon: "👶", label: isKn ? "ಸಂತಾನ ಭಾಗ್ಯ" : "Children" },
                { key: "custom", icon: "🎙️", label: isKn ? "ಸ್ವಂತ ಪ್ರಶ್ನೆ (Q&A)" : "Custom Question" }
              ].map((tab) => ('''

content = content.replace(old_tabs_render, new_tabs_render)

# Render Custom Question Form & Answer UI inside activeTab === "custom"
custom_tab_ui = '''          {/* TAB 5: Custom Question & Voice Clarification UI */}
          {activeTab === "custom" && (
            <Card className="border border-amber-300 bg-gradient-to-b from-amber-50/30 to-white p-6 shadow-md space-y-4">
              <div className="border-b border-amber-200 pb-3">
                <h3 className="font-serif text-lg font-bold text-amber-950 flex items-center gap-2">
                  <span>🎙️</span>
                  <span>{isKn ? "ಸ್ವಂತ ಪ್ರಶ್ನೆ ಹಾಗೂ ಧ್ವನಿ ವಿವರಣೆ ಸೌಲಭ್ಯ" : "Ask Custom Astrological Question (Voice/Type)"}</span>
                </h3>
              </div>

              <form onSubmit={handleAskCustomQuestion} className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder={isKn ? "ನಿಮ್ಮ ಸ್ವಂತ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಧ್ವನಿ ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ಮಾತನಾಡಿ..." : "Type your custom question or click mic button to speak..."}
                    className="w-full rounded-2xl border-2 border-amber-300 bg-white p-4 pr-12 text-xs font-semibold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
                  />
                  {/* Microphone Toggle Button with Auto-Clear */}
                  <button
                    type="button"
                    onClick={handleMicToggle}
                    title={isKn ? "ಧ್ವನಿ ಮೈಕ್ ಬಟನ್ (ಹಳೆಯ ಇನ್‌ಪುಟ್ ತೆರವುಗೊಳಿಸಿ ಧ್ವನಿ ರೆಕಾರ್ಡ್)" : "Voice Mic (Auto-clears text & records speech)"}
                    className={`absolute right-3 top-3 p-2 rounded-xl text-lg transition ${
                      isListening ? "bg-rose-600 text-white animate-pulse shadow-lg" : "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                    }`}
                  >
                    🎙️
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isAskingCustom || !customQuestion.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-50 text-xs font-bold shadow-md hover:from-amber-800 hover:to-amber-950 disabled:opacity-50"
                >
                  {isAskingCustom ? (isKn ? "⌛ ೪-೫ ಪ್ಯಾರಾಗ್ರಾಫ್ ಜ್ಯೋತಿಷ್ಯ ಉತ್ತರ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Analyzing Question...") : (isKn ? "🔮 ಉತ್ತರ ಪಡೆಯಿರಿ (Get 4-5 Para Guidance)" : "Get Astrological Guidance")}
                </button>
              </form>

              {/* Custom Q&A Answer Card */}
              {result.customQnA && (
                <div className="rounded-2xl border-2 border-amber-400 bg-white p-5 space-y-3 shadow-md">
                  <div className="text-xs font-extrabold text-amber-950 border-b border-amber-200 pb-2">
                    ❓ {isKn ? "ಪ್ರಶ್ನೆ:" : "Question:"} {result.customQnA.question}
                  </div>
                  <div className="text-xs text-amber-950 leading-relaxed font-medium whitespace-pre-wrap">
                    {sanitizeAIText(result.customQnA.answer)}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Standard 4 Active Tabs Content Card */}
          {activeTab !== "custom" && (
            <Card className="border border-amber-300 bg-gradient-to-b from-amber-50/30 to-white p-6 shadow-md space-y-4">'''

content = content.replace('<Card className="border border-amber-300 bg-gradient-to-b from-amber-50/30 to-white p-6 shadow-md space-y-4">', custom_tab_ui)

# Close extra Card bracket if needed
content = content.replace("            </div>\n          </Card>", "            </div>\n          </Card>\n          )}")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Upgraded LifeGuidancePage.tsx with 5th Tab Custom Q&A + Speech Mic Auto-Clear.")
