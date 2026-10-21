/**
 * Baggona Panchanga - Karma Sanjeevini Devotee Link Generator Modal
 * Enables Priests and Admins to create tamper-proof, encrypted, isolated end-user links
 * for "Karma Sanjeevini & Sri Gokarna Dosha Parihara Mandala" with configurable expiration
 * (20-Minute Consultation window, 24 Hours, 90 Days, or Perpetual).
 */

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { encodeDevoteeToken, type DevoteeTokenPayload } from "../../utils/tokenCipher";
import { getSafeProductionOrigin } from "../seva/icsCalendarGenerator";
import { resolvePlaceFromPincode } from "../../services/locationApi";

export interface KarmaShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDevoteeName?: string;
  initialDob?: string;
  initialTob?: string;
  initialPlace?: string;
  initialPincode?: string;
  initialGotra?: string;
  initialNakshatra?: number;
  initialRashi?: number;
  initialLang?: string;
}

export const KarmaShareLinkModal: React.FC<KarmaShareLinkModalProps> = ({
  isOpen,
  onClose,
  initialDevoteeName = "ಶ್ರೀ ಭಕ್ತ",
  initialDob = "1993-03-16",
  initialTob = "01:40",
  initialPlace = "Gokarna",
  initialPincode = "581326",
  initialGotra = "Kashyapa",
  initialNakshatra = 18,
  initialRashi = 8,
  initialLang = "kn"
}) => {
  const [devoteeName, setDevoteeName] = useState(initialDevoteeName);
  const [dob, setDob] = useState(initialDob);
  const [tob, setTob] = useState(initialTob);
  const [place, setPlace] = useState(initialPlace);
  const [pincode, setPincode] = useState(initialPincode);
  const [gotra, setGotra] = useState(initialGotra);
  const [nakshatraIndex, setNakshatraIndex] = useState(initialNakshatra);
  const [rashiIndex, setRashiIndex] = useState(initialRashi);
  const [selectedLang, setSelectedLang] = useState(initialLang);
  const [validityMode, setValidityMode] = useState<"20min" | "24h" | "90d" | "never">("20min");

  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [isResolvingPin, setIsResolvingPin] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const origin = getSafeProductionOrigin();
    const nowMs = Date.now();
    let exp: number | undefined;

    if (validityMode === "20min") {
      exp = nowMs + 20 * 60 * 1000; // 20 minutes
    } else if (validityMode === "24h") {
      exp = nowMs + 24 * 60 * 60 * 1000; // 24 hours
    } else if (validityMode === "90d") {
      exp = nowMs + 90 * 24 * 60 * 60 * 1000; // 90 days
    }

    const payload: DevoteeTokenPayload = {
      name: devoteeName.trim() || "ಶ್ರೀ ಭಕ್ತ",
      dob: dob || "1993-03-16",
      tob: tob || "01:40",
      pincode: pincode || "581326",
      locationName: place || "Gokarna",
      gotra: gotra || "Kashyapa",
      nakshatra: nakshatraIndex,
      rashi: rashiIndex,
      lang: selectedLang || "kn",
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      priestPhone: "9972339362",
      exp
    };

    const token = encodeDevoteeToken(payload);
    const link = `${origin}/karma-mandala?token=${token}`;
    setGeneratedUrl(link);

    QRCode.toDataURL(link, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 240,
      color: {
        dark: "#78350F",
        light: "#FFFFFF"
      }
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [isOpen, devoteeName, dob, tob, place, pincode, gotra, nakshatraIndex, rashiIndex, selectedLang, validityMode]);

  const handlePincodeChange = async (pin: string) => {
    setPincode(pin);
    if (pin.length === 6) {
      setIsResolvingPin(true);
      try {
        const placeData = await resolvePlaceFromPincode(pin);
        if (placeData && placeData.villageName) {
          setPlace(placeData.villageName);
        }
      } catch (err) {
        console.warn("Pincode resolve warning:", err);
      } finally {
        setIsResolvingPin(false);
      }
    }
  };

  const handleCopyLink = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = generatedUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    if (!generatedUrl) return;
    const validityText =
      validityMode === "20min"
        ? "(ಗಮನಿಸಿ: ಈ ಲಿಂಕ್ ಮುಂದಿನ ೨೦ ನಿಮಿಷಗಳ ಕಾಲ ಮಾತ್ರ ಸಕ್ರಿಯವಾಗಿರುತ್ತದೆ)"
        : validityMode === "24h"
        ? "(೨೪ ಗಂಟೆಗಳ ಮಾನ್ಯತೆ)"
        : validityMode === "90d"
        ? "(೯೦ ದಿನಗಳ ಮಂಡಲ ಮಾನ್ಯತೆ)"
        : "";

    const msg =
      `॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥\n\n` +
      `ನಮಸ್ಕಾರ ${devoteeName},\n` +
      `ತಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ದೈವಿಕ ಕರ್ಮ ಸಂಜೀವಿನಿ ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ದೋಷ ಪರಿಹಾರ ಮಂಡಲದ ವೈಯಕ್ತಿಕ ದರ್ಶನ ಸಿದ್ಧವಾಗಿದೆ.\n\n` +
      `🔱 ನಿಮ್ಮ ಗ್ರಹ ಘರ್ಷಣೆ ರಾಡಾರ್ ಮತ್ತು ಪರಿಹಾರ ಮುಹೂರ್ತಗಳನ್ನು ನೋಡಲು ಕೆಳಗಿನ ಲಿಂಕ್ ತೆರೆಯಿರಿ:\n` +
      `${generatedUrl}\n\n` +
      `${validityText}\n` +
      `ಪ್ರಧಾನ ಅರ್ಚಕರು: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (೯೯೭೨೩೩೯೩೬೨)\n` +
      `॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ ॥`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950/60 border-2 border-amber-500/50 rounded-2xl max-w-lg w-full p-5 text-amber-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-amber-400/80 hover:text-amber-200 text-lg w-8 h-8 rounded-full bg-stone-800/80 border border-amber-500/30 flex items-center justify-center transition"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center pb-3 border-b border-amber-500/30">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-1">
            <span>🔱</span>
            <span>ದೈವಿಕ ಕರ್ಮ ಸಂಜೀವಿನಿ ಎಂಡ್-ಯೂಸರ್ ಲಿಂಕ್</span>
          </div>
          <h2 className="text-lg font-serif font-black text-amber-200">
            ಭಕ್ತರ ವೈಯಕ್ತಿಕ ರಕ್ಷಾ ಕವಚ ಲಿಂಕ್ ರಚನೆ
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            ಭಕ್ತರು ಈ ಲಿಂಕ್ ಮೂಲಕ ಕೇವಲ ಕರ್ಮ ಸಂಜೀವಿನಿ ಮಂಡಲವನ್ನು ಮಾತ್ರ ಪ್ರತ್ಯೇಕವಾಗಿ ವೀಕ್ಷಿಸಬಹುದು.
          </p>
        </div>

        {/* Devotee Form Fields */}
        <div className="space-y-3 py-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-amber-300 font-semibold mb-1">ಭಕ್ತರ ಹೆಸರು (Devotee Name)</label>
              <input
                type="text"
                value={devoteeName}
                onChange={(e) => setDevoteeName(e.target.value)}
                className="w-full bg-stone-950/80 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-amber-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-amber-300 font-semibold mb-1">ಗೋತ್ರ (Gotra)</label>
              <input
                type="text"
                value={gotra}
                onChange={(e) => setGotra(e.target.value)}
                className="w-full bg-stone-950/80 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-amber-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-amber-300 font-semibold mb-1">ಜನ್ಮ ದಿನಾಂಕ (DOB)</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-stone-950/80 border border-amber-500/40 rounded-lg px-2 py-1.5 text-amber-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-amber-300 font-semibold mb-1">ಜನ್ಮ ಸಮಯ (TOB)</label>
              <input
                type="time"
                value={tob}
                onChange={(e) => setTob(e.target.value)}
                className="w-full bg-stone-950/80 border border-amber-500/40 rounded-lg px-2 py-1.5 text-amber-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-amber-300 font-semibold mb-1">ಪಿನ್‌ಕೋಡ್ (Pincode)</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => void handlePincodeChange(e.target.value)}
                  className="w-full bg-stone-950/80 border border-amber-500/40 rounded-lg px-2 py-1.5 text-amber-100 focus:outline-none focus:border-amber-400"
                />
                {isResolvingPin && <span className="absolute right-2 top-1.5 text-amber-400 text-[10px] animate-spin">⏳</span>}
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-amber-300 font-semibold mb-1">ಸ್ಥಳ (Birth Place)</label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="w-full bg-stone-950/80 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-amber-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Validity Duration Selector */}
          <div>
            <label className="block text-[11px] text-amber-300 font-semibold mb-1">
              ⏳ ಲಿಂಕ್ ಮಾನ್ಯತೆಯ ಅವಧಿ (Link Expiration Security)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: "20min", label: "೨೦ ನಿಮಿಷ", sub: "20-Min Strict" },
                { id: "24h", label: "೨೪ ಗಂಟೆ", sub: "24-Hours" },
                { id: "90d", label: "೯೦ ದಿನ", sub: "90-Day Mandala" },
                { id: "never", label: "ಶಾಶ್ವತ", sub: "Unlimited" }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setValidityMode(m.id as any)}
                  className={`p-1.5 rounded-lg border text-center transition ${
                    validityMode === m.id
                      ? "bg-amber-500 text-stone-950 font-black border-amber-300 shadow-md"
                      : "bg-stone-950/60 text-stone-300 border-amber-500/30 hover:border-amber-400"
                  }`}
                >
                  <div className="text-xs">{m.label}</div>
                  <div className="text-[9px] opacity-80">{m.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* QR Code and Generated URL Preview */}
        <div className="bg-stone-950/90 border border-amber-500/40 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3 mt-2">
          {qrCodeUrl && (
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-24 h-24 rounded-lg border border-amber-400/40 shadow-sm bg-white p-1 flex-shrink-0"
            />
          )}
          <div className="w-full min-w-0 space-y-2">
            <div className="text-[11px] text-stone-400 truncate">
              <span className="text-amber-400 font-semibold">ಸುರಕ್ಷಿತ ಎನ್‌ಕ್ರಿಪ್ಟೆಡ್ ಲಿಂಕ್:</span>
              <div className="text-[10px] text-amber-200/80 font-mono truncate bg-stone-900 px-2 py-1 rounded border border-amber-500/20 mt-1 select-all">
                {generatedUrl}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs py-1.5 px-3 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>{copiedToast ? "✅ ಕಾಪಿ ಆಗಿದೆ!" : "📋 ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ"}</span>
              </button>
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>📱 WhatsApp ಶೇರ್</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center text-[10px] text-stone-400">
          🔒 ಬಗ್ಗೋಣ ಗೌಪ್ಯತಾ ಗ್ಯಾರಂಟಿ: ಭಕ್ತರು ಈ ಲಿಂಕ್ ತೆರೆದಾಗ ಕೇವಲ ಕರ್ಮ ಸಂಜೀವಿನಿ ಫಲಗಳನ್ನು ಮಾತ್ರ ಪ್ರತ್ಯೇಕವಾಗಿ ವೀಕ್ಷಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತದೆ.
        </div>
      </div>
    </div>
  );
};
