import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, lang = "kn" } = req.body || {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text string required" });
  }

  try {
    // @ts-expect-error local server helper
    const { generateIndicTtsAudioServer } = await import("../lib/indicTtsCore.mjs");
    const audioUrl = await generateIndicTtsAudioServer(text, lang);
    return res.status(200).json({ audioUrl });
  } catch (err) {
    console.error("[api/indic-tts] Error:", err);
    return res.status(502).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
