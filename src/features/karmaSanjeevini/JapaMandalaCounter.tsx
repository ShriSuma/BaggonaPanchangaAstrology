import React, { useState, useEffect, useCallback } from "react";
import type { BijaMantraDetail } from "./karmaMandalaTypes";
import type { SupportedLanguage } from "../../stores/appStore";
import { KARMA_MANDALA_5L } from "./karmaMandalaLocale";
import { useWalletStore } from "../wallet/walletStore";

interface JapaMandalaCounterProps {
  mantra: BijaMantraDetail;
  language: SupportedLanguage;
  devoteeName: string;
}

const STORAGE_KEY_JAPA = "baggona_japa_mandala_state";

export const JapaMandalaCounter: React.FC<JapaMandalaCounterProps> = ({
  mantra,
  language,
  devoteeName
}) => {
  const [count, setCount] = useState<number>(0);
  const [targetCount] = useState<number>(108);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [completedToday, setCompletedToday] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  const directCoinAdjustment = useWalletStore((s) => s.directCoinAdjustment);
  const t = KARMA_MANDALA_5L.japa;

  // Load saved streak & today progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JAPA);
      if (saved) {
        const parsed = JSON.parse(saved);
        const todayStr = new Date().toISOString().slice(0, 10);
        if (parsed.lastDate === todayStr) {
          setCount(parsed.todayCount || 0);
          setCompletedToday(parsed.completedToday || false);
          setStreakDays(parsed.streakDays || 1);
        } else {
          // Check if streak is continuous from yesterday
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().slice(0, 10);
          if (parsed.lastDate === yesterdayStr) {
            setStreakDays((parsed.streakDays || 0) + 1);
          } else {
            setStreakDays(1);
          }
          setCount(0);
          setCompletedToday(false);
        }
      }
    } catch {
      // fallback
    }
  }, []);

  // Web Audio Bell Synthesizer (pure client-side, zero network dependencies)
  const playSacredBell = useCallback((isMilestone: boolean) => {
    if (!audioEnabled || typeof window === "undefined") return;

    try {
      const ctx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioCtx) setAudioCtx(ctx);

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isMilestone) {
        // Deep Temple Gong for 108 Completion (G#3 / 207.65 Hz)
        osc.type = "sine";
        osc.frequency.setValueAtTime(207.65, now);
        osc.frequency.exponentialRampToValueAtTime(103.8, now + 2.5);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 3.0);
      } else {
        // High Crystal Tibetan Singing Bell for individual beads (A5 / 880 Hz with gentle decay)
        const fundamental = 880 + (count % 12) * 15;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(fundamental, now);
        osc.frequency.exponentialRampToValueAtTime(fundamental * 0.98, now + 0.4);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch {
      // Audio fallback silent
    }
  }, [audioEnabled, audioCtx, count]);

  const handleBeadClick = () => {
    if (completedToday) return;

    // Haptic vibration on mobile
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }

    const next = count + 1;
    if (next >= targetCount) {
      setCount(targetCount);
      setCompletedToday(true);
      playSacredBell(true);

      // Reward +5 Red Coins on completion!
      try {
        void directCoinAdjustment("guest_user", 5, "Karma Japa 108 Daily Sadhana Completed");
      } catch {
        // safe
      }

      // Save to localStorage
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem(
        STORAGE_KEY_JAPA,
        JSON.stringify({
          lastDate: todayStr,
          todayCount: targetCount,
          completedToday: true,
          streakDays
        })
      );
    } else {
      setCount(next);
      playSacredBell(false);

      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem(
        STORAGE_KEY_JAPA,
        JSON.stringify({
          lastDate: todayStr,
          todayCount: next,
          completedToday: false,
          streakDays
        })
      );
    }
  };

  const handleReset = () => {
    setCount(0);
    setCompletedToday(false);
    const todayStr = new Date().toISOString().slice(0, 10);
    localStorage.setItem(
      STORAGE_KEY_JAPA,
      JSON.stringify({
        lastDate: todayStr,
        todayCount: 0,
        completedToday: false,
        streakDays
      })
    );
  };

  const progressPercent = Math.min(100, Math.round((count / targetCount) * 100));

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-900/90 via-[#0d091e] to-slate-950 p-4 md:p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative Golden Aura */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 border-b border-amber-500/20 pb-3">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-amber-300 flex items-center gap-2">
            <span>📿</span>
            <span>{t.title[language] || t.title.kn}</span>
          </h3>
          <p className="text-xs text-amber-200/70">{t.subtitle[language] || t.subtitle.kn}</p>
        </div>

        {/* Sadhana Streak Badge */}
        <div className="flex items-center gap-2 bg-amber-950/60 border border-amber-500/40 px-3 py-1.5 rounded-full shadow-inner">
          <span className="text-sm">🔥</span>
          <span className="text-xs font-bold text-amber-300">
            {streakDays} {t.streakLabel[language] || t.streakLabel.kn}
          </span>
        </div>
      </div>

      {/* Active Bija Mantra Display Card */}
      <div className="mb-5 p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-center relative group">
        <div className="text-[11px] font-bold tracking-widest uppercase text-amber-400 mb-1">
          {mantra.deity[language] || mantra.deity.kn} • {mantra.count} {t.beadCountLabel[language] || t.beadCountLabel.kn}
        </div>
        <div className="text-base md:text-xl font-bold text-amber-100 font-serif leading-relaxed px-2 py-1">
          {mantra.kannada}
        </div>
        <div className="text-xs md:text-sm text-amber-300/80 italic mt-1 font-mono">
          {mantra.transliteration[language] || mantra.transliteration.kn}
        </div>
        <div className="text-[11px] text-slate-300 mt-2 px-3 py-1 bg-black/40 rounded-lg inline-block border border-amber-500/15">
          {mantra.meaning[language] || mantra.meaning.kn}
        </div>
      </div>

      {/* Circular Interactive Rudraksha Rosary */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
          {/* Circular SVG Progress Ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="rgba(245, 158, 11, 0.15)"
              strokeWidth="6"
            />
            {/* Active Golden Progress */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={(2 * Math.PI * 52) * (1 - progressPercent / 100)}
              className="transition-all duration-300 ease-out"
            />
          </svg>

          {/* Central Interactive Tap Button */}
          <button
            onClick={handleBeadClick}
            disabled={completedToday}
            className={`absolute w-36 h-36 md:w-44 md:h-44 rounded-full flex flex-col items-center justify-center transition-all duration-200 transform active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.25)] border-2 ${
              completedToday
                ? "bg-gradient-to-br from-emerald-900/90 via-emerald-800 to-emerald-950 border-emerald-400 text-emerald-100 cursor-default"
                : "bg-gradient-to-br from-amber-900/90 via-slate-900 to-amber-950 border-amber-400/80 hover:border-amber-300 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]"
            }`}
            aria-label="Tap Rudraksha bead to count"
          >
            {completedToday ? (
              <div className="flex flex-col items-center animate-bounce-slow">
                <span className="text-3xl md:text-4xl">✨</span>
                <span className="text-xs md:text-sm font-bold text-emerald-300 mt-1">
                  ೧೦೮ ಸಿದ್ಧಿ!
                </span>
                <span className="text-[10px] text-emerald-200/80">+5 Red Coins</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl text-amber-400 mb-1">📿</span>
                <span className="text-3xl md:text-4xl font-extrabold font-mono text-white tracking-wider">
                  {count}
                </span>
                <span className="text-[11px] text-amber-300/80 font-bold uppercase tracking-widest mt-0.5">
                  / {targetCount}
                </span>
                <span className="text-[10px] text-amber-200/60 mt-1 bg-black/40 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {t.tapBeadHint[language] || t.tapBeadHint.kn}
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Completion Toast Message */}
        {completedToday && (
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-900/50 via-emerald-800/40 to-emerald-900/50 border border-emerald-400 text-center animate-pulse">
            <span className="text-sm font-bold text-emerald-200">
              {t.cycleCompleted[language] || t.cycleCompleted.kn}
            </span>
          </div>
        )}
      </div>

      {/* Footer Controls: Audio Toggle & Reset Button */}
      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-amber-500/20">
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 transition-colors px-2.5 py-1.5 rounded-lg bg-black/30 border border-amber-500/20"
        >
          <span>{audioEnabled ? "🔔" : "🔕"}</span>
          <span>
            {audioEnabled
              ? (t.audioOn[language] || t.audioOn.kn)
              : (t.audioOff[language] || t.audioOff.kn)}
          </span>
        </button>

        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-amber-300 transition-colors px-2.5 py-1.5 rounded-lg bg-black/30 border border-slate-700 hover:border-amber-500/30"
        >
          {t.resetCounter[language] || t.resetCounter.kn}
        </button>
      </div>
    </div>
  );
};
