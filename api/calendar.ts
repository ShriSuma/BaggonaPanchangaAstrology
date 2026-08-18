import { generateSevaICalendarString, calculateDeterministicRhythmDay } from "../src/features/seva/icsCalendarGenerator";
import { decodeDevoteeToken } from "../src/utils/tokenCipher";
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

    const birthNakIdx = decoded.nk ?? 12;
    const birthRashiIdx = decoded.r ?? 5;
    
    for (let i = 0; i < 90; i++) {
      const current = new Date(startDate);
      current.setDate(current.getDate() + i);
      
      const ymd = current.toISOString().split("T")[0]!;
      const day = calculateDeterministicRhythmDay(ymd, birthNakIdx, birthRashiIdx, decoded.d);
      days.push(day);
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
