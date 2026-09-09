import React, { useState } from "react";
import { savePurohitaProfile, recordPurohitaActivity, type PurohitaProfileDoc } from "../../db/firestoreDb";
import { canonicalPurohitaId } from "./purohitaActivityService";

interface PurohitaProfileRegistrationModalProps {
  purohitaId: string;
  initialPriestName?: string;
  initialMobile?: string;
  initialEmail?: string;
  onCompleted: (profile: PurohitaProfileDoc) => void;
  onDismiss?: () => void;
}

export const PurohitaProfileRegistrationModal: React.FC<PurohitaProfileRegistrationModalProps> = ({
  purohitaId,
  initialPriestName = "ಪುರೋಹಿತರು",
  initialMobile = "",
  initialEmail = "",
  onCompleted,
  onDismiss
}) => {
  const [name, setName] = useState(initialPriestName);
  const [mobile, setMobile] = useState(initialMobile);
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const cleanId = canonicalPurohitaId(purohitaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanMobile = mobile.replace(/[^0-9]/g, "").slice(-10);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMsg("ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (Please enter valid 10-digit mobile number)");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMsg("ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ (Please enter valid email address)");
      return;
    }

    setIsSubmitting(true);
    try {
      const savedDoc = await savePurohitaProfile({
        purohitaId: cleanId,
        priestName: name.trim() || initialPriestName,
        mobileNumber: cleanMobile,
        phone: cleanMobile,
        email: cleanEmail,
        status: "active"
      });

      // Track registration event
      await recordPurohitaActivity({
        purohitaId: cleanId,
        priestName: savedDoc.priestName,
        activityType: "purohita_registered",
        page: "registration",
        details: `ಪುರೋಹಿತರ ಅಧಿಕೃತ ಪ್ರೊಫೈಲ್ ನೋಂದಾಯಿಸಲಾಗಿದೆ (Registered: ${cleanMobile}, ${cleanEmail})`
      });

      // Cache locally so it is never prompted again
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`baggona_priest_profile_registered_${cleanId}`, "true");
          localStorage.setItem("baggona_priest_phone", cleanMobile);
          localStorage.setItem("baggona_priest_email", cleanEmail);
        } catch {}
      }

      onCompleted(savedDoc);
    } catch (err: any) {
      console.error("[PurohitaProfileRegistrationModal] Error saving profile:", err);
      setErrorMsg("ನೋಂದಣಿ ಉಳಿಸುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFDF7] border-3 border-amber-400 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden ring-4 ring-amber-400/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-5 py-4 text-slate-950 flex items-center justify-between border-b border-amber-400 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🕉️</span>
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight leading-snug">
                ಪುರೋಹಿತರ ಅಧಿಕೃತ ನೋಂದಣಿ
              </h3>
              <p className="text-[11px] text-amber-950 font-bold opacity-90">
                Purohita Official Profile Registration
              </p>
            </div>
          </div>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-amber-950 hover:text-black font-black text-sm p-1 rounded-lg transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <p className="text-xs text-amber-950 font-semibold leading-relaxed bg-amber-50 border border-amber-300 p-3 rounded-xl">
            ನಮಸ್ಕಾರ, ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಸೌಲಭ್ಯಗಳ ಸಕ್ರಿಯ ಬಳಕೆ, ವಾಲೆಟ್ ಭದ್ರತೆ ಹಾಗೂ ನಿರ್ವಾಹಕರಿಂದ ನಾಣ್ಯಗಳ ಕೊಡುಗೆ ಪಡೆಯಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.
          </p>

          {errorMsg && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-900 text-xs font-bold animate-shake">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Purohita ID (Readonly) */}
          <div>
            <label className="block text-[11px] font-bold text-amber-950 mb-1">
              ಪುರೋಹಿತರ ID (Purohita ID):
            </label>
            <input
              type="text"
              readOnly
              value={cleanId}
              className="w-full px-3 py-2 bg-slate-100 border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-700 select-all cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-[11px] font-bold text-amber-950 mb-1">
              ಪುರೋಹಿತರ ಹೆಸರು (Priest Name):
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
              className="w-full px-3.5 py-2.5 bg-white border-2 border-amber-300 rounded-xl text-slate-900 text-xs font-bold focus:border-amber-500 focus:outline-none shadow-inner"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-[11px] font-bold text-amber-950 mb-1 flex items-center justify-between">
              <span>📱 ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (10-Digit Mobile):</span>
              <span className="text-[10px] text-amber-700 font-bold">* ಕಡ್ಡಾಯ</span>
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
              placeholder="9876543210"
              className="w-full px-3.5 py-2.5 bg-white border-2 border-amber-300 rounded-xl text-slate-900 text-xs font-mono font-black focus:border-amber-500 focus:outline-none shadow-inner"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold text-amber-950 mb-1 flex items-center justify-between">
              <span>✉️ ಇಮೇಲ್ ವಿಳಾಸ (Email Address):</span>
              <span className="text-[10px] text-amber-700 font-bold">* ಕಡ್ಡಾಯ</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pandit@baggona.com"
              className="w-full px-3.5 py-2.5 bg-white border-2 border-amber-300 rounded-xl text-slate-900 text-xs font-bold focus:border-amber-500 focus:outline-none shadow-inner"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg border border-amber-400 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>✨</span>
            <span>
              {isSubmitting ? "ಉಳಿಸಲಾಗುತ್ತಿದೆ..." : "✓ ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ & ಮುಂದುವರಿಯಿರಿ"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
