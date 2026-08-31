import React, { useState, useEffect } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import { getDevoteeStreakData, type DevoteeStreakRecord } from "../../features/seva/devoteeStreakService";
import { StreakRewardsModal } from "./StreakRewardsModal";

export interface DevoteeStreakBadgeProps {
  devoteeName?: string;
  lang?: SevaLang;
  className?: string;
}

export const DevoteeStreakBadge: React.FC<DevoteeStreakBadgeProps> = ({
  devoteeName = "ಭಕ್ತರು",
  lang = "kn",
  className = ""
}) => {
  const [streakData, setStreakData] = useState<DevoteeStreakRecord>({
    devoteeKey: "devotee_default",
    devoteeName,
    gotra: "ಕಾಶ್ಯಪ",
    currentStreak: 1,
    highestStreak: 1,
    totalPoojas: 1,
    totalJapas: 0,
    lastPoojaDate: "",
    lastJapaDate: "",
    unlockedMilestones: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const devoteeKey = devoteeName.toLowerCase().replace(/\s+/g, "_") || "devotee_default";

  useEffect(() => {
    getDevoteeStreakData(devoteeKey).then((res) => {
      setStreakData(res);
    });
  }, [devoteeKey]);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-yellow-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 hover:border-amber-400 text-amber-200 text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95 ${className}`}
        title={lang === "kn" ? "ಸಾಧನಾ ದೀಕ್ಷೆ ಮತ್ತು ಪುರಸ್ಕಾರಗಳನ್ನು ವೀಕ್ಷಿಸಿ" : "View Devotee Streak & Rewards"}
      >
        <span className="text-base animate-pulse">🔥</span>
        <span className="font-mono text-yellow-300 font-extrabold">
          {streakData.currentStreak} {lang === "kn" ? "ದಿನಗಳ ದೀಕ್ಷೆ" : "Days Streak"}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 group-hover:bg-amber-400 group-hover:text-black transition-colors">
          🎁 {lang === "kn" ? "ಪುರಸ್ಕಾರ" : "Rewards"}
        </span>
      </button>

      <StreakRewardsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        streakData={streakData}
        lang={lang}
      />
    </>
  );
};
