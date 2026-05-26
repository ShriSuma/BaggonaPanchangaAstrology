import { useTranslation } from "react-i18next";
import { formatPickerDateLocalYmd } from "../core/birthTime";

type Props = {
  value: Date | null;
  onChange: (date: Date | null) => void;
};

export default function BirthDateCascadePicker({ value, onChange }: Props): JSX.Element {
  const { t } = useTranslation();
  const dateStr = value ? formatPickerDateLocalYmd(value) : "";

  return (
    <div className="space-y-1">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 text-lg">
          📅
        </span>
        <input
          type="date"
          aria-label={t("kundli.birthDate")}
          min="1900-01-01"
          max={new Date().toISOString().split("T")[0]}
          value={dateStr}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) {
              onChange(null);
              return;
            }
            const [y, m, d] = v.split("-").map(Number);
            if (y && m && d) {
              onChange(new Date(y, m - 1, d, 12, 0, 0, 0));
            } else {
              onChange(null);
            }
          }}
          className="jk-touch-input min-h-[3.2rem] w-full rounded-xl border-2 border-amber-200 bg-white pl-10 pr-3 py-3 text-base font-bold text-indigo-950 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all cursor-pointer"
        />
      </div>
    </div>
  );
}
