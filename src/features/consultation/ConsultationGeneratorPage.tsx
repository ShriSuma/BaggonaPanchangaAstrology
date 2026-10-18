/**
 * Baggona Panchanga - 20-Minute Consultation Link Generator & Session Dashboard
 * Enables priests and admins to enter devotee birth details, choose among 7 languages,
 * generate a secure Firestore-backed link with a QR code, share on WhatsApp, and manage live sessions.
 */

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  createConsultationSession,
  listRecentConsultationSessions,
  expireConsultationSession,
  deleteConsultationSession,
  encodeSecureConsultationToken,
  getConsultationTelemetry
} from "./consultationDbService";
import type {
  ConsultationSession,
  ConsultationLanguage,
  CreateConsultationInput,
  ConsultationTelemetry,
  DevoteeQuestionGroup,
  ConsultationQuestionRecord,
  ConsultationReview
} from "./consultationTypes";
import {
  CONSULTATION_LANGUAGES,
  DEFAULT_PRIEST_CONTACT
} from "./consultationTypes";
import { resolvePlaceFromPincode } from "../../services/locationApi";
import { useAuthStore, SUPER_ADMIN_USERNAMES } from "../auth/authStore";

const POPULAR_PLACES = [
  { name: "ಗೋಕರ್ಣ (Gokarna)", lat: 14.5479, lng: 74.3188 },
  { name: "ಬೆಂಗಳೂರು (Bengaluru)", lat: 12.9716, lng: 77.5946 },
  { name: "ಮಂಗಳೂರು (Mangaluru)", lat: 12.9141, lng: 74.8560 },
  { name: "ಉಡುಪಿ (Udupi)", lat: 13.3409, lng: 74.7421 },
  { name: "ಹುಬ್ಬಳ್ಳಿ (Hubballi)", lat: 15.3647, lng: 75.1240 },
  { name: "ಮೈಸೂರು (Mysuru)", lat: 12.2958, lng: 76.6394 },
  { name: "ಶಿರಸಿ (Sirsi)", lat: 14.6195, lng: 74.8354 },
  { name: "ಕುಮಟಾ (Kumta)", lat: 14.4259, lng: 74.4172 },
  { name: "ಮುಂಬೈ (Mumbai)", lat: 19.0760, lng: 72.8777 }
];

export const ConsultationGeneratorPage: React.FC = () => {
  // STRICT SUPER ADMIN SECURITY GUARD
  const { currentUser, role, isAuthenticated } = useAuthStore();
  const isSuperAdmin =
    isAuthenticated &&
    (role === "superadmin" ||
      currentUser?.toLowerCase() === "baggona" ||
      currentUser?.toLowerCase() === "shrisuma" ||
      currentUser === "$hriSuma" ||
      currentUser?.toLowerCase() === "superadmin" ||
      Boolean(currentUser && SUPER_ADMIN_USERNAMES.some((u) => u.toLowerCase() === currentUser.toLowerCase() || u === currentUser)));

  // Form State
  const [name, setName] = useState("");
  const [dob, setDob] = useState("1995-05-15");
  const [tob, setTob] = useState("10:30");
  const [place, setPlace] = useState("Gokarna");
  const [pincode, setPincode] = useState("581326");
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const [selectedLat, setSelectedLat] = useState(14.5479);
  const [selectedLng, setSelectedLng] = useState(74.3188);
  const [language, setLanguage] = useState<ConsultationLanguage>("kn");
  const [isGenerating, setIsGenerating] = useState(false);

  // Generated Link State
  const [generatedSession, setGeneratedSession] = useState<ConsultationSession | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [copiedToast, setCopiedToast] = useState(false);

  // Recent Sessions State
  const [recentSessions, setRecentSessions] = useState<ConsultationSession[]>([]);
  const [loadingRecents, setLoadingRecents] = useState(true);

  // Active Dashboard Tab: "generator" | "telemetry"
  const [activeTab, setActiveTab] = useState<"generator" | "telemetry">("generator");

  // Telemetry & Devotee Questions State
  const [telemetry, setTelemetry] = useState<ConsultationTelemetry | null>(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState<boolean>(false);
  const [searchDevoteeQuery, setSearchDevoteeQuery] = useState<string>("");
  const [expandedDevoteeId, setExpandedDevoteeId] = useState<string | null>(null);

  // Load Recent Sessions
  const refreshRecentSessions = async () => {
    try {
      setLoadingRecents(true);
      const list = await listRecentConsultationSessions();
      setRecentSessions(list);
    } catch (err) {
      console.warn("[Generator] Failed to fetch recent sessions:", err);
    } finally {
      setLoadingRecents(false);
    }
  };

  // Load Telemetry & Questions Analytics
  const refreshTelemetry = async () => {
    try {
      setLoadingTelemetry(true);
      const data = await getConsultationTelemetry();
      setTelemetry(data);
    } catch (err) {
      console.warn("[Generator] Failed to fetch consultation telemetry:", err);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    void refreshRecentSessions();
    void refreshTelemetry();
  }, []);

  useEffect(() => {
    if (activeTab === "telemetry") {
      void refreshTelemetry();
    }
  }, [activeTab]);

  // Handle Pincode Auto-Resolution
  const handlePincodeChange = async (val: string) => {
    setPincode(val);
    const clean = val.replace(/\D/g, "").slice(0, 6);
    if (clean.length === 6) {
      setIsResolvingPin(true);
      try {
        const res = await resolvePlaceFromPincode(clean);
        if (res) {
          setPlace(`${res.villageName} (${res.pincode})`);
          setSelectedLat(res.lat);
          setSelectedLng(res.lng);
        }
      } catch (err) {
        console.warn("[Generator] Pincode resolution notice:", err);
      } finally {
        setIsResolvingPin(false);
      }
    }
  };

  // Handle Generate Action
  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("ದಯವಿಟ್ಟು ಭಕ್ತರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (Please enter Devotee Name).");
      return;
    }

    setIsGenerating(true);
    try {
      const input: CreateConsultationInput = {
        name: name.trim(),
        dob,
        tob,
        place: place.trim(),
        lat: selectedLat,
        lng: selectedLng,
        timezone: 5.5,
        language
      };

      const session = await createConsultationSession(input);
      setGeneratedSession(session);

      // Build Encrypted Secure Link URL
      const origin = typeof window !== "undefined" ? window.location.origin : "https://baggona-panchanga.web.app";
      const secureToken = encodeSecureConsultationToken(session.id);
      const fullUrl = `${origin}/consultation?id=${secureToken}`;
      setGeneratedUrl(fullUrl);

      // Generate QR Code
      try {
        const qr = await QRCode.toDataURL(fullUrl, {
          width: 280,
          margin: 2,
          color: {
            dark: "#78350f", // amber-900
            light: "#fffdfa"
          }
        });
        setQrCodeDataUrl(qr);
      } catch (qrErr) {
        console.warn("[Generator] QR generation error:", qrErr);
      }

      // Refresh list
      void refreshRecentSessions();
    } catch (err: any) {
      alert("Error creating consultation session: " + (err.message || String(err)));
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to Clipboard
  const handleCopyLink = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch {
      alert("Failed to copy link. Please manually copy: " + generatedUrl);
    }
  };

  // Share on WhatsApp
  const handleShareWhatsApp = () => {
    if (!generatedSession || !generatedUrl) return;
    const msg = `॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಸಮಾಲೋಚನೆ ॥\n\nನಮಸ್ಕಾರ ${generatedSession.name} ಅವರೇ,\nನಿಮಗಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ವೈದಿಕ ದೈವಜ್ಞ ಮುಖಾಮುಖಿ ಸಮಾಲೋಚನೆಯ ೨೦ ನಿಮಿಷಗಳ ಖಾಸಗಿ ಲಿಂಕ್ ಸಿದ್ಧವಾಗಿದೆ.\n\nನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ದಶಾ-ಭುಕ್ತಿ, ವೃತ್ತಿ, ವಿವಾಹ ಹಾಗೂ ಪರಿಹಾರಗಳ ಕುರಿತು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಲು ಕೆಳಗಿನ ಲಿಂಕ್ ತೆರೆಯಿರಿ:\n👉 ${generatedUrl}\n\n(ಗಮನಿಸಿ: ನೀವು ಲಿಂಕ್ ತೆರೆದು 'Start' ಕ್ಲಿಕ್ ಮಾಡಿದ ಕೂಡಲೇ ೨೦ ನಿಮಿಷಗಳ ಟೈಮರ್ ಆರಂಭವಾಗುತ್ತದೆ).`;
    const uri = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(uri, "_blank");
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] text-amber-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-2 border-red-500 rounded-3xl p-6 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 border border-red-300 text-red-700 flex items-center justify-center text-3xl">
            🛡️
          </div>
          <h2 className="text-xl font-bold font-serif text-red-900">
            ಅನಧಿಕೃತ ಪ್ರವೇಶ (Super Admin Only)
          </h2>
          <p className="text-xs text-stone-700 leading-relaxed">
            ೨೦ ನಿಮಿಷಗಳ ಸಮಾಲೋಚನೆ ಲಿಂಕ್ ರಚಿಸುವ ಅಧಿಕಾರವು ಕೇವಲ ಸೂಪರ್ ಅಡ್ಮಿನ್‌ಗೆ ಮಾತ್ರ ಲಭ್ಯವಿದೆ.
            (20-Minute consultation link generation is strictly restricted to Super Admin).
          </p>
          <a
            href="/"
            className="inline-block bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 px-5 rounded-xl shadow-md text-xs transition"
          >
            ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ (Go Home)
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-stone-900 p-3 sm:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl">🕉️</span>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-amber-950">
              ॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥
            </h1>
            <span className="text-2xl">🕉️</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold font-serif text-amber-900">
            ೨೦ ನಿಮಿಷಗಳ ಸಮಾಲೋಚನೆ ಲಿಂಕ್ ಜನರೇಟರ್ (Consultation Link Generator)
          </h2>
          <p className="text-xs text-amber-800 mt-1">
            ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ | ಮುಖ್ಯ ಪುರೋಹಿತರು: <strong>{DEFAULT_PRIEST_CONTACT.name}</strong> ({DEFAULT_PRIEST_CONTACT.phone})
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 bg-amber-100/60 p-1.5 rounded-2xl border border-amber-300 max-w-lg mx-auto shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("generator")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "generator"
                ? "bg-amber-700 text-white shadow-md"
                : "text-amber-950 hover:bg-amber-200/70"
            }`}
          >
            <span>🔗</span>
            <span>ಲಿಂಕ್ ರಚನೆ (Generator)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("telemetry")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 relative ${
              activeTab === "telemetry"
                ? "bg-amber-700 text-white shadow-md"
                : "text-amber-950 hover:bg-amber-200/70"
            }`}
          >
            <span>📊</span>
            <span>ಪ್ರಶ್ನೆಗಳು & ರೇಟಿಂಗ್ ({telemetry?.totalQuestions || 0})</span>
            {telemetry && telemetry.totalReviews > 0 && (
              <span className="bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                ★ {telemetry.averageRating}
              </span>
            )}
          </button>
        </div>

        {activeTab === "generator" ? (
          <>
            {/* Generator Form */}
            <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                <span className="text-xl">📝</span>
                <h3 className="font-serif font-bold text-lg text-amber-950">
                  ಭಕ್ತರ ಜನ್ಮ ವಿವರಗಳು & ಭಾಷೆ ಆಯ್ಕೆ (Devotee Profile)
                </h3>
              </div>

          <form onSubmit={handleGenerateLink} className="space-y-4">
            {/* Devotee Name */}
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                ಭಕ್ತರ ಪೂರ್ಣ ಹೆಸರು (Devotee Name) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ಉದಾ: ಪ್ರಮೋದ್ ಕೊಡಗಿ / Pramod Kodagi"
                className="w-full bg-[#FAF6EE] border-2 border-amber-300 focus:border-amber-600 rounded-xl px-3.5 py-2.5 text-sm font-medium text-stone-900 focus:outline-hidden transition"
              />
            </div>

            {/* Date & Time of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1">
                  📅 ಜನ್ಮ ದಿನಾಂಕ (Date of Birth) *
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-[#FAF6EE] border-2 border-amber-300 focus:border-amber-600 rounded-xl px-3.5 py-2.5 text-sm font-medium text-stone-900 focus:outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1">
                  ⏰ ಜನ್ಮ ಸಮಯ (Time of Birth - 24Hr) *
                </label>
                <input
                  type="time"
                  required
                  value={tob}
                  onChange={(e) => setTob(e.target.value)}
                  className="w-full bg-[#FAF6EE] border-2 border-amber-300 focus:border-amber-600 rounded-xl px-3.5 py-2.5 text-sm font-medium text-stone-900 focus:outline-hidden transition"
                />
              </div>
            </div>

            {/* Place of Birth & Pincode */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-amber-950 mb-1">
                    📍 ಜನ್ಮ ಸ್ಥಳ / ಊರು (Place of Birth) *
                  </label>
                  <input
                    type="text"
                    required
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="ಉದಾ: Gokarna, Bengaluru, Sirsi..."
                    className="w-full bg-[#FAF6EE] border-2 border-amber-300 focus:border-amber-600 rounded-xl px-3.5 py-2.5 text-sm font-medium text-stone-900 focus:outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1">
                    📮 ಪಿನ್‌ಕೋಡ್ (Pincode)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => void handlePincodeChange(e.target.value)}
                      placeholder="581326"
                      className="w-full bg-[#FAF6EE] border-2 border-amber-300 focus:border-amber-600 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-stone-900 focus:outline-hidden transition"
                    />
                    {isResolvingPin && (
                      <div className="absolute right-3 top-3 w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Places Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-stone-500">ತ್ವರಿತ ನಗರಗಳು:</span>
                {POPULAR_PLACES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPlace(p.name);
                      setSelectedLat(p.lat);
                      setSelectedLng(p.lng);
                    }}
                    className={`text-[11px] px-2.5 py-0.5 rounded-full border transition ${
                      place === p.name
                        ? "bg-amber-600 text-white border-amber-700 font-bold"
                        : "bg-[#FAF6EE] text-amber-950 border-amber-300 hover:bg-amber-100"
                    }`}
                  >
                    {p.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector (7 Languages Mandatory) */}
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-2">
                🌐 ಸಮಾಲೋಚನೆ ಭಾಷೆ (Consultation Language) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {CONSULTATION_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`p-2.5 rounded-xl border-2 text-center transition flex flex-col items-center justify-center gap-0.5 ${
                      language === lang.code
                        ? "bg-amber-600 text-white border-amber-700 shadow-md font-bold scale-[1.02]"
                        : "bg-[#FAF6EE] hover:bg-amber-50 text-stone-800 border-amber-300"
                    }`}
                  >
                    <span className="text-sm font-bold">{lang.nativeName}</span>
                    <span className={`text-[10px] ${language === lang.code ? "text-amber-100" : "text-stone-500"}`}>
                      {lang.englishName}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                ದೈವಜ್ಞರ ಉತ್ತರವು ಆಯ್ಕೆಮಾಡಿದ ಭಾಷೆಯಲ್ಲಿ ೨-೩ ಪ್ಯಾರಾಗ್ರಾಫ್‌ಗಳು (೫-೬ ಸಾಲುಗಳು) ಮೂಡಿಬರುತ್ತದೆ.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-serif font-bold text-base py-3.5 px-4 rounded-2xl shadow-md transition active:scale-98 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>ಲಿಂಕ್ ರಚಿಸಲಾಗುತ್ತಿದೆ...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>೨೦ ನಿಮಿಷಗಳ ಸಮಾಲೋಚನೆ ಲಿಂಕ್ ರಚಿಸಿ (Generate 20-Min Link)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Generated Link Result Modal / Card */}
        {generatedSession && generatedUrl && (
          <div className="bg-gradient-to-br from-amber-50 to-white border-3 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="font-serif font-black text-lg text-amber-950">
                    ಸಮಾಲೋಚನೆ ಲಿಂಕ್ ಯಶಸ್ವಿಯಾಗಿ ಸಿದ್ಧಗೊಂಡಿದೆ!
                  </h3>
                  <p className="text-xs text-amber-800">
                    20-Minute Consultation Link for {generatedSession.name} ({generatedSession.language.toUpperCase()})
                  </p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-2.5 py-1 rounded-full">
                Active in DB
              </span>
            </div>

            {/* Link & QR Code display */}
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {qrCodeDataUrl && (
                <div className="bg-white border-2 border-amber-300 p-2.5 rounded-2xl shadow-sm shrink-0 text-center">
                  <img
                    src={qrCodeDataUrl}
                    alt="Consultation QR Code"
                    className="w-36 h-36 mx-auto rounded-lg"
                  />
                  <span className="text-[10px] font-bold text-amber-900 block mt-1">
                    Scan on Mobile
                  </span>
                </div>
              )}

              <div className="flex-1 space-y-3 w-full">
                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1">
                    ಖಾಸಗಿ ಸಮಾಲೋಚನೆ URL (Private Devotee Link):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedUrl}
                      className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-800 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-xs transition shrink-0"
                    >
                      {copiedToast ? "✓ ಕಾಪಿ ಆಯಿತು!" : "📋 ಕಾಪಿ"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>💬</span> WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸಿ
                  </button>

                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>🚀</span> ಪುಟ ತೆರೆಯಿರಿ (Open)
                  </a>
                </div>

                <div className="bg-amber-100/70 border border-amber-300 rounded-xl p-2.5 text-[11px] text-amber-950 space-y-1">
                  <p>
                    <strong>⏱️ ೨೦ ನಿಮಿಷಗಳ ನಿಯಮ:</strong> ಭಕ್ತರು ಲಿಂಕ್ ತೆರೆದು "Start Timer" ಕ್ಲಿಕ್ ಮಾಡಿದ ಕೂಡಲೇ ಗಡಿಯಾರ ಶುರುವಾಗುತ್ತದೆ.
                  </p>
                  <p>
                    <strong>🗑️ ೪೦ ನಿಮಿಷಗಳ ಆಟೋ-ಡಿಲೀಟ್:</strong> ಸಮಾಲೋಚನೆ ಮುಗಿದ ೨೦ ನಿಮಿಷಗಳ ನಂತರ ಡೇಟಾಬೇಸ್‌ನಿಂದ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತೆರವುಗೊಳ್ಳುತ್ತದೆ.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Active Sessions Manager */}
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h3 className="font-serif font-bold text-lg text-amber-950">
                ಇತ್ತೀಚಿನ ಸಮಾಲೋಚನೆ ಲಿಂಕ್‌ಗಳು (Active & Recent Sessions)
              </h3>
            </div>
            <button
              onClick={() => void refreshRecentSessions()}
              className="text-xs text-amber-700 hover:text-amber-900 font-bold border border-amber-300 bg-amber-50 px-2.5 py-1 rounded-lg"
            >
              🔄 Refresh
            </button>
          </div>

          {loadingRecents ? (
            <div className="py-6 text-center text-xs text-stone-500">
              ಲೋಡ್ ಆಗುತ್ತಿದೆ...
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="py-6 text-center text-xs text-stone-500">
              ಯಾವುದೇ ಹಿಂದಿನ ಸಮಾಲೋಚನೆ ಲಿಂಕ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ.
            </div>
          ) : (
            <div className="divide-y divide-amber-100">
              {recentSessions.map((item) => {
                const origin = typeof window !== "undefined" ? window.location.origin : "";
                const secureToken = encodeSecureConsultationToken(item.id);
                const link = `${origin}/consultation?id=${secureToken}`;

                let statusBadge = (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Pending Start
                  </span>
                );

                if (item.status === "active") {
                  statusBadge = (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                      ● Active Live
                    </span>
                  );
                } else if (item.status === "expired") {
                  statusBadge = (
                    <span className="bg-red-100 text-red-700 border border-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Expired
                    </span>
                  );
                }

                return (
                  <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-amber-950">{item.name}</span>
                        {statusBadge}
                        <span className="text-[10px] bg-stone-100 border border-stone-300 px-1.5 py-0.5 rounded-sm font-bold uppercase text-stone-700">
                          {item.language}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {item.dob} at {item.tob} ({item.place}) | ರಚನೆ: {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(link);
                          alert("Link copied: " + link);
                        }}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs px-2.5 py-1 rounded-lg font-bold"
                      >
                        📋 Copy Link
                      </button>

                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-2.5 py-1 rounded-lg font-bold"
                      >
                        Open
                      </a>

                      {item.status === "active" && (
                        <button
                          onClick={async () => {
                            if (confirm(`Expire consultation for ${item.name}?`)) {
                              await expireConsultationSession(item.id);
                              void refreshRecentSessions();
                            }
                          }}
                          className="bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-300 text-xs px-2 py-1 rounded-lg font-bold"
                        >
                          Expire
                        </button>
                      )}

                      <button
                        onClick={async () => {
                          if (confirm(`Delete consultation record for ${item.name}?`)) {
                            await deleteConsultationSession(item.id);
                            void refreshRecentSessions();
                          }
                        }}
                        className="text-stone-400 hover:text-red-600 text-xs p-1"
                        title="Delete permanently"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    ) : (
      /* -------------------------------------------------------------
         Super Admin & Priest Telemetry & Devotee Questions Dashboard
         ------------------------------------------------------------- */
      <div className="space-y-6 animate-fadeIn">
        {/* Telemetry Header */}
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-black text-xl text-amber-950 flex items-center gap-2">
              <span>📊</span>
              <span>ಸಮಾಲೋಚನಾ ವಿಶ್ಲೇಷಣೆ & ಪ್ರಶ್ನೆಗಳ ದಾಖಲೆ</span>
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              ಭಕ್ತರ ಪ್ರಶ್ನೆಗಳು, ದೋಷ ಪರಿಹಾರ ಅಂಕಿಅಂಶಗಳು ಮತ್ತು ೫-ಸ್ಟಾರ್ ವಿಮರ್ಶೆಗಳ ಸಮಗ್ರ ವರದಿ
            </p>
          </div>
          <button
            type="button"
            onClick={refreshTelemetry}
            disabled={loadingTelemetry}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
          >
            <span>🔄</span>
            <span>{loadingTelemetry ? "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ..." : "ಲೈವ್ ರಿಫ್ರೆಶ್ (Refresh)"}</span>
          </button>
        </div>

        {/* 4 Summary Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-xs">
            <span className="text-2xl">👥</span>
            <div className="text-2xl font-black text-amber-950 mt-1 font-serif">
              {telemetry?.totalUniqueUsers || 0}
            </div>
            <div className="text-xs font-bold text-amber-900 mt-0.5">
              ಒಟ್ಟು ಭಕ್ತರು (Devotees)
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">
              ಅಪ್ಲಿಕೇಶನ್ ಬಳಸಿದ ಅನನ್ಯ ಭಕ್ತರು
            </div>
          </div>

          <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-xs">
            <span className="text-2xl">💬</span>
            <div className="text-2xl font-black text-amber-950 mt-1 font-serif">
              {telemetry?.totalQuestions || 0}
            </div>
            <div className="text-xs font-bold text-amber-900 mt-0.5">
              ಕೇಳಲಾದ ಒಟ್ಟು ಪ್ರಶ್ನೆಗಳು
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">
              ದೈವಜ್ಞರಿಗೆ ಕೇಳಲಾದ ಪ್ರಶ್ನೆಗಳು
            </div>
          </div>

          <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-xs">
            <span className="text-2xl">⭐</span>
            <div className="text-2xl font-black text-amber-950 mt-1 font-serif flex items-center gap-1">
              <span>{telemetry?.averageRating || 5.0}</span>
              <span className="text-sm text-stone-500 font-normal">/ 5.0</span>
            </div>
            <div className="text-xs font-bold text-amber-900 mt-0.5">
              ಸಂತೃಪ್ತಿ ರೇಟಿಂಗ್ (Satisfaction)
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">
              {telemetry?.totalReviews || 0} ಭಕ್ತರ ವಿಮರ್ಶೆಗಳು
            </div>
          </div>

          <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-xs">
            <span className="text-2xl">⚡</span>
            <div className="text-2xl font-black text-amber-950 mt-1 font-serif">
              {telemetry?.allQuestions.filter((q) => q.hasDosha).length || 0}
            </div>
            <div className="text-xs font-bold text-amber-900 mt-0.5">
              ದೋಷ ಪರಿಹಾರ ಸಮಾಲೋಚನೆಗಳು
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">
              ೪ನೇ ಪ್ಯಾರಾ ಗೋಕರ್ಣ ಪರಿಹಾರ
            </div>
          </div>
        </div>

        {/* Devotee Questions Breakdown */}
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div>
              <h4 className="font-serif font-bold text-lg text-amber-950 flex items-center gap-2">
                <span>📑</span>
                <span>ಭಕ್ತರ ಪ್ರಶ್ನೆಗಳ ವಿವರಣೆ (Questions By Devotee)</span>
              </h4>
              <p className="text-xs text-stone-600">
                ಪ್ರತಿ ಭಕ್ತರು ಕೇಳಿದ ಪ್ರಶ್ನೆಗಳು ಮತ್ತು ಜಾತಕ ದೋಷಗಳ ಲಾಗ್
              </p>
            </div>

            {/* Devotee Search Filter */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchDevoteeQuery}
                onChange={(e) => setSearchDevoteeQuery(e.target.value)}
                placeholder="ಭಕ್ತರ ಹೆಸರು ಅಥವಾ ಮೊಬೈಲ್..."
                className="w-full bg-[#FAF6EE] border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600"
              />
            </div>
          </div>

          {loadingTelemetry ? (
            <div className="py-8 text-center text-xs text-stone-500">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-2" />
              <span>ವಿಶ್ಲೇಷಣಾ ದತ್ತಾಂಶ ಲೋಡ್ ಆಗುತ್ತಿದೆ...</span>
            </div>
          ) : !telemetry || telemetry.questionsByDevotee.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500 font-serif">
              ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳು ದಾಖಲಾಗಿಲ್ಲ. ಭಕ್ತರು ಸಮಾಲೋಚನಾ ಲಿಂಕ್ ತೆರೆದು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿದ ಕೂಡಲೇ ಇಲ್ಲಿ ನೈಜ-ಸಮಯದಲ್ಲಿ ದಾಖಲಾಗುತ್ತದೆ.
            </div>
          ) : (
            <div className="space-y-3">
              {telemetry.questionsByDevotee
                .filter((g) => {
                  if (!searchDevoteeQuery.trim()) return true;
                  const query = searchDevoteeQuery.toLowerCase();
                  return (
                    g.userName.toLowerCase().includes(query) ||
                    g.userPhone.includes(query) ||
                    g.userEmail.toLowerCase().includes(query) ||
                    g.questions.some((q) => q.question.toLowerCase().includes(query))
                  );
                })
                .map((group) => {
                  const isExpanded = expandedDevoteeId === group.userId;
                  return (
                    <div
                      key={group.userId}
                      className="border-2 border-amber-200 rounded-2xl overflow-hidden bg-amber-50/40 transition shadow-2xs"
                    >
                      {/* Devotee Card Header */}
                      <div
                        onClick={() =>
                          setExpandedDevoteeId(isExpanded ? null : group.userId)
                        }
                        className="p-3.5 sm:p-4 bg-white flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-50/80 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold font-serif text-sm">
                            {group.userName.charAt(0) || "🕉️"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-amber-950 text-sm font-serif">
                                {group.userName}
                              </h5>
                              <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                                {group.totalQuestions} ಪ್ರಶ್ನೆಗಳು (Questions)
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {group.userPhone && `📞 ${group.userPhone}`}
                              {group.userEmail && ` | ✉️ ${group.userEmail}`}
                              {` | ಕೊನೆಯ ಸಕ್ರಿಯ: ${new Date(group.lastActive).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-800">
                            {isExpanded ? "ಮುಚ್ಚಿ ▲" : "ಪ್ರಶ್ನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ ▼"}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Question Log */}
                      {isExpanded && (
                        <div className="p-4 border-t border-amber-200 bg-[#FAF6EE] space-y-3">
                          {group.questions.length === 0 ? (
                            <p className="text-xs text-stone-500 italic">
                              ಈ ಭಕ್ತರು ಇನ್ನೂ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿಲ್ಲ (ಸಮಾಲೋಚನೆ ಆರಂಭಗೊಂಡಿದೆ).
                            </p>
                          ) : (
                            group.questions.map((q, qIdx) => (
                              <div
                                key={q.id || qIdx}
                                className="bg-white border border-amber-300 rounded-xl p-3.5 space-y-2 shadow-2xs"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-amber-900">
                                      #{qIdx + 1}
                                    </span>
                                    <span className="text-xs font-bold text-amber-950 font-serif">
                                      ಪ್ರಶ್ನೆ: &quot;{q.question}&quot;
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-stone-400 whitespace-nowrap">
                                    {new Date(q.timestamp).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </span>
                                </div>

                                {/* Astrologer Answer Preview */}
                                <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 text-xs text-stone-800 font-serif leading-relaxed">
                                  <span className="font-bold text-amber-900 block text-[11px] mb-1">
                                    ದೈವಜ್ಞರ ಉತ್ತರ ಸಾರಾಂಶ:
                                  </span>
                                  <p>{q.answerSnippet}</p>
                                </div>

                                {/* Dosha Tag if active */}
                                {q.hasDosha && (
                                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                                    <span className="bg-orange-100 text-orange-900 font-bold px-2 py-0.5 rounded-md border border-orange-300">
                                      ⚡ ದೋಷ: {q.doshaName || "ಜಾತಕ ದೋಷ ಪತ್ತೆಯಾಗಿದೆ"}
                                    </span>
                                    {q.doshaParihara && (
                                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                                        🙏 ಪರಿಹಾರ: {q.doshaParihara}
                                      </span>
                                    )}
                                    <span className="text-stone-500 font-medium">
                                      (೪ನೇ ಪ್ಯಾರಾದಲ್ಲಿ ಗೋಕರ್ಣ ಪರಿಹಾರ & ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಕರೆ ಒದಗಿಸಲಾಗಿದೆ)
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Devotee Reviews & Feedback Card */}
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div>
              <h4 className="font-serif font-bold text-lg text-amber-950 flex items-center gap-2">
                <span>🌟</span>
                <span>ಭಕ್ತರ ೫-ಸ್ಟಾರ್ ರೇಟಿಂಗ್ & ವಿಮರ್ಶೆಗಳು (Devotee Reviews)</span>
              </h4>
              <p className="text-xs text-stone-600">
                ೨೦ ನಿಮಿಷಗಳ ಸಮಾಲೋಚನೆ ಮುಕ್ತಾಯದ ನಂತರ ಭಕ್ತರು ನೀಡಿದ ಅಭಿಪ್ರಾಯಗಳು
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-serif text-amber-950">
                ★ {telemetry?.averageRating || 5.0}
              </span>
              <span className="text-xs text-stone-500 block">
                ({telemetry?.totalReviews || 0} ಒಟ್ಟು ವಿಮರ್ಶೆಗಳು)
              </span>
            </div>
          </div>

          {!telemetry || telemetry.allReviews.length === 0 ? (
            <div className="py-6 text-center text-xs text-stone-500 font-serif">
              ಇನ್ನೂ ಯಾವುದೇ ವಿಮರ್ಶೆಗಳು ಸಲ್ಲಿಕೆಯಾಗಿಲ್ಲ. ಭಕ್ತರು ಸಮಾಲೋಚನೆ ಮುಗಿದ ನಂತರ ನೀಡುವ ರೇಟಿಂಗ್ ಇಲ್ಲಿ ಸಂಗ್ರಹವಾಗುತ್ತದೆ.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {telemetry.allReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-amber-50/60 border border-amber-300 rounded-2xl p-4 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500 text-base">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                      {Array.from({ length: Math.max(0, 5 - rev.rating) }).map((_, i) => (
                        <span key={i} className="text-stone-300">
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-stone-400">
                      {new Date(rev.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  {rev.feedbackText ? (
                    <p className="text-xs text-stone-800 font-serif italic leading-relaxed">
                      &quot;{rev.feedbackText}&quot;
                    </p>
                  ) : (
                    <p className="text-xs text-stone-400 italic">
                      (ಅಭಿಪ್ರಾಯ ನಮೂದಿಸಿಲ್ಲ - ಕೇವಲ ರೇಟಿಂಗ್ ನೀಡಲಾಗಿದೆ)
                    </p>
                  )}

                  <div className="border-t border-amber-200/80 pt-2 flex items-center justify-between text-[11px] text-amber-900">
                    <span className="font-bold">{rev.userName}</span>
                    <span className="text-stone-500">{rev.userPhone || "ಭಕ್ತರು"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
      </div>
    </div>
  );
};

export default ConsultationGeneratorPage;
