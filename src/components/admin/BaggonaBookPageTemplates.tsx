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

/* -------------------------------------------------------------------------- */
/* CORNER FLOURISH (AUTHENTIC TRADITIONAL INDIAN CORNER ORNAMENT)             */
/* -------------------------------------------------------------------------- */

const CornerFlourish: React.FC<{ position: "tl" | "tr" | "bl" | "br" }> = ({ position }) => {
  const styles: Record<string, React.CSSProperties> = {
    tl: { top: 2, left: 2 },
    tr: { top: 2, right: 2, transform: "scaleX(-1)" },
    bl: { bottom: 2, left: 2, transform: "scaleY(-1)" },
    br: { bottom: 2, right: 2, transform: "scale(-1, -1)" }
  };
  return (
    <svg
      viewBox="0 0 40 40"
      className="absolute w-[22px] h-[22px] pointer-events-none z-10"
      style={styles[position]}
    >
      <path
        d="M2,2 L38,2 C28,5 20,12 16,20 C12,12 5,5 2,2 Z M2,2 L2,38 C5,28 12,20 20,16 C12,12 5,5 2,2 Z M6,6 C10,9 14,14 16,19 C14,14 9,10 6,6 Z"
        fill="#000000"
      />
      <circle cx="10" cy="10" r="1.5" fill="#000000" />
      <circle cx="18" cy="6" r="1" fill="#000000" />
      <circle cx="6" cy="18" r="1" fill="#000000" />
    </svg>
  );
};

/* -------------------------------------------------------------------------- */
/* MASTER LANDSCAPE FRAME (A4 LANDSCAPE: 297mm x 210mm / 1123px x 794px)       */
/* -------------------------------------------------------------------------- */

export const BaggonaLandscapeFrame: React.FC<{
  pageNumber: number;
  topHeaderKn?: string;
  hideTopNumber?: boolean;
  hideFlourishes?: boolean;
  singleBorder?: boolean;
  topCenterText?: string;
  innerPadding?: string;
  children: React.ReactNode;
}> = ({
  pageNumber,
  topHeaderKn,
  hideTopNumber = false,
  hideFlourishes = false,
  singleBorder = false,
  topCenterText,
  innerPadding,
  children
}) => {
  return (
    <div
      className="pdf-page pdf-page-landscape relative w-[1123px] h-[794px] bg-white p-[10px] box-border text-black overflow-hidden flex flex-col justify-between select-none"
      style={{
        fontFamily: "'Noto Sans Kannada', serif, sans-serif",
        color: "#000000"
      }}
    >
      {/* Top Center Page Header */}
      {!hideTopNumber && (
        <div className="w-full text-center text-[14px] font-bold text-black pb-[3px] leading-tight font-serif">
          {topCenterText !== undefined ? topCenterText : `-:${pageNumber}:-`}
        </div>
      )}

      {/* Outer Frame */}
      {singleBorder ? (
        <div className="relative w-full flex-1 border-[2px] border-black box-border flex flex-col bg-white overflow-hidden">
          {children}
        </div>
      ) : (
        <div className="relative w-full flex-1 border-[2.5px] border-black p-[2px] box-border flex flex-col justify-between bg-white overflow-hidden">
          {/* Inner Border */}
          <div className={`relative w-full h-full border border-black ${innerPadding !== undefined ? innerPadding : "p-[5px]"} box-border flex flex-col justify-between overflow-hidden`}>
            {/* 4 Corner Traditional Floral Flourishes */}
            {!hideFlourishes && (
              <>
                <CornerFlourish position="tl" />
                <CornerFlourish position="tr" />
                <CornerFlourish position="bl" />
                <CornerFlourish position="br" />
              </>
            )}

            {topHeaderKn && (
              <div className="w-full text-center font-black text-[13px] border-b border-black pb-1 mb-1 tracking-wide">
                {topHeaderKn}
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Backward-compatible alias for existing consumers
export const BaggonaPageFrame = BaggonaLandscapeFrame;

/* -------------------------------------------------------------------------- */
/* PAGE 1: AVATARANIKE (TABLE OF CONTENTS) & RAHUKALA-GULIKAKALA TABLE        */
/* -------------------------------------------------------------------------- */

export const Page01Avataranike: React.FC<PageTemplateProps> = ({ page, meta }) => {
  const leftToc = [
    { no: 1, title: "ಪರಿವಿಡಿ, ರಾಹುಕಾಲ, ಗುಳಿಕಕಾಲ", page: "1" },
    { no: 2, title: "ಜಾಹೀರಾತು", page: "2–5" },
    { no: 3, title: "ಸ್ವರ್ಣವಲ್ಲೀಯಲ್ಲಿ ನಡೆಯುವ ವಾರ್ಷಿಕ ಕಾರ್ಯಕ್ರಮಗಳು", page: "6" },
    { no: 4, title: "ಜಾಹೀರಾತು", page: "7" },
    { no: 5, title: "ಇಡಗುಂಜಿ ನಡೆಯುವ ವಾರ್ಷಿಕ ಕಾರ್ಯಕ್ರಮಗಳು", page: "8" },
    { no: 6, title: "ಪ್ರಸ್ತಾವನೆ, ಶ್ರಾದ್ಧ ತಿಥಿ ನಿರ್ಣಯ", page: "9" },
    { no: 7, title: "ಶ್ರೀಮುಖ", page: "10" },
    { no: 8, title: "ಸಂವತ್ಸರ ಫಲಶ್ರುತಿ, ಸಂವತ್ಸರ ಫಲಂ, ಆರ್ದ್ರಾ ಪ್ರವೇಶ ಕಾಲಫಲಂ, ಸಂಕ್ರಮಣ ಫಲಂ, ಗ್ರಹಣಗಳು ಗುರು-ಶುಕ್ರ ಅಸ್ತೋದಯ ಕಾಲ", page: "11–14" },
    { no: 9, title: "ಜಾಹೀರಾತು", page: "15–16" },
    { no: 10, title: "ಕೆಲವು ಕಾರ್ಯಗಳಿಗೆ ಉಪಯುಕ್ತ ವಿಷಯಗಳು", page: "17" },
    { no: 11, title: "ಸಂವತ್ಸರದಲ್ಲಿಯ ವಾರ್ಷಿಕ ಹಬ್ಬ-ಹುಣ್ಣಿಮೆಗಳು", page: "18" },
    { no: 12, title: "ಜಾತಕ ತತ್ವಗಳು ಗ್ರಹಕಾರಕತ್ವ", page: "19" },
    { no: 13, title: "ವರ್ಷಭವಿಷ್ಯ", page: "20–25" },
    { no: 14, title: "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದೇವಸ್ಥಾನದಲ್ಲಿ ನಡೆಯುವ ಉತ್ಸವಗಳು, ಕೃಷ್ಯಾಧಿ ಕರ್ಮಗಳಿಗೆ ಉಪಯುಕ್ತವಾದ ವಿವರಗಳು", page: "26" },
    { no: 15, title: "॥ಅಥ ಗೋಚರ ಫಲಂ॥", page: "27" },
    { no: 16, title: "ಆಶೌಚ ನಿರ್ಣಯ", page: "28–29" },
    { no: 17, title: "ಶ್ರೀ ಚಿತ್ರಾಪುರಮಠ ಶಿರಾಲಿಯಲ್ಲಿ ನಡೆಯುವ ವಿಶೇಷ ಹಬ್ಬಗಳು", page: "30" },
    { no: 18, title: "ಮುಹೂರ್ತಗಳು", page: "31–33" },
    { no: 19, title: "ಜಾಹೀರಾತು", page: "34–35" },
    { no: 20, title: "ಗೃಹ, ಗೋಷ್ಠ, ದೇವಾಲಯಗಳ ಆಯಗಳು", page: "36" },
    { no: 21, title: "ಜಾಹೀರಾತು", page: "37" },
    { no: 22, title: "ವಿಂಶೋತ್ತರಿ ದಶಾಂತರ್ದಶಾ ವಿವರಣಂ", page: "38" },
    { no: 23, title: "ಜಾಹೀರಾತು", page: "39" }
  ];

  const rightToc = [
    { no: 24, title: "ಪಂಚಾಂಗ", page: "40–91" },
    { no: 25, title: "ಜಾತಕಕೂಟ ಸಾರಾವಳಿ ಮುಹೂರ್ತ ನೋಡಲು ಉಪಯುಕ್ತವಾದ ವಿಷಯಗಳು ರಾಹುವಿರುವ ದಿಕ್ಕು", page: "92" },
    { no: 26, title: "ವರ ಮತ್ತು ವಧುವಿನ ಗುಣ ಕೋಷ್ಟಕ", page: "93–94" },
    { no: 27, title: "ಗೋಕರ್ಣ ಅಕ್ಷಾಂಶ ೧೪°/೩೨'ಕ್ಕೆ ತಯಾರಿಸಿದ ಲಗ್ನಸ್ಫುಟ ಸಾರಣಿಯು", page: "95" },
    { no: 28, title: "॥ಅಥ ಪ್ರಯಾಣಾರ್ಥಂ ಮುಹೂರ್ತ ರಾಜಯೋಗಚಕ್ರಂ॥", page: "96" },
    { no: 29, title: "ತಾರಾನುಕೂಲ ನೋಡುವ ಕೋಷ್ಟಕ", page: "97" },
    { no: 30, title: "ಮೂಲಾನಕ್ಷತ್ರಾದಿ ದುಷ್ಟಕಾಲ ಜನನಫಲವು", page: "98" },
    { no: 31, title: "ಶ್ರೀಮನೆಲೆಮಾವಿನ ಮಠದಲ್ಲಿ ನಡೆಯುವ ಉತ್ಸವಾದಿಗಳು", page: "99" },
    { no: 32, title: "ಆಷಾಢ, ಶ್ರಾವಣ ಹುಣ್ಣಿಮೆಗಳ ವಿಶೇಷ", page: "100" },
    { no: 33, title: "ಜಾಹೀರಾತು", page: "101–104" }
  ];

  const rahuGulikRows = [
    { day: "ರವಿವಾರ", rahu: "4.30–6", gulika: "3–4.30" },
    { day: "ಚಂದ್ರವಾರ", rahu: "7.30–9", gulika: "1.30–3" },
    { day: "ಮಂಗಳವಾರ", rahu: "3–4.30", gulika: "12–1.30" },
    { day: "ಬುಧವಾರ", rahu: "12–1.30", gulika: "10.30–12" },
    { day: "ಗುರುವಾರ", rahu: "1.30–3", gulika: "9–10.30" },
    { day: "ಶುಕ್ರವಾರ", rahu: "10.30–12", gulika: "7.30–9" },
    { day: "ಶನಿವಾರ", rahu: "9–10.30", gulika: "6–7.30" }
  ];

  return (
    <BaggonaLandscapeFrame pageNumber={1}>
      {/* Decorative Title Header */}
      <div className="flex items-center justify-center gap-3 border-b-2 border-black pb-1 mb-1">
        <span className="tracking-tighter font-mono text-[11px]">╠══════════════╣</span>
        <h1 className="text-[17px] font-black tracking-wider">--:ಅವತರಣಿಕೆ:--</h1>
        <span className="tracking-tighter font-mono text-[11px]">╠══════════════╣</span>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 grid grid-cols-2 gap-3 text-[10.5px] leading-tight overflow-hidden">
        {/* Left Column: TOC 1 to 23 */}
        <div className="border border-black flex flex-col">
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-black font-black bg-slate-100">
                <th className="border-r border-black p-[2px] w-[32px] text-center">ಅ. ನಂ.</th>
                <th className="border-r border-black p-[2px] text-left px-2">ವಿವರಣೆ</th>
                <th className="p-[2px] w-[45px] text-center">ಪುಟ ಸಂಖ್ಯೆ</th>
              </tr>
            </thead>
            <tbody>
              {leftToc.map((item) => (
                <tr key={item.no} className="border-b border-black/40 hover:bg-slate-50">
                  <td className="border-r border-black p-[2px] text-center font-bold">{item.no}</td>
                  <td className="border-r border-black p-[2px] px-2 font-medium truncate">{item.title}</td>
                  <td className="p-[2px] text-center font-bold">{item.page}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column: TOC 24 to 33 + Rahukala/Gulikakala */}
        <div className="flex flex-col justify-between space-y-2">
          {/* Top: TOC 24 to 33 */}
          <div className="border border-black">
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-black font-black bg-slate-100">
                  <th className="border-r border-black p-[2px] w-[32px] text-center">ಅ. ನಂ.</th>
                  <th className="border-r border-black p-[2px] text-left px-2">ವಿವರಣೆ</th>
                  <th className="p-[2px] w-[45px] text-center">ಪುಟ ಸಂಖ್ಯೆ</th>
                </tr>
              </thead>
              <tbody>
                {rightToc.map((item) => (
                  <tr key={item.no} className="border-b border-black/40 hover:bg-slate-50">
                    <td className="border-r border-black p-[2px] text-center font-bold">{item.no}</td>
                    <td className="border-r border-black p-[2px] px-2 font-medium truncate">{item.title}</td>
                    <td className="p-[2px] text-center font-bold">{item.page}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom: Rahukala & Gulikakala Section */}
          <div className="border-2 border-black flex-1 flex flex-row overflow-hidden">
            {/* Vertical Rotated Header */}
            <div className="w-[32px] bg-black text-white font-black flex items-center justify-center text-center p-1 text-[11px] [writing-mode:vertical-lr] rotate-180">
              ರಾಹುಕಾಲ ಮತ್ತು ಗುಳಿಕಕಾಲ
            </div>

            {/* Tables Container */}
            <div className="flex-1 flex flex-row divide-x border-black">
              {/* Tables */}
              <div className="w-[52%] flex flex-col text-[9.5px]">
                {/* Rahukala */}
                <div className="bg-black text-white font-black px-2 py-[2px] flex justify-between text-[10px]">
                  <span>ವಾರ</span>
                  <span>ರಾಹುಕಾಲ ಗಂ. ಮಿ.</span>
                </div>
                <table className="w-full border-collapse text-[9.5px]">
                  <tbody>
                    {rahuGulikRows.map((r) => (
                      <tr key={r.day} className="border-b border-black/40">
                        <td className="border-r border-black px-2 py-[1px] font-bold">{r.day}</td>
                        <td className="px-2 py-[1px] text-center font-mono font-bold">{r.rahu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Gulikakala */}
                <div className="bg-black text-white font-black px-2 py-[2px] flex justify-between text-[10px] border-t border-black">
                  <span>ವಾರ</span>
                  <span>ಗುಳಿಕಕಾಲ ಗಂ. ಮಿ.</span>
                </div>
                <table className="w-full border-collapse text-[9.5px]">
                  <tbody>
                    {rahuGulikRows.map((r) => (
                      <tr key={r.day} className="border-b border-black/40">
                        <td className="border-r border-black px-2 py-[1px] font-bold">{r.day}</td>
                        <td className="px-2 py-[1px] text-center font-mono font-bold">{r.gulika}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Explanatory Notice Box */}
              <div className="w-[48%] p-2 flex flex-col justify-center text-center text-[10px] leading-snug">
                <div className="font-black text-[12px] pb-1.5 border-b border-black mb-1.5">
                  -: ಸೂಚನೆ :-
                </div>
                <p className="font-serif">
                  ಈ ಮೇಲಿನ ಘಂಟೆಗಳನ್ನು ಸೂರ್ಯೋದಯವು ೬ ಘಂಟೆ ಎಂದಲೂ, ದಿನಮಾನ ಘಟಿ ೩೦ ಎಂದಲೂ ಇಟ್ಟುಕೊಂಡು ಬರೆದಿರುತ್ತೇವೆ.
                </p>
                <p className="font-serif mt-1 font-bold">
                  ಕಾರಣ ಸೂರ್ಯೋದಯ ಘಂಟೆ ದಿನಮಾನಗಳು ಹೆಚ್ಚು ಕಮ್ಮಿಯಾದಾಗ ಈ ಮೇಲಿನ ಘಂಟೆಗಳನ್ನೂ ಹೆಚ್ಚು ಕಡಿಮೆ ಮಾಡಿಕೊಳ್ಳತಕ್ಕದ್ದು.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 2: GAJANANA STORES / SHLOKA & ADVERTISEMENT                           */
/* -------------------------------------------------------------------------- */

export const Page02GajananaStores: React.FC<PageTemplateProps> = ({ page, meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={2}>
      <div className="h-full flex flex-col justify-between p-2">
        {/* Top Header Row */}
        <div className="flex justify-between items-start">
          {/* Top Left: Classical Shloka */}
          <div className="w-[58%] text-center font-serif text-[13px] leading-relaxed pt-2">
            <div className="font-bold">
              ವಸ್ತ್ರೇಣ ವಪುಷಾವಾಚಾ ವಿದ್ಯಯಾ ವಿನಯೇನಚ|
            </div>
            <div className="font-bold">
              ವಕಾರೈಃ ಪಂಚಭಿರ್ ಹೀನಃ ಸಭಾಮಧ್ಯೇನ ಶೋಭತೇ॥
            </div>
            <div className="border-t border-black w-48 mx-auto my-2" />
            <div className="text-[11.5px] leading-tight font-medium">
              ವಸ್ತ್ರ(ವಪುಷ), ಶರೀರ, ಮಾತು, ವಿದ್ಯೆ, ವಿನಯ
            </div>
            <div className="text-[11.5px] leading-tight font-medium">
              ಈ ಐದು 'ವ' ಕಾರಗಳಿಂದ ಹೀನನಾದವನು ಸಭೆಯ ಮಧ್ಯೆ ಶೋಭಿಸುವುದಿಲ್ಲ
            </div>
          </div>

          {/* Top Right: Black Callout Banner */}
          <div className="w-[40%] bg-black text-white p-3 rounded-2xl text-center text-[12px] leading-snug font-bold">
            ತನ್ನ ಪ್ರಾಮಾಣಿಕ ಸೇವೆಯಿಂದ ಆಧುನಿಕ ಪ್ರಪಂಚದ ವೈವಿಧ್ಯಮಯ ಬಟ್ಟೆಗಳನ್ನು ಪೂರೈಸುತ್ತಿರುವ ಜಿಲ್ಲೆಯ ಅತಿ ದೊಡ್ಡ ಬಟ್ಟೆಗಳ ಕೇಂದ್ರ
          </div>
        </div>

        {/* Center: 68-Year Badge & Ganesha */}
        <div className="flex items-center justify-around py-3">
          {/* Left Figure */}
          <div className="text-center font-serif">
            <div className="text-4xl">🪔</div>
            <div className="text-[10px] font-bold mt-1">ಮಂಗಳ ಗೌರಿ</div>
          </div>

          {/* 68 Starburst Badge */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl font-black shadow-lg border-4 border-double border-white">
              68
            </div>
            <div className="text-center font-black text-[16px] leading-tight">
              <div>ವರ್ಷಗಳ ನಿರಂತರ ಸೇವೆಯ</div>
              <div>ಅಭಿಮಾನ ಮತ್ತು ಸಂತೃಪ್ತಿ</div>
            </div>
          </div>

          {/* Ganesha Emblem */}
          <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center text-3xl">
            🕉️
          </div>

          {/* Right Figure */}
          <div className="text-center font-serif">
            <div className="text-4xl">🪔</div>
            <div className="text-[10px] font-bold mt-1">ದೀಪಲಕ್ಷ್ಮಿ</div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="space-y-1">
          <div className="bg-black text-white py-2 px-4 rounded-xl text-center">
            <div className="text-[26px] font-black tracking-wide">
              ಶ್ರೀ ಗಜಾನನ ಸ್ಟೋರ್ಸ್
            </div>
            <div className="text-[13px] font-bold tracking-widest mt-0.5">
              ─ ಜವಳಿ ವ್ಯಾಪಾರಿಗಳು ─
            </div>
          </div>
          <div className="text-center text-[12px] font-black">
            ಚನ್ನಪಟ್ಟಣ ಬರೂರ್, ಶಿರಸಿ. ದೂರವಾಣಿ : 9108899212
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 3: SRI KRISHNA POOJA BHANDARA ADVERTISEMENT                           */
/* -------------------------------------------------------------------------- */

export const Page03KrishnaPoojaBhandara: React.FC<PageTemplateProps> = ({ page, meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={3}>
      <div className="h-full flex flex-col justify-between p-2">
        {/* Top Black Banner */}
        <div className="bg-black text-white py-3 px-4 text-center">
          <h2 className="text-[28px] font-black tracking-wider">
            ಶ್ರೀಕೃಷ್ಣ ಪೂಜಾ ಭಂಡಾರ
          </h2>
          <p className="text-[12px] font-bold mt-1">
            ಶ್ರೀ ಗ್ರಾಮದೇವಿ ದೇವಸ್ಥಾನ ರಸ್ತೆ, ತಿಳಕ ಚೌಕ, ಯಲ್ಲಾಪುರ–581 359, ಉ.ಕ.
          </p>
        </div>

        {/* Center Offerings Details with Traditional Icons */}
        <div className="flex-1 flex items-center justify-between px-8 py-4">
          <div className="text-center w-24">
            <div className="text-5xl">🪔</div>
            <div className="text-[10px] font-black mt-2">ನಂದಾದೀಪ</div>
          </div>

          <div className="flex-1 text-center px-6 space-y-3 font-serif">
            <p className="text-[17px] font-bold leading-relaxed">
              ನಮ್ಮಲ್ಲಿ ಮದುವೆ, ಉಪನಯನ, ಹೋಮ–ಹವನ ಇತ್ಯಾದಿ ಶುಭ ಸಮಾರಂಭಗಳಿಗೆ ಹಾಗೂ ಅಪರ ಕಾರ್ಯಕ್ರಮಗಳಿಗೆ ಬೇಕಾಗುವ ಎಲ್ಲಾ ರೀತಿಯ ಪೂಜಾ ಸಾಮಗ್ರಿಗಳು ಉತ್ತಮ ಗುಣಮಟ್ಟದಲ್ಲಿ ಯೋಗ್ಯ ದರದಲ್ಲಿ ಒಂದೇ ಸೂರಿನಡಿ ದೊರೆಯುತ್ತದೆ.
            </p>
            <div className="text-3xl">🐚</div>
          </div>

          <div className="text-center w-24">
            <div className="text-5xl">🏺</div>
            <div className="text-[10px] font-black mt-2">ಪವಿತ್ರ ಕಲಶ</div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-black text-white py-2 px-4 text-center">
          <div className="text-[18px] font-black">
            ಪ್ರೊ. ಗೋಪಾಲಕೃಷ್ಣ ವಿ. ಭಟ್
          </div>
          <div className="text-[13px] font-bold mt-0.5">
            ಮೊ.: ಅಂಗಡಿ-8217562540, 9964007814
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 4: BANGARAMAKKI VEERANJANEYA TEMPLE ANNUAL FESTIVALS                  */
/* -------------------------------------------------------------------------- */

export const Page04BangaramakkiFestivals: React.FC<PageTemplateProps> = ({ page, meta }) => {
  const leftEvents = [
    { no: 1, masa: "ಫಾಲ್ಗುಣ", paksha: "ಶು", tithi: "೩೦", vara: "ಗುರು", date: "19/03/2026", desc: "ಯುಗಾದಿ" },
    { no: 2, masa: "ಚೈತ್ರ", paksha: "ಶು", tithi: "೯", vara: "ಶುಕ್ರ", date: "27/03/2026", desc: "ಶ್ರೀ ರಾಮನವಮಿ, ವನವಾಸಿ ಸೀತಾರಾಮ ಲಕ್ಷಣ ದೇವರ ವರ್ಧಂತಿ" },
    { no: 3, masa: "ಚೈತ್ರ", paksha: "ಶು", tithi: "೧೦", vara: "ಶನಿ", date: "28/03/2026", desc: "ಶರಾವತಿ ಆರತಿ, ಶರಾವತಿ ಕುಂಭಸ್ನಾನ" },
    { no: 4, masa: "ಚೈತ್ರ", paksha: "ಶು", tithi: "೧೨", vara: "ಚಂದ್ರ", date: "30/03/2026", desc: "ಧ್ವಜಾರೋಹಣ" },
    { no: 5, masa: "ಚೈತ್ರ", paksha: "ಶು", tithi: "೧೩", vara: "ಕುಜ", date: "31/03/2026", desc: "ಶ್ರೀದೇವರ ಪುಷ್ಪರಥೋತ್ಸವ" },
    { no: 6, masa: "ಚೈತ್ರ", paksha: "ಶು", tithi: "೧೫", vara: "ಗುರು", date: "02/04/2026", desc: "ಹನುಮ ಜಯಂತಿ, ಶ್ರೀದೇವರ ಬ್ರಹ್ಮರಥೋತ್ಸವ" },
    { no: 7, masa: "ಚೈತ್ರ", paksha: "ಕೃ", tithi: "೧", vara: "ರವಿ", date: "03/04/2026", desc: "ಓಕಳಿ" },
    { no: 8, masa: "ವೈಶಾಖ", paksha: "ಶು", tithi: "೩", vara: "ಚಂದ್ರ", date: "20/04/2026", desc: "ಅಕ್ಷಯ ತೃತೀಯಾ" },
    { no: 9, masa: "ವೈಶಾಖ", paksha: "ಶು", tithi: "೮", vara: "ಶನಿ", date: "03/05/2026", desc: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು ದೇವಸ್ಥಾನ ಹಾಡಗೇರಿ ವರ್ಧಂತಿ" },
    { no: 10, masa: "ಆಷಾಢ", paksha: "ಶು", tithi: "೧೧", vara: "ಶನಿ", date: "25/07/2026", desc: "ಪ್ರಥಮಾ ಏಕಾದಶಿ ಭಜನೆ" },
    { no: 11, masa: "ಆಷಾಢ", paksha: "ಶು", tithi: "೧೫", vara: "ಬುಧ", date: "29/07/2026", desc: "ಗುರುಪೂರ್ಣಿಮೆ, ವ್ಯಾಸಪೂಜೆ, ಚಾತುರ್ಮಾಸ್ಯ ವ್ರತಾರಂಭ" },
    { no: 12, masa: "ಶ್ರಾವಣ", paksha: "ಶು", tithi: "೫", vara: "ಚಂದ್ರ", date: "17/08/2026", desc: "ನಾಗ ಪಂಚಮಿ ಆಚರಣೆ" },
    { no: 13, masa: "ಶ್ರಾವಣ", paksha: "ಶು", tithi: "೭", vara: "ಬುಧ", date: "19/08/2026", desc: "ದೀವಗಿ ಶ್ರೀ ರಾಮಾನಂದ ಅವಧೂತರ ಆರಾಧನೆ" },
    { no: 14, masa: "ಶ್ರಾವಣ", paksha: "ಶು", tithi: "೯", vara: "ಶುಕ್ರ", date: "21/08/2026", desc: "ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತಾಚರಣೆ" },
    { no: 15, masa: "ಶ್ರಾವಣ", paksha: "ಶು", tithi: "೧೧", vara: "ರವಿ", date: "23/08/2026", desc: "ಏಕಾದಶಿ ಭಜನೆ" },
    { no: 16, masa: "ಶ್ರಾವಣ", paksha: "ಶು", tithi: "೧೫", vara: "ಶುಕ್ರ", date: "28/08/2026", desc: "ನೂಲುಹುಣ್ಣಿಮೆ, ನೂತನ ಉಪಾಕರ್ಮ" },
    { no: 17, masa: "ಶ್ರಾವಣ", paksha: "ಕೃ", tithi: "೮", vara: "ಶುಕ್ರ", date: "04/09/2026", desc: "ಶ್ರೀ ಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮಿ ಆಚರಣೆ" },
    { no: 18, masa: "ಭಾದ್ರಪದ", paksha: "ಶು", tithi: "೪", vara: "ಚಂದ್ರ", date: "14/09/2026", desc: "ಸ್ವರ್ಣಗೌರೀ ವ್ರತ, ಗಣೇಶ ಚತುರ್ಥಿ" },
    { no: 19, masa: "ಭಾದ್ರಪದ", paksha: "ಶು", tithi: "೧೪", vara: "ಶುಕ್ರ", date: "25/09/2026", desc: "ಅನಂತ ಚತುರ್ದಶಿ" },
    { no: 20, masa: "ಆಶ್ವಯುಜ", paksha: "ಶು", tithi: "೧", vara: "ರವಿ", date: "11/10/2026", desc: "ಶರನ್ನವರಾತ್ರಿ ಪ್ರಾರಂಭ, ಯಕ್ಷಪೂರ್ಣಿಮೆ" },
    { no: 21, masa: "ಆಶ್ವಯುಜ", paksha: "ಶು", tithi: "೭", vara: "ಶುಕ್ರ", date: "16/10/2026", desc: "ಶಾರದಾ ಸ್ಥಾಪನೆ" },
    { no: 22, masa: "ಆಶ್ವಯುಜ", paksha: "ಶು", tithi: "೯", vara: "ಚಂದ್ರ", date: "19/10/2026", desc: "ಮಹಾನವಮಿ, ಆಯುಧಪೂಜೆ" },
    { no: 23, masa: "ಆಶ್ವಯುಜ", paksha: "ಶು", tithi: "೧೦", vara: "ಕುಜ", date: "20/10/2026", desc: "ವಿಜಯದಶಮಿ, ಶಮೀಪೂಜೆ" },
    { no: 24, masa: "ಕಾರ್ತಿಕ", paksha: "ಕೃ", tithi: "೧೪", vara: "ರವಿ", date: "08/11/2026", desc: "ನರಕ ಚತುರ್ದಶಿ, ದೀಪಾವಳಿ ಆರಂಭ" },
    { no: 25, masa: "ಕಾರ್ತಿಕ", paksha: "ಶು", tithi: "೧೨", vara: "ಶನಿ", date: "21/11/2026", desc: "ತುಳಸಿ ವಿವಾಹ" },
    { no: 26, masa: "ಕಾರ್ತಿಕ", paksha: "ಕೃ", tithi: "೧೫", vara: "ಕುಜ", date: "24/11/2026", desc: "ಮಹಾದೀಪೋತ್ಸವ" },
    { no: 27, masa: "ಮಾರ್ಗಶಿರ", paksha: "ಶು", tithi: "೬", vara: "ಬುಧ", date: "15/12/2026", desc: "ಚಂಪಾಷಷ್ಠಿ ಆಚರಣೆ" },
    { no: 28, masa: "ಮಾರ್ಗಶಿರ", paksha: "ಶು", tithi: "೧೪", vara: "ಬುಧ", date: "23/12/2026", desc: "ದತ್ತ ಜಯಂತಿ ಆಚರಣೆ" },
    { no: 29, masa: "ಪುಷ್ಯ", paksha: "ಶು", tithi: "೭", vara: "ಗುರು", date: "14/01/2027", desc: "ಮಕರ ಸಂಕ್ರಾಂತಿ" },
    { no: 30, masa: "ಮಾಘ", paksha: "ಕೃ", tithi: "೧೪", vara: "ಶನಿ", date: "06/03/2027", desc: "ಮಹಾಶಿವರಾತ್ರಿ ಆಚರಣೆ" }
  ];

  const rightFestivals = [
    { no: 1, masa: "ಚೈತ್ರ", day: "ಹುಣ್ಣಿಮೆ", vara: "ಗುರುವಾರ", date: "02/04/2026" },
    { no: 2, masa: "ಚೈತ್ರ", day: "ಸಂಕಷ್ಟಿ", vara: "ರವಿವಾರ", date: "05/04/2026" },
    { no: 3, masa: "ಚೈತ್ರ", day: "ಅಮಾವಾಸ್ಯೆ", vara: "ಶುಕ್ರವಾರ", date: "17/04/2026" },
    { no: 4, masa: "ವೈಶಾಖ", day: "ಹುಣ್ಣಿಮೆ", vara: "ಶುಕ್ರವಾರ", date: "01/05/2026" },
    { no: 5, masa: "ವೈಶಾಖ", day: "ಸಂಕಷ್ಟಿ", vara: "ಕುಜವಾರ", date: "05/05/2026" },
    { no: 6, masa: "ವೈಶಾಖ", day: "ಅಮಾವಾಸ್ಯೆ", vara: "ಶನಿವಾರ", date: "16/05/2026" },
    { no: 7, masa: "ನಿಜಜ್ಯೇಷ್ಠ", day: "ಹುಣ್ಣಿಮೆ", vara: "ಚಂದ್ರವಾರ", date: "29/06/2026" },
    { no: 8, masa: "ನಿಜಜ್ಯೇಷ್ಠ", day: "ಸಂಕಷ್ಟಿ", vara: "ಶುಕ್ರವಾರ", date: "03/06/2026" },
    { no: 9, masa: "ನಿಜಜ್ಯೇಷ್ಠ", day: "ಅಮಾವಾಸ್ಯೆ", vara: "ಕುಜವಾರ", date: "14/06/2026" },
    { no: 10, masa: "ಆಷಾಢ", day: "ಹುಣ್ಣಿಮೆ", vara: "ಬುಧವಾರ", date: "29/07/2026" },
    { no: 11, masa: "ಆಷಾಢ", day: "ಸಂಕಷ್ಟಿ", vara: "ರವಿವಾರ", date: "02/08/2026" },
    { no: 12, masa: "ಆಷಾಢ", day: "ಅಮಾವಾಸ್ಯೆ", vara: "ಬುಧವಾರ", date: "12/08/2026" },
    { no: 13, masa: "ಶ್ರಾವಣ", day: "ಹುಣ್ಣಿಮೆ", vara: "ಶುಕ್ರವಾರ", date: "28/08/2026" },
    { no: 14, masa: "ಶ್ರಾವಣ", day: "ಸಂಕಷ್ಟಿ", vara: "ಚಂದ್ರವಾರ", date: "31/08/2026" },
    { no: 15, masa: "ಶ್ರಾವಣ", day: "ಅಮಾವಾಸ್ಯೆ", vara: "ಶುಕ್ರವಾರ", date: "11/09/2026" },
    { no: 16, masa: "ಭಾದ್ರಪದ", day: "ಹುಣ್ಣಿಮೆ", vara: "ಶನಿವಾರ", date: "26/09/2026" },
    { no: 17, masa: "ಭಾದ್ರಪದ", day: "ಸಂಕಷ್ಟಿ", vara: "ಕುಜವಾರ", date: "29/09/2026" },
    { no: 18, masa: "ಭಾದ್ರಪದ", day: "ಅಮಾವಾಸ್ಯೆ", vara: "ಶನಿವಾರ", date: "10/10/2026" },
    { no: 19, masa: "ಆಶ್ವಯುಜ", day: "ಹುಣ್ಣಿಮೆ", vara: "ಚಂದ್ರವಾರ", date: "26/10/2026" },
    { no: 20, masa: "ಆಶ್ವಯುಜ", day: "ಸಂಕಷ್ಟಿ", vara: "ಗುರುವಾರ", date: "29/10/2026" },
    { no: 21, masa: "ಆಶ್ವಯುಜ", day: "ಅಮಾವಾಸ್ಯೆ", vara: "ಚಂದ್ರವಾರ", date: "09/11/2026" },
    { no: 22, masa: "ಕಾರ್ತಿಕ", day: "ಹುಣ್ಣಿಮೆ", vara: "ಕುಜವಾರ", date: "24/11/2026" },
    { no: 23, masa: "ಕಾರ್ತಿಕ", day: "ಸಂಕಷ್ಟಿ", vara: "ಶುಕ್ರವಾರ", date: "27/11/2026" },
    { no: 24, masa: "ಕಾರ್ತಿಕ", day: "ಅಮಾವಾಸ್ಯೆ", vara: "ಕುಜವಾರ", date: "08/12/2026" },
    { no: 25, masa: "ಮಾರ್ಗಶಿರ", day: "ಹುಣ್ಣಿಮೆ", vara: "ಗುರುವಾರ", date: "24/12/2026" },
    { no: 26, masa: "ಮಾರ್ಗಶಿರ", day: "ಸಂಕಷ್ಟಿ", vara: "ಶನಿವಾರ", date: "26/12/2026" },
    { no: 27, masa: "ಮಾರ್ಗಶಿರ", day: "ಅಮಾವಾಸ್ಯೆ", vara: "ಗುರುವಾರ", date: "07/01/2027" },
    { no: 28, masa: "ಪುಷ್ಯ", day: "ಹುಣ್ಣಿಮೆ", vara: "ಶುಕ್ರವಾರ", date: "22/01/2027" },
    { no: 29, masa: "ಪುಷ್ಯ", day: "ಸಂಕಷ್ಟಿ", vara: "ಚಂದ್ರವಾರ", date: "25/01/2027" },
    { no: 30, masa: "ಪುಷ್ಯ", day: "ಅಮಾವಾಸ್ಯೆ", vara: "ಶನಿವಾರ", date: "06/02/2027" }
  ];

  return (
    <BaggonaLandscapeFrame pageNumber={4}>
      {/* Top Banner */}
      <div className="bg-black text-white py-1 px-3 text-center text-[12px] font-black tracking-wide mb-1">
        ಶ್ರೀ {meta.samvatsaraKn} ಸಂ.ದ ಶ್ರೀ ವಿಶ್ವ ವೀರಾಂಜನೇಯ ಮಹಾಸಂಸ್ಥಾನಮ್, ಹೇಮಪುರ ಮಹಾಪೀಠಮ್, ಶ್ರೀಕ್ಷೇತ್ರ ಬಂಗಾರಮಕ್ಕಿಯಲ್ಲಿ ನಡೆಯುವ ಉತ್ಸವಗಳು {meta.gregorianYears}
      </div>

      {/* Dual Table Grid */}
      <div className="flex-1 grid grid-cols-12 gap-2 text-[9px] leading-tight overflow-hidden">
        {/* Left Table: 7 columns */}
        <div className="col-span-8 border border-black overflow-hidden flex flex-col">
          <table className="w-full border-collapse text-[8.5px]">
            <thead>
              <tr className="border-b border-black font-black bg-slate-100">
                <th className="border-r border-black p-[2px] w-[24px] text-center">ಅ.ನಂ.</th>
                <th className="border-r border-black p-[2px] w-[50px] text-center">ಮಾಸ</th>
                <th className="border-r border-black p-[2px] w-[24px] text-center">ಪಕ್ಷ</th>
                <th className="border-r border-black p-[2px] w-[28px] text-center">ತಿಥಿ</th>
                <th className="border-r border-black p-[2px] w-[32px] text-center">ವಾರ</th>
                <th className="border-r border-black p-[2px] w-[58px] text-center">ದಿನಾಂಕ</th>
                <th className="p-[2px] text-left px-1.5">ವಾರ್ಷಿಕ ಹಬ್ಬ ಹರಿದಿನಗಳ ವಿವರ</th>
              </tr>
            </thead>
            <tbody>
              {leftEvents.map((r) => (
                <tr key={r.no} className="border-b border-black/40 hover:bg-slate-50">
                  <td className="border-r border-black p-[1.5px] text-center font-bold">{r.no}</td>
                  <td className="border-r border-black p-[1.5px] text-center">{r.masa}</td>
                  <td className="border-r border-black p-[1.5px] text-center font-bold">{r.paksha}</td>
                  <td className="border-r border-black p-[1.5px] text-center">{r.tithi}</td>
                  <td className="border-r border-black p-[1.5px] text-center">{r.vara}</td>
                  <td className="border-r border-black p-[1.5px] text-center font-mono font-bold">{r.date}</td>
                  <td className="p-[1.5px] px-1.5 truncate font-medium">{r.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Table: Hunnime / Amavasya / Sankashti */}
        <div className="col-span-4 border border-black overflow-hidden flex flex-col">
          <div className="bg-black text-white text-center font-black p-[2px] text-[10px]">
            ಹುಣ್ಣಿಮೆ/ಅಮಾವಾಸ್ಯೆ/ಸಂಕಷ್ಟಿ ವಿವರ
          </div>
          <table className="w-full border-collapse text-[8.5px]">
            <thead>
              <tr className="border-b border-black font-black bg-slate-100">
                <th className="border-r border-black p-[2px] w-[24px] text-center">ಅ.ನಂ.</th>
                <th className="border-r border-black p-[2px] text-center">ಮಾಸ</th>
                <th className="border-r border-black p-[2px] text-center">ದಿನ</th>
                <th className="border-r border-black p-[2px] text-center">ವಾರ</th>
                <th className="p-[2px] text-center font-mono">ದಿನಾಂಕ</th>
              </tr>
            </thead>
            <tbody>
              {rightFestivals.map((r) => (
                <tr key={r.no} className="border-b border-black/40 hover:bg-slate-50">
                  <td className="border-r border-black p-[1.5px] text-center font-bold">{r.no}</td>
                  <td className="border-r border-black p-[1.5px] text-center">{r.masa}</td>
                  <td className="border-r border-black p-[1.5px] text-center font-bold">{r.day}</td>
                  <td className="border-r border-black p-[1.5px] text-center">{r.vara}</td>
                  <td className="p-[1.5px] text-center font-mono font-bold">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 5: TSS GOLD JEWELLERY ADVERTISEMENT                                   */
/* -------------------------------------------------------------------------- */

export const Page05TSSJewellery: React.FC<PageTemplateProps> = ({ page, meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={5}>
      <div className="h-full flex flex-col justify-between p-2">
        {/* Top Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-2">
          <div className="border-2 border-black px-4 py-1 font-black text-2xl tracking-widest">
            TSS
          </div>
          <h2 className="text-[20px] font-black tracking-wide">
            ಉತ್ಕೃಷ್ಟ ವಿನ್ಯಾಸದ ಆಭರಣಗಳ ವಿಶೇಷ ಸಂಗ್ರಹ
          </h2>
        </div>

        {/* Center: 3 Elegant Exhibition Panels */}
        <div className="grid grid-cols-3 gap-3 py-2 flex-1 items-center">
          <div className="border-2 border-black p-3 text-center rounded-xl bg-slate-50 flex flex-col justify-center h-full">
            <div className="text-5xl mb-2">👑</div>
            <div className="font-black text-[14px]">ಪಾರಂಪರಿಕ ನೆಕ್ಲೇಸ್</div>
            <div className="text-[11px] text-slate-700 mt-1">ಶುದ್ಧ ಬಂಗಾರದ ಕಲಾತ್ಮಕ ವಿನ್ಯಾಸ</div>
          </div>
          <div className="border-2 border-black p-3 text-center rounded-xl bg-slate-50 flex flex-col justify-center h-full">
            <div className="text-5xl mb-2">💎</div>
            <div className="font-black text-[14px]">ವಜ್ರ ಖಚಿತ ಆಭರಣಗಳು</div>
            <div className="text-[11px] text-slate-700 mt-1">ಪ್ರತಿಷ್ಠಿತ ಸಮಾರಂಭಗಳಿಗೆ ಶೋಭಾಯಮಾನ</div>
          </div>
          <div className="border-2 border-black p-3 text-center rounded-xl bg-slate-50 flex flex-col justify-center h-full">
            <div className="text-5xl mb-2">✨</div>
            <div className="font-black text-[14px]">ಬೆಳ್ಳಿ ಪೂಜಾ ಸಾಮಗ್ರಿಗಳು</div>
            <div className="text-[11px] text-slate-700 mt-1">ದೇವತಾರ್ಚನೆಗೆ ಶುದ್ಧ ಬೆಳ್ಳಿ ಪಾತ್ರೆಗಳು</div>
          </div>
        </div>

        {/* Center Brand Badge */}
        <div className="border-2 border-black p-2 text-center my-1 rounded-lg bg-black text-white">
          <div className="text-[20px] font-black">TSS GOLD ─ ಬೆಳ್ಳಿ ಬಂಗಾರದ ಆಭರಣಗಳು</div>
        </div>

        {/* Bottom Branch Directory */}
        <div className="grid grid-cols-4 gap-2 text-center text-[11.5px] border-t-2 border-black pt-2 font-bold">
          <div className="border-r border-black pr-2">
            ಅಪ್ಪಟ ಅಪರಂಜಿ ಚಿನ್ನ
          </div>
          <div className="border-r border-black pr-2">
            ಶಿರಸಿ: 📱 99003 65733
          </div>
          <div className="border-r border-black pr-2">
            ಸಿದ್ಧಾಪುರ: 📱 90190 52824
          </div>
          <div>
            ಯಲ್ಲಾಪುರ: 📱 93532 45856
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 6: SONDA SWARNAVALLI MATHA ANNUAL FESTIVALS                           */
/* -------------------------------------------------------------------------- */

export const Page06SwarnavalliFestivals: React.FC<PageTemplateProps> = ({ page, meta }) => {
  const mathaEvents = [
    { no: 1, masa: "ಫಾಲ್ಗುಣ", paksha: "ಕೃ", tithi: "೩೦", vara: "ಗುರು", date: "19/3/2026", desc: "ವಸಂತಪೂಜಾ, ವಸಂತ ನವರಾತ್ರಿ ಆರಂಭ." },
    { no: 2, masa: "ಚೈತ್ರ", paksha: "ಕೃ", tithi: "೨", vara: "ಶನಿ", date: "04/4/2026", desc: "ಶ್ರೀ ಪರಾತ್ಪರ ಗುರುಗಳ ಆರಾಧನೆ." },
    { no: 3, masa: "ಚೈತ್ರ", paksha: "ಕೃ", tithi: "೧೨", vara: "ಕುಜ", date: "14/4/2026", desc: "ಶ್ರೀ ಆನಂದಬೋಧೇಂದ್ರ ಸರಸ್ವತೀ ಶ್ರೀಗಳವರ ವರ್ಧಂತಿ" },
    { no: 4, masa: "ವೈಶಾಖ", paksha: "ಶು", tithi: "೨", vara: "ರವಿ", date: "19/4/2026", desc: "ಶ್ರೀ ಪರಾತ್ಪರ ಗುರುಗಳ ಆರಾಧನೆ." },
    { no: 5, masa: "ವೈಶಾಖ", paksha: "ಶು", tithi: "೩", vara: "ಚಂದ್ರ", date: "20/4/2026", desc: "ಅಕ್ಷಯ ತೃತೀಯಾ" },
    { no: 6, masa: "ವೈಶಾಖ", paksha: "ಶು", tithi: "೫", vara: "ಕುಜ", date: "21/4/2026", desc: "ಶ್ರೀ ಶಂಕರ ಜಯಂತಿ" },
    { no: 7, masa: "ವೈಶಾಖ", paksha: "ಶು", tithi: "೧೦", vara: "ರವಿ", date: "26/4/2026", desc: "ಶ್ರೀ ನೃಸಿಂಹ ಮಂತ್ರ ಹವನ, ಕಳಶಾರೋಹಣ." },
    { no: 8, masa: "ವೈಶಾಖ", paksha: "ಶು", tithi: "೧೪", vara: "ಗುರು", date: "30/4/2026", desc: "ನೃಸಿಂಹ ಜಯಂತಿ" },
    { no: 9, masa: "ವೈಶಾಖ", paksha: "ಶು", tithi: "೧೫", vara: "ಶುಕ್ರ", date: "01/5/2026", desc: "ಅನ್ವಾಧಾನ" },
    { no: 10, masa: "ನಿಜಜ್ಯೇಷ್ಠ", paksha: "ಶು", tithi: "೯", vara: "ಕುಜ", date: "23/6/2026", desc: "ಶ್ರೀ ಶ್ರೀ ಗಂಗಾಧರೇಂದ್ರ ಸರಸ್ವತೀ ಶ್ರೀಗಳವರ ವರ್ಧಂತ್ಯುತ್ಸವ" },
    { no: 11, masa: "ನಿಜಜ್ಯೇಷ್ಠ", paksha: "ಶು", tithi: "೧೫", vara: "ಚಂದ್ರ", date: "29/6/2026", desc: "ಕ್ಷೇತ್ರಪಾಲ ಮಹಾಪೂಜಾ" },
    { no: 12, masa: "ಆಷಾಢ", paksha: "ಶು", tithi: "೧೧", vara: "ಶನಿ", date: "25/7/2026", desc: "ವಿಷ್ಣುವ್ರತ (ವಿಷ್ಣುಶಯನೋತ್ಸವ)" },
    { no: 13, masa: "ಆಷಾಢ", paksha: "ಶು", tithi: "೧೫", vara: "ಬುಧ", date: "29/7/2026", desc: "ಚಾತುರ್ಮಾಸ್ಯವ್ರತ ಪ್ರಾರಂಭ, ವ್ಯಾಸಪೂಜಾ," },
    { no: 14, masa: "ಆಷಾಢ", paksha: "ಕೃ", tithi: "೫", vara: "ಚಂದ್ರ", date: "03/8/2026", desc: "ಶ್ರೀ ಶ್ರೀ ಪರಮೇಷ್ಠಿ ಗುರುಗಳ ಆರಾಧನೆ" },
    { no: 15, masa: "ಶ್ರಾವಣ", paksha: "ಶು", tithi: "೫", vara: "ಚಂದ್ರ", date: "17/8/2026", desc: "ನಾಗ ಪಂಚಮಿ" },
    { no: 16, masa: "ಶ್ರಾವಣ", paksha: "ಕೃ", tithi: "೮", vara: "ಶುಕ್ರ", date: "04/9/2026", desc: "ಕೃಷ್ಣಾಷ್ಟಮಿ" },
    { no: 17, masa: "ಭಾದ್ರಪದ", paksha: "ಶು", tithi: "೪", vara: "ಚಂದ್ರ", date: "14/9/2026", desc: "ಶ್ರೀ ಗಣೇಶ ಚತುರ್ಥಿ" },
    { no: 18, masa: "ಭಾದ್ರಪದ", paksha: "ಶು", tithi: "೭", vara: "ಗುರು", date: "17/9/2026", desc: "ಅಥರ್ವಶೀರ್ಷ ಹವನ" },
    { no: 19, masa: "ಭಾದ್ರಪದ", paksha: "ಶು", tithi: "೧೫", vara: "ಶನಿ", date: "26/9/2026", desc: "ಚಾತುರ್ಮಾಸ್ಯವ್ರತ ಸಮಾಪ್ತಿ" },
    { no: 20, masa: "ಆಶ್ವಿನ", paksha: "ಶು", tithi: "೧", vara: "ರವಿ", date: "11/10/2026", desc: "ನವರಾತ್ರಿ ಪ್ರಾರಂಭ" },
    { no: 21, masa: "ಆಶ್ವಿನ", paksha: "ಶು", tithi: "೫", vara: "ಗುರು", date: "15/10/2026", desc: "ಲಲಿತಾ ಪಂಚಮಿ" },
    { no: 22, masa: "ಆಶ್ವಿನ", paksha: "ಶು", tithi: "೭", vara: "ಶುಕ್ರ", date: "16/10/2026", desc: "ಶಾರದಾ ಸ್ಥಾಪನಂ" },
    { no: 23, masa: "ಆಶ್ವಿನ", paksha: "ಶು", tithi: "೮/೯", vara: "ಚಂದ್ರ", date: "19/10/2026", desc: "ಮಹಾನವಮಿ, ಲಕ್ಷ್ಮೀಪೂಜಾ, ಕ್ಷೇತ್ರಪಾಲಬಲಿ" },
    { no: 24, masa: "ಆಶ್ವಿನ", paksha: "ಶು", tithi: "೯", vara: "ಕುಜ", date: "20/10/2026", desc: "ವಿಜಯದಶಮಿ, ಶಮೀಪೂಜಾ, ಶಾರದಾ ವಿಸರ್ಜನಂ" },
    { no: 25, masa: "ಆಶ್ವಿನ", paksha: "ಕೃ", tithi: "೧೪", vara: "ರವಿ", date: "08/11/2026", desc: "ನರಕಚತುರ್ದಶಿ ಲಕ್ಷ್ಮೀಪೂಜಾ" },
    { no: 26, masa: "ಕಾರ್ತಿಕ", paksha: "ಶು", tithi: "೧", vara: "ಕುಜ", date: "10/11/2026", desc: "ಗೋತ್ಪೂಜಾ" },
    { no: 27, masa: "ಕಾರ್ತಿಕ", paksha: "ಶು", tithi: "೧೨", vara: "ಶನಿ", date: "21/11/2026", desc: "ಪ್ರಬೋಧೋತ್ಸವ, ತುಳಸಿ ವಿವಾಹ" },
    { no: 28, masa: "ಕಾರ್ತಿಕ", paksha: "ಶು", tithi: "೧೫", vara: "ಕುಜ", date: "24/11/2026", desc: "ಶ್ರೀ ಲಕ್ಷ್ಮೀನೃಸಿಂಹ ದೀಪೋತ್ಸವ" },
    { no: 29, masa: "ಕಾರ್ತಿಕ", paksha: "ಕೃ", tithi: "೩೦", vara: "ಕುಜ", date: "08/12/2026", desc: "ಶ್ರೀ ಗುರುಮೂರ್ತಿ ದೀಪೋತ್ಸವ" },
    { no: 30, masa: "ಮಾರ್ಗಶೀರ್ಷ", paksha: "ಶು", tithi: "೪", vara: "ರವಿ", date: "13/12/2026", desc: "ಶ್ರೀ ಪರಮ ಗುರುಗಳ ಆರಾಧನೆ" },
    { no: 31, masa: "ಮಾರ್ಗಶೀರ್ಷ", paksha: "ಶು", tithi: "೭", vara: "ಬುಧ", date: "16/12/2026", desc: "ಧನುರ್ಮಾಸ ಪೂಜಾ ಪ್ರಾರಂಭ" },
    { no: 32, masa: "ಮಾಘ", paksha: "ಶು", tithi: "೪", vara: "ಬುಧ", date: "10/02/2027", desc: "ಅಥರ್ವಶೀರ್ಷ ಹವನ" },
    { no: 33, masa: "ಮಾಘ", paksha: "ಕೃ", tithi: "೧೩", vara: "ಶನಿ", date: "06/03/2027", desc: "ಮಹಾಶಿವರಾತ್ರಿ" }
  ];

  return (
    <BaggonaLandscapeFrame pageNumber={6}>
      {/* Top Banner */}
      <div className="bg-black text-white text-center py-1 px-2 text-[12.5px] font-black mb-1">
        ಶ್ರೀ ಶಾ ಗತಶಕೆ {meta.shakaYear} {meta.samvatsaraKn} ಸಂವತ್ಸರದಲ್ಲಿ ಶ್ರೀ ಸೋಂದಾ ಸ್ವರ್ಣವಲ್ಲೀ ಮಹಾಸಂಸ್ಥಾನದಲ್ಲಿ ನಡೆಯುವ ಉತ್ಸವಗಳು {meta.gregorianYears}
      </div>

      <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden text-[9px]">
        {/* Left Column: Kashyapa Traders Ad (width 26%) */}
        <div className="col-span-3 border border-black p-2 flex flex-col justify-between text-center leading-tight">
          <div className="font-bold text-[10.5px]">ಹೊಸ ವರ್ಷದ ಶುಭಾಶಯಗಳು</div>
          <div className="text-3xl my-1">🏺🍳</div>
          <div className="bg-black text-white font-black py-1 text-[13px] rounded">
            ಕಶ್ಯಪ ಟ್ರೇಡರ್ಸ್
          </div>
          <div className="font-bold text-[10px] mt-1">ಪಾತ್ರೆಗಳ ವ್ಯಾಪಾರಿಗಳು</div>
          <div className="text-[9.5px]">ಚನ್ನಪಟ್ಟಣ ಬರೂರ್, ಶಿರಸಿ</div>
          <div className="text-[9.5px] font-mono font-bold">ಮೊ : 9844398455</div>
          <div className="border-t border-black my-1" />
          <p className="text-[8.5px] text-slate-800">
            ನಮ್ಮಲ್ಲಿ ಸ್ಟೇನ್‌ಲೆಸ್ ಸ್ಟೀಲ್, ತಾಮ್ರ, ಹಿತ್ತಾಳೆ, ಅಲ್ಯುಮೀನಿಯಂ ಮತ್ತು ಕುಕ್ಕರ್, ಮಿಕ್ಸರ್, ಗ್ರ್ಯಾಂಡರ್ ಹಾಗೂ ಗೃಹಿಣಿಯರ ಉಪಯುಕ್ತ ಮಜ್ಜಿಗೆ ಕಡೆಯುವ ಯಂತ್ರ, ಹಪ್ಪಳದ ಅಚ್ಚು ಲಭ್ಯ.
          </p>
          <div className="bg-slate-100 border border-black p-1 text-[8.5px] font-bold">
            ಅಮೂಲ್ಯ ವನಸ್ಪತಿಯಿಂದ ತಯಾರಿಸಿದ ಕೇಶಸಂವರ್ಧಿನಿ ತೈಲ ಇಲ್ಲಿ ದೊರೆಯುತ್ತದೆ.
          </div>
        </div>

        {/* Right Column: 33-row Table */}
        <div className="col-span-9 border border-black overflow-hidden flex flex-col">
          <table className="w-full border-collapse text-[8.5px]">
            <thead>
              <tr className="border-b border-black font-black bg-slate-100">
                <th className="border-r border-black p-[1.5px] w-[22px] text-center">ಅ.ನಂ</th>
                <th className="border-r border-black p-[1.5px] w-[50px] text-center">ಮಾಸ</th>
                <th className="border-r border-black p-[1.5px] w-[22px] text-center">ಪಕ್ಷ</th>
                <th className="border-r border-black p-[1.5px] w-[24px] text-center">ತಿಥಿ</th>
                <th className="border-r border-black p-[1.5px] w-[28px] text-center">ವಾರ</th>
                <th className="border-r border-black p-[1.5px] w-[58px] text-center">ದಿನಾಂಕ</th>
                <th className="p-[1.5px] text-left px-2">ಹಬ್ಬಗಳ ವಿವರ</th>
              </tr>
            </thead>
            <tbody>
              {mathaEvents.map((r) => (
                <tr key={r.no} className="border-b border-black/30 hover:bg-slate-50">
                  <td className="border-r border-black p-[1px] text-center font-bold">{r.no}</td>
                  <td className="border-r border-black p-[1px] text-center">{r.masa}</td>
                  <td className="border-r border-black p-[1px] text-center font-bold">{r.paksha}</td>
                  <td className="border-r border-black p-[1px] text-center">{r.tithi}</td>
                  <td className="border-r border-black p-[1px] text-center">{r.vara}</td>
                  <td className="border-r border-black p-[1px] text-center font-mono font-bold">{r.date}</td>
                  <td className="p-[1px] px-2 truncate font-medium">{r.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 7: ANNAPOORNESHWARI JYOTISHYALAYA ADVERTISEMENT                       */
/* -------------------------------------------------------------------------- */

export const Page07AnnapoorneshwariJyotishya: React.FC<PageTemplateProps> = ({ page, meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={7}>
      <div className="h-full flex flex-col justify-between p-2">
        {/* Top Banner */}
        <div className="bg-black text-white text-center py-2 px-3">
          <h2 className="text-[26px] font-black tracking-wider">
            ಶ್ರೀ ಅನ್ನಪೂರ್ಣೇಶ್ವರಿ ಜ್ಯೋತಿಷ್ಯಾಲಯ
          </h2>
        </div>

        {/* Sub Header Profile */}
        <div className="border-b-2 border-black pb-2 text-center">
          <div className="text-[17px] font-black">
            ಪಂಡಿತ್ : ಶ್ರೀ ಸುಧೀಂದ್ರ ಭಟ್
          </div>
          <div className="text-[12px] font-bold text-slate-800">
            ಜ್ಯೋತಿಷ್ಯರು ಹಾಗೂ ದೈವತ್ವದ ಪರಿಹಾರ ಸೂಚಕರು • ಮೊ : 8971983245
          </div>
          <p className="text-[10.5px] max-w-2xl mx-auto mt-1 font-serif">
            ಕವಡೆ ಶಾಸ್ತ್ರ, ಸಂಖ್ಯಾಶಾಸ್ತ್ರ, ಪ್ರಶ್ನಾ ಮಾರ್ಗ, ಜನ್ಮ–ಜಾತಕ ಆಧಾರದಿಂದ ಫಲ ನಿರೂಪಣೆಯೊಂದಿಗೆ ನಿಮ್ಮ ಯಾವುದೇ ರೀತಿಯ ಸಮಸ್ಯೆಗಳಿಗೆ ಶಾಸ್ತ್ರಬದ್ಧ ಪರಿಹಾರ ಶತಸಿದ್ಧ.
          </p>
        </div>

        {/* Middle Columns */}
        <div className="grid grid-cols-3 gap-3 flex-1 items-center text-[10px] leading-tight font-serif py-1">
          <div className="border border-black p-2.5 rounded h-full flex flex-col justify-between">
            <div className="font-black text-[11px] border-b border-black pb-1 mb-1">
              ದೈವಿಕ ಪರಿಹಾರ ಮಾರ್ಗ
            </div>
            <p>
              ಕೇರಳ ಪದ್ಧತಿಯಲ್ಲಿ ತಾಳೆಗ್ರಂಥದ ಮೂಲಕ ಪರಿಹಾರ ತಿಳಿಸುತ್ತಾರೆ. ವಾಸ್ತುಶಾಸ್ತ್ರ, ಸಂಖ್ಯಾಶಾಸ್ತ್ರ, ಜಾತಕ ಆಧಾರಿತವಾಗಿ ನಿಖರ ಭವಿಷ್ಯ.
            </p>
            <div className="bg-slate-100 p-1.5 border border-black font-bold text-center">
              ಸಮಯ : ಬೆಳಿಗ್ಗೆ 10:00 ರಿಂದ ಸಾಯಂಕಾಲ 7:00 ರ ವರೆಗೆ
            </div>
          </div>

          <div className="border border-black p-2.5 rounded h-full flex flex-col justify-between">
            <div className="font-black text-[11px] border-b border-black pb-1 mb-1">
              ವಿಶೇಷ ಪರಿಹಾರಗಳು
            </div>
            <p>
              ಸಂತಾನ ಭಾಗ್ಯ, ವಿದೇಶ ಯೋಗ, ಮನೆ ಕಟ್ಟುವ ಬಗೆ, ಪ್ರೇಮ ವಿಚಾರ, ದಾಂಪತ್ಯ ತೊಂದರೆ, ಕೋರ್ಟ್ ಕೇಸ್, ಶತ್ರುಕಾಟ, ಕುಜದೋಷ, ಕಾಲಸರ್ಪದೋಷ, ಸಾಡೇಸಾತಿ ಗ್ರಹದೋಷಗಳಿಗೆ ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ.
            </p>
            <div className="text-center text-3xl">🕉️</div>
          </div>

          <div className="border border-black p-2.5 rounded h-full flex flex-col justify-between text-center">
            <div className="font-black text-[11px] border-b border-black pb-1 mb-1">
              ಸಂಪರ್ಕ ವಿಳಾಸ
            </div>
            <div className="font-bold text-[12px]">ಪಂಡಿತ್ ಸುಧೀಂದ್ರ ಭಟ್</div>
            <div className="text-[10px]">ಶ್ರೀ ಅನ್ನಪೂರ್ಣೇಶ್ವರಿ ಜ್ಯೋತಿಷ್ಯಾಲಯ, ಹುಬ್ಬಳ್ಳಿ</div>
            <div className="bg-black text-white p-1.5 font-mono font-bold text-[11px] rounded">
              ಮೊಬೈಲ್ : 8971983245
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-black text-white text-center py-1.5 font-bold text-[12px]">
          ದೂರದ ಊರಿನವರು ಫೋನ್ ಮುಖಾಂತರ ಸಂಪರ್ಕಿಸಿರಿ. ಫೋನ್ ನಂ. : 8971983245
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 8: IDAGUNJI TEMPLE FESTIVALS & GAYA KSHETRA PRIEST                    */
/* -------------------------------------------------------------------------- */

export const Page08IdagunjiFestivals: React.FC<PageTemplateProps> = ({ page, meta }) => {
  const idagunjiEvents = [
    { masa: "ಫಾಲ್ಗುಣ", paksha: "ಕೃ", tithi: "೩೦", vara: "ಗುರು", date: "19/3/2026", desc: "ನೂತನ ಪಂಚಾಂಗ ಶ್ರವಣ, ವಸಂತಪೂಜಾರಂಭ" },
    { masa: "ಶ್ರಾವಣ", paksha: "ಶು", tithi: "೪", vara: "ಚಂದ್ರ", date: "17/8/2026", desc: "ನಾಗ ಪಂಚಮಿ" },
    { masa: "ಶ್ರಾವಣ", paksha: "ಶು", tithi: "೧೫", vara: "ಶುಕ್ರ", date: "28/8/2026", desc: "ಉಪಾಕರ್ಮ" },
    { masa: "ಭಾದ್ರಪದ", paksha: "ಶು", tithi: "೪", vara: "ಚಂದ್ರ", date: "14/9/2026", desc: "ಶ್ರೀ ಗಣೇಶ ಚತುರ್ಥಿ" },
    { masa: "ಆಶ್ವೀಜ", paksha: "ಶು", tithi: "೯", vara: "ಕುಜ", date: "20/10/2026", desc: "ವಿಜಯದಶಮಿ, ಸೀಮೋಲ್ಲಂಘನ" },
    { masa: "ಕಾರ್ತಿಕ", paksha: "ಶು", tithi: "೧೨", vara: "ಶನಿ", date: "21/11/2026", desc: "ತುಳಸಿ ವಿವಾಹ" },
    { masa: "ಕಾರ್ತಿಕ", paksha: "ಶು", tithi: "೧೫", vara: "ಕುಜ", date: "24/11/2026", desc: "ಲಕ್ಷದೀಪೋತ್ಸವ, ಪುಷ್ಪರಥೋತ್ಸವ" },
    { masa: "ಪುಷ್ಯ", paksha: "ಶು", tithi: "೭", vara: "ಶುಕ್ರ", date: "15/01/2027", desc: "ಸಂಕ್ರಾಂತಿ ಉತ್ಸವಾರಂಭ, ಗ್ರಾಮೋತ್ಸವ" },
    { masa: "ಮಾಘ", paksha: "ಶು", tithi: "೨", vara: "ಚಂದ್ರ", date: "08/2/2027", desc: "ಜಾತ್ರಾ ಪ್ರಾರಂಭ, ಮೃತ್ತಿಕಾಹರಣ, ಅಂಕುರಾರ್ಪಣ" },
    { masa: "ಮಾಘ", paksha: "ಶು", tithi: "೩", vara: "ಕುಜ", date: "09/2/2027", desc: "ಧ್ವಜಾರೋಹಣ, ಕೌತುಕ ಬಂಧನ" },
    { masa: "ಮಾಘ", paksha: "ಶು", tithi: "೪", vara: "ಬುಧ", date: "10/2/2027", desc: "ಮೂಷಿಕ ಯಂತ್ರೋತ್ಸವ ಗಜ ಯಂತ್ರೋತ್ಸವ" },
    { masa: "ಮಾಘ", paksha: "ಶು", tithi: "೬", vara: "ಶುಕ್ರ", date: "12/2/2027", desc: "ಪುಷ್ಪ ರಥೋತ್ಸವ" },
    { masa: "ಮಾಘ", paksha: "ಶು", tithi: "೭", vara: "ಶನಿ", date: "13/2/2027", desc: "ಮಹಾರಥೋತ್ಸವ" }
  ];

  const sankashtiDates = [
    { no: 1, masa: "ಚೈತ್ರ", day: "ಸಂಕಷ್ಟಿ", vara: "ರವಿ", date: "05/04/2026" },
    { no: 2, masa: "ವೈಶಾಖ", day: "ಅಂಗಾರಕ ಸಂಕಷ್ಟಿ", vara: "ಕುಜ", date: "05/05/2026" },
    { no: 3, masa: "ಅಧಿಕಜ್ಯೇಷ್ಠ", day: "ಸಂಕಷ್ಟಿ", vara: "ಗುರು", date: "04/06/2026" },
    { no: 4, masa: "ನಿಜಜ್ಯೇಷ್ಠ", day: "ಸಂಕಷ್ಟಿ", vara: "ಶುಕ್ರ", date: "03/07/2026" },
    { no: 5, masa: "ಆಷಾಢ", day: "ಸಂಕಷ್ಟಿ", vara: "ರವಿ", date: "02/08/2026" },
    { no: 6, masa: "ಶ್ರಾವಣ", day: "ಸಂಕಷ್ಟಿ", vara: "ಚಂದ್ರ", date: "31/08/2026" },
    { no: 7, masa: "ಭಾದ್ರಪದ", day: "ಅಂಗಾರಕ ಸಂಕಷ್ಟಿ", vara: "ಕುಜ", date: "29/09/2026" },
    { no: 8, masa: "ಆಶ್ವಯುಜ", day: "ಸಂಕಷ್ಟಿ", vara: "ಗುರು", date: "29/10/2026" },
    { no: 9, masa: "ಕಾರ್ತಿಕ", day: "ಸಂಕಷ್ಟಿ", vara: "ಶುಕ್ರ", date: "27/11/2026" },
    { no: 10, masa: "ಮಾರ್ಗಶಿರ", day: "ಸಂಕಷ್ಟಿ", vara: "ಶನಿ", date: "26/12/2026" },
    { no: 11, masa: "ಪುಷ್ಯ", day: "ಸಂಕಷ್ಟಿ", vara: "ಚಂದ್ರ", date: "25/01/2027" },
    { no: 12, masa: "ಮಾಘ", day: "ಸಂಕಷ್ಟಿ", vara: "ಬುಧ", date: "24/02/2027" }
  ];

  return (
    <BaggonaLandscapeFrame pageNumber={8}>
      <div className="h-full grid grid-cols-12 gap-2 text-[9px] overflow-hidden">
        {/* Left Side: Idagunji Temple (width 58%) */}
        <div className="col-span-7 flex flex-col justify-between space-y-1">
          {/* Top Title Banner */}
          <div className="bg-black text-white p-1 text-center font-black text-[10.5px]">
            ಶ್ರೀ ವಿನಾಯಕ ದೇವರು ಇಡಗುಂಜಿ ತಾ: ಹೊನ್ನಾವರ ✆: 247227 / ಶ್ರೀ ದೇವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನಡೆಯತಕ್ಕ ವಾರ್ಷಿಕ ಕಾರ್ಯಕ್ರಮಗಳು
          </div>

          {/* Idagunji Festivals Table */}
          <div className="border border-black overflow-hidden">
            <table className="w-full border-collapse text-[8.5px]">
              <thead>
                <tr className="border-b border-black font-black bg-slate-100">
                  <th className="border-r border-black p-[1px]">ಮಾಸ</th>
                  <th className="border-r border-black p-[1px]">ಪಕ್ಷ</th>
                  <th className="border-r border-black p-[1px]">ತಿಥಿ</th>
                  <th className="border-r border-black p-[1px]">ವಾರ</th>
                  <th className="border-r border-black p-[1px] font-mono">ದಿನಾಂಕ</th>
                  <th className="p-[1px] text-left px-1.5">ಹಬ್ಬಗಳ ವಿವರ</th>
                </tr>
              </thead>
              <tbody>
                {idagunjiEvents.map((r, i) => (
                  <tr key={i} className="border-b border-black/30">
                    <td className="border-r border-black p-[1px] text-center">{r.masa}</td>
                    <td className="border-r border-black p-[1px] text-center font-bold">{r.paksha}</td>
                    <td className="border-r border-black p-[1px] text-center">{r.tithi}</td>
                    <td className="border-r border-black p-[1px] text-center">{r.vara}</td>
                    <td className="border-r border-black p-[1px] text-center font-mono font-bold">{r.date}</td>
                    <td className="p-[1px] px-1.5 truncate font-medium">{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[8.5px] font-bold text-center italic bg-slate-100 p-0.5 border border-black">
            ಪ್ರತಿನಿತ್ಯ ಶ್ರೀ ದೇವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಗಣಹೋಮ ಹಾಗೂ ಸತ್ಯ ಗಣಪತಿಯ ವ್ರತವು ನಡೆಯುತ್ತದೆ. ಪ್ರತಿ ಸಂಕಷ್ಟಿ ಚತುರ್ಥಿಯಂದು ವಿಶೇಷ ಪೂಜೆ ಇರುತ್ತದೆ.
          </div>

          {/* Sankashti Table & Archaka Card */}
          <div className="border border-black flex flex-row">
            <div className="w-[62%] border-r border-black">
              <table className="w-full border-collapse text-[8px]">
                <thead>
                  <tr className="border-b border-black font-black bg-slate-200">
                    <th className="border-r border-black p-[1px]">ಅ. ನಂ.</th>
                    <th className="border-r border-black p-[1px]">ಮಾಸ</th>
                    <th className="border-r border-black p-[1px]">ದಿನ</th>
                    <th className="border-r border-black p-[1px]">ವಾರ</th>
                    <th className="p-[1px] font-mono">ದಿನಾಂಕ</th>
                  </tr>
                </thead>
                <tbody>
                  {sankashtiDates.map((r) => (
                    <tr key={r.no} className="border-b border-black/30">
                      <td className="border-r border-black p-[1px] text-center font-bold">{r.no}</td>
                      <td className="border-r border-black p-[1px] text-center">{r.masa}</td>
                      <td className="border-r border-black p-[1px] text-center font-bold">{r.day}</td>
                      <td className="border-r border-black p-[1px] text-center">{r.vara}</td>
                      <td className="p-[1px] text-center font-mono font-bold">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="w-[38%] p-1.5 flex flex-col justify-center text-center font-serif text-[8.5px]">
              <div className="font-black text-[9.5px]">ಶ್ರೀ ವಿನಾಯಕ ದೇವರು, ಇಡಗುಂಜಿ</div>
              <div className="font-bold mt-1">ಪ್ರಧಾನ ಅರ್ಚಕರು</div>
              <div className="font-black text-[9.5px]">ವೇ॥ ಮಂಜುನಾಥ ಶಿವರಾಮ ಭಟ್ಟ</div>
              <div className="font-mono font-bold mt-1">ಮೊಬೈಲ್: 9448629475</div>
              <div className="font-mono font-bold">9972325375</div>
            </div>
          </div>
        </div>

        {/* Right Side: Mahaganapati Arts & Gaya Priest */}
        <div className="col-span-5 flex flex-col justify-between space-y-1">
          {/* Top: Mahaganapati Arts */}
          <div className="border border-black p-2 text-center flex-1 flex flex-col justify-between">
            <h3 className="text-[15px] font-black border-b border-black pb-0.5">
              ಶ್ರೀ ಮಹಾಗಣಪತಿ ಆರ್ಟ್ಸ್
            </h3>
            <p className="text-[9px] leading-tight mt-1">
              ಮದುವೆ, ಉಪನಯನ, ಹುಟ್ಟುಹಬ್ಬದ ಕೊಡುಗೆಗಾಗಿ, ಸಂಘ ಸಂಸ್ಥೆಗಳಿಗೆ ಕಾಣಿಕೆಯಾಗಿ ನೀಡಲು, ಶ್ರೀ ಇಡಗುಂಜಿ ಮಹಾಗಣಪತಿಯ ಪಲ್ಪ್, ಪ್ಲಾಸ್ಟರ್, ಪ್ಲಾಸ್ಟಿಕ್ ವಿಗ್ರಹಗಳು, ಬೆಳ್ಳಿಯ ಡಾಲರ್, ಫೋಟೋ, ಉಂಗುರ, ಶ್ರೀ ಚಕ್ರ ಲಭ್ಯ.
            </p>
            <div className="font-bold text-[9px] mt-1">
              ಇಡಗುಂಜಿ, ತಾ. ಹೊನ್ನಾವರ, (ಉ.ಕ.) 581423 • ದೂರವಾಣಿ : 9663274542
            </div>
          </div>

          {/* Bottom: Gaya Kshetra Priest */}
          <div className="border-2 border-black p-2 text-center bg-slate-50 flex-1 flex flex-col justify-between">
            <div className="bg-black text-white font-black py-0.5 text-[11px]">
              ದಕ್ಷಿಣ ಭಾರತದ ಪುರೋಹಿತರು, ಪ್ರವೀಣ ಪಾಠಕ
            </div>
            <p className="text-[8.5px] leading-tight mt-1">
              ಗಯಾಕ್ಷೇತ್ರಕ್ಕೆ ಬರುವ ಯಾತ್ರಿಕರಿಗೆ ನಮ್ಮಲ್ಲಿ ಗಯಾ ಶ್ರಾದ್ಧವನ್ನು ಯಥಾಯೋಗ್ಯವಾದ ವಸತಿ, ಊಟದೊಂದಿಗೆ ಪಿತೃಶ್ರಾದ್ಧ, ವಿಷ್ಣುಪದ ತುಲಸಿ ಅರ್ಚನೆ, ಮಹಾಪೂಜಾ ಎಲ್ಲಾ ವ್ಯವಸ್ಥೆ ಮಾಡಲಾಗುವುದು.
            </p>
            <div className="font-bold text-[8.5px] mt-0.5">
              ವಿಳಾಸ : ಗಯಾ ಕ್ಷೇತ್ರ ತೀರ್ಥ ಪುರೋಹಿತ ಪ್ರವೀಣಾಚಾರ್ಯ ಪಾಠಕ
            </div>
            <div className="font-mono font-bold text-[8.5px]">
              ಚಾಂದ ಚೌರಾ, ಗಯಾ, ಬಿಹಾರ ಸೆಲ್: 09661441389, 9905567875
            </div>
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 9: PRASTAVANE (FOREWORD) & SHRADDHA TITHI NIRNAYA                     */
/* -------------------------------------------------------------------------- */

export const Page09PrastavaneAndShraddha: React.FC<PageTemplateProps> = ({ page, meta }) => {
  const nakshatraKandaya = [
    { nak: "ಅಶ್ವಿನಿ, ಮಘಾ, ಮೂಲಾ", aaya: "01–05", vyaya: "02–04" },
    { nak: "ಭರಣಿ, ಹುಬ್ಬಾ, ಪೂ.ಷಾಢ", aaya: "11–11", vyaya: "11–11" },
    { nak: "ಕೃತ್ತಿಕಾ, ಉತ್ತರಾ, ಉ.ಷಾಢ", aaya: "14–02", vyaya: "02–14" },
    { nak: "ರೋಹಿಣಿ, ಹಸ್ತ, ಶ್ರವಣ", aaya: "08–05", vyaya: "11–05" },
    { nak: "ಮೃಗಶಿರಾ, ಚಿತ್ತಾ, ಧನಿಷ್ಠಾ", aaya: "02–05", vyaya: "05–02" },
    { nak: "ಆರ್ದ್ರಾ, ಸ್ವಾತಿ, ಶತಭಿಷಾ", aaya: "05–11", vyaya: "14–08" },
    { nak: "ಪುನರ್ವಸು, ವಿಶಾಖಾ, ಪೂ.ಭಾದ್ರ", aaya: "14–08", vyaya: "08–11" },
    { nak: "ಪುಷ್ಯ, ಅನೂರಾಧಾ, ಉ.ಭಾದ್ರ", aaya: "08–11", vyaya: "11–08" }
  ];

  const rashiKandaya = [
    { rashi: "ಮೇಷ, ವೃಶ್ಚಿಕ", aaya: "02–05", vyaya: "05–02" },
    { rashi: "ವೃಷಭ, ತುಲಾ", aaya: "11–11", vyaya: "11–11" },
    { rashi: "ಮಿಥುನ, ಕನ್ಯಾ", aaya: "02–14", vyaya: "14–02" },
    { rashi: "ಕರ್ಕ", aaya: "11–05", vyaya: "08–05" },
    { rashi: "ಸಿಂಹ", aaya: "05–02", vyaya: "02–05" },
    { rashi: "ಧನು, ಮೀನಾ", aaya: "14–08", vyaya: "14–08" }
  ];

  const shraddhaTable = [
    { d: "24–0", a: "14–24", k: "22–24" },
    { d: "24–15", a: "14–31", k: "22–35" },
    { d: "24–30", a: "14–37", k: "22–45" },
    { d: "24–45", a: "14–45", k: "23–0" },
    { d: "25–0", a: "15–0", k: "23–10" },
    { d: "25–15", a: "15–08", k: "23–21" },
    { d: "25–30", a: "15–15", k: "23–35" },
    { d: "25–45", a: "15–20", k: "23–45" },
    { d: "26–0", a: "15–30", k: "24–0" },
    { d: "26–15", a: "15–38", k: "24–15" },
    { d: "26–30", a: "15–45", k: "24–30" },
    { d: "27–0", a: "16–12", k: "25–12" }
  ];

  return (
    <BaggonaLandscapeFrame pageNumber={9}>
      <div className="h-full grid grid-cols-2 gap-3 text-[9px] leading-tight overflow-hidden">
        {/* Left Side: Prastavane & Kandaya */}
        <div className="border border-black p-2 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="bg-black text-white text-center font-black py-0.5 text-[12px] mb-1">
              ಪ್ರಸ್ತಾವನೆ
            </div>
            <div className="text-center font-serif text-[10px] font-bold">
              ವಂದೇಽರವಿಂದರಮಣಂ ವೃಂದಾರಕ ವೃಂದವಂದಿತಂ ತರಣಿಂ |
            </div>
            <div className="text-center font-serif text-[10px] font-bold">
              ವಂದೇಽಹತಿಮಿರಹರಣಂ ತ್ರಿಭುವನಶರಣಂ ಪ್ರಭಾಕರಂ ದ್ಯುಮಣಿಮ್ ||
            </div>
            <p className="font-serif text-[8.5px] mt-1 text-justify leading-snug">
              ಪ್ರತ್ಯಕ್ಷಂ ಜ್ಯೋತಿಷಾಂಶಾಸ್ತ್ರಂ ಚಂದ್ರಾರ್ಕೌ ಯತ್ರ ಸಾಕ್ಷಿಣೌ ತತ್ಪದ್ಧತಿ ವಶಾನ್ನಿತ್ಯಂ ಯಥಾ ದೃಗ್ಗಣಿತೋತ್ಥಿತಾಂ ಗ್ರಹಾಃ ಸ್ಫುಟಂ ದೃಕ್ಕುಲ್ಯತಾಂ ಗಚ್ಚೇದಯನೇ ವಿಪವದ್ಧಯೇ ಯಸ್ಮಿನ್ ಪಕ್ಷೇ ಯತ್ಕಾಲೇ ಯೇನ ದೃಗ್ಗಣಿತೈಕ್ಯತಾಮ್ ದೃಶ್ಯತೇ ತೇನ ಪಕ್ಷೇಣ ಕುರ್ಯಾತ್ತಿಥ್ಯಾದಿ ನಿರ್ಣಯಮ್ ಎಂಬ ವಚನದಂತೆ ದೃಕ್ಕುಲ್ಯವಾದ ಗಣಿತದಿಂದ ತಿಥ್ಯಾದಿಗಳನ್ನು ಸಾಧಿಸಬೇಕು. ಮತ್ತು ಪಂಚಾಂಗಕ್ಕೆ ಸೂರ್ಯ ಚಂದ್ರರ ಸ್ಫುಟವೇ ಮೂಲವಾಗಿರುವುದರಿಂದಲೂ ಅವು ಸೂಕ್ಷ್ಮವಾಗಿದ್ದರೆ ಮಾತ್ರ ಪಂಚಾಂಗವು ಸೂಕ್ತವಾಗುವದರಿಂದ ಅನಾದಿಕಾಲದಿಂದಲೂ ಸೂಕ್ಷ್ಮ ದೃಗ್ಗಣಿತರೀತ್ಯಾ ಪಂಚಾಂಗ ತಯಾರಿಸುತ್ತಿದ್ದು ಅದರಂತೆ ಪರಾಭವ ಸಂವತ್ಸರದ ಪಂಚಾಂಗವನ್ನು ಸೂಕ್ಷ್ಮ ದೃಗ್ಗಣಿತ ಪದ್ಧತಿಯಿಂದ ತಯಾರಿಸಿ ಗ್ರಾಹಕರ ಕೈಯಲ್ಲಿ ಅರ್ಪಿಸುತ್ತಿದ್ದೇವೆ.
            </p>
            <div className="text-right font-black text-[9px] mt-0.5">─ ಸಂಪಾದಕರು</div>
          </div>

          {/* Dual Kandaya Tables */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-black">
            {/* Nakshatra Kandaya */}
            <div className="border border-black overflow-hidden">
              <div className="bg-slate-200 text-center font-black text-[8px] p-0.5">
                ಅಥ ನಕ್ಷತ್ರ ಕಂದಾಯ
              </div>
              <table className="w-full text-[7.5px] text-center border-collapse">
                <thead>
                  <tr className="border-b border-black font-bold">
                    <th className="border-r border-black p-[1px]">ನಕ್ಷತ್ರ</th>
                    <th className="border-r border-black p-[1px]">ಆಯ</th>
                    <th className="p-[1px]">ವ್ಯಯ</th>
                  </tr>
                </thead>
                <tbody>
                  {nakshatraKandaya.slice(0, 6).map((r, i) => (
                    <tr key={i} className="border-b border-black/30">
                      <td className="border-r border-black p-[1px] text-left px-1 truncate">{r.nak}</td>
                      <td className="border-r border-black p-[1px] font-mono">{r.aaya}</td>
                      <td className="p-[1px] font-mono">{r.vyaya}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rashi Kandaya */}
            <div className="border border-black overflow-hidden">
              <div className="bg-slate-200 text-center font-black text-[8px] p-0.5">
                ಅಥ ರಾಶಿ ಕಂದಾಯ
              </div>
              <table className="w-full text-[7.5px] text-center border-collapse">
                <thead>
                  <tr className="border-b border-black font-bold">
                    <th className="border-r border-black p-[1px]">ರಾಶಿ</th>
                    <th className="border-r border-black p-[1px]">ಆಯ</th>
                    <th className="p-[1px]">ವ್ಯಯ</th>
                  </tr>
                </thead>
                <tbody>
                  {rashiKandaya.map((r, i) => (
                    <tr key={i} className="border-b border-black/30">
                      <td className="border-r border-black p-[1px] text-left px-1 truncate">{r.rashi}</td>
                      <td className="border-r border-black p-[1px] font-mono">{r.aaya}</td>
                      <td className="p-[1px] font-mono">{r.vyaya}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Shraddha Tithi Nirnaya */}
        <div className="border border-black p-2 flex flex-col justify-between overflow-hidden">
          <div className="bg-black text-white text-center font-black py-0.5 text-[12px] mb-1">
            ಶ್ರಾದ್ಧ ತಿಥಿ ನಿರ್ಣಯ
          </div>

          <div className="grid grid-cols-12 gap-1.5 items-start">
            <div className="col-span-8 text-[8.5px] font-serif leading-tight">
              <p>
                “ಅಪರಾಹ್ನಃ ಪಿತೃಣಾಂ” ಅಂದರೆ ಶ್ರಾದ್ಧಕ್ಕೆ ಮೃತ ತಿಥಿಯು ಅಪರಾಹ್ನ ವ್ಯಾಪಿನಿಯಾಗಿರಬೇಕೆಂದು ಎಲ್ಲ ಸ್ಮೃತಿಗಳಲ್ಲಿಯೂ ಮತ್ತು ವೇದಗಳಲ್ಲಿಯೂ ಉಕ್ತವಾಗಿದೆ. (ದಿನಮಾನವು 30 ಘಟಿಯಿರುವಾಗ) ಹಗಲು 18ರ ಮೇಲೆ 24ರ ವರೆಗಿನ ಘಟಿ ಕಾಲವು “ಅಪರಾಹ್ನ” ವೆಂದೆನಿಸುವದು.
              </p>
              <p className="mt-1">
                ದಿನಮಾನವು 30 ಘಟಿಗಳಿಗಿಂತ ಹೆಚ್ಚು ಯಾ ಕಡಿಮೆ ಇದ್ದಾಗ ಆ “ಅಪರಾಹ್ನ” ಕಾಲವೂ ಹೆಚ್ಚು ಕಡಿಮೆ ಯಾಗುತ್ತದೆ. ಅದರ ವಿವರಗಳನ್ನು ಈ ಎದುರಿಗೆ ಕೊಟ್ಟ ಕೋಷ್ಟಕದಿಂದ ಅರಿತುಕೊಳ್ಳಬಹುದು.
              </p>
            </div>

            {/* Table */}
            <div className="col-span-4 border border-black overflow-hidden">
              <table className="w-full text-[7.5px] text-center border-collapse">
                <thead>
                  <tr className="border-b border-black font-bold bg-slate-100">
                    <th className="border-r border-black p-[1px]">ದಿವಾ ಮಾನ</th>
                    <th className="border-r border-black p-[1px]">ಅಪರಾಹ್ನ ದಿನ</th>
                    <th className="p-[1px]">ಕಾಲ ವರೆಗೆ</th>
                  </tr>
                </thead>
                <tbody>
                  {shraddhaTable.map((r, i) => (
                    <tr key={i} className="border-b border-black/30">
                      <td className="border-r border-black p-[1px] font-mono">{r.d}</td>
                      <td className="border-r border-black p-[1px] font-mono">{r.a}</td>
                      <td className="p-[1px] font-mono">{r.k}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-black pt-1 mt-1 text-[8.5px] font-serif leading-tight">
            <div className="font-bold">“ದ್ವಿವಾರಮಾಗತಾಯಾಂ ತು ಮಾಸಿ ಪ್ರಾಗಾಗತಾ ತಿಥಿಃ”</div>
            <p className="text-[8px] text-slate-800 mt-0.5">
              ಸ್ಪಷ್ಟಸ್ನಾನಗತಾಯಾಂ ತು ಮಾಸಿ ತಸ್ಯಾಂತ ಸಂಕ್ರಮೇ ಎಂಬ ಪ್ರಮಾಣ ವಚನದ ಪ್ರಕಾರ ಮೃತ ಸೌರ ಮಾಸದಲ್ಲಿ ಎರಡಾವರ್ತಿ ಮೃತತಿಥಿಯು ಬಂದರೆ ಆ ಮಾಸದ ಪ್ರಾರಂಭದಲ್ಲಿ ಬರುವ ಮೃತತಿಥಿಯಲ್ಲಿ ಪ್ರತಿ ಸಾಂವತ್ಸರಿಕ ಶ್ರಾದ್ಧ ಮಾಡತಕ್ಕದ್ದು.
            </p>
            <div className="text-right font-bold text-[8px] mt-0.5">─ ಇತಿ ಹಾರೀತಃ</div>
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGE 10: SHREEMUKHA (DUAL SHANKARACHARYA BLESSING LETTERS)                 */
/* -------------------------------------------------------------------------- */

export const Page10Shreemukha: React.FC<PageTemplateProps> = ({ page, meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={10}>
      <div className="h-full grid grid-cols-2 gap-3 text-[9px] leading-tight overflow-hidden p-1">
        {/* Left Side: Kanchi Kamakoti Shrimukha */}
        <div className="border border-black p-2 flex flex-col justify-between font-serif">
          <div className="text-center">
            <div className="text-[8.5px] font-bold border-b border-black pb-1 mb-1">
              ತಮ್ಮ ಪರಿಣಿತವಾದ ತಪೋಜ್ಞಾನ ವಯೋ ವಿದ್ವತ್ತುಗಳ ಹಿರಿಮೆಯಿಂದ ಆಸೇತು ಹಿಮಾಚಲ ವಿಖ್ಯಾತಮಹಿಮರಾದ ಶ್ರೀ ಕಾಂಚೀ ಕಾಮಕೋಟಿ ಪೀಠಾಧೀಶ ಶ್ರೀ ಪಂ. ಪ. ಶ್ರೀಮಜ್ಜಗದ್ಗುರು ಶ್ರೀ ಶಂಕರಾಚಾರ್ಯವರ್ಯರು ನಮ್ಮ “ಬಗ್ಗೋಣ ಪಂಚಾಂಗ”ವನ್ನು ಸನ್ಮಾನಿಸಿ ದಯಪಾಲಿಸಿದ
            </div>
            <div className="font-black text-[13px] tracking-wider">
              ಶ್ರೀಮುಖ
            </div>
            <div className="font-bold text-[10.5px]">
              (ಶ್ರೀ ಚಂದ್ರಮೌಳೀಶ್ವರ)
            </div>
          </div>

          <div className="text-[8px] leading-snug space-y-1 text-justify flex-1 overflow-hidden pt-1">
            <p>
              ಸ್ವಸ್ತಿ ಶ್ರೀಮದಖಿಲಭೂಮಂಡಲಾಲಂಕಾರತ್ರಯಸ್ತ್ರಿಂಶತ್ಕೋಟಿ ದೇವತಾಸೇವಿತ ಶ್ರೀಕಾಮಾಕ್ಷೀದೇವೀಸನಾಥ ಶ್ರೀಮದೇಕಾಮ್ರನಾಥ ಶ್ರೀಮಹಾದೇವೀಸನಾಥ ಶ್ರೀಹಸ್ತಿಗಿರಿನಾಥ ಸಾಕ್ಷಾತ್ಕಾರ ಪರಮಾಧಿಷ್ಠಾನ ಕಾಂಚೀದಿವ್ಯಕ್ಷೇತ್ರೇ ಶಾರದಾಮಠಸುಸ್ಥಿತಾನಾಮ್ ಅತುಲಿತಸುಧಾರಸಮಾಧುರ್ಯ ಕಮಲಾಸನಕಾಮಿನೀಧಮ್ಮಿಲ್ಲ-ಸಂಫುಲ್ಲಮಲ್ಲಿಕಾಮಾಲಿಕಾನಿಷ್ಯಂದ ಮಕರಂದಝರೀಸೌಭಸ್ತಿಕ್ ವಾಗ್ನಿಗುಂಭವಿಜೃಂಭಣಾನಂದತುಂದಿಲತಮನೀಷಿ-ಮಂಡಲಾನಾಮ್ ಅನವರತಾದ್ವೈತವಿದ್ಯಾವಿನೋದರಸಿಕಾನಾಮ್ ನಿರಂತರಾಲಂಕೃತೀಕೃತಶಾಂತಿದಾಂತಾದಿ ಸಕಲಭುವನಚಕ್ರಪ್ರತಿಷ್ಠಾಪಕ ಶ್ರೀಚಕ್ರಪ್ರತಿಷ್ಠಾವಿಖ್ಯಾತಯಶೋಲಂಕೃತಾನಾಂ ನಿಖಿಲಪಾಷಂಡಕಂಟಕೋತ್ಪಾಟನೇನ ವಿಶದೀಕೃತವೇದವೇದಾಂತಮಾರ್ಗ ಷಣ್ಮತಪ್ರತಿಷ್ಠಾಪಕಾಚಾರ್ಯಾಣಾಂ ಶ್ರೀಮತ್ಪರಮಹಂಸಪರಿವ್ರಾಜಕಾಚಾರ್ಯವರ್ಯ ಶ್ರೀ ಜಗದ್ಗುರು ಶ್ರೀಮಚ್ಛಂಕರ ಭಗವತ್ಪಾದಾಚಾರ್ಯಾಣಾಂ ಅಧಿಷ್ಠಾನೇ ಸಿಂಹಾಸನಾಭಿಷಿಕ್ತ ಶ್ರೀಮನ್ಮಹಾದೇವೇಂದ್ರ-ಸರಸ್ವತೀ ಸಂಯಮೀಂದ್ರಾಣಾಮ್ ಅಂತೇವಾಸಿವರ್ಯ ಶ್ರೀಮಚ್ಚಂದ್ರಶೇಖರೇಂದ್ರಸರಸ್ವತೀ ಶ್ರೀಪಾದಾದೇಶಾನುಸಾರೇಣ ಶ್ರೀಮಜ್ಜಯೇಂದ್ರಸರಸ್ವತೀ ಶ್ರೀಪಾದೈಃ ಕ್ರಿಯತೇ ನಾರಾಯಣಸ್ಮೃತಿಃ॥
            </p>
            <p>
              ಅಸ್ಮತ್ಪೂಜ್ಯಶ್ರೀಪರಮೇಷ್ಠಿಗುರುಭಿಃ ಅಷ್ಟಾಶೀತಿವತ್ಸರೇಭ್ಯಃ ಪೂರ್ವಂ ಈಶ್ವರನಾಮಸಂವತ್ಸರೇ ಅನುಷ್ಠೇಯ-ಪಂಚಾಂಗವಿಷಯೇ ಮಧ್ಯಸ್ಥಪಂಡಿತನಿರ್ಣಯಪೂರ್ವಕ ವಿಚಾರಂ ಕೃತ್ವಾ ಆಸ್ತಿಕಾನಾಂ ದೈವಪಿತೃಕಾರ್ಯಾರ್ಥಂ ಕಶ್ಚಿನಿರ್ಣಯಃ ಕೃತಃ| ಪಂಚಾಂಗಕರ್ತಾರಃ ಪಂಡಿತ ರಾಮಚಂದ್ರ ಶಾಸ್ತ್ರಿಣಃ ಸನ್ಮಾನಿತಾಃ ಸದಾ ಭವಂತು ಶುಭಮ್।
            </p>
          </div>

          <div className="text-right font-black text-[9px] border-t border-black pt-1">
            ನಾರಾಯಣಸ್ಮೃತಿಃ
          </div>
        </div>

        {/* Right Side: Sonda Swarnavalli Shrimukha */}
        <div className="border border-black p-2 flex flex-col justify-between font-serif">
          <div className="text-center">
            <div className="text-2xl">🕉️</div>
            <div className="text-[9px] font-bold">
              ಶ್ರೀ ಶಕೆ {meta.shakaYear} {meta.samvatsaraKn} ಸಂ.ದ ಪುಷ್ಯ ವದ್ಯ ಸೋಮವಾಸರೇ ಮಹೋದಯೇ
            </div>
            <div className="font-black text-[14px] tracking-wider mt-0.5">
              ಶ್ರೀಮುಖ
            </div>
          </div>

          <div className="text-[8px] leading-snug space-y-1 text-justify flex-1 overflow-hidden pt-1">
            <p>
              ಶ್ರೀಮತ್ ಪರಮಹಂಸಪರಿವ್ರಾಜಕಾಚಾರ್ಯವರ್ಯ, ಪದವಾಕ್ಯಪ್ರಮಾಣ ಪಾರಾವಾರಪಾರೀಣ ಯಮನಿಯಮಾಸನ ಪ್ರಾಣಾಯಾಮ ಪ್ರತ್ಯಾಹಾರ ಧ್ಯಾನಧಾರಣ ಸಮಾಧ್ಯಷ್ಟಾಂಗಯೋಗಾನುಷ್ಠಾನನಿಷ್ಠ, ಪಂಚಾಯತನಸ್ಥಾಪನಾಚಾರ್ಯ, ತಪಶ್ಚಕ್ರವರ್ತ್ಯನಾದ್ಯವಿಚ್ಛಿನ್ನ ಶ್ರೀ ಶ್ರೀಮಜ್ಜಗದ್ಗುರು ಶಂಕರಾಚಾರ್ಯ ಶಿಷ್ಯ ಶ್ರೀಸುರೇಶ್ವರೇಂದ್ರ ಸರಸ್ವತೀ ಕರಕಮಲ ಸಂಜಾತ ಶ್ರೀ ಶ್ರೀಮತ್ ವಿಶ್ವವಂದ್ಯ ಸರಸ್ವತೀ ಗುರು ಪರಂಪರಾಪ್ರಾಪ್ತ ಸಕಲನಿಗಮಾಗಮಸಾರಭೂತ ಸಾಂಖ್ಯತ್ರಯಪ್ರತಿಪಾದಕ ಕ್ರಮಾಗತಶ್ರೌತಸ್ಮಾರ್ತ ಕರ್ಮಮಾರ್ಗವ್ಯವಸ್ಥಾಪಕ, ಅಶೇಷಪಶ್ಯಂತೋತ್ಪಾದ್ಯದ್ವೈತಸಿದ್ಧಾಂತಪ್ರಬಂಧ ಪ್ರವರ್ತಕಕ್ಷ್ಮಾದಿರಾಜಧಾನೀ ವಿದ್ಯಾನಗರ ಮಹಾರಾಜಧಾನೀ ಶ್ರೀಮತ್ ಸುಧಾಪುರವರಸಿಂಹಾಸನಾಧೀಶ್ವರ ಸರ್ವತಂತ್ರಸ್ವತಂತ್ರ ವ್ಯಾಖ್ಯಾನ ಸಿಂಹಾಸನಾಧಿಷ್ಠಿತ, ರಾಜಾಧಿರಾಜದೇಶಿಕ ಗೋಕರ್ಣಮಂಡಲಾಧೀಶ, ಸಹ್ಯಾದ್ರಿಪುರವರಾಧೀಶ್ವರ, ಶಾಲ್ಮಲೀತೀರವಾಸ, ಶ್ರೀಮಲ್ಲಕ್ಷ್ಮೀನೃಸಿಂಹ ಚಂದ್ರಮೌಳಿ ಪದಪಂಕಜರಹಸ್ರಾಗ್ರನಿವಾಸ ಶ್ರೀಮತ್ ಸೋಂದಾ ಸ್ವರ್ಣವಲ್ಲೀ ಮಹಾಸಂಸ್ಥಾನಾಧೀಶ್ವರ ಶ್ರೀ ಶ್ರೀಮತ್ ಸರ್ವಜ್ಞೇಂದ್ರ ಸರಸ್ವತೀ ಶ್ರೀಸ್ವಾಮಿಕರಕಮಲಸಂಜಾತ─
            </p>
            <div className="text-center font-black text-[10px] my-0.5">
              ಶ್ರೀ ಶ್ರೀಮದ್ ಗಂಗಾಧರೇಂದ್ರ ಸರಸ್ವತೀ ಶ್ರೀಸ್ವಾಮಿಭಿಃ
            </div>
            <p>
              ಅಸ್ಮಾತ್ಸಂಪ್ರಿಯಶಿಷ್ಯಬಗ್ಗೋಣಪಂಚಾಂಗಕರ್ತೄಣಾಂ ವಿಷಯೇ ಕೃತಾ ನಾರಾಯಣ ಸ್ಮೃತಯಃ| ದೃಕ್ಸಿದ್ಧಾಂತಮಾದೃತ್ಯ ಕ್ರಿಯಮಾಣಂ ಬಗ್ಗೋಣಾಖ್ಯಮಿದಂ ಪಂಚಾಂಗಂ ಅಬಹೋಃ ಕಾಲಾತ್ ಆಸ್ತಿಕಜನಾನಾಂ ಉಪಕುರ್ವದಸ್ತಿ ಕಾಲನಿಗಣನಾಯ ವಿಷಯೇ ಅಸ್ಮತ್ ಪರಂಪರಾಪ್ರಾಪ್ತ ಗುರುಭಿಃ ಪಂಚಾಂಗಮಿದಂ ಬಹುಮೇನೀರೇ| ಅನೇನ ಕರ್ಮಣಾ ಶ್ರೀ ಲಕ್ಷ್ಮೀನೃಸಿಂಹ ಚಂದ್ರಮೌಳೀಶ್ವರೌ ಶ್ರೀ ರಾಜರಾಜೇಶ್ವರೀ ಚ ಅಂತರ್ಯಾಮಿನವಹಮುತ್ತಾಯುಃ ಸರ್ವದಾ ಸರ್ವತ್ರ ಶುಭಂ ವಿತನ್ವಂತು ಇತಿ ಆಶಾಸ್ಮಹೇ|
            </p>
          </div>

          <div className="flex justify-between items-center border-t border-black pt-1 text-[8.5px]">
            <span>ಯಾತ್ರಾಸ್ಥಾನಂ ಶ್ರೀಕ್ಷೇತ್ರಗೋಕರ್ಣಂ</span>
            <span className="font-black">ನಾರಾಯಣಸ್ಮೃತಿಃ</span>
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGES 11–30: AUTHENTIC 20-PAGE BENCHMARK LAYOUT TEMPLATES                 */
/* -------------------------------------------------------------------------- */

/* PAGE 11: SAMVATSARA PHALASHRUTI */
export const Page11SamvatsaraPhalashruti: React.FC<PageTemplateProps> = ({ meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={11}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ॥ ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರಸ್ಯ ಫಲಶ್ರುತಿಃ ॥
        </div>

        <div className="flex-1 border border-black p-2.5 font-serif flex flex-col justify-between text-[10.5px] leading-relaxed">
          <div className="grid grid-cols-2 gap-4 flex-1 items-start text-justify">
            {/* Left Column: Shlokas & Meaning */}
            <div className="space-y-2 pr-2 border-r border-black/40">
              <div className="border border-black p-2 bg-slate-50 text-center font-bold text-[11px] leading-snug">
                ಸ ಜಯತಿ ಸಿಂಧುರವದನೋ ದೇವೋ ಯತ್ಪಾದಪಂಕಜ ಸ್ಮರಣಂ ।<br />
                ವಾಸರಮಣಿರಿವ ತಮಸಾಂ ರಾಶೀನ್ನಾಶಯತಿ ಸರ್ವವಿಘ್ನಾನಾಂ ॥ ೧ ॥<br />
                ಅಚಿಂತ್ಯಾವ್ಯಕ್ತರೂಪಾಯ ನಿರ್ಗುಣಾಯ ಗುಣಾತ್ಮನೇ ।<br />
                ಸಮಸ್ತ ಜಗದಾಧಾರಮೂರ್ತಯೇ ಬ್ರಹ್ಮಣೇ ನಮಃ ॥ ೨ ॥
              </div>
              <p className="text-[10px] leading-relaxed">
                <span className="font-bold">ಪ್ರತಿಪದಾರ್ಥ & ಭಾವಾರ್ಥ:</span> ಶ್ರೀಮನ್ ಸೂರ್ಯನಾರಾಯಣನು ಪ್ರಾತಃಕಾಲದಲ್ಲಿ ಉದಯಿಸಿದ ತಕ್ಷಣವೇ ಇಡೀ ಜಗತ್ತಿನ ಕತ್ತಲೆಯು ಹೇಗೆ ದೂರವಾಗುವುದೋ, ಹಾಗೆಯೇ ಯಾವ ಪರಮ ಮಂಗಳಕರವಾದ ಸಿಂಧೂರವದನ ಶ್ರೀ ಮಹಾಗಣಪತಿಯ ಪಾದಪದ್ಮಗಳ ಸ್ಮರಣೆಯಿಂದ ಭಕ್ತಜನರ ಸಕಲ ವಿಘ್ನರಾಶಿಗಳು ಶಮನವಾಗುವವೋ, ಅಂತಹ ಪರಬ್ರಹ್ಮಸ್ವರೂಪ ದೇವನಿಗೆ ಅನಂತ ಪ್ರಣಾಮಗಳು.
              </p>
              <div className="border border-black p-2 bg-amber-50/40 text-[9.5px]">
                <div className="font-black text-[11px] border-b border-black pb-0.5 mb-1 text-center">
                  ಜಗಲ್ಲಗ್ನ ಕುಂಡಲಿ ವಿಚಾರ (ವರ್ಷಲಗ್ನ: ವೃಷಭ)
                </div>
                ಸಂವತ್ಸರ ಪ್ರವೇಶ ಲಗ್ನವು ವೃಷಭವಾಗಿದ್ದು, ಶುಭಗ್ರಹರ ಅನುಗ್ರಹದಿಂದ ರಾಷ್ಟ್ರದಲ್ಲಿ ಶಿಕ್ಷಣ, ವೈಜ್ಞಾನಿಕ ತಂತ್ರಜ್ಞಾನ ಹಾಗೂ ಧಾರ್ಮಿಕ ಚಟುವಟಿಕೆಗಳು ಉನ್ನತಿ ಹೊಂದಲಿವೆ.
              </div>
            </div>

            {/* Right Column: Navanayaka Table & Overview */}
            <div className="space-y-2 pl-2">
              <div className="border border-black overflow-hidden">
                <div className="bg-black text-white text-center py-0.5 font-black text-[11px]">
                  ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರದ ನವನಾಯಕ ಮಂಡಲ
                </div>
                <table className="w-full text-[9.5px] border-collapse text-center">
                  <tbody>
                    <tr className="border-b border-black font-bold bg-slate-100">
                      <td className="border-r border-black p-1 w-1/2">ರಾಜ (King) : ಬುಧ</td>
                      <td className="p-1 w-1/2">ಮಂತ್ರಿ (Minister) : ಚಂದ್ರ</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-1">ಸೇನಾಧಿಪತಿ : ಶುಕ್ರ</td>
                      <td className="p-1">ಸಸ್ಯಾಧಿಪತಿ : ರವಿ</td>
                    </tr>
                    <tr className="border-b border-black bg-slate-50">
                      <td className="border-r border-black p-1">ಧಾನ್ಯಾಧಿಪತಿ : ಗುರು</td>
                      <td className="p-1">ಅರ್ಘಾಧಿಪತಿ : ಶನಿ</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-1">ಮೇಘಾಧಿಪತಿ : ಕುಜ</td>
                      <td className="p-1">ರಸಾಧಿಪತಿ : ಬುಧ</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td colSpan={2} className="p-1 font-bold">ನೀರಸಾಧಿಪತಿ : ಗುರು</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-[10px] leading-relaxed">
                ಶ್ರೀ ಜಗದ್ಗುರು ಶಂಕರಾಚಾರ್ಯ ಮಹಾಸಂಸ್ಥಾನದ ಪಾವನ ಆಶೀರ್ವಾದ ಸನ್ನಿಧಿಯಲ್ಲಿ ಗೋಕರ್ಣ ದೃಗ್ಗಣಿತ ಪದ್ಧತಿಯಂತೆ ಈ ಪಂಚಾಂಗವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. ರಾಜ ಬುಧನಾದ್ದರಿಂದ ವಾಣಿಜ್ಯ ಮತ್ತು ಶಿಕ್ಷಣ ಕ್ಷೇತ್ರಕ್ಕೆ ಹಿತಕರ.
              </p>

              <div className="border border-black p-1.5 text-center font-bold text-[9px] bg-slate-100">
                ॥ ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ ॥
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-1 text-[9px] text-center font-sans font-bold text-slate-700">
            ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೧೧
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 12: SAMVATSARA PHALAM */
export const Page12SamvatsaraPhalam: React.FC<PageTemplateProps> = () => {
  return (
    <BaggonaLandscapeFrame
      pageNumber={12}
      topCenterText="12"
      hideFlourishes={true}
      singleBorder={true}
    >
      <div className="w-full h-full grid grid-cols-[51%_49%] text-black divide-x-[1.5px] divide-black">
        {/* LEFT COLUMN: YUGA & SHAKA CALCULATIONS + NAVANAYAKA / UPANAYAKA / TRAYODASHADHIPATI TABLES */}
        <div className="flex flex-col h-full text-black justify-between">
          {/* Top: Yuga & Shaka Calculations Shastric Paragraph */}
          <div className="px-2 py-2 border-b-[1.5px] border-black bg-white">
            <p className="text-justify font-serif text-[11.2px] leading-[26px] tracking-tight font-medium text-black">
              <strong className="font-bold">ಘಾತಿಕೇ:</strong> ಗತಶಕಾಬ್ದಾ: ೧೯೪೬। ಸದ್ಯ ಶಕಾಬ್ದಾ: ೧೬೦೫೪ ಗತಕಲ್ಯಬ್ದಾ: ೫೧೨೪। ಸದ್ಯಕಲ್ಯಬ್ದಾ: ೪೨೬೮೭೬। ಕಲ್ಪಾದ್ಯಹರ್ಗಣಃ ೧೮ ಲಕ್ಷ ೨೨ ಸಾವಿರ ೦೪೭ (ದ್ವಾಪರಯುಗದಲ್ಲಿ ೮ ಲಕ್ಷ ೬೪ ಸಾವಿರ ವರ್ಷಗಳು. ಈ ಯುಗದಲ್ಲಿ ಶ್ರೀ ಕೃಷ್ಣನ ಅವತಾರ ಆಗಿದೆ. ಆಯುಷ್ಯ ಪ್ರಮಾಣ ೧ ಸಾವಿರ ವರ್ಷಗಳು. ಚತುರ್ಥ ಪ್ರಣಾವಾಗಿದೆ. ೪ ನೇ ಕಲಿಯುಗದಲ್ಲಿ ೪ ಲಕ್ಷ ೩೨ ಸಾವಿರ ವರ್ಷಗಳು. ಈ ವರ್ಷಗಳಲ್ಲಿ ಬುದ್ಧ ಹಾಗೂ ಕಲ್ಕಿ ಅವತಾರಗಳು ಹೇಳಲ್ಪಟ್ಟಿದೆ. ಈ ಯುಗದಲ್ಲಿ ೬ ಶಕಕರ್ತರು ಯುಧಿಷ್ಠಿರ ಶಕ, ೩ ಸಾವಿರ ೪ ನೂರು ವರ್ಷಗಳು. ವಿಕ್ರಮಶಕ ವರ್ಷ ೧೩೫ ವರ್ಷಗಳು. ಶಾಲಿವಾಹನ ಶಕವು ೧೮ ಸಾವಿರ ವರ್ಷಗಳು. ವಿಜಯಾಭಿನಂದನ ಶಕವು ೧೦ ಸಾವಿರ ವರ್ಷಗಳು. ನಾಗಾರ್ಜುನ ಶಕವು ೪ ಲಕ್ಷ ವರ್ಷಗಳು. ಕಲಿಯುಗದ ಅಂತ್ಯ ಕಾಲಕ್ಕೆ ಕಾವೇರಿತೀರದಲ್ಲಿ ಕಲ್ಕಿ ಅವತಾರವು ೮೨೧ ವರ್ಷಗಳು. ಶ್ವಾನಗತ ಪ್ರಾಣವು ಅಂದರೆ ಶ್ವಾನ ನಿಂತರ ಪ್ರಾಣವು ಇಲ್ಲ ಎಂದರ್ಥ. ಪ್ರಸ್ತುತ ಶಾಲಿವಾಹನ ಭೂಪತಿಯ ಶಕದ ಶಕವರ್ಷಗಳು ೧೯೪೬. ಉಳಿದ ಶಕವರ್ಷಗಳು ೧೬ ಸಾವಿರ ೫೪ ವರ್ಷ ಇದೆ. ಕಲಿಯುಗ ಪ್ರಾರಂಭವಾಗಿ ೫೧೨೪ ವರ್ಷ ಕಳೆದಿದೆ. ೪ ಲಕ್ಷ ೨೬ ಸಾವಿರ ೮೭೬ ವರ್ಷಗಳು ಉಳಿದಿವೆ. ಕಲ್ಪಾದಿಯ ಅಹರ್ಗಣವು ೧೮ ಲಕ್ಷ ೨೨ ಸಾವಿರ ೦೪೭ ಇದೆ.
            </p>
          </div>

          {/* Table 1: ರಾಜಾದಿ ನವಾಧಿಪತಿಗಳು */}
          <div className="border-b-[1.5px] border-black flex flex-col bg-white">
            <div className="text-center font-bold text-[13px] py-1 border-b-[1.5px] border-black tracking-wide bg-white">
              ಪ್ಲವಂಗ ಸಂವತ್ಸರದ ರಾಜಾದಿ ನವಾಧಿಪತಿಗಳು
            </div>
            <table className="w-full border-collapse text-center text-[11.5px]">
              <thead>
                <tr className="border-b border-black">
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[12.5%]">ರಾಜ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[12.5%]">ಮಂತ್ರಿ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[12.5%]">ಸೈನ್ಯಾಧಿಪ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[12.5%]">ಸಸ್ಯ-ಧಾನ್ಯ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[12.5%]">ಅರ್ಘ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[12.5%]">ಮೇಘ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[12.5%]">ರಸ</th>
                  <th className="py-1 px-0.5 font-bold w-[12.5%]">ನೀರಸ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಬುಧ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಬುಧ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಕುಜ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಶುಕ್ರ-ಗುರು</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಕುಜ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಕುಜ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ರವಿ</td>
                  <td className="py-2 px-0.5 font-medium">ಶುಕ್ರ</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table 2: ಉಪ ನವಾಧಿಪತಿಗಳು */}
          <div className="border-b-[1.5px] border-black flex flex-col bg-white">
            <div className="text-center font-bold text-[13px] py-1 border-b-[1.5px] border-black tracking-wide bg-white">
              ಉಪ ನವಾಧಿಪತಿಗಳು
            </div>
            <table className="w-full border-collapse text-center text-[11.5px]">
              <thead>
                <tr className="border-b border-black">
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[16.66%]">ಲೇಖಕ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[16.66%]">ದಂಡಪ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[16.66%]">ರಾತ್ರಿಚರ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[16.66%]">ಸ್ವರ್ಣಪ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[16.66%]">ಗ್ರಾಮಾಧಿಪ</th>
                  <th className="py-1 px-0.5 font-bold w-[16.66%]">ಮಾರ್ಗಾಧ್ಯ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಶನಿ-ಶುಕ್ರ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಕುಜ-ಚಂದ್ರ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಕುಜ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಕುಜ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ರವಿ-ಶುಕ್ರ</td>
                  <td className="py-2 px-0.5 font-medium">ಶನಿ</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table 3: ತ್ರಯೋದಶಾಧಿಪತಿಗಳು */}
          <div className="flex flex-col bg-white flex-1 justify-between">
            <div className="text-center font-bold text-[13px] py-1 border-b-[1.5px] border-black tracking-wide bg-white">
              ತ್ರಯೋದಶಾಧಿಪತಿಗಳು
            </div>
            <table className="w-full border-collapse text-center text-[11.5px] flex-1">
              <thead>
                <tr className="border-b border-black">
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[14.28%]">ಆಶ್ವ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[14.28%]">ಗಜ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[14.28%]">ಪಶು</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[14.28%]">ದೇವ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[14.28%]">ನರ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold w-[14.28%]">ದ್ರವ್ಯ</th>
                  <th className="py-1 px-0.5 font-bold w-[14.28%]">ವಸ್ತ್ರ</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black">
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಕುಜ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಬುಧ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಶನಿ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಶುಕ್ರ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಶುಕ್ರ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಕುಜ</td>
                  <td className="py-2 px-0.5 font-medium">ರವಿ</td>
                </tr>
              </tbody>
              <thead>
                <tr className="border-b border-black">
                  <th className="border-r border-black py-1 px-0.5 font-bold">ರತ್ನ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold">ಸ್ತ್ರೀ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold">ಸರ್ಪ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold">ವೃಕ್ಷ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold">ಮೃಗ</th>
                  <th className="border-r border-black py-1 px-0.5 font-bold">ಮಾಂಗಲ್ಯ</th>
                  <th className="py-1 px-0.5 font-bold"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಕುಜ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಕುಜ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಗುರು</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಕುಜ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ಶುಕ್ರ</td>
                  <td className="border-r border-black py-2 px-0.5 font-medium">ರವಿ</td>
                  <td className="py-2 px-0.5"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: ॥ ಅಥ ಸಂವತ್ಸರ ಫಲಂ ॥ (SHLOKAS & DETAILED PHALAS) */}
        <div className="flex flex-col h-full bg-white">
          {/* Header Banner */}
          <div className="bg-black text-white text-center py-1 font-bold text-[14.5px] tracking-widest border-b-[1.5px] border-black">
            ॥ ಅಥ ಸಂವತ್ಸರ ಫಲಂ ॥
          </div>

          {/* Shlokas + Phala List */}
          <div className="flex-1 px-3 py-1.5 flex flex-col justify-between text-black">
            {/* 1. Main Samvatsara Shloka */}
            <div>
              <div className="text-center font-bold text-[10.5px] leading-tight">
                <div>ಪ್ಲವಂಗಾಖ್ಯೇ ಮಧ್ಯವೃಷ್ಟಿಃ ರೋಗೀ ಚೋರೈಶ್ಚ ಕರ್ಷಿತಾಃ|</div>
                <div>ಅನ್ಯೋನ್ಯಂ ಸಮರೇ ಘೋರಃ ಶತ್ರುನಿರ್ಘಾತ ಭೂಪಯಃ॥</div>
              </div>
              <p className="text-[10px] leading-[1.35] text-justify font-serif mt-0.5">
                ಪ್ಲವಂಗನಾಮ ಸಂವತ್ಸರದಲ್ಲಿ ಭೂಮಂಡಲದಲ್ಲೆಲ್ಲ ರೋಗಗಳ ಹಾವಳಿಯು, ಕಳ್ಳರ ಉಪದ್ರವ ಹೆಚ್ಚುವುದು. ಸಾಧಾರಣ ಮಳೆಯಾಗುವುದು. ಮಂತ್ರಿಗಳು ಯುದ್ಧಾಸಕ್ತರಾಗುವುದಲ್ಲದೇ ಶತ್ರುಗಳು ನಾಶವಾಗುವರು.
              </p>
            </div>

            {/* 2. ಗುರುಚಾರಫಲಂ */}
            <div>
              <div className="grid grid-cols-[90px_1fr] items-center">
                <span className="font-bold text-[10.5px] whitespace-nowrap">ಗುರುಚಾರಫಲಂ:</span>
                <div className="text-center font-bold text-[10.5px] leading-tight">
                  <div>ಪ್ರಭೂತ ಶಾಲಿಗೋಧೂಮಃ ಸುಜನಾಃ ಸುಖಿನಃ ಸ್ತ್ರೀಯಃ॥</div>
                  <div>ಮೋದಾರ್ಥಾ ಕರ್ಕಟಸ್ಥೇಚ್ಛೇ ಸಸ್ಯವೃದ್ಧಿ ಯುತಾಧರಾ॥</div>
                </div>
              </div>
              <p className="text-[10px] leading-[1.35] text-justify font-serif mt-0.5">
                ಗುರುವು ಕರ್ಕರಾಶಿಯಲ್ಲಿ ಇರುವುದರಿಂದ ಆಕಳು ಹೇರಳವಾಗಿ ಹಾಲನ್ನು ನೀಡುವುದು. ಸುಜನರು, ಸ್ತ್ರೀಯರು ಸುಖಿಗಳಾಗುವರು. ಧರೆಯು ಸಸ್ಯಸಮೃದ್ಧಿಯನ್ನು ಹೊಂದುವುದು.
              </p>
            </div>

            {/* 3. ಶನಿಚಾರಫಲಂ */}
            <div>
              <div className="grid grid-cols-[90px_1fr] items-center">
                <span className="font-bold text-[10.5px] whitespace-nowrap">ಶನಿಚಾರಫಲಂ:</span>
                <div className="text-center font-bold text-[10.5px] leading-tight">
                  <div>ಅರ್ಕಪುತ್ರೋ ಯದಾ ಮೀನೇ ದುರ್ಭಿಕ್ಷಂ ತತ್ರ ಗೌರವಂ|</div>
                  <div>ಸಾಗರಾಃ ಸರ್ವನದ್ಯಶ್ಚ ವಿನಶ್ಯಂತಿ ಚತುಷ್ಪದಾಃ॥</div>
                </div>
              </div>
              <p className="text-[10px] leading-[1.35] text-justify font-serif mt-0.5">
                ಶನಿಯು ಮೀನರಾಶಿಗೆ ಬಂದರೆ ದಾರುಣ ದುರ್ಭಿಕ್ಷವು.ಎಲ್ಲಾ ಹೊಳೆ,ಹಳ್ಳಗಳು ಮಳೆ ಇಲ್ಲದೇ ಬತ್ತಿ ಹೋಗುವವು. ಪಶುಗಳು ನಾಶವಾಗುವವು.
              </p>
            </div>

            {/* 4. ರಾಜಾ ಬುಧಃ */}
            <div>
              <div className="grid grid-cols-[90px_1fr] items-center">
                <span className="font-bold text-[10.5px] whitespace-nowrap">ರಾಜಾ ಬುಧಃ:</span>
                <div className="text-center font-bold text-[10.5px] leading-tight">
                  <div>ಬುಧಸ್ಯ ರಾಜ್ಯೇ ಸಕಲಂ ಮಹೀತಲಂ ಗೃಹೇ ಗೃಹೇ ಶಾಂತಿಕ ವಿವಾಹ ಮಂಗಳಂ|</div>
                  <div>ಪ್ರವರ್ತತೇ ದಾನದಯಾಂ ಜನಾನಾಂ ನೃಪಾಂ ಸುಭಿಕ್ಷಂ ಧನಧಾನ್ಯ ಸಂಕುಲಂ॥</div>
                </div>
              </div>
              <p className="text-[10px] leading-[1.35] text-justify font-serif mt-0.5">
                ಬುಧನು ರಾಜನಾಗಿರುವುದರಿಂದ ಭೂಮಿಯು ಉತ್ತಮ ಮಳೆಬೆಳೆಗಳಿಂದ ಯುಕ್ತವಾಗಿದ್ದು ಜನರು ವಿವಾಹೋತ್ಸವ ಯಜ್ಞಾದಿ ಧರ್ಮಕಾರ್ಯಗಳಲ್ಲಿ ನಿರತರಾಗಿ ಲೋಕವು ಸುಭಿಕ್ಷವಾಗುವುದು.
              </p>
            </div>

            {/* 5. ಮಂತ್ರಿ ಬುಧಃ */}
            <div>
              <div className="grid grid-cols-[90px_1fr] items-center">
                <span className="font-bold text-[10.5px] whitespace-nowrap">ಮಂತ್ರಿ ಬುಧಃ:</span>
                <div className="text-center font-bold text-[10.5px] leading-tight">
                  <div>ದ್ವೈಜೇಶ್ಯ ವೃದ್ಧಿರ್ಧನಕೀರ್ತಿರಾಂ ಗವಾಃ ಸಮುಗ್ಧಾ ನೃಪತೋ ಜನಾನ್ತಾಂ॥</div>
                  <div>ಗೋಧೂಮ ಶಾಲೇಸ್ತು ಯುತಾ ಧರಿತ್ರೀ ಪೂರ್ಣೋದಕಾದ್ಯೈಃಭಿಷಜೋಸ್ತು ಮಂತ್ರಿ॥</div>
                </div>
              </div>
              <p className="text-[10px] leading-[1.35] text-justify font-serif mt-0.5">
                ಬುಧನು ಮಂತ್ರಿಯಾಗಿರುವುದರಿಂದ ಭೂಮಿಯು ಗೋಧಿ ವತ್ತ ಕಬ್ಬು ಇವುಗಳಿಂದ ಕೂಡಿ ಧಾರಾಳ ನೀರುಸುರಿದು ಗೋವುಗಳು ಧಾರಾಳ ಹಾಲುಗರೆದು, ಜನರು ರೋಗವಿಲ್ಲದವರಾಗುವರಾಗಿ, ರಾಜರ ಖಜಾನೆಯು ವೃದ್ಧಿಹೊಂದುವುದು.
              </p>
            </div>

            {/* 6. ಸೈನ್ಯಾಧಿಪ ಕುಜಃ */}
            <div>
              <div className="grid grid-cols-[90px_1fr] items-center">
                <span className="font-bold text-[10.5px] whitespace-nowrap">ಸೈನ್ಯಾಧಿಪ ಕುಜಃ:</span>
                <div className="text-center font-bold text-[10.5px] leading-tight">
                  <div>ಅಧರ್ಮನಿರತಾ ಭೂಪಾಸ್ತಥಾ ಕ್ಷುದ್ರ ಜನಾಕುಲಂ|</div>
                  <div>ಚೋರಾಗ್ನಿ ಶಸ್ತ್ರ ಬಾಧಾಶ್ಚ್ಯಃ ಸೈನ್ಯಪೇ ಮೇದಿನೀಪತೇ|</div>
                </div>
              </div>
              <p className="text-[10px] leading-[1.35] text-justify font-serif mt-0.5">
                ಸೇನಾಧಿಪತಿಯು ಕುಜನಾದ್ದರಿಂದ ಮಂತ್ರಿಗಳು ಅಧರ್ಮ ನಿರತರಾಗಿ ಲೋಕವು ಕ್ಷುದ್ರ ಜನರಿಂದಲೂ, ಕಳ್ಳರಿಂದಲೂ ಬೆಂಕಿಯಿಂದಲೂ, ಶಸ್ತ್ರಗಳಿಂದಲೂ ಬಾಧಿಸಲ್ಪಡುವುದು.
              </p>
            </div>

            {/* 7. ಸಸ್ಯಾಧಿಪ ಶುಕ್ರಃ */}
            <div>
              <div className="grid grid-cols-[90px_1fr] items-center">
                <span className="font-bold text-[10.5px] whitespace-nowrap">ಸಸ್ಯಾಧಿಪ ಶುಕ್ರಃ:</span>
                <div className="text-center font-bold text-[10.5px] leading-tight">
                  <div>ರೋಗೈರ್ಮುಕ್ತಾ ನಿರ್ಭಯಾಃ ಸರ್ವಲೋಕಾಃ ಪ್ರತ್ಯುಕ್ತೇ ವಾ ಸರ್ವಧಾನ್ಯಾನಿ ನೂನಂ|</div>
                  <div>ವೃಕ್ಷಾಃ ಶಸ್ತ್ರಪ್ರಸ್ಥಿತಾ ಭೂರಿ ವೃಕ್ಷಿಃ ಸಸ್ಯಾಧೀಶೋ ಯತ್ರ ದೈತ್ಯೇಂದ್ರ ಮಂತ್ರಿಃ॥</div>
                </div>
              </div>
              <p className="text-[10px] leading-[1.35] text-justify font-serif mt-0.5">
                ಶುಕ್ರನು ಸಸ್ಯಾಧಿಪತಿಯಾದ್ದರಿಂದ ಧಾರಾಳ ಮಳೆಯಿಂದ ಎಲ್ಲ ವಿಧದ ಧಾನ್ಯಗಳೂ ಸಮೃದ್ಧಿಯಾಗಿ ಬೆಳೆಯುವವು. ಮರಗಳು ಪುಷ್ಪಗಳಿಂದ ಕಂಗೊಳಿಸುವವು. ಪ್ರಜೆಗಳು ರೋಗಗಳಿಂದ ಮುಕ್ತರೂ ಭಯರಹಿತರೂ ಆಗುವರು.
              </p>
            </div>

            {/* 8. ಧಾನ್ಯಾಧಿಪ Guruಃ */}
            <div>
              <div className="grid grid-cols-[90px_1fr] items-center">
                <span className="font-bold text-[10.5px] whitespace-nowrap">ಧಾನ್ಯಾಧಿಪ ಗುರುಃ:</span>
                <div className="text-center font-bold text-[10.5px] leading-tight">
                  <div>ಸರ್ವಸಸ್ಯ ಸಮೃದ್ಧಿತಂ ಪ್ರಜಾನಾಂ ಸರ್ವಸಂಪದಾ ಭವಂತಿಃ|</div>
                  <div>ಗಾವಃ ಸುದುಘಾಃ ಗುರೌ ಧಾನ್ಯಾಧೀಶೇ ಸತಿ|</div>
                </div>
              </div>
              <p className="text-[10px] leading-[1.35] text-justify font-serif mt-0.5">
                ಗುರುವು ಧಾನ್ಯಾಧಿಪತಿಯಾದ್ದರಿಂದ ಗೋವುಗಳು, ಎಮ್ಮೆಗಳು ಧಾರಾಳ ಹಾಲುಳ್ಳವುಗಳಾಗಿ, ಬ್ರಾಹ್ಮಣರು ಯಜ್ಞಕರ್ಮ ನಿರತರಾಗಿ, ದೇವೇಂದ್ರನು ಹೆಚ್ಚು ಮಳೆಯನ್ನು ಸುರಿಸುವನು. ಲೋಕವು ಸುಭಿಕ್ಷವಾಗುವುದು.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 13: ARIDRA PRAVESHA RAINFALL FORECAST */
export const Page13AridraPraveshaRainfall: React.FC<PageTemplateProps> = ({ meta }) => {
  const nakshatraRain = [
    { n: "ಮೃಗಶಿರಾ", d: "೦೮-೦೬-೨೦೨೬", v: "ನರಿ", f: "ಅಲ್ಪವೃಷ್ಟಿ (ಆರಂಭಿಕ ಜಿಟಿಜಿಟಿ)" },
    { n: "ಆರಿದ್ರಾ", d: "೨೨-೦೬-೨೦೨೬", v: "ಕತ್ತೆ", f: "ಉತ್ತಮ ಮುಂಗಾರು ಮಳೆ, ಬಿತ್ತನೆಗೆ ಶುಭ" },
    { n: "ಪುನರ್ವಸು", d: "೦೬-೦೭-೨೦೨೬", v: "ಹಂಸ", f: "ಸಾರ್ವತ್ರಿಕ ಸುಖವೃಷ್ಟಿ, ಕೆರೆ-ತೊರೆ ಭರ್ತಿ" },
    { n: "ಪುಷ್ಯಾ", d: "೨೦-೦೭-೨೦೨೬", v: "ಗಜ", f: "ಭಾರಿ ಮಳೆ, ನದಿಗಳಲ್ಲಿ ಪ್ರವಾಹ ಲಕ್ಷಣ" },
    { n: "ಆಶ್ಲೇಷಾ", d: "೦೩-೦೮-೨೦೨೬", v: "ಕಾಗೆ", f: "ಬಿರುಗಾಳಿ ಸಹಿತ ಭಾರಿ ಮಳೆ, ಶೀತಗಾಳಿ" },
    { n: "ಮಘಾ", d: "೧೭-೦೮-೨೦೨೬", v: "ನವಿಲು", f: "ಮಳೆ ಸಾಧಾರಣ, ಪೈರು ಹಚ್ಚಹಸಿರು" },
    { n: "ಪುಬ್ಬಾ", d: "೩೧-೦೮-೨೦೨೬", v: "ಮೂಷಕ", f: "ಉತ್ತಮ ಇಳುವರಿ, ಬೆಳೆಗೆ ಹಿತಕರ ವೃಷ್ಟಿ" },
    { n: "ಉತ್ತರಾ", d: "೧೩-೦೯-೨೦೨೬", v: "ಅಶ್ವ", f: "ಸಾಧಾರಣ ಮಳೆ, ಕದಿರು ಮೂಡುವ ಕಾಲ" },
    { n: "ಹಸ್ತಾ", d: "೨೭-೦೯-೨೦೨೬", v: "ವೃಷಭ", f: "ಸಮೃದ್ಧ ಬೆಳೆ, ಸೂರ್ಯಪ್ರಕಾಶ ಲಭ್ಯ" },
    { n: "ಚಿತ್ತಾ", d: "೧೧-೧೦-೨೦೨೬", v: "ನರಿ", f: "ಅಕಾಲಿಕ ಜಡಿಮಳೆ, ಹಿಂಗಾರು ಆರಂಭ" },
    { n: "ಸ್ವಾತಿ", d: "೨೪-೧೦-೨೦೨೬", v: "ಕತ್ತೆ", f: "ಹಿಂಗಾರು ಚುರುಕು, ಸಂಜೆ ವೇಳೆಗೆ ವೃಷ್ಟಿ" },
    { n: "ವಿಶಾಖಾ", d: "೦೭-೧೧-೨೦೨೬", v: "ನವಿಲು", f: "ಬೆಳೆ ಕಟಾವಿಗೆ ಶುಭ, ಹಿತಕರ ಹವಾಮಾನ" },
    { n: "ಅನೂರಾಧಾ", d: "೨೦-೧೧-೨೦೨೬", v: "ಗಜ", f: "ಶೀತ ಮಾರುತ, ರಾತ್ರಿ ಮಂಜು" },
    { n: "ಜ್ಯೇಷ್ಠಾ", d: "೦೩-೧೨-೨೦೨೬", v: "ಹಂಸ", f: "ಮಂಜುಮುಸುಕಿದ ವಾತಾವರಣ, ಚಳಿ ತೀವ್ರ" }
  ];

  return (
    <BaggonaLandscapeFrame pageNumber={13}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಅಥ ಆರಿದ್ರಾ ಪ್ರವೇಶ ಕಾಲಫಲಂ & ನಕ್ಷತ್ರವಾರು ಮಳೆ ಮುನ್ಸೂಚನೆ
        </div>

        <div className="flex-1 border border-black p-2 font-serif flex flex-col justify-between text-[10px]">
          {/* Astronomical Moment & Aadhaka Allocation */}
          <div className="border border-black p-1.5 bg-slate-50 text-[9.5px] leading-relaxed mb-1.5">
            <span className="font-bold">ಪ್ರವೇಶ ಕಾಲ ಗಣಿತ:</span> ನಿಜ ಜ್ಯೇಷ್ಠ ಮಾಸ, ಶುಕ್ಲ ಪಕ್ಷ, ಗ್ರೀಷ್ಮ ಋತು, ಅಷ್ಟಮೀ ತಿಥಿ, ಚಂದ್ರವಾರ, ಹಸ್ತಾನಕ್ಷತ್ರ, ವರಿಯಾನ್ ಯೋಗ, ಬವಕರಣ, ಕನ್ಯಾರಾಶಿ, ಕನ್ಯಾಲಗ್ನದಲ್ಲಿ ದಿನಾಂಕ 22/6/2026 ಘಟಿ 15/50 ಹಗಲು ಘಂಟೆ 12-25ಕ್ಕೆ ರವಿಯು ಆರಿದ್ರಾ ನಕ್ಷತ್ರವನ್ನು ಪ್ರವೇಶಿಸುತ್ತಾನೆ.
            <div className="mt-1 flex justify-between font-bold border-t border-black/40 pt-1 text-[10px]">
              <span>ಆಢಕ ಒಟ್ಟು ಪ್ರಮಾಣ: ೩</span>
              <span>ಸಮುದ್ರ ಭಾಗ: ೧೦</span>
              <span>ಪರ್ವತ ಭಾಗ: ೬</span>
              <span>ಭೂಮಿ ಭಾಗ: ೪ (ಸುಭಿಕ್ಷ ವೃಷ್ಟಿ)</span>
            </div>
          </div>

          {/* 14 Nakshatras Table */}
          <div className="border border-black flex-1 overflow-hidden">
            <table className="w-full text-[9px] border-collapse text-center h-full">
              <thead>
                <tr className="bg-black text-white font-black text-[9.5px]">
                  <th className="p-1 border-r border-white/40">ರವಿನಕ್ಷತ್ರ</th>
                  <th className="p-1 border-r border-white/40">ಪ್ರವೇಶ ದಿನಾಂಕ</th>
                  <th className="p-1 border-r border-white/40">ವಾಹನ</th>
                  <th className="p-1 text-left px-2">ವೃಷ್ಟಿ ಲಕ್ಷಣ & ಕೃಷಿ ಫಲ</th>
                </tr>
              </thead>
              <tbody>
                {nakshatraRain.map((r, i) => (
                  <tr key={r.n} className={`border-b border-black/30 ${i % 2 === 1 ? "bg-slate-50" : ""}`}>
                    <td className="border-r border-black p-0.5 font-bold">{r.n}</td>
                    <td className="border-r border-black p-0.5 font-mono">{r.d}</td>
                    <td className="border-r border-black p-0.5 font-bold">{r.v}</td>
                    <td className="p-0.5 text-left px-2">{r.f}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-black pt-1 mt-1 text-[9px] text-center font-sans font-bold text-slate-700">
            ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೧೩
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 14: SANKRAMANA, MAUDHYA & ECLIPSES */
export const Page14SankramanaMaudhyaEclipses: React.FC<PageTemplateProps> = ({ meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={14}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ॥ ಅಥ ಸಂಕ್ರಮಣ ಫಲಂ • ಮೌಢ್ಯ ಕಾಲ ವಿವರ • ಸೂರ್ಯ-ಚಂದ್ರ ಗ್ರಹಣ ವಿಚಾರ ॥
        </div>

        <div className="flex-1 border border-black p-2 font-serif flex flex-col justify-between text-[10px] leading-snug">
          {/* Section 1: Mesha Sankramana Purusha */}
          <div className="border border-black p-1.5 bg-slate-50 mb-1.5">
            <div className="font-black text-[11px] border-b border-black pb-0.5 mb-1 flex justify-between">
              <span>ಮೇಷ ಸಂಕ್ರಮಣ ಕಾಲಪುರುಷ ಲಕ್ಷಣ</span>
              <span className="font-mono text-[10px]">ಚೈತ್ರ ಕೃಷ್ಣ ೧೨, ಕುಜವಾಸರ, ಶತಭಿಷಾ ನಕ್ಷತ್ರ, ಕುಂಭರಾಶಿ</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-[9.5px]">
              <div><span className="font-bold">ಪುರುಷ ನಾಮ:</span> ಪಾರ್ಥಿವ</div>
              <div><span className="font-bold">ವಾಹನ:</span> ಅಶ್ವ (ಕುದುರೆ)</div>
              <div><span className="font-bold">ಆಯುಧ:</span> ಗದಾ</div>
              <div><span className="font-bold">ವಸ್ತ್ರ:</span> ರಕ್ತವಸ್ತ್ರ (ಕೆಂಪು)</div>
              <div><span className="font-bold">ಭೋಜನ:</span> ಕ್ಷೀರ (ಹಾಲು)</div>
              <div><span className="font-bold">ದೃಷ್ಟಿ:</span> ಈಶಾನ್ಯ</div>
              <div><span className="font-bold">ಗಮನ:</span> ದಕ್ಷಿಣ ದಿಕ್ಕು</div>
              <div><span className="font-bold">ಫಲ:</span> ಗೋಸಂಪತ್ತು ವೃದ್ಧಿ, ಸುಭಿಕ್ಷ</div>
            </div>
          </div>

          {/* Section 2: Guru & Shukra Maudhya */}
          <div className="border border-black p-1.5 bg-white mb-1.5">
            <div className="font-black text-[11px] border-b border-black pb-0.5 mb-1">
              ಗುರು ಮತ್ತು ಶುಕ್ರ ಗ್ರಹಗಳ ಮೌಢ್ಯ ಕಾಲ ವಿವರ (Maudhya Periods)
            </div>
            <div className="grid grid-cols-2 gap-3 text-[9.5px]">
              <div className="border-r border-black/30 pr-2">
                <span className="font-bold">ಗುರು ಮೌಢ್ಯ:</span> ವೈಶಾಖ ಶುಕ್ಲ ದ್ವಾದಶೀ (ಪ್ರಾಚೀ ಅಸ್ತ) ದಿಂದ ಜ್ಯೇಷ್ಠ ಕೃಷ್ಣ ಪಾಡ್ಯದವರೆಗೆ (ಪ್ರಾಚೀ ಉದಯ).<br />
                <span className="text-slate-600 text-[9px]">ಈ ಕಾಲದಲ್ಲಿ ಗೃಹಪ್ರವೇಶ, ವಿವಾಹಾದಿ ಮಹಾಕಾರ್ಯಗಳನ್ನು ತ್ಯಜಿಸಬೇಕು.</span>
              </div>
              <div>
                <span className="font-bold">ಶುಕ್ರ ಮೌಢ್ಯ:</span> ಕಾರ್ತಿಕ ಕೃಷ್ಣ ತೃತೀಯಾ (ಪ್ರತೀಚೀ ಅಸ್ತ) ದಿಂದ ಮಾರ್ಗಶಿರ ಶುಕ್ಲ ನವಮಿಯವರೆಗೆ (ಪ್ರತೀಚೀ ಉದಯ).<br />
                <span className="text-slate-600 text-[9px]">ಉಪನಯನ, ದೇವತಾ ಪ್ರತಿಷ್ಠೆ, ವಾಕ್ದಾನಗಳನ್ನು ಈ ಅವಧಿಯಲ್ಲಿ ಮಾಡಬಾರದು.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Solar & Lunar Eclipses */}
          <div className="border border-black p-1.5 bg-slate-50 flex-1">
            <div className="font-black text-[11px] border-b border-black pb-0.5 mb-1 flex justify-between">
              <span>ಈ ಸಂವತ್ಸರದಲ್ಲಿ ಸಂಭವಿಸುವ ಗ್ರಹಣಗಳು (Surya & Chandra Grahana)</span>
              <span className="text-[9px] font-sans font-bold text-red-700">ಧಾರ್ಮಿಕ ನಿಯಮಗಳು</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[9.5px]">
              <div>
                <div className="font-bold text-[10px]">೧. ಖಂಡಗ್ರಾಸ ಸೂರ್ಯ ಗ್ರಹಣ</div>
                <p className="text-[9px] leading-relaxed">
                  ದಿನಾಂಕ: ೧೭-೦೮-೨೦೨೬, ಭಾದ್ರಪದ ಅಮಾವಾಸ್ಯಾ. ಸ್ಪರ್ಶ: ಅಪರಾಹ್ನ ೧-೧೫, ಮಧ್ಯ: ೨-೪೦, ಮೋಕ್ಷ: ಸಂಜೆ ೪-೧೦.<br />
                  ಅಶುಭ ರಾಶಿಗಳು: ಸಿಂಹ, ಕನ್ಯಾ, ತುಲಾ. ಗ್ರಹಣಾರಂಭಕ್ಕೆ ೧೨ ಗಂಟೆ ಮುಂಚಿತವಾಗಿ ಭೋಜನ ನಿಷೇಧ.
                </p>
              </div>
              <div className="border-l border-black/30 pl-2">
                <div className="font-bold text-[10px]">೨. ಗ್ರಸ್ತೋದಯ ಚಂದ್ರ ಗ್ರಹಣ</div>
                <p className="text-[9px] leading-relaxed">
                  ದಿನಾಂಕ: ೧೩-೦೩-೨೦೨೭, ಫಾಲ್ಗುಣ ಹುಣ್ಣಿಮೆ. ಸ್ಪರ್ಶ: ಸಂಜೆ ೬-೨೦ (ಗ್ರಸ್ತೋದಯ), ಮಧ್ಯ: ೭-೧೦, ಮೋಕ್ಷ: ರಾತ್ರಿ ೮-೨೫.<br />
                  ಅಶುಭ ರಾಶಿಗಳು: ಕುಂಭ, ಮೀನ, ಮೇಷ. ಗ್ರಹಣ ಮುಕ್ತಾಯದ ನಂತರ ಸ್ನಾನ, ದಾನ, ಜಪ-ತರ್ಪಣಾದಿಗಳನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ಮಾಡುವುದು.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-1 mt-1 text-[9px] text-center font-sans font-bold text-slate-700">
            ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೧೪
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 15: HARIDASA DISCOURSES & BHARATHA BOOK DEPOT */
export const Page15HaridasaAndBharathaBookDepot: React.FC<PageTemplateProps> = ({ meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={15}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="flex-1 flex flex-col justify-between border border-black p-2 font-serif">
          {/* Top Half: Haridasa Vidwan Narayana Dasa */}
          <div className="border border-black p-3 bg-white text-center flex-1 flex flex-col justify-between mb-2">
            <div className="text-[11px] font-bold text-slate-600">॥ ಶ್ರೀಹರಿಃ ಶರಣಂ ॥ (ಸಂತ ಭದ್ರಗಿರಿ ಅಚ್ಯುತದಾಸರ ಶಿಷ್ಯ)</div>
            <div className="text-[17px] font-black tracking-wide my-1">
              ಹರಿದಾಸಕಲಾರತ್ನ, ಕೀರ್ತನಚತುರ, ಹವ್ಯಕ ಭೂಷಣ<br />
              <span className="text-[20px] text-black">ಶ್ರೀ ನಾರಾಯಣದಾಸರು, ಸಿರಸಿ</span>
            </div>
            <p className="text-[10.5px] max-w-2xl mx-auto leading-relaxed">
              ಹಬ್ಬಹರಿದಿನಗಳಲ್ಲಿ ಹಾಗೂ ಶುಭ ಸಮಾರಂಭಗಳಲ್ಲಿ ಭಕ್ತಿಪೂರ್ಣ ಸತ್ಸಂಗ, ಹರಿಕಥೆ, ೧೦೦೮ ಸುಂದರಕಾಂಡ ಪಾರಾಯಣ, ಶ್ರೀಮದ್ರಾಮಾಯಣ, ಶ್ರೀಮದ್ಭಾಗವತ, ಮಹಾಭಾರತ ಪ್ರವಚನ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಅತ್ಯಂತ ಶ್ರದ್ಧೆಯಿಂದ ನೆರವೇರಿಸಿಕೊಡಲಾಗುವುದು.
            </p>
            <div className="border-t border-black/40 pt-1 text-[10px] font-sans font-bold">
              ವಿಳಾಸ: ಪೋ. ಹೀಪನಹಳ್ಳಿ (ಸಂಕದಮನೆ), ತಾಲ್ಲೂಕು: ಸಿರಸಿ (ಉ.ಕ.) - 581403 | ಮೊಬೈಲ್: 9448624137 / 08384-279420
            </div>
          </div>

          {/* Bottom Half: Bharatha Book Depot */}
          <div className="border border-black p-3 bg-slate-50 text-center flex-1 flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-700">॥ ಜ್ಞಾನಂ ಪರಮಂ ಧನಂ ॥ ಸ್ಥಾಪನೆ: ೧೯೮೦</div>
            <div className="text-[22px] font-black tracking-wider text-black my-1">
              ಭಾರತ ಬುಕ್ ಡಿಪೋ
            </div>
            <div className="text-[12px] font-bold">ನ್ಯಾಯಾಲಯ ರಸ್ತೆ (Court Road), ಸಿರಸಿ (ಉ.ಕ.)</div>
            <p className="text-[10px] max-w-xl mx-auto leading-relaxed">
              ಶಾಲಾ-ಕಾಲೇಜುಗಳ ಸಮಸ್ತ ಪಠ್ಯಪುಸ್ತಕಗಳು, ನೋಟ್‌ಬುಕ್‌ಗಳು, ಸ್ಟೇಷನರಿ, ಧಾರ್ಮಿಕ ಪೂಜಾ ಗ್ರಂಥಗಳು, ಸ್ತೋತ್ರಮಾಲೆಗಳು ಹಾಗೂ <span className="font-bold">ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಅಧಿಕೃತ ಮಾರಾಟ ಕೇಂದ್ರ</span>. ಸಗಟು ಮತ್ತು ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಸ್ಥರು.
            </p>
            <div className="border-t border-black/40 pt-1 text-[10px] font-sans font-bold text-slate-800">
              ಗ್ರಾಹಕರ ವಿಶ್ವಾಸವೇ ನಮ್ಮ ಸಂಸ್ಥೆಯ ಯಶಸ್ಸಿನ ಮೂಲ | ದೂರವಾಣಿ: 08384-226543
            </div>
          </div>

          <div className="pt-1 text-[9px] text-center font-sans font-bold text-slate-700">
            ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೧೫
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 16: HERITAGE SPONSOR ADVERTISEMENT */
export const Page16HeritageSponsorAd: React.FC<PageTemplateProps> = ({ meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={16}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="flex-1 border-2 border-black p-4 font-serif flex flex-col justify-between text-center bg-white">
          <div className="border-b-2 border-black pb-2">
            <div className="text-[12px] font-bold">॥ ಶ್ರೀ ಗುರುಭ್ಯೋ ನಮಃ ॥ ಶ್ರೀ ಕುಲದೇವತಾ ಪ್ರಸನ್ನ ॥</div>
            <div className="text-[24px] font-black tracking-wider text-black mt-1">
              ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಜ್ಯೋತಿಷ್ಯಾಲಯ & ವಾಸ್ತು ಸಂಶೋಧನಾ ಕೇಂದ್ರ
            </div>
            <div className="text-[13px] font-bold text-slate-800">
              ಬೆಂಗಳೂರು ಹಾಗೂ ಸಿರಸಿ ಶಾಖೆಗಳು
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-2 text-left text-[11px] leading-relaxed">
            <div className="border border-black p-3 bg-slate-50">
              <div className="font-black text-[12px] border-b border-black pb-1 mb-1.5 text-center">
                ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರೀಯ ಸೇವೆಗಳು
              </div>
              <ul className="space-y-1 list-disc list-inside text-[10px]">
                <li>ಸಮಗ್ರ ಜನ್ಮಕುಂಡಲಿ ರಚನೆ ಹಾಗೂ ದಶಾ-ಭುಕ್ತಿ ಭವಿಷ್ಯ ವಿಶ್ಲೇಷಣೆ</li>
                <li>ವಿವಾಹ ಹೊಂದಾಣಿಕೆ (೩೬ ಗುಣ ಮೇಳಾಪಕ ಹಾಗೂ ಕುಜದೋಷ ಪರಿಹಾರ)</li>
                <li>ಸಂತಾನ ಪ್ರಾಪ್ತಿ, ವಿದ್ಯಾಭ್ಯಾಸ, ಉದ್ಯೋಗ-ವ್ಯಾಪಾರದಲ್ಲಿ ಪ್ರಗತಿ</li>
                <li>ಕಾಲಸರ್ಪ, ನವಗ್ರಹ ದೋಷ ನಿವಾರಣಾ ಹೋಮ-ಶಾಂತಿಗಳು</li>
                <li>ಅಧಿಕೃತ ನವರತ್ನಗಳ ಪರೀಕ್ಷೆ ಹಾಗೂ ಧಾರಣಾ ಸಲಹೆ</li>
              </ul>
            </div>

            <div className="border border-black p-3 bg-slate-50">
              <div className="font-black text-[12px] border-b border-black pb-1 mb-1.5 text-center">
                ವೈದಿಕ ವಾಸ್ತು ಹಾಗೂ ಆಯುರ್ವೇದ ಸಮಾಲೋಚನೆ
              </div>
              <ul className="space-y-1 list-disc list-inside text-[10px]">
                <li>ನೂತನ ನಿವೇಶನ, ಗೃಹ, ವಾಣಿಜ್ಯ ಸಂಕೀರ್ಣಗಳ ವಾಸ್ತು ಪರೀಕ್ಷೆ</li>
                <li>ಕಟ್ಟಡ ಕೆಡವದೆ ವಾಸ್ತುದೋಷ ಶಮನಕ್ಕೆ ಶ್ರೇಷ್ಠ ಪರಿಹಾರೋಪಾಯಗಳು</li>
                <li>ಪಾರಂಪರಿಕ ನೈಸರ್ಗಿಕ ಮೂಲಿಕಾ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಸ್ವಾಸ್ಥ್ಯ ಸಲಹೆಗಳು</li>
                <li>ಪೂರ್ವಜನ್ಮ ಕರ್ಮದೋಷ ಪರಿಹಾರಾರ್ಥ ನವಗ್ರಹ ಜಪ-ಅನುಷ್ಠಾನಗಳು</li>
                <li>ಸಮಸ್ತ ಧಾರ್ಮಿಕ ಪೂಜಾ-ಹವನಾದಿಗಳಿಗೆ ಪರಿಣತ ಋತ್ವಿಜರ ವ್ಯವಸ್ಥೆ</li>
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-black pt-2 bg-slate-100 p-2 text-[10.5px]">
            <div className="font-bold">ಭೇಟಿಯ ಸಮಯ: ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ೯:೦೦ ರಿಂದ ಸಂಜೆ ೭:೦೦ ರವರೆಗೆ (ಮುಂಚಿತ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಪಡೆದು ಭೇಟಿ ನೀಡಿ)</div>
            <div className="text-[12px] font-black text-black mt-1">
              ಸಂಪರ್ಕಿಸಿ: ವಿದ್ವಾನ್ ರಾಮಚಂದ್ರ ಭಟ್ • ಮೊಬೈಲ್: 9845123456 / 9448765432
            </div>
            <div className="text-[9.5px] text-slate-700">ವಿಳಾಸ: ಶ್ರೀ ವೆಂಕಟರಮಣ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನದ ಎದುರು, ಬೆಂಗಳೂರು - 560004</div>
          </div>

          <div className="text-[9px] text-center font-sans font-bold text-slate-700 mt-1">
            ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೧೬
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 17: AUSPICIOUS CONSTELLATIONS & DEITIES */
export const Page17AuspiciousSubhaKaryagalu: React.FC<PageTemplateProps> = ({ meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={17}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಕೆಲವು ಶುಭಕಾರ್ಯಗಳಿಗೆ ಉಪಯುಕ್ತವಾದ ವಿಷಯಗಳು • ನಕ್ಷತ್ರದೇವತೆಗಳು • ಯೋಗದೇವತೆಗಳು
        </div>

        <div className="flex-1 border border-black p-2 font-serif flex flex-col justify-between text-[9.5px] leading-tight">
          {/* Subha Karyagalu Rules */}
          <div className="border border-black p-1.5 bg-slate-50 mb-1.5 leading-relaxed">
            <div><span className="font-bold">ದೇವ ಪ್ರತಿಷ್ಠೆಗೆ:</span> ಅಶ್ವಿನಿ, ರೋಹಿಣಿ, ಮೃಗಶಿರಾ, ಪುನರ್ವಸು, ಪುಷ್ಯಾ, ಉತ್ತರಾ, ಹಸ್ತಾ, ಚಿತ್ತಾ, ಸ್ವಾತಿ, ಅನೂರಾಧಾ, ಉತ್ತರಾಷಾಢಾ, ಶ್ರವಣ, ಧನಿಷ್ಠಾ, ಶತಭಿಷಾ, ಉತ್ತರಾಭಾದ್ರಾ, ರೇವತಿ (ಮಘಾ, ವಿಶಾಖಾ, ಮೂಲಾ ಮಧ್ಯಮ).</div>
            <div className="mt-0.5"><span className="font-bold">ಗೃಹಾರಂಭ & ಪ್ರವೇಶಕ್ಕೆ:</span> ರೋಹಿಣಿ, ಮೃಗಶಿರಾ, ಉತ್ತರಾ, ಹಸ್ತಾ, ಚಿತ್ತಾ, ಅನೂರಾಧಾ, ಉತ್ತರಾಷಾಢಾ, ಉತ್ತರಾಭಾದ್ರಾ, ರೇವತಿ (ಸ್ಥಿರ ಲಗ್ನಗಳಾದ ವೃಷಭ, ಸಿಂಹ, ವೃಶ್ಚಿಕ, ಕುಂಭ ಶ್ರೇಷ್ಠ).</div>
          </div>

          {/* Two Tables: Nakshatra Deities & Yoga Deities */}
          <div className="grid grid-cols-2 gap-2 flex-1 overflow-hidden">
            {/* Nakshatra Deities */}
            <div className="border border-black flex flex-col">
              <div className="bg-black text-white text-center py-0.5 font-black text-[10px]">
                ೨೭ ನಕ್ಷತ್ರಗಳು ಹಾಗೂ ನಕ್ಷತ್ರಾಧಿಪತಿ ದೇವತೆಗಳು
              </div>
              <div className="p-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8.5px] flex-1 overflow-hidden">
                <div>೧. ಅಶ್ವಿನಿ : ಅಶ್ವಿನೀದೇವತೆಗಳು</div>
                <div>೨. ಭರಣಿ : ಯಮಧರ್ಮ</div>
                <div>೩. ಕೃತ್ತಿಕಾ : ಅಗ್ನಿದೇವ</div>
                <div>೪. ರೋಹಿಣಿ : ಪ್ರಜಾಪತಿ (ಬ್ರಹ್ಮ)</div>
                <div>೫. ಮೃಗಶಿರಾ : ಸೋಮ (ಚಂದ್ರ)</div>
                <div>೬. ಆರಿದ್ರಾ : ರುದ್ರದೇವ</div>
                <div>೭. ಪುನರ್ವಸು : ಅದಿತಿ ದೇವತೆ</div>
                <div>೮. ಪುಷ್ಯಾ : ಬೃಹಸ್ಪತಿ (ಗುರು)</div>
                <div>೯. ಆಶ್ಲೇಷಾ : ಸರ್ಪ (ನಾಗದೇವ)</div>
                <div>೧೦. ಮಘಾ : ಪಿತೃದೇವತೆಗಳು</div>
                <div>೧೧. ಪುಬ್ಬಾ : ಭಗ ದೇವತೆ</div>
                <div>೧೨. ಉತ್ತರಾ : ಆರ್ಯಮಾ</div>
                <div>೧೩. ಹಸ್ತಾ : ಸವಿತಾ (ಸೂರ್ಯ)</div>
                <div>೧೪. ಚಿತ್ತಾ : ವಿಶ್ವಕರ್ಮ</div>
                <div>೧೫. ಸ್ವಾತಿ : ವಾಯುದೇವ</div>
                <div>೧೬. ವಿಶಾಖಾ : ಇಂದ್ರಾಗ್ನಿ</div>
                <div>೧೭. ಅನೂರಾಧಾ : ಮಿತ್ರದೇವ</div>
                <div>೧೮. ಜ್ಯೇಷ್ಠಾ : ಇಂದ್ರದೇವ</div>
                <div>೧೯. ಮೂಲಾ : ನಿರೃತಿ (ರಾಕ್ಷಸ)</div>
                <div>೨೦. ಪೂ.ಷಾಢ : ವರುಣ (ಜಲದೇವ)</div>
                <div>೨೧. ಉ.ಷಾಢ : ವಿಶ್ವೇದೇವತೆಗಳು</div>
                <div>೨೨. ಶ್ರವಣ : ವಿಷ್ಣುದೇವ</div>
                <div>೨೩. ಧನಿಷ್ಠಾ : ಅಷ್ಟವಸುಗಳು</div>
                <div>೨೪. ಶತಭಿಷಾ : ವರುಣದೇವ</div>
                <div>೨೫. ಪೂ.ಭಾದ್ರಾ : ಅಜೈಕಪಾದ್</div>
                <div>೨೬. ಉ.ಭಾದ್ರಾ : ಅಹಿರ್ಬುಧ್ನ್ಯ</div>
                <div className="col-span-2 text-center font-bold">೨೭. ರೇವತಿ : ಪೂಷಾ ದೇವತೆ</div>
              </div>
            </div>

            {/* Yoga Deities */}
            <div className="border border-black flex flex-col">
              <div className="bg-black text-white text-center py-0.5 font-black text-[10px]">
                ೨೭ ನಿತ್ಯಯೋಗಗಳು ಹಾಗೂ ಯೋಗಾಧಿಪತಿ ದೇವತೆಗಳು
              </div>
              <div className="p-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8.5px] flex-1 overflow-hidden">
                <div>೧. ವಿಷ್ಕಂಭ : ವಿಶ್ವೇದೇವತೆಗಳು</div>
                <div>೨. ಪ್ರೀತಿ : ಮರುತ್ (ವಾಯು)</div>
                <div>೩. ಆಯುಷ್ಮಾನ್ : ಹಿರಣ್ಯಗರ್ಭ</div>
                <div>೪. ಸೌಭಾಗ್ಯ : ದುರ್ಗಾದೇವಿ</div>
                <div>೫. ಶೋಭನ : ಬ್ರಹ್ಮದೇವ</div>
                <div>೬. ಅತಿಗಂಡ : ಚಂದ್ರದೇವ</div>
                <div>೭. ಸುಕರ್ಮ : ಇಂದ್ರದೇವ</div>
                <div>೮. ಧೃತಿ : ಪರ್ವತ (ಸ್ಥಿರತೆ)</div>
                <div>೯. ಶೂಲ : ರುದ್ರದೇವ</div>
                <div>೧೦. ಗಂಡ : ಸರ್ಪದೇವ</div>
                <div>೧೧. ವೃದ್ಧಿ : ಸೂರ್ಯದೇವ</div>
                <div>೧೨. ಧ್ರುವ : ಭೂಮಿದೇವಿ</div>
                <div>೧೩. ವ್ಯಾಘಾತ : ಯಮದೇವ</div>
                <div>೧೪. ಹರ್ಷಣ : ಮರುತ್</div>
                <div>೧೫. ವಜ್ರ : ವರುಣದೇವ</div>
                <div>೧೬. ಅಸೃಕ್ : ಕುಜದೇವ</div>
                <div>೧೭. ವ್ಯತೀಪಾತ : ರುದ್ರ</div>
                <div>೧೮. ವರಿಯಾನ್ : ಇಂದ್ರಾಣಿ</div>
                <div>೧೯. ಪರಿಘ : ಬ್ರಹ್ಮದೇವ</div>
                <div>೨೦. ಶಿವ : ಸದಾಶಿವ</div>
                <div>೨೧. ಸಿದ್ಧ : ಗಣಪತಿ</div>
                <div>೨೨. ಸಾಧ್ಯ : ಸೂರ್ಯ</div>
                <div>೨೩. ಶುಭ : ಲಕ್ಷ್ಮೀದೇವಿ</div>
                <div>೨೪. ಶುಕ್ಲ : ಗೌರಿದೇವಿ</div>
                <div>೨೫. ಬ್ರಹ್ಮ : ಸರಸ್ವತೀ</div>
                <div>೨೬. ಐಂದ್ರ : ಇಂದ್ರದೇವ</div>
                <div className="col-span-2 text-center font-bold">೨೭. ವೈಧೃತಿ : ದಿತಿ ದೇವತೆ</div>
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-1 mt-1 text-[9px] text-center font-sans font-bold text-slate-700">
            ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೧೭
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 18: ANNUAL FESTIVALS & RAMAKRISHNA STORES */
export const Page18AnnualFestivalsAndRamakrishnaStores: React.FC<PageTemplateProps> = ({ meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={18}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರದ ವಾರ್ಷಿಕ ಹಬ್ಬ-ಹುಣ್ಣಿಮೆಗಳು & ಶಾಸ್ತ್ರೀಯ ವ್ರತ ನಿಯಮಗಳು
        </div>

        <div className="flex-1 border border-black p-2 font-serif flex gap-3 overflow-hidden text-[9.5px]">
          {/* Left Column: Ramakrishna Stores Yellapur */}
          <div className="w-[30%] border border-black p-2 bg-slate-50 flex flex-col justify-between text-center">
            <div>
              <div className="text-[10px] font-bold text-slate-700">॥ ಶ್ರೀ ರಾಮಕೃಷ್ಣ ಪ್ರಸನ್ನ ॥</div>
              <div className="text-[16px] font-black text-black my-1">
                ರಾಮಕೃಷ್ಣ ಸ್ಟೋರ್ಸ್
              </div>
              <div className="text-[11px] font-bold">ಹುಬ್ಬಳ್ಳಿ ರಸ್ತೆ, ಯಲ್ಲಾಪುರ (ಉ.ಕ.)</div>
            </div>

            <div className="border-y border-black/40 py-2 my-2 text-[9.5px] leading-relaxed text-justify">
              ಸಮಸ್ತ ಸಾಹಿತ್ಯ ಗ್ರಂಥಗಳು, ಧಾರ್ಮಿಕ ಪೂಜಾ ಪುಸ್ತಕಗಳು, ಶಾಲಾ-ಕಾಲೇಜು ಸಾಮಗ್ರಿಗಳು ಹಾಗೂ <span className="font-bold">ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಅಧಿಕೃತ ಮಾರಾಟ ಕೇಂದ್ರ</span>. ತಾಲೂಕಿನ ಸಮಸ್ತ ಭಕ್ತಾದಿಗಳು ಹಾಗೂ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಆದರದ ಸ್ವಾಗತ.
            </div>

            <div className="text-[9px] font-sans font-bold">
              ಸಂಪರ್ಕಿಸಿ: ವ್ಯವಸ್ಥಾಪಕರು, ಯಲ್ಲಾಪುರ<br />ದೂರವಾಣಿ: 08419-261234
            </div>
          </div>

          {/* Right Column: Festivals & Navaratri Rules */}
          <div className="w-[70%] flex flex-col justify-between border border-black p-2 bg-white">
            <div className="border-b border-black pb-1 mb-1 font-black text-[11px] text-center">
              ಪ್ರಮುಖ ವ್ರತ-ಪರ್ವದಿನಗಳ ಶಾಸ್ತ್ರ ನಿರ್ಣಯ ಹಾಗೂ ನವರಾತ್ರಿ ವ್ರತಾಚರಣೆ
            </div>

            <div className="space-y-1.5 leading-relaxed text-justify flex-1 overflow-hidden">
              <p>
                <span className="font-bold">ನವರಾತ್ರಿ ವ್ರತ ನಿರ್ಣಯ:</span> ಶರನ್ನವರಾತ್ರಿ ಹಾಗೂ ಚೈತ್ರ ನವರಾತ್ರಿ ವ್ರತವನ್ನು ಶಕ್ತ್ಯಾನುಸಾರ ೯ ದಿನ, ೩ ದಿನ (ಸಪ್ತಮೀ, ಅಷ್ಟಮೀ, ನವಮೀ) ಅಥವಾ ೧ ದಿನ (ಮಹಾನವಮಿಯಂದು) ಆಚರಿಸಬಹುದು. ಘಟಸ್ಥಾಪನೆಯನ್ನು ಶುಕ್ಲ ಪಾಡ್ಯದಂದು ಅಭಿಜಿನ್ ಮುಹೂರ್ತದಲ್ಲಿ ಮಾಡತಕ್ಕದ್ದು.
              </p>
              <p>
                <span className="font-bold">ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆ (ಸರ್ವಪಿತೃ ಶ್ರಾದ್ಧ):</span> ಭಾದ್ರಪದ ಕೃಷ್ಣ ಅಮಾವಾಸ್ಯೆಯು ಅಪರಾಹ್ನವ್ಯಾಪಿನಿಯಾಗಿರಬೇಕು. ಅಂದು ಸಮಸ್ತ ಪಿತೃಗಳಿಗೆ ತರ್ಪಣ, ತಿಲಹೋಮ ಹಾಗೂ ಪಿಂಡಪ್ರದಾನ ಮಾಡುವುದರಿಂದ ಪಿತೃದೇವತೆಗಳ ಪ್ರಸನ್ನತೆ ಲಭಿಸುವುದು.
              </p>
              <p>
                <span className="font-bold">ದೀಪಾವಳಿ ಲಕ್ಷ್ಮೀಪೂಜೆ:</span> ಆಶ್ವಯುಜ ಕೃಷ್ಣ ಅಮಾವಾಸ್ಯೆಯ ಪ್ರದೋಷಕಾಲದಲ್ಲಿ ಸ್ಥಿರ ವೃಷಭ ಲಗ್ನದಲ್ಲಿ ಲಕ್ಷ್ಮೀಪೂಜೆಯನ್ನು ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಹಾಗೂ ಐಶ್ವರ್ಯಪ್ರದ.
              </p>
              <div className="border border-black p-1 bg-slate-50 text-[9px] font-sans">
                <span className="font-bold">ಸೂಚನೆ:</span> ಯಾವುದೇ ಹಬ್ಬ ಅಥವಾ ವ್ರತದ ಆರಂಭ-ಮುಕ್ತಾಯದ ಘಟಿ-ವಿಘಟಿಗಳನ್ನು ಆಯಾ ಮಾಸದ ಪಂಚಾಂಗ ಪುಟಗಳಲ್ಲಿ ದೃಗ್ಗಣಿತಾನುಸಾರವಾಗಿ ಪರಿಶೀಲಿಸಿ ಆಚರಿಸತಕ್ಕದ್ದು.
              </div>
            </div>

            <div className="border-t border-black pt-1 text-[9px] text-center font-sans font-bold text-slate-700">
              ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೧೮
            </div>
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 19: JATAKA TATVAGALU, NAVAGRAHA KARAKATVA & V.G. HEGDE AD */
export const Page19JatakaTatvagaluNavagraha: React.FC<PageTemplateProps> = ({ meta }) => {
  const grahas = [
    { name: "ರವಿ", num: "೧", shape: "ದೀರ್ಘ ಚತುರಶ್ರ", metal: "ತಾಮ್ರ", gem: "ಮಾಣಿಕ್ಯ", grain: "ಗೋಧಿ", taste: "ಖಾರ" },
    { name: "ಚಂದ್ರ", num: "೨", shape: "ವೃತ್ತ", metal: "ಕಂಚು", gem: "ಮುತ್ತು", grain: "ಭತ್ತ", taste: "ಉಪ್ಪು" },
    { name: "ಕುಜ", num: "೯", shape: "ತ್ರಿಕೋಣ", metal: "ತಾಮ್ರ", gem: "ಹವಳ", grain: "ತೊಗರಿ", taste: "ಕಹಿ" },
    { name: "ಬುಧ", num: "೫", shape: "ಬಾಣಾಕಾರ", metal: "ಹಿತ್ತಾಳೆ", gem: "ಪಚ್ಚೆ", grain: "ಹೆಸರು", taste: "ಮಿಶ್ರ" },
    { name: "ಗುರು", num: "೩", shape: "ದೀರ್ಘ ಚತುರಶ್ರ", metal: "ಚಿನ್ನ", gem: "ಪುಷ್ಯರಾಗ", grain: "ಕಡಲೆ", taste: "ಸಿಹಿ" },
    { name: "ಶುಕ್ರ", num: "೬", shape: "ಪಂಚಕೋಣ", metal: "ಬೆಳ್ಳಿ", gem: "ವಜ್ರ", grain: "ಅವರೆ", taste: "ಹುಳಿ" },
    { name: "ಶನಿ", num: "೮", shape: "ಧನುಸ್ಸು", metal: "ಕಬ್ಬಿಣ", gem: "ನೀಲ", grain: "ಎಳ್ಳು", taste: "ಕಷಾಯ" },
    { name: "ರಾಹು", num: "೪", shape: "ಷಟ್ಕೋಣ", metal: "ಸೀಸ", gem: "ಗೋಮೇಧಿಕ", grain: "ಉದ್ದು", taste: "ಹುಳಿ" },
    { name: "ಕೇತು", num: "೭", shape: "ಧ್ವಜಾಕಾರ", metal: "ಮಿಶ್ರಲೋಹ", gem: "ವೈಢೂರ್ಯ", grain: "ಹುರುಳಿ", taste: "ಖಾರ" }
  ];

  return (
    <BaggonaLandscapeFrame pageNumber={19}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಜಾತಕ ತತ್ವಗಳು & ನವಗ್ರಹ ಕಾರಕತ್ವ ಕೋಷ್ಟಕ (Planetary Principles & Attributions)
        </div>

        <div className="flex-1 border border-black p-2 font-serif flex flex-col justify-between text-[9.5px]">
          {/* Planetary Table */}
          <div className="border border-black flex-1 overflow-hidden mb-2">
            <table className="w-full text-[9px] border-collapse text-center h-full">
              <thead>
                <tr className="bg-black text-white font-black text-[9.5px]">
                  <th className="p-1 border-r border-white/40">ಗ್ರಹ</th>
                  <th className="p-1 border-r border-white/40">ಸಂಖ್ಯೆ</th>
                  <th className="p-1 border-r border-white/40">ಜ್ಯಾಮಿತಿ ಆಕಾರ</th>
                  <th className="p-1 border-r border-white/40">ಲೋಹ</th>
                  <th className="p-1 border-r border-white/40">ನವರತ್ನ</th>
                  <th className="p-1 border-r border-white/40">ಧಾನ್ಯ</th>
                  <th className="p-1">ರಸ (ರುಚಿ)</th>
                </tr>
              </thead>
              <tbody>
                {grahas.map((g, i) => (
                  <tr key={g.name} className={`border-b border-black/30 ${i % 2 === 1 ? "bg-slate-50" : ""}`}>
                    <td className="border-r border-black p-0.5 font-bold text-[10px]">{g.name}</td>
                    <td className="border-r border-black p-0.5 font-mono font-bold">{g.num}</td>
                    <td className="border-r border-black p-0.5">{g.shape}</td>
                    <td className="border-r border-black p-0.5">{g.metal}</td>
                    <td className="border-r border-black p-0.5 font-bold">{g.gem}</td>
                    <td className="border-r border-black p-0.5">{g.grain}</td>
                    <td className="p-0.5">{g.taste}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Panel: V.G. Hegde Ambalike Ad */}
          <div className="border border-black p-2 bg-slate-50 text-center flex flex-col justify-between">
            <div className="text-[12px] font-black text-black">
              ವಿ. ಜಿ. ಹೆಗಡೆ, ಅಂಬಳಿಕೆ • ಸಿರಸಿ (ಉ.ಕ.)
            </div>
            <div className="text-[10px] font-bold text-slate-800 my-0.5">
              ಇನ್ವರ್ಟರ್‌ಗಳು, ಸೋಲಾರ್ ಬ್ಯಾಟರಿಗಳು, ವೆಹಿಕಲ್ ಬ್ಯಾಟರಿಗಳು ಮಾರಾಟ ಮತ್ತು ಅಧಿಕೃತ ಸರ್ವೀಸ್
            </div>
            <div className="text-[9px] font-sans text-slate-600">
              ಉತ್ತಮ ಗುಣಮಟ್ಟದ ವಿದ್ಯುತ್ ಉಪಕರಣಗಳು ಹಾಗೂ ತ್ವರಿತ ಗೃಹಸೇವೆ | ಮೊಬೈಲ್: 9448123890 / 08384-234567
            </div>
          </div>

          <div className="border-t border-black pt-1 mt-1 text-[9px] text-center font-sans font-bold text-slate-700">
            ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೧೯
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 20: MESHA & VRISHABHA BHAVISHYA */
export const Page20MeshaVrishabhaBhavishya: React.FC<PageTemplateProps> = ({ meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={20}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರದ ದ್ವಾದಶ ರಾಶಿಗಳ ಸಮಗ್ರ ವರ್ಷಭವಿಷ್ಯ (ಮೇಷ & ವೃಷಭ ರಾಶಿಗಳು)
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3 font-serif overflow-hidden">
          {/* Mesha Rashi */}
          <div className="border border-black p-2.5 flex flex-col justify-between bg-white">
            <div>
              <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1.5">
                <span className="font-black text-[15px]">ಮೇಷ ರಾಶಿ (Aries)</span>
                <span className="text-[9.5px] font-mono font-bold bg-slate-100 px-2 py-0.5 border border-black">
                  ಆದಾಯ: ೧೪ • ವ್ಯಯ: ೧೧ | ರಾಜಪೂಜ್ಯ: ೪ • ಅವಮಾನ: ೧
                </span>
              </div>
              <div className="text-[9px] font-bold text-slate-600 mb-1">ನಕ್ಷತ್ರ ಪಾದಗಳು: ಅಶ್ವಿನಿ ೪, ಭರಣಿ ೪, ಕೃತ್ತಿಕಾ ೧ನೇ ಪಾದ</div>
              <p className="text-[9.5px] leading-relaxed text-justify">
                ಪ್ರಾರಂಭದ ಎರಡು ತಿಂಗಳು ಶುಭಗ್ರಹರ ಅನುಕೂಲತೆಯಿಂದ ಆರ್ಥಿಕ ಪ್ರಗತಿ, ನೂತನ ಗೃಹ-ವಾಹನ ಖರೀದಿ ಯೋಗ. ಉದ್ಯೋಗಸ್ಥರಿಗೆ ಬಡ್ತಿ, ವ್ಯಾಪಾರಸ್ಥರಿಗೆ ಹಿತಕರ ಲಾಭ. ಕೌಟುಂಬಿಕ ಸೌಖ್ಯ ಉತ್ತಮವಾಗಿದ್ದರೂ ಶನಿ ಪ್ರಭಾವದಿಂದ ಹಿತಶತ್ರುಗಳ ಕಾಟ ಇರಲಿದೆ. ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಕಠಿಣ ಪರಿಶ್ರಮದಿಂದ ಯಶಸ್ಸು.
              </p>
              <p className="text-[9.5px] leading-relaxed text-justify mt-1">
                ಆರೋಗ್ಯದಲ್ಲಿ ರಕ್ತದೊತ್ತಡ ಹಾಗೂ ಉಷ್ಣ ಬಾಧೆಯ ಬಗ್ಗೆ ಜಾಗ್ರತೆ ಇರಲಿ. ನ್ಯಾಯಾಲಯದ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಸಂಧಾನ ಮಾರ್ಗ ಶ್ರೇಯಸ್ಕರ.
              </p>
            </div>
            <div className="border-t border-black pt-1 mt-1 text-[9px] font-sans font-bold bg-slate-50 p-1">
              ಶಾಂತಿ-ಪರಿಹಾರ: ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಆರಾಧನೆ, ರುದ್ರಾಭಿಷೇಕ, ಕೆಂಪು ಹವಳ ಧಾರಣೆ ಶುಭ.
            </div>
          </div>

          {/* Vrishabha Rashi */}
          <div className="border border-black p-2.5 flex flex-col justify-between bg-white">
            <div>
              <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1.5">
                <span className="font-black text-[15px]">ವೃಷಭ ರಾಶಿ (Taurus)</span>
                <span className="text-[9.5px] font-mono font-bold bg-slate-100 px-2 py-0.5 border border-black">
                  ಆದಾಯ: ೧೧ • ವ್ಯಯ: ೦೫ | ರಾಜಪೂಜ್ಯ: ೭ • ಅವಮಾನ: ೪
                </span>
              </div>
              <div className="text-[9px] font-bold text-slate-600 mb-1">ನಕ್ಷತ್ರ ಪಾದಗಳು: ಕೃತ್ತಿಕಾ ೨,೩,೪, ರೋಹಿಣಿ ೪, ಮೃಗಶಿರಾ ೧,೨ನೇ ಪಾದ</div>
              <p className="text-[9.5px] leading-relaxed text-justify">
                ವರ್ಷ ಪೂರ್ತಿ ಗುರು ಬಲದಿಂದ ಸಮಸ್ತ ಕಾರ್ಯಗಳಲ್ಲಿ ಅನುಕೂಲ. ಸಮಾಜದಲ್ಲಿ ಗೌರವ-ಪ್ರತಿಷ್ಠೆ ವೃದ್ಧಿ. ಹಳೆಯ ಬಾಕಿ ವಸೂಲಾತಿ. ಬಂಧು-ಮಿತ್ರರ ಸಹಕಾರದಿಂದ ನೂತನ ಉದ್ಯಮಾರಂಭ. ಭೂಮಿ, ಚಿನ್ನಾಭರಣ ಖರೀದಿ ಯೋಗ. ಅವಿವಾಹಿತರಿಗೆ ಶೀಘ್ರ ವಿವಾಹ ಭಾಗ್ಯ.
              </p>
              <p className="text-[9.5px] leading-relaxed text-justify mt-1">
                ಧಾರ್ಮಿಕ ತೀರ್ಥಕ್ಷೇತ್ರ ದರ್ಶನ ಹಾಗೂ ಸತ್ಕರ್ಮಗಳಲ್ಲಿ ಪಾಲ್ಗೊಳ್ಳುವಿರಿ. ವಿದೇಶ ಪ್ರಯಾಣದ ಅಪೇಕ್ಷೆಯು ಸಾಕಾರಗೊಳ್ಳುವುದು.
              </p>
            </div>
            <div className="border-t border-black pt-1 mt-1 text-[9px] font-sans font-bold bg-slate-50 p-1">
              ಶಾಂತಿ-ಪರಿಹಾರ: ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ಪೂಜೆ, ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಣ, ವಜ್ರ/ಶ್ವೇತ ಪುಷ್ಯರಾಗ ಧಾರಣೆ.
            </div>
          </div>
        </div>

        <div className="border-t border-black pt-1 text-[9px] text-center font-sans font-bold text-slate-700 mt-1">
          ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೨೦
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 21: MITHUNA & KARKATAKA BHAVISHYA */
export const Page21MithunaKarkatakaBhavishya: React.FC<PageTemplateProps> = ({ meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={21}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರದ ದ್ವಾದಶ ರಾಶಿಗಳ ಸಮಗ್ರ ವರ್ಷಭವಿಷ್ಯ (ಮಿಥುನ & ಕರ್ಕಾಟಕ ರಾಶಿಗಳು)
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3 font-serif overflow-hidden">
          {/* Mithuna Rashi */}
          <div className="border border-black p-2.5 flex flex-col justify-between bg-white">
            <div>
              <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1.5">
                <span className="font-black text-[15px]">ಮಿಥುನ ರಾಶಿ (Gemini)</span>
                <span className="text-[9.5px] font-mono font-bold bg-slate-100 px-2 py-0.5 border border-black">
                  ಆದಾಯ: ೦೫ • ವ್ಯಯ: ೧೧ | ರಾಜಪೂಜ್ಯ: ೧ • ಅವಮಾನ: ೪
                </span>
              </div>
              <div className="text-[9px] font-bold text-slate-600 mb-1">ನಕ್ಷತ್ರ ಪಾದಗಳು: ಮೃಗಶಿರಾ ೩,೪, ಆರಿದ್ರಾ ೪, ಪುನರ್ವಸು ೧,೨,೩ನೇ ಪಾದ</div>
              <p className="text-[9.5px] leading-relaxed text-justify">
                “ಕಾಯಕವೇ ಕೈಲಾಸ” ಎಂಬ ನುಡಿ ಎಷ್ಟು ಸತ್ಯವೋ “ಆರೋಗ್ಯವೇ ಭಾಗ್ಯ” ಎಂಬುದು ಕೂಡ ಅಷ್ಟೇ ಸತ್ಯವೆನ್ನುವುದು ನೆನಪಿರಲಿ. ಆರ್ಥಿಕ ವಿಷಯಗಳಲ್ಲಿ ಮಿತಿಮೀರಿದ ಸಾಲ ಮಾಡಬೇಡಿ. ರಕ್ತ ವಿಕಾರ, ಅಲರ್ಜಿ, ನೇತ್ರಬಾಧೆ ಇತ್ಯಾದಿಗಳಿಂದ ಎಚ್ಚರ ಅಗತ್ಯ.
              </p>
              <p className="text-[9.5px] leading-relaxed text-justify mt-1">
                ಉದ್ಯೋಗದಲ್ಲಿ ಹಿರಿಯ ಅಧಿಕಾರಿಗಳೊಂದಿಗೆ ಸೌಹಾರ್ದತೆ ಕಾಪಾಡಿಕೊಳ್ಳಿ. ವರ್ಷದ ಉತ್ತರಾರ್ಧದಲ್ಲಿ ಗುರು ಸಂಚಾರದಿಂದ ಕಾರ್ಯಸಿದ್ಧಿ.
              </p>
            </div>
            <div className="border-t border-black pt-1 mt-1 text-[9px] font-sans font-bold bg-slate-50 p-1">
              ಶಾಂತಿ-ಪರಿಹಾರ: ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಾರಾಯಣ, ಬುಧ ಜಪ, ಪಚ್ಚೆ ರತ್ನ ಧಾರಣೆ ಹಿತಕರ.
            </div>
          </div>

          {/* Karkataka Rashi */}
          <div className="border border-black p-2.5 flex flex-col justify-between bg-white">
            <div>
              <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1.5">
                <span className="font-black text-[15px]">ಕರ್ಕಾಟಕ ರಾಶಿ (Cancer)</span>
                <span className="text-[9.5px] font-mono font-bold bg-slate-100 px-2 py-0.5 border border-black">
                  ಆದಾಯ: ೧೪ • ವ್ಯಯ: ೦೨ | ರಾಜಪೂಜ್ಯ: ೪ • ಅವಮಾನ: ೧
                </span>
              </div>
              <div className="text-[9px] font-bold text-slate-600 mb-1">ನಕ್ಷತ್ರ ಪಾದಗಳು: ಪುನರ್ವಸು ೪, ಪುಷ್ಯಾ ೪, ಆಶ್ಲೇಷಾ ೪ನೇ ಪಾದ</div>
              <p className="text-[9.5px] leading-relaxed text-justify">
                ಆದಾಯ ಅತ್ಯುತ್ತಮವಾಗಿದ್ದು ಖರ್ಚು ನಿಯಂತ್ರಣದಲ್ಲಿರಲಿದೆ. ಗೃಹ ನಿರ್ಮಾಣ ಕಾರ್ಯಗಳು ಸಾಂಗವಾಗಿ ನೆರವೇರುತ್ತವೆ. ಸಂತಾನ ಸೌಖ್ಯ, ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ. ಹೊಸ ಹೂಡಿಕೆಗಳಿಗೆ ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾದ ವರ್ಷ. ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮ ಮಾತುಗಳಿಗೆ ಗೌರವ ಹೆಚ್ಚುವುದು.
              </p>
              <p className="text-[9.5px] leading-relaxed text-justify mt-1">
                ತಾಯಿಯವರ ಆರೋಗ್ಯದಲ್ಲಿ ಸುಧಾರಣೆ ಕಂಡುಬರುವುದು. ದೂರದ ಊರಿನಿಂದ ಶುಭ ಸಮಾಚಾರ ಪ್ರಾಪ್ತಿ.
              </p>
            </div>
            <div className="border-t border-black pt-1 mt-1 text-[9px] font-sans font-bold bg-slate-50 p-1">
              ಶಾಂತಿ-ಪರಿಹಾರ: ಶ್ರೀ ಚಂದ್ರಮೌಳೀಶ್ವರ ಆರಾಧನೆ, ರುದ್ರಾಭಿಷೇಕ, ಶುದ್ಧ ಮುತ್ತು ಧಾರಣೆ ಪ್ರಶಸ್ತ.
            </div>
          </div>
        </div>

        <div className="border-t border-black pt-1 text-[9px] text-center font-sans font-bold text-slate-700 mt-1">
          ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೨೧
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 22: SIMHA & KANYA BHAVISHYA */
export const Page22SimhaKanyaBhavishya: React.FC<PageTemplateProps> = ({ meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={22}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರದ ದ್ವಾದಶ ರಾಶಿಗಳ ಸಮಗ್ರ ವರ್ಷಭವಿಷ್ಯ (ಸಿಂಹ & ಕನ್ಯಾ ರಾಶಿಗಳು)
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3 font-serif overflow-hidden">
          {/* Simha Rashi */}
          <div className="border border-black p-2.5 flex flex-col justify-between bg-white">
            <div>
              <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1.5">
                <span className="font-black text-[15px]">ಸಿಂಹ ರಾಶಿ (Leo)</span>
                <span className="text-[9.5px] font-mono font-bold bg-slate-100 px-2 py-0.5 border border-black">
                  ಆದಾಯ: ೧೧ • ವ್ಯಯ: ೧೧ | ರಾಜಪೂಜ್ಯ: ೭ • ಅವಮಾನ: ೪
                </span>
              </div>
              <div className="text-[9px] font-bold text-slate-600 mb-1">ನಕ್ಷತ್ರ ಪಾದಗಳು: ಮಘಾ ೪, ಪುಬ್ಬಾ ೪, ಉತ್ತರಾ ೧ನೇ ಪಾದ</div>
              <p className="text-[9.5px] leading-relaxed text-justify">
                ಕೇತು ಹಾಗೂ ಗುರು ವ್ಯಯಭಾವದಲ್ಲಿ ಸಂಚರಿಸುವುದರಿಂದ ಆಧ್ಯಾತ್ಮಿಕ ವಿಷಯಗಳಲ್ಲಿ ಆಸಕ್ತಿ ಬೆಳೆಯುತ್ತದೆ. ತೀರ್ಥಯಾತ್ರೆ, ದೇವತಾ ಕಾರ್ಯಗಳಲ್ಲಿ ಭಾಗವಹಿಸಿ ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಕಾಣುವಿರಿ. ರಾಜಕೀಯ ಹಾಗೂ ಆಡಳಿತ ರಂಗದಲ್ಲಿರುವವರಿಗೆ ಹೆಚ್ಚಿನ ಅಧಿಕಾರ ಲಭ್ಯ.
              </p>
              <p className="text-[9.5px] leading-relaxed text-justify mt-1">
                ಉದ್ಯೋಗದಲ್ಲಿ ಸ್ಥಾನಪಲ್ಲಟ ಸಂಭವ. ಖರ್ಚು-ವೆಚ್ಚಗಳಲ್ಲಿ ಮಿತಿ ಇರಲಿ. ಕಣ್ಣಿನ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಎಚ್ಚರವಹಿಸಿ.
              </p>
            </div>
            <div className="border-t border-black pt-1 mt-1 text-[9px] font-sans font-bold bg-slate-50 p-1">
              ಶಾಂತಿ-ಪರಿಹಾರ: ಸೂರ್ಯ ನಮಸ್ಕಾರ, ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಣ, ಮಾಣಿಕ್ಯ ರತ್ನ ಧಾರಣೆ.
            </div>
          </div>

          {/* Kanya Rashi */}
          <div className="border border-black p-2.5 flex flex-col justify-between bg-white">
            <div>
              <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1.5">
                <span className="font-black text-[15px]">ಕನ್ಯಾ ರಾಶಿ (Virgo)</span>
                <span className="text-[9.5px] font-mono font-bold bg-slate-100 px-2 py-0.5 border border-black">
                  ಆದಾಯ: ೦೫ • ವ್ಯಯ: ೧೧ | ರಾಜಪೂಜ್ಯ: ೧ • ಅವಮಾನ: ೪
                </span>
              </div>
              <div className="text-[9px] font-bold text-slate-600 mb-1">ನಕ್ಷತ್ರ ಪಾದಗಳು: ಉತ್ತರಾ ೨,೩,೪, ಹಸ್ತಾ ೪, ಚಿತ್ತಾ ೧,೨ನೇ ಪಾದ</div>
              <p className="text-[9.5px] leading-relaxed text-justify">
                ಉದ್ಯೋಗದಲ್ಲಿ ಬದಲಾವಣೆ ಹಾಗೂ ಹೊಸ ಜವಾಬ್ದಾರಿಗಳು ಎದುರಾಗಲಿವೆ. ಕೌಟುಂಬಿಕ ವಿಚಾರಗಳಲ್ಲಿ ಪರಸ್ಪರ ತಾಳ್ಮೆಯಿಂದ ವರ್ತಿಸುವುದು ಶ್ರೇಯಸ್ಕರ. ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಉತ್ತಮ ಫಲಿತಾಂಶ. ಆಸ್ತಿ ಖರೀದಿ ವಿಚಾರದಲ್ಲಿ ಕಾನೂನು ಸಲಹೆ ಅಗತ್ಯ.
              </p>
              <p className="text-[9.5px] leading-relaxed text-justify mt-1">
                ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಜಾಗರೂಕರಾಗಿರಿ. ಅನಿರೀಕ್ಷಿತ ಪ್ರವಾಸಗಳಿಂದ ಆಯಾಸ ಉಂಟಾಗಬಹುದು.
              </p>
            </div>
            <div className="border-t border-black pt-1 mt-1 text-[9px] font-sans font-bold bg-slate-50 p-1">
              ಶಾಂತಿ-ಪರಿಹಾರ: ಶ್ರೀ ಮಹಾಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಪಠಣ, ಗೋಸೇವೆ, ಪಚ್ಚೆ ರತ್ನ ಧಾರಣೆ.
            </div>
          </div>
        </div>

        <div className="border-t border-black pt-1 text-[9px] text-center font-sans font-bold text-slate-700 mt-1">
          ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೨೨
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 23: TULA & VRISHCHIKA BHAVISHYA */
export const Page23TulaVrishchikaBhavishya: React.FC<PageTemplateProps> = ({ meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={23}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರದ ದ್ವಾದಶ ರಾಶಿಗಳ ಸಮಗ್ರ ವರ್ಷಭವಿಷ್ಯ (ತುಲಾ & ವೃಶ್ಚಿಕ ರಾಶಿಗಳು)
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3 font-serif overflow-hidden">
          {/* Tula Rashi */}
          <div className="border border-black p-2.5 flex flex-col justify-between bg-white">
            <div>
              <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1.5">
                <span className="font-black text-[15px]">ತುಲಾ ರಾಶಿ (Libra)</span>
                <span className="text-[9.5px] font-mono font-bold bg-slate-100 px-2 py-0.5 border border-black">
                  ಆದಾಯ: ೧೪ • ವ್ಯಯ: ೧೧ | ರಾಜಪೂಜ್ಯ: ೪ • ಅವಮಾನ: ೧
                </span>
              </div>
              <div className="text-[9px] font-bold text-slate-600 mb-1">ನಕ್ಷತ್ರ ಪಾದಗಳು: ಚಿತ್ತಾ ೩,೪, ಸ್ವಾತಿ ೪, ವಿಶಾಖಾ ೧,೨,೩ನೇ ಪಾದ</div>
              <p className="text-[9.5px] leading-relaxed text-justify">
                ಹಿರಿಯರ ಹಿತನುಡಿಗಳನ್ನು ನೆನಪಿನಲ್ಲಿಟ್ಟುಕೊಂಡು ಮುನ್ನಡೆಯಿರಿ. ಕಳೆದ ವರ್ಷಕ್ಕಿಂತ ಈ ವರ್ಷ ಆರ್ಥಿಕ ಪರಿಸ್ಥಿತಿ ಉತ್ತಮವಾಗಿರುವುದು. ಕೋರ್ಟ್ ವ್ಯಾಜ್ಯಗಳಲ್ಲಿ ಜಯ ಲಭಿಸಲಿದೆ. ಕೃಷಿಕರಿಗೆ ಅಡಿಕೆ, ಭತ್ತ, ತೆಂಗು ಬೆಳೆಗಳಲ್ಲಿ ಹಿತಕರ ಇಳುವರಿ.
              </p>
              <p className="text-[9.5px] leading-relaxed text-justify mt-1">
                ವ್ಯಾಪಾರದಲ್ಲಿ ವಿಸ್ತರಣೆ. ಗೃಹದಲ್ಲಿ ಶುಭ ಮಂಗಲ ಕಾರ್ಯಗಳ ಆಯೋಜನೆ. ನೆರೆಹೊರೆಯವರೊಂದಿಗೆ ಸೌಹಾರ್ದತೆ.
              </p>
            </div>
            <div className="border-t border-black pt-1 mt-1 text-[9px] font-sans font-bold bg-slate-50 p-1">
              ಶಾಂತಿ-ಪರಿಹಾರ: ಶ್ರೀ ದುರ್ಗಾ ಸಪ್ತಶತೀ ಪಾರಾಯಣ, ಕುಂಕುಮಾರ್ಚನೆ, ವಜ್ರ ಅಥವಾ ಬೆಳ್ಳಿ ಧಾರಣೆ.
            </div>
          </div>

          {/* Vrishchika Rashi */}
          <div className="border border-black p-2.5 flex flex-col justify-between bg-white">
            <div>
              <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1.5">
                <span className="font-black text-[15px]">ವೃಶ್ಚಿಕ ರಾಶಿ (Scorpio)</span>
                <span className="text-[9.5px] font-mono font-bold bg-slate-100 px-2 py-0.5 border border-black">
                  ಆದಾಯ: ೧೧ • ವ್ಯಯ: ೦೫ | ರಾಜಪೂಜ್ಯ: ೭ • ಅವಮಾನ: ೪
                </span>
              </div>
              <div className="text-[9px] font-bold text-slate-600 mb-1">ನಕ್ಷತ್ರ ಪಾದಗಳು: ವಿಶಾಖಾ ೪, ಅನೂರಾಧಾ ೪, ಜ್ಯೇಷ್ಠಾ ೪ನೇ ಪಾದ</div>
              <p className="text-[9.5px] leading-relaxed text-justify">
                ಧನಾಧಿಪತಿ ಬಲದಿಂದ ಆರ್ಥಿಕ ಬಿಕ್ಕಟ್ಟುಗಳು ಪರಿಹಾರವಾಗುತ್ತವೆ. ಸಾಹಸ ಪ್ರವೃತ್ತಿಯಿಂದ ಅಸಾಧ್ಯವೆನಿಸಿದ ಕೆಲಸಗಳನ್ನು ಸಾಧಿಸಿ ಕೀರ್ತಿ ಗಳಿಸುವಿರಿ. ಸ್ನೇಹಿತರಿಂದ ಸೂಕ್ತ ಸಮಯಕ್ಕೆ ಸಾಲ ಮತ್ತು ಸಹಕಾರ ಲಭ್ಯ.
              </p>
              <p className="text-[9.5px] leading-relaxed text-justify mt-1">
                ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಉನ್ನತ ವ್ಯಾಸಂಗಕ್ಕಾಗಿ ವಿದೇಶ ಪ್ರಯಾಣ ಯೋಗ. ಕೀಲುನೋವು ಹಾಗೂ ಗ್ಯಾಸ್ಟ್ರಿಕ್ ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ಎಚ್ಚರಿಕೆ.
              </p>
            </div>
            <div className="border-t border-black pt-1 mt-1 text-[9px] font-sans font-bold bg-slate-50 p-1">
              ಶಾಂತಿ-ಪರಿಹಾರ: ಶ್ರೀ ಕಾರ್ತಿಕೇಯ (ಸುಬ್ರಹ್ಮಣ್ಯ) ಆರಾಧನೆ, ಮಂಗಳವಾರ ವ್ರತ, ಹವಳ ಧಾರಣೆ.
            </div>
          </div>
        </div>

        <div className="border-t border-black pt-1 text-[9px] text-center font-sans font-bold text-slate-700 mt-1">
          ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೨೩
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 24: DHANU & MAKARA BHAVISHYA */
export const Page24DhanuMakaraBhavishya: React.FC<PageTemplateProps> = ({ meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={24}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರದ ದ್ವಾದಶ ರಾಶಿಗಳ ಸಮಗ್ರ ವರ್ಷಭವಿಷ್ಯ (ಧನು & ಮಕರ ರಾಶಿಗಳು)
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3 font-serif overflow-hidden">
          {/* Dhanu Rashi */}
          <div className="border border-black p-2.5 flex flex-col justify-between bg-white">
            <div>
              <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1.5">
                <span className="font-black text-[15px]">ಧನು ರಾಶಿ (Sagittarius)</span>
                <span className="text-[9.5px] font-mono font-bold bg-slate-100 px-2 py-0.5 border border-black">
                  ಆದಾಯ: ೦೨ • ವ್ಯಯ: ೧೪ | ರಾಜಪೂಜ್ಯ: ೫ • ಅವಮಾನ: ೨
                </span>
              </div>
              <div className="text-[9px] font-bold text-slate-600 mb-1">ನಕ್ಷತ್ರ ಪಾದಗಳು: ಮೂಲಾ ೪, ಪೂ.ಷಾಢ ೪, ಉ.ಷಾಢ ೧ನೇ ಪಾದ</div>
              <p className="text-[9.5px] leading-relaxed text-justify">
                ಉನ್ನತ ಶಿಕ್ಷಣ, ಸಂಶೋಧನೆ ಹಾಗೂ ಉದ್ಯೋಗಕ್ಕಾಗಿ ವಿದೇಶ ಪ್ರಯಾಣದ ಯೋಗವಿದೆ. ಧನಾಧಿಪತಿಯಾದ ಶನಿಯು ಅನುಕೂಲಕರ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ ಹಠಾತ್ ಧನಲಾಭ. ಅವಿವಾಹಿತರಿಗೆ ಕಂಕಣ ಭಾಗ್ಯ ಕೂಡಿಬರುವುದು.
              </p>
              <p className="text-[9.5px] leading-relaxed text-justify mt-1">
                ಆದಾಗ್ಯೂ ವ್ಯಯ ಹೆಚ್ಚಿರುವುದರಿಂದ ಅನಗತ್ಯ ದುಂದುವೆಚ್ಚಗಳಿಗೆ ಕಡಿವಾಣ ಹಾಕಿ. ಗಂಟಲು ಬೇನೆ ಹಾಗೂ ಕಫದ ತೊಂದರೆಗೆ ತಕ್ಷಣ ವೈದ್ಯೋಪಚಾರ ಪಡೆಯಿರಿ.
              </p>
            </div>
            <div className="border-t border-black pt-1 mt-1 text-[9px] font-sans font-bold bg-slate-50 p-1">
              ಶಾಂತಿ-ಪರಿಹಾರ: ಶ್ರೀ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಸ್ತೋತ್ರ, ಗುರು ಚರಿತ್ರೆ ಪಾರಾಯಣ, ಕನಕ ಪುಷ್ಯರಾಗ ಧಾರಣೆ.
            </div>
          </div>

          {/* Makara Rashi */}
          <div className="border border-black p-2.5 flex flex-col justify-between bg-white">
            <div>
              <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1.5">
                <span className="font-black text-[15px]">ಮಕರ ರಾಶಿ (Capricorn)</span>
                <span className="text-[9.5px] font-mono font-bold bg-slate-100 px-2 py-0.5 border border-black">
                  ಆದಾಯ: ೦೮ • ವ್ಯಯ: ೧೪ | ರಾಜಪೂಜ್ಯ: ೧ • ಅವಮಾನ: ೪
                </span>
              </div>
              <div className="text-[9px] font-bold text-slate-600 mb-1">ನಕ್ಷತ್ರ ಪಾದಗಳು: ಉ.ಷಾಢ ೨,೩,೪, ಶ್ರವಣ ೪, ಧನಿಷ್ಠಾ ೧,೨ನೇ ಪಾದ</div>
              <p className="text-[9.5px] leading-relaxed text-justify">
                “ಸಾಹಸೇ ಶ್ರೀಃ ಪ್ರತಿ ವಸತಿ” ಎಂಬುದನ್ನು ಮನಗಾಣುವಿರಿ. ಕಠಿಣ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ ದೊರೆಯುವುದು. ಪಾಲುದಾರಿಕೆ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಪಾರದರ್ಶಕತೆ ಕಾಪಾಡಿ. ಕುಟುಂಬದ ಹಿರಿಯರ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕಾಳಜಿ ವಹಿಸಬೇಕಾಗುವುದು.
              </p>
              <p className="text-[9.5px] leading-relaxed text-justify mt-1">
                ಶನಿಯ ಸಂಚಾರದಿಂದಾಗಿ ಯಾವುದೇ ಕೆಲಸವನ್ನು ಮುಂದೂಡದೆ ತಕ್ಷಣ ಪೂರೈಸಿಕೊಳ್ಳಿ. ಸಾಲ ಕೊಡುವುದು ಅಥವಾ ಜಾಮೀನು ನಿಲ್ಲುವುದನ್ನು ತಪ್ಪಿಸಿ.
              </p>
            </div>
            <div className="border-t border-black pt-1 mt-1 text-[9px] font-sans font-bold bg-slate-50 p-1">
              ಶಾಂತಿ-ಪರಿಹಾರ: ಶನಿ ಶಾಂತಿ ಹೋಮ, ಎಳ್ಳೆಣ್ಣೆ ದೀಪಾರಾಧನೆ, ಆಂಜನೇಯ ಸ್ವಾಮಿ ಸ್ತೋತ್ರ, ನೀಲಮಣಿ ಧಾರಣೆ.
            </div>
          </div>
        </div>

        <div className="border-t border-black pt-1 text-[9px] text-center font-sans font-bold text-slate-700 mt-1">
          ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೨೪
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 25: KUMBHA, MEENA & MEMORIAL HOMAGE */
export const Page25KumbhaMeenaAndMemorial: React.FC<PageTemplateProps> = ({ meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={25}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರದ ವರ್ಷಭವಿಷ್ಯ (ಕುಂಭ & ಮೀನ) • ಶ್ರದ್ಧಾಂಜಲಿ
        </div>

        <div className="flex-1 flex flex-col justify-between font-serif overflow-hidden">
          {/* Top Half: Kumbha & Meena Rashi */}
          <div className="grid grid-cols-2 gap-3 mb-2 flex-1">
            {/* Kumbha */}
            <div className="border border-black p-2 bg-white flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-black pb-0.5 mb-1">
                  <span className="font-black text-[14px]">ಕುಂಭ ರಾಶಿ (Aquarius)</span>
                  <span className="text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 border border-black">
                    ಆದಾಯ: ೦೮ • ವ್ಯಯ: ೧೪ | ರಾಜಪೂಜ್ಯ: ೧ • ಅವಮಾನ: ೪
                  </span>
                </div>
                <p className="text-[9px] leading-relaxed text-justify">
                  ಉನ್ನತ ಶಿಕ್ಷಣ ಬಯಸುವ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಉತ್ತಮ ಪ್ರಗತಿ. ರಾಜಕೀಯ ಹಾಗೂ ಸೇವಾ ಸಂಘಟನೆಗಳಲ್ಲಿ ದುಡಿಯುವವರಿಗೆ ಮನ್ನಣೆ. ಮನೆ, ಭೂಮಿ, ಸೈಟು ಖರೀದಿ ಯೋಗ. ಹಿರಿಯ ಸಹೋದರರೊಂದಿಗೆ ಬಾಂಧವ್ಯ ವೃದ್ಧಿ.
                </p>
              </div>
              <div className="text-[8.5px] font-bold bg-slate-50 p-1 border-t border-black/40">
                ಶಾಂತಿ-ಪರಿಹಾರ: ಶ್ರೀ ಆಂಜನೇಯ ಸ್ವಾಮಿಗೆ ಸಿಂಧೂರ ಲೇಪನ, ಶನಿ ಜಪ, ನೀಲ ಧಾರಣೆ.
              </div>
            </div>

            {/* Meena */}
            <div className="border border-black p-2 bg-white flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-black pb-0.5 mb-1">
                  <span className="font-black text-[14px]">ಮೀನ ರಾಶಿ (Pisces)</span>
                  <span className="text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 border border-black">
                    ಆದಾಯ: ೧೧ • ವ್ಯಯ: ೦೫ | ರಾಜಪೂಜ್ಯ: ೭ • ಅವಮಾನ: ೪
                  </span>
                </div>
                <p className="text-[9px] leading-relaxed text-justify">
                  ಸರ್ವತೋಮುಖ ಅಭಿವೃದ್ಧಿ. ಸ್ಥಿರಾಸ್ತಿ ವೃದ್ಧಿ, ನೂತನ ವ್ಯಾಪಾರ ಯೋಜನೆಗಳ ಸಾಕಾರ. ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ. ಆಧ್ಯಾತ್ಮಿಕ ಕ್ಷೇತ್ರದ ಸಾಧಕರಿಗೆ ದೈವಿಕ ಅನುಗ್ರಹ. ವಿದೇಶ ಪ್ರವಾಸ ಫಲಪ್ರದ.
                </p>
              </div>
              <div className="text-[8.5px] font-bold bg-slate-50 p-1 border-t border-black/40">
                ಶಾಂತಿ-ಪರಿಹಾರ: ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಆರಾಧನೆ, ಕನಕ ಪುಷ್ಯರಾಗ ಧಾರಣೆ.
              </div>
            </div>
          </div>

          {/* Bottom Half: Memorial Homage */}
          <div className="border border-black p-2 bg-slate-50 text-center">
            <div className="font-black text-[12px] border-b border-black pb-1 mb-1.5 text-black">
              ॥ ಅಮೃತಮಹೋತ್ಸವ ಶ್ರದ್ಧಾಂಜಲಿ ಸ್ಮರಣೆ ॥
            </div>
            <div className="grid grid-cols-2 gap-3 text-justify text-[9.5px] leading-relaxed">
              <div className="border-r border-black/40 pr-2">
                <span className="font-bold text-black">ಯಮುನಾಂಜ ಶಂಕರ ಜೋಯಿಸರು (೭೨), ಅಂಗರಜೆ:</span> ಉಡುಪಿಯ ಶ್ರೀ ಪುತ್ತಿಗೆ ಮಠದ ಮುಖ್ಯಪ್ರಾಣ ಶ್ರೀಕೃಷ್ಣ ಪಂಚಾಂಗಕ್ಕೆ ಸುದೀರ್ಘ ಗಣಿತ ಸೇವೆ ಸಲ್ಲಿಸಿದ ಖ್ಯಾತ ಜ್ಯೋತಿರ್ವಿಜ್ಞಾನಿಗಳು. ಬೈಲೂರು ಅನಂತಪದ್ಮನಾಭ ತಂತ್ರಿ ಸಂಸ್ಮರಣಾ ಪ್ರಶಸ್ತಿ ಪುರಸ್ಕೃತರು. ಅವರ ಅಗಲಿಕೆಗೆ ಪಂಚಾಂಗ ಮಂಡಳಿಯು ಶ್ರದ್ಧಾಂಜಲಿ ಅರ್ಪಿಸುತ್ತದೆ.
              </div>
              <div className="pl-1">
                <span className="font-bold text-black">ಚಿತ್ರಗಿ ಯಜ್ಞಪತಿ ಭಟ್ಟರು (ಚಿತ್ರಿಗೆ ಭಟ್ರು), ಗೋಕರ್ಣ:</span> ಗೋಕರ್ಣದ ಪ್ರಸಿದ್ಧ ವೇದ ಅನುಷ್ಠಾನಿಕರು, ಧರ್ಮಶಾಸ್ತ್ರಜ್ಞರು ಹಾಗೂ ದೈವಜ್ಞರು. ಪಂಚಾಂಗದ ಶಾಸ್ತ್ರ ನಿರ್ಣಯ ವಿಭಾಗದಲ್ಲಿ ದಶಕಗಳ ಕಾಲ ನೀಡಿದ ಮಾರ್ಗದರ್ಶನ ಶಾಶ್ವತವಾಗಿ ಸ್ಮರಣೀಯವಾಗಿದೆ.
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-1 mt-1 text-[9px] text-center font-sans font-bold text-slate-700">
            ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೨೫
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 26: KRISHI GUIDELINES & GOKARNA MAHABALESHWARA FESTIVALS */
export const Page26KrishiAndGokarnaFestivals: React.FC<PageTemplateProps> = ({ meta }) => {
  const gokarnaUtsava = [
    { d: "೧೯-೦೩-೨೦೨೬", m: "ಫಾಲ್ಗುಣ ಕೃಷ್ಣ ೩೦", w: "ಗುರು", u: "ನೂತನ ಪಂಚಾಂಗ ಶ್ರವಣ ಹಾಗೂ ಧ್ವಜಾರೋಹಣ" },
    { d: "೩೦-೦೩-೨೦೨೬", m: "ಚೈತ್ರ ಶುಕ್ಲ ೧೨", w: "ಸೋಮ", u: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದೇವರಿಗೆ ವಿಶೇಷ ಮಹಾಭಿಷೇಕ" },
    { d: "೧೪-೦೪-೨೦೨೬", m: "ವೈಶಾಖ ಶುಕ್ಲ ೧", w: "ಮಂಗಳ", u: "ಸೌರಯುಗಾದಿ ಮೇಶ ಸಂಕ್ರಮಣ ಪೂಜೆ" },
    { d: "೦೨-೦೫-೨೦೨೬", m: "ವೈಶಾಖ ಹುಣ್ಣಿಮೆ", w: "ಶನಿ", u: "ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಗಂಗಾವತರಣ ತೇಪೋತ್ಸವ" },
    { d: "೨೮-೦೮-೨೦೨೬", m: "ಶ್ರಾವಣ ಹುಣ್ಣಿಮೆ", w: "ಶುಕ್ರ", u: "ಋಗುಪಾಕರ್ಮ ಹಾಗೂ ನೂತನ ಯಜ್ಞೋಪವೀತ ಧಾರಣೆ" },
    { d: "೦೮-೦೩-೨೦೨೭", m: "ಮಾಘ ಕೃಷ್ಣ ೧೪", w: "ಸೋಮ", u: "ಮಹಾಶಿವರಾತ್ರಿ ಮಹಾರಥೋತ್ಸವ, ಕೋಟಿತೀರ್ಥ ಅವಭೃತ" }
  ];

  return (
    <BaggonaLandscapeFrame pageNumber={26}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಕೃಷ್ಯಾದಿ ಕರ್ಮಗಳಿಗೆ ಉಪಯುಕ್ತವಾದ ವಿಷಯಗಳು • ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದೇವಸ್ಥಾನದ ವಾರ್ಷಿಕ ಉತ್ಸವಗಳು
        </div>

        <div className="flex-1 border border-black p-2 font-serif flex gap-3 overflow-hidden text-[9.5px]">
          {/* Left Column: Agricultural Guidelines */}
          <div className="w-[50%] border-r border-black/40 pr-3 flex flex-col justify-between">
            <div className="font-black text-[11px] border-b border-black pb-1 mb-1 text-center bg-slate-100 p-0.5">
              ಕೃಷಿ ಮುಹೂರ್ತ ಹಾಗೂ ಹಲಚಕ್ರ ವಿಚಾರ
            </div>
            <div className="space-y-1.5 leading-relaxed text-justify flex-1 overflow-hidden">
              <p>
                <span className="font-bold">ಗದ್ದೆ ಹೂಡಲಿಕ್ಕೆ:</span> ಹಲಚಕ್ರಾನುಸಾರವಾಗಿ ತತ್ಕಾಲ ಸೂರ್ಯನಕ್ಷತ್ರದ ಹಿಂದಿನ ನಕ್ಷತ್ರ ಮೊದಲುಗೊಂಡು ತತ್ಕಾಲ ಚಂದ್ರನಕ್ಷತ್ರದವರೆಗೆ (ಅಭಿಜಿತ್ ಸೇರಿಸಿ) ಎಣಿಸುವಾಗ ಅದು ೧ ರಿಂದ ೩ ರೊಳಗಾದರೆ ಎತ್ತಿಗೆ ಅನಿಷ್ಟ. ೭ ರಿಂದ ೮ ರೊಳಗೆ, ೧೫ ರಿಂದ ೧೯ ರೊಳಗೆ ಹಾಗೂ ೨೧ ರಿಂದ ೨೭ ರೊಳಗೆ ಬಂದರೆ ಅಶುಭ.
              </p>
              <p>
                <span className="font-bold">ಬೀಜ ಬಿತ್ತನೆಗೆ ಉತ್ತಮ ನಕ್ಷತ್ರಗಳು:</span> ಅಶ್ವಿನಿ, ರೋಹಿಣಿ, ಮೃಗಶಿರಾ, ಪುನರ್ವಸು, ಪುಷ್ಯಾ, ಮಘಾ, ಉತ್ತರಾ, ಹಸ್ತಾ, ಸ್ವಾತಿ, ವಿಶಾಖಾ, ಅನೂರಾಧಾ, ಉತ್ತರಾಷಾಢಾ, ಶ್ರವಣ, ಶತಭಿಷಾ, ಉತ್ತರಾಭಾದ್ರಾ, ರೇವತಿ ನಕ್ಷತ್ರಗಳು ಅತ್ಯುತ್ತಮ.
              </p>
              <p>
                <span className="font-bold">ಧಾನ್ಯ ಸಂಗ್ರಹಕ್ಕೆ:</span> ಸ್ಥಿರ ಲಗ್ನಗಳಾದ ವೃಷಭ, ಸಿಂಹ, ವೃಶ್ಚಿಕ, ಕುಂಭ ಲಗ್ನಗಳಲ್ಲಿ ಮತ್ತು ಗುರು-ಬುಧವಾರಗಳಲ್ಲಿ ಧಾನ್ಯ ಕಣಜಕ್ಕೆ ತುಂಬುವುದು ಧಾನ್ಯವೃದ್ಧಿಕರ.
              </p>
            </div>
            <div className="border border-black p-1 bg-slate-50 text-[9px] font-sans font-bold text-center">
              ॥ ಅನ್ನದಾತ ಸುಖೀಭವ ॥ ಕೃಷಿತೋ ನಾಸ್ತಿ ದುರ್ಭಿಕ್ಷಂ
            </div>
          </div>

          {/* Right Column: Gokarna Utsavas */}
          <div className="w-[50%] flex flex-col justify-between">
            <div className="font-black text-[11px] border-b border-black pb-1 mb-1 text-center bg-slate-100 p-0.5">
              ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೇವರ ವಾರ್ಷಿಕ ಉತ್ಸವಗಳು
            </div>
            <div className="border border-black flex-1 overflow-hidden">
              <table className="w-full text-[9px] border-collapse text-center h-full">
                <thead>
                  <tr className="bg-black text-white font-bold">
                    <th className="p-1 border-r border-white/40">ದಿನಾಂಕ</th>
                    <th className="p-1 border-r border-white/40">ತಿಥಿ/ಮಾಸ</th>
                    <th className="p-1 border-r border-white/40">ವಾರ</th>
                    <th className="p-1 text-left px-2">ಉತ್ಸವ ವಿವರ</th>
                  </tr>
                </thead>
                <tbody>
                  {gokarnaUtsava.map((u, i) => (
                    <tr key={u.d} className={`border-b border-black/30 ${i % 2 === 1 ? "bg-slate-50" : ""}`}>
                      <td className="border-r border-black p-0.5 font-mono font-bold">{u.d}</td>
                      <td className="border-r border-black p-0.5">{u.m}</td>
                      <td className="border-r border-black p-0.5 font-bold">{u.w}</td>
                      <td className="p-0.5 text-left px-2">{u.u}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="border-t border-black pt-1 text-[9px] text-center font-sans font-bold text-slate-700 mt-1">
          ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೨೬
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 27: SHIVALIKHITAM MUHURTHA & GOCHARA PHALAM */
export const Page27ShivalikhitamAndGochara: React.FC<PageTemplateProps> = ({ meta }) => {
  const shivalikhita = [
    { k: "ಉದ್ಯೋಗ", p: "ಕಾರ್ಯಾರಂಭ, ನೌಕರಿ, ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಶುಭ", f: "ಶುಭ" },
    { k: "ಅಮೃತ", p: "ಸಮಸ್ತ ಶುಭಕಾರ್ಯಗಳಿಗೆ, ವಿವಾಹ, ಗೃಹಪ್ರವೇಶಕ್ಕೆ ಶ್ರೇಷ್ಠ", f: "ಅತ್ಯುತ್ತಮ" },
    { k: "ರೋಗ", p: "ಔಷಧ ಸೇವನೆ ಹೊರತುಪಡಿಸಿ ಉಳಿದ ಕಾರ್ಯಗಳಿಗೆ ತ್ಯಾಜ್ಯ", f: "ಅಶುಭ" },
    { k: "ಲಾಭ", p: "ವ್ಯಾಪಾರ, ಕ್ರಯ-ವಿಕ್ರಯ, ಆಸ್ತಿ ಖರೀದಿಗೆ ಲಾಭದಾಯಕ", f: "ಶುಭ" },
    { k: "ಶುಭ", p: "ಮಂಗಲ ಕಾರ್ಯಗಳು, ಸೀಮಂತ, ಉಪನಯನಕ್ಕೆ ಹಿತಕರ", f: "ಅತ್ಯುತ್ತಮ" },
    { k: "ಚಂಚಲ", p: "ಪ್ರಯಾಣ, ವಾಹನ ಸಂಚಾರಕ್ಕೆ ಶುಭ, ಸ್ಥಿರ ಕಾರ್ಯಗಳಿಗೆ ಮಧ್ಯಮ", f: "ಮಧ್ಯಮ" },
    { k: "ಕಾಲ", p: "ಕಲಹ, ವ್ಯಾಜ್ಯ, ಶಸ್ತ್ರಕ್ರಿಯೆ ಹೊರತು ಬೇರೆ ಕಾರ್ಯ ನಿಷೇಧ", f: "ಅಶುಭ" }
  ];

  return (
    <BaggonaLandscapeFrame pageNumber={27}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಶಿವಲಿಖಿತಂ ದೈನಿಕ ಘಟಿಕಾ ಮುಹೂರ್ತ ಚಕ್ರ • ಅಥ ಗೋಚಾರ ಫಲಂ
        </div>

        <div className="flex-1 border border-black p-2 font-serif flex gap-3 overflow-hidden text-[9.5px]">
          {/* Left Column: Shivalikhitam */}
          <div className="w-[50%] border-r border-black/40 pr-3 flex flex-col justify-between">
            <div className="font-black text-[11px] border-b border-black pb-1 mb-1 text-center bg-slate-100 p-0.5">
              ಶಿವಲಿಖಿತಂ (೭ ಘಟಿಕಾ ಮುಹೂರ್ತ ಆವರ್ತನ ಚಕ್ರ)
            </div>
            <p className="text-[9px] text-slate-700 mb-1 leading-normal">
              ಸೂರ್ಯೋದಯದಿಂದ ಸೂರ್ಯಾಸ್ತದವರೆಗಿನ ದಿನಮಾನವನ್ನು ೭ ಭಾಗಗಳಾಗಿ ವಿಂಗಡಿಸಿ ಈ ಕೆಳಗಿನಂತೆ ಶುಭಾಶುಭ ಮುಹೂರ್ತವನ್ನು ಪರಿಶೀಲಿಸತಕ್ಕದ್ದು.
            </p>
            <div className="border border-black flex-1 overflow-hidden">
              <table className="w-full text-[8.5px] border-collapse text-center h-full">
                <thead>
                  <tr className="bg-black text-white font-bold">
                    <th className="p-0.5 border-r border-white/40">ಮುಹೂರ್ತ</th>
                    <th className="p-0.5 border-r border-white/40 text-left px-1">ಫಲ ವಿವರ</th>
                    <th className="p-0.5">ಗುಣ</th>
                  </tr>
                </thead>
                <tbody>
                  {shivalikhita.map((s, i) => (
                    <tr key={s.k} className={`border-b border-black/30 ${i % 2 === 1 ? "bg-slate-50" : ""}`}>
                      <td className="border-r border-black p-0.5 font-bold">{s.k}</td>
                      <td className="border-r border-black p-0.5 text-left px-1">{s.p}</td>
                      <td className={`p-0.5 font-bold ${s.f === "ಅತ್ಯುತ್ತಮ" || s.f === "ಶುಭ" ? "text-green-800" : s.f === "ಅಶುಭ" ? "text-red-800" : "text-amber-800"}`}>{s.f}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Gochara Phala */}
          <div className="w-[50%] flex flex-col justify-between">
            <div className="font-black text-[11px] border-b border-black pb-1 mb-1 text-center bg-slate-100 p-0.5">
              ಅಥ ಗೋಚಾರ ಫಲಂ (೧೨ ಭಾವಗಳಲ್ಲಿ ಗ್ರಹ ಸಂಚಾರ ಫಲ)
            </div>
            <div className="text-[9px] leading-relaxed space-y-1 text-justify flex-1 overflow-hidden">
              <p><span className="font-bold">ರವಿ ಗೋಚಾರ:</span> ೩, ೬, ೧೦, ೧೧ನೇ ಸ್ಥಾನಗಳಲ್ಲಿ ಶುಭಫಲಪ್ರದ (ಆರೋಗ್ಯ, ಅಧಿಕಾರ ಲಾಭ). ಇತರ ಸ್ಥಾನಗಳಲ್ಲಿ ಅಶುಭ.</p>
              <p><span className="font-bold">ಚಂದ್ರ ಗೋಚಾರ:</span> ೧, ೩, ೬, ೭, ೧೦, ೧೧ನೇ ಸ್ಥಾನಗಳಲ್ಲಿ ಶುಭ (ಮನಸ್ಸಿಗೆ ಉಲ್ಲಾಸ, ಧನಾಗಮನ).</p>
              <p><span className="font-bold">ಕುಜ ಗೋಚಾರ:</span> ೩, ೬, ೧೧ನೇ ಸ್ಥಾನಗಳಲ್ಲಿ ವಿಜಯ, ಭೂಲಾಭ. ಉಳಿದೆಡೆ ಕಲಹ ಭೀತಿ.</p>
              <p><span className="font-bold">ಗುರು ಗೋಚಾರ:</span> ೨, ೫, ೭, ೯, ೧೧ನೇ ಸ್ಥಾನಗಳಲ್ಲಿ ಅತ್ಯಂತ ಶುಭ (ಪುತ್ರಲಾಭ, ಗೌರವ, ಕಂಕಣಭಾಗ್ಯ).</p>
              <p><span className="font-bold">ಶನಿ ಗೋಚಾರ:</span> ೩, ೬, ೧೧ನೇ ಸ್ಥಾನಗಳಲ್ಲಿ ಶುಭ. ಜನ್ಮ, ದ್ವಿತೀಯ, ದ್ವಾದಶಗಳಲ್ಲಿ ಸಾಡೇಸಾತಿ ಪ್ರಭಾವ.</p>
            </div>

            {/* Bottom Ad: Shradha Bhavanam Subraya Shastri */}
            <div className="border border-black p-1.5 bg-slate-50 text-center mt-1">
              <div className="font-bold text-[10px]">ಶ್ರಾದ್ಧಭವನಮ್ • ಸುಬ್ರಾಯ ಶಾಸ್ತ್ರಿ, ಲಕ್ಕಿಸವಲು</div>
              <div className="text-[8.5px] text-slate-700">ಸಕಲ ಪಿತೃಕಾರ್ಯಗಳು, ನಾರಾಯಣಬಲಿ, ತಿಲಹೋಮ ವೈದಿಕ ಸಂಪ್ರದಾಯದಂತೆ ನಿರ್ವಹಣೆ | ಮೊ: 9481051429</div>
            </div>
          </div>
        </div>

        <div className="border-t border-black pt-1 text-[9px] text-center font-sans font-bold text-slate-700 mt-1">
          ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೨೭
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 28: ASHOUCHA NIRNAYA (PART 1) */
export const Page28AshouchaNirnayaPart1: React.FC<PageTemplateProps> = ({ meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={28}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಆಶೌಚ ನಿರ್ಣಯ (ಭಾಗ ೧) • ಜನನ ಹಾಗೂ ಮರಣ ಸಂದರ್ಭದಲ್ಲಿ ತಿಳಿಯತಕ್ಕ ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳು
        </div>

        <div className="flex-1 border border-black p-2.5 font-serif flex flex-col justify-between text-[9.5px] leading-relaxed text-justify">
          <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden border-b border-black/30 pb-1">
            <div className="space-y-1.5 pr-2 border-r border-black/30">
              <p>
                <span className="font-bold">೧) ಸ್ವಕೀಯರು & ಪರಕೀಯರು:</span> ತಂದೆ, ತಾಯಿ, ಅಜ್ಜ, ಅಜ್ಜಿ, ಸಹೋದರರು, ಚಿಕ್ಕಪ್ಪ, ದೊಡ್ಡಪ್ಪ ಹಾಗೂ ಇವರ ಪತ್ನಿ-ಮಕ್ಕಳು, ತನ್ನ ಹೆಂಡತಿ, ಮಗ, ಮೊಮ್ಮಗ ಇವರೆಲ್ಲರೂ ಸ್ವಕೀಯರು. ಇವರ ಆಶೌಚವು ಆಯಾ ಕಾಲ ಮುಗಿದಾಗಲೇ ನಿವೃತ್ತಿಯಾಗುವುದು.
              </p>
              <p>
                <span className="font-bold">೨) ಸಪಿಂಡರು (೭ ತಲೆಮಾರು):</span> ತಂದೆ, ಅಜ್ಜ, ಮುತ್ತಜ್ಜ ಹಾಗೂ ಆ ಮುತ್ತಜ್ಜನ ತಂದೆ, ಅಜ್ಜ, ಮುತ್ತಜ್ಜ ಹೀಗೆ ಒಟ್ಟು ಆರು ಜನರು ಮತ್ತು ಪಿಂಡ ಕೊಡುವ ಪುರುಷನೂ ಸೇರಿ ಏಳು ತಲೆಮಾರಿನವರು ಸಪಿಂಡರು. ಇವರಿಗೆ ಪೂರ್ಣ ೧೦ ದಿನಗಳ ಆಶೌಚವಿರುತ್ತದೆ.
              </p>
              <p>
                <span className="font-bold">೩) ಸೋದಕರು (೮ ರಿಂದ ೧೪ ತಲೆಮಾರು):</span> ಎಂಟನೆಯ ತಲೆಮಾರಿನಿಂದ ಹದಿನಾಲ್ಕನೆಯ ತಲೆಮಾರಿನವರೆಗಿನ ಜ್ಞಾತಿಗಳು ಸೋದಕರು. ಇವರಿಗೆ ೩ ದಿನಗಳ ಆಶೌಚ (ತ್ರ್ಯಾಹಿಕರು).
              </p>
              <p>
                <span className="font-bold">೪) ಸಗೋತ್ರರು (೧೫ ರಿಂದ ೨೧ ತಲೆಮಾರು):</span> ಹದಿನೈದನೆಯ ತಲೆಮಾರಿನಿಂದ ಇಪ್ಪತ್ತೊಂದನೆಯ ತಲೆಮಾರಿನವರು ಸಗೋತ್ರರು. ಇವರಿಗೆ ಕೇವಲ ೧ ದಿನದ ಆಶೌಚ (ಏಕಾಹಿಕರು).
              </p>
              <p>
                <span className="font-bold">೫) ಗರ್ಭಸ್ರಾವ ನಿಯಮ:</span> ಗರ್ಭಿಣಿಗೆ ನಾಲ್ಕನೆಯ ತಿಂಗಳಲ್ಲಿ ಗರ್ಭಸ್ರಾವವಾದರೆ ತಾಯಿಗೆ ೪ ದಿನ ಆಶೌಚ, ತಂದೆಗೆ ಸ್ನಾನದಿಂದಲೇ ಶುದ್ಧಿ. ಐದನೇ ತಿಂಗಳಾದರೆ ೫ ದಿನ, ಆರನೇ ತಿಂಗಳಾದರೆ ೬ ದಿನ ಆಶೌಚ.
              </p>
            </div>

            <div className="space-y-1.5 pl-2">
              <p>
                <span className="font-bold">೬) ಜನನಾಶೌಚ (ವೃದ್ಧಿ ಸೂತಕ):</span> ಮಗು ಜನಿಸಿದಾಗ ಸಪಿಂಡರಿಗೆಲ್ಲ ೧೦ ದಿನ ಆಶೌಚ. ತಂದೆಗೆ ಸ್ನಾನ ಮಾಡಿದ ತಕ್ಷಣ ಜಾಕರ್ಮ ಮಾಡಲು ಅಧಿಕಾರವಿದೆ.
              </p>
              <p>
                <span className="font-bold">೭) ಉಪನಯನ ಪೂರ್ವ ಮರಣ:</span> ಚೌಲಕರ್ಮವಾಗದ ಮಗು ತೀರಿಕೊಂಡರೆ ಸಪಿಂಡರಿಗೆ ಸ್ನಾನದಿಂದಲೇ ಶುದ್ಧಿ. ಚೌಲವಾದ ನಂತರ ಉಪನಯನದ ಮೊದಲು ಮೃತರಾದರೆ ೩ ದಿನ ಆಶೌಚ.
              </p>
              <p>
                <span className="font-bold">೮) ಉಪನೀತ ಮರಣ:</span> ಉಪನಯನವಾದ ಪುರುಷನು ಮರಣ ಹೊಂದಿದರೆ ಸಮಸ್ತ ಸಪಿಂಡರಿಗೂ ಪೂರ್ಣ ೧೦ ದಿನಗಳ ಆಶೌಚ ಪ್ರಾಪ್ತವಾಗುತ್ತದೆ.
              </p>
              <p>
                <span className="font-bold">೯) ದೂರದೇಶ ಮರಣ ಸಮಾಚಾರ:</span> ೧೦ ದಿನಗಳೊಳಗೆ ಮರಣ ವಾರ್ತೆ ಕೇಳಿದರೆ ಉಳಿದ ದಿನಗಳನ್ನು ಆಚರಿಸಬೇಕು. ೧೦ ದಿನಗಳ ನಂತರ ಆದರೆ ೩ ದಿನ ಆಶೌಚ. ೧ ವರ್ಷದ ನಂತರ ಕೇಳಿದರೆ ಸ್ನಾನದಿಂದಲೇ ಶುದ್ಧಿ.
              </p>
              <p>
                <span className="font-bold">೧೦) ದತ್ತು ಪುತ್ರ ನಿಯಮ:</span> ದತ್ತು ಹೋದ ಪುತ್ರನಿಗೆ ಜನಕ ಮತ್ತು ಪೋಷಕ ಉಭಯ ವಂಶಗಳಲ್ಲಿಯೂ ತ್ರಿರಾತ್ರಾಶೌಚವಿರುತ್ತದೆ.
              </p>
            </div>
          </div>

          <div className="pt-1 text-[9px] text-center font-sans font-bold text-slate-700">
            ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೨೮
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 29: ASHOUCHA NIRNAYA (PART 2) */
export const Page29AshouchaNirnayaPart2: React.FC<PageTemplateProps> = ({ meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={29}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಆಶೌಚ ನಿರ್ಣಯ (ಭಾಗ ೨) • ಸ್ತ್ರೀಯರ ಆಶೌಚ, ವಿವಾಹ ಹಾಗೂ ಸಂಬಂಧಿಕರ ನಿಯಮಗಳು
        </div>

        <div className="flex-1 border border-black p-2.5 font-serif flex flex-col justify-between text-[9.5px] leading-relaxed text-justify">
          <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden border-b border-black/30 pb-1">
            <div className="space-y-1.5 pr-2 border-r border-black/30">
              <p>
                <span className="font-bold">೧೧) ಕನ್ಯಾ ಮರಣ ಆಶೌಚ:</span> ನಾಮಕರಣದ ನಂತರ ವಾಗ್ಧಾನದ ಮೊದಲು ಕನ್ಯೆಯು ಮೃತಪಟ್ಟರೆ ಜ್ಞಾತಿಗಳಿಗೆ ೧ ದಿನ ಆಶೌಚ. ವಾಗ್ಧಾನದ ನಂತರ ವಿವಾಹ ಪೂರ್ವ ಮೃತಪಟ್ಟರೆ ೩ ದಿನ ಆಶೌಚ.
              </p>
              <p>
                <span className="font-bold">೧೨) ವಿವಾಹಿತ ಕನ್ಯೆಯ ಮರಣ:</span> ವಿವಾಹವಾದ ಸ್ತ್ರೀಯು ಮೃತಪಟ್ಟರೆ ಆಕೆಯ ತಂದೆ-ತಾಯಿ ಮತ್ತು ಸಹೋದರರಿಗೆ ೩ ದಿನ ಆಶೌಚ. ಪತಿಯ ವಂಶದ ಸಪಿಂಡರಿಗೆ ಪೂರ್ಣ ೧೦ ದಿನ ಆಶೌಚ.
              </p>
              <p>
                <span className="font-bold">೧೩) ತವರು ಮನೆಯಲ್ಲಿ ಪ್ರಸವ:</span> ಮಗಳು ತವರು ಮನೆಯಲ್ಲಿ ಹೆರಿಗೆಯಾದರೆ ಆಕೆಯ ತಂದೆ, ತಾಯಿ ಹಾಗೂ ಸಹೋದರರಿಗೆ ೩ ದಿನ ಆಶೌಚ. ಬೇರೆ ಕಡೆ ಹೆರಿಗೆಯಾದರೆ ತಂದೆ-ತಾಯಿಗೆ ಆಶೌಚವಿಲ್ಲ (ಸ್ನಾನ ಮಾತ್ರ).
              </p>
              <p>
                <span className="font-bold">೧೪) ಸೋದರಮಾವ ಹಾಗೂ ಅಳಿಯ:</span> ಸೋದರಮಾವ ಮೃತನಾದರೆ ಸೋದರಳಿಯನಿಗೆ ೩ ದಿನ ಆಶೌಚ. ಅಳಿಯ ಮೃತನಾದರೆ ಅತ್ತೆ-ಮಾವಂದಿರಿಗೆ ಸ್ನಾನದಿಂದಲೇ ಶುದ್ಧಿ.
              </p>
            </div>

            <div className="space-y-1.5 pl-2">
              <p>
                <span className="font-bold">೧೫) ಗುರು-ಶಿಷ್ಯ ಮರಣ:</span> ವೇದೋಪದೇಶ ಮಾಡಿದ ಗುರುಗಳು, ಗುರುಪತ್ನಿ, ಗುರುಪುತ್ರರು ಮೃತರಾದರೆ ಶಿಷ್ಯನಿಗೆ ೩ ದಿನ ಆಶೌಚ. ಶಿಷ್ಯನು ಮೃತನಾದರೆ ಗುರುವಿಗೆ ಸ್ನಾನ ಮಾತ್ರ.
              </p>
              <p>
                <span className="font-bold">೧೬) ಸೂತಕದಲ್ಲಿ ಸಂಧ್ಯಾ ವಂದನೆ:</span> ಆಶೌಚ ಕಾಲದಲ್ಲಿ ಋಗ್ವೇದಿಗಳು ಹಾಗೂ ಯಜುರ್ವೇದಿಗಳು ಮಾನಸಿಕವಾಗಿ ಮಾತ್ರ ಗಾಯತ್ರಿ ಜಪ ಮಾಡಬೇಕು (ಅರ್ಘ್ಯಪ್ರದಾನ ಮಾತ್ರ, ಪ್ರಾಣಾಯಾಮ ಮಂತ್ರೋಚ್ಛಾರವಿಲ್ಲ).
              </p>
              <p>
                <span className="font-bold">೧೭) ದೇವತಾ ಪೂಜೆ & ಶ್ರಾದ್ಧ:</span> ಆಶೌಚ ಕಾಲದಲ್ಲಿ ಮನೆಯಲ್ಲಿ ಸಾಲಿಗ್ರಾಮ ಪೂಜೆ ಹಾಗೂ ನಿತ್ಯ ದೇವರ ಪೂಜೆಯನ್ನು ಅನ್ಯರ ಮೂಲಕ ಮಾಡಿಸಬೇಕು. ನೈವೇದ್ಯವನ್ನು ಹಣ್ಣು-ಹಾಲುಗಳಿಂದ ಸಮರ್ಪಿಸುವುದು.
              </p>
              <p>
                <span className="font-bold">೧೮) ಆಶೌಚ ಸಂಕರ (ಎರಡು ಆಶೌಚಗಳು ಒಟ್ಟಿಗೆ ಬಂದರೆ):</span> ಗುರುತರವಾದ ಆಶೌಚದಿಂದ ಲಘುತರ ಆಶೌಚವು ಮುಕ್ತಾಯವಾಗುತ್ತದೆ. ೧೦ ದಿನದ ಆಶೌಚವಿರುವಾಗ ೩ ದಿನದ ಆಶೌಚ ಬಂದರೆ ಪ್ರತ್ಯೇಕ ಆಚರಣೆ ಬೇಕಿಲ್ಲ.
              </p>
            </div>
          </div>

          <div className="pt-1 text-[9px] text-center font-sans font-bold text-slate-700">
            ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೨೯
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* PAGE 30: VRISHTYADI NIRDESHYA PHALAM & CHITRAPUR MATHA FESTIVALS */
export const Page30VrishtiNirdeshyaAndChitrapurFestivals: React.FC<PageTemplateProps> = ({ meta }) => {
  const chitrapurFestivals = [
    { no: "೧", m: "ಚೈತ್ರ ಶುಕ್ಲ ೯", w: "ಭಾನುವಾರ", f: "ಶ್ರೀ ರಾಮನವಮೀ ಉತ್ಸವ ಹಾಗೂ ರಥೋತ್ಸವ" },
    { no: "೨", m: "ವೈಶಾಖ ಶುಕ್ಲ ೩", w: "ಬುಧವಾರ", f: "ಅಕ್ಷಯ ತೃತೀಯಾ, ಶ್ರೀ ಶಂಕರಾಚಾರ್ಯ ಜಯಂತಿ" },
    { no: "೩", m: "ಆಷಾಢ ಹುಣ್ಣಿಮೆ", w: "ಗುರುವಾರ", f: "ಗುರುಪೂರ್ಣಿಮಾ, ಚಾತುರ್ಮಾಸ್ಯ ವ್ರತಾರಂಭ" },
    { no: "೪", m: "ಶ್ರಾವಣ ಬಹುಳ ೮", w: "ಬುಧವಾರ", f: "ಶ್ರೀ ಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮೀ, ಮೊಸರುಕುಡಿಕೆ ಉತ್ಸವ" },
    { no: "೫", m: "ಭಾದ್ರಪದ ಶುಕ್ಲ ೪", w: "ಶುಕ್ರವಾರ", f: "ಶ್ರೀ ವಿನಾಯಕ ಚತುರ್ಥೀ ಮಹೋತ್ಸವ" },
    { no: "೬", m: "ಆಶ್ವಯುಜ ಶುಕ್ಲ ೧೦", w: "ಸೋಮವಾರ", f: "ವಿಜಯದಶಮೀ, ಶಮೀಪೂಜೆ, ವಿದ್ಯಾಪ್ರವೇಶ" },
    { no: "೭", m: "ಕಾರ್ತಿಕ ಹುಣ್ಣಿಮೆ", w: "ಶನಿವಾರ", f: "ಕಾರ್ತಿಕ ದೀಪೋತ್ಸವ, ಲಕ್ಷದೀಪೋತ್ಸವ" },
    { no: "೮", m: "ಫಾಲ್ಗುಣ ಶುಕ್ಲ ೧೪", w: "ಭಾನುವಾರ", f: "ಹೋಲಿಕಾ ಕಾಮದಹನ, ವಾರ್ಷಿಕ ಸಂವತ್ಸರೋತ್ಸವ" }
  ];

  return (
    <BaggonaLandscapeFrame pageNumber={30}>
      <div className="h-full flex flex-col justify-between p-2 text-black">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2 tracking-wide">
          ಅಥ ವೃಷ್ಟ್ಯಾದಿ ನಿರ್ದೇಶ್ಯಫಲಂ • ಶ್ರೀ ಚಿತ್ರಾಪುರ ಮಠ ಶಿರಾಲಿಯಲ್ಲಿ ನಡೆಯುವ ವಿಶೇಷ ಹಬ್ಬಗಳು
        </div>

        <div className="flex-1 border border-black p-2 font-serif flex gap-3 overflow-hidden text-[9.5px]">
          {/* Left Column: Vrishtyadi Nirdeshya Phalam */}
          <div className="w-[45%] border-r border-black/40 pr-3 flex flex-col justify-between">
            <div className="font-black text-[11px] border-b border-black pb-1 mb-1 text-center bg-slate-100 p-0.5">
              ಅಥ ವೃಷ್ಟ್ಯಾದಿ ಉತ್ಪತ್ತಿ-ವ್ಯಯ ಸೂಚ್ಯಂಕ ಪ್ರಮಾಣ
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[9.5px] border border-black p-2 bg-slate-50 flex-1">
              <div className="border-b border-black/30 pb-0.5"><span className="font-bold">ವರ್ಷಾ ಪ್ರಮಾಣ:</span> ೧೧</div>
              <div className="border-b border-black/30 pb-0.5"><span className="font-bold">ವ್ಯಯ ಪ್ರಮಾಣ:</span> ೧೧</div>
              <div className="border-b border-black/30 pb-0.5"><span className="font-bold">ಧಾನ್ಯ ಉತ್ಪತ್ತಿ:</span> ೧೧</div>
              <div className="border-b border-black/30 pb-0.5"><span className="font-bold">ರಸೋತ್ಪತ್ತಿ:</span> ೦೬</div>
              <div className="border-b border-black/30 pb-0.5"><span className="font-bold">ಪನಸ (ಹಲಸು):</span> ೦೭</div>
              <div className="border-b border-black/30 pb-0.5"><span className="font-bold">ನಾಳಿಕೇರ (ತೆಂಗು):</span> ೦೭</div>
              <div className="border-b border-black/30 pb-0.5"><span className="font-bold">ಶೀತ ಮಾರುತ:</span> ೦೫</div>
              <div className="border-b border-black/30 pb-0.5"><span className="font-bold">ಫಲೋತ್ಪತ್ತಿ:</span> ೦೯</div>
              <div><span className="font-bold">ಪೂಗ (ಅಡಿಕೆ):</span> ೧೨</div>
              <div><span className="font-bold">ಗೋರಕ್ಷಾ:</span> ೦೮</div>
            </div>
            <div className="border border-black p-1 bg-white text-[8.5px] leading-relaxed mt-1">
              <span className="font-bold">ಭೂಕಂಪ & ವಾಯುಗುಣ:</span> ಭೂಮಿ ಭಾಗದಲ್ಲಿ ೪ ಆಢಕ ಮಳೆ ಇರುವುದರಿಂದ ಕರಾವಳಿ ಹಾಗೂ ಮಲೆನಾಡಿನಲ್ಲಿ ಅಡಿಕೆ, ಭತ್ತ ಸಮೃದ್ಧ. ಪ್ರಕೃತಿ ಪ್ರಕೋಪ ನಿಯಂತ್ರಣದಲ್ಲಿದೆ.
            </div>
          </div>

          {/* Right Column: Chitrapur Matha Festivals */}
          <div className="w-[55%] flex flex-col justify-between">
            <div className="font-black text-[11px] border-b border-black pb-1 mb-1 text-center bg-slate-100 p-0.5">
              ಶ್ರೀ ಶಾ. ಶಕೆ {meta.shakaYear} {meta.samvatsaraKn} ಸಂ. ಶ್ರೀ ಚಿತ್ರಾಪುರ ಮಠ ಶಿರಾಲಿಯ ಉತ್ಸವಗಳು
            </div>
            <div className="border border-black flex-1 overflow-hidden">
              <table className="w-full text-[9px] border-collapse text-center h-full">
                <thead>
                  <tr className="bg-black text-white font-bold">
                    <th className="p-1 border-r border-white/40 w-[20px]">ಕ್ರ.ಸಂ.</th>
                    <th className="p-1 border-r border-white/40">ತಿಥಿ/ಮಾಸ</th>
                    <th className="p-1 border-r border-white/40">ವಾರ</th>
                    <th className="p-1 text-left px-2">ವಿಶೇಷ ಉತ್ಸವ ವಿವರ</th>
                  </tr>
                </thead>
                <tbody>
                  {chitrapurFestivals.map((f, i) => (
                    <tr key={f.no} className={`border-b border-black/30 ${i % 2 === 1 ? "bg-slate-50" : ""}`}>
                      <td className="border-r border-black p-0.5 font-bold font-mono">{f.no}</td>
                      <td className="border-r border-black p-0.5">{f.m}</td>
                      <td className="border-r border-black p-0.5 font-bold">{f.w}</td>
                      <td className="p-0.5 text-left px-2">{f.f}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="border-t border-black pt-1 text-[9px] text-center font-sans font-bold text-slate-700 mt-1">
          ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear} • ಪುಟ ೩೦
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};


/* -------------------------------------------------------------------------- */
/* PAGES 40–91: MONTHLY PANCHANGA DUAL-PAGE SPREADS (52 PAGES)                */
/* -------------------------------------------------------------------------- */

export const PagePanchangaLeft: React.FC<PageTemplateProps> = ({ page, meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={page.pageNumber}>
      <div className="h-full flex flex-col justify-between text-[8.5px] leading-tight">
        {/* Top Header */}
        <div className="bg-black text-white px-2 py-0.5 flex justify-between items-center text-[10.5px] font-black">
          <span>ಸೌರ: ಮೇಷ ಮಾಸ</span>
          <span>ಶ್ರೀ ಶಾ ಗತಶಕೆ {meta.shakaYear} {meta.samvatsaraKn} ಸಂವತ್ಸರಸ್ಯ ಚೈತ್ರ ಶುಕ್ಲ ಪಕ್ಷಃ ವಸಂತಋತುಃ (ಏಪ್ರಿಲ್–೨೦೨೬) ಉತ್ತರಾಯಣಂ</span>
          <span>ದಿನಮಾನ: ೩೦ ಘಟಿ</span>
        </div>

        {/* 10-Column Daily Panchanga Table */}
        <div className="border border-black flex-1 overflow-hidden my-1">
          <table className="w-full border-collapse text-[8px] text-center">
            <thead>
              <tr className="border-b border-black font-black bg-slate-100">
                <th className="border-r border-black p-[1px] w-[22px]">ತೇ</th>
                <th className="border-r border-black p-[1px] w-[22px]">ದಿ</th>
                <th className="border-r border-black p-[1px] text-left px-1">ತಿಥಿವಾಸರೌ</th>
                <th className="border-r border-black p-[1px] w-[45px]">ಘಂ.ಮಿ. ಮುಕ್ತಾಯ</th>
                <th className="border-r border-black p-[1px]">ರವಿನಕ್ಷತ್ರ</th>
                <th className="border-r border-black p-[1px]">ಚಂದ್ರನಕ್ಷತ್ರ</th>
                <th className="border-r border-black p-[1px] w-[45px]">ಘಂ.ಮಿ. ಮುಕ್ತಾಯ</th>
                <th className="border-r border-black p-[1px]">ಯೋಗ</th>
                <th className="border-r border-black p-[1px]">ಕರಣ</th>
                <th className="border-r border-black p-[1px] w-[60px]">ಶ್ರಾದ್ಧತಿಥಿ & ಹಬ್ಬಗಳು</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 15 }).map((_, idx) => (
                <tr key={idx} className="border-b border-black/30 hover:bg-slate-50">
                  <td className="border-r border-black p-[1px] font-bold font-mono">{idx + 1}</td>
                  <td className="border-r border-black p-[1px] font-bold">{idx + 1}</td>
                  <td className="border-r border-black p-[1px] text-left px-1 font-bold">ಶುಕ್ಲ {idx + 1}</td>
                  <td className="border-r border-black p-[1px] font-mono">28/52</td>
                  <td className="border-r border-black p-[1px]">ಅಶ್ವಿನಿ ೧</td>
                  <td className="border-r border-black p-[1px]">ರೇವತಿ ೪</td>
                  <td className="border-r border-black p-[1px] font-mono">14/30</td>
                  <td className="border-r border-black p-[1px]">ವಿಷ್ಕಂಭ</td>
                  <td className="border-r border-black p-[1px]">ಬವ</td>
                  <td className="border-r border-black p-[1px] text-left px-1 truncate">
                    {idx === 0 ? "ಯುಗಾದಿ ಹಬ್ಬ, ವಸಂತ ನವರಾತ್ರಿ ಆರಂಭ" : idx === 8 ? "ಶ್ರೀ ರಾಮನವಮಿ" : "ಸಾಮಾನ್ಯ ದಿನ"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Section: Month-End Graha Chakra & Degrees Table */}
        <div className="border border-black p-1.5 flex flex-row justify-between items-center gap-2 bg-slate-50">
          <div className="w-[35%] border border-black p-1 bg-white text-center">
            <div className="font-black text-[9px] border-b border-black pb-0.5">
              ಮಾಸಾಂತ ಸೂರ್ಯೋದಯ ಕಾಲದ ಗ್ರಹಕುಂಡಲಿ
            </div>
            <div className="grid grid-cols-4 gap-0.5 p-1 text-[7.5px] font-mono font-bold">
              <div className="border border-black p-1">ಮೀನ: ರವಿ, ಬುಧ</div>
              <div className="border border-black p-1">ಮೇಷ: ಶುಕ್ರ</div>
              <div className="border border-black p-1">ವೃಷಭ: ಚಂದ್ರ</div>
              <div className="border border-black p-1">ಮಿಥುನ: ಗುರು</div>
              <div className="border border-black p-1">ಕುಂಭ: ಶನಿ</div>
              <div className="border border-black p-1 col-span-2 bg-black text-white font-black flex items-center justify-center">
                ಗ್ರಹಚಕ್ರಂ
              </div>
              <div className="border border-black p-1">ಕಟಕ: ─</div>
              <div className="border border-black p-1">ಮಕರ: ಕುಜ</div>
              <div className="border border-black p-1">ಧನು: ಕೇತು</div>
              <div className="border border-black p-1">ವೃಶ್ಚಿಕ: ─</div>
              <div className="border border-black p-1">ಕನ್ಯಾ: ರಾಹು</div>
            </div>
          </div>

          <div className="flex-1 text-[8.5px] font-serif leading-tight">
            <div className="font-bold border-b border-black pb-0.5">
              ವಿಶೇಷ ಪರ್ವಕಾಲ & ಮಾಸಿಕ ಟಿಪ್ಪಣಿಗಳು:
            </div>
            <p className="mt-1">
              ಅಯನಾಂಶಃ ೨೪°/೧೩'/೨೮" • ಚೈತ್ರ ಶುಕ್ಲ ಪಾಡ್ಯಮಿ ಯುಗಾದಿ ಹಬ್ಬದಂದು ನೂತನ ವತ್ಸರಾರಂಭ, ಪಂಚಾಂಗ ಶ್ರವಣ.
            </p>
            <p className="mt-0.5">
              ಶ್ರೀ ರಾಮನವಮಿ ವ್ರತ, ಹನುಮಜ್ಜಯಂತಿ ಮಹೋತ್ಸವ ಮತ್ತು ವಸಂತ ನವರಾತ್ರಿ ಪೂರ್ಣಾಹುತಿ.
            </p>
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

export const PagePanchangaRight: React.FC<PageTemplateProps> = ({ page, meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={page.pageNumber}>
      <div className="h-full flex flex-col justify-between text-[8.5px] leading-tight">
        {/* Top Header */}
        <div className="bg-black text-white text-center py-0.5 font-black text-[10.5px]">
          ಶ್ರೀ ಶಾ ಗತಶಕೆ {meta.shakaYear} {meta.samvatsaraKn} ಸಂವತ್ಸರಸ್ಯ ಚೈತ್ರ ಶುಕ್ಲ ಗೋಕರ್ಣ ಸೂರ್ಯೋದಯ ಕಾಲದ ಗ್ರಹಗಳ ನಕ್ಷತ್ರಚರಣ ಮುಕ್ತಾಯದ ಘಂ.ಮಿನಿಟು.ರಾಶಿ ನವಾಂಶ
        </div>

        {/* Top Table: Daily Planetary Coordinates */}
        <div className="border border-black overflow-hidden my-1">
          <table className="w-full border-collapse text-[7.8px] text-center">
            <thead>
              <tr className="border-b border-black font-black bg-slate-100">
                <th className="border-r border-black p-[1px]">ತಾ.</th>
                <th className="border-r border-black p-[1px]">ರವಿ</th>
                <th className="border-r border-black p-[1px]">ಕುಜ</th>
                <th className="border-r border-black p-[1px]">ಬುಧ</th>
                <th className="border-r border-black p-[1px]">ಗುರು</th>
                <th className="border-r border-black p-[1px]">ಶುಕ್ರ</th>
                <th className="border-r border-black p-[1px]">ಶನಿ</th>
                <th className="p-[1px]">ರಾಹು</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, idx) => (
                <tr key={idx} className="border-b border-black/30">
                  <td className="border-r border-black p-[1px] font-mono font-bold">{idx + 19}</td>
                  <td className="border-r border-black p-[1px]">ಮೀನ ೪</td>
                  <td className="border-r border-black p-[1px]">ಕುಂಭ ೨</td>
                  <td className="border-r border-black p-[1px]">ಕುಂಭ ೧</td>
                  <td className="border-r border-black p-[1px]">ಮಿಥುನ ೩</td>
                  <td className="border-r border-black p-[1px]">ಮೀನ ೧</td>
                  <td className="border-r border-black p-[1px]">ಮೀನ ೨</td>
                  <td className="p-[1px]">ಕುಂಭ ೧</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Middle Table: 12 Dina Lagna Ending times */}
        <div className="border border-black overflow-hidden my-1">
          <div className="bg-black text-white text-center font-black p-[2px] text-[9.5px]">
            ದಿವಾ ಲಗ್ನಗಳ ಸಮಾಪ್ತಿ ಕಾಲದ ಘಂಟೆ. ಮಿನಿಟು (Gokarna Oblique Ascensions)
          </div>
          <div className="grid grid-cols-6 gap-1 p-1 text-[8px] font-mono text-center">
            {GOKARNA_RASHI_MANA_GHATI.map((r) => (
              <div key={r.rashiKn} className="border border-black p-0.5 bg-slate-50">
                <span className="font-bold block">{r.rashiKn} ಲಗ್ನ:</span>
                <span>{r.ghati}ಘ {r.vighati}ವಿ</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Table: Chandra Pada Endings */}
        <div className="border border-black p-1 bg-slate-50 text-[8px]">
          <div className="font-black border-b border-black pb-0.5 text-center">
            ಚಂದ್ರ ನಕ್ಷತ್ರ ಚರಣ ಸಮಾಪ್ತಿಯ ಘಂಟೆ. ಮಿನಿಟು
          </div>
          <div className="grid grid-cols-4 gap-2 pt-0.5 text-center font-mono">
            <div>೧ನೇ ಪಾದ: ೧೧:೧೭</div>
            <div>೨ನೇ ಪಾದ: ೧೬:೩೪</div>
            <div>೩ನೇ ಪಾದ: ೨೧:೫೨</div>
            <div>೪ನೇ ಪಾದ: ೨೭:೧೦</div>
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* PAGES 92–104: JATAKA, MUHURTAS & CONCLUDING APPENDICES                     */
/* -------------------------------------------------------------------------- */

export const PageGenericAppendix: React.FC<PageTemplateProps> = ({ page, meta }) => {
  return (
    <BaggonaLandscapeFrame pageNumber={page.pageNumber}>
      <div className="h-full flex flex-col justify-between p-2">
        <div className="bg-black text-white text-center py-1 font-black text-[13px] mb-2">
          {page.titleKn}
        </div>

        <div className="flex-1 border border-black p-3 font-serif flex flex-col justify-between text-[11px] leading-relaxed">
          <div className="border-b border-black pb-2 mb-2 flex justify-between items-center">
            <span className="font-black text-[14px]">ವಿಭಾಗ: {page.sectionCategory}</span>
            <span className="text-[11px] font-mono font-bold bg-slate-100 px-2 py-0.5 border border-black">
              ಶ್ರೀ {meta.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {meta.shakaYear}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
            <div className="text-4xl">📜</div>
            <h3 className="text-base font-black">{page.titleKn}</h3>
            <p className="text-xs max-w-xl leading-normal text-slate-700">
              ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ೧೦೪ ಪುಟಗಳ ಅಧಿಕೃತ ಮುದ್ರಣ ಪ್ರತಿಯ ವಿನ್ಯಾಸ. ಶಾಸ್ತ್ರೋಕ್ತ ಕೋಷ್ಟಕಗಳು ಮತ್ತು ಪ್ರಮಾಣ ವಚನಗಳೊಂದಿಗೆ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.
            </p>
            <div className="border border-black px-4 py-1.5 text-[10px] font-mono font-bold bg-slate-50">
              ಪುಟ ಮಾದರಿ: {page.layoutTemplateId} • ಮುದ್ರಣ ಮಾನದಂಡ: A4 Landscape (297mm x 210mm)
            </div>
          </div>

          <div className="border-t border-black pt-1 text-[9.5px] text-center font-sans font-bold text-slate-700">
            ॥ ಶ್ರೀ ಕುಲದೇವತಾ ಪ್ರಸನ್ನ ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಪುಟ {page.pageNumber} / ೧೦೪
          </div>
        </div>
      </div>
    </BaggonaLandscapeFrame>
  );
};

/* -------------------------------------------------------------------------- */
/* UNIVERSAL 104-PAGE DISPATCHER & RENDERER                                   */
/* -------------------------------------------------------------------------- */

export const UniversalBaggonaPageRenderer: React.FC<{
  page: UniversalBookPageResponse;
  meta: SamvatsaraMetadata;
}> = ({ page, meta }) => {
  // Exact 1-to-1 page routing matching 104-page benchmark
  switch (page.pageNumber) {
    case 1:
      return <Page01Avataranike page={page} meta={meta} />;
    case 2:
      return <Page02GajananaStores page={page} meta={meta} />;
    case 3:
      return <Page03KrishnaPoojaBhandara page={page} meta={meta} />;
    case 4:
      return <Page04BangaramakkiFestivals page={page} meta={meta} />;
    case 5:
      return <Page05TSSJewellery page={page} meta={meta} />;
    case 6:
      return <Page06SwarnavalliFestivals page={page} meta={meta} />;
    case 7:
      return <Page07AnnapoorneshwariJyotishya page={page} meta={meta} />;
    case 8:
      return <Page08IdagunjiFestivals page={page} meta={meta} />;
    case 9:
      return <Page09PrastavaneAndShraddha page={page} meta={meta} />;
    case 10:
      return <Page10Shreemukha page={page} meta={meta} />;
    case 11:
      return <Page11SamvatsaraPhalashruti page={page} meta={meta} />;
    case 12:
      return <Page12SamvatsaraPhalam page={page} meta={meta} />;
    case 13:
      return <Page13AridraPraveshaRainfall page={page} meta={meta} />;
    case 14:
      return <Page14SankramanaMaudhyaEclipses page={page} meta={meta} />;
    case 15:
      return <Page15HaridasaAndBharathaBookDepot page={page} meta={meta} />;
    case 16:
      return <Page16HeritageSponsorAd page={page} meta={meta} />;
    case 17:
      return <Page17AuspiciousSubhaKaryagalu page={page} meta={meta} />;
    case 18:
      return <Page18AnnualFestivalsAndRamakrishnaStores page={page} meta={meta} />;
    case 19:
      return <Page19JatakaTatvagaluNavagraha page={page} meta={meta} />;
    case 20:
      return <Page20MeshaVrishabhaBhavishya page={page} meta={meta} />;
    case 21:
      return <Page21MithunaKarkatakaBhavishya page={page} meta={meta} />;
    case 22:
      return <Page22SimhaKanyaBhavishya page={page} meta={meta} />;
    case 23:
      return <Page23TulaVrishchikaBhavishya page={page} meta={meta} />;
    case 24:
      return <Page24DhanuMakaraBhavishya page={page} meta={meta} />;
    case 25:
      return <Page25KumbhaMeenaAndMemorial page={page} meta={meta} />;
    case 26:
      return <Page26KrishiAndGokarnaFestivals page={page} meta={meta} />;
    case 27:
      return <Page27ShivalikhitamAndGochara page={page} meta={meta} />;
    case 28:
      return <Page28AshouchaNirnayaPart1 page={page} meta={meta} />;
    case 29:
      return <Page29AshouchaNirnayaPart2 page={page} meta={meta} />;
    case 30:
      return <Page30VrishtiNirdeshyaAndChitrapurFestivals page={page} meta={meta} />;
    default:
      if (page.pageNumber >= meta.panchangaPageStart && page.pageNumber <= meta.panchangaPageEnd) {
        return page.pageNumber % 2 === 0 ? (
          <PagePanchangaLeft page={page} meta={meta} />
        ) : (
          <PagePanchangaRight page={page} meta={meta} />
        );
      }
      return <PageGenericAppendix page={page} meta={meta} />;
  }
};
