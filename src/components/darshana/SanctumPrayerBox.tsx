import React, { useState, useEffect } from "react";
import { firestore } from "../../services/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { SevaLang } from "../../features/seva/sevaLocale";

export interface SanctumPrayerBoxProps {
  devoteeName: string;
  gotra?: string;
  dateStr: string;
  lang?: SevaLang;
  priestName?: string;
}

export const SanctumPrayerBox: React.FC<SanctumPrayerBoxProps> = ({
  devoteeName,
  gotra = "ಕಾಶ್ಯಪ",
  dateStr,
  lang = "kn",
  priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
}) => {
  const [prayerText, setPrayerText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storageKey = `baggona_sanctum_prayer_${dateStr}_${devoteeName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setPrayerText(saved);
        setIsSubmitted(true);
      }
    }
  }, [storageKey]);

  const handleSubmitPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim() || isSubmitting) return;

    setIsSubmitting(true);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, prayerText.trim());
      } catch {}
    }

    try {
      const prayerId = `prayer_${Date.now()}_${devoteeName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const prayerRef = doc(firestore, "sanctumDevoteePrayers", prayerId);
      await setDoc(prayerRef, {
        devoteeName,
        gotra,
        dateStr,
        prayerText: prayerText.trim(),
        priestName,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("[SanctumPrayerBox] Firestore log notice:", err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const texts = SANCTUM_PRAYER_TEXTS[lang] || SANCTUM_PRAYER_TEXTS.en;

  return (
    <div className="bg-gradient-to-br from-[#FFFDF7] via-[#FFF9E6] to-[#FFF5D6] border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-md space-y-3.5">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-amber-300 pb-2.5">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-lg shadow-sm border border-amber-400">
          📿
        </span>
        <div>
          <h3 className="text-xs sm:text-sm font-black text-amber-950">
            {texts.title}
          </h3>
          <span className="text-[10px] text-amber-800 font-bold">
            {texts.subtitle}
          </span>
        </div>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmitPrayer} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1">
              {texts.inputLabel}
            </label>
            <input
              type="text"
              value={prayerText}
              onChange={(e) => setPrayerText(e.target.value)}
              placeholder={texts.placeholder}
              required
              className="w-full px-3.5 py-2.5 bg-white border-2 border-amber-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-500 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !prayerText.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 border border-amber-400 disabled:opacity-50"
          >
            <span>{isSubmitting ? texts.submitting : texts.submitBtn}</span>
          </button>
        </form>
      ) : (
        <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-amber-50 rounded-2xl border-2 border-emerald-400 space-y-2 text-center animate-in zoom-in-95">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-400 rounded-full text-[10px] font-black">
            <span>✓</span>
            <span>{texts.submittedBadge}</span>
          </div>

          <p className="text-xs font-serif font-black text-amber-950 italic">
            "{prayerText}"
          </p>

          <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
            {texts.priestNotice(priestName)}
          </p>

          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="text-[10px] font-black text-amber-800 hover:underline pt-1"
          >
            {texts.editBtn}
          </button>
        </div>
      )}
    </div>
  );
};

const SANCTUM_PRAYER_TEXTS: Record<SevaLang, {
  title: string;
  subtitle: string;
  inputLabel: string;
  placeholder: string;
  submitBtn: string;
  submitting: string;
  submittedBadge: string;
  priestNotice: (priest: string) => React.ReactNode;
  editBtn: string;
}> = {
  kn: {
    title: "ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ನಿತ್ಯ ಪ್ರಾರ್ಥನಾ ಪತ್ರ (Sanctum Prayer Box)",
    subtitle: "ನಿಮ್ಮ ಇಂದಿನ ಪ್ರಾರ್ಥನೆಯನ್ನು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಗೆ ಸಲ್ಲಿಸಿ",
    inputLabel: "ಇಂದಿನ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಪ್ರಾರ್ಥನೆ / ಸಂಕಲ್ಪ (೧ ಸಾಲಿನ ಪ್ರಾರ್ಥನೆ):",
    placeholder: "ಉದಾ: ಕುಟುಂಬದ ಆಯುರಾರೋಗ್ಯ ವೃದ್ಧಿಗೆ ಅಥವಾ ನೂತನ ಉದ್ಯೋಗ ಯಶಸ್ಸಿಗೆ...",
    submitBtn: "🙏 ಸನ್ನಿಧಿಗೆ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ (Submit Prayer)",
    submitting: "ಸಮರ್ಪಿಸಲಾಗುತ್ತಿದೆ...",
    submittedBadge: "ಪ್ರಾರ್ಥನೆ ಸನ್ನಿಧಿಗೆ ಸಮರ್ಪಿತವಾಗಿದೆ",
    priestNotice: (priest) => (
      <>ನಿಮ್ಮ ಪ್ರಾರ್ಥನೆಯು ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಮರ್ಪಿತವಾಗಿದ್ದು, ಮುಖ್ಯ ಅರ್ಚಕ <strong>{priest}</strong> ಅವರ ನಿತ್ಯ ಸಂಕಲ್ಪ ಪೂಜೆಯಲ್ಲಿ ಸೇರ್ಪಡೆಗೊಂಡಿದೆ.</>
    ),
    editBtn: "ಹೊಸ ಪ್ರಾರ್ಥನೆ ಬರೆಯಿರಿ (Edit Prayer)"
  },
  te: {
    title: "గోకర్ణ సన్నిధి నిత్య ప్రార్థనా పత్రం (Sanctum Prayer Box)",
    subtitle: "మీ నేటి ప్రార్థనను గోకర్ణ మహాబలేశ్వర సన్నిధికి సమర్పించండి",
    inputLabel: "మీ వ్యక్తిగత ప్రార్థన / సంకల్పం (ఒక వాక్యం):",
    placeholder: "ఉదా: కుటుంబ ఆయురారోగ్యాలు లేదా నూతన ఉద్యోగ విజయం కొరకు...",
    submitBtn: "🙏 సన్నిధికి ప్రార్థన సమర్పించండి (Submit Prayer)",
    submitting: "సమర్పిస్తున్నాము...",
    submittedBadge: "ప్రార్థన సన్నిధికి సమర్పించబడింది",
    priestNotice: (priest) => (
      <>మీ ప్రార్థన గోకర్ణ క్షేత్ర ఆత్మలింగ సన్నిధిలో సమర్పించబడింది, ప్రధాన అర్చకులు <strong>{priest}</strong> గారి నిత్య సంకల్ప పూజలో చేర్చబడింది.</>
    ),
    editBtn: "కొత్త ప్రార్థన రాయండి (Edit Prayer)"
  },
  ta: {
    title: "கோகர்ண சன்னிதி நித்ய பிரார்த்தனைப் பெட்டி (Sanctum Prayer Box)",
    subtitle: "உங்கள் இன்றைய பிரார்த்தனையை கோகர்ண மகாபலேஸ்வரர் சன்னிதியில் சமர்ப்பிக்கவும்",
    inputLabel: "உங்கள் தனிப்பட்ட பிரார்த்தனை / சங்கல்பம் (1 வரி):",
    placeholder: "உதா: குடும்ப ஆரோக்கியம் அல்லது புதிய தொழில் வெற்றிக்கு...",
    submitBtn: "🙏 சன்னிதியில் சமர்ப்பிக்கவும் (Submit Prayer)",
    submitting: "சமர்ப்பிக்கப்படுகிறது...",
    submittedBadge: "பிரார்த்தனை சன்னிதியில் சமர்ப்பிக்கப்பட்டது",
    priestNotice: (priest) => (
      <>உங்கள் பிரார்த்தனை கோகர்ண ஆத்மலிங்க சன்னிதியில் சமர்ப்பிக்கப்பட்டு, முதன்மை அர்ச்சகர் <strong>{priest}</strong> அவர்களின் நித்ய சங்கல்ப பூஜையில் சேர்க்கப்பட்டுள்ளது.</>
    ),
    editBtn: "புதிய பிரார்த்தனை எழுத (Edit Prayer)"
  },
  hi: {
    title: "गोकर्ण सन्निधि नित्य प्रार्थना पत्र (Sanctum Prayer Box)",
    subtitle: "अपनी आज की प्रार्थना गोकर्ण महाबलेश्वर सन्निधि में समर्पित करें",
    inputLabel: "आपकी आज की व्यक्तिगत प्रार्थना / संकल्प (१ पंक्ति):",
    placeholder: "उदा: परिवार के उत्तम स्वास्थ्य अथवा नए कार्य की सफलता हेतु...",
    submitBtn: "🙏 सन्निधि में प्रार्थना समर्पित करें (Submit Prayer)",
    submitting: "समर्पित किया जा रहा है...",
    submittedBadge: "प्रार्थना सन्निधि में समर्पित हो गई है",
    priestNotice: (priest) => (
      <>आपकी प्रार्थना गोकर्ण आत्मलिंग सन्निधि में समर्पित हो गई है, मुख्य अर्चक <strong>{priest}</strong> की नित्य संकल्प पूजा में सम्मिलित है।</>
    ),
    editBtn: "नई प्रार्थना लिखें (Edit Prayer)"
  },
  en: {
    title: "Sacred Sanctum Daily Prayer Box",
    subtitle: "Submit your personal prayer directly to the Gokarna Sanctum",
    inputLabel: "Your Personal Prayer / Sankalpa Today (One Line):",
    placeholder: "E.g., For family health & harmony or new career success...",
    submitBtn: "🙏 Submit Prayer to Sanctum",
    submitting: "Submitting...",
    submittedBadge: "Prayer Submitted to Sacred Sanctum",
    priestNotice: (priest) => (
      <>Your prayer is sanctified at the Gokarna Atmalinga altar and included in Chief Priest <strong>{priest}</strong>'s daily Sankalpa rituals.</>
    ),
    editBtn: "Edit Prayer"
  }
};
