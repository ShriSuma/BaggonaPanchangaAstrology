import React from "react";
import Card from "../ui/Card";
import type { LifeStageMilestones } from "../../features/palmreading/palmReadingEngine";

type Props = {
  milestones: LifeStageMilestones;
  lang: string;
  devoteeName: string;
};

export const PalmLifeStageMilestonesCard: React.FC<Props> = ({
  milestones,
  lang,
  devoteeName
}) => {
  const isKn = lang === "kn";

  return (
    <Card className="border-2 border-amber-400/90 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 p-5 shadow-md space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-300 pb-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800">
            {isKn ? "ವಯೋಮಾನ & ಜೀವನ ಹಂತಗಳ ಸಾಮುದ್ರಿಕ ವಿಶ್ಲೇಷಣೆ" : "Age-Stratified Life Milestones"}
          </div>
          <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2 mt-0.5">
            <span>⏳</span>
            <span>
              {isKn
                ? `ಹಸ್ತದ ರೇಖಾ ವಯಸ್ಸು: ಸುಮಾರು ${milestones.estimatedAge} ವರ್ಷಗಳು`
                : `Palm Chronological Age: ~${milestones.estimatedAge} Years`}
            </span>
          </h3>
        </div>

        <div className="rounded-full bg-amber-100 border border-amber-300 px-3.5 py-1 text-xs font-bold text-amber-900 shadow-sm">
          {isKn ? milestones.currentPhaseKn : milestones.currentPhaseEn}
        </div>
      </div>

      {/* 4 Life Milestone Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1: Education & Intellectual Specialization */}
        <div className="rounded-2xl border border-sky-200 bg-sky-50/40 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-200 pb-1.5">
            <span className="font-serif text-xs font-bold text-sky-950 flex items-center gap-1.5">
              <span>🎓</span>
              <span>{isKn ? "೧. ವಿದ್ಯಾಭ್ಯಾಸ & ಜ್ಞಾನಾರ್ಜನೆ (Education & Mind)" : "1. Education & Intellect"}</span>
            </span>
            <span className="text-[10px] bg-sky-100 text-sky-900 font-bold px-2 py-0.5 rounded-full">
              Buddhi Rekha
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
            <div>
              <span className="font-bold text-sky-900">{isKn ? "ಬುದ್ಧಿಶಕ್ತಿ & ಅಧ್ಯಯನ ಶೈಲಿ:" : "Intellectual Strength:"}</span>{" "}
              <span>{isKn ? milestones.education.intellectTraitKn : milestones.education.intellectTraitEn}</span>
            </div>
            <div>
              <span className="font-bold text-sky-900">{isKn ? "ಪ್ರಶಸ್ತ ವಿದ್ಯಾಭ್ಯಾಸ ಕ್ಷೇತ್ರ:" : "Auspicious Fields of Study:"}</span>{" "}
              <span className="font-semibold text-sky-950">{isKn ? milestones.education.recommendedFieldsKn : milestones.education.recommendedFieldsEn}</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Marriage & Partnership Timing */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between border-b border-rose-200 pb-1.5">
            <span className="font-serif text-xs font-bold text-rose-950 flex items-center gap-1.5">
              <span>💍</span>
              <span>{isKn ? "೨. ವಿವಾಹ & ದಾಂಪತ್ಯ ಯೋಗ (Marriage & Timing)" : "2. Marriage & Union Timing"}</span>
            </span>
            <span className="text-[10px] bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded-full">
              Vivaha Rekha
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
            <div>
              <span className="font-bold text-rose-900">{isKn ? "ವಿವಾಹ ಯೋಗದ ವಯೋಮಾನ:" : "Marriage Age Window:"}</span>{" "}
              <span className="font-extrabold text-rose-950">{isKn ? milestones.marriage.timingAgeWindowKn : milestones.marriage.timingAgeWindowEn}</span>
            </div>
            <div>
              <span className="font-bold text-rose-900">{isKn ? "ಜೀವನ ಸಂಗಾತಿಯ ಗುಣಲಕ್ಷಣ:" : "Spouse Characteristics:"}</span>{" "}
              <span>{isKn ? milestones.marriage.spouseTraitKn : milestones.marriage.spouseTraitEn}</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Children & Family Expansion */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
            <span className="font-serif text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <span>👶</span>
              <span>{isKn ? "೩. ಸಂತಾನ & ಗೃಹ ಸೌಭಾಗ್ಯ (Children & Family)" : "3. Children & Domestic Bliss"}</span>
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
              Santana Yoga
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
            <div>
              <span className="font-bold text-emerald-900">{isKn ? "ಸಂತಾನ ಯೋಗ ಸೂಚನೆಗಳು:" : "Children Indications:"}</span>{" "}
              <span>{isKn ? milestones.children.prospectsKn : milestones.children.prospectsEn}</span>
            </div>
            <div>
              <span className="font-bold text-emerald-900">{isKn ? "ಕುಟುಂಬದ ದೈವಿಕ ಆಶೀರ್ವಾದ:" : "Family Legacy:"}</span>{" "}
              <span>{isKn ? milestones.children.familyBlessingKn : milestones.children.familyBlessingEn}</span>
            </div>
          </div>
        </div>

        {/* Pillar 4: Career Breakthrough & Peak Wealth Age */}
        <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
            <span className="font-serif text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <span>💰</span>
              <span>{isKn ? "೪. ವೃತ್ತಿ & ಸರ್ವೋಚ್ಚ ಧನ ಯೋಗ (Career & Wealth Peak)" : "4. Career & Peak Wealth"}</span>
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
              Bhagya Rekha
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
            <div>
              <span className="font-bold text-amber-900">{isKn ? "ಸರ್ವೋಚ್ಚ ಧನ ಸಂಪಾದನೆಯ ವಯಸ್ಸು:" : "Peak Wealth Earning Ages:"}</span>{" "}
              <span className="font-extrabold text-amber-950">{isKn ? milestones.careerWealth.peakWealthAgeKn : milestones.careerWealth.peakWealthAgeEn}</span>
            </div>
            <div>
              <span className="font-bold text-amber-900">{isKn ? "ವೃತ್ತಿ ಪ್ರಗತಿಯ ಪಥ:" : "Career Trajectory:"}</span>{" "}
              <span>{isKn ? milestones.careerWealth.trajectoryKn : milestones.careerWealth.trajectoryEn}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
