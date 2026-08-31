import React, { useState } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import { DEVOTEE_MILESTONES, type DevoteeStreakRecord, hasPrashnaShastraVipAccess } from "../../features/seva/devoteeStreakService";

export interface StreakRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakData: DevoteeStreakRecord;
  lang?: SevaLang;
}

export const StreakRewardsModal: React.FC<StreakRewardsModalProps> = ({
  isOpen,
  onClose,
  streakData,
  lang = "kn"
}) => {
  if (!isOpen) return null;

  const currentStreak = streakData?.currentStreak || 1;
  const highestStreak = streakData?.highestStreak || currentStreak;
  const isPrashnaVipUnlocked = hasPrashnaShastraVipAccess(streakData);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-500/50 bg-gradient-to-br from-neutral-950 via-amber-950/80 to-neutral-950 p-6 md:p-8 shadow-2xl text-amber-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full bg-neutral-900 border border-amber-500/30 text-amber-300 hover:text-white hover:border-amber-400 transition-all text-sm"
        >
          ✕
        </button>

        {/* Title Header */}
        <div className="text-center pb-6 border-b border-amber-500/30">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
            <span>🔥</span>
            <span>{lang === "kn" ? "ನಿತ್ಯ ಪೂಜಾ-ಜಪ ಸಾಧನಾ ದೀಕ್ಷೆ" : "Daily Sacred Devotion Streak"}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent">
            {lang === "kn" ? "ಸಾಧನಾ ಮೈಲಿಗಲ್ಲುಗಳು & ದೈವಿಕ ಪುರಸ್ಕಾರಗಳು" : "Devotee Milestones & Sacred Rewards"}
          </h2>
          <p className="text-xs md:text-sm text-amber-200/80 mt-1 max-w-md mx-auto">
            {lang === "kn"
              ? "ಪ್ರತಿದಿನ ಸಂಕಲ್ಪ ಪೂಜೆ ಮತ್ತು ೧೧-ಜಪ ನೆರವೇರಿಸಿ ವಿಶೇಷ ಆಧ್ಯಾತ್ಮಿಕ ಪುರಸ್ಕಾರಗಳನ್ನು ಪಡೆದುಕೊಳ್ಳಿ!"
              : "Perform your daily sankalpa and 11-time japa to unlock profound Vedic rewards!"}
          </p>
        </div>

        {/* Live Devotee Stats Dashboard */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-center shadow-inner">
            <div className="text-xs text-amber-400 font-semibold mb-1">🔥 {lang === "kn" ? "ಪ್ರಸ್ತುತ ದೀಕ್ಷೆ" : "Current Streak"}</div>
            <div className="text-2xl md:text-3xl font-extrabold text-yellow-300 font-mono">
              {currentStreak} <span className="text-xs font-normal text-amber-200">{lang === "kn" ? "ದಿನಗಳು" : "Days"}</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-center shadow-inner">
            <div className="text-xs text-amber-400 font-semibold mb-1">👑 {lang === "kn" ? "ಗರಿಷ್ಠ ಸಾಧನೆ" : "Highest Streak"}</div>
            <div className="text-2xl md:text-3xl font-extrabold text-amber-200 font-mono">
              {highestStreak} <span className="text-xs font-normal text-amber-200">{lang === "kn" ? "ದಿನಗಳು" : "Days"}</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-center shadow-inner">
            <div className="text-xs text-amber-400 font-semibold mb-1">📿 {lang === "kn" ? "ಒಟ್ಟು ಜಪಗಳು" : "Total Japas"}</div>
            <div className="text-2xl md:text-3xl font-extrabold text-amber-200 font-mono">
              {streakData?.totalJapas || 0}
            </div>
          </div>
        </div>

        {/* 200-Day Grand Milestone Banner */}
        <div className={`p-4 rounded-2xl border-2 transition-all my-5 ${
          isPrashnaVipUnlocked
            ? "bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-600/30 border-yellow-400 shadow-yellow-500/30 shadow-xl"
            : "bg-neutral-900/80 border-amber-500/40"
        }`}>
          <div className="flex items-start gap-3">
            <div className="text-3xl p-2 rounded-xl bg-amber-500/20">🏆</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-yellow-300">
                  {lang === "kn" ? "೨೦೦ ದಿನಗಳ ಮಹಾ ಸಿದ್ಧ ಪುರಸ್ಕಾರ: ಅನ್ಲಿಮಿಟೆಡ್ ಪ್ರಶ್ನಶಾಸ್ತ್ರ!" : "200-Day Maha Siddha Perk: Unlimited Prashna Shastra!"}
                </h4>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  isPrashnaVipUnlocked
                    ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400"
                    : "bg-neutral-800 text-amber-400/80 border border-amber-500/30"
                }`}>
                  {isPrashnaVipUnlocked ? (lang === "kn" ? "ಅನ್‌ಲಾಕ್ ಆಗಿದೆ ✓" : "UNLOCKED ✓") : `${currentStreak}/200 Days`}
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                {lang === "kn"
                  ? "ಸತತ ೨೦೦ ದಿನಗಳ ದೀಕ್ಷೆ ಪೂರೈಸಿದಾಗ AI ಪ್ರಶ್ನಶಾಸ್ತ್ರ ಒರಾಕಲ್ ಸಂಪೂರ್ಣ ಉಚಿತ ಮತ್ತು ಅನಿಯಮಿತ ಪ್ರವೇಶ ದೊರೆಯಲಿದೆ."
                  : "Complete 200 continuous days of devotion to unlock lifetime unlimited VIP access to AI Prashna Shastra Oracle!"}
              </p>
              {isPrashnaVipUnlocked && (
                <a
                  href="/prashna"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 font-bold text-xs shadow-md hover:scale-105 transition-all"
                >
                  <span>🔮</span>
                  <span>{lang === "kn" ? "ಪ್ರಶ್ನಶಾಸ್ತ್ರಕ್ಕೆ ಪ್ರವೇಶಿಸಿ" : "Open Prashna Shastra"}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Milestone Progression Cards */}
        <div className="space-y-3 mt-6">
          <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400">
            {lang === "kn" ? "ಎಲ್ಲಾ ಹಂತಗಳ ಪುರಸ್ಕಾರಗಳು:" : "All Milestone Rewards:"}
          </h4>

          {DEVOTEE_MILESTONES.map((milestone) => {
            const isUnlocked = highestStreak >= milestone.days;
            const isTargetNext = !isUnlocked && currentStreak < milestone.days;

            return (
              <div
                key={milestone.days}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                  isUnlocked
                    ? "bg-amber-950/40 border-amber-400/60 shadow-md shadow-amber-950/40"
                    : isTargetNext
                    ? "bg-neutral-900/60 border-amber-500/30 opacity-90 ring-1 ring-amber-500/20"
                    : "bg-neutral-950/60 border-neutral-800 opacity-60"
                }`}
              >
                <div className={`text-2xl p-2.5 rounded-xl flex items-center justify-center ${
                  isUnlocked ? "bg-amber-500/20 text-yellow-300" : "bg-neutral-900 text-neutral-500"
                }`}>
                  {milestone.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-400/80 mr-2">
                        {milestone.days} {lang === "kn" ? "ದಿನಗಳು" : "Days"}
                      </span>
                      <h5 className="inline font-bold text-amber-100 text-sm">
                        {milestone.badgeTitle[lang] || milestone.badgeTitle.kn}
                      </h5>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isUnlocked
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                    }`}>
                      {isUnlocked ? "✓ UNLOCKED" : "LOCKED"}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-yellow-200 mt-1">
                    {milestone.rewardTitle[lang] || milestone.rewardTitle.kn}
                  </p>
                  <p className="text-[11px] text-amber-200/70 mt-0.5">
                    {milestone.rewardDesc[lang] || milestone.rewardDesc.kn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Close Button */}
        <div className="mt-6 pt-4 border-t border-amber-500/20 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-semibold text-sm transition-all"
          >
            {lang === "kn" ? "ಮುಚ್ಚಿ" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
