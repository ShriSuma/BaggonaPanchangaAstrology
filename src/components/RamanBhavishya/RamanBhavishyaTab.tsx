import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import BhavishyaView from "./BhavishyaView";
import AskAstrologer from "./AskAstrologer";

type Props = {
  session: KundliViewerSession;
};

export default function RamanBhavishyaTab({ session }: Props): JSX.Element {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"lifestage" | "ask">("lifestage");

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-Navigation */}
      <div className="flex w-full rounded-lg bg-indigo-50 p-1 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab("lifestage")}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "lifestage"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-indigo-900/60 hover:text-indigo-900"
          }`}
        >
          {t("ramanbhavishya.lifeStageTab", "Life Stage Predictions")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ask")}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "ask"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-indigo-900/60 hover:text-indigo-900"
          }`}
        >
          {t("ramanbhavishya.askTab", "Ask the Astrologer")}
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === "lifestage" && <BhavishyaView />}
        {activeTab === "ask" && <AskAstrologer session={session} />}
      </div>
    </div>
  );
}
