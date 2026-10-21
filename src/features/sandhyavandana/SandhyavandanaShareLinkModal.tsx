/**
 * Baggona Panchanga - Sandhyavandana 3-Month Shareable Devotee Link Modal
 * Enables Priests and Admins to create authentic, 90-day cryptographic Sandhyavandana links,
 * complete with QR code preview, WhatsApp sharing, and one-click clipboard copying.
 */

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { createSandhyavandanaSession } from "./sandhyavandanaDbService";
import { GOTRA_CATALOG } from "./sandhyavandanaData";
import type { SandhyaPeriod } from "./sandhyavandanaTypes";

export interface SandhyavandanaShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  initialGotraId?: string;
}

export const SandhyavandanaShareLinkModal: React.FC<SandhyavandanaShareLinkModalProps> = ({
  isOpen,
  onClose,
  initialName = "ಶ್ರೀ ಭಕ್ತ",
  initialGotraId = "vashishta_traya"
}) => {
  const [devoteeName, setDevoteeName] = useState(initialName);
  const [selectedGotraId, setSelectedGotraId] = useState(initialGotraId);
  const [preferredPeriod, setPreferredPeriod] = useState<SandhyaPeriod>("pratah");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      void generateLink();
    }
  }, [isOpen]);

  const generateLink = async () => {
    try {
      setIsGenerating(true);
      const session = await createSandhyavandanaSession({
        devoteeName: devoteeName.trim() || "ಶ್ರೀ ಭಕ್ತ",
        devoteeGotraId: selectedGotraId,
        preferredPeriod
      });

      const shareUrl = session.shareableUrl || "";
      setGeneratedUrl(shareUrl);

      if (shareUrl) {
        const qr = await QRCode.toDataURL(shareUrl, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 240,
          color: {
            dark: "#78350F",
            light: "#FFFFFF"
          }
        });
        setQrCodeUrl(qr);
      }
    } catch (err) {
      console.error("Failed to generate Sandhyavandana link:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch {
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
    const gotraObj = GOTRA_CATALOG.find((g) => g.id === selectedGotraId);
    const gotraName = gotraObj?.nameKn || "ವಸಿಷ್ಠ ತ್ರಯಾರ್ಷೇಯ";

    const msg =
      `॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥\n\n` +
      `ನಮಸ್ಕಾರ ${devoteeName},\n` +
      `ತಮಗಾಗಿ ವೈದಿಕ ಸಂಧ್ಯಾವಂದನಾ ಮಹಾವಿಧಿಯ (ತ್ರಿಕಾಲ ಸಂಧ್ಯಾವಂದನೆ, ಗಾಯತ್ರೀ ಜಪ ಹಾಗೂ ${gotraName} ಪ್ರವರಾಭಿವಾದನ ಸಹಿತ) ೩ ತಿಂಗಳ (೯೦ ದಿನಗಳ) ದಿವ್ಯ ರಕ್ಷಾ ಕವಚ ಲಿಂಕ್ ಸಿದ್ಧವಾಗಿದೆ.\n\n` +
      `🕉️ ದೈನಂದಿನ ಸಂಧ್ಯಾವಂದನೆ ಹಾಗೂ ಮಂತ್ರ ಕಲಿಯಲು ಈ ಕೆಳಗಿನ ಲಿಂಕ್ ತೆರೆಯಿರಿ:\n` +
      `${generatedUrl}\n\n` +
      `(ಗಮನಿಸಿ: ಈ ಲಿಂಕ್ ಮುಂದಿನ ೯೦ ದಿನಗಳ ಕಾಲ ಸಕ್ರಿಯವಾಗಿರುತ್ತದೆ)\n` +
      `ಪ್ರಧಾನ ಅರ್ಚಕರು: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (೯೯೭೨೩೩೯೩೬೨)\n` +
      `॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ ॥`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#22170d] via-[#1b120a] to-[#2d1808] border-2 border-amber-500/50 rounded-2xl max-w-lg w-full p-5 text-amber-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-amber-400/80 hover:text-amber-200 text-lg w-8 h-8 rounded-full bg-stone-900/80 border border-amber-500/30 flex items-center justify-center transition"
        >
          ✕
        </button>

        <div className="text-center pb-3 border-b border-amber-500/30">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-1">
            <span>🕉️</span>
            <span>ಸಂಧ್ಯಾವಂದನಾ ೩ ತಿಂಗಳ ಭಕ್ತರ ಲಿಂಕ್</span>
          </div>
          <h2 className="text-lg font-serif font-black text-amber-200">
            ತ್ರಿಕಾಲ ಸಂಧ್ಯಾವಂದನಾ ಮಹಾವಿಧಿ ಲಿಂಕ್ ರಚನೆ
          </h2>
          <p className="text-xs text-stone-300 mt-0.5">
            ಭಕ್ತರಿಗೆ ೯೦ ದಿನಗಳ ಕಾಲ (೩ ತಿಂಗಳು) ಕೇವಲ ಸಂಧ್ಯಾವಂದನಾ ಮಹಾವಿಧಿಯನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಅಭ್ಯಾಸ ಮಾಡಲು ಅನುವು ಮಾಡಿಕೊಡುವ ಸುರಕ್ಷಿತ ಲಿಂಕ್.
          </p>
        </div>

        <div className="space-y-3 py-3 text-xs">
          <div>
            <label className="block text-[11px] text-amber-300 font-semibold mb-1">
              ಭಕ್ತರ ಹೆಸರು (Devotee Name)
            </label>
            <input
              type="text"
              value={devoteeName}
              onChange={(e) => setDevoteeName(e.target.value)}
              className="w-full bg-stone-950/80 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-amber-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] text-amber-300 font-semibold mb-1">
              ಗೋತ್ರ ಪ್ರವರ ಆಯ್ಕೆ (Gotra Pravara)
            </label>
            <select
              value={selectedGotraId}
              onChange={(e) => setSelectedGotraId(e.target.value)}
              className="w-full bg-stone-950/80 border border-amber-500/40 rounded-lg px-2 py-1.5 text-amber-100 focus:outline-none focus:border-amber-400"
            >
              {GOTRA_CATALOG.map((g) => (
                <option key={g.id} value={g.id} className="bg-stone-900 text-amber-100">
                  {g.nameKn} ({g.pravaraTypeKn}) - {g.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-amber-300 font-semibold mb-1">
              ಆದ್ಯತೆಯ ಸಂಧ್ಯಾ ಕಾಲ (Default Period)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "pratah", label: "🌅 ಪ್ರಾತಃ", sub: "Morning" },
                { id: "madhyahna", label: "☀️ ಮಧ್ಯಾಹ್ನ", sub: "Noon" },
                { id: "sayam", label: "🌆 ಸಾಯಂ", sub: "Evening" }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreferredPeriod(p.id as any)}
                  className={`p-1.5 rounded-lg border text-center transition ${
                    preferredPeriod === p.id
                      ? "bg-amber-500 text-stone-950 font-bold border-amber-300"
                      : "bg-stone-950/60 text-stone-300 border-amber-500/30"
                  }`}
                >
                  <div>{p.label}</div>
                  <div className="text-[9px] opacity-75">{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void generateLink()}
            disabled={isGenerating}
            className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-md hover:from-amber-500 hover:to-yellow-400 transition"
          >
            {isGenerating ? "⏳ ಲಿಂಕ್ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "🔄 ಹೊಸ ೩ ತಿಂಗಳ ಲಿಂಕ್ ರಚಿಸಿ"}
          </button>
        </div>

        {/* QR Code and Generated URL Preview */}
        {generatedUrl && (
          <div className="bg-stone-950/90 border border-amber-500/40 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3 mt-1">
            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-24 h-24 rounded-lg border border-amber-400/40 shadow-sm bg-white p-1 flex-shrink-0"
              />
            )}
            <div className="w-full min-w-0 space-y-2">
              <div className="text-[11px] text-stone-400 truncate">
                <span className="text-amber-400 font-semibold">೩ ತಿಂಗಳ ಸಕ್ರಿಯ ಲಿಂಕ್:</span>
                <div className="text-[10px] text-amber-200/80 font-mono truncate bg-stone-900 px-2 py-1 rounded border border-amber-500/20 mt-1 select-all">
                  {generatedUrl}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleCopy()}
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
        )}

        <div className="mt-3 text-center text-[10px] text-stone-400">
          ⏳ ಭದ್ರತಾ ನಿಯಮ: ೯೦ ದಿನಗಳವರೆಗೆ ಭಕ್ತರು ಈ ಲಿಂಕ್ ಮೂಲಕ ಕೇವಲ ಸಂಧ್ಯಾವಂದನೆಯನ್ನು ಮಾತ್ರ ವೀಕ್ಷಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತದೆ.
        </div>
      </div>
    </div>
  );
};
