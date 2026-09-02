import React, { useState, useEffect, useMemo } from "react";
import {
  generateSmartUserIdSuggestions,
  suggestUserIdsWithAI,
  type UserIdSuggestion
} from "../../utils/userIdSuggestionEngine";

export interface UserIdSuggestionChipsProps {
  name: string;
  currentUserId: string;
  onSelectUserId: (id: string) => void;
  role?: "priest" | "devotee" | "admin" | "user";
  className?: string;
  autoSelectFirstIfEmpty?: boolean;
}

export const UserIdSuggestionChips: React.FC<UserIdSuggestionChipsProps> = ({
  name,
  currentUserId,
  onSelectUserId,
  role = "priest",
  className = "",
  autoSelectFirstIfEmpty = false
}) => {
  const [aiSuggestions, setAiSuggestions] = useState<UserIdSuggestion[] | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Deterministic suggestions
  const deterministicSuggestions = useMemo(() => {
    return generateSmartUserIdSuggestions(name, role);
  }, [name, role]);

  const allSuggestions = aiSuggestions || deterministicSuggestions;

  // Auto-select first suggestion if current username is empty or user is actively typing new name
  useEffect(() => {
    if (autoSelectFirstIfEmpty && name.trim() && !currentUserId.trim() && deterministicSuggestions.length > 0) {
      onSelectUserId(deterministicSuggestions[0].id);
    }
  }, [name, autoSelectFirstIfEmpty, deterministicSuggestions, currentUserId, onSelectUserId]);

  const handleFetchAiSuggestions = async () => {
    if (!name.trim() || isLoadingAi) return;
    setIsLoadingAi(true);
    try {
      const res = await suggestUserIdsWithAI(name, role);
      setAiSuggestions(res);
    } catch (e) {
      console.error("Failed to fetch AI user ID suggestions:", e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  if (!name.trim() || allSuggestions.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-1.5 animate-in fade-in duration-200 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
          <span>💡</span>
          <span>ಸ್ಮಾರ್ಟ್ ID ಸಲಹೆಗಳು (Smart Suggestions - Click to choose):</span>
        </label>

        <button
          type="button"
          onClick={handleFetchAiSuggestions}
          disabled={isLoadingAi || !name.trim()}
          className="text-[10px] font-bold text-amber-900 hover:text-amber-950 bg-amber-200/80 hover:bg-amber-300/80 px-2 py-0.5 rounded-md border border-amber-400 transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer active:scale-95 shadow-2xs"
          title="GenAI ಮೂಲಕ ಹೆಚ್ಚುವರಿ ವಿಶಿಷ್ಟ IDಗಳನ್ನು ಪಡೆಯಿರಿ"
        >
          <span>{isLoadingAi ? "⏳" : "🪄"}</span>
          <span>{isLoadingAi ? "ರಚಿಸಲಾಗುತ್ತಿದೆ..." : "AI ಸಲಹೆಗಳು"}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto pr-1">
        {allSuggestions.slice(0, 8).map((sug) => {
          const isSelected = currentUserId.trim().toLowerCase() === sug.id.toLowerCase();
          return (
            <button
              key={sug.id}
              type="button"
              onClick={() => onSelectUserId(sug.id)}
              className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer select-none active:scale-95 shadow-2xs ${
                isSelected
                  ? "bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-400 font-black scale-105 shadow-sm"
                  : "bg-white hover:bg-amber-100/90 text-amber-950 border-amber-300 hover:border-amber-400"
              }`}
              title={`${sug.label} (${sug.id})`}
            >
              <span className="text-xs">{sug.icon}</span>
              <span>{sug.id}</span>
              {isSelected && <span className="text-emerald-950 text-xs font-black">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
