import React, { useState, useEffect } from "react";

export interface VedicTimePickerModalProps {
  value: string; // "HH:mm" 24h format, e.g. "12:00" or "09:30"
  onChange: (timeStr: string) => void;
  label?: string;
  theme?: "gold" | "dark";
  id?: string;
  required?: boolean;
}

export const VedicTimePickerModal: React.FC<VedicTimePickerModalProps> = ({
  value,
  onChange,
  label = "ಜನನ ಸಮಯ (Birth Time)",
  theme = "gold",
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to parse 24h HH:mm to 12h parts
  const parse24h = (val: string) => {
    const fallback = { hour12: 12, minute: 0, period: "PM" as "AM" | "PM" };
    if (!val || !val.includes(":")) return fallback;
    const [hStr, mStr] = val.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return fallback;
    const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return { hour12, minute: Math.min(59, Math.max(0, m)), period };
  };

  // Convert 12h parts back to 24h "HH:mm"
  const format24h = (h12: number, min: number, p: "AM" | "PM") => {
    let h24 = h12;
    if (p === "PM") {
      h24 = h12 === 12 ? 12 : h12 + 12;
    } else {
      h24 = h12 === 12 ? 0 : h12;
    }
    const hh = String(h24).padStart(2, "0");
    const mm = String(min).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  // Human-readable Kannada display string
  const getReadableKannada = (h12: number, min: number, p: "AM" | "PM") => {
    const padMin = String(min).padStart(2, "0");
    let kaPeriod = "";
    if (p === "AM") {
      kaPeriod = h12 >= 4 && h12 < 12 ? "ಬೆಳಿಗ್ಗೆ" : "ಮಧ್ಯರಾತ್ರಿ";
    } else {
      kaPeriod = h12 === 12 || h12 < 4 ? "ಮಧ್ಯಾಹ್ನ" : h12 < 8 ? "ಸಂಜೆ" : "ರಾತ್ರಿ";
    }
    return `${kaPeriod} ${h12}:${padMin} (${p})`;
  };

  // Current working draft state inside modal
  const initialParts = parse24h(value || "12:00");
  const [draftHour, setDraftHour] = useState<number>(initialParts.hour12);
  const [draftMinute, setDraftMinute] = useState<number>(initialParts.minute);
  const [draftPeriod, setDraftPeriod] = useState<"AM" | "PM">(initialParts.period);

  // Sync draft whenever external value changes
  useEffect(() => {
    const p = parse24h(value || "12:00");
    setDraftHour(p.hour12);
    setDraftMinute(p.minute);
    setDraftPeriod(p.period);
  }, [value]);

  const handleOpen = () => {
    const p = parse24h(value || "12:00");
    setDraftHour(p.hour12);
    setDraftMinute(p.minute);
    setDraftPeriod(p.period);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    const new24h = format24h(draftHour, draftMinute, draftPeriod);
    onChange(new24h);
    setIsOpen(false);
  };

  const handleCancel = () => {
    const p = parse24h(value || "12:00");
    setDraftHour(p.hour12);
    setDraftMinute(p.minute);
    setDraftPeriod(p.period);
    setIsOpen(false);
  };

  const handlePreset = (h24: number, min: number) => {
    const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    const hour12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    setDraftHour(hour12);
    setDraftMinute(min);
    setDraftPeriod(period);
  };

  const currentParts = parse24h(value || "12:00");
  const currentReadable = getReadableKannada(currentParts.hour12, currentParts.minute, currentParts.period);

  return (
    <div className="w-full">
      {label && (
        <label className={`block font-bold mb-1 text-xs ${theme === "dark" ? "text-amber-300" : "text-amber-950"}`}>
          {label}
        </label>
      )}

      {/* Trigger Button that opens the rich modal */}
      <button
        type="button"
        id={id}
        onClick={handleOpen}
        className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left transition-all active:scale-98 shadow-xs border-2 ${
          theme === "dark"
            ? "bg-slate-900/90 border-amber-500/40 text-amber-100 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            : "bg-[#FEFCF4] border-amber-300 text-slate-900 hover:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-base shrink-0">⏱️</span>
          <div className="truncate">
            <span className="font-mono font-extrabold text-sm tracking-wide">
              {value || "12:00"}
            </span>
            <span className={`ml-2 text-[11px] font-semibold ${theme === "dark" ? "text-amber-300/80" : "text-amber-800"}`}>
              {currentReadable}
            </span>
          </div>
        </div>

        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
          theme === "dark"
            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
            : "bg-amber-100 text-amber-900 border-amber-300"
        }`}>
          ಬದಲಾಯಿಸಿ ✎
        </span>
      </button>

      {/* 🪔 Rich Vedic Time Picker Modal Dialog */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 999999
          }}
          className="fixed inset-0 w-screen h-screen bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={handleCancel}
        >
          <div
            className={`w-full max-w-sm rounded-3xl border-2 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 ${
              theme === "dark"
                ? "bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-amber-400/60 text-amber-100"
                : "bg-gradient-to-b from-[#FFFDF7] via-[#FFFBF0] to-[#FFF8E7] border-amber-400 text-slate-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-400/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                <div>
                  <h3 className={`font-serif text-sm font-black tracking-wide ${theme === "dark" ? "text-amber-200" : "text-amber-950"}`}>
                    ಜನನ ಸಮಯ ನಿಗದಿಪಡಿಸಿ
                  </h3>
                  <p className={`text-[10px] font-semibold ${theme === "dark" ? "text-amber-400/70" : "text-amber-800"}`}>
                    Select Devotee Birth Time (IST)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="w-8 h-8 rounded-full bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 hover:text-slate-200 flex items-center justify-center font-bold text-base transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Big Digital Display Card */}
            <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center shadow-inner ${
              theme === "dark"
                ? "bg-slate-950/90 border-amber-500/30"
                : "bg-amber-50/60 border-amber-200"
            }`}>
              <div className="flex items-center gap-2 font-mono text-3xl sm:text-4xl font-black text-amber-400">
                <span className="w-14 text-center py-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  {String(draftHour).padStart(2, "0")}
                </span>
                <span className="animate-pulse text-amber-500">:</span>
                <span className="w-14 text-center py-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  {String(draftMinute).padStart(2, "0")}
                </span>
                <span className={`text-base font-sans font-black px-2.5 py-1 rounded-xl border ${
                  draftPeriod === "AM"
                    ? "bg-amber-400 text-slate-950 border-amber-300"
                    : "bg-orange-500 text-white border-orange-400"
                }`}>
                  {draftPeriod}
                </span>
              </div>
              <div className="text-xs font-bold text-amber-300/90 mt-2">
                {getReadableKannada(draftHour, draftMinute, draftPeriod)}
              </div>
            </div>

            {/* Selection Wheels / Dropdowns */}
            <div className="grid grid-cols-3 gap-2.5 text-xs font-bold">
              {/* Hour Dropdown */}
              <div>
                <label className={`block text-[10px] font-black mb-1 ${theme === "dark" ? "text-amber-300" : "text-amber-950"}`}>
                  ಗಂಟೆ (Hour)
                </label>
                <select
                  value={draftHour}
                  onChange={(e) => setDraftHour(parseInt(e.target.value, 10))}
                  className={`w-full px-2.5 py-2.5 rounded-xl border-2 font-mono font-black text-sm text-center shadow-xs cursor-pointer ${
                    theme === "dark"
                      ? "bg-slate-900 border-amber-500/40 text-amber-200 focus:border-amber-400"
                      : "bg-white border-amber-300 text-slate-950 focus:border-amber-500"
                  }`}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")} {h === 12 ? "(ಮಧ್ಯಾಹ್ನ/ರಾತ್ರಿ)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minute Dropdown */}
              <div>
                <label className={`block text-[10px] font-black mb-1 ${theme === "dark" ? "text-amber-300" : "text-amber-950"}`}>
                  ನಿಮಿಷ (Minute)
                </label>
                <select
                  value={draftMinute}
                  onChange={(e) => setDraftMinute(parseInt(e.target.value, 10))}
                  className={`w-full px-2.5 py-2.5 rounded-xl border-2 font-mono font-black text-sm text-center shadow-xs cursor-pointer ${
                    theme === "dark"
                      ? "bg-slate-900 border-amber-500/40 text-amber-200 focus:border-amber-400"
                      : "bg-white border-amber-300 text-slate-950 focus:border-amber-500"
                  }`}
                >
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, "0")} {m === 0 ? "ನಿಮಿಷ" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* AM / PM Toggle */}
              <div>
                <label className={`block text-[10px] font-black mb-1 ${theme === "dark" ? "text-amber-300" : "text-amber-950"}`}>
                  ಅವಧಿ (AM/PM)
                </label>
                <div className="grid grid-cols-2 gap-1 h-[42px]">
                  <button
                    type="button"
                    onClick={() => setDraftPeriod("AM")}
                    className={`rounded-xl font-black text-xs transition-all border ${
                      draftPeriod === "AM"
                        ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-102"
                        : "bg-slate-800/40 text-slate-400 border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraftPeriod("PM")}
                    className={`rounded-xl font-black text-xs transition-all border ${
                      draftPeriod === "PM"
                        ? "bg-orange-500 text-white border-orange-400 shadow-md scale-102"
                        : "bg-slate-800/40 text-slate-400 border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Presets for Vedic Timings */}
            <div>
              <div className={`text-[10px] font-bold mb-1.5 flex items-center gap-1 ${theme === "dark" ? "text-amber-400/80" : "text-amber-900"}`}>
                <span>⚡</span>
                <span>ವೇದೋಕ್ತ ಶುಭ ಕಾಲ ತ್ವರಿತ ಆಯ್ಕೆಗಳು (Quick Presets):</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => handlePreset(6, 0)}
                  className={`p-1.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                    theme === "dark"
                      ? "bg-slate-900/60 border-amber-500/20 hover:border-amber-400 text-amber-200"
                      : "bg-white border-amber-200 hover:border-amber-400 text-amber-950"
                  }`}
                >
                  <span>🌅 ಸೂರ್ಯೋದಯ</span>
                  <span className="font-mono text-[9px] opacity-75">06:00 AM</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(12, 0)}
                  className={`p-1.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                    theme === "dark"
                      ? "bg-slate-900/60 border-amber-500/20 hover:border-amber-400 text-amber-200"
                      : "bg-white border-amber-200 hover:border-amber-400 text-amber-950"
                  }`}
                >
                  <span>☀️ ಮಧ್ಯಾಹ್ನ / ಅಭಿಜಿತ್</span>
                  <span className="font-mono text-[9px] opacity-75">12:00 PM</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(18, 30)}
                  className={`p-1.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                    theme === "dark"
                      ? "bg-slate-900/60 border-amber-500/20 hover:border-amber-400 text-amber-200"
                      : "bg-white border-amber-200 hover:border-amber-400 text-amber-950"
                  }`}
                >
                  <span>🌇 ಸಂಜೆ / ಸೂರ್ಯಾಸ್ತ</span>
                  <span className="font-mono text-[9px] opacity-75">06:30 PM</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(21, 0)}
                  className={`p-1.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                    theme === "dark"
                      ? "bg-slate-900/60 border-amber-500/20 hover:border-amber-400 text-amber-200"
                      : "bg-white border-amber-200 hover:border-amber-400 text-amber-950"
                  }`}
                >
                  <span>🌙 ರಾತ್ರಿ ಕಾಲ</span>
                  <span className="font-mono text-[9px] opacity-75">09:00 PM</span>
                </button>
              </div>
            </div>

            {/* Modal Bottom Action Buttons: OK, CANCEL, RESET */}
            <div className="pt-2 border-t border-amber-400/30 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors text-center"
              >
                ✕ ರದ್ದು (Cancel)
              </button>

              <button
                type="button"
                onClick={() => handlePreset(12, 0)}
                className="py-2.5 px-3 rounded-xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs transition-colors text-center"
                title="Reset to 12:00 PM"
              >
                🧹 ತೆರವು (Reset)
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-[1.4] py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs shadow-lg transition-all active:scale-95 border border-emerald-400 text-center flex items-center justify-center gap-1.5"
              >
                <span>✓</span>
                <span>ಸರಿ (OK / Confirm)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
