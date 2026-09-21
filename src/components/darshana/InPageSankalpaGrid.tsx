import React, { useState, useEffect, useRef } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import {
  useSankalpaStore,
  SANKALPA_PRESETS,
  getPresetTitle,
  getPresetDescription,
  getPresetSanskritPhrasing,
  type SankalpaPreset
} from "../../features/sankalpa/sankalpaStore";
import type { UserSankalpaRecord } from "../../db/indexedDb";

export interface InPageSankalpaGridProps {
  userId?: string;
  devoteeName?: string;
  lang?: SevaLang;
  onStartPooja?: () => void;
}

const GRID_STRINGS: Record<SevaLang, {
  headerTitle: string;
  headerSub: string;
  activeCount: (n: number) => string;
  presetsTitle: string;
  customTitle: string;
  inputPlaceholder: string;
  addBtn: string;
  startPoojaBtn: string;
  listening: string;
  micTip: string;
  includedInPooja: string;
  paused: string;
  deleteConfirm: string;
  speechNotSupported: string;
}> = {
  kn: {
    headerTitle: "ನಿಮ್ಮ ನಿತ್ಯ ಸಂಕಲ್ಪಗಳು (ದೈನಂದಿನ ಪೂಜಾ ಇಷ್ಟಾರ್ಥಗಳು)",
    headerSub: "ಇಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾದ ಎಲ್ಲಾ ಸಕ್ರಿಯ ಸಂಕಲ್ಪಗಳನ್ನು ನಿಮ್ಮ ಮುಂಜಾನೆಯ ದೇವರ ಪೂಜೆಯಲ್ಲಿ ಪಂಡಿತರು ಪಠಿಸುತ್ತಾರೆ.",
    activeCount: (n) => `${n} ಸಕ್ರಿಯ ಸಂಕಲ್ಪಗಳು ಪೂಜೆಗೆ ಸಿದ್ಧವಾಗಿವೆ`,
    presetsTitle: "ತ್ವರಿತ ವೈದಿಕ ಸಂಕಲ್ಪಗಳು (+ ಒಂದು ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಸೇರಿಸಿ):",
    customTitle: "ವಿಶೇಷ ವೈಯಕ್ತಿಕ ಪ್ರಾರ್ಥನೆ (ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ):",
    inputPlaceholder: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಇಷ್ಟಾರ್ಥ ಅಥವಾ ಪ್ರಾರ್ಥನೆಯನ್ನು ನಮೂದಿಸಿ...",
    addBtn: "+ ಸಂಕಲ್ಪ ಸೇರಿಸಿ",
    startPoojaBtn: "🪔 ಇಂದಿನ ಪೂಜೆ ಪ್ರಾರಂಭಿಸಿ (ಸಂಕಲ್ಪ ಸಹಿತ)",
    listening: "🎙️ ಆಲಿಸಲಾಗುತ್ತಿದೆ... ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಾರ್ಥನೆ ಹೇಳಿ...",
    micTip: "ಮೈಕ್ ಮೂಲಕ ಮಾತನಾಡಿ",
    includedInPooja: "✅ ಪೂಜೆಯಲ್ಲಿ ಪಠಿಸಲಾಗುವುದು",
    paused: "⏸️ ವಿರಾಮ",
    deleteConfirm: "ಈ ಸಂಕಲ್ಪವನ್ನು ತೆಗೆದುಹಾಕಬೇಕೆ?",
    speechNotSupported: "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ರೆಕಗ್ನಿಷನ್ ಲಭ್ಯವಿಲ್ಲ, ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ."
  },
  te: {
    headerTitle: "మీ నిత్య సంకల్పాలు (పూజలో పఠించబడే ప్రార్థనలు)",
    headerSub: "ఇక్కడ ఎంచుకున్న అన్ని క్రియాశీల సంకల్పాలు మీ ఉదయపు దైవ పూజలో పండితులచే పఠించబడతాయి.",
    activeCount: (n) => `${n} సంకల్పాలు పూజకు సిద్ధంగా ఉన్నాయి`,
    presetsTitle: "త్వరిత వైదిక సంకల్పాలు (+ ఒక క్లిక్‌తో చేర్చండి):",
    customTitle: "ప్రత్యేక వ్యక్తిగత ప్రార్థన (టైప్ చేయండి లేదా మైక్‌లో మాట్లాడండి):",
    inputPlaceholder: "మీ వ్యక్తిగత మనోభీష్టాన్ని లేదా ప్రార్థనను నమోదు చేయండి...",
    addBtn: "+ సంకల్పం చేర్చండి",
    startPoojaBtn: "🪔 నేటి పూజ ప్రారంభించండి (సంకల్పంతో సహా)",
    listening: "🎙️ వింటున్నాము... దయచేసి మీ ప్రార్థన చెప్పండి...",
    micTip: "మైక్ ద్వారా మాట్లాడండి",
    includedInPooja: "✅ పూజలో పఠించబడుతుంది",
    paused: "⏸️ తాత్కాలిక విరామం",
    deleteConfirm: "ఈ సంకల్పాన్ని తొలగించాలా?",
    speechNotSupported: "మీ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ అందుబాటులో లేదు, దయచేసి టైప్ చేయండి."
  },
  ta: {
    headerTitle: "உங்கள் நித்ய சங்கல்பங்கள் (பூஜையில் சொல்லப்படும் பிரார்த்தனைகள்)",
    headerSub: "இங்கு தேர்வு செய்யப்படும் அனைத்து சங்கல்பங்களும் உங்கள் காலை வழிபாட்டில் அர்ச்சகரால் உச்சரிக்கப்படும்.",
    activeCount: (n) => `${n} சங்கல்பங்கள் பூஜைக்கு தயாராக உள்ளன`,
    presetsTitle: "விரைவு வைதீக சங்கல்பங்கள் (+ ஒரே கிளிக்கில் சேர்க்க):",
    customTitle: "தனிப்பட்ட பிரத்தியேக பிரார்த்தனை (தட்டச்சு செய்க அல்லது மைக் மூலம் பேசுக):",
    inputPlaceholder: "உங்கள் தனிப்பட்ட மன விருப்பத்தை உள்ளிடுக...",
    addBtn: "+ சங்கல்பம் சேர்க்க",
    startPoojaBtn: "🪔 இன்றைய பூஜையைத் தொடங்குங்கள் (சங்கல்பத்துடன்)",
    listening: "🎙️ கேட்கிறது... தயவுசெய்து உங்கள் பிரார்த்தனையை கூறுங்கள்...",
    micTip: "மைக் மூலம் பேசுங்கள்",
    includedInPooja: "✅ பூஜையில் சேர்க்கப்பட்டுள்ளது",
    paused: "⏸️ நிறுத்தி வைக்கப்பட்டுள்ளது",
    deleteConfirm: "இந்த சங்கல்பத்தை நீக்க வேண்டுமா?",
    speechNotSupported: "உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை, தயவுசெய்து தட்டச்சு செய்யவும்."
  },
  hi: {
    headerTitle: "आपके नित्य संकल्प (दैनिक पूजा में उच्चारित मनोकामनाएं)",
    headerSub: "यहाँ चयनित सभी सक्रिय संकल्प आपकी प्रातःकालीन देव पूजा में पंडित जी द्वारा उच्चारित किए जाएंगे।",
    activeCount: (n) => `${n} संकल्प पूजा के लिए सक्रिय हैं`,
    presetsTitle: "त्वरित वैदिक संकल्प (+ एक क्लिक में जोड़ें):",
    customTitle: "विशेष व्यक्तिगत प्रार्थना (लिखें या माइक से बोलें):",
    inputPlaceholder: "अपनी व्यक्तिगत मनोकामना या प्रार्थना लिखें...",
    addBtn: "+ संकल्प जोड़ें",
    startPoojaBtn: "🪔 आज की पूजा प्रारंभ करें (संकल्प सहित)",
    listening: "🎙️ सुन रहे हैं... कृपया अपनी प्रार्थना बोलें...",
    micTip: "माइक से बोलें",
    includedInPooja: "✅ पूजा में उच्चारित होगा",
    paused: "⏸️ स्थगित",
    deleteConfirm: "क्या आप इस संकल्प को हटाना चाहते हैं?",
    speechNotSupported: "आपके ब्राउज़र में वॉइस टाइपिंग उपलब्ध नहीं है, कृपया टाइप करें।"
  },
  en: {
    headerTitle: "Your Sacred Sankalpas (Chanted in Daily Morning Pooja)",
    headerSub: "All active intentions selected here will be dynamically chanted by the priest during your live Morning Deva Pooja.",
    activeCount: (n) => `${n} active intentions included in pooja`,
    presetsTitle: "Quick Vedic Intentions (+ 1-Tap Add):",
    customTitle: "Custom Personal Prayer (Type or use 🎤 Mic to Speak):",
    inputPlaceholder: "Enter your heartfelt devotional prayer or intention...",
    addBtn: "+ Add Sankalpa",
    startPoojaBtn: "🪔 Start Daily Deva Pooja (With Sankalpa)",
    listening: "🎙️ Listening... Please speak your prayer...",
    micTip: "Speak via Microphone",
    includedInPooja: "✅ Included in Pooja Chanting",
    paused: "⏸️ Paused",
    deleteConfirm: "Remove this sankalpa?",
    speechNotSupported: "Speech recognition not supported in this browser, please type."
  }
};

export const InPageSankalpaGrid: React.FC<InPageSankalpaGridProps> = ({
  userId = "devotee_default",
  devoteeName = "ಭಕ್ತ",
  lang = "kn",
  onStartPooja
}) => {
  const {
    sankalpas,
    loadSankalpas,
    createSankalpa,
    toggleSankalpaActive,
    deleteSankalpa
  } = useSankalpaStore();

  const [customText, setCustomText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const t = GRID_STRINGS[lang] || GRID_STRINGS.kn;

  useEffect(() => {
    void loadSankalpas(userId, devoteeName, lang);
  }, [userId, devoteeName, lang, loadSankalpas]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleToggle = async (id: string) => {
    await toggleSankalpaActive(id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      await deleteSankalpa(id);
      showToast(lang === "kn" ? "ಸಂಕಲ್ಪ ತೆಗೆದುಹಾಕಲಾಗಿದೆ" : "Sankalpa removed");
    }
  };

  const handleAddPreset = async (preset: SankalpaPreset) => {
    // Check if preset already added
    const existing = sankalpas.find((s) => s.category === preset.category);
    if (existing) {
      if (!existing.isActive) {
        await toggleSankalpaActive(existing.id);
        showToast(`✅ ${getPresetTitle(preset, lang)} ${lang === "kn" ? "ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ" : "activated"}!`);
      } else {
        showToast(`✨ ${getPresetTitle(preset, lang)} ${lang === "kn" ? "ಈಗಾಗಲೇ ಪೂಜೆಯಲ್ಲಿದೆ" : "already active"}!`);
      }
      return;
    }

    await createSankalpa(userId, {
      category: preset.category,
      title: getPresetTitle(preset, lang),
      description: getPresetDescription(preset, lang),
      sanskritPhrasing: getPresetSanskritPhrasing(preset, lang),
      isActive: true,
      devoteeName
    });

    showToast(`✨ ${getPresetTitle(preset, lang)} ${lang === "kn" ? "ಪೂಜೆಗೆ ಸೇರಿಸಲಾಗಿದೆ" : "added to pooja"}!`);
  };

  const handleAddCustom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customText.trim();
    if (!clean) return;

    await createSankalpa(userId, {
      category: "custom",
      title: clean,
      description: clean,
      sanskritPhrasing: "ಸಮಸ್ತ ಮನೋರಥ ಸಿದ್ಧ್ಯರ್ಥಂ, ಸಕಲ ಸತ್ಕಾರ್ಯ ಜಯಸಿದ್ಧ್ಯರ್ಥಂ",
      isActive: true,
      devoteeName
    });

    setCustomText("");
    showToast(lang === "kn" ? "ವೈಯಕ್ತಿಕ ಸಂಕಲ್ಪ ಸೇರಿಸಲಾಗಿದೆ!" : "Custom prayer added!");
  };

  // Speech-to-Text handler with multi-language recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setSpeechError(t.speechNotSupported);
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Match recognition language to user locale
      const localeMap: Record<SevaLang, string> = {
        kn: "kn-IN",
        te: "te-IN",
        ta: "ta-IN",
        hi: "hi-IN",
        en: "en-IN"
      };
      recognition.lang = localeMap[lang] || "kn-IN";

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setCustomText((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("[InPageSankalpaGrid] SpeechRecognition error:", event.error);
        setIsListening(false);
        if (event.error !== "no-speech") {
          setSpeechError(event.error === "not-allowed"
            ? (lang === "kn" ? "ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ" : "Microphone permission denied")
            : (lang === "kn" ? "ಧ್ವನಿ ಗ್ರಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ, ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" : "Could not hear clearly, please retry"));
          setTimeout(() => setSpeechError(null), 4000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("[InPageSankalpaGrid] Speech recognition start error:", err);
      setIsListening(false);
      setSpeechError(t.speechNotSupported);
      setTimeout(() => setSpeechError(null), 4000);
    }
  };

  const activeSankalpas = sankalpas.filter((s) => s.isActive);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(67, 26, 7, 0.95) 0%, rgba(28, 10, 0, 0.98) 100%)",
      border: "2px solid #D4AF37",
      borderRadius: 18,
      padding: "16px 18px",
      marginBottom: 16,
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      position: "relative"
    }}>
      {/* Header with Title & Active Count Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>📜</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#FDE68A", letterSpacing: "0.3px" }}>
              {t.headerTitle}
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "#FEF3C7", lineHeight: 1.4, opacity: 0.9 }}>
              {t.headerSub}
            </p>
          </div>
        </div>

        <div style={{
          background: "rgba(245, 158, 11, 0.2)",
          border: "1.5px solid #FCD34D",
          borderRadius: 12,
          padding: "4px 12px",
          fontSize: 11.5,
          fontWeight: 800,
          color: "#FEF3C7",
          display: "flex",
          alignItems: "center",
          gap: 6
        }}>
          <span>✨</span>
          <span>{t.activeCount(activeSankalpas.length)}</span>
        </div>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div style={{
          background: "rgba(16, 185, 129, 0.9)",
          color: "#FFFFFF",
          padding: "6px 12px",
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 800,
          marginBottom: 10,
          textAlign: "center",
          animation: "fadeIn 0.2s ease-in"
        }}>
          {successToast}
        </div>
      )}

      {/* Active Sankalpas Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 10,
        marginBottom: 14
      }}>
        {sankalpas.map((s) => {
          const matchedPreset = SANKALPA_PRESETS.find((p) => p.category === s.category);
          const icon = matchedPreset?.icon || (s.category === "custom" ? "✨" : "🌿");

          return (
            <div
              key={s.id}
              style={{
                background: s.isActive
                  ? "linear-gradient(135deg, rgba(120, 53, 15, 0.45), rgba(45, 14, 0, 0.7))"
                  : "rgba(0, 0, 0, 0.3)",
                border: s.isActive ? "1.5px solid #F59E0B" : "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 12,
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <strong style={{ fontSize: 13, color: s.isActive ? "#FFFFFF" : "#9CA3AF" }}>
                    {s.title}
                  </strong>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {/* Toggle Active Button */}
                  <button
                    type="button"
                    onClick={() => handleToggle(s.id)}
                    style={{
                      background: s.isActive ? "rgba(16, 185, 129, 0.25)" : "rgba(156, 163, 175, 0.2)",
                      border: s.isActive ? "1px solid #10B981" : "1px solid #6B7280",
                      color: s.isActive ? "#6EE7B7" : "#D1D5DB",
                      borderRadius: 14,
                      padding: "2px 8px",
                      fontSize: 10.5,
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    {s.isActive ? t.includedInPooja : t.paused}
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id)}
                    title={t.deleteConfirm}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#EF4444",
                      fontSize: 13,
                      cursor: "pointer",
                      padding: "2px 4px",
                      opacity: 0.8
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {s.description && (
                <p style={{ margin: 0, fontSize: 11, color: "#E5E7EB", lineHeight: 1.4, opacity: 0.85 }}>
                  {s.description}
                </p>
              )}

              {s.sanskritPhrasing && (
                <div style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px dashed rgba(245, 158, 11, 0.4)",
                  borderRadius: 8,
                  padding: "4px 8px",
                  fontSize: 11,
                  fontFamily: "serif",
                  fontWeight: 700,
                  color: "#FDE68A"
                }}>
                  "{s.sanskritPhrasing}"
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick-Add Vedic Suggestion Chips */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: "#FCD34D", marginBottom: 6 }}>
          {t.presetsTitle}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SANKALPA_PRESETS.filter((p) => p.category !== "custom").map((preset) => {
            const isAlreadyAdded = sankalpas.some((s) => s.category === preset.category && s.isActive);
            return (
              <button
                key={preset.category}
                type="button"
                onClick={() => handleAddPreset(preset)}
                style={{
                  background: isAlreadyAdded ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.15)",
                  border: isAlreadyAdded ? "1px solid #10B981" : "1px solid rgba(245, 158, 11, 0.4)",
                  color: isAlreadyAdded ? "#6EE7B7" : "#FEF3C7",
                  padding: "5px 10px",
                  borderRadius: 14,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  transition: "all 0.15s ease"
                }}
              >
                <span>{preset.icon}</span>
                <span>{getPresetTitle(preset, lang)}</span>
                {isAlreadyAdded ? <span>✓</span> : <span>+</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Prayer Input with Speech-to-Text (🎤 Mic) */}
      <div style={{
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        borderRadius: 14,
        padding: "10px 12px",
        marginBottom: 12
      }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: "#FDE68A", marginBottom: 6 }}>
          {t.customTitle}
        </div>

        <form onSubmit={handleAddCustom} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(245, 158, 11, 0.5)", borderRadius: 10, padding: "0 8px" }}>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={t.inputPlaceholder}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#FFFFFF",
                fontSize: 12.5,
                padding: "8px 0"
              }}
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title={t.micTip}
              style={{
                background: isListening ? "#DC2626" : "rgba(245, 158, 11, 0.2)",
                border: isListening ? "1px solid #EF4444" : "1px solid #F59E0B",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: isListening ? "0 0 10px #EF4444" : "none"
              }}
            >
              <span style={{ fontSize: 16 }}>{isListening ? "🔴" : "🎤"}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!customText.trim()}
            style={{
              background: customText.trim()
                ? "linear-gradient(135deg, #F59E0B, #D97706)"
                : "rgba(255, 255, 255, 0.1)",
              color: customText.trim() ? "#1C0A00" : "#9CA3AF",
              border: "1px solid rgba(245, 158, 11, 0.5)",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 800,
              cursor: customText.trim() ? "pointer" : "not-allowed",
              transition: "all 0.15s"
            }}
          >
            {t.addBtn}
          </button>
        </form>

        {isListening && (
          <div style={{ marginTop: 6, fontSize: 11, color: "#FCA5A5", fontWeight: 700, animation: "pulse 1.5s infinite" }}>
            {t.listening}
          </div>
        )}

        {speechError && (
          <div style={{ marginTop: 6, fontSize: 11, color: "#F87171" }}>
            ⚠️ {speechError}
          </div>
        )}
      </div>

      {/* Start Daily Pooja Action Link */}
      {onStartPooja && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onStartPooja}
            style={{
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              color: "#1C0A00",
              border: "1.5px solid #FDE68A",
              borderRadius: 12,
              padding: "9px 16px",
              fontSize: 12.5,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <span>{t.startPoojaBtn}</span>
          </button>
        </div>
      )}
    </div>
  );
};
