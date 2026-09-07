/**
 * Baggona Panchanga - Indic-Parler-TTS Server Helper with Persistent Disk Caching
 * Powered by AI4Bharat Indic-Parler-TTS on Hugging Face Spaces.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const CACHE_DIR = path.resolve(process.cwd(), "public", "audio_cache", "indic_parler");
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (err) {
  console.warn("[indicTtsCore] Warning creating cache dir:", err);
}

export const INDIC_VOICE_DESCRIPTIONS = {
  kn: "Suresh speaks slowly in a low-pitched, calm voice, with a neutral tone, perfect for sacred vedic narration. The recording is very high quality with no background noise.",
  ta: "Sunita speaks slowly in a calm, moderate-pitched voice, delivering the sacred mantra with a solemn, authentic devotional tone. The recording is very high quality with no background noise.",
  te: "Prakash speaks slowly in a low-pitched, calm voice, with a neutral tone, perfect for sacred vedic narration. The recording is very high quality with no background noise.",
  hi: "Suresh speaks slowly in a deep, calm, traditional Indian male voice, with solemn vedic cadence. The recording is very high quality with no background noise.",
  en: "Suresh speaks slowly in a calm, traditional Indian accent, chanting clearly with solemn vedic cadence. The recording is very high quality with no background noise."
};

/**
 * STRICT USER MANDATE:
 * "100% strict rules where 100% accurately whatever written, no blah blah added,
 * only what is written clearly needs to be told."
 */
export function sanitizeTextForSpeech(text) {
  if (!text) return "";
  return text
    .replace(/\p{Extended_Pictographic}/gu, " ")
    .replace(/\p{Emoji_Presentation}/gu, " ")
    .replace(/॥/g, " . ")
    .replace(/।/g, " , ")
    .replace(/[·•|/]/g, " , ")
    .replace(/[:;]/g, " , ")
    .replace(/\.{2,}/g, " . ")
    .replace(/["'""'«»()[\]{}*#_~`^]/g, "")
    .replace(/[—–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Computes deterministic SHA-256 hash for audio caching
 */
export function getAudioCacheHash(text, lang = "kn") {
  const clean = sanitizeTextForSpeech(text);
  return crypto.createHash("sha256").update(`${lang}_${clean}`).digest("hex").slice(0, 32);
}

/**
 * Generates neural Indic TTS audio via Hugging Face Space Gradio 5 SSE protocol
 * with persistent local disk caching (0ms latency on subsequent hits).
 */
export async function generateIndicTtsAudioServer(text, lang = "kn", customHfToken = "") {
  const cleanText = sanitizeTextForSpeech(text);
  if (!cleanText) return null;

  const hash = getAudioCacheHash(cleanText, lang);
  const cachedFilePath = path.join(CACHE_DIR, `${hash}.mp3`);
  const publicUrl = `/audio_cache/indic_parler/${hash}.mp3`;

  // 1. Instant Disk Cache Hit (< 5ms response time!)
  if (fs.existsSync(cachedFilePath)) {
    try {
      const stats = fs.statSync(cachedFilePath);
      if (stats.size > 1000) {
        return publicUrl;
      }
    } catch {}
  }

  // 2. Queue generation on Hugging Face Space with resilient token failover
  const hfToken = customHfToken || process.env.VITE_HF_API_KEY || process.env.HF_TOKEN || "";
  const voiceDescription = INDIC_VOICE_DESCRIPTIONS[lang] || INDIC_VOICE_DESCRIPTIONS.kn;

  async function attemptQueueCall(useToken) {
    const sessionHash = Math.random().toString(36).substring(2);
    const headers = { "Content-Type": "application/json" };
    if (useToken && hfToken && !hfToken.includes("your_token_here")) {
      headers["Authorization"] = `Bearer ${hfToken}`;
    }

    const joinRes = await fetch("https://ai4bharat-indic-parler-tts.hf.space/gradio_api/queue/join", {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: [cleanText, voiceDescription],
        event_data: null,
        fn_index: 1, // /generate_finetuned
        trigger_id: 10,
        session_hash: sessionHash
      })
    });

    if (!joinRes.ok) {
      throw new Error(`Queue join failed: ${joinRes.status}`);
    }

    const streamHeaders = {};
    if (useToken && hfToken && !hfToken.includes("your_token_here")) {
      streamHeaders["Authorization"] = `Bearer ${hfToken}`;
    }

    const eventRes = await fetch(`https://ai4bharat-indic-parler-tts.hf.space/gradio_api/queue/data?session_hash=${sessionHash}`, {
      headers: streamHeaders
    });

    if (!eventRes.ok || !eventRes.body) {
      throw new Error(`Queue stream failed: ${eventRes.status}`);
    }

    const reader = eventRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.msg === "process_completed") {
              if (payload.output?.error) {
                throw new Error(String(payload.output.error));
              }
              const fileData = payload.output?.data?.[0];
              const rawUrl = fileData?.url || fileData?.path;
              if (rawUrl) {
                const remoteUrl = rawUrl.startsWith("http")
                  ? rawUrl
                  : `https://ai4bharat-indic-parler-tts.hf.space${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

                // 3. Save remote audio file to local disk cache for instant future loads
                try {
                  const audioRes = await fetch(remoteUrl);
                  if (audioRes.ok) {
                    const arrayBuffer = await audioRes.arrayBuffer();
                    fs.writeFileSync(cachedFilePath, Buffer.from(arrayBuffer));
                    return publicUrl;
                  }
                } catch (saveErr) {
                  console.warn("[indicTtsCore] Failed to save to local cache:", saveErr);
                }

                return remoteUrl;
              }
            }
          } catch (parseErr) {
            if (parseErr.message && (parseErr.message.includes("quota") || parseErr.message.includes("ZeroGPU"))) {
              throw parseErr;
            }
          }
        }
      }
    }

    throw new Error("Gradio stream finished without audio output");
  }

  try {
    // Attempt 1: with user token (if configured)
    return await attemptQueueCall(Boolean(hfToken));
  } catch (err) {
    if (hfToken) {
      console.warn("[indicTtsCore] Token request failed, falling back to anonymous guest mode:", err.message);
      return await attemptQueueCall(false);
    }
    throw err;
  }
}
