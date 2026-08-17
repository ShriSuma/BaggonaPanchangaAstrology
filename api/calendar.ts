import { decodeDevoteeToken, generateSevaICalendarString } from "../src/features/seva/icsCalendarGenerator";
import { RhythmDay } from "../src/core/DailyRhythmEngine";

export default function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).send("Missing token");
    }

    const decoded = decodeDevoteeToken(token);
    if (!decoded || !decoded.d) {
      return res.status(400).send("Invalid token");
    }

    // Generate 90 days based on the start date
    const startDate = new Date(decoded.d);
    const days: RhythmDay[] = [];

    const birthNakIdx = decoded.nk ?? 0;
    
    for (let i = 0; i < 90; i++) {
      const current = new Date(startDate);
      current.setDate(current.getDate() + i);
      
      const ymd = current.toISOString().split("T")[0];
      const weekday = current.getDay();
      const dayLord = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"][weekday] as any;
      
      // Simple approximation for transit (same as DailyDarshanaPage)
      const moonNakIdx = (birthNakIdx + Math.floor(i * 13.2 / 13.333)) % 27;
      const moonRashiIdx = Math.floor(moonNakIdx / 2.25) % 12;
      const taraIdx = (((moonNakIdx % 9) + 1) || 2) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

      days.push({
        ymd,
        weekday,
        dayOfMonth: current.getDate(),
        dayLord,
        moonRashiIndex: moonRashiIdx,
        moonNakshatraIndex: moonNakIdx,
        paksha: (i % 30 < 15) ? "Shukla" : "Krishna",
        tithiNumber: (i % 15) + 1,
        taraBala: taraIdx,
        band: taraIdx === 2 || taraIdx === 4 || taraIdx === 6 || taraIdx === 8 || taraIdx === 9 ? "high" : taraIdx === 3 || taraIdx === 5 || taraIdx === 7 ? "rest" : "mid",
        luckyNumbers: [1, 5, 9],
        isChandrashtama: false,
        isAmavasya: false,
        isPurnima: false,
        isSankranti: false
      });
    }

    const icsContent = generateSevaICalendarString({
      days,
      lang: decoded.l || "kn",
      panditName: decoded.p || "Sri Chaitanya Pandit",
      personName: decoded.n || "Devotee"
    });

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="Baggona_90Days_${decoded.n || "Devotee"}.ics"`);
    res.status(200).send(icsContent);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
}
