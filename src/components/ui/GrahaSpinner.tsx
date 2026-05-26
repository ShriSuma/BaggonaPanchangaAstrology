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
    lg: "w-40 h-40",
  };

  const sunClasses = {
    sm: "w-3 h-3 shadow-[0_0_8px_rgba(217,119,6,0.8)]",
    md: "w-5 h-5 shadow-[0_0_15px_rgba(217,119,6,0.9)]",
    lg: "w-8 h-8 shadow-[0_0_22px_rgba(217,119,6,1)]",
  };

  const orbit1Classes = {
    sm: "w-8 h-8",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };

  const planet1Classes = {
    sm: "w-1.5 h-1.5 -top-0.75",
    md: "w-2.5 h-2.5 -top-1.25",
    lg: "w-3.5 h-3.5 -top-1.75",
  };

  const orbit2Classes = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-30 h-30",
  };

  const planet2Classes = {
    sm: "w-1.5 h-1.5 -left-0.75",
    md: "w-2.5 h-2.5 -left-1.25",
    lg: "w-3.5 h-3.5 -left-1.75",
  };

  const orbit3Classes = {
    sm: "w-16 h-16",
    md: "w-26 h-26",
    lg: "w-38 h-38",
  };

  const planet3Classes = {
    sm: "w-2 h-2 -bottom-1",
    md: "w-3 h-3 -bottom-1.5",
    lg: "w-4.5 h-4.5 -bottom-2.25",
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className={`relative flex items-center justify-center ${containerClasses[size]} animate-spin-slow`}>
        {/* Central Sun */}
        <div className={`rounded-full bg-amber-500 animate-pulse ${sunClasses[size]}`} />

        {/* Orbit 1 (Inner) */}
        <div className={`absolute rounded-full border border-dashed border-amber-600/30 animate-spin-orbit-1 ${orbit1Classes[size]}`}>
          {/* Planet 1 (Mercury/Budha - Slate) */}
          <div className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-slate-400 shadow-[0_0_4px_#94a3b8] ${planet1Classes[size]}`} />
        </div>

        {/* Orbit 2 (Middle) */}
        <div className={`absolute rounded-full border border-dashed border-amber-600/20 animate-spin-orbit-2 ${orbit2Classes[size]}`}>
          {/* Planet 2 (Venus/Shukra - Soft Gold/Orange) */}
          <div className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-orange-400 shadow-[0_0_4px_#fb923c] ${planet2Classes[size]}`} />
        </div>

        {/* Orbit 3 (Outer) */}
        <div className={`absolute rounded-full border border-dashed border-amber-600/10 animate-spin-orbit-3 ${orbit3Classes[size]}`}>
          {/* Planet 3 (Earth/Moon/Chandra - Blue/Silver) */}
          <div className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6] ${planet3Classes[size]}`} />
        </div>
      </div>
      {text && (
        <p className="mt-4 text-xs font-semibold tracking-widest text-amber-700/80 uppercase animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
