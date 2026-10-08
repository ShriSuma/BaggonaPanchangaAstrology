import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import type { SevaLang } from "../../features/seva/sevaLocale";
import {
  GUIDED_POOJA_KEYS,
  GUIDED_POOJAS,
  type GuidedPoojaKey
} from "../../features/pooja/guidedPoojaData";
import {
  GUIDED_VRATA_KEYS,
  GUIDED_VRATAS,
  type GuidedVrataKey
} from "../../features/pooja/guidedVrataData";
import {
  SANKALPA_PURPOSES,
  type SankalpaPurposeKey
} from "../../features/pooja/guidedSankalpaService";
import {
  generateGuidedPoojaShareUrl,
  type GuidedPoojaConfig
} from "../../features/pooja/guidedPoojaUrlService";

export interface GuidedPoojaConfiguratorProps {
  initialConfig?: Partial<GuidedPoojaConfig>;
  onApplyConfig: (config: GuidedPoojaConfig) => void;
  onCancel?: () => void;
}

const COMMON_GOTRAS = [
  "ಕಾಶ್ಯಪ", "ವಿಶ್ವಾಮಿತ್ರ", "ಭಾರದ್ವಾಜ", "ವಸಿಷ್ಠ", "ಗೌತಮ", "ಅಂಗಿರಸ", "ಕೌಂಡಿನ್ಯ", "ಜಾಮದಗ್ನಿ", "ಶ್ರೀವತ್ಸ", "ಹರಿತ"
];

export const GuidedPoojaConfigurator: React.FC<GuidedPoojaConfiguratorProps> = ({
  initialConfig,
  onApplyConfig,
  onCancel
}) => {
  const [selectedPoojaKeys, setSelectedPoojaKeys] = useState<GuidedPoojaKey[]>(() => {
    return initialConfig?.poojaKeys && initialConfig.poojaKeys.length > 0
      ? initialConfig.poojaKeys
      : [...GUIDED_POOJA_KEYS];
  });

  const [selectedVrataKeys, setSelectedVrataKeys] = useState<GuidedVrataKey[]>(() => {
    return initialConfig?.vrataKeys && initialConfig.vrataKeys.length > 0
      ? initialConfig.vrataKeys
      : [...GUIDED_VRATA_KEYS];
  });

  const [activeTab, setActiveTab] = useState<"poojas" | "vratas">(
    initialConfig?.activeCategory || "poojas"
  );

  const [sankalpaKey, setSankalpaKey] = useState<SankalpaPurposeKey>(
    initialConfig?.sankalpaKey || "kutumba"
  );
  const [customGoal, setCustomGoal] = useState<string>(
    initialConfig?.customGoal || ""
  );

  const [devoteeName, setDevoteeName] = useState<string>(() => initialConfig?.devoteeName || "ಭಕ್ತರು");
  const [gotra, setGotra] = useState<string>(() => initialConfig?.gotra || "ಕಾಶ್ಯಪ");
  const [priestName, setPriestName] = useState<string>(() => initialConfig?.priestName || "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
  const [lang, setLang] = useState<SevaLang>(() => initialConfig?.lang || "kn");

  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Re-generate share URL whenever parameters change
  useEffect(() => {
    const url = generateGuidedPoojaShareUrl({
      poojaKeys: selectedPoojaKeys,
      vrataKeys: selectedVrataKeys,
      activeCategory: activeTab,
      sankalpaKey,
      customGoal: sankalpaKey === "custom" ? customGoal : undefined,
      devoteeName,
      gotra,
      lang,
      priestName
    });
    setGeneratedUrl(url);

    // Generate dynamic QR Code for instant mobile scanning
    QRCode.toDataURL(url, {
      width: 180,
      margin: 1.5,
      color: { dark: "#78350F", light: "#FFFDF7" }
    })
      .then((qr) => setQrCodeDataUrl(qr))
      .catch((err) => console.warn("[GuidedPoojaConfigurator] QR error:", err));
  }, [selectedPoojaKeys, selectedVrataKeys, activeTab, sankalpaKey, customGoal, devoteeName, gotra, lang, priestName]);

  const handleTogglePooja = (key: GuidedPoojaKey) => {
    setSelectedPoojaKeys((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleToggleVrata = (key: GuidedVrataKey) => {
    setSelectedVrataKeys((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleSelectAllPoojas = () => {
    setSelectedPoojaKeys([...GUIDED_POOJA_KEYS]);
  };

  const handleSelectAllVratas = () => {
    setSelectedVrataKeys([...GUIDED_VRATA_KEYS]);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(generatedUrl);
      } else {
        const input = document.createElement("input");
        input.value = generatedUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.warn("Copy failed:", err);
    }
  };

  const handleShareWhatsApp = () => {
    const purpose = SANKALPA_PURPOSES[sankalpaKey]?.labelKn || "ಸಂಕಲ್ಪ ಸಿದ್ಧಿ";
    const text = `॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ · ಪೂಜಾ & ವ್ರತ ಮಾರ್ಗದರ್ಶನ ॥\n\nನಮಸ್ಕಾರ ${devoteeName},\nನಿಮಗಾಗಿ ಪುರೋಹಿತ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರು ನಿಗದಿಪಡಿಸಿದ ಪವಿತ್ರ ಸಂಕಲ್ಪ ("${purpose}") ಹಾಗೂ ಮಾರ್ಗದರ್ಶಿತ ಪೂಜಾ/ವ್ರತ ವಿಧಿಯ ಲಿಂಕ್ ಇಲ್ಲಿದೆ:\n\n${generatedUrl}\n\nಮನೆಯಲ್ಲೇ ಕುಳಿತು ಮಂತ್ರಗಳನ್ನು ಶ್ರವಣ ಮಾಡುತ್ತಾ ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಪೂಜೆ ನೆರವೇರಿಸಿ.`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  const handleApply = () => {
    onApplyConfig({
      poojaKeys: selectedPoojaKeys,
      vrataKeys: selectedVrataKeys,
      activeCategory: activeTab,
      sankalpaKey,
      customGoal: sankalpaKey === "custom" ? customGoal : undefined,
      devoteeName,
      gotra,
      lang,
      priestName
    });
  };

  return (
    <div className="max-w-md mx-auto bg-[#FFFDF7] border-2 border-amber-400/90 rounded-3xl p-4 shadow-xl text-amber-950 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          <div>
            <h2 className="text-base font-black text-amber-950 leading-tight">
              ಪೂಜಾ & ವ್ರತ ಸಂಯೋಜನೆ
            </h2>
            <p className="text-[11px] text-amber-800/80 font-medium">
              ಪುರೋಹಿತರು & ಭಕ್ತರಿಗೆ ವೈಯಕ್ತಿಕ ಮಾರ್ಗದರ್ಶನ ಲಿಂಕ್
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-amber-800 hover:bg-amber-100 text-sm font-bold"
            title="ಮುಚ್ಚಿ"
          >
            ✕
          </button>
        )}
      </div>

      {/* SANKALPA PURPOSE SELECTION (Marriage, Family, Exams, Career, Health, etc.) */}
      <div className="bg-[#FFFDF5] border border-amber-300 rounded-2xl p-3 shadow-xs flex flex-col gap-2">
        <label className="text-xs font-black text-amber-900 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span>🎯</span>
            <span>ವೈಯಕ್ತಿಕ ಸಂಕಲ್ಪದ ಉದ್ದೇಶ (Life Goal):</span>
          </span>
          <span className="text-[10px] text-amber-700 font-bold">
            {SANKALPA_PURPOSES[sankalpaKey].labelKn}
          </span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.values(SANKALPA_PURPOSES).map((p) => {
            const isSel = p.key === sankalpaKey;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setSankalpaKey(p.key)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-black text-left flex items-center gap-1.5 transition-all ${
                  isSel
                    ? "bg-amber-600 text-white shadow-xs ring-1 ring-amber-500 scale-[1.01]"
                    : "bg-white border border-amber-200 text-amber-950 hover:bg-amber-50"
                }`}
              >
                <span>{p.icon}</span>
                <span className="truncate">{p.labelKn}</span>
              </button>
            );
          })}
        </div>

        {sankalpaKey === "custom" && (
          <div className="mt-1">
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="ಭಕ್ತರ ನಿರ್ದಿಷ್ಟ ಇಷ್ಟಾರ್ಥ ಬರೆಯಿರಿ..."
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>
        )}
      </div>

      {/* RITUAL CATEGORY TABS (Poojas vs Vratas) */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-amber-100/70 border border-amber-300 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab("poojas")}
          className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "poojas"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-amber-900 hover:bg-amber-200/50"
          }`}
        >
          <span>🪔</span>
          <span>ನಿತ್ಯ ಪೂಜೆಗಳು ({selectedPoojaKeys.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vratas")}
          className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "vratas"
              ? "bg-pink-600 text-white shadow-sm"
              : "text-amber-900 hover:bg-amber-200/50"
          }`}
        >
          <span>🌸</span>
          <span>ಪುಣ್ಯ ವ್ರತಗಳು ({selectedVrataKeys.length})</span>
        </button>
      </div>

      {/* ACTIVE CATEGORY LIST CHECKBOXES */}
      {activeTab === "poojas" ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-900">
              ಪೂಜೆಗಳ ಪಟ್ಟಿ (ಕನಿಷ್ಠ ೧ ಆಯ್ಕೆಮಾಡಿ):
            </span>
            <button
              type="button"
              onClick={handleSelectAllPoojas}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-950 underline"
            >
              ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆಮಾಡಿ
            </button>
          </div>

          <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto no-scrollbar">
            {GUIDED_POOJA_KEYS.map((key) => {
              const item = GUIDED_POOJAS[key];
              const isChecked = selectedPoojaKeys.includes(key);
              return (
                <label
                  key={key}
                  className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all cursor-pointer ${
                    isChecked
                      ? "bg-[#FFFBEA] border-amber-400 text-amber-950 shadow-xs"
                      : "bg-white/70 border-amber-200/80 text-amber-800/80 hover:bg-amber-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleTogglePooja(key)}
                    className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span className="text-base">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black truncate">{item.titleKn}</div>
                    <div className="text-[10px] text-amber-700 truncate">{item.subtitleKn}</div>
                  </div>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded-full border border-amber-300">
                    {item.steps.length} ಹಂತ
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-pink-900">
              ವ್ರತಗಳ ಪಟ್ಟಿ (ಕನಿಷ್ಠ ೧ ಆಯ್ಕೆಮಾಡಿ):
            </span>
            <button
              type="button"
              onClick={handleSelectAllVratas}
              className="text-[11px] font-bold text-pink-700 hover:text-pink-950 underline"
            >
              ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆಮಾಡಿ
            </button>
          </div>

          <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto no-scrollbar">
            {GUIDED_VRATA_KEYS.map((key) => {
              const item = GUIDED_VRATAS[key];
              const isChecked = selectedVrataKeys.includes(key);
              return (
                <label
                  key={key}
                  className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all cursor-pointer ${
                    isChecked
                      ? "bg-pink-50/90 border-pink-400 text-pink-950 shadow-xs"
                      : "bg-white/70 border-amber-200/80 text-amber-800/80 hover:bg-pink-50/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleVrata(key)}
                    className="h-4 w-4 rounded text-pink-600 focus:ring-pink-500 accent-pink-600"
                  />
                  <span className="text-base">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black truncate">{item.titleKn}</div>
                    <div className="text-[10px] text-pink-800 truncate">{item.subtitleKn}</div>
                  </div>
                  <span className="text-[10px] font-black text-pink-700 bg-pink-100 px-1.5 py-0.5 rounded-full border border-pink-300">
                    {item.steps.length} ಹಂತ
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Devotee & Priest Form Fields */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-amber-900 mb-1">
            👤 ಭಕ್ತರ ಹೆಸರು:
          </label>
          <input
            type="text"
            value={devoteeName}
            onChange={(e) => setDevoteeName(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            placeholder="ಹೆಸರು"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-amber-900 mb-1">
            🌱 ಗೋತ್ರ:
          </label>
          <div className="relative">
            <input
              type="text"
              list="gotra-options"
              value={gotra}
              onChange={(e) => setGotra(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              placeholder="ಗೋತ್ರ"
            />
            <datalist id="gotra-options">
              {COMMON_GOTRAS.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-amber-900 mb-1">
            🙏 ಪುರೋಹಿತರು:
          </label>
          <input
            type="text"
            value={priestName}
            onChange={(e) => setPriestName(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-amber-900 mb-1">
            🌐 ಭಾಷೆ (Language):
          </label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as SevaLang)}
            className="w-full px-2.5 py-1.5 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
          >
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="en">English</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>
      </div>

      {/* Generated Link & Scannable QR Code */}
      <div className="bg-[#FFFDF5] border-2 border-amber-400/80 rounded-2xl p-3 flex flex-col gap-3">
        <span className="text-xs font-black text-amber-900">
          🔗 ಭಕ್ತರಿಗೆ ಕಳುಹಿಸುವ ಪ್ರತ್ಯೇಕ ಲಿಂಕ್:
        </span>

        {/* Read-only URL box with Copy Button */}
        <div className="flex items-center gap-1.5 bg-white border border-amber-300 rounded-xl p-1.5">
          <input
            type="text"
            readOnly
            value={generatedUrl}
            className="flex-1 bg-transparent text-[11px] font-mono text-amber-950 truncate focus:outline-none select-all"
          />
          <button
            type="button"
            onClick={() => void handleCopyLink()}
            className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-black transition-colors shrink-0"
          >
            {copiedLink ? "✓ ನಕಲಿಸಲಾಗಿದೆ" : "ಕಾಪಿ ಮಾಡಿ"}
          </button>
        </div>

        {/* Action Buttons: WhatsApp & QR Code */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <span>💬</span>
            <span>ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <span>✨</span>
            <span>ಪೂಜೆ ಆರಂಭಿಸಿ</span>
          </button>
        </div>

        {/* Dynamic QR Code */}
        {qrCodeDataUrl && (
          <div className="flex items-center justify-center pt-1 border-t border-amber-200">
            <div className="flex items-center gap-3">
              <img
                src={qrCodeDataUrl}
                alt="Guided Pooja QR Code"
                className="w-20 h-20 rounded-xl border border-amber-300 shadow-xs"
              />
              <div className="text-[11px] text-amber-900 font-bold max-w-[200px]">
                📱 ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿದರೆ ನೇರವಾಗಿ ಭಕ್ತರ ಮೊಬೈಲ್‌ನಲ್ಲೇ ಪೂಜೆ/ವ್ರತ ತೆರೆದುಕೊಳ್ಳುತ್ತದೆ.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
