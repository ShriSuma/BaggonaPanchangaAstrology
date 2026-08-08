import { useMemo, useState } from "react";
import type { RhythmDay, RhythmResult } from "../../core/DailyRhythmEngine";
import type { SevaRecommendation } from "../../core/GokarnaSevaEngine";
import type { SevaId } from "../../data/gokarnaSevas";
import { T, pick, type L5 } from "../../features/seva/sevaLocale";
import { todayYmd } from "../../features/seva/sevaPresentation";
import { generatePDFFromElement } from "../../utils/pdfGenerator";
import {
  SevaCalendarPrint,
  SevaLetterPrint,
  SevaPrasadaCardPrint
} from "./pdf/SevaPrintTemplates";

type Identity = {
  personName: string;
  gotra: string;
  rashiIndex: number;
  nakshatraIndex: number;
  placeLabel: string;
};

type Props = {
  rhythm: RhythmResult;
  recommendations: SevaRecommendation[];
  identity: Identity;
  lang: string;
};

/** What the person receives in the physical packet. */
const KIT_ITEMS: { icon: string; title: L5; body: L5 }[] = [
  {
    icon: "◈",
    title: {
      en: "Six-Month Calendar",
      kn: "ಆರು ತಿಂಗಳ ಕ್ಯಾಲೆಂಡರ್",
      te: "ఆరు నెలల క్యాలెండర్",
      ta: "ஆறு மாத நாட்காட்டி",
      hi: "छह महीने का कैलेंडर"
    },
    body: {
      en: "Two sheets to put on your wall. Every date is coloured for your own birth star.",
      kn: "ಗೋಡೆಗೆ ಹಚ್ಚಲು ಎರಡು ಹಾಳೆ. ಪ್ರತಿ ದಿನಾಂಕವೂ ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರಕ್ಕೆ ತಕ್ಕಂತೆ ಬಣ್ಣ ಹೊಂದಿದೆ.",
      te: "గోడకు అతికించడానికి రెండు షీట్లు. ప్రతి తేదీ మీ జన్మ నక్షత్రాన్ని బట్టి రంగు వేయబడింది.",
      ta: "சுவரில் ஒட்ட இரண்டு தாள்கள். ஒவ்வொரு தேதியும் உங்கள் ஜன்ம நட்சத்திரத்திற்கேற்ப நிறமிடப்பட்டுள்ளது.",
      hi: "दीवार पर लगाने के लिए दो पत्रक। हर तारीख़ आपके जन्म नक्षत्र के अनुसार रंगी गई है।"
    }
  },
  {
    icon: "✉",
    title: {
      en: "Blessing Letter",
      kn: "ಆಶೀರ್ವಾದ ಪತ್ರ",
      te: "ఆశీర్వాద పత్రం",
      ta: "ஆசீர்வாதக் கடிதம்",
      hi: "आशीर्वाद पत्र"
    },
    body: {
      en: "A letter in your name recording the seva that was offered and how to read the calendar.",
      kn: "ಸಲ್ಲಿಸಿದ ಸೇವೆಯನ್ನು ಮತ್ತು ಕ್ಯಾಲೆಂಡರ್ ಓದುವ ವಿಧಾನವನ್ನು ದಾಖಲಿಸಿದ, ನಿಮ್ಮ ಹೆಸರಿನ ಪತ್ರ.",
      te: "సమర్పించిన సేవను, క్యాలెండర్ చదివే విధానాన్ని నమోదు చేసిన మీ పేరిట పత్రం.",
      ta: "சமர்ப்பிக்கப்பட்ட சேவையையும் நாட்காட்டியைப் படிக்கும் முறையையும் பதிவு செய்த, உங்கள் பெயரிலான கடிதம்.",
      hi: "अर्पित की गई सेवा और कैलेंडर पढ़ने की विधि दर्ज करता, आपके नाम का पत्र।"
    }
  },
  {
    icon: "✦",
    title: {
      en: "Prasada Card",
      kn: "ಪ್ರಸಾದ ಕಾರ್ಡ್",
      te: "ప్రసాద కార్డు",
      ta: "பிரசாத அட்டை",
      hi: "प्रसाद कार्ड"
    },
    body: {
      en: "A small card for your pooja shelf, with your number, colour, direction and mantra.",
      kn: "ನಿಮ್ಮ ಸಂಖ್ಯೆ, ಬಣ್ಣ, ದಿಕ್ಕು ಮತ್ತು ಮಂತ್ರವಿರುವ, ದೇವರ ಮನೆಗೆ ಇಡುವ ಚಿಕ್ಕ ಕಾರ್ಡ್.",
      te: "మీ సంఖ్య, రంగు, దిక్కు, మంత్రం ఉన్న, పూజ గదిలో ఉంచే చిన్న కార్డు.",
      ta: "உங்கள் எண், நிறம், திசை, மந்திரம் அடங்கிய, பூஜை அறையில் வைக்கும் சிறிய அட்டை.",
      hi: "आपका अंक, रंग, दिशा और मंत्र लिए, पूजा स्थान पर रखने योग्य छोटा कार्ड।"
    }
  }
];

const hiddenHost: React.CSSProperties = {
  position: "fixed",
  left: -20000,
  top: 0,
  opacity: 0,
  pointerEvents: "none",
  zIndex: -1
};

const safeFileName = (name: string, suffix: string): string => {
  const base = name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "Bhakta";
  return `${base}-${suffix}.pdf`;
};

export default function PrasadaKit({
  rhythm,
  recommendations,
  identity,
  lang
}: Props): JSX.Element {
  const [busy, setBusy] = useState<string | null>(null);
  const [sevaDate, setSevaDate] = useState(todayYmd());
  const [sevaId, setSevaId] = useState<SevaId | "">(recommendations[0]?.seva.id ?? "");

  const chosenSeva = useMemo(
    () => recommendations.find((r) => r.seva.id === sevaId) ?? recommendations[0],
    [recommendations, sevaId]
  );

  const today: RhythmDay = rhythm.days[0]!;

  const bestDays = useMemo(
    () => [...rhythm.days].sort((a, b) => b.energyScore - a.energyScore).slice(0, 6).sort((a, b) => a.ymd.localeCompare(b.ymd)),
    [rhythm]
  );

  const moneyDays = useMemo(() => rhythm.days.filter((d) => d.isMoneyDay).slice(0, 6), [rhythm]);

  const download = async (elementId: string, fileName: string, tag: string): Promise<void> => {
    setBusy(tag);
    try {
      await generatePDFFromElement(elementId, fileName);
    } catch {
      // Leave the button available so the person can try again.
    } finally {
      setBusy(null);
    }
  };

  const Button = ({
    tag,
    label,
    onClick,
    tone
  }: {
    tag: string;
    label: string;
    onClick: () => void;
    tone: "primary" | "secondary";
  }): JSX.Element => (
    <button
      type="button"
      onClick={onClick}
      disabled={busy !== null}
      className={`w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition disabled:opacity-50 ${
        tone === "primary"
          ? "bg-amber-700 text-amber-50 hover:bg-amber-800"
          : "border border-amber-300 bg-white text-amber-900 hover:bg-amber-50"
      }`}
    >
      {busy === tag ? pick(T.preparing!, lang) : label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-xl font-semibold text-amber-950">
          {pick(T.prasadaHeading!, lang)}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-amber-900/75">
          {pick(T.prasadaIntro!, lang)}
        </p>
      </div>

      {/* What is in the packet */}
      <div className="space-y-2.5">
        {KIT_ITEMS.map((item) => (
          <div
            key={item.icon}
            className="flex gap-3 rounded-xl border border-amber-200 bg-white/70 p-3.5"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-base text-amber-800"
              aria-hidden
            >
              {item.icon}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-amber-950">{pick(item.title, lang)}</div>
              <div className="mt-0.5 text-[13px] leading-snug text-amber-900/70">
                {pick(item.body, lang)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Seva record for the letter */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-amber-800/70">
          {pick(T.sevaMarkDone!, lang)}
          <span className="ml-2 font-normal normal-case tracking-normal text-amber-700/60">
            ({pick(T.optional!, lang)})
          </span>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-amber-800/70">
              {pick(T.sevaPerformed!, lang)}
            </span>
            <select
              value={sevaId}
              onChange={(e) => setSevaId(e.target.value as SevaId)}
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-amber-950"
            >
              {recommendations.map((r) => (
                <option key={r.seva.id} value={r.seva.id}>
                  {pick(r.seva.name, lang)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-amber-800/70">
              {pick(T.sevaDate!, lang)}
            </span>
            <input
              type="date"
              value={sevaDate}
              onChange={(e) => setSevaDate(e.target.value)}
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-amber-950"
            />
          </label>
        </div>
      </div>

      {/* Downloads */}
      <div className="space-y-2.5">
        <Button
          tag="calendar"
          tone="primary"
          label={pick(T.downloadCalendar!, lang)}
          onClick={() =>
            void download(
              "seva-print-calendar",
              safeFileName(identity.personName, "Calendar"),
              "calendar"
            )
          }
        />
        <Button
          tag="letter"
          tone="secondary"
          label={pick(T.downloadMessage!, lang)}
          onClick={() =>
            void download("seva-print-letter", safeFileName(identity.personName, "Blessing"), "letter")
          }
        />
        <Button
          tag="card"
          tone="secondary"
          label={pick(T.downloadPrasada!, lang)}
          onClick={() =>
            void download("seva-print-card", safeFileName(identity.personName, "Prasada"), "card")
          }
        />
      </div>

      <p className="text-[11px] leading-relaxed text-amber-800/60">{pick(T.disclaimer!, lang)}</p>

      {/* Off-screen print sources */}
      <div id="seva-print-calendar" style={hiddenHost} aria-hidden>
        <SevaCalendarPrint rhythm={rhythm} lang={lang} identity={identity} />
      </div>

      <div id="seva-print-letter" style={hiddenHost} aria-hidden>
        <SevaLetterPrint
          lang={lang}
          identity={identity}
          primarySeva={chosenSeva}
          sevaDate={sevaDate}
          rhythm={rhythm}
        />
      </div>

      <div id="seva-print-card" style={hiddenHost} aria-hidden>
        <SevaPrasadaCardPrint
          lang={lang}
          identity={identity}
          rhythm={rhythm}
          today={today}
          bestDays={bestDays}
          moneyDays={moneyDays}
        />
      </div>
    </div>
  );
}
