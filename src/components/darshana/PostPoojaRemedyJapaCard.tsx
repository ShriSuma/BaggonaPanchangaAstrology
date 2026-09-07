import React, { useMemo } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import type { KundliOutput } from "../../core/AstroTypes";
import { determineKundliPersonalRemedy } from "../../features/remedies/kundliPersonalRemedyJapaEngine";
import { RemedyJapa11Counter } from "./RemedyJapa11Counter";
import type { DevoteeStreakRecord, DevoteeMilestoneReward } from "../../features/seva/devoteeStreakService";

export interface PostPoojaRemedyJapaCardProps {
  birthKundli?: KundliOutput | null;
  devoteeName?: string;
  gotra?: string;
  rashiName?: string;
  nakshatraName?: string;
  lang?: SevaLang;
  voiceId?: string;
  onJapaCompleted?: (streak: DevoteeStreakRecord, unlocked: DevoteeMilestoneReward[]) => void;
  className?: string;
}

export const PostPoojaRemedyJapaCard: React.FC<PostPoojaRemedyJapaCardProps> = ({
  birthKundli,
  devoteeName = "ಭಕ್ತರು",
  gotra = "ಕಾಶ್ಯಪ",
  rashiName,
  nakshatraName,
  lang = "kn",
  voiceId = "voice_shrisuma_master",
  onJapaCompleted,
  className = ""
}) => {
  const remedyInfo = useMemo(() => {
    return determineKundliPersonalRemedy({
      birthKundli,
      devoteeName,
      rashiName,
      nakshatraName,
      lang
    });
  }, [birthKundli, devoteeName, rashiName, nakshatraName, lang]);

  const headerText = {
    kn: {
      title: "ಪೂಜೋತ್ತರ ಜನ್ಮಕುಂಡಲಿ ಪರಿಹಾರ ಜಪ (೧೧ ಬಾರಿ)",
      subtitle: "ನಿಮ್ಮ ಕುಂಡಲಿಯ ಗ್ರಹದೋಷ ನಿವಾರಣೆಗೆ ಹಾಗೂ ಮನಸ್ಸಿನ ಶಾಂತಿಗೆ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ದಿವ್ಯ ಮಂತ್ರ"
    },
    te: {
      title: "పూజానంతర జన్మకుండలి పరిహార జపం (౧౧ సార్లు)",
      subtitle: "మీ కుండలి గ్రహదోష నివారణకు మరియు మనఃశాంతికి గోకర్ణ క్షేత్ర దివ్య మంత్రం"
    },
    ta: {
      title: "பூஜைக்குப் பின் ஜாதக பரிகார ஜபம் (11 முறை)",
      subtitle: "உங்கள் ஜாதக கிரக தோஷ நிவர்த்திக்கும் மன அமைதிக்கும் கோகர்ண க்ஷேத்திர திவ்ய மந்திரம்"
    },
    hi: {
      title: "पूजोत्तर जन्मकुंडली निवारण जप (११ बार)",
      subtitle: "आपकी कुंडली के ग्रह दोष निवारण एवं मानसिक शांति हेतु गोकर्ण क्षेत्र का दिव्य मंत्र"
    },
    en: {
      title: "Post-Pooja Kundli Remedy Chanting (11 Times)",
      subtitle: "Vedic sanctuary mantra for pacifying planetary friction and granting serene peace of mind"
    }
  }[lang] || {
    title: "Post-Pooja Kundli Remedy Chanting (11 Times)",
    subtitle: "Vedic sanctuary mantra for pacifying planetary friction and granting serene peace of mind"
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Intro Context Banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/30">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-2xl">
          🕉️
        </div>
        <div>
          <h4 className="text-base font-bold text-amber-200">
            {headerText.title}
          </h4>
          <p className="text-xs text-amber-300/80 mt-0.5">
            {headerText.subtitle}
          </p>
        </div>
      </div>

      {/* Interactive 11-Bead Japamala Counter */}
      <RemedyJapa11Counter
        remedyInfo={remedyInfo}
        lang={lang}
        devoteeName={devoteeName}
        gotra={gotra}
        voiceId={voiceId}
        onJapaCompleted={onJapaCompleted}
      />
    </div>
  );
};
