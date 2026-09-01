import React, { useState, useEffect } from "react";
import {
  getSarvamQuotaTelemetry,
  updateSarvamTotalQuota,
  recordSarvamAudioUsage,
  type SarvamQuotaTelemetry
} from "../../features/audio/sarvamQuotaService";

export interface SarvamAiUsageGridProps {
  className?: string;
}

export const SarvamAiUsageGrid: React.FC<SarvamAiUsageGridProps> = ({ className = "" }) => {
  const [telemetry, setTelemetry] = useState<SarvamQuotaTelemetry>({
    totalQuota: 500000,
    consumed: 0,
    remaining: 500000,
    remainingPercentage: 100,
    totalCalls: 0,
    status: "healthy"
  });

  const [loading, setLoading] = useState(true);
  const [isEditingQuota, setIsEditingQuota] = useState(false);
  const [newQuotaInput, setNewQuotaInput] = useState<string>("");
  const [actionNotice, setActionNotice] = useState<string>("");

  const refreshTelemetry = async () => {
    setLoading(true);
    try {
      const data = await getSarvamQuotaTelemetry();
      setTelemetry(data);
    } catch (err) {
      console.warn("[SarvamAiUsageGrid] Telemetry refresh warning:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshTelemetry();
  }, []);

  const handleUpdateQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(newQuotaInput.replace(/[^\d]/g, ""), 10);
    if (isNaN(parsed) || parsed < 1000) {
      setActionNotice("⚠️ ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ೧,೦೦೦ ಅಕ್ಷರಗಳ ಮಾನ್ಯ ಕೋಟಾ ನಮೂದಿಸಿ.");
      return;
    }

    try {
      const updated = await updateSarvamTotalQuota(parsed);
      setTelemetry(updated);
      setIsEditingQuota(false);
      setNewQuotaInput("");
      setActionNotice(`✅ ಒಟ್ಟು ಕೋಟಾ ${parsed.toLocaleString()} ಅಕ್ಷರಗಳಿಗೆ ನವೀಕರಿಸಲಾಗಿದೆ!`);
      setTimeout(() => setActionNotice(""), 3000);
    } catch {
      setActionNotice("❌ ಕೋಟಾ ನವೀಕರಣ ವಿಫಲವಾಗಿದೆ.");
    }
  };

  const handleSimulateUsage = async () => {
    try {
      const updated = await recordSarvamAudioUsage(500, "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ಪೂಜಾ ಸಂಕಲ್ಪ");
      setTelemetry(updated);
      setActionNotice("✨ ೫೦೦ ಅಕ್ಷರಗಳ ಧ್ವನಿ ಬಳಕೆ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ!");
      setTimeout(() => setActionNotice(""), 3000);
    } catch {
      setActionNotice("❌ ಬಳಕೆ ದಾಖಲಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ.");
    }
  };

  const isCritical = telemetry.remainingPercentage <= 10;
  const isWarning = !isCritical && telemetry.remainingPercentage <= 25;

  const barColor = isCritical
    ? "bg-gradient-to-r from-red-600 to-rose-500"
    : isWarning
    ? "bg-gradient-to-r from-amber-500 to-yellow-400"
    : "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400";

  const statusBadge = isCritical
    ? { text: "🚨 ಅತಿ ತುರ್ತು (<10% CRITICAL)", bg: "bg-red-950/80 border-red-500 text-red-200" }
    : isWarning
    ? { text: "⚠️ ಎಚ್ಚರಿಕೆ (<25% WARNING)", bg: "bg-amber-950/80 border-amber-500 text-amber-200" }
    : { text: "🟢 ಸಾಮಾನ್ಯ (HEALTHY)", bg: "bg-emerald-950/80 border-emerald-500 text-emerald-200" };

  return (
    <div
      className={`rounded-3xl border ${
        isCritical
          ? "border-red-500/80 shadow-2xl shadow-red-500/20 animate-pulse-border"
          : "border-amber-500/40 shadow-xl"
      } bg-gradient-to-br from-slate-950 via-neutral-900 to-amber-950/40 p-6 md:p-8 text-white ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-amber-500/20 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-950/60 text-2xl shadow-inner">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg md:text-xl font-black text-amber-100">
                Sarvam AI Voice Quota Sentinel
              </h3>
              <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-300">
                Bulbul:v1
              </span>
            </div>
            <p className="text-xs text-amber-200/70">
              ಭಾರತೀಯ ಧ್ವನಿ ಕ್ಲೋನಿಂಗ್ ಮತ್ತು ಮಂತ್ರ ಪಠಣ ಕೋಟಾ ನಿರ್ವಹಣಾ ಗ್ರಿಡ್
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black tracking-wide ${statusBadge.bg}`}>
            {statusBadge.text}
          </span>
          <button
            type="button"
            onClick={() => void refreshTelemetry()}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/30 bg-amber-900/40 text-amber-300 hover:bg-amber-800 transition"
            title="Refresh Metrics"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Critical 10% Alert Banner */}
      {isCritical && (
        <div className="mt-5 rounded-2xl border-2 border-red-500 bg-red-950/90 p-4 text-xs font-bold text-red-100 shadow-lg flex items-start gap-3">
          <span className="text-xl">🚨</span>
          <div>
            <div className="text-sm font-black text-red-200">
              ತುರ್ತು ಎಚ್ಚರಿಕೆ: ಉಳಿದ ಕೋಟಾ ೧೦% ಕ್ಕಿಂತ ಕಡಿಮೆಯಾಗಿದೆ ({telemetry.remainingPercentage.toFixed(1)}%)!
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-red-300">
              ತಕ್ಷಣವೇ <a href="https://dashboard.sarvam.ai" target="_blank" rel="noreferrer" className="underline text-yellow-300 font-bold">dashboard.sarvam.ai</a> ಗೆ ಲಾಗಿನ್ ಆಗಿ ಕ್ರೆಡಿಟ್ ರೀಚಾರ್ಜ್ ಮಾಡಿ. Super Admin ಇಮೇಲ್‌ಗೆ ತುರ್ತು ಸಂದೇಶ ರವಾನಿಸಲಾಗಿದೆ.
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar & Percentage Metric */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-amber-200/80">ಉಳಿದ ಕೋಟಾ ಪ್ರಮಾಣ (Remaining Balance)</span>
          <span className={`text-base font-black ${isCritical ? "text-red-400" : isWarning ? "text-yellow-300" : "text-emerald-400"}`}>
            {telemetry.remainingPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-neutral-800/80 p-0.5 border border-amber-500/20">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.max(1, Math.min(100, telemetry.remainingPercentage))}%` }}
          />
        </div>
      </div>

      {/* 4-Column Statistics Grid */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-amber-500/30 bg-black/40 p-3.5">
          <span className="block text-[10px] uppercase font-bold text-amber-400/70">ಒಟ್ಟು ಕೋಟಾ (Total)</span>
          <span className="mt-1 block text-lg font-black text-amber-100">
            {telemetry.totalQuota.toLocaleString()}
          </span>
          <span className="block text-[10px] text-amber-200/50">ಅಕ್ಷರಗಳು (Characters)</span>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-black/40 p-3.5">
          <span className="block text-[10px] uppercase font-bold text-amber-400/70">ಬಳಸಲಾಗಿದೆ (Consumed)</span>
          <span className="mt-1 block text-lg font-black text-amber-300">
            {telemetry.consumed.toLocaleString()}
          </span>
          <span className="block text-[10px] text-amber-200/50">
            ({((telemetry.consumed / (telemetry.totalQuota || 1)) * 100).toFixed(1)}%)
          </span>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-black/40 p-3.5">
          <span className="block text-[10px] uppercase font-bold text-amber-400/70">ಉಳಿದಿದೆ (Remaining)</span>
          <span className={`mt-1 block text-lg font-black ${isCritical ? "text-red-400" : isWarning ? "text-yellow-300" : "text-emerald-400"}`}>
            {telemetry.remaining.toLocaleString()}
          </span>
          <span className="block text-[10px] text-amber-200/50">
            ({telemetry.remainingPercentage.toFixed(1)}%)
          </span>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-black/40 p-3.5">
          <span className="block text-[10px] uppercase font-bold text-amber-400/70">ಧ್ವನಿ ವಿನಂತಿಗಳು (TTS)</span>
          <span className="mt-1 block text-lg font-black text-amber-100">
            {telemetry.totalCalls.toLocaleString()}
          </span>
          <span className="block text-[10px] text-amber-200/50">ಒಟ್ಟು ಕರೆಗಳು</span>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-900/40 p-3 text-xs font-bold text-amber-200 text-center animate-fade-in">
          {actionNotice}
        </div>
      )}

      {/* Action Buttons & Quota Customizer */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-amber-500/20 pt-5">
        <div className="flex items-center gap-2">
          {!isEditingQuota ? (
            <button
              type="button"
              onClick={() => {
                setNewQuotaInput(telemetry.totalQuota.toString());
                setIsEditingQuota(true);
              }}
              className="rounded-xl border border-amber-400/50 bg-amber-950/60 px-4 py-2 text-xs font-bold text-amber-200 hover:bg-amber-900 transition"
            >
              ⚙️ ಕೋಟಾ ಮಿತಿ ಬದಲಾಯಿಸಿ (Update Total Quota)
            </button>
          ) : (
            <form onSubmit={handleUpdateQuota} className="flex items-center gap-2">
              <input
                type="number"
                value={newQuotaInput}
                onChange={(e) => setNewQuotaInput(e.target.value)}
                placeholder="500000"
                className="w-32 rounded-xl border border-amber-400 bg-black px-3 py-1.5 text-xs text-white"
              />
              <button
                type="submit"
                className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-400"
              >
                ಸಲ್ಲಿಸಿ
              </button>
              <button
                type="button"
                onClick={() => setIsEditingQuota(false)}
                className="rounded-xl border border-gray-600 px-3 py-1.5 text-xs text-gray-300"
              >
                ರದ್ದು
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => void handleSimulateUsage()}
            className="rounded-xl border border-amber-500/30 bg-black/40 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-900/30 transition"
          >
            🧪 ಟೆಸ್ಟ್ ಧ್ವನಿ ಬಳಕೆ (+500 Chars)
          </button>
        </div>

        <a
          href="https://dashboard.sarvam.ai"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline"
        >
          <span>🔗 Sarvam AI Dashboard ಲಾಗಿನ್</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  );
};
