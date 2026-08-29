filepath = "src/pages/MaranottaraPage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add Gemini AI import & store key
if "generateMaranottaraAIConsolation" not in content:
    content = content.replace(
        'import { executeMaranottaraCalculation, MaranottaraResult, MasikaDurationYears } from "../features/maranottara/maranottaraEngine";',
        'import { executeMaranottaraCalculation, generateMaranottaraAIConsolation, MaranottaraResult, MasikaDurationYears } from "../features/maranottara/maranottaraEngine";\nimport { useAppStore } from "../stores/appStore";'
    )

# Use activeKey from store
content = content.replace(
  'export const MaranottaraPage: React.FC = () => {',
  'export const MaranottaraPage: React.FC = () => {\n  const activeKey = useAppStore((state) => state.geminiApiKey);'
)

# Update full language picker buttons
old_lang_picker = '''        {/* Language Picker */}
        <div className="mt-4 flex justify-center gap-2">
          {["kn", "en", "hi", "te", "ta"].map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLang(l)}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                selectedLang === l ? "bg-amber-400 text-amber-950 border-amber-300 shadow" : "bg-amber-900/60 text-amber-200 border-amber-700 hover:bg-amber-800"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>'''

new_lang_picker = '''        {/* Full Language Picker */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[
            { code: "kn", label: "ಕನ್ನಡ" },
            { code: "en", label: "English" },
            { code: "hi", label: "हिन्दी" },
            { code: "te", label: "తెలుగు" },
            { code: "ta", label: "தமிழ்" }
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => setSelectedLang(item.code)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition ${
                selectedLang === item.code ? "bg-amber-400 text-amber-950 border-amber-300 shadow-md scale-105" : "bg-amber-900/70 text-amber-200 border-amber-700 hover:bg-amber-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>'''

content = content.replace(old_lang_picker, new_lang_picker)

# Async calculate handler with AI consolation
old_calc_handler = '''    setTimeout(() => {
      const calcResult = executeMaranottaraCalculation({
        personName: personName.trim() || (isKn ? "ಶ್ರೀಯುತ ಮೃತ ಆತ್ಮ" : "Deceased Soul"),
        demiseDate,
        demiseTime: demiseTime || undefined,
        location: location.trim() || "Gokarna, Karnataka",
        yearsCount,
        lang: selectedLang
      });

      setResult(calcResult);
      setIsProcessing(false);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, 1200);'''

new_calc_handler = '''    setTimeout(async () => {
      const calcResult = executeMaranottaraCalculation({
        personName: personName.trim() || (isKn ? "ಶ್ರೀಯುತ ಮೃತ ಆತ್ಮ" : "Deceased Soul"),
        demiseDate,
        demiseTime: demiseTime || undefined,
        location: location.trim() || "Gokarna, Karnataka",
        yearsCount,
        lang: selectedLang
      });

      // Generate AI Spiritual Consolation narrative via Gemini 3.5 Flash Lite
      const aiText = await generateMaranottaraAIConsolation(calcResult, selectedLang, activeKey);
      calcResult.aiConsolationText = aiText;

      setResult(calcResult);
      setIsProcessing(false);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, 1000);'''

content = content.replace(old_calc_handler, new_calc_handler)

# Render AI Spiritual Consolation card inside UI tab schedule
old_tab_schedule = '''          {/* TAB 1: Masika Schedule Grid */}
          {activeTab === "schedule" && (
            <Card className="border border-amber-300 bg-gradient-to-b from-amber-50/30 to-white p-5 shadow-md space-y-4">'''

new_tab_schedule = '''          {/* TAB 1: Masika Schedule Grid */}
          {activeTab === "schedule" && (
            <Card className="border border-amber-300 bg-gradient-to-b from-amber-50/30 to-white p-5 shadow-md space-y-4">
              {/* AI Spiritual Consolation Card */}
              {result.aiConsolationText && (
                <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-4 shadow-sm space-y-1.5">
                  <h4 className="font-bold text-xs text-amber-950 flex items-center gap-2">
                    <span>🕉️</span>
                    <span>{isKn ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಧರ್ಮಜ್ಞ ದೈವಿಕ ಸದ್ಗತಿ ಸಂದೇಶ & ಮಂತ್ರ" : "Gokarna Spiritual Consolation & Mantra"}</span>
                  </h4>
                  <p className="text-xs text-amber-900 font-medium leading-relaxed whitespace-pre-wrap">
                    {sanitizeAIText(result.aiConsolationText)}
                  </p>
                </div>
              )}'''

content = content.replace(old_tab_schedule, new_tab_schedule)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Upgraded MaranottaraPage.tsx with full language names & AI consolation card.")
