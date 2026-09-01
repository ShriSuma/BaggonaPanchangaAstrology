import React, { useState } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import { updateDevoteeContact, type DevoteeUserRecord } from "../../features/seva/devoteeUserService";

export interface DevoteeContactCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  devoteeId: string;
  devoteeName: string;
  gotra?: string;
  lang?: SevaLang;
  initialPhone?: string;
  initialEmail?: string;
  onSuccess?: (updatedUser: DevoteeUserRecord) => void;
}

const MODAL_DICT = {
  kn: {
    badge: "🛕 ಬಗ್ಗೋಣ ದೇವಸ್ಥಾನ ಭಕ್ತರ ನೋಂದಣಿ",
    title: "ದೇವತಾ ಸಂಕಲ್ಪ & ವಿಶೇಷ ಪಂಚಾಂಗ ಸೇವೆಗಾಗಿ ಸಂಪರ್ಕ ವಿವರ",
    subtitle: "ನಿಮ್ಮ ನಿತ್ಯ ಪಂಚಾಂಗ, ಪೂಜಾ ಸಂಕಲ್ಪ ಮತ್ತು ವಿಶೇಷ ಮುಹೂರ್ತಗಳ ನೇರ ಮಾಹಿತಿ ಪಡೆಯಲು ಕನಿಷ್ಠ ಒಂದು ಸಂಪರ್ಕ ವಿವರವನ್ನು ದಾಖಲಿಸಿ.",
    nameLabel: "ಭಕ್ತರ ಹೆಸರು",
    gotraLabel: "ಗೋತ್ರ",
    phoneLabel: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Mobile / WhatsApp Number)",
    phonePlaceholder: "ಉದಾ: 9876543210",
    emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ (Email Address)",
    emailPlaceholder: "ಉದಾ: devotee@example.com",
    requiredHint: "⚠️ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ಇಮೇಲ್ ವಿಳಾಸ - ಇವೆರಡರಲ್ಲಿ ಕನಿಷ್ಠ ಒಂದನ್ನು ದಾಖಲಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ.",
    submitBtn: "ದಾಖಲಿಸಿ & ಮುಂದುವರಿಯಿರಿ (Submit & Continue)",
    closeBtn: "ಈಗ ಬೇಡ, ನಂತರ ನೀಡುವೆ (Skip for Now)",
    submitting: "ದಾಖಲಾಗುತ್ತಿದೆ...",
    successMsg: "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಸಂಪರ್ಕ ವಿವರಗಳು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿವೆ.",
    errorMinOne: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.",
    errorInvalidPhone: "ದಯವಿಟ್ಟು ಕನಿಷ್ಠ 10 ಅಂಕಿಗಳ ಸರಿಯಾದ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.",
    errorInvalidEmail: "ದಯವಿಟ್ಟು ಸರಿಯಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ."
  },
  en: {
    badge: "🛕 Baggona Temple Devotee Registration",
    title: "Contact Details for Daily Sanctum & Panchanga Services",
    subtitle: "Please provide at least one contact detail to receive daily Panchanga alerts, personalized Pooja Sankalpas, and Muhurtha updates.",
    nameLabel: "Devotee Name",
    gotraLabel: "Gotra",
    phoneLabel: "Mobile / WhatsApp Number",
    phonePlaceholder: "e.g., 9876543210",
    emailLabel: "Email Address",
    emailPlaceholder: "e.g., devotee@example.com",
    requiredHint: "⚠️ Providing at least one contact detail (Mobile or Email) is required.",
    submitBtn: "Submit & Continue",
    closeBtn: "Skip for Now",
    submitting: "Submitting...",
    successMsg: "Thank you! Your contact details have been registered successfully.",
    errorMinOne: "Please provide at least a valid Mobile Number or Email Address.",
    errorInvalidPhone: "Please enter a valid 10-digit mobile number.",
    errorInvalidEmail: "Please enter a valid email address."
  },
  hi: {
    badge: "🛕 बग्गोण मंदिर भक्त पंजीकरण",
    title: "दैनिक संकल्प एवं पंचांग सेवा हेतु संपर्क विवरण",
    subtitle: "दैनिक पंचांग, पूजा संकल्प एवं मुहूर्त सूचनाएं प्राप्त करने के लिए कृपया अपना मोबाइल नंबर या ईमेल दर्ज करें।",
    nameLabel: "भक्त का नाम",
    gotraLabel: "गोत्र",
    phoneLabel: "मोबाइल / व्हाट्सएप नंबर",
    phonePlaceholder: "उदा: 9876543210",
    emailLabel: "ईमेल पता",
    emailPlaceholder: "उदा: devotee@example.com",
    requiredHint: "⚠️ मोबाइल नंबर या ईमेल में से कम से कम एक विवरण अनिवार्य है।",
    submitBtn: "दर्ज करें एवं आगे बढ़ें",
    closeBtn: "अभी छोड़ें",
    submitting: "दर्ज हो रहा है...",
    successMsg: "धन्यवाद! आपका संपर्क विवरण सफलतापूर्वक सुरक्षित कर लिया गया है।",
    errorMinOne: "कृपया वैध मोबाइल नंबर अथवा ईमेल पता दर्ज करें।",
    errorInvalidPhone: "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।",
    errorInvalidEmail: "कृपया वैध ईमेल पता दर्ज करें।"
  },
  te: {
    badge: "🛕 బగ్గోణ ఆలయ భక్త నమోదు",
    title: "దైవిక సంకల్పం & పంచాంగ సేవల కొరకు సంప్రదింపు వివరాలు",
    subtitle: "నిత్య పంచాంగం మరియు పూజా సంకల్ప వివరాలు పొందడానికి దయచేసి మొబైల్ లేదా ఈమెయిల్ నమోదు చేయండి.",
    nameLabel: "భక్తుని పేరు",
    gotraLabel: "గోత్రం",
    phoneLabel: "మొబైల్ / వాట్సాప్ నంబర్",
    phonePlaceholder: "ఉదా: 9876543210",
    emailLabel: "ఈమెయిల్ చిరునామా",
    emailPlaceholder: "ఉదా: devotee@example.com",
    requiredHint: "⚠️ మొబైల్ లేదా ఈమెయిల్ లో కనీసం ఒకటి నమోదు చేయడం తప్పనిసరి.",
    submitBtn: "నమోదు చేసి కొనసాగించండి",
    closeBtn: "ఇప్పుడు వద్దు",
    submitting: "నమోదవుతోంది...",
    successMsg: "ధన్యవాదాలు! మీ వివరాలు విజయవంతంగా నమోదయ్యాయి.",
    errorMinOne: "దయచేసి సరైన మొబైల్ నంబర్ లేదా ఈమెయిల్ నమోదు చేయండి.",
    errorInvalidPhone: "దయచేసి 10 అంకెల సరైన మొబైల్ నంబర్ నమోదు చేయండి.",
    errorInvalidEmail: "దయచేసి సరైన ఈమెయిల్ చిరునామా నమోదు చేయండి."
  },
  ta: {
    badge: "🛕 பக்ககோண திருக்கோயில் பக்தர் பதிவு",
    title: "தினசரி சங்கல்பம் & பஞ்சாங்க சேவைக்கான தொடர்பு விவரங்கள்",
    subtitle: "தினசரி பஞ்சாங்கம் மற்றும் பூஜை சங்கல்ப தகவல்களைப் பெற மொபைல் எண் அல்லது மின்னஞ்சல் முகவரியைப் பதிவு செய்யவும்.",
    nameLabel: "பக்தர் பெயர்",
    gotraLabel: "கோத்திரம்",
    phoneLabel: "மொபைல் / வாட்ஸ்அப் எண்",
    phonePlaceholder: "உதா: 9876543210",
    emailLabel: "மின்னஞ்சல் முகவரி",
    emailPlaceholder: "உதா: devotee@example.com",
    requiredHint: "⚠️ மொபைல் அல்லது மின்னஞ்சலில் ஏதேனும் ஒன்றை வழங்குவது கட்டாயமாகும்.",
    submitBtn: "பதிவு செய்து தொடரவும்",
    closeBtn: "இப்போது வேண்டாம்",
    submitting: "பதிவாகிறது...",
    successMsg: "நன்றி! உங்கள் தொடர்பு விவரங்கள் வெற்றிகரமாகப் பதிவு செய்யப்பட்டன.",
    errorMinOne: "தயவுசெய்து சரியான மொபைல் எண் அல்லது மின்னஞ்சலை உள்ளிடவும்.",
    errorInvalidPhone: "தயவுசெய்து 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.",
    errorInvalidEmail: "தயவுசெய்து சரியான மின்னஞ்சலை உள்ளிடவும்."
  }
};

export const DevoteeContactCaptureModal: React.FC<DevoteeContactCaptureModalProps> = ({
  isOpen,
  onClose,
  devoteeId,
  devoteeName,
  gotra = "ಕಾಶ್ಯಪ",
  lang = "kn",
  initialPhone = "",
  initialEmail = "",
  onSuccess
}) => {
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const t = MODAL_DICT[lang] || MODAL_DICT.kn;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const cleanPhone = phone.trim().replace(/[^\d+]/g, "");
    const cleanEmail = email.trim().toLowerCase();

    // Check if at least one is provided
    if (!cleanPhone && !cleanEmail) {
      setErrorMessage(t.errorMinOne);
      return;
    }

    // If phone is provided, validate length
    if (cleanPhone) {
      const digitsOnly = cleanPhone.replace(/[^\d]/g, "");
      if (digitsOnly.length < 10) {
        setErrorMessage(t.errorInvalidPhone);
        return;
      }
    }

    // If email is provided, validate structure
    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setErrorMessage(t.errorInvalidEmail);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await updateDevoteeContact(devoteeId, {
        phone: cleanPhone,
        email: cleanEmail
      });

      if (res.success && res.updatedUser) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`baggona_contact_collected_${devoteeId}`, "true");
          localStorage.setItem("baggona_contact_collected_global", "true");
        }
        setSuccessMessage(t.successMsg);
        if (onSuccess) {
          onSuccess(res.updatedUser);
        }
        // Auto-close popup cleanly so user is never blocked
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setErrorMessage("ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ (Please try again).");
      }
    } catch (err) {
      console.error("Failed to submit contact details:", err);
      setErrorMessage("ವಿವರಗಳನ್ನು ದಾಖಲಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in"
      style={{ touchAction: "none" }}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-amber-400/90 shadow-2xl transition-all"
        style={{
          background: "linear-gradient(175deg, #2D1407 0%, #170700 60%, #0D0400 100%)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.35)"
        }}
      >
        {/* Top Gold Ornamental Trim */}
        <div className="h-2.5 w-full bg-gradient-to-r from-amber-600 via-yellow-300 to-amber-600 shadow-md" />

        <div className="p-6 md:p-8">
          {/* Header Badge & Title */}
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-900/60 px-3.5 py-1 text-xs font-black tracking-wide text-amber-200 shadow-inner">
              {t.badge}
            </span>

            <h2 className="mt-3 text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 leading-snug">
              {t.title}
            </h2>

            <p className="mt-2 text-xs md:text-sm text-amber-100/80 leading-relaxed max-w-md mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Devotee Identity Card */}
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-950/40 px-4 py-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">👤</span>
              <div>
                <span className="text-amber-400/70 block text-[10px] uppercase font-bold">{t.nameLabel}</span>
                <span className="font-extrabold text-amber-100">{devoteeName || "ಭಕ್ತರು"}</span>
              </div>
            </div>
            {gotra && (
              <div className="text-right">
                <span className="text-amber-400/70 block text-[10px] uppercase font-bold">{t.gotraLabel}</span>
                <span className="font-extrabold text-amber-200">{gotra}</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Phone Number Field */}
            <div>
              <label className="block text-xs font-extrabold text-amber-200 mb-1.5 flex items-center justify-between">
                <span>📱 {t.phoneLabel}</span>
                <span className="text-[10px] text-amber-400/70 font-semibold">WhatsApp & SMS</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="w-full rounded-xl border border-amber-500/50 bg-black/50 px-4 py-3 text-sm font-semibold text-amber-50 placeholder-amber-200/30 shadow-inner focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition font-mono"
                />
              </div>
            </div>

            {/* Email Address Field */}
            <div>
              <label className="block text-xs font-extrabold text-amber-200 mb-1.5 flex items-center justify-between">
                <span>✉️ {t.emailLabel}</span>
                <span className="text-[10px] text-amber-400/70 font-semibold">Daily Panchanga</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full rounded-xl border border-amber-500/50 bg-black/50 px-4 py-3 text-sm font-semibold text-amber-50 placeholder-amber-200/30 shadow-inner focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition"
                />
              </div>
            </div>

            {/* Mandatory Requirement Banner */}
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/60 p-3 text-xs text-amber-200 leading-tight font-medium flex items-center gap-2">
              <span className="text-base shrink-0">🔒</span>
              <span>{t.requiredHint}</span>
            </div>

            {/* Error / Success Feedback */}
            {errorMessage && (
              <div className="rounded-xl border border-red-500/50 bg-red-950/60 p-3 text-xs font-bold text-red-200 animate-shake">
                ⚠️ {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/60 p-3 text-xs font-bold text-emerald-200">
                ✅ {successMessage}
              </div>
            )}

            {/* Mandatory Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-6 py-3.5 text-sm font-black text-amber-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? "⏳" : "✨"}</span>
                <span>{isSubmitting ? t.submitting : t.submitBtn}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
