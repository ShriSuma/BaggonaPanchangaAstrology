file_path_kit = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/components/seva/PrasadaKit.tsx"

with open(file_path_kit, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add SHLOKA_SHANTI to imports from sevaLocale if not imported
if "SHLOKA_SHANTI" not in content:
    content = content.replace('type SevaPresentation } from "../../features/seva/sevaLocale";', 'type SevaPresentation,\n  SHLOKA_SHANTI\n} from "../../features/seva/sevaLocale";')

# 2. Add state for custom Pooja
old_state = """  const [sevaId, setSevaId] = useState<SevaId>(recommendations[0]?.seva.id ?? "rudrabhisheka");
  const [priestsList, setPriestsList] = useState<PriestProfile[]>(() => getAllPriests());"""

new_state = """  const [sevaId, setSevaId] = useState<SevaId>(recommendations[0]?.seva.id ?? "rudrabhisheka");
  const [customPoojaMode, setCustomPoojaMode] = useState<boolean>(false);
  const [customPoojaName, setCustomPoojaName] = useState<string>("");
  const [isPoojaListening, setIsPoojaListening] = useState<boolean>(false);
  const [priestsList, setPriestsList] = useState<PriestProfile[]>(() => getAllPriests());"""

content = content.replace(old_state, new_state)

# 3. Add handlePoojaMicClick
mic_code = """  // Speech Recognition for Custom Pooja Name Mic Button
  const handlePoojaMicClick = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert("Speech recognition is not supported in this browser. Please type the pooja name manually.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      const speechLangMap: Record<string, string> = {
        kn: "kn-IN",
        te: "te-IN",
        ta: "ta-IN",
        hi: "hi-IN",
        en: "en-IN"
      };
      recognition.lang = speechLangMap[pdfLang] || "kn-IN";
      recognition.interimResults = false;

      recognition.onstart = () => setIsPoojaListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setCustomPoojaName(transcript);
        }
      };
      recognition.onerror = () => setIsPoojaListening(false);
      recognition.onend = () => setIsPoojaListening(false);
      recognition.start();
    } catch {
      setIsPoojaListening(false);
    }
  };
"""

target_after_priest_mic = """      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };"""

content = content.replace(target_after_priest_mic, target_after_priest_mic + "\n\n" + mic_code)

# 4. Update chosenSeva and chosenPoojaName
old_chosen = """  const chosenSeva = useMemo(() => {
    // 1. Check if it's a recommendation
    const rec = recommendations?.find((r) => r?.seva?.id === sevaId);
    if (rec) return rec;
    
    // 2. Check if it's in the catalog (manually selected)
    if (sevaId && SEVA_CATALOG[sevaId as keyof typeof SEVA_CATALOG]) {
      return { 
        seva: SEVA_CATALOG[sevaId as keyof typeof SEVA_CATALOG],
        score: 0,
        reasons: []
      };
    }
    
    // 3. Fallback
    return recommendations?.[0];
  }, [recommendations, sevaId]);

  const chosenPoojaName = useMemo(() => {
    if (chosenSeva?.seva?.name) {
      if (typeof chosenSeva.seva.name === "object") {
        return (chosenSeva.seva.name as any)[pdfLang] || chosenSeva.seva.name.en || chosenSeva.seva.name.kn || "Seva";
      }
    }
    return (chosenSeva as any)?.label || chosenSeva?.seva?.id || "Seva";
  }, [chosenSeva, pdfLang]);"""

new_chosen = """  const chosenSeva = useMemo(() => {
    if (customPoojaMode && customPoojaName.trim()) {
      const cleanName = customPoojaName.trim();
      return {
        seva: {
          id: "custom_pooja" as SevaId,
          icon: "🪔",
          name: {
            kn: cleanName,
            en: cleanName,
            hi: cleanName,
            te: cleanName,
            ta: cleanName
          },
          purpose: {
            kn: "ಭಕ್ತರ ಸಂಕಲ್ಪಾನುಸಾರ ನೆರವೇರಿಸಲಾದ ದೈವಿಕ ಆರಾಧನೆ ಹಾಗೂ ಪರಿಹಾರ ಸೇವೆ.",
            en: "Sacred remedial pooja performed according to the devotee's sankalpa.",
            hi: "भक्त के संकल्प के अनुसार संपन्न पावन वैदिक पूजा सेवा।",
            te: "భక్తుల సంకల్పం ప్రకారం నిర్వహించిన దివ్య పరిహార సేవ.",
            ta: "பக்தரின் சங்கல்பத்தின்படி செய்யப்பட்ட புனித பரிகார பூஜை."
          },
          benefit: {
            kn: "ಸಕಲ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ, ದೈವಿಕ ರಕ್ಷಣೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸುಖ-ಶಾಂತಿ.",
            en: "Fulfillment of desires, divine protection, and family peace.",
            hi: "सर्व मनोकामना पूर्ति, दैवीय सुरक्षा एवं पारिवारिक शांति।",
            te: "సకల కోరికల ఈడేరిక, దివ్య రక్షణ మరియు కుటుంబ శాంతి.",
            ta: "சகல காரிய சித்தி, தெய்வீக பாதுகாப்பு மற்றும் குடும்ப அமைதி."
          },
          where: {
            kn: "ಪವಿತ್ರ ಸನ್ನಿಧಿ",
            en: "Sacred Altar / Sanctum",
            hi: "पवित्र सन्निधि",
            te: "పవిత్ర సన్నిధి",
            ta: "புனித சந்நிதி"
          },
          when: {
            kn: "ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ",
            en: "Auspicious Muhurtha",
            hi: "शुभ मुहूर्त में",
            te: "శుభ ముహూర్తంలో",
            ta: "சுப முகூர்த்தத்தில்"
          },
          duration: {
            kn: "ಸುಮಾರು 2 ರಿಂದ 3 ಗಂಟೆ",
            en: "About 2 to 3 hours",
            hi: "लगभग 2 से 3 घंटे",
            te: "సుమారు 2 నుండి 3 గంటలు",
            ta: "சுமார் 2 முதல் 3 மணி நேரம்"
          },
          shloka: SHLOKA_SHANTI
        },
        score: 0,
        reasons: []
      };
    }

    // 1. Check if it's a recommendation
    const rec = recommendations?.find((r) => r?.seva?.id === sevaId);
    if (rec) return rec;
    
    // 2. Check if it's in the catalog (manually selected)
    if (sevaId && SEVA_CATALOG[sevaId as keyof typeof SEVA_CATALOG]) {
      return { 
        seva: SEVA_CATALOG[sevaId as keyof typeof SEVA_CATALOG],
        score: 0,
        reasons: []
      };
    }
    
    // 3. Fallback
    return recommendations?.[0];
  }, [recommendations, sevaId, customPoojaMode, customPoojaName]);

  const chosenPoojaName = useMemo(() => {
    if (customPoojaMode && customPoojaName.trim()) {
      return customPoojaName.trim();
    }
    if (chosenSeva?.seva?.name) {
      if (typeof chosenSeva.seva.name === "object") {
        return (chosenSeva.seva.name as any)[pdfLang] || chosenSeva.seva.name.en || chosenSeva.seva.name.kn || "Seva";
      }
    }
    return (chosenSeva as any)?.label || chosenSeva?.seva?.id || "Seva";
  }, [chosenSeva, pdfLang, customPoojaMode, customPoojaName]);"""

content = content.replace(old_chosen, new_chosen)

# 5. Update the UI dropdown for Seva
old_seva_dropdown = """            <select
              value={sevaId}
              onChange={(e) => setSevaId(e.target.value as any)}
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-amber-950"
            >
              {Object.values(SEVA_CATALOG).map((s) => (
                <option key={s.id} value={s.id}>
                  {pick(s.name, lang)}
                </option>
              ))}
            </select>"""

new_seva_dropdown = """            <select
              value={customPoojaMode ? "ADD_CUSTOM" : sevaId}
              onChange={(e) => {
                if (e.target.value === "ADD_CUSTOM") {
                  setCustomPoojaMode(true);
                } else {
                  setCustomPoojaMode(false);
                  setSevaId(e.target.value as any);
                }
              }}
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
            >
              {Object.values(SEVA_CATALOG).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {pick(s.name, pdfLang)}
                </option>
              ))}
              <option value="ADD_CUSTOM">➕ {pdfLang.startsWith("kn") ? "ಇತರ ವಿಶೇಷ ಪೂಜೆ ಸೇರಿಸಿ (Custom Pooja)..." : "Add Custom Pooja..."}</option>
            </select>
            {customPoojaMode && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={customPoojaName}
                  onChange={(e) => setCustomPoojaName(e.target.value)}
                  placeholder={pdfLang.startsWith("kn") ? "ಪೂಜೆ / ಹೋಮದ ಹೆಸರು ಟೈಪ್ ಮಾಡಿ..." : "Enter Pooja / Homa Name..."}
                  className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handlePoojaMicClick}
                  title={isPoojaListening ? pick(T.micListening!, lang) : pick(T.micSpeak!, lang)}
                  className={`rounded-lg p-2 transition ${
                    isPoojaListening
                      ? "animate-pulse bg-red-500 text-white"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                  }`}
                >
                  🎙️
                </button>
                <button
                  type="button"
                  onClick={() => setCustomPoojaMode(false)}
                  className="rounded-lg border border-amber-300 bg-amber-100 px-2.5 py-2 text-xs font-bold text-amber-900"
                >
                  ✕
                </button>
              </div>
            )}"""

content = content.replace(old_seva_dropdown, new_seva_dropdown)

with open(file_path_kit, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated PrasadaKit.tsx successfully!")
