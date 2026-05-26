import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { enGB, hi, kn, ta, te } from "date-fns/locale";

type LocaleCode = "en" | "hi" | "kn" | "te" | "ta";

const localeMap = {
  en: enGB,
  hi,
  kn,
  te,
  ta
} as const;

export const getDateFnsLocale = (language: string) => {
  const code = language.split("-")[0] as LocaleCode;
  return localeMap[code] ?? enGB;
};

type Props = {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  id?: string;
};

export default function DatePicker({ selected, onChange, id }: Props): JSX.Element {
  const { i18n } = useTranslation();
  const isKn = i18n.language.startsWith("kn");

  // Selected values
  const selectedYear = selected ? selected.getFullYear() : "";
  const selectedMonth = selected ? selected.getMonth() : ""; // 0-indexed
  const selectedDay = selected ? selected.getDate() : "";

  // Years list: 1900 to current year, descending
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const arr = [];
    for (let y = currentYear; y >= 1900; y--) {
      arr.push(y);
    }
    return arr;
  }, [currentYear]);

  // Months list
  const months = useMemo(() => {
    return [
      { value: 0, label: isKn ? "ಜನವರಿ" : "January" },
      { value: 1, label: isKn ? "ಫೆಬ್ರವರಿ" : "February" },
      { value: 2, label: isKn ? "ಮಾರ್ಚ್" : "March" },
      { value: 3, label: isKn ? "ಏಪ್ರಿಲ್" : "April" },
      { value: 4, label: isKn ? "ಮೇ" : "May" },
      { value: 5, label: isKn ? "ಜೂನ್" : "June" },
      { value: 6, label: isKn ? "ಜುಲೈ" : "July" },
      { value: 7, label: isKn ? "ಆಗಸ್ಟ್" : "August" },
      { value: 8, label: isKn ? "ಸೆಪ್ಟೆಂಬರ್" : "September" },
      { value: 9, label: isKn ? "ಅಕ್ಟೋಬರ್" : "October" },
      { value: 10, label: isKn ? "ನವೆಂಬರ್" : "November" },
      { value: 11, label: isKn ? "ಡಿಸೆಂಬರ್" : "December" }
    ];
  }, [isKn]);

  // Get number of days in selected month and year
  const daysInMonth = useMemo(() => {
    if (selectedYear === "" || selectedMonth === "") return 31;
    return new Date(Number(selectedYear), Number(selectedMonth) + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const days = useMemo(() => {
    const arr = [];
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(d);
    }
    return arr;
  }, [daysInMonth]);

  const handleYearChange = (yearVal: string) => {
    if (yearVal === "") {
      onChange(null);
      return;
    }
    const y = Number(yearVal);
    const m = selectedMonth !== "" ? Number(selectedMonth) : 0;
    const maxDays = new Date(y, m + 1, 0).getDate();
    const d = selectedDay !== "" ? Math.min(Number(selectedDay), maxDays) : 1;
    onChange(new Date(y, m, d, 12, 0, 0, 0));
  };

  const handleMonthChange = (monthVal: string) => {
    if (monthVal === "") {
      onChange(null);
      return;
    }
    const y = selectedYear !== "" ? Number(selectedYear) : currentYear;
    const m = Number(monthVal);
    const maxDays = new Date(y, m + 1, 0).getDate();
    const d = selectedDay !== "" ? Math.min(Number(selectedDay), maxDays) : 1;
    onChange(new Date(y, m, d, 12, 0, 0, 0));
  };

  const handleDayChange = (dayVal: string) => {
    if (dayVal === "") {
      onChange(null);
      return;
    }
    const y = selectedYear !== "" ? Number(selectedYear) : currentYear;
    const m = selectedMonth !== "" ? Number(selectedMonth) : 0;
    const d = Number(dayVal);
    onChange(new Date(y, m, d, 12, 0, 0, 0));
  };

  return (
    <div className="flex gap-2 w-full animate-fade-in" id={id}>
      {/* Year Select */}
      <div className="flex-1">
        <select
          aria-label="Birth Year"
          value={selectedYear}
          onChange={(e) => handleYearChange(e.target.value)}
          className="jk-touch-input min-h-[3.2rem] w-full rounded-xl border-2 border-amber-200 bg-white px-3 py-3 text-base font-bold text-indigo-950 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all cursor-pointer"
        >
          <option value="">-- {isKn ? "ವರ್ಷ" : "Year"}</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Month Select */}
      <div className="flex-1">
        <select
          aria-label="Birth Month"
          value={selectedMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="jk-touch-input min-h-[3.2rem] w-full rounded-xl border-2 border-amber-200 bg-white px-3 py-3 text-base font-bold text-indigo-950 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all cursor-pointer"
        >
          <option value="">-- {isKn ? "ತಿಂಗಳು" : "Month"}</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Day Select */}
      <div className="flex-1">
        <select
          aria-label="Birth Day"
          value={selectedDay}
          onChange={(e) => handleDayChange(e.target.value)}
          className="jk-touch-input min-h-[3.2rem] w-full rounded-xl border-2 border-amber-200 bg-white px-3 py-3 text-base font-bold text-indigo-950 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all cursor-pointer"
        >
          <option value="">-- {isKn ? "ದಿನ" : "Day"}</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {String(d).padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
