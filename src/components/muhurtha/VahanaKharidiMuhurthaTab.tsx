import React, { useState } from "react";
import {
  calculateVahanaKharidiMuhurtha,
  type VahanaMuhurthaReport,
  type VahanaDayResult
} from "../../features/muhurtha/vahanaMuhurthaEngine";
import { RASHI_L5, NAKSHATRA_L5 } from "../../features/seva/sevaLocale";
import { SpeechRecognitionSession } from "../../utils/speechRecognitionHelper";
import { CoinDeductionModal } from "../wallet/CoinDeductionModal";
import { SERVICE_COIN_COSTS } from "../../features/wallet/walletTypes";
import { usePricingConfigStore } from "../../features/wallet/pricingConfigStore";
import { useWalletStore } from "../../features/wallet/walletStore";
import { VahanaMuhurthaLoader } from "../loaders/VahanaMuhurthaLoader";

export interface VahanaKharidiMuhurthaTabProps {
  onDeductCoins?: (cost: number, reason: string, devoteeName: string) => Promise<{ success: boolean; error?: string }>;
  currentUser?: string;
  defaultPriestName?: string;
}

const MONTH_OPTIONS = [
  { value: 1, label: "ಜನವರಿ (January)" },
  { value: 2, label: "ಫೆಬ್ರವರಿ (February)" },
  { value: 3, label: "ಮಾರ್ಚ್ (March)" },
  { value: 4, label: "ಏಪ್ರಿಲ್ (April)" },
  { value: 5, label: "ಮೇ (May)" },
  { value: 6, label: "ಜೂನ್ (June)" },
  { value: 7, label: "ಜುಲೈ (July)" },
  { value: 8, label: "ಆಗಸ್ಟ್ (August)" },
  { value: 9, label: "ಸೆಪ್ಟೆಂಬರ್ (September)" },
  { value: 10, label: "ಅಕ್ಟೋಬರ್ (October)" },
  { value: 11, label: "ನವೆಂಬರ್ (November)" },
  { value: 12, label: "ಡಿಸೆಂಬರ್ (December)" }
];

export const VahanaKharidiMuhurthaTab: React.FC<VahanaKharidiMuhurthaTabProps> = ({
  onDeductCoins,
  defaultPriestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
}) => {
  const deductForService = useWalletStore((s) => s.deductForService);
  const wallet = useWalletStore((s) => s.wallet);

  const now = new Date();
  const [devoteeName, setDevoteeName] = useState("");
  const [rashiIndex, setRashiIndex] = useState<number>(0);
  const [nakshatraIndex, setNakshatraIndex] = useState<number>(0);
  const [targetMonth, setTargetMonth] = useState<number>(now.getMonth() + 1);
  const [targetYear, setTargetYear] = useState<number>(now.getFullYear());
  const [report, setReport] = useState<VahanaMuhurthaReport | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const cost = usePricingConfigStore((s) => s.getCoins("VAHANA_MUHURTHA", 500));

  const handleVoiceInput = () => {
    const session = new SpeechRecognitionSession("kn-IN");
    if (!session.isAvailable()) {
      return;
    }
    setIsListening(true);
    session.startListening(
      (transcript: string) => {
        setDevoteeName(transcript);
        setIsListening(false);
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );
  };

  const handleCalculateClick = () => {
    // Open Confirmation Modal first
    setIsConfirmOpen(true);
  };

  const executeCalculation = async () => {
    setIsCalculating(true);
    setFeedback(null);

    const doDeduct = onDeductCoins || deductForService;
    const deductRes = await doDeduct(cost, "ವಾಹನ ಖರೀದಿ ಶುಭ ಮುಹೂರ್ತ ಗಣನೆ", devoteeName || "ಭಕ್ತರು");

    if (!deductRes.success) {
      setFeedback({ type: "error", text: deductRes.error || "ನಾಣ್ಯ ಕಡಿತ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ವಾಲೆಟ್ ರೀಚಾರ್ಜ್ ಮಾಡಿ." });
      setIsCalculating(false);
      return;
    }

    try {
      const rep = calculateVahanaKharidiMuhurtha({
        personName: devoteeName || "ಭಕ್ತರು",
        rashiIndex,
        nakshatraIndex,
        year: targetYear,
        month: targetMonth,
        lang: "kn"
      });

      setReport(rep);
      setFeedback({
        type: "success",
        text: `✓ ${rep.devoteeName} ಅವರ ${rep.targetMonthLabelKn} ತಿಂಗಳ ವಾಹನ ಖರೀದಿ ಶುಭ ಮುಹೂರ್ತಗಳು ಸಿದ್ಧವಾಗಿವೆ! (500 ನಾಣ್ಯಗಳು ಕಡಿತಗೊಂಡಿವೆ)`
      });
    } catch (err: any) {
      console.error("Vahana Muhurtha error:", err);
      setFeedback({ type: "error", text: "ಮುಹೂರ್ತ ಗಣನೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಉಂಟಾಗಿದೆ." });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!report) return;
    const topDaysText = report.topRecommendedDays
      .slice(0, 5)
      .map(
        (d, i) =>
          `*${i + 1}. ${d.dayFormatted} (${d.weekdayKn})* [⭐ ${d.suitabilityScore}%]\n` +
          `   • ನಕ್ಷತ್ರ: ${d.nakshatraKn} | ${d.taraNameKn}\n` +
          `   • ಚಂದ್ರ ಬಲ: ${d.chandraNameKn}\n` +
          `   • ಶುಭ ಸಮಯ: ${d.auspiciousTimeWindowKn}\n` +
          `   • ರಾಹು ಕಾಲ (ವರ್ಜ್ಯ): ${d.rahuKaala}`
      )
      .join("\n\n");

    const message = encodeURIComponent(
      `🚗 *ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ · ವಾಹನ ಖರೀದಿ ಶುಭ ಮುಹೂರ್ತ ವರದಿ*\n\n` +
      `👤 *ಭಕ್ತರ ಹೆಸರು:* ${report.devoteeName}\n` +
      `♈ *ರಾಶಿ:* ${report.devoteeRashiKn} | 🌟 *ನಕ್ಷತ್ರ:* ${report.devoteeNakshatraKn}\n` +
      `📅 *ಆಯ್ಕೆಮಾಡಿದ ತಿಂಗಳು:* ${report.targetMonthLabelKn}\n\n` +
      `🏆 *ಶ್ರೇಷ್ಠ ವಾಹನ ಖರೀದಿ ಶುಭ ದಿನಗಳು (Top Recommended Days):*\n\n${topDaysText}\n\n` +
      `📜 *ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಮಾರ್ಗದರ್ಶನ:*\n${report.priestGoldenAdviceKn}\n\n` +
      `🕉️ *ವಾಹನ ರಕ್ಷಾ ಮಂತ್ರ:*\n${report.sacredVahanaMantraKn}\n\n` +
      `॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ · ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ॥`
    );

    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Coin Deduction Modal */}
      <CoinDeductionModal
        isOpen={isConfirmOpen}
        serviceTitle="Vehicle Purchase Auspicious Days (Vahana Muhurtha)"
        serviceTitleKannada="ವಾಹನ ಖರೀದಿ ಶುಭ ಮುಹೂರ್ತ ಗಣನೆ"
        costCoins={cost}
        inrEquivalent={50}
        icon="🚗"
        devoteeName={devoteeName || "ಭಕ್ತರು"}
        description={`ರಾಶಿ (${RASHI_L5[rashiIndex]?.kn || ""}) ಮತ್ತು ನಕ್ಷತ್ರ (${NAKSHATRA_L5[nakshatraIndex]?.kn || ""}) ಆಧಾರದ ಮೇಲೆ ತಿಂಗಳ ಅತ್ಯುತ್ತಮ ವಾಹನ ಖರೀದಿ ದಿನಗಳನ್ನು ತಾರಾಬಲ-ಚಂದ್ರಬಲ ಸಮೇತ ಗಣನೆ ಮಾಡಲಾಗುತ್ತದೆ.`}
        onConfirm={executeCalculation}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {/* Header Banner */}
      <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-r from-amber-500/15 via-amber-100/70 to-orange-500/15 p-5 sm:p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-2xl shadow-md border border-amber-300">
              🚗
            </div>
            <div>
              <div className="text-[10px] font-black text-amber-900 uppercase tracking-widest">
                ॥ ವೈದಿಕ ಮುಹೂರ್ತ ಶಾಸ್ತ್ರ • VEDIC VEHICLE MUHURTHA ॥
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-950">
                ವಾಹನ ಖರೀದಿ ಶುಭ ಮುಹೂರ್ತ (Vehicle Purchase Good Days)
              </h2>
              <p className="text-xs text-amber-900 font-semibold mt-0.5">
                ಶ್ರೀ {devoteeName || "ಭಕ್ತರ"} ಜನ್ಮ ರಾಶಿ & ನಕ್ಷತ್ರಾನುಸಾರ ಅತ್ಯುತ್ತಮ ದಿನಗಳು (🪙 {cost} Coins / ₹{Math.round(cost / 10)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-200/80 border border-amber-400 text-amber-950 font-black text-xs">
              🪙 {cost} Coins
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : "bg-red-50 border-red-300 text-red-950"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700 ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Form Inputs Card */}
      <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
        <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider border-b border-amber-200 pb-2">
          ೧. ಭಕ್ತರ ವಿವರ & ಜನ್ಮ ರಾಶಿ-ನಕ್ಷತ್ರ ಆಯ್ಕೆ (Devotee Birth Details)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Devotee Name with Mic */}
          <div>
            <label className="block text-[11px] font-bold text-amber-950 mb-1">
              ಭಕ್ತರ ಹೆಸರು (Devotee Name):
            </label>
            <div className="relative">
              <input
                type="text"
                value={devoteeName}
                onChange={(e) => setDevoteeName(e.target.value)}
                placeholder="ಉದಾ: ರಮೇಶ್ ಹೆಗಡೆ"
                className="w-full pl-3.5 pr-9 py-2.5 bg-white border border-amber-300 rounded-xl text-slate-900 text-xs font-bold focus:border-amber-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-2 top-2 p-1 text-sm rounded-lg ${
                  isListening ? "bg-red-500 text-white animate-pulse" : "text-amber-800 hover:bg-amber-100"
                }`}
                title="ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಿ"
              >
                🎤
              </button>
            </div>
          </div>

          {/* Devotee Rashi */}
          <div>
            <label className="block text-[11px] font-bold text-amber-950 mb-1">
              ಚಂದ್ರ ರಾಶಿ (Janma Rashi): *
            </label>
            <select
              value={rashiIndex}
              onChange={(e) => setRashiIndex(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-slate-900 text-xs font-bold focus:border-amber-600 focus:outline-none"
            >
              {RASHI_L5.map((rItem, idx) => (
                <option key={idx} value={idx}>
                  {idx + 1}. {rItem.kn} ({rItem.en})
                </option>
              ))}
            </select>
          </div>

          {/* Devotee Nakshatra */}
          <div>
            <label className="block text-[11px] font-bold text-amber-950 mb-1">
              ಜನ್ಮ ನಕ್ಷತ್ರ (Janma Nakshatra): *
            </label>
            <select
              value={nakshatraIndex}
              onChange={(e) => setNakshatraIndex(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-slate-900 text-xs font-bold focus:border-amber-600 focus:outline-none"
            >
              {NAKSHATRA_L5.map((nItem, idx) => (
                <option key={idx} value={idx}>
                  {idx + 1}. {nItem.kn} ({nItem.en})
                </option>
              ))}
            </select>
          </div>

          {/* Target Month & Year */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-amber-950 mb-1">
                ತಿಂಗಳು (Month):
              </label>
              <select
                value={targetMonth}
                onChange={(e) => setTargetMonth(Number(e.target.value))}
                className="w-full px-2 py-2.5 bg-white border border-amber-300 rounded-xl text-slate-900 text-xs font-bold focus:border-amber-600 focus:outline-none"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label.split(" ")[0]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-950 mb-1">
                ವರ್ಷ (Year):
              </label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="w-full px-2 py-2.5 bg-white border border-amber-300 rounded-xl text-slate-900 text-xs font-bold focus:border-amber-600 focus:outline-none"
              >
                {[2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleCalculateClick}
            disabled={isCalculating}
            className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 border border-amber-400 active:scale-95 disabled:opacity-50"
          >
            <span>🚗</span>
            <span>
              {isCalculating
                ? "ಮುಹೂರ್ತ ಗಣನೆ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ..."
                : `ವಾಹನ ಖರೀದಿ ಶುಭ ದಿನಗಳನ್ನು ಗಣನೆ ಮಾಡಿ (Calculate Good Days) • 🪙 500 Coins`}
            </span>
          </button>
        </div>
      </div>

      {/* Results Display */}
      {report && (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
          {/* Top Banner with Devotee Info & WhatsApp Share */}
          <div className="rounded-3xl border-2 border-emerald-400 bg-[#F4FDF7] p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-800 font-extrabold text-sm">✓ ಮುಹೂರ್ತ ಗಣನೆ ಪೂರ್ಣಗೊಂಡಿದೆ:</span>
                <span className="text-base font-black text-amber-950">{report.devoteeName}</span>
              </div>
              <p className="text-xs text-emerald-900 mt-1">
                ರಾಶಿ: <strong>{report.devoteeRashiKn}</strong> | ನಕ್ಷತ್ರ: <strong>{report.devoteeNakshatraKn}</strong> | ಅವಧಿ: <strong>{report.targetMonthLabelKn}</strong> ({report.topRecommendedDays.length} ಶುಭ ದಿನಗಳು ಲಭ್ಯ)
              </p>
            </div>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>📲</span>
              <span>WhatsApp ನಲ್ಲಿ ಭಕ್ತರಿಗೆ ವರದಿ ಕಳುಹಿಸಿ (Share on WhatsApp)</span>
            </button>
          </div>

          {/* Top 5 Recommended Days Highlight Cards */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-amber-950 flex items-center gap-2">
              <span>🏆</span>
              <span>ಅತ್ಯುನ್ನತ ವಾಹನ ಖರೀದಿ & ಡೆಲಿವರಿ ಶುಭ ದಿನಗಳು (Top Recommended Days)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.topRecommendedDays.slice(0, 6).map((day, idx) => (
                <div
                  key={day.date}
                  className="bg-[#FFFDF7] border-2 border-amber-400 rounded-3xl p-5 shadow-md hover:border-amber-600 transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                      ⭐ {day.suitabilityScore}% ಬಲ
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-amber-800 uppercase">
                      ಆದ್ಯತೆ #{idx + 1} • {day.ratingLabelKn}
                    </div>

                    <div className="text-lg font-black text-amber-950 leading-tight">
                      {day.dayFormatted}
                    </div>

                    <div className="text-xs font-bold text-amber-900 bg-amber-100/60 px-2.5 py-1 rounded-xl inline-block border border-amber-200">
                      📅 {day.weekdayKn} • {day.tithiKn}
                    </div>

                    <div className="space-y-1.5 text-xs pt-1 border-t border-amber-200 text-slate-800">
                      <div>
                        <span className="font-bold text-amber-950">🌟 ನಕ್ಷತ್ರ:</span> {day.nakshatraKn}
                      </div>
                      <div>
                        <span className="font-bold text-emerald-800">🔮 ತಾರಾ ಬಲ:</span> {day.taraNameKn}
                      </div>
                      <div>
                        <span className="font-bold text-indigo-800">🌙 ಚಂದ್ರ ಬಲ:</span> {day.chandraNameKn}
                      </div>
                      <div>
                        <span className="font-bold text-amber-950">⏰ ಡೆಲಿವರಿ ಶುಭ ಕಾಲ:</span>{" "}
                        <strong className="text-emerald-900">{day.auspiciousTimeWindowKn}</strong>
                      </div>
                      <div className="text-[11px] text-red-700 font-semibold">
                        <span>⚠️ ರಾಹು ಕಾಲ (ವರ್ಜ್ಯ): {day.rahuKaala}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-amber-200 text-[10px] text-amber-900 bg-amber-50/70 p-2 rounded-xl">
                    <span>💡 {day.vahanaPujaGuidelineKn}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priest Benediction & Sacred Mantra Card */}
          <div className="bg-gradient-to-r from-amber-100 via-[#FFF9E6] to-orange-100 border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-md space-y-3">
            <div className="text-xs font-black text-amber-950 flex items-center gap-2">
              <span>🔱</span>
              <span>ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ವಾಹನ ರಕ್ಷಾ ನಿಯಮಗಳು</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-serif italic bg-white/80 p-3.5 rounded-2xl border border-amber-300">
              {report.priestGoldenAdviceKn}
            </p>
            <div className="text-center p-3 bg-amber-950 text-amber-100 rounded-2xl font-bold text-xs sm:text-sm shadow-inner">
              {report.sacredVahanaMantraKn}
            </div>
          </div>

          {/* Complete Month Table */}
          <div className="bg-[#FFFDF7] border-2 border-amber-300 rounded-3xl p-5 shadow-md space-y-3">
            <h4 className="text-xs font-black text-amber-950 flex items-center gap-2">
              <span>📅</span>
              <span>{report.targetMonthLabelKn} ತಿಂಗಳ ಸಂಪೂರ್ಣ ದಿನಗಳ ತಾರಾಬಲ & ಚಂದ್ರಬಲ ವಿವರಣೆ (All {report.totalDaysEvaluated} Days)</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-100/80 text-amber-950 border-b border-amber-300">
                    <th className="py-2.5 px-3 font-black">ದಿನಾಂಕ</th>
                    <th className="py-2.5 px-3 font-black">ವಾರ & ತಿಥಿ</th>
                    <th className="py-2.5 px-3 font-black">ನಕ್ಷತ್ರ</th>
                    <th className="py-2.5 px-3 font-black">ತಾರಾ ಬಲ</th>
                    <th className="py-2.5 px-3 font-black">ಚಂದ್ರ ಬಲ</th>
                    <th className="py-2.5 px-3 font-black">ಶುಭ ಸಮಯ</th>
                    <th className="py-2.5 px-3 font-black text-right">ಸ್ಥಿತಿ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200/60">
                  {report.allMonthDays.map((d) => (
                    <tr
                      key={d.date}
                      className={`hover:bg-amber-50/60 transition ${
                        d.isRecommended ? "bg-emerald-50/30 font-semibold" : d.isChandrashtama ? "bg-red-50/40 text-slate-500" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-amber-950">{d.dayFormatted}</td>
                      <td className="py-2.5 px-3 text-slate-700">{d.weekdayKn} ({d.tithiKn})</td>
                      <td className="py-2.5 px-3 text-slate-700">{d.nakshatraKn}</td>
                      <td className="py-2.5 px-3 text-slate-800">{d.taraNameKn}</td>
                      <td className="py-2.5 px-3 text-slate-800">{d.chandraNameKn}</td>
                      <td className="py-2.5 px-3 text-emerald-900 font-bold">{d.auspiciousTimeWindowKn}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            d.suitabilityRating === "EXCELLENT"
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                              : d.suitabilityRating === "VERY_GOOD"
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : d.suitabilityRating === "GOOD"
                              ? "bg-blue-100 text-blue-900 border-blue-300"
                              : "bg-slate-100 text-slate-600 border-slate-300"
                          }`}
                        >
                          {d.suitabilityScore}% {d.isRecommended ? "✓ ಶುಭ" : "ವರ್ಜ್ಯ"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 🪔 Full-Page Blocking Dedicated Themed Vedic Loader */}
      {isCalculating && (
        <VahanaMuhurthaLoader
          isKn={true}
          title="✨ ವಾಹನ ಖರೀದಿ ಶುಭ ಮುಹೂರ್ತ ಶೋಧನೆ..."
          message={`ಶ್ರೀ ${devoteeName || "ಭಕ್ತರ"} ನಕ್ಷತ್ರ ಹಾಗೂ ರಾಶಿ ಅನುಗುಣವಾಗಿ ಶ್ರೇಷ್ಠ ಅಮೃತ ಸಿದ್ಧಿ ಮುಹೂರ್ತಗಳ ಗಣನೆ ನಡೆಯುತ್ತಿದೆ...`}
        />
      )}
    </div>
  );
};
