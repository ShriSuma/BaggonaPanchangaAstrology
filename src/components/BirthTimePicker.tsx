import { useTranslation } from "react-i18next";

type Props = {
  /** HH:mm format, e.g. "09:25" or "20:15". Can be empty string initially. */
  value: string;
  onChange: (hm: string) => void;
  id?: string;
  /** Shown above fields, e.g. "Birth time (IST)". */
  zoneHint?: string;
};

export default function BirthTimePicker({ value, onChange, id, zoneHint }: Props): JSX.Element {
  const { t } = useTranslation();

  // Parse HH:mm to 12-hour format parts
  const isTimeSet = Boolean(value && value.includes(":"));
  let hour12 = 12;
  let minute = 0;
  let period: "AM" | "PM" = "AM";

  if (isTimeSet) {
    const [hStr, mStr] = value.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (!isNaN(h) && !isNaN(m)) {
      minute = m;
      if (h >= 12) {
        period = "PM";
        hour12 = h === 12 ? 12 : h - 12;
      } else {
        period = "AM";
        hour12 = h === 0 ? 12 : h;
      }
    }
  }

  const updateTime = (h12: number | typeof NaN, min: number | typeof NaN, ampm: "AM" | "PM") => {
    if (isNaN(h12) || isNaN(min)) {
      onChange("");
      return;
    }
    let h24 = h12;
    if (ampm === "PM") {
      h24 = h12 === 12 ? 12 : h12 + 12;
    } else {
      h24 = h12 === 12 ? 0 : h12;
    }
    const hh = String(h24).padStart(2, "0");
    const mm = String(min).padStart(2, "0");
    onChange(`${hh}:${mm}`);
  };

  const hoursList = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="space-y-1">
      {zoneHint ? <p className="text-xs font-semibold text-emerald-900/80">{zoneHint}</p> : null}
      <div className="flex gap-2 items-center" id={id}>
        {/* Hour Select */}
        <div className="flex-1">
          <select
            aria-label="Birth Hour"
            value={isTimeSet ? hour12 : ""}
            onChange={(e) => {
              const h = parseInt(e.target.value, 10);
              const m = isTimeSet ? minute : 0;
              updateTime(h, m, period);
            }}
            className="jk-touch-input min-h-[3.2rem] w-full rounded-xl border-2 border-emerald-200 bg-white px-3 py-3 text-base font-bold text-indigo-950 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
          >
            <option value="">-- {t("timePicker.hour", { defaultValue: "Hour" })}</option>
            {hoursList.map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        {/* Colon separator */}
        <span className="text-xl font-bold text-slate-400">:</span>

        {/* Minute Select */}
        <div className="flex-1">
          <select
            aria-label="Birth Minute"
            value={isTimeSet ? minute : ""}
            onChange={(e) => {
              const h = isTimeSet ? hour12 : 12;
              const m = parseInt(e.target.value, 10);
              updateTime(h, m, period);
            }}
            className="jk-touch-input min-h-[3.2rem] w-full rounded-xl border-2 border-emerald-200 bg-white px-3 py-3 text-base font-bold text-indigo-950 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
          >
            <option value="">-- {t("timePicker.minute", { defaultValue: "Min" })}</option>
            {minutesList.map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        {/* AM/PM Select */}
        <div className="w-24">
          <select
            aria-label="AM/PM"
            value={period}
            onChange={(e) => {
              const h = isTimeSet ? hour12 : 12;
              const m = isTimeSet ? minute : 0;
              updateTime(h, m, e.target.value as "AM" | "PM");
            }}
            className="jk-touch-input min-h-[3.2rem] w-full rounded-xl border-2 border-emerald-200 bg-white px-3 py-3 text-base font-bold text-indigo-950 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
    </div>
  );
}
