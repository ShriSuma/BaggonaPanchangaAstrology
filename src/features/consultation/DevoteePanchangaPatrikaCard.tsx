/**
 * Baggona Panchanga - Sacred Devotee Birth Chart & Panchanga Patrika Card
 *
 * Displays the 5 Sacred Limbs of Panchanga + Janma Kundli Coordinates:
 * - Name, DOB, TOB, Birth Place
 * - Vaara (Vedic Weekday at Sunrise)
 * - Tithi (with Paksha)
 * - Nakshatra & Pada
 * - Rashi (Moon Sign)
 * - Lagna (Ascendant)
 * - Nitya Yoga
 * - Karana
 * - Running Vimshottari Dasha-Bhukti
 *
 * 100% Strictly localized in the devotee's chosen consultation language.
 * Luxury temple gold & cream aesthetic matching Sri Kshetra Gokarna traditions.
 */

import React, { useState } from "react";
import type { DevoteePanchangaProfile } from "./consultationPanchangaService";

interface DevoteePanchangaPatrikaCardProps {
  profile: DevoteePanchangaProfile;
  variant?: "landing" | "banner";
  onStartConsultation?: () => void;
  phoneInput?: string;
  onPhoneInputChange?: (val: string) => void;
  isStarting?: boolean;
}

export const DevoteePanchangaPatrikaCard: React.FC<DevoteePanchangaPatrikaCardProps> = ({
  profile,
  variant = "landing",
  onStartConsultation,
  phoneInput = "",
  onPhoneInputChange,
  isStarting = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(variant === "banner");
  const { labels } = profile;

  // Banner variant toggle button
  if (variant === "banner") {
    return (
      <div className="w-full bg-[#FAF6EE] border-b-2 border-amber-300 shadow-xs text-stone-900 transition-all">
        <div className="max-w-2xl mx-auto px-3 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-amber-700 font-bold font-serif text-sm">📜</span>
            <span className="font-bold text-amber-950 truncate font-serif">
              {profile.name} • {profile.rashi} • {profile.nakshatra}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-200/60 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-md transition shrink-0"
          >
            {isCollapsed ? labels.toggleViewShow : labels.toggleViewHide}
          </button>
        </div>

        {!isCollapsed && (
          <div className="max-w-2xl mx-auto p-3 pt-1 border-t border-amber-200/80 animate-fadeIn">
            <div className="bg-white/90 border border-amber-300/80 rounded-2xl p-3 shadow-inner">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                  <div className="text-[10px] text-amber-800 font-bold">{labels.vaaraLabel}</div>
                  <div className="font-bold text-amber-950 mt-0.5">{profile.vaara}</div>
                </div>
                <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                  <div className="text-[10px] text-amber-800 font-bold">{labels.tithiLabel}</div>
                  <div className="font-bold text-amber-950 mt-0.5">{profile.tithi}</div>
                </div>
                <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                  <div className="text-[10px] text-amber-800 font-bold">{labels.nakshatraLabel}</div>
                  <div className="font-bold text-amber-950 mt-0.5">{profile.nakshatra}</div>
                </div>
                <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                  <div className="text-[10px] text-amber-800 font-bold">{labels.rashiLabel}</div>
                  <div className="font-bold text-amber-950 mt-0.5">{profile.rashi}</div>
                </div>
                <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                  <div className="text-[10px] text-amber-800 font-bold">{labels.lagnaLabel}</div>
                  <div className="font-bold text-amber-950 mt-0.5">{profile.lagna}</div>
                </div>
                <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                  <div className="text-[10px] text-amber-800 font-bold">{labels.yogaLabel}</div>
                  <div className="font-bold text-amber-950 mt-0.5">{profile.yoga}</div>
                </div>
                <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                  <div className="text-[10px] text-amber-800 font-bold">{labels.karanaLabel}</div>
                  <div className="font-bold text-amber-950 mt-0.5">{profile.karana}</div>
                </div>
                <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                  <div className="text-[10px] text-amber-800 font-bold">{labels.dashaLabel}</div>
                  <div className="font-bold text-amber-950 mt-0.5">{profile.runningDasha}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Majestic Landing Variant
  return (
    <div className="w-full max-w-xl mx-auto my-2 animate-fadeIn">
      {/* Luxury Gold Card Outer Container */}
      <div className="bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#FFF8E7] border-2 border-amber-400 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Gold Edge Strip */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700" />

        {/* Sacred Header */}
        <div className="text-center space-y-1 mb-5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl animate-pulse">🕉️</span>
            <h2 className="font-serif font-black text-xl sm:text-2xl text-amber-950 tracking-tight">
              {labels.cardTitle}
            </h2>
            <span className="text-2xl animate-pulse">🕉️</span>
          </div>
          <p className="text-xs sm:text-sm font-serif font-bold text-amber-800">
            {labels.cardSubtitle}
          </p>
          <div className="inline-block bg-amber-100/90 border border-amber-300 text-amber-900 text-[11px] font-bold px-3 py-0.5 rounded-full mt-1">
            {labels.sanctumTitle}
          </div>
        </div>

        {/* Devotee Personal Bio Bar */}
        <div className="bg-white/90 border border-amber-300 rounded-2xl p-3.5 shadow-2xs mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
            <div>
              <span className="text-[11px] text-amber-800 font-bold block">{labels.devoteeNameLabel}</span>
              <span className="font-serif font-black text-lg text-amber-950">{profile.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-amber-800 font-bold block">{labels.placeLabel}</span>
              <span className="font-bold text-sm text-stone-800">{profile.place}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 text-xs">
            <div>
              <span className="text-stone-500">{labels.dobLabel}: </span>
              <strong className="text-amber-950">{profile.dobFormatted}</strong>
            </div>
            <div>
              <span className="text-stone-500">{labels.tobLabel}: </span>
              <strong className="text-amber-950">{profile.tobFormatted}</strong>
            </div>
          </div>
        </div>

        {/* The 5 Sacred Limbs of Panchanga & Kundli Grid */}
        <div className="space-y-2 mb-5">
          <div className="text-xs font-serif font-bold text-amber-900 flex items-center gap-1.5 px-1">
            <span>✨</span>
            <span>ವೈದಿಕ ಜನ್ಮ ಪಂಚಾಂಗ ಅಂಗಗಳು (Panchanga Limbs & Coordinates)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* 1. Vaara */}
            <div className="bg-white/95 border border-amber-300/80 rounded-2xl p-3 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[11px] text-amber-800 font-bold">
                <span>☀️</span>
                <span>{labels.vaaraLabel}</span>
              </div>
              <div className="font-serif font-black text-sm text-amber-950 mt-1">
                {profile.vaara}
              </div>
            </div>

            {/* 2. Tithi */}
            <div className="bg-white/95 border border-amber-300/80 rounded-2xl p-3 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[11px] text-amber-800 font-bold">
                <span>🌔</span>
                <span>{labels.tithiLabel}</span>
              </div>
              <div className="font-serif font-black text-sm text-amber-950 mt-1">
                {profile.tithi}
              </div>
            </div>

            {/* 3. Nakshatra & Pada */}
            <div className="bg-white/95 border border-amber-300/80 rounded-2xl p-3 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[11px] text-amber-800 font-bold">
                <span>⭐</span>
                <span>{labels.nakshatraLabel}</span>
              </div>
              <div className="font-serif font-black text-sm text-amber-950 mt-1">
                {profile.nakshatra}
              </div>
            </div>

            {/* 4. Janma Rashi */}
            <div className="bg-white/95 border border-amber-300/80 rounded-2xl p-3 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[11px] text-amber-800 font-bold">
                <span>🌙</span>
                <span>{labels.rashiLabel}</span>
              </div>
              <div className="font-serif font-black text-sm text-amber-950 mt-1">
                {profile.rashi}
              </div>
            </div>

            {/* 5. Janma Lagna */}
            <div className="bg-white/95 border border-amber-300/80 rounded-2xl p-3 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[11px] text-amber-800 font-bold">
                <span>♈</span>
                <span>{labels.lagnaLabel}</span>
              </div>
              <div className="font-serif font-black text-sm text-amber-950 mt-1">
                {profile.lagna}
              </div>
            </div>

            {/* 6. Nitya Yoga */}
            <div className="bg-white/95 border border-amber-300/80 rounded-2xl p-3 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[11px] text-amber-800 font-bold">
                <span>🧘</span>
                <span>{labels.yogaLabel}</span>
              </div>
              <div className="font-serif font-black text-sm text-amber-950 mt-1">
                {profile.yoga}
              </div>
            </div>

            {/* 7. Karana */}
            <div className="bg-white/95 border border-amber-300/80 rounded-2xl p-3 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[11px] text-amber-800 font-bold">
                <span>🦁</span>
                <span>{labels.karanaLabel}</span>
              </div>
              <div className="font-serif font-black text-sm text-amber-950 mt-1">
                {profile.karana}
              </div>
            </div>

            {/* 8. Running Dasha (Spanning 2 columns on mobile/tablet) */}
            <div className="col-span-2 bg-white/95 border border-amber-300/80 rounded-2xl p-3 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[11px] text-amber-800 font-bold">
                <span>⏳</span>
                <span>{labels.dashaLabel}</span>
              </div>
              <div className="font-serif font-black text-sm text-amber-950 mt-1">
                {profile.runningDasha}
              </div>
            </div>
          </div>
        </div>

        {/* Devotee Phone Verification & CTA Action */}
        <div className="bg-gradient-to-r from-amber-100/70 via-amber-50 to-amber-100/70 border border-amber-300 rounded-2xl p-4 space-y-3">
          {onPhoneInputChange && (
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                📱 {labels.phonePromptLabel}
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => onPhoneInputChange(e.target.value)}
                placeholder="ಉದಾ: 9876543210 / +91..."
                className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-sans"
              />
            </div>
          )}

          <button
            type="button"
            onClick={onStartConsultation}
            disabled={isStarting}
            className="w-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-serif font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg border border-amber-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>🪔</span>
            <span>{isStarting ? "ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ..." : labels.startConsultationBtn}</span>
            <span>➔</span>
          </button>

          <p className="text-[11px] text-amber-900/90 text-center font-medium leading-relaxed">
            {labels.sacredNotice}
          </p>
        </div>

        {/* Priest & Sansthana Footer Note */}
        <div className="mt-4 pt-3 border-t border-amber-200/90 flex flex-col sm:flex-row items-center justify-between text-[11px] text-amber-900/80 font-serif">
          <span>{labels.priestTitle}</span>
          <span className="font-bold">ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ • ನೇರ ದೂರವಾಣಿ: 9972339362</span>
        </div>
      </div>
    </div>
  );
};
