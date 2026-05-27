import { useTranslation } from "react-i18next";

interface GrahaSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function GrahaSpinner({ message, size = "md" }: GrahaSpinnerProps): JSX.Element {
  const { t } = useTranslation();
  const text = message || t("common.loading");

  // Keep size dimensions proportional
  const containerClasses = {
    sm: "w-16 h-16",
    md: "w-28 h-28",
    lg: "w-44 h-44",
  };

  const sunClasses = {
    sm: "w-4 h-4 shadow-[0_0_12px_#f59e0b,0_0_24px_#ef4444]",
    md: "w-7 h-7 shadow-[0_0_20px_#f59e0b,0_0_35px_#ef4444,0_0_50px_rgba(245,158,11,0.5)]",
    lg: "w-11 h-11 shadow-[0_0_30px_#f59e0b,0_0_50px_#ef4444,0_0_70px_rgba(245,158,11,0.6)]",
  };

  const orbit1Classes = {
    sm: "w-10 h-10",
    md: "w-18 h-18",
    lg: "w-26 h-26",
  };

  const planet1Classes = {
    sm: "w-1.5 h-1.5 -top-0.75",
    md: "w-2.5 h-2.5 -top-1.25",
    lg: "w-3.5 h-3.5 -top-1.75",
  };

  const orbit2Classes = {
    sm: "w-14 h-14",
    md: "w-26 h-26",
    lg: "w-36 h-36",
  };

  const planet2Classes = {
    sm: "w-2 h-2 -left-1",
    md: "w-3 h-3 -left-1.5",
    lg: "w-4.5 h-4.5 -left-2.25",
  };

  const orbit3Classes = {
    sm: "w-18 h-18",
    md: "w-34 h-34",
    lg: "w-46 h-46",
  };

  const planet3Classes = {
    sm: "w-2 h-2 -bottom-1",
    md: "w-3.5 h-3.5 -bottom-1.75",
    lg: "w-5 h-5 -bottom-2.5",
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className={`relative flex items-center justify-center ${containerClasses[size]}`}>
        {/* Cosmic Background Glow */}
        <div className="absolute w-[120%] h-[120%] rounded-full bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-amber-500/10 blur-xl opacity-60 animate-pulse" />
        
        {/* Central Sun */}
        <div className={`rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-rose-600 animate-pulse z-10 ${sunClasses[size]}`} />

        {/* Orbit 1 (Inner) */}
        <div className={`absolute rounded-full border border-amber-500/15 shadow-[inset_0_0_6px_rgba(245,158,11,0.05)] animate-spin-orbit-1 ${orbit1Classes[size]}`}>
          {/* Planet 1 (Budha - Emerald/Mercury) */}
          <div className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 shadow-[0_0_10px_#34d399,0_0_20px_#059669] ${planet1Classes[size]}`} />
        </div>

        {/* Orbit 2 (Middle) */}
        <div className={`absolute rounded-full border border-indigo-500/15 shadow-[inset_0_0_8px_rgba(99,102,241,0.05)] animate-spin-orbit-2 ${orbit2Classes[size]}`}>
          {/* Planet 2 (Shukra - Venus - Soft Gold) */}
          <div className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_0_12px_#fbbf24,0_0_24px_#d97706] ${planet2Classes[size]}`} />
        </div>

        {/* Orbit 3 (Outer) */}
        <div className={`absolute rounded-full border border-purple-500/10 shadow-[inset_0_0_10px_rgba(168,85,247,0.05)] animate-spin-orbit-3 ${orbit3Classes[size]}`}>
          {/* Planet 3 (Chandra - Moon - Blue/Silver) */}
          <div className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 shadow-[0_0_15px_#38bdf8,0_0_30px_#2563eb] ${planet3Classes[size]}`} />
        </div>
      </div>
      {text && (
        <p className="mt-6 text-xs font-bold tracking-widest text-indigo-900/80 dark:text-amber-500/80 uppercase animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
