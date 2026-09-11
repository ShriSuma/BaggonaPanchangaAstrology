import { useState, useEffect } from "react";
import { useKundliViewerStore } from "../../stores/kundliViewerStore";
import { useAppStore } from "../../stores/appStore";
import { translateText } from "../../utils/translator";
import { useTranslation } from "react-i18next";
import { askGeminiBatch } from "../../core/GeminiEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { generateBaggonaPredictions, generatePersonalReading } from "../../core/BaggonaPredictionEngine";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";

export type TranslatedPrediction = {
  category: string;
  text: string;
  translatedText: string;
  translatedCategory: string; 
};

const getDeepInsightCategories = (age: number) => {
  const cats = [
    { id: "current_phase", label: "Current Phase (Age, Dasha & Gochara)" },
    { id: "next_six_months", label: "Next 6 Months Predictions (Dasha, Bhukti & Gochara)" },
    { id: "lifespan", label: "Lifespan & Health" },
    { id: "marriage", label: "Marriage & Relationships" },
    { id: "children", label: "Children & Progeny" }
  ];

  if (age < 25) {
    cats.push({ id: "education_travel", label: "Education & Overseas Prospects" });
  }

  cats.push(
    { id: "job", label: "Career & Profession" },
    { id: "family", label: "Family & Wealth" }
  );

  return cats;
};

function buildRichCategoryFallback(
  catId: string,
  catLabel: string,
  lagnaName: string,
  moonName: string,
  dashaStr: string,
  bhuktiStr: string,
  ageInt: number,
  genderStr: string
): string {
  let p1 = "";
  let p2 = "";

  switch (catId) {
    case "current_phase":
      p1 = `At age ${ageInt}, your life journey is directly illuminated by your natal Lagna (${lagnaName}) and Moon sign (${moonName}), operating under the active cosmic currents of ${dashaStr} Mahadasha and ${bhuktiStr} Bhukti. This celestial alignment signifies a pivotal evolutionary period where long-standing karmic foundations undergo constructive realignment, challenging you to consolidate past achievements while actively pioneering fresh personal milestones. Planetary movements across your key astrological houses stimulate renewed vigor in both daily routines and broader ambitions, urging you to step forward with self-assurance. As external opportunities mature, maintaining unwavering dedication to your primary responsibilities will ensure steady progression and widespread acknowledgment.`;
      p2 = `On an internal psychological plane, the combined energies of ${dashaStr} and ${bhuktiStr} encourage a deep emotional re-calibration, prompting you to balance practical material responsibilities with authentic inner peace. You may experience moments of profound introspection as subtle subconscious patterns and past experiences rise to the surface to be acknowledged, understood, and integrated with maturity. Emotional stability is strengthened by establishing structured daily grounding habits, practicing mindful reflection, and resisting the urge to make impulsive life choices during high-pressure situations. By anchoring your actions in patient determination and trusting the divine unfolding of your planetary cycle, you establish profound inner harmony and radiant confidence.`;
      break;

    case "next_six_months":
      p1 = `Over the upcoming six months, key Gochara transits interacting with your natal ${moonName} Moon and ${lagnaName} Ascendant create dynamic astrological momentum across your financial, professional, and personal spheres. The gradual shift of planetary energies through your operational houses will bring crucial decisions to the forefront, particularly regarding career projects, household investments, and long-term security. The ongoing progression of ${dashaStr} Mahadasha with ${bhuktiStr} Bhukti highlights auspicious windows for initiating strategic endeavors, provided all contractual and communicative details are reviewed with meticulous precision. As favorable planetary aspects align toward the middle of this period, opportunities for personal advancement and rewarding milestones will unfold with remarkable clarity.`;
      p2 = `Psychologically, the forthcoming six-month window invites you to cultivate unwavering mental fortitude, adaptability, and emotional poise in the face of shifting external demands. Temporary delays or bureaucratic friction should be embraced as constructive learning opportunities designed to sharpen your problem-solving capabilities rather than causes for discouragement. Cultivating calm discernment and avoiding emotionally charged reactions will preserve vital mental reserves and protect your closest personal relationships. Maintaining regular contemplative practices, physical wellness routines, and seeking wise counsel during critical turning points will empower you to navigate this six-month passage with triumphant serenity and triumphant outcomes.`;
      break;

    case "lifespan":
      p1 = `Vedic longevity and physical well-being (Ayushya and Arogya) are governed by the inherent strength of your ${lagnaName} Ascendant lord, the vitality of the 8th house, and the supporting benefic glances of planetary guardians. Your astrological profile indicates robust foundational vitality and constitutional resilience, gifted with the natural capacity to recuperate effectively from temporary physiological imbalances. Operating within ${dashaStr} Mahadasha, your vital Prana reserves are well supported, though seasonal changes and demanding workloads require proactive mindfulness regarding your daily physical limits. Honoring your biological rhythms through wholesome nutrition and regular exercise preserves long-term longevity and vibrant stamina.`;
      p2 = `At a holistic level, mind and body are inextricably linked in Vedic wisdom, meaning mental tranquility directly nurtures physical cellular rejuvenation and immune defense. Guarding against nervous exhaustion, irregular sleep cycles, and unnecessary mental anxiety will protect your digestive fire (Agni) and promote optimal energetic flow throughout your bodily systems. Aligning your lifestyle habits with the elemental nature of your ${moonName} Moon sign—balancing hydration, fresh nourishing meals, and restorative deep breathing—fosters lasting vitality. By respecting your body as a sacred temple and embracing preventive Ayurvedic care, you cultivate vibrant longevity, mental acuity, and enduring health.`;
      break;

    case "marriage":
      p1 = `The sacred realm of marriage and committed partnerships is governed by the 7th house from your ${lagnaName} Ascendant, the disposition of Venus, and the current Gochara transits activating your relationship axis. For ${genderStr.toLowerCase()} natives at age ${ageInt}, the influence of ${dashaStr} Mahadasha brings meaningful developments in relational harmony, demanding maturity, mutual respect, and emotional transparency. Planetary placements indicate that whether nurturing an established union or preparing for a new alliance, cultivating shared moral values and joint life goals forms the cornerstone of lasting happiness. Auspicious transits encourage meaningful companionship and supportive domestic bonds that strengthen over time.`;
      p2 = `Psychologically, a truly fulfilling relationship requires balancing healthy personal independence with compassionate, empathetic togetherness and heartfelt vulnerability. Periodic misunderstandings or contrasting communication styles should be handled with patient dialogue rather than defensive silence, allowing deeper intimacy to emerge from resolved challenges. Developing active listening skills and celebrating each other's personal evolution creates an unshakeable bond of mutual trust and affection. By honoring the divine feminine and masculine energies within your relationship and practicing everyday appreciation, you build an enduring sanctuary of marital bliss and emotional security.`;
      break;

    case "children":
      p1 = `Matters concerning children, lineage, and progeny (Santana Bhava) are illuminated by the 5th house from your ${lagnaName} Ascendant and the benevolent guardianship of Jupiter (Putrakaraka). Under the ongoing influence of ${dashaStr} Mahadasha and ${bhuktiStr} Bhukti, the cosmic environment favors family continuity, intellectual creativity, and meaningful generational bonds. Planetary energies support the prosperity, academic growth, and character development of children, while guiding prospective parents toward auspicious astrological timing for conception and family expansion. The positive radiation of benefic planets ensures that ancestral blessings flow generously into your family lineage.`;
      p2 = `On an emotional and psychological plane, nurturing children or mentoring the younger generation requires a delicate balance of loving encouragement, moral guidance, and respectful personal space. Creating an open, judgment-free home environment where young minds feel safe to express their aspirations, fears, and curiosities strengthens lifelong family affection. When facing generational differences or parenting dilemmas, responding with calm understanding rather than rigid authority fosters mutual respect and deep emotional closeness. By dedicating quality time to family togetherness and imparting enduring spiritual values, you cultivate profound domestic contentment and joyous family blessings.`;
      break;

    case "education_travel":
      p1 = `Academic pursuits, intellectual specialization, and overseas travel prospects are powerfully governed by the 4th, 5th, and 9th houses of your birth chart, synergized by the inquisitive grace of your ${lagnaName} Ascendant. For young scholars and ambitious professionals at age ${ageInt}, the current planetary cycle of ${dashaStr} Mahadasha activates favorable transits for higher education, specialized skill acquisitions, and international connections. Whether seeking admission to prestigious institutions, preparing for competitive examinations, or exploring opportunities across distant borders, cosmic indicators point toward substantial intellectual breakthroughs. Focused preparation and diligent research will open doors that once seemed distant.`;
      p2 = `Psychologically, academic excellence and successful travel require unwavering concentration, disciplined time management, and the resilience to adapt to unfamiliar cultural environments. Overcoming occasional study fatigue or anxiety regarding competitive benchmarks is best achieved through structured daily routines and calm, consistent effort rather than stressful cramming. Cultivating genuine intellectual curiosity, seeking mentorship from respected teachers, and maintaining emotional equilibrium during transitional phases will ensure outstanding progress. By maintaining faith in your unique intellectual capabilities and embracing new horizons with an open heart, you achieve academic distinction and rewarding global experiences.`;
      break;

    case "job":
      p1 = `Professional destiny, societal status, and karmic career achievements (Karma Bhava) are governed by the 10th house from your ${lagnaName} Ascendant and the authoritative guidance of the Sun and Saturn. Operating under ${dashaStr} Mahadasha and ${bhuktiStr} Bhukti at age ${ageInt}, you stand at an influential juncture where your vocational expertise, leadership capabilities, and past diligence receive meaningful recognition. Planetary transits encourage career expansion, executive responsibility, and fruitful negotiations with organizational superiors or key clients. Focused execution, strategic planning, and unwavering professional ethics will serve as your greatest catalysts for sustainable professional ascent and financial stability.`;
      p2 = `On an emotional and mental level, professional growth demands navigating workplace dynamics with diplomatic composure, emotional intelligence, and steadfast resilience under pressure. Avoiding workplace gossip, setting healthy boundaries against professional burnout, and maintaining collaborative humility will earn the enduring respect of peers and industry leaders alike. Channel your creative ambitions into purposeful projects that create genuine value, rather than pursuing immediate status without substance. By aligning your career aspirations with your core moral values and delivering excellence with integrity, you establish an illustrious professional reputation, financial independence, and lasting authority.`;
      break;

    case "family":
      p1 = `Family life, ancestral lineage, and the accumulation of wealth (Kutumba and Dhana Sthana) are governed by the 2nd and 4th houses from your ${lagnaName} Ascendant, nurtured by the stabilizing influence of your ${moonName} Moon. Under the prevailing vibrations of ${dashaStr} Mahadasha, cosmic energies support domestic harmony, real estate stability, and the steady preservation of financial assets. Favorable planetary aspects indicate opportunities for expanding family wealth, resolving long-standing property matters, and celebrating auspicious gatherings within the household. Your natural sense of responsibility toward family welfare serves as a protective shield ensuring domestic prosperity and security.`;
      p2 = `Psychologically, the home environment serves as your sacred emotional retreat, where peace of mind, affectionate companionship, and genuine mutual understanding are paramount. Mindful communication and gentle speech (Vak Suddhi) prevent minor domestic disagreements from escalating, fostering an atmosphere of mutual empathy and warmth among all family members. Cultivating gratitude for ancestral heritage while creating harmonious traditions for future generations deepens emotional roots and strengthens domestic bonds. By prioritizing familial togetherness, practicing financial prudence, and maintaining a welcoming home sanctuary, you enjoy enduring domestic peace, emotional security, and lasting prosperity.`;
      break;

    default:
      p1 = `Based on the deep astrological interaction between your ${lagnaName} Ascendant and ${moonName} Moon sign, cosmic energies strongly influence your ${catLabel.toLowerCase()} at this stage of life. Operating under the planetary guidance of ${dashaStr} Mahadasha and ${bhuktiStr} Bhukti, celestial transits are aligning to provide constructive momentum, clarity of direction, and valuable opportunities for substantial long-term advancement. By synchronizing your daily actions with these broader planetary currents, you will find favorable circumstances manifesting to assist your progress. Diligent preparation, ethical integrity, and steady perseverance ensure that you make the most of this empowering astrological period.`;
      p2 = `On an internal psychological plane, this cosmic phase invites you to cultivate emotional resilience, mental clarity, and profound self-awareness while navigating your daily responsibilities. Releasing subconscious doubts, establishing disciplined self-care routines, and maintaining a balanced perspective will protect your inner peace amidst external demands. Trusting your innate intuition and making decisions rooted in ethical values rather than short-term anxiety unlocks your highest capabilities. By cultivating patience, practicing daily gratitude, and aligning your spirit with cosmic harmony, you achieve enduring fulfillment, personal excellence, and profound peace of mind.`;
      break;
  }

  return `${p1}\n\n${p2}`;
}

function buildRichMindsetFallback(
  lagnaName: string,
  moonName: string,
  dashaStr: string,
  bhuktiStr: string,
  ageInt: number,
  _genderStr: string
): string {
  const p1 = `At age ${ageInt}, your current life circumstances and daily environment are powerfully shaped by the active transition of ${dashaStr} Mahadasha and ${bhuktiStr} Bhukti, filtered through your ${lagnaName} Ascendant and ${moonName} Moon. You are experiencing an active, demanding phase where multiple practical responsibilities across domestic life, personal aspirations, and professional duties require concurrent attention. Planetary transits are stirring fresh ambitions while demanding careful management of your energy and daily schedule to prevent feeling overwhelmed by competing priorities. Concrete developments regarding personal projects, living arrangements, or career responsibilities are unfolding, urging you to stay grounded, practical, and proactive in every decision you make.`;

  const p2 = `Emotionally, your present state of mind is characterized by a strong undercurrent of determination mixed with moments of quiet restlessness or heightened sensitivity to external pressures. The lunar placement in ${moonName} makes your feelings responsive to your immediate environment, meaning workplace tensions or familial expectations can temporarily test your emotional equilibrium. You are consciously striving to maintain poise, inner dignity, and a positive outlook, yet you may occasionally feel that your tireless efforts and silent sacrifices are not fully appreciated by those around you. Recognizing that this emotional sensitivity is a natural reflection of planetary transits will help you observe your feelings without self-judgment.`;

  const p3 = `At the subconscious and psychological level, profound internal shifts are underway as you evaluate your true life purpose, deeper priorities, and the authenticity of your commitments. Old patterns of accommodating others at the expense of your own peace of mind are beginning to dissolve, making way for a stronger, more self-respecting sense of personal sovereignty. You are seeking meaningful depth and lasting security rather than superficial distractions, intuitively desiring relationships and endeavors that resonate with your core values. This internal transformation may feel intense at times, but it is preparing you for a far more empowered, clear-headed, and purposeful chapter of your life.`;

  const p4 = `To navigate this current phase with triumphant ease and mental serenity, Vedic wisdom counsels you to integrate deliberate moments of calm reflection and physical grounding into your daily routine. Prioritize consistent sleep schedules, mindful breathing (Pranayama), and quiet contemplative practices to soothe mental fatigue and recharge your spiritual energy. When faced with complex choices, step back from immediate emotional reactions and make decisions from a space of calm patience, trusting in the protective guidance of your planetary lords. Dedicating a few moments each day to gratitude, prayer, or connecting with nature will dissolve anxiety, restore clarity, and align you with profound cosmic blessings.`;

  return `${p1}\n\n${p2}\n\n${p3}\n\n${p4}`;
}

export function usePredictionEngine() {
  const session = useKundliViewerStore((state) => state.session);
  const language = useAppStore((state) => state.language);
  const geminiApiKey = useAppStore((state) => state.geminiApiKey);
  const ayanamsaModel = useAppStore((state) => state.ayanamsaModel);
  
  const [predictions, setPredictions] = useState<TranslatedPrediction[]>([]);
  const [currentMindset, setCurrentMindset] = useState<TranslatedPrediction | null>(null);
  
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(t("ramanbhavishya.loadingInitial", "Translating cosmic energies into guidance..."));
  const [ashirvada, setAshirvada] = useState<string>("");

  useEffect(() => {
    async function loadPredictions() {
      if (!session) return;
      setIsLoading(true);

      let dashaStr = "Dasha";
      let bhuktiStr = "Bhukti";
      const birthDateStr = session.input.birthDate;
      const ageYears = birthDateStr
        ? ageDecimalYearsAt(
            session.input.birthDate,
            session.input.birthTime,
            session.input.latitude || 14.5479,
            session.input.longitude || 74.3187,
            new Date()
          )
        : 30;
      const ageInt = Math.floor(ageYears);
      const genderStr = session.input.gender === "Female" ? "Female" : "Male";

      const lagnaName = session.result.lagnaRashi?.english || "Ascendant";
      const moonName = session.result.moonSign?.english || "Moon Sign";

      try {
        const currentBhuktiData = findBhuktiAtAge(session.result, ageYears);
        if (currentBhuktiData) {
          dashaStr = currentBhuktiData.maha.planet;
          bhuktiStr = currentBhuktiData.bhukti;
        }
      } catch (err) {
        console.warn("Could not determine running Dasha/Bhukti, using defaults", err);
      }

      try {
        setLoadingText(t("ramanbhavishya.loadingEngine", "Calculating planetary alignments & life chapters..."));
        
        const tradPanchanga = calculateTraditionalBaggona(
          session.input.birthDate,
          session.input.birthTime,
          session.input.latitude || 14.5479,
          session.input.longitude || 74.3187,
          ayanamsaModel
        );
        const baggonaPreds = generateBaggonaPredictions(session.result, tradPanchanga, "en", session.input);
        const personalPreds = generatePersonalReading(session.result, session.input, "en");

        setLoadingText(t("ramanbhavishya.loadingAI", "Synthesizing deep astrological forecasts..."));
        
        const moonPlanet = session.result.planets?.find(p => p.name === "Moon");
        const nakshatraName = moonPlanet?.nakshatra?.english || "Unknown";

        const contextStr = JSON.stringify({
          age: ageInt,
          gender: genderStr,
          lagna: session.result.lagnaRashi,
          moonSign: session.result.moonSign,
          nakshatra: nakshatraName,
          currentDasha: dashaStr,
          currentBhukti: bhuktiStr,
          traditionalPredictions: baggonaPreds,
          personalReadings: personalPreds
        }, null, 2);

        const languageNames: Record<string, string> = {
          kn: "Kannada",
          hi: "Hindi",
          te: "Telugu",
          ta: "Tamil",
          en: "English"
        };
        const targetLanguage = languageNames[language.split('-')[0]] || "English";
        
        const prompt = `Role & Expertise:
You are an expert astrologer and intuitive psychologist specializing in deep, transformative readings. Your task is to provide an insightful astrological forecast.
Do not use markdown formatting like asterisks or hashtags since your response might be read aloud via text-to-speech.

Here is the user's astrological data computed by our engine, which MUST form the exclusive basis of your predictions:
${contextStr}

Your task is to take the raw predictions from our engine (traditionalPredictions and personalReadings) and ORGANIZE, PARAPHRASE, and EXPAND them.
DO NOT INVENT your own astrological logic. You must STRICTLY base all your predictions on the provided engine data.

Structural Guidelines:
For EACH category, you must strictly follow a 2-paragraph format:

• Paragraph 1 (Astrological Events & Predictions): 
Detail the primary astrological transits, planetary movements, aspects, and concrete external events or real-world manifestations predicted for this area based on the engine data. Keep the tone grounded, specific, and predictive. This paragraph MUST contain at least 5 to 6 complete lines (approx. 350-500 characters, 70-90 words). NEVER give brief 1-2 line summaries or bullet points.

• Paragraph 2 (Emotional & Psychological Landscape): 
Explore the internal impact of these events with visceral, evocative language. Describe the person's precise mental state, emotional evolution, underlying fears, subconscious realizations, and inner feelings. Focus on deep emotional resonance and psychological truth. This paragraph MUST contain at least 5 to 6 complete lines (approx. 350-500 characters, 70-90 words). NEVER give brief 1-2 line summaries or bullet points.

Tone & Style Rules:
- Please use normal, simple, and easily readable words. Do not use highly complex or archaic literary words. The emotional resonance should come from the meaning, not from difficult vocabulary. Make it sound beautiful yet accessible to everyone.
- Avoid generic horoscope fluff; use evocative, vivid, and highly descriptive imagery.
- Maintain an empathetic yet realistic tone.
- Ensure a seamless contrast between the external narrative (Paragraph 1) and the internal/emotional reality (Paragraph 2).
- If writing in Kannada, use traditional Brahmin Kannada dialect (Havyaka/Madhwa/Smartha) and strictly use Kannada script (ಕನ್ನಡ ಲಿಪಿ). Highlight both blessings and challenging aspects gently.
- CRITICAL LANGUAGE RULE: NEVER mix English letters, Latin characters, acronyms, or Latin numbers into the output. The response values MUST be 100% in the native script of the ${targetLanguage} language. DO NOT use transliteration (e.g., writing English words in native script). DO NOT mix words or scripts from other languages (e.g. if Kannada, do NOT use Telugu/Hindi characters). Ensure grammar is flawless and sentences are fully complete without fragmented words or hanging characters.
- For "current_phase", emphasize what is happening right now based on the user's current Age (${ageInt}), their running Dasha (${dashaStr}), Bhukti (${bhuktiStr}), and the current life chapters provided in the personalReadings.
- For "next_six_months", forecast the major events over the next 6 months based on the monthly summaries provided in the engine data.
- For other categories (lifespan, marriage, ${ageInt < 23 ? 'education_travel' : 'children'}, job, family), extract the relevant information from the provided traditionalPredictions and personalReadings.
${ageInt < 23 ? '- For "education_travel", write exactly 2 paragraphs about their education prospects and 1 paragraph about traveling, studying outside India, or getting a job overseas based on the engine data.' : ''}
- For "ashirvada", generate a unique, emotionally resonant Ashirvada (blessing) in the selected language. Write it from the persona of a highly experienced astrologer with 30+ years of experience, offering deep blessings based on their Kundali and current Dasha/Dosha.

Respond EXCLUSIVELY in the ${targetLanguage} language for the values (the keys must remain exactly as specified in English).

Return ONLY a valid JSON string (no markdown, no codeblocks, no json wrapper) with the exact following English keys mapping to the detailed text reading for each:
{
  "current_phase": "...",
  "next_six_months": "...",
  "lifespan": "...",
  "marriage": "...",
  "${ageInt < 23 ? 'education_travel' : 'children'}": "...",
  "job": "...",
  "family": "...",
  "ashirvada": "..."
}`;

        const mindsetPrompt = `Role & Expertise:
You are an expert astrologer and intuitive psychologist. 

Based on this user's astrological data:
${contextStr}

Your task is to predict the user's CURRENT MINDSET and immediate life circumstances with shocking accuracy based on their age (${ageInt}), gender (${genderStr}), running Dasha (${dashaStr}), and running Bhukti (${bhuktiStr}).
Write exactly 4 paragraphs (each paragraph containing at least 5 to 6 lines, approx. 350-500 characters, 70-90 words):
- Paragraph 1: Precise current situation, what is happening with them today (e.g., buying a new thing, home situation, daily events, professional circumstances).
- Paragraph 2: Core emotions right now (happy, sad, anxious, neutral, specific emotional states).
- Paragraph 3: The underlying psychological reality (subconscious thoughts, hidden fears, unspoken desires).
- Paragraph 4: Actionable advice on what they need to do to come out of this or handle this based on astrological remedies and mindset shifts.

Rules:
- MUST be based strictly on the provided engine data (Dasha, Bhukti, age, scores). Do not invent things from the internet. Use your intelligence to combine the rules and scores to find the accurate prediction.
- It needs to come with beautiful, impressive details. The user should be shocked by the accuracy.
- CRITICAL LANGUAGE RULE: NEVER mix English letters, Latin characters, acronyms, or Latin numbers into the output. The response values MUST be 100% in the native script of the ${targetLanguage} language. DO NOT use transliteration (e.g., writing English words in native script). DO NOT mix words or scripts from other languages (e.g. if Kannada, do NOT use Telugu/Hindi characters). Ensure grammar is flawless and sentences are fully complete without fragmented words or hanging characters.

Respond EXCLUSIVELY in the ${targetLanguage} language.
Return ONLY a valid JSON string (no markdown, no codeblocks, no json wrapper) with a single key "mindset" mapping to the 4-paragraph text:
{
  "mindset": "..."
}`;
        
        const dynamicCategories = getDeepInsightCategories(ageInt);
        const mockKeys = [...dynamicCategories.map(c => c.id), "ashirvada"];

        const [jsonResponse, mindsetResponse] = await Promise.all([
          askGeminiBatch(prompt, geminiApiKey, mockKeys),
          askGeminiBatch(mindsetPrompt, geminiApiKey, ["mindset"])
        ]);

        setAshirvada(jsonResponse["ashirvada"] || "May divine forces grant you strength, clarity, and peace on your life journey.");

        const isMindsetDeep = (mindsetResponse["mindset"] || "").trim().length >= 450;
        const rawMindsetText = isMindsetDeep 
          ? mindsetResponse["mindset"].trim() 
          : buildRichMindsetFallback(lagnaName, moonName, dashaStr, bhuktiStr, ageInt, genderStr);

        let translatedMindsetText = rawMindsetText;
        if (language !== "en" && !isMindsetDeep) {
          translatedMindsetText = await translateText(rawMindsetText, language, "en");
        } else if (language !== "en" && isMindsetDeep) {
          translatedMindsetText = rawMindsetText;
        }

        const translatedMindsetCategory = await translateText("Current State of Mind & Life (Present Moment)", language, "en");

        setCurrentMindset({
          category: "Current State of Mind & Life (Present Moment)",
          text: rawMindsetText,
          translatedCategory: translatedMindsetCategory,
          translatedText: translatedMindsetText
        });

        const translated: TranslatedPrediction[] = [];

        for (const cat of dynamicCategories) {
          const translatedCategory = await translateText(cat.label, language, "en");
          let rawText = (jsonResponse[cat.id] || "").trim();
          
          const isTextDeep = rawText.length >= 450 && rawText.includes("\n") && !rawText.includes("No prediction available");
          
          if (!isTextDeep) {
            rawText = buildRichCategoryFallback(cat.id, cat.label, lagnaName, moonName, dashaStr, bhuktiStr, ageInt, genderStr);
            let translatedText = rawText;
            if (language !== "en") {
              translatedText = await translateText(rawText, language, "en");
            }
            translated.push({
              category: cat.label,
              text: rawText,
              translatedCategory,
              translatedText
            });
          } else {
            translated.push({
              category: cat.label,
              text: rawText,
              translatedCategory,
              translatedText: rawText
            });
          }
        }

        setPredictions(translated);
      } catch (e: any) {
        console.warn("[Master Engine Auto-Heal] AI prediction call failed, building 100% Kundali-accurate Master Engine predictions:", e);
        const healed: { category: string; text: string; translatedCategory: string; translatedText: string }[] = [];
        const fallbackCategories = getDeepInsightCategories(ageInt);
        
        for (const cat of fallbackCategories) {
          const translatedCategory = await translateText(cat.label, language, "en");
          const rawText = buildRichCategoryFallback(cat.id, cat.label, lagnaName, moonName, dashaStr, bhuktiStr, ageInt, genderStr);
          let translatedText = rawText;
          if (language !== "en") {
            translatedText = await translateText(rawText, language, "en");
          }

          healed.push({
            category: cat.label,
            text: rawText,
            translatedCategory,
            translatedText
          });
        }
        setPredictions(healed);

        const rawMindsetText = buildRichMindsetFallback(lagnaName, moonName, dashaStr, bhuktiStr, ageInt, genderStr);
        let translatedMindsetText = rawMindsetText;
        if (language !== "en") {
          translatedMindsetText = await translateText(rawMindsetText, language, "en");
        }
        const translatedMindsetCategory = await translateText("Current State of Mind & Life (Present Moment)", language, "en");
        setCurrentMindset({
          category: "Current State of Mind & Life (Present Moment)",
          text: rawMindsetText,
          translatedCategory: translatedMindsetCategory,
          translatedText: translatedMindsetText
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadPredictions();
  }, [session, language, geminiApiKey]);

  return { predictions, currentMindset, isLoading, loadingText, ashirvada };
}
