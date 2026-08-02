import { useTranslation } from "react-i18next";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import RamanBhavishyaTab from "../components/RamanBhavishya/RamanBhavishyaTab";

export default function RamanBhavishyaPage(): JSX.Element {
  const { t } = useTranslation();
  const session = useKundliViewerStore((state) => state.session);

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-slate-500">
        <p>{t("common.noKundliGenerated", "Please generate a Kundli first to view Raman Bhavishya.")}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col pb-8">
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 p-6 text-white shadow-lg relative overflow-hidden">
        {/* Animated background stars/dust for the cosmic feel */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-200 via-transparent to-transparent bg-[length:20px_20px] animate-[pulse_4s_ease-in-out_infinite]"></div>
        
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("ramanbhavishya.title", "Raman Bhavishya")}
          </h1>
          <p className="mt-2 text-sm text-amber-100">
            {t("ramanbhavishya.subtitle", "Intelligent Astrological Guide based on B.V. Raman's Predictive Logic")}
          </p>
        </div>
      </div>

      <RamanBhavishyaTab session={session} />
    </div>
  );
}
