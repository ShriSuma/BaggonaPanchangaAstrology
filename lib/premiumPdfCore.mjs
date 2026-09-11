import { callGemini, callOpenAI } from "./kundliNarrativeCore.mjs";

const LANG_NAMES = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
  te: "Telugu",
  ta: "Tamil"
};

async function generateSection(prompt, env, schemaDesc) {
  let raw = "";
  if (env.GEMINI_API_KEY || env.GOOGLE_GEMINI_API_KEY) {
    raw = await callGemini(prompt, env.GEMINI_API_KEY || env.GOOGLE_GEMINI_API_KEY, env.GEMINI_MODEL);
  } else if (env.OPENAI_API_KEY) {
    raw = await callOpenAI(prompt, env.OPENAI_API_KEY, env.OPENAI_MODEL);
  } else {
    throw new Error("No AI API keys configured");
  }

  try {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON for prompt:", prompt);
    console.error("Raw response:", raw);
    throw new Error(`AI response was not valid JSON matching schema: ${schemaDesc}`);
  }
}

export async function generatePremiumPDFNarrative(prediction, lang, env = process.env) {
  const langName = LANG_NAMES[String(lang).split("-")[0]] ?? "English";
  const basePrompt = `You are an elite, highly empathetic Vedic Astrologer using the rules of Baggona Panchanga. Write your response ONLY in ${langName}. 
CRITICAL RULES:
1. Do NOT use ANY English words if the language is ${langName}. Never output words like "Impact", "Example", or "Remedy" in English.
2. Use VERY SIMPLE, everyday conversational words. DO NOT use heavy, complex, or difficult Sanskrit words (e.g., avoid words like "parishrama" or complex shlokas, use simple local equivalents).
3. DO NOT mention "Baggona Panchanga". You must refer to the astrological science as "Baggona Panchanga" or "Baggona Panchangada prakara".
4. You MUST return ONLY valid JSON with no markdown formatting around it.`;

  const p0_characteristics = `${basePrompt}
Topic: Characteristics of the Person (Vyaktitva / Guna-lakshana)
Data: 
- Core Personality: ${prediction.natalLayer?.corePersonality?.description}
- Mind & Emotional State: ${prediction.natalLayer?.mindAndEmotions?.description}
- Ascendant Lord Placement: ${prediction.natalLayer?.ascendantLordPlacement?.description}

Task:
Write EXACTLY 2 paragraphs (or bullet points) explaining the deep personality traits, behavior, and true nature of the person based on the above data.
Format required: { "characteristics": ["point/para 1", "point/para 2"] }`;

  const p0_darkSecret = `${basePrompt}
Topic: The Dark Secret / Hidden Flaws (Nigoodha Satya / Rahasya)
Data: 
- Shadow Self & Karmic Baggage: ${prediction.natalLayer?.shadowSelf?.description}

Task:
Write EXACTLY 2 paragraphs exposing the darkest secret, hidden flaws, or karmic baggage of this person. Be deep and mystical.
Format required: { "darkSecret": ["para 1", "para 2"] }`;

  const devoteeName = prediction.metadata?.name || prediction.input?.name || prediction.name || "";
  const ageYears = prediction.metadata?.ageYears || prediction.metadata?.age || 30;
  const gender = prediction.metadata?.gender || "Male";
  const maritalStatus = prediction.metadata?.maritalStatus || "general";
  const childrenStatus = prediction.metadata?.childrenStatus || "general";
  const dashaStr = `${prediction.metadata?.runningMahadasha || ""} - ${prediction.metadata?.runningBhukti || ""}`;
  const moonStr = prediction.natalLayer?.moonSign?.english || prediction.metadata?.moonSign || "";
  const lagnaStr = prediction.natalLayer?.ascendant?.english || prediction.metadata?.lagna || "";

  const p1 = `${basePrompt}
Topic: Current Life Phase & Divine Guidance (Prasthutha Jeevana Ghattada Manasthiti mattu Daivika Marga)
Data: 
- Devotee Name: ${devoteeName || "Devotee"}
- Current Age: ${ageYears} years (${ageYears >= 60 ? "Senior Citizen - Focus on health, emotional tranquility, joy from family & grandchildren, peaceful routine, letting go of worldly race" : ageYears < 23 ? "Youth / Student - Focus on educational discipline, vocational clarity, exam confidence, foundational stability" : "Working Adult - Focus on household responsibilities, career workload, financial obligations, emotional balance"})
- Moon Sign (Rashi): ${moonStr}
- Ascendant (Lagna): ${lagnaStr}
- Running Dasha & Bhukti: ${dashaStr}

CRITICAL PERSONAL CONNECTION & LIVING REALITY RULES:
1. Address ${devoteeName ? devoteeName : "the devotee"} directly with deep personal warmth, empathy, and spiritual intimacy. Speak to what is currently happening in their day-to-day life.
2. Mirror EXACTLY what is unfolding in their daily life at age ${Math.floor(ageYears)}:
   ${ageYears >= 60 ? "- As a senior (60+), discuss managing bodily vitality, peaceful spiritual contemplation, mutual warmth with family, and relinquishing anxious material competition." : ageYears < 23 ? "- As a young individual (<23), speak directly to study pressures, exam focus, establishing self-worth, and channeling energetic restlessness." : (maritalStatus === 'married' && childrenStatus === 'no_children' ? "- As a married adult without children, speak to balancing workplace demands, household budgeting, mutual emotional sanctuary with their spouse, and tender shared prayers for family expansion." : "- As an adult, speak to balancing workplace demands, household budgeting, supporting dependents, and inner emotional resilience.")}
3. NO generic textbook house listings or abstract astrological jargon. Explain practical cosmic guidance they can feel in their heart.

Task:
Write EXACTLY 4 deeply personal, empathetic paragraphs:
- Paragraph 1: Direct personal address to ${devoteeName || "them"}, acknowledging their current psychological reality and the core energetic theme of the ${dashaStr} period.
- Paragraph 2: How live cosmic transits are affecting their mind, daily duties, and immediate domestic environment.
- Paragraph 3: Specific practical guidance for the next few months regarding their career/finances/family according to their life stage.
- Paragraph 4: Sacred spiritual remedies, planetary chanting, and a warm blessing for peace and prosperity.
Format required: { "currentPhase": ["para 1", "para 2", "para 3", "para 4"] }`;

  const p2 = `${basePrompt}
Topic: Next 6 to 12 Months Prediction & 12-Month Roadmap
Data:
- Roadmap Data: ${JSON.stringify(prediction.timingLayer?.twelveMonthRoadmap)}

Task: 
1. "next6Months": Write EXACTLY 3 paragraphs explaining their overall predictions for the next 6 to 12 months.
2. "roadmap": Translate the provided 12-month data into exactly 12 translated items. Ensure the month names and status are fully translated to ${langName}.
Format required: { 
  "next6Months": ["para 1", "para 2", "para 3"],
  "roadmap": [ { "month": "Month Year", "status": "Good/Neutral/Excellent", "prediction": "Translated prediction...", "auspiciousDates": "...", "activities": "..." } ] 
}`;

  const p3 = `${basePrompt}
Topic: Bhavishya (Detailed Future Predictions for Specific Life Areas)
Data:
- Native Details: Age ${ageYears} years, Gender: ${gender}, Marital Status: ${maritalStatus}, Children Status: ${childrenStatus}, Running Dasha: ${dashaStr}
- Primary Focus: ${prediction.masterSynthesis?.priorityTopic || "Holistic Wellbeing"}

CRITICAL AGE & GENDER DIRECTIVES:
${ageYears >= 60 ? "- SENIOR CITIZEN (60+ YEARS): Focus on spiritual companionship, domestic serenity, mutual health care, family legacy, joy from grandchildren, mentorship, and asset preservation. NEVER suggest wedding proposals, matchmaking, or seeking marriage alliances." : ageYears < 22 ? "- YOUTH / STUDENT (< 22 YEARS): Focus on education, competitive exams, character building, career foundations, avoiding premature distractions, and physical vitality. NEVER suggest marriage timing or finding romantic partners." : (maritalStatus === 'married' && childrenStatus === 'no_children' ? "- MARRIED & SEEKING PROGENY: In Marriage, focus strictly on mutual support, loyalty, and standing united against societal pressure. NEVER mention raising children or schooling in Marriage. In Children, write deeply empathetic paragraphs validating their prayers for a child, astrological timing for conception, and sacred remedies (Santana Gopala)." : "- ADULT: Provide deep, mature, emotionally resonant readings tailored for their marital and progeny status.")}

Task: Write detailed predictions for the following 5 life areas. For EACH area, you MUST write EXACTLY 2 paragraphs.
1. Arogya (Health & Vitality)
2. Maduve mattu Sambandha (Marriage / Companionship / Relationships)
3. Makkalu mattu Santati (Children / Legacy / Higher Studies)
4. Udyoga (Career & Profession / Life Mission / Academic Preparation)
5. Kutumba mattu Sampattu (Family & Wealth / Asset Preservation)
Format required: {
  "health": ["para 1", "para 2"],
  "marriage": ["para 1", "para 2"],
  "children": ["para 1", "para 2"],
  "career": ["para 1", "para 2"],
  "wealth": ["para 1", "para 2"]
}`;

  const p4_karmic = `${basePrompt}
Topic: Yogas and Doshas (Karmic Gifts & Flaws)
Data:
- Yogas: ${JSON.stringify(prediction.aiGeneratedNarrative?.yogas || [])}
- Doshas/Pariharas: ${JSON.stringify(prediction.aiGeneratedNarrative?.doshas || [])}

Task: 
1. "yogas": For EACH Yoga, write EXACTLY 2 paragraphs (paragraph 1 explains what it does, paragraph 2 is a scenario example).
2. "doshas": For EACH Dosha, write EXACTLY 2 paragraphs (paragraph 1 explains what it does, paragraph 2 is a scenario example), and also provide a remedy.
Ensure everything is fully translated to ${langName}.
Format required: {
  "yogas": [ { "name": "...", "significance": ["...", "..."] } ],
  "doshas": [ { "name": "...", "significance": ["...", "..."], "remedy": "..." } ]
}`;

  const p5_summary = `${basePrompt}
Topic: Astrologer's Personal Life Synthesis & Baggona Kshetra Blessing
Data:
- Devotee Name: ${devoteeName || "Devotee"}
- Age: ${ageYears} years
- Running Dasha & Bhukti: ${dashaStr}

CRITICAL RULES:
1. Speak directly to ${devoteeName || "the devotee"} like a caring family astrologer. No dry academic house lists.
2. Synthesize their soul journey and define ONE single, clear life priority for the coming year tailored to age ${Math.floor(ageYears)}${maritalStatus === 'married' && childrenStatus === 'no_children' ? " and their shared marital focus on family expansion" : ""}.
3. Conclude with a sacred blessing from the divine lineage of Baggona Kshetra.

Task: 
1. "summary": Write a warm, cohesive 2-paragraph personal life synthesis addressing ${devoteeName || "them"} directly.
2. "ashirvada": Write a beautiful, deeply spiritual 1-paragraph astrologer's blessing (Ashirvada Vachan) invoking peace, health, and grace.
Ensure everything is fully translated to ${langName}.
Format required: {
  "summary": "Cohesive personal synthesis addressing the devotee directly...",
  "ashirvada": "Spiritual blessing from Baggona Kshetra..."
}`;

  const [charPart, secretPart, part1, part2, part3, part4, part5] = await Promise.all([
    generateSection(p0_characteristics, env, "Characteristics"),
    generateSection(p0_darkSecret, env, "Dark Secret"),
    generateSection(p1, env, "Current Phase"),
    generateSection(p2, env, "Timeline & 6-12 Months"),
    generateSection(p3, env, "Bhavishya Life Areas"),
    generateSection(p4_karmic, env, "Yogas & Doshas"),
    generateSection(p5_summary, env, "Summary & Ashirvada")
  ]);

  return {
    characteristics: charPart.characteristics,
    darkSecret: secretPart.darkSecret,
    currentPhase: part1.currentPhase,
    next6Months: part2.next6Months,
    roadmap: part2.roadmap,
    bhavishya: {
      health: part3.health,
      marriage: part3.marriage,
      children: part3.children,
      career: part3.career,
      wealth: part3.wealth
    },
    yogas: part4.yogas,
    doshas: part4.doshas,
    summary: part5.summary,
    ashirvada: part5.ashirvada
  };
}
