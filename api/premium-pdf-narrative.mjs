import { generatePremiumPDFNarrative } from "../lib/premiumPdfCore.mjs";

const ALLOWED = new Set(["en", "hi", "kn", "te", "ta"]);

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });

/** Vercel Serverless: POST { prediction, lang } → { narrative } */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Api-Key");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  try {
    const body = await readJsonBody(req);
    const lang = String(body.lang ?? "en").split("-")[0];
    if (!ALLOWED.has(lang)) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "Unsupported lang" }));
    }
    if (!body.prediction) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "prediction object required" }));
    }
    const narrative = await generatePremiumPDFNarrative(body.prediction, lang, process.env);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ narrative }));
  } catch (e) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
  }
}
