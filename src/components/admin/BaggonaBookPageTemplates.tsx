import React from "react";
import {
  type UniversalBookPageResponse,
  type SamvatsaraMetadata,
  GOKARNA_RASHI_MANA_GHATI
} from "../../core/BaggonaUniversalBookEngine";

interface PageTemplateProps {
  page: UniversalBookPageResponse;
  meta: SamvatsaraMetadata;
}

/**
 * Standard Ornamental Border Frame used in traditional Baggona Panchanga printing
 */
export const BaggonaPageFrame: React.FC<{
  pageNumber: number;
  titleKn?: string;
  headerSubKn?: string;
  children: React.ReactNode;
}> = ({ pageNumber, titleKn, headerSubKn, children }) => {
  return (
    <div
      className="pdf-page-a4 relative w-[794px] h-[1123px] bg-[#FFFDF7] p-[28px] box-border text-slate-900 overflow-hidden flex flex-col justify-between"
      style={{
        fontFamily: "'Noto Sans Kannada', sans-serif",
        border: "3px double #78350f",
        boxShadow: "inset 0 0 0 2px #d97706, inset 0 0 0 5px #78350f"
      }}
    >
      {/* Top Header */}
      <div className="text-center pb-2 border-b-2 border-amber-900/60 flex-shrink-0">
        <div className="text-xs font-black tracking-widest text-amber-900 uppercase">
          -: {pageNumber} :-
        </div>
        {titleKn && (
          <h2 className="text-sm font-black text-amber-950 mt-0.5 leading-snug">
            {titleKn}
          </h2>
        )}
        {headerSubKn && (
          <div className="text-[10px] font-bold text-amber-800/90 font-sans">
            {headerSubKn}
          </div>
        )}
      </div>

      {/* Main Content Body */}
      <div className="flex-1 py-2 overflow-hidden flex flex-col justify-start text-[11px] leading-snug">
        {children}
      </div>

      {/* Classical Footer */}
      <div className="pt-1.5 border-t border-amber-900/40 text-[9px] font-sans font-bold text-amber-900 flex justify-between items-center flex-shrink-0">
        <span>॥ ಶ್ರೀ ಕುಲದೇವತಾ ಪ್ರಸನ್ನ ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ</span>
        <span>ಪುಟ {pageNumber} / ೧೦೪</span>
        <span>ಗೋಕರ್ಣ ದೃಗ್ಗಣಿತ ಪದ್ಧತಿ</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 1: AVATARANIKE (TABLE OF CONTENTS) & RAHUKALA-GULIKAKALA TABLE        */
/* -------------------------------------------------------------------------- */

export const Page01Avataranike: React.FC<PageTemplateProps> = ({ page, meta }) => {
  const toc: any[] = page.contentData?.toc || [];
  const col1 = toc.slice(0, 18);
  const col2 = toc.slice(18);

  const rahuGulikTable = [
    { day: "ರವಿವಾರ", rahu: "4.30 - 6.00", gulika: "3.00 - 4.30" },
    { day: "ಚಂದ್ರವಾರ", rahu: "7.30 - 9.00", gulika: "1.30 - 3.00" },
    { day: "ಮಂಗಳವಾರ", rahu: "3.00 - 4.30", gulika: "12.00 - 1.30" },
    { day: "ಬುಧವಾರ", rahu: "12.00 - 1.30", gulika: "10.30 - 12.00" },
    { day: "ಗುರುವಾರ", rahu: "1.30 - 3.00", gulika: "9.00 - 10.30" },
    { day: "ಶುಕ್ರವಾರ", rahu: "10.30 - 12.00", gulika: "7.30 - 9.00" },
    { day: "ಶನಿವಾರ", rahu: "9.00 - 10.30", gulika: "6.00 - 7.30" }
  ];

  return (
    <BaggonaPageFrame
      pageNumber={1}
      titleKn="--: ಅವತರಣಿಕೆ :--"
      headerSubKn={`ಶ್ರೀ ${meta.samvatsaraKn} ಸಂವತ್ಸರದ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ (ಶಕ ${meta.shakaYear})`}
    >
      <div className="space-y-3">
        {/* Dual Table of Contents */}
        <div className="grid grid-cols-2 gap-3 text-[10px]">
          <div className="border border-amber-900/60 rounded overflow-hidden">
            <div className="bg-amber-900 text-white font-black p-1 flex justify-between">
              <span>ಅ.ನಂ. ವಿವರಣೆ</span>
              <span>ಪುಟ</span>
            </div>
            <div className="divide-y divide-amber-200">
              {col1.map((item, idx) => (
                <div key={idx} className="p-1 flex justify-between bg-white hover:bg-amber-50">
                  <span className="truncate pr-1">{item.serialNo}. {item.titleKn}</span>
                  <span className="font-mono font-bold text-amber-950">{item.pageRange}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="border border-amber-900/60 rounded overflow-hidden">
              <div className="bg-amber-900 text-white font-black p-1 flex justify-between">
                <span>ಅ.ನಂ. ವಿವರಣೆ</span>
                <span>ಪುಟ</span>
              </div>
              <div className="divide-y divide-amber-200 max-h-48 overflow-y-auto">
                {col2.map((item, idx) => (
                  <div key={idx} className="p-1 flex justify-between bg-white hover:bg-amber-50">
                    <span className="truncate pr-1">{item.serialNo}. {item.titleKn}</span>
                    <span className="font-mono font-bold text-amber-950">{item.pageRange}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rahu & Gulika Kala box */}
            <div className="border border-amber-900/60 rounded overflow-hidden bg-white text-[9.5px]">
              <div className="bg-amber-950 text-white font-black p-1 text-center">
                ರಾಹುಕಾಲ ಮತ್ತು ಗುಳಿಕಕಾಲ ಕೋಷ್ಟಕ (ಗೋಕರ್ಣ ಸೂರ್ಯೋದಯ ಮಾನ)
              </div>
              <div className="p-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
                {rahuGulikTable.map((r) => (
                  <div key={r.day} className="flex justify-between border-b border-amber-100 py-0.5">
                    <span className="font-bold">{r.day}:</span>
                    <span>ರಾ: {r.rahu} | ಗು: {r.gulika}</span>
                  </div>
                ))}
              </div>
              <div className="p-1.5 bg-amber-50 text-[8.5px] text-amber-950 font-sans border-t border-amber-300 leading-tight">
                <strong>-: ಸೂಚನೆ :-</strong> ಈ ಮೇಲಿನ ಘಂಟೆಗಳನ್ನು ಸೂರ್ಯೋದಯವು ೬ ಘಂಟೆ ಎಂತಲೂ, ದಿನಮಾನ ಘಟಿ ೩೦ ಎಂತಲೂ ಇಟ್ಟುಕೊಂಡು ಬರೆದಿರುತ್ತೇವೆ. ಸೂರ್ಯೋದಯ ಮತ್ತು ದಿನಮಾನ ವ್ಯತ್ಯಾಸವಾದಾಗ ಹೆಚ್ಚು ಕಡಿಮೆ ಮಾಡಿಕೊಳ್ಳತಕ್ಕದ್ದು.
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaggonaPageFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 2 / HERITAGE ADS: GAJANANA STORES WITH CLASSICAL SHLOKA               */
/* -------------------------------------------------------------------------- */

export const Page02HeritageAd: React.FC<PageTemplateProps> = ({ page, meta }) => {
  return (
    <BaggonaPageFrame
      pageNumber={page.pageNumber}
      titleKn="ಶ್ರೀ ಗಜಾನನ ಸ್ಟೋರ್ಸ್ — ಜವಳಿ ವ್ಯಾಪಾರಿಗಳು, ಶಿರಸಿ"
    >
      <div className="flex-1 flex flex-col justify-center items-center text-center p-6 space-y-6">
        <div className="border-4 border-amber-800 rounded-2xl p-6 bg-amber-50/60 max-w-lg space-y-4">
          <div className="text-sm font-black text-amber-900">
            ವಸ್ತ್ರೇಣ ವಪುಷಾವಾಚಾ ವಿದ್ಯಯಾ ವಿನಯೇನ ಚ| <br />
            ವಕಾರೈಃ ಪಂಚಭಿರ್ ಹೀನಃ ಸಭಾಮಧ್ಯೇನ ಶೋಭತೇ||
          </div>
          <div className="text-xs text-slate-800 font-sans leading-relaxed">
            ವಸ್ತ್ರ(ವಪುಷ), ಶರೀರ, ಮಾತು, ವಿದ್ಯೆ, ವಿನಯ — ಈ ಐದು ‘ವ’ ಕಾರಗಳಿಂದ ಹೀನನಾದವನು ಸಭೆಯ ಮಧ್ಯೆ ಶೋಭಿಸುವುದಿಲ್ಲ.
          </div>
          <div className="w-24 h-0.5 bg-amber-800 mx-auto" />
          <h3 className="text-2xl font-black text-amber-950 tracking-wide">
            ಶ್ರೀ ಗಜಾನನ ಸ್ಟೋರ್ಸ್
          </h3>
          <p className="text-xs font-bold text-amber-900">
            ಚನ್ನಪಟ್ಟಣ ಬಜಾರ್, ಶಿರಸಿ • ದೂರವಾಣಿ: 9108899212
          </p>
          <div className="text-xs font-semibold text-slate-700">
            ೬೮ ವರ್ಷಗಳ ನಿರಂತರ ಸೇವೆಯ ಅಭಿಮಾನ ಮತ್ತು ಸಂತೃಪ್ತಿ • ಆಧುನಿಕ ಪ್ರಪಂಚದ ವೈವಿಧ್ಯಮಯ ಬಟ್ಟೆಗಳ ಕೇಂದ್ರ
          </div>
        </div>
      </div>
    </BaggonaPageFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 4 / 6: SWARNAVALLI SAMSTHANA ANNUAL FESTIVALS TIMETABLE              */
/* -------------------------------------------------------------------------- */

export const Page04SwarnavalliTable: React.FC<PageTemplateProps> = ({ page, meta }) => {
  const events = [
    { no: 1, masa: "ಚೈತ್ರ", paksha: "ಶುಕ್ಲ", tithi: "ಪಾಡ್ಯ", vara: "ಗುರು", date: "19/3/2026", details: "ವಸಂತಪೂಜಾ, ವಸಂತ ನವರಾತ್ರಿ ಆರಂಭ." },
    { no: 2, masa: "ಚೈತ್ರ", paksha: "ಕೃಷ್ಣ", tithi: "ಬಿದಿಗೆ", vara: "ಶನಿ", date: "04/4/2026", details: "ಶ್ರೀ ಪ್ರ ಪರಾತ್ಪರ ಗುರುಗಳ ಆರಾಧನೆ." },
    { no: 3, masa: "ಚೈತ್ರ", paksha: "ಕೃಷ್ಣ", tithi: "ದ್ವಾದಶಿ", vara: "ಕುಜ", date: "14/4/2026", details: "ಶ್ರೀ ಆನಂದಬೋಧೇಂದ್ರ ಸರಸ್ವತೀ ಶ್ರೀಗಳ ವರ್ಧಂತಿ." },
    { no: 4, masa: "ವೈಶಾಖ", paksha: "ಶುಕ್ಲ", tithi: "ತದಿಗೆ", vara: "ಚಂದ್ರ", date: "20/4/2026", details: "ಅಕ್ಷಯ್ಯತೃತೀಯಾ ಪುಣ್ಯಕಾಲ." },
    { no: 5, masa: "ವೈಶಾಖ", paksha: "ಶುಕ್ಲ", tithi: "ಪಂಚಮಿ", vara: "ಕುಜ", date: "21/4/2026", details: "ಶ್ರೀ ಶಂಕರ ಜಯಂತೀ." },
    { no: 6, masa: "ವೈಶಾಖ", paksha: "ಶುಕ್ಲ", tithi: "ದಶಮಿ", vara: "ರವಿ", date: "26/4/2026", details: "ಶ್ರೀ ನೃಸಿಂಹ ಮಂತ್ರ ಹವನ, ಕಲಶಾರೋಹಣ." },
    { no: 7, masa: "ವೈಶಾಖ", paksha: "ಶುಕ್ಲ", tithi: "ಚತುರ್ದಶಿ", vara: "ಗುರು", date: "30/4/2026", details: "ನೃಸಿಂಹ ಜಯಂತಿ." },
    { no: 8, masa: "ನಿಜ ಜ್ಯೇಷ್ಠ", paksha: "ಶುಕ್ಲ", tithi: "ನವಮಿ", vara: "ಕುಜ", date: "23/6/2026", details: "ಶ್ರೀ ಗಂಗಾಧರೇಂದ್ರ ಸರಸ್ವತೀ ಶ್ರೀಗಳ ವರ್ಧಂತ್ಯುತ್ಸವ." },
    { no: 9, masa: "ಆಷಾಢ", paksha: "ಶುಕ್ಲ", tithi: "ಹುಣ್ಣಿಮೆ", vara: "ಬುಧ", date: "29/7/2026", details: "ಚಾತುರ್ಮಾಸ್ಯವ್ರತ ಪ್ರಾರಂಭ, ವ್ಯಾಸಪೂಜಾ." },
    { no: 10, masa: "ಶ್ರಾವಣ", paksha: "ಶುಕ್ಲ", tithi: "ಪಂಚಮಿ", vara: "ಚಂದ್ರ", date: "17/8/2026", details: "ನಾಗ ಪಂಚಮಿ." },
    { no: 11, masa: "ಭಾದ್ರಪದ", paksha: "ಶುಕ್ಲ", tithi: "ಚೌತಿ", vara: "ಬುಧ", date: "16/9/2026", details: "ಶ್ರೀ ವಿನಾಯಕ ಚತುರ್ಥಿ." },
    { no: 12, masa: "ಆಶ್ವಯುಜ", paksha: "ಶುಕ್ಲ", tithi: "ದಶಮಿ", vara: "ಕುಜ", date: "20/10/2026", details: "ವಿಜಯಾದಶಮೀ, ಶಮೀಪೂಜಾ, ಸೀಮೋಲ್ಲಂಘನ." },
    { no: 13, masa: "ಕಾರ್ತಿಕ", paksha: "ಶುಕ್ಲ", tithi: "ದ್ವಾದಶಿ", vara: "ಶನಿ", date: "21/11/2026", details: "ಪ್ರಬೋಧೋತ್ಸವ, ತುಳಸೀ ವಿವಾಹ." },
    { no: 14, masa: "ಕಾರ್ತಿಕ", paksha: "ಶುಕ್ಲ", tithi: "ಹುಣ್ಣಿಮೆ", vara: "ಕುಜ", date: "24/11/2026", details: "ಶ್ರೀ ಲಕ್ಷ್ಮೀನೃಸಿಂಹ ದೀಪೋತ್ಸವ." },
    { no: 15, masa: "ಮಾಘ", paksha: "ಕೃಷ್ಣ", tithi: "ತ್ರಯೋದಶಿ", vara: "ಶನಿ", date: "06/3/2027", details: "ಮಹಾಶಿವರಾತ್ರಿ ವ್ರತ." }
  ];

  return (
    <BaggonaPageFrame
      pageNumber={page.pageNumber}
      titleKn={`ಶ್ರೀ ಶಕ ${meta.shakaYear} ${meta.samvatsaraKn} ಸಂವತ್ಸರದಲ್ಲಿ`}
      headerSubKn="ಶ್ರೀ ಸೋಂದಾ ಸ್ವರ್ಣವಲ್ಲೀ ಮಹಾಸಂಸ್ಥಾನದಲ್ಲಿ ನಡೆಯುವ ಉತ್ಸವಗಳು"
    >
      <div className="border border-amber-900/70 rounded overflow-hidden bg-white text-[10px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-amber-900 text-white font-black text-center text-[9px]">
              <th className="p-1 border-r border-amber-800">ಅ.ನಂ</th>
              <th className="p-1 border-r border-amber-800">ಮಾಸ</th>
              <th className="p-1 border-r border-amber-800">ಪಕ್ಷ</th>
              <th className="p-1 border-r border-amber-800">ತಿಥಿ</th>
              <th className="p-1 border-r border-amber-800">ವಾರ</th>
              <th className="p-1 border-r border-amber-800">ದಿನಾಂಕ</th>
              <th className="p-1">ಹಬ್ಬಗಳ ವಿವರ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-200">
            {events.map((ev) => (
              <tr key={ev.no} className="hover:bg-amber-50">
                <td className="p-1 font-black text-center border-r border-amber-200">{ev.no}</td>
                <td className="p-1 font-bold border-r border-amber-200">{ev.masa}</td>
                <td className="p-1 border-r border-amber-200 text-center">{ev.paksha}</td>
                <td className="p-1 border-r border-amber-200 text-center">{ev.tithi}</td>
                <td className="p-1 border-r border-amber-200 text-center">{ev.vara}</td>
                <td className="p-1 border-r border-amber-200 font-mono text-center">{ev.date}</td>
                <td className="p-1 font-semibold">{ev.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BaggonaPageFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 9: PRASTAVANE, SHRADDHA NIRNAYA & KANDAYA TABLES                     */
/* -------------------------------------------------------------------------- */

export const Page09PrastavaneAndShraddha: React.FC<PageTemplateProps> = ({ page, meta }) => {
  const dinapramanaTable = [
    { dina: "28-00", start: "16-48", end: "22-24" },
    { dina: "29-00", start: "17-24", end: "23-12" },
    { dina: "30-00", start: "18-00", end: "24-00" },
    { dina: "31-00", start: "18-36", end: "24-48" },
    { dina: "32-00", start: "19-12", end: "25-36" }
  ];

  const nakshatraKandaya = [
    { nak: "ಅಶ್ವಿನಿ, ಮಘಾ, ಮೂಲಾ", aaya: 14, vyaya: 11 },
    { nak: "ಭರಣಿ, ಹುಬ್ಬಾ, ಪೂ.ಷಾಢ", aaya: 8, vyaya: 5 },
    { nak: "ಕೃತ್ತಿಕಾ, ಉತ್ತರಾ, ಉ.ಷಾಢ", aaya: 11, vyaya: 11 },
    { nak: "ರೋಹಿಣಿ, ಹಸ್ತ, ಶ್ರವಣ", aaya: 8, vyaya: 14 },
    { nak: "ಮೃಗಶಿರ, ಚಿತ್ತಾ, ಧನಿಷ್ಠಾ", aaya: 14, vyaya: 11 },
    { nak: "ಆರ್ದ್ರಾ, ಸ್ವಾತಿ, ಶತಭಿಷಾ", aaya: 2, vyaya: 5 }
  ];

  const rashiKandaya = [
    { rashi: "ಮೇಷ, ವೃಶ್ಚಿಕ", aaya: 14, vyaya: 11 },
    { rashi: "ವೃಷಭ, ತುಲಾ", aaya: 8, vyaya: 5 },
    { rashi: "ಮಿಥುನ, ಕನ್ಯಾ", aaya: 14, vyaya: 2 },
    { rashi: "ಕರ್ಕಾಟಕ", aaya: 8, vyaya: 14 },
    { rashi: "ಸಿಂಹ", aaya: 11, vyaya: 11 },
    { rashi: "ಧನು, ಮೀನ", aaya: 11, vyaya: 2 }
  ];

  return (
    <BaggonaPageFrame
      pageNumber={page.pageNumber}
      titleKn="ಪ್ರಸ್ತಾವನೆ & ಶ್ರಾದ್ಧ ತಿಥಿ ನಿರ್ಣಯ"
      headerSubKn="ವಂದೇಽರವಿಂದರಮಣಂ ವೃಂದಾರಕ ವೃಂದವಂದಿತಂ ತರಣಿಂ"
    >
      <div className="space-y-3 text-[10px] text-amber-950">
        <div className="grid grid-cols-2 gap-3">
          {/* Left: Prastavane Editorial */}
          <div className="p-2 border border-amber-300 rounded bg-white space-y-1.5 leading-relaxed">
            <h4 className="font-black text-amber-900 border-b border-amber-200 pb-0.5">
              ಪ್ರಸ್ತಾವನೆ ({meta.editionNumber}ನೇ ಆವೃತ್ತಿ)
            </h4>
            <p>
              ಪ್ರತ್ಯಕ್ಷಂ ಜ್ಯೋತಿಷಂ ಶಾಸ್ತ್ರಂ ಚಂದ್ರಾರ್ಕೌ ಯತ್ರ ಸಾಕ್ಷಿಣೌ... ಅನಾದಿಕಾಲದಿಂದಲೂ ಸೂಕ್ಷ್ಮ ದೃಗ್ಗಣಿತ ರೀತಿಯಲ್ಲಿ ಪಂಚಾಂಗ ತಯಾರಿಸುತ್ತಿದ್ದು, ದಿವಂಗತ ಶ್ರೀ ರಾಮ ವೆಂಕಟರಮಣ ಪಂಡಿತ ಗೋಕರ್ಣ ಇವರ ಆಶೀರ್ವಾದದಿಂದ ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರದ ಪಂಚಾಂಗವನ್ನು ಭಕ್ತರ ಕೈಯಲ್ಲಿ ಅರ್ಪಿಸುತ್ತಿದ್ದೇವೆ.
            </p>
            <p className="font-sans text-[9px] text-slate-700">
              ಸಂಪಾದಕರು: ಶ್ರೀ ರಾಮ ಪಂಡಿತ - ಶ್ರೀ ಶಂಕರನಾರಾಯಣ ಪಂಡಿತ, ಬಗ್ಗೋಣ.
            </p>
          </div>

          {/* Right: Shraddha Nirnaya Rules */}
          <div className="p-2 border border-amber-300 rounded bg-white space-y-1 leading-relaxed">
            <h4 className="font-black text-amber-900 border-b border-amber-200 pb-0.5">
              ಶ್ರಾದ್ಧ ತಿಥಿ ನಿರ್ಣಯ ಸೂತ್ರ
            </h4>
            <p>
              <strong>“ಅಪರಾಹ್ನಃ ಪಿತೃಣಾಂ”</strong>: ಶ್ರಾದ್ಧಕ್ಕೆ ಮೃತ ತಿಥಿಯು ಅಪರಾಹ್ನ ವ್ಯಾಪಿನಿಯಾಗಿರಬೇಕು. ದಿನಪ್ರಮಾಣವು ೩೦ ಘಟಿಯಿರುವಾಗ ಹಗಲು ೧೮ ರ ಮೇಲಿನಿಂದ ೨೪ ಘಟಿಯವರೆಗಿನ ಕಾಲವು ಅಪರಾಹ್ನಕಾಲ.
            </p>
            {/* Dinapramana Table */}
            <div className="border border-amber-200 rounded overflow-hidden mt-1">
              <div className="bg-amber-100 text-[9px] font-black grid grid-cols-3 p-0.5 text-center">
                <span>ದಿನಪ್ರಮಾಣ</span>
                <span>ಅಪರಾಹ್ನ ಕಾಲದಿಂದ</span>
                <span>ಕಾಲದವರೆಗೆ</span>
              </div>
              {dinapramanaTable.map((dp) => (
                <div key={dp.dina} className="grid grid-cols-3 p-0.5 text-center text-[9px] border-t border-amber-100 font-mono">
                  <span>{dp.dina}</span>
                  <span>{dp.start}</span>
                  <span>{dp.end}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kandaya Tables */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="border border-amber-300 rounded p-1.5 bg-white">
            <h5 className="font-black text-amber-900 text-center pb-1 border-b border-amber-200 text-[9.5px]">
              ಅಥ ನಕ್ಷತ್ರ ಕಂದಾಯ (ಆದಾಯ-ವ್ಯಯ)
            </h5>
            <div className="grid grid-cols-3 text-center font-bold text-[9px] pt-1">
              <span className="text-left font-black">ನಕ್ಷತ್ರ</span>
              <span>ಆಯ</span>
              <span>ವ್ಯಯ</span>
              {nakshatraKandaya.map((k) => (
                <React.Fragment key={k.nak}>
                  <span className="text-left font-normal border-t border-amber-100 py-0.5 truncate">{k.nak}</span>
                  <span className="border-t border-amber-100 py-0.5 text-emerald-800 font-mono">{k.aaya}</span>
                  <span className="border-t border-amber-100 py-0.5 text-red-800 font-mono">{k.vyaya}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="border border-amber-300 rounded p-1.5 bg-white">
            <h5 className="font-black text-amber-900 text-center pb-1 border-b border-amber-200 text-[9.5px]">
              ಅಥ ರಾಶಿ ಕಂದಾಯ (ಆದಾಯ-ವ್ಯಯ)
            </h5>
            <div className="grid grid-cols-3 text-center font-bold text-[9px] pt-1">
              <span className="text-left font-black">ರಾಶಿ</span>
              <span>ಆಯ</span>
              <span>ವ್ಯಯ</span>
              {rashiKandaya.map((k) => (
                <React.Fragment key={k.rashi}>
                  <span className="text-left font-normal border-t border-amber-100 py-0.5 truncate">{k.rashi}</span>
                  <span className="border-t border-amber-100 py-0.5 text-emerald-800 font-mono">{k.aaya}</span>
                  <span className="border-t border-amber-100 py-0.5 text-red-800 font-mono">{k.vyaya}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaggonaPageFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 10: SHREEMUKHA BLESSING LETTERS (KANCHI & SWARNAVALLI)               */
/* -------------------------------------------------------------------------- */

export const Page10Shreemukha: React.FC<PageTemplateProps> = ({ page, meta }) => {
  return (
    <BaggonaPageFrame
      pageNumber={page.pageNumber}
      titleKn="॥ ಶ್ರೀಮುಖ ॥ (ಜಗದ್ಗುರುಗಳ ಆಶೀರ್ವಾದ ಪತ್ರ)"
      headerSubKn="ಶ್ರೀ ಕಂಚಿ ಕಾಮಕೋಟಿ ಪೀಠ & ಶ್ರೀ ಸ್ವರ್ಣವಲ್ಲೀ ಸಂಸ್ಥಾನ"
    >
      <div className="space-y-3 text-[10px] font-serif leading-relaxed text-amber-950">
        {/* Swarnavalli Shreemukha */}
        <div className="p-3 border-2 border-amber-800/60 rounded-xl bg-white space-y-2">
          <div className="text-center font-black text-amber-900 text-xs">
            ಶ್ರೀಮತ್ಪರಮಹಂಸ ಪರಿವ್ರಾಜಕಾಚಾರ್ಯವರ್ಯ ಶ್ರೀ ಸ್ವರ್ಣವಲ್ಲೀ ಮಹಾಸಂಸ್ಥಾನಾಧೀಶ <br />
            ಶ್ರೀ ಜಗದ್ಗುರು ಶ್ರೀ ಗಂಗಾಧರೇಂದ್ರ ಸರಸ್ವತೀ ಸ್ವಾಮಿಗಳವರ ಶ್ರೀಮುಖ
          </div>
          <p className="italic text-[9.5px] leading-normal">
            ವಿದಿತಮೇವ ಮತಿಮತಾಂ ಯತ್ ಸನಾತನ ಧರ್ಮಾನಿಷ್ಟಾಃ ಸದಾ ಕಾಲದೇಶೌ ವಿಮೃಶ್ಯೈವ ವೈದಿಕೇ ಲೌಕಿಕೇ ವಾ ಕರ್ಮಣಿ ಪ್ರವರ್ತಂತ ಇತಿ... ದೃಕ್ಸಿದ್ಧಾಂತಮಾದೃತ್ಯ ಕ್ರಿಯಮಾಣಂ ಬಗ್ಗೋಣಾಖ್ಯಮಿದಂ ಪಂಚಾಂಗಂ ಆಬಹು ಕಾಲಾತ್ ಆಸ್ತಿಕಜನಾನಾಂ ಉಪಕುರ್ವದಸ್ತಿ. ಪಂಡಿತಪ್ರವರಃ ಶ್ರೀ ರಾಮತನೂಜಃ ಶ್ರೀ ನಾರಾಯಣ ಪಂಡಿತಃ, ಶ್ರೀ ವೆಂಕಟರಮಣ ತನೂಜಃ ಶ್ರೀ ರಾಮ ಪಂಡಿತಶ್ಚ ಪರಸ್ಪರಂ ಸಹಯೋಗೇನ ಏತಾವತ್ ಕಾಲಂ ಪಂಚಾಂಗರಚನಾಕಾರ್ಯಮಧಿದಧತುಃ. ಇದಾನೀಂ ಶ್ರೀ ರಾಮ ಪಂಡಿತಃ ಶ್ರೀ ಶಂಕರನಾರಾಯಣ ಪಂಡಿತಶ್ಚ ಮಿಲಿತ್ವಾ ಪಂಚಾಂಗ ರಚನಾ ನಿರ್ಮಿತಿಂ ಕುರುತಃ.
          </p>
          <div className="text-right text-[9px] font-bold text-amber-900">
            — ನಾರಾಯಣ ಸ್ಮೃತಿಃ (ಶ್ರೀಕ್ಷೇತ್ರ ಗೋಕರ್ಣ)
          </div>
        </div>

        {/* Kanchi Shreemukha */}
        <div className="p-3 border border-amber-300 rounded-xl bg-amber-50/50 space-y-1.5">
          <div className="text-center font-black text-amber-900 text-[11px]">
            ಶ್ರೀ ಕಂಚಿ ಕಾಮಕೋಟಿ ಪೀಠಾಧಿಪತಿ ಜಗದ್ಗುರು ಶ್ರೀ ಶಂಕರಾಚಾರ್ಯ ವರ್ಯರ ಅನುಗ್ರಹ ಪತ್ರ
          </div>
          <p className="text-[9.5px]">
            ಸ್ವಸ್ತಿ ಶ್ರೀಮದಖಿಲ ಭೂಮಂಡಲಾಲಂಕಾರ ತ್ರಯಸ್ತ್ರಿಂಶತ್ಕೋಟಿ ದೇವತಾ ಸೇವಿತ ಶ್ರೀ ಕಾಮಾಕ್ಷೀದೇವೀ ಸನಾಥ ಶ್ರೀಮದೇಕಾಮ್ರನಾಥ ಸನ್ನಿಧೌ... ಬಗ್ಗೋಣ ಪಂಚಾಂಗಂ ಪ್ರವರ್ತಯತೋಃ ಶ್ರೀಮತೋಃ ರಾಮ ವೆಂಕಟರಮಣ ಪಂಡಿತ - ಗಣಪತಿ ರಾಮ ಪಂಡಿತ ಮಹಾಶಯಯೋಃ ಶುಭಂ ಭವತು.
          </p>
        </div>
      </div>
    </BaggonaPageFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 12: NAVANAYAKAGALU & SAMVATSARA PHALAM                                */
/* -------------------------------------------------------------------------- */

export const Page12Navanayakas: React.FC<PageTemplateProps> = ({ page, meta }) => {
  const nayakas = page.contentData?.navanayakagalu || {};

  return (
    <BaggonaPageFrame
      pageNumber={page.pageNumber}
      titleKn={`ಶ್ರೀ ${meta.samvatsaraKn} ಸಂವತ್ಸರಸ್ಯ ರಾಜಾದಿ ನವಾಧಿಪತಯಃ & ಸಂವತ್ಸರ ಫಲಂ`}
    >
      <div className="space-y-2 text-[9.5px] leading-tight text-amber-950">
        {/* Navanayakas 9-cell grid */}
        <div className="grid grid-cols-3 gap-1.5 text-center font-bold">
          {Object.entries(nayakas).map(([k, n]: any) => (
            <div key={k} className="border border-amber-300 rounded p-1 bg-white shadow-xs">
              <span className="text-amber-900 font-black block">{n.titleKn}</span>
              <span className="text-xs font-black text-amber-950 bg-amber-100 px-2 py-0.2 rounded-full inline-block mt-0.5">
                {n.lordKn}
              </span>
            </div>
          ))}
        </div>

        {/* Shlokas and Phalam Section */}
        <div className="border border-amber-300 rounded p-2 bg-white space-y-1.5 overflow-hidden">
          <h4 className="font-black text-center text-amber-900 border-b border-amber-200 pb-0.5 text-xs">
            ॥ ಅಥ ಸಂವತ್ಸರ ಫಲಂ ॥
          </h4>
          {Object.entries(nayakas).slice(0, 4).map(([k, n]: any) => (
            <div key={k} className="border-b border-amber-100 pb-1">
              <span className="font-black text-amber-900">{n.titleKn} {n.lordKn}: </span>
              <span className="italic text-[9px] text-slate-600">{n.shloka} </span>
              <span className="text-slate-800">{n.phalaKn}</span>
            </div>
          ))}
        </div>
      </div>
    </BaggonaPageFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PANCHANGA DUAL-PAGE: LEFT EVEN PAGE (10 COLUMNS + GRAHA CHAKRA)            */
/* -------------------------------------------------------------------------- */

export const PagePanchangaLeft: React.FC<PageTemplateProps> = ({ page, meta }) => {
  const days = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <BaggonaPageFrame
      pageNumber={page.pageNumber}
      titleKn={`ದೈನಂದಿನ ಪಂಚಾಂಗಾಂಗಗಳು & ಮಾಸಾಂತ ಗ್ರಹಚಕ್ರ`}
      headerSubKn={`ಶ್ರೀ ${meta.samvatsaraKn} ಸಂವತ್ಸರ • ಗೋಕರ್ಣ ಸೂರ್ಯೋದಯ ಮಾನ`}
    >
      <div className="flex-1 flex flex-col justify-between space-y-2">
        {/* 10-Column Daily Table */}
        <div className="border border-amber-900 rounded overflow-hidden bg-white text-[9.5px]">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-amber-950 text-white font-black text-[8px]">
                <th className="p-0.5 border-r border-amber-800">ಸೌರ</th>
                <th className="p-0.5 border-r border-amber-800">ಚಾ/ವಾ</th>
                <th className="p-0.5 border-r border-amber-800">ತಿಥಿ (ಘ/ಗಂ)</th>
                <th className="p-0.5 border-r border-amber-800">ರವಿನಕ್ಷತ್ರ</th>
                <th className="p-0.5 border-r border-amber-800">ಚಂದ್ರನಕ್ಷತ್ರ ಅಂತ್ಯ</th>
                <th className="p-0.5 border-r border-amber-800">ಯೋಗ</th>
                <th className="p-0.5 border-r border-amber-800">ಕರಣ</th>
                <th className="p-0.5 border-r border-amber-800">ವಿಷ/ಅಮೃತ</th>
                <th className="p-0.5 border-r border-amber-800">ದಿನಮಾನ</th>
                <th className="p-0.5 text-left pl-1">ಶ್ರಾದ್ಧ ತಿಥಿ & ಧಾರ್ಮಿಕ ವಿಶೇಷಗಳು</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-200">
              {days.map((d) => (
                <tr key={d} className={`text-[8.5px] ${d % 2 === 0 ? "bg-amber-50/40" : "bg-white"}`}>
                  <td className="p-0.5 font-bold border-r border-amber-200">{d}</td>
                  <td className="p-0.5 font-black border-r border-amber-200">{d} {["ರ", "ಚಂ", "ಕು", "ಬು", "ಗು", "ಶು", "ಶ"][d % 7]}</td>
                  <td className="p-0.5 border-r border-amber-200 font-mono">15/46 12:49</td>
                  <td className="p-0.5 border-r border-amber-200">ರೇವತಿ ೪</td>
                  <td className="p-0.5 border-r border-amber-200 font-mono">ಅಶ್ವಿನಿ 16/34</td>
                  <td className="p-0.5 border-r border-amber-200">ಸುಕರ್ಮ</td>
                  <td className="p-0.5 border-r border-amber-200">ಬವ</td>
                  <td className="p-0.5 border-r border-amber-200 font-mono">18/45-28/44</td>
                  <td className="p-0.5 border-r border-amber-200 font-mono">30-15</td>
                  <td className="p-0.5 text-left pl-1 truncate font-semibold">ಪಾಡ್ಯ ಶ್ರಾದ್ಧ | ವತ್ಸರಾರಂಭಃ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Graha Spashta & South Indian Square Kundli */}
        <div className="grid grid-cols-2 gap-2 text-[9px]">
          <div className="border border-amber-300 rounded p-1.5 bg-white">
            <div className="font-black text-amber-900 border-b border-amber-200 pb-0.5 text-center text-[9px]">
              ಮಾಸಾಂತ ಸೂರ್ಯೋದಯ ಗ್ರಹಸ್ಪಷ್ಟ
            </div>
            <div className="grid grid-cols-4 gap-1 p-1 text-center">
              <div>ರವಿ: ಮೀನ ೨೮°</div>
              <div>ಚಂದ್ರ: ಧನು ೧೪°</div>
              <div>ಕುಜ: ಕುಂಭ ೮°</div>
              <div>ಬುಧ: ಮೀನ ೧೨°</div>
              <div>ಗುರು: ಮಿಥುನ ೨೨°</div>
              <div>ಶುಕ್ರ: ಮೀನ ೧೯°</div>
              <div>ಶನಿ: ಮೀನ ೭°</div>
              <div>ರಾಹು: ಕುಂಭ ೨೦°</div>
            </div>
          </div>

          {/* South Indian Square Kundli Chakra */}
          <div className="border-2 border-amber-800 rounded p-1 bg-white flex flex-col justify-center items-center">
            <div className="text-[8.5px] font-black text-amber-900 mb-0.5">ದಕ್ಷಿಣ ಭಾರತೀಯ ಗ್ರಹಚಕ್ರ (Graha Chakra)</div>
            <div className="grid grid-cols-4 grid-rows-4 w-32 h-24 border border-amber-700 text-[8px] font-bold text-center">
              <div className="border border-amber-400 p-0.5">ಮೀನ ರ,ಶ</div>
              <div className="border border-amber-400 p-0.5">ಮೇಷ</div>
              <div className="border border-amber-400 p-0.5">ವೃಷಭ</div>
              <div className="border border-amber-400 p-0.5">ಮಿಥುನ ಗು</div>
              <div className="border border-amber-400 p-0.5">ಕುಂಭ ಕು,ರಾ</div>
              <div className="col-span-2 row-span-2 border border-amber-600 bg-amber-50 flex items-center justify-center font-black text-[9px] text-amber-950">
                ಗ್ರಹಚಕ್ರ
              </div>
              <div className="border border-amber-400 p-0.5">ಕರ್ಕ</div>
              <div className="border border-amber-400 p-0.5">ಮಕರ</div>
              <div className="border border-amber-400 p-0.5">ಸಿಂಹ</div>
              <div className="border border-amber-400 p-0.5">ಧನು ಚಂ</div>
              <div className="border border-amber-400 p-0.5">ವೃಶ್ಚಿಕ</div>
              <div className="border border-amber-400 p-0.5">ತುಲಾ</div>
              <div className="border border-amber-400 p-0.5">ಕನ್ಯಾ ಕೇ</div>
            </div>
          </div>
        </div>
      </div>
    </BaggonaPageFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PANCHANGA DUAL-PAGE: RIGHT ODD PAGE (12 DINA LAGNA ENDINGS & GRAHA SPASHTA)*/
/* -------------------------------------------------------------------------- */

export const PagePanchangaRight: React.FC<PageTemplateProps> = ({ page, meta }) => {
  return (
    <BaggonaPageFrame
      pageNumber={page.pageNumber}
      titleKn={`ದಿವಾ ಲಗ್ನಗಳ ಸಮಾಪ್ತಿ ಕಾಲ & ದೈನಂದಿನ ಗ್ರಹಸ್ಪಷ್ಟ`}
      headerSubKn="ಗೋಕರ್ಣ ಅಕ್ಷಾಂಶ ೧೪° ೩೨' ಕ್ಕೆ ತಯಾರಿಸಿದ ದೈನಂದಿನ ಲಗ್ನಾಂತ ಕೋಷ್ಟಕ"
    >
      <div className="space-y-3 text-[10px]">
        {/* Top: 7 Graha Daily Movements */}
        <div className="border border-amber-300 rounded p-1.5 bg-white">
          <div className="bg-amber-100/70 p-1 text-center font-black text-[9.5px] text-amber-950 border-b border-amber-200">
            ಸೂರ್ಯೋದಯ ಕಾಲದ ಗ್ರಹಗಳ ನಕ್ಷತ್ರ, ಚರಣ ಮುಕ್ತಾಯ ಗಂ.ಮಿ. ರಾಶಿ ನವಾಂಶ
          </div>
          <div className="p-1 text-[9px] grid grid-cols-7 gap-1 text-center font-semibold">
            <div>ರವಿ: ರೇವತಿ ೪</div>
            <div>ಕುಜ: ಶತಭಿಷ ೧</div>
            <div>ಬುಧ: ಉತ್ತರಾ ೧</div>
            <div>ಗುರು: ಪುನರ್ವಸು ೩</div>
            <div>ಶುಕ್ರ: ಅಶ್ವಿನಿ ೨</div>
            <div>ಶನಿ: ಉತ್ತರಾಭಾದ್ರ ೪</div>
            <div>ರಾಹು: ಪೂರ್ವಾಭಾದ್ರ ೧</div>
          </div>
        </div>

        {/* 12 Dina Lagna Ending times table */}
        <div className="border border-amber-900/80 rounded overflow-hidden bg-white">
          <div className="bg-amber-900 text-white font-black p-1 text-center text-[9.5px]">
            ದಿವಾ ಲಗ್ನಗಳ ಸಮಾಪ್ತಿ ಕಾಲದ ಘಂಟೆ. ಮಿನಿಟು (Gokarna Oblique Ascensions)
          </div>
          <div className="grid grid-cols-4 gap-1.5 p-2 text-[9.5px] font-mono text-center">
            {GOKARNA_RASHI_MANA_GHATI.map((r) => (
              <div key={r.rashiKn} className="border border-amber-200 p-1 rounded bg-amber-50/50">
                <span className="font-serif font-black text-amber-950 block">{r.rashiKn} ಲಗ್ನ:</span>
                <span className="text-amber-900 font-bold">ಉದಯ: {r.ghati}ಘ {r.vighati}ವಿ</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chandra Pada Endings */}
        <div className="border border-amber-300 rounded p-2 bg-white text-[9.5px]">
          <div className="font-black text-amber-900 border-b border-amber-200 pb-0.5 text-center">
            ಚಂದ್ರ ನಕ್ಷತ್ರ ಚರಣ ಸಮಾಪ್ತಿಯ ಘಂಟೆ. ಮಿನಿಟು (೪ ಪಾದಗಳ ಮುಕ್ತಾಯ ಸಮಯ)
          </div>
          <div className="grid grid-cols-4 gap-2 pt-1 text-center text-[9px]">
            <div>೧ನೇ ಪಾದ: ೧೧:೧೭</div>
            <div>೨ನೇ ಪಾದ: ೧೬:೩೪</div>
            <div>೩ನೇ ಪಾದ: ೨೧:೫೨</div>
            <div>೪ನೇ ಪಾದ: ೨೭:೧೦</div>
          </div>
        </div>
      </div>
    </BaggonaPageFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* UNIVERSAL PAGE RENDERER DISPATCHER                                          */
/* -------------------------------------------------------------------------- */

export const UniversalBaggonaPageRenderer: React.FC<{
  page: UniversalBookPageResponse;
  meta: SamvatsaraMetadata;
}> = ({ page, meta }) => {
  switch (page.layoutTemplateId) {
    case "page_01_index_and_rahukala":
      return <Page01Avataranike page={page} meta={meta} />;
    case "heritage_advertisement_full":
      return <Page02HeritageAd page={page} meta={meta} />;
    case "swarnavalli_annual_festivals":
      return <Page04SwarnavalliTable page={page} meta={meta} />;
    case "prastavane_and_shraddha_nirnaya":
      return <Page09PrastavaneAndShraddha page={page} meta={meta} />;
    case "shreemukha_blessings":
      return <Page10Shreemukha page={page} meta={meta} />;
    case "navanayakas_and_year_result":
      return <Page12Navanayakas page={page} meta={meta} />;
    case "panchanga_left_even_page":
      return <PagePanchangaLeft page={page} meta={meta} />;
    case "panchanga_right_odd_page":
      return <PagePanchangaRight page={page} meta={meta} />;
    default:
      return (
        <BaggonaPageFrame
          pageNumber={page.pageNumber}
          titleKn={page.titleKn}
          headerSubKn={`ಶ್ರೀ ${meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ ${meta.shakaYear}`}
        >
          <div className="flex-1 flex flex-col justify-center items-center text-center p-6 space-y-4">
            <div className="text-3xl">📜</div>
            <h3 className="text-base font-black text-amber-950">{page.titleKn}</h3>
            <p className="text-xs text-slate-700 max-w-md font-sans">
              ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ೧೦೪ ಪುಟಗಳ ಮುದ್ರಣ ಆವೃತ್ತಿಯ ಪುಟ {page.pageNumber} ರ ಶಾಸ್ತ್ರೀಯ ಲೇಖನ ಮತ್ತು ಮುದ್ರಣ ವಿನ್ಯಾಸ.
            </p>
            <div className="text-[10px] font-mono text-amber-800 bg-amber-100/80 px-3 py-1 rounded">
              ವರ್ಗ: {page.sectionCategory} • ಮಾದರಿ: {page.layoutTemplateId}
            </div>
          </div>
        </BaggonaPageFrame>
      );
  }
};
