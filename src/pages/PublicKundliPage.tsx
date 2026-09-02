import React, { useEffect, useState, useRef, useMemo } from "react";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import { generateDashaTimeline, type DashaEntry } from "../core/DashaBhuktiEngine";
import { resolvePlaceFromPincode } from "../services/locationApi";
import { formatPickerDateLocalYmd } from "../core/birthTime";
import { askGemini } from "../core/GeminiEngine";
import { useAuthStore } from "../features/auth/authStore";
import { usePricingConfigStore } from "../features/wallet/pricingConfigStore";
import {
  deductPriestCoins,
  saveKundliToFirestore,
  getOrCreatePriestWallet,
  type KundliHistoryDoc
} from "../db/firestoreDb";
import {
  getPublicKundliText,
  PUBLIC_KUNDLI_LANGUAGES,
  type PublicKundliLang
} from "../features/publicKundli/publicKundliLocale";
import {
  calculatePublicKundliProfile,
  generateDynamicLifeInsights,
  generateDynamicQaFallback,
  generateDeepPersonalityAnalysis,
  type PublicKundliProfile,
  type DynamicLifeAnalysisOutput,
  type DeepPersonalityOutput
} from "../features/publicKundli/publicKundliEngine";
import TraditionalSouthPatrika from "../components/kundli/TraditionalSouthPatrika";
import DatePicker from "../components/DatePicker";
import BirthTimePicker from "../components/BirthTimePicker";
import { decodeDevoteeToken } from "../utils/tokenCipher";
import { notifyPublicPremiumPdfRequested } from "../features/notifications/notificationService";

export default function PublicKundliPage(): JSX.Element {
  // 0. Auth & Dynamic Pricing Configuration from Super Admin
  const { currentUser, isAuthenticated } = useAuthStore();
  const { getCoins, initSubscription } = usePricingConfigStore();

  useEffect(() => {
    const unsub = initSubscription();
    return () => {
      if (unsub) unsub();
    };
  }, [initSubscription]);

  const kundliGenCost = getCoins("PUBLIC_KUNDLI_GENERATION", 500);
  const liveAnalysisCost = getCoins("PUBLIC_LIFE_ANALYSIS_QA", 1000);
  const pdfDownloadCost = getCoins("PUBLIC_KUNDLI_PDF_DOWNLOAD", 500);
  const tabUnlockCost = getCoins("PUBLIC_TAB_UNLOCK", 200);

  // 1. Language State (default Kannada)
  const [selectedLang, setSelectedLang] = useState<PublicKundliLang>("kn");
  const [pdfLang, setPdfLang] = useState<PublicKundliLang>("kn");

  // 2. Real-time Online/Offline Connectivity Guard
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 3. Priest / User Attribution (Auth session with URL param priority)
  const [linkedUserId, setLinkedUserId] = useState<string>(() => {
    if (currentUser) return currentUser;
    return "PRIEST";
  });
  const [linkedPriestName, setLinkedPriestName] = useState<string>(() => {
    if (currentUser && currentUser !== "PRIEST") return currentUser;
    return "Shreeram Pandit";
  });

  // 4. Form State (Janma Kundali Input)
  const [form, setForm] = useState<KundliInput>({
    name: "",
    birthDate: "1995-05-15",
    birthTime: "10:30",
    latitude: 14.5479,
    longitude: 74.3188,
    gothra: "",
    gender: "Male",
    pincode: "581326"
  });

  const [birthDatePicker, setBirthDatePicker] = useState<Date | null>(new Date(1995, 4, 15, 12, 0, 0));
  const [birthTimeHm, setBirthTimeHm] = useState<string>("10:30");
  const [locationCore, setLocationCore] = useState<string>("Gokarna (581326)");
  const [homePlaceName, setHomePlaceName] = useState<string>("");
  const [pinResolving, setPinResolving] = useState<boolean>(false);

  // 5. Calculation State & Comprehensive Profile
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [result, setResult] = useState<KundliOutput | null>(null);
  const [dashaList, setDashaList] = useState<DashaEntry[]>([]);
  const [publicProfile, setPublicProfile] = useState<PublicKundliProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 6. Interactive 6-Tab State in Result Screen
  const [activeTab, setActiveTab] = useState<
    "patrika" | "personality" | "planets" | "dasha" | "analysis" | "remedies"
  >("personality");

  // 7. Live Life Analysis & Devotee Q&A State
  const [isLiveAnalysisOpen, setIsLiveAnalysisOpen] = useState<boolean>(false);
  const [isSynthesizingAnalysis, setIsSynthesizingAnalysis] = useState<boolean>(false);
  const [liveAnalysisInsights, setLiveAnalysisInsights] = useState<DynamicLifeAnalysisOutput | null>(null);

  // Devotee Q&A
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [isAnsweringQuestion, setIsAnsweringQuestion] = useState<boolean>(false);
  const [qaHistory, setQaHistory] = useState<Array<{ question: string; answer: string }>>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const speechRecognitionRef = useRef<any>(null);

  // 8. Audio Speech Synthesis Narration State
  const [isPlayingNarration, setIsPlayingNarration] = useState<boolean>(false);
  const [isPausedNarration, setIsPausedNarration] = useState<boolean>(false);
  const [narrationSpeed, setNarrationSpeed] = useState<number>(1.0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 9. PDF Export References
  const exportPdfRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // 10. Parse Deep Link Parameters on Mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);

    const userParam = searchParams.get("user") || searchParams.get("priest");
    if (userParam) setLinkedUserId(userParam);

    const nameParam = searchParams.get("name") || searchParams.get("priestName");
    if (nameParam) setLinkedPriestName(nameParam);

    const langParam = searchParams.get("lang") as PublicKundliLang;
    if (langParam && ["kn", "en", "hi", "te", "ta"].includes(langParam)) {
      setSelectedLang(langParam);
      setPdfLang(langParam);
    }

    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      try {
        const decoded = decodeDevoteeToken(tokenParam);
        if (decoded) {
          if (decoded.name) setForm((f) => ({ ...f, name: decoded.name || "" }));
          if (decoded.dob) {
            const parts = decoded.dob.split("-");
            if (parts.length === 3) {
              setBirthDatePicker(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0));
              setForm((f) => ({ ...f, birthDate: decoded.dob || "1995-05-15" }));
            }
          }
          if (decoded.tob) {
            setBirthTimeHm(decoded.tob);
            setForm((f) => ({ ...f, birthTime: decoded.tob || "10:30" }));
          }
          if (decoded.pincode) {
            setForm((f) => ({ ...f, pincode: decoded.pincode }));
          }
          if (decoded.gotra) {
            setForm((f) => ({ ...f, gothra: decoded.gotra }));
          }
        }
      } catch (err) {
        console.warn("[PublicKundli] Token decode fallback:", err);
      }
    }
  }, []);

  // Pincode auto-resolution
  useEffect(() => {
    const pin = form.pincode?.trim() || "";
    if (!/^[1-9]\d{5}$/.test(pin)) return;

    let isMounted = true;
    setPinResolving(true);
    setLocationCore(`${pin} · Resolving...`);

    void resolvePlaceFromPincode(pin)
      .then((place) => {
        if (!isMounted) return;
        if (place) {
          setForm((f) => ({
            ...f,
            latitude: place.lat,
            longitude: place.lng,
            pincode: pin
          }));
          setLocationCore(`${place.villageName} (${pin})`);
        } else {
          setLocationCore(`Gokarna (581326)`);
        }
      })
      .finally(() => {
        if (isMounted) setPinResolving(false);
      });

    return () => {
      isMounted = false;
    };
  }, [form.pincode]);

  const placeDisplay = useMemo(
    () => (homePlaceName.trim() ? `${homePlaceName.trim()} · ${locationCore}` : locationCore),
    [homePlaceName, locationCore]
  );

  const txt = (key: string) => getPublicKundliText(key, selectedLang);

  // Dynamic Deep Personality data in current language
  const deepPersonalityData: DeepPersonalityOutput | null = useMemo(() => {
    if (!publicProfile || !result) return null;
    return generateDeepPersonalityAnalysis(publicProfile, result, selectedLang);
  }, [publicProfile, result, selectedLang]);

  // --------------------------------------------------------------------------
  // Action: Audio Voice Narration
  // --------------------------------------------------------------------------
  const handlePlayNarration = () => {
    if (!deepPersonalityData) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Voice narration is not supported on this browser.");
      return;
    }

    if (isPausedNarration) {
      window.speechSynthesis.resume();
      setIsPausedNarration(false);
      setIsPlayingNarration(true);
      return;
    }

    window.speechSynthesis.cancel();

    const fullText = deepPersonalityData.spokenNarrationFullText;
    const utterance = new SpeechSynthesisUtterance(fullText);

    const langVoiceMap: Record<PublicKundliLang, string> = {
      kn: "kn-IN",
      en: "en-IN",
      hi: "hi-IN",
      te: "te-IN",
      ta: "ta-IN"
    };

    utterance.lang = langVoiceMap[selectedLang] || "kn-IN";
    utterance.rate = narrationSpeed;

    utterance.onstart = () => {
      setIsPlayingNarration(true);
      setIsPausedNarration(false);
    };

    utterance.onend = () => {
      setIsPlayingNarration(false);
      setIsPausedNarration(false);
    };

    utterance.onerror = () => {
      setIsPlayingNarration(false);
      setIsPausedNarration(false);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseNarration = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.pause();
    setIsPausedNarration(true);
    setIsPlayingNarration(false);
  };

  const handleStopNarration = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsPlayingNarration(false);
    setIsPausedNarration(false);
  };

  // --------------------------------------------------------------------------
  // Action 1: Generate Kundali (500 Coins)
  // --------------------------------------------------------------------------
  const handleGenerateKundali = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      setErrorMessage(txt("offlineBannerMsg"));
      return;
    }

    const birthDateYmd = birthDatePicker ? formatPickerDateLocalYmd(birthDatePicker) : form.birthDate;
    const cleanTime = birthTimeHm.trim() || form.birthTime || "12:00";

    if (!form.name.trim()) {
      setErrorMessage(selectedLang === "kn" ? "ದಯವಿಟ್ಟು ಭಕ್ತರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ." : "Please enter the devotee name.");
      return;
    }

    setIsCalculating(true);
    setErrorMessage(null);

    try {
      const kundliPayload: KundliInput = {
        name: form.name.trim(),
        birthDate: birthDateYmd,
        birthTime: cleanTime,
        latitude: form.latitude || 14.5479,
        longitude: form.longitude || 74.3188,
        gothra: form.gothra?.trim() || "",
        gender: form.gender || "Male",
        pincode: form.pincode || "581326"
      };

      const computed = await calculateKundliWithPlaceSun(kundliPayload, { ayanamsaModel: "lahiri" });
      const dasha = generateDashaTimeline(computed);
      const profile = calculatePublicKundliProfile(computed, birthDateYmd, cleanTime, form.latitude, form.longitude);
      profile.name = form.name.trim();

      setResult(computed);
      setDashaList(dasha);
      setPublicProfile(profile);

      const deterministicInsights = generateDynamicLifeInsights(profile, selectedLang);
      setLiveAnalysisInsights(deterministicInsights);
      setActiveTab("personality");

      try {
        await getOrCreatePriestWallet(linkedUserId, linkedPriestName);
        await deductPriestCoins(
          linkedUserId,
          kundliGenCost,
          `Public Janma Kundali: ${form.name.trim()} (${computed.lagnaRashi.english} Lagna)`,
          form.name.trim()
        );
      } catch (coinErr) {
        console.warn("[PublicKundli] Coin deduction log error:", coinErr);
      }

      try {
        const kundliDocId = `kundli_pub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const moonPlanet = computed.planets.find((p) => p.name === "Moon");
        const sunPlanet = computed.planets.find((p) => p.name === "Sun");
        const moonPada = computed.moonPada || 1;

        const historyDoc: KundliHistoryDoc = {
          id: kundliDocId,
          userId: linkedUserId,
          priestName: linkedPriestName,
          name: form.name.trim(),
          birthDate: birthDateYmd,
          birthTime: cleanTime,
          placeName: placeDisplay,
          latitude: form.latitude,
          longitude: form.longitude,
          pincode: form.pincode,
          gothra: form.gothra,
          rashi: computed.moonSign.english,
          rashiSanskrit: computed.moonSign.sanskrit,
          nakshatra: moonPlanet?.nakshatra?.english || "Ashwini",
          nakshatraSanskrit: moonPlanet?.nakshatra?.sanskrit || "ಅಶ್ವಿನಿ",
          pada: moonPada,
          lagnaRashi: computed.lagnaRashi.english,
          sunSign: sunPlanet?.rashi.english || "Aries",
          kundliData: computed,
          createdAt: new Date().toISOString()
        };

        void saveKundliToFirestore(historyDoc);
      } catch (dbErr) {
        console.warn("[PublicKundli] Firestore save log error:", dbErr);
      }
    } catch (err: any) {
      console.error("[PublicKundli] Calculation error:", err);
      setErrorMessage(err.message || "Failed to calculate Kundli. Please check inputs.");
    } finally {
      setIsCalculating(false);
    }
  };

  // --------------------------------------------------------------------------
  // Action 2: THE SINGLE ACTION BUTTON (1000 Coins)
  // --------------------------------------------------------------------------
  const handleOpenLiveAnalysis = async () => {
    if (!isOnline) {
      setErrorMessage(txt("offlineBannerMsg"));
      return;
    }
    if (!result || !publicProfile) return;

    setIsLiveAnalysisOpen(true);
    setIsSynthesizingAnalysis(true);
    setActiveTab("analysis");

    try {
      try {
        await deductPriestCoins(
          linkedUserId,
          liveAnalysisCost,
          `Current Life Astrology Live Analysis & Q&A: ${form.name.trim()}`,
          form.name.trim()
        );
      } catch (coinErr) {
        console.warn("[PublicKundli] Live analysis coin deduction error:", coinErr);
      }

      const prompt = `You are the Chief Vedic Astrologer for Baggona Panchanga (ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ - ಗೋಕರ್ಣ).
Provide a deep, reassuring, 100% accurate Vedic life status analysis for devotee ${publicProfile.name} in direct spoken address style.
Language: ${selectedLang === "kn" ? "Kannada (ಕನ್ನಡ)" : selectedLang === "hi" ? "Hindi (हिन्दी)" : selectedLang === "te" ? "Telugu (తెలుగు)" : selectedLang === "ta" ? "Tamil (தமிழ்)" : "English"}.
Devotee Details:
- Name: ${publicProfile.name}
- Age: ${publicProfile.ageYears} years
- Lagna: ${publicProfile.lagnaSign} (${publicProfile.lagnaSanskrit})
- Moon Sign: ${publicProfile.moonSign} (${publicProfile.moonSanskrit})
- Nakshatra: ${publicProfile.moonNakshatra} (Pada ${publicProfile.moonPada})
- 10th Lord: ${publicProfile.lord10}
- 7th Lord: ${publicProfile.lord7}
- 6th Lord: ${publicProfile.lord6}
- 5th Lord: ${publicProfile.lord5}
- Current Mahadasha: ${publicProfile.currentMahadasha} (${publicProfile.currentBhukti} Bhukti)
- Maandi House: ${publicProfile.maandiHouse}th house in ${publicProfile.maandiRashi}

Return a valid JSON object with EXACTLY these 5 keys:
{
  "currentPhase": "2-3 sentences explaining their active life phase based on ${publicProfile.currentMahadasha} Mahadasha and ${publicProfile.currentBhukti} Bhukti in direct face-to-face address.",
  "subconsciousMind": "2 sentences identifying their internal mental state and emotional focus.",
  "careerFinance": "2 sentences with practical astrological guidance based on 10th lord ${publicProfile.lord10}.",
  "relationshipsHealth": "2 sentences on family harmony and vitality based on 7th lord ${publicProfile.lord7} and 6th lord ${publicProfile.lord6}.",
  "gokarnaRemedy": "Authentic Gokarna Mahabaleshwara Seva (${publicProfile.gokarnaSevaName}), Sankalpa, and deity mantra for immediate peace and success."
}`;

      const aiResponse = await askGemini(prompt, JSON.stringify(result || {}), "", selectedLang, {
        temperature: 0.3
      });

      try {
        const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedInsights = JSON.parse(cleanJson);
        if (parsedInsights && parsedInsights.currentPhase) {
          setLiveAnalysisInsights(parsedInsights);
          return;
        }
      } catch (parseErr) {
        console.warn("[PublicKundli] JSON parse fallback to deterministic engine:", parseErr);
      }

      const fallbackInsights = generateDynamicLifeInsights(publicProfile, selectedLang);
      setLiveAnalysisInsights(fallbackInsights);
    } catch (analysisErr) {
      console.error("[PublicKundli] Analysis error:", analysisErr);
      const fallbackInsights = generateDynamicLifeInsights(publicProfile, selectedLang);
      setLiveAnalysisInsights(fallbackInsights);
    } finally {
      setIsSynthesizingAnalysis(false);
    }
  };

  // --------------------------------------------------------------------------
  // Tab Unlock and Selection Handler (200 Coins for detailed tab reading)
  // --------------------------------------------------------------------------
  const [unlockedTabs, setUnlockedTabs] = useState<Set<string>>(
    new Set(["patrika", "personality"])
  );

  const handleSelectTab = async (
    tabId: "patrika" | "personality" | "planets" | "dasha" | "analysis" | "remedies"
  ) => {
    setActiveTab(tabId);
    if (!unlockedTabs.has(tabId) && result && publicProfile && tabId !== "analysis") {
      setUnlockedTabs((prev) => new Set([...prev, tabId]));
      try {
        await deductPriestCoins(
          linkedUserId,
          tabUnlockCost,
          `Public Kundali Tab Unlock (${tabId.toUpperCase()}): ${form.name.trim()}`,
          form.name.trim()
        );
      } catch (err) {
        console.warn("[PublicKundli] Tab unlock coin deduction error:", err);
      }
    }
  };

  // --------------------------------------------------------------------------
  // Action 3: Devotee Custom Q&A
  // --------------------------------------------------------------------------
  const handleAskQuestion = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const query = (customQ || userQuestion).trim();
    if (!query || !result || !publicProfile) return;

    if (!isOnline) {
      setErrorMessage(txt("offlineBannerMsg"));
      return;
    }

    setIsAnsweringQuestion(true);
    try {
      const prompt = `Devotee ${publicProfile.name} (Lagna: ${publicProfile.lagnaSign}, Moon: ${publicProfile.moonSign}, Nakshatra: ${publicProfile.moonNakshatra}, Dasha: ${publicProfile.currentMahadasha}, 10L: ${publicProfile.lord10}, 7L: ${publicProfile.lord7}, Maandi: ${publicProfile.maandiHouse}H) asks:
"${query}"

Language: ${selectedLang === "kn" ? "Kannada" : selectedLang === "hi" ? "Hindi" : selectedLang === "te" ? "Telugu" : selectedLang === "ta" ? "Tamil" : "English"}

As the Chief Baggona Panchanga Gokarna Astrologer speaking directly to the devotee:
1. Provide a direct, reassuring, authentic spoken Jyotishya answer (3-4 sentences).
2. Ground your prediction in their Lagna, house lords, and planetary transit.
3. Suggest a 1-line simple Vedic remedy or Sri Gokarna Mahabaleshwara Seva.`;

      const aiAnswer = await askGemini(prompt, JSON.stringify(result || {}), "", selectedLang, { temperature: 0.35 });
      setQaHistory((prev) => [...prev, { question: query, answer: aiAnswer.trim() }]);
      setUserQuestion("");
    } catch (err: any) {
      console.error("[PublicKundli] Q&A error:", err);
      const fallbackAnswer = generateDynamicQaFallback(query, publicProfile, selectedLang);
      setQaHistory((prev) => [...prev, { question: query, answer: fallbackAnswer }]);
    } finally {
      setIsAnsweringQuestion(false);
    }
  };

  // Voice Dictation
  const handleToggleVoiceDictation = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported on this browser. Please type your question.");
      return;
    }

    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langCodes: Record<PublicKundliLang, string> = {
        kn: "kn-IN",
        en: "en-IN",
        hi: "hi-IN",
        te: "te-IN",
        ta: "ta-IN"
      };
      recognition.lang = langCodes[selectedLang] || "kn-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0]?.transcript || "";
        setUserQuestion(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("[Voice] Recognition start error:", err);
      setIsListening(false);
    }
  };

  // Action 5: Send Details to spshripandit@gmail.com
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailStatusSuccess, setEmailStatusSuccess] = useState<string | null>(null);

  const handleSendEmailToAstrologer = async () => {
    if (!publicProfile) return;
    setIsSendingEmail(true);
    setEmailStatusSuccess(null);

    const emailSubject = `[Baggona Panchanga] ₹350 Premium Kundali PDF Request: ${publicProfile.name}`;
    const emailBody = `🕉️ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ - ಗೋಕರ್ಣ 🕉️

ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರೇ (spshripandit@gmail.com),
ನಾನು ₹350 ರ ಸಂಪೂರ್ಣ ರಾಜವೈಭವ ಜಾತಕ PDF ಪುಸ್ತಕ ಹಾಗೂ ನೇರ ದೂರವಾಣಿ ಸಮಾಲೋಚನೆ ಪಡೆಯಲು ಇಚ್ಚಿಸುತ್ತೇನೆ.

ಭಕ್ತರ ಜನನ ಹಾಗೂ ಜಾತಕ ವಿವರಗಳು:
------------------------------------------
👤 ಭಕ್ತರ ಹೆಸರು (Devotee Name): ${publicProfile.name}
📅 ಜನನ ದಿನಾಂಕ (Date of Birth): ${publicProfile.birthDate}
⏰ ಜನನ ಸಮಯ (Time of Birth): ${publicProfile.birthTime}
📍 ಸ್ಥಳ / ಪಿನ್‌ಕೋಡ್ (Location / Pincode): ${placeDisplay}
🪐 ಜನ್ಮ ಲಗ್ನ (Ascendant): ${publicProfile.lagnaSign} (${publicProfile.lagnaSanskrit})
🌙 ಜನ್ಮ ರಾಶಿ (Moon Sign): ${publicProfile.moonSign} (${publicProfile.moonSanskrit})
✨ ಜನ್ಮ ನಕ್ಷತ್ರ (Nakshatra & Pada): ${publicProfile.moonNakshatra} (ಪಾದ ${publicProfile.moonPada})
⏳ ಪ್ರಸ್ತುತ ದಶಾ (Current Dasha): ${publicProfile.currentMahadasha} (${publicProfile.currentBhukti} ಭುಕ್ತಿ)
${form.gothra ? `📜 ಗೋತ್ರ (Gothra): ${form.gothra}\n` : ""}
ವಿಶೇಷ ಕೋರಿಕೆ:
ದಯವಿಟ್ಟು ಸಕಲ ಗ್ರಹ ಯೋಗಗಳು, ದೋಷಗಳು (ಕಾಳಸರ್ಪ, ಮಾಂಗಲ್ಯ), 120-ವರ್ಷಗಳ ದಶಾ ಕಾಲಚಕ್ರ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸಂಕಲ್ಪ ಸೇವೆ ಒಳಗೊಂಡ ಪ್ರೀಮಿಯಂ PDF ಪುಸ್ತಕವನ್ನು ಒದಗಿಸಿ ನನ್ನೊಂದಿಗೆ ದೂರವಾಣಿ ಸಮಾಲೋಚನೆ ನಡೆಸಬೇಕಾಗಿ ವಿನಂತಿ.

ಧನ್ಯವಾದಗಳು,
${publicProfile.name}`;

    const mailtoUrl = `mailto:spshripandit@gmail.com?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    try {
      void notifyPublicPremiumPdfRequested({
        userName: publicProfile.name,
        birthDate: publicProfile.birthDate,
        birthTime: publicProfile.birthTime,
        rashi: `${publicProfile.moonSign} (${publicProfile.moonSanskrit})`,
        nakshatra: publicProfile.moonNakshatra,
        pada: publicProfile.moonPada,
        lagna: `${publicProfile.lagnaSign} (${publicProfile.lagnaSanskrit})`,
        location: placeDisplay,
        pincode: form.pincode,
        dasha: `${publicProfile.currentMahadasha} (${publicProfile.currentBhukti})`,
        targetEmail: "spshripandit@gmail.com"
      });

      try {
        if (typeof window !== "undefined") {
          window.location.href = mailtoUrl;
        }
      } catch {
        // Handled in environments where location navigation is restricted
      }

      setEmailStatusSuccess(txt("emailSentSuccess"));
    } catch (err) {
      console.warn("[PublicKundli] Email trigger error:", err);
      try {
        if (typeof window !== "undefined") {
          window.location.href = mailtoUrl;
        }
      } catch {
        // Handled
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  const pAttr = publicProfile?.panchangaAttributes;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans pb-24">
      {/* ------------------------------------------------------------------ */}
      {/* TOP ROYAL BANNER & SACRED INVOCATION                               */}
      {/* ------------------------------------------------------------------ */}
      <header className="border-b border-amber-500/20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 py-6 relative z-10">
          {/* Language Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪔</span>
              <span className="text-xs md:text-sm font-semibold tracking-wider text-amber-300">
                {txt("sacredInvocation")}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/30 rounded-full p-1 shadow-inner">
              {PUBLIC_KUNDLI_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setPdfLang(lang.code);
                    handleStopNarration();
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
                    selectedLang === lang.code
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md scale-105"
                      : "text-amber-200/80 hover:text-amber-100 hover:bg-slate-800/60"
                  }`}
                >
                  {lang.nativeLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Temple Title & Priest Credentials */}
          <div className="text-center space-y-1.5 pt-2">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
              {txt("portalTitle")}
            </h1>
            <p className="text-xs md:text-sm text-amber-200/80 font-medium">
              {txt("portalSubtitle")}
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mt-1">
              <span>🏛️ {txt("priestTitle")} : {txt("priestName")}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Online / Offline Banner */}
      {!isOnline && (
        <div className="max-w-4xl mx-auto mt-4 px-4">
          <div className="bg-red-950/90 border-2 border-red-500 text-red-100 p-4 rounded-2xl shadow-2xl flex items-start gap-3.5 animate-pulse">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="font-bold text-sm md:text-base text-red-200">
                {txt("offlineBannerTitle")}
              </h3>
              <p className="text-xs md:text-sm text-red-300/90 mt-0.5">
                {txt("offlineBannerMsg")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto mt-4 px-4">
          <div className="bg-amber-950/90 border border-amber-500 text-amber-200 p-3.5 rounded-xl text-xs md:text-sm flex items-center justify-between">
            <span>⚠️ {errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-amber-400 hover:text-white font-bold text-base px-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MAIN CONTAINER                                                     */}
      {/* ------------------------------------------------------------------ */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        {!result || !publicProfile ? (
          /* ================================================================ */
          /* STEP 1: INPUT FORM                                               */
          /* ================================================================ */
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-sm relative overflow-hidden">
            <div className="border-b border-amber-500/20 pb-5 mb-6 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-amber-300 flex items-center justify-center md:justify-start gap-2">
                <span>✨</span> {txt("formHeader")}
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                {txt("formDesc")}
              </p>
            </div>

            <form onSubmit={handleGenerateKundali} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-200/90 uppercase tracking-wider">
                    {txt("nameLabel")} *
                  </label>
                  <input
                    id="devotee-name-input"
                    data-testid="devotee-name-input"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={txt("namePlaceholder")}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                {/* 2. Gender */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-200/90 uppercase tracking-wider">
                    {txt("genderLabel")}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Male", "Female", "Other"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setForm({ ...form, gender: g as any })}
                        className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                          form.gender === g
                            ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {g === "Male" ? txt("genderMale") : g === "Female" ? txt("genderFemale") : txt("genderOther")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Birth Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-200/90 uppercase tracking-wider">
                    {txt("dobLabel")} *
                  </label>
                  <DatePicker
                    selected={birthDatePicker}
                    onChange={(date) => {
                      setBirthDatePicker(date);
                      if (date) setForm((f) => ({ ...f, birthDate: formatPickerDateLocalYmd(date) }));
                    }}
                  />
                </div>

                {/* 4. Birth Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-200/90 uppercase tracking-wider">
                    {txt("tobLabel")} *
                  </label>
                  <BirthTimePicker
                    value={birthTimeHm}
                    onChange={(time) => {
                      setBirthTimeHm(time);
                      setForm((f) => ({ ...f, birthTime: time }));
                    }}
                  />
                </div>

                {/* 5. Pincode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-200/90 uppercase tracking-wider">
                    {txt("pincodeLabel")} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={form.pincode || ""}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })}
                      placeholder={txt("pincodePlaceholder")}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono"
                    />
                    {pinResolving && (
                      <span className="absolute right-3 top-3 text-xs text-amber-400 animate-spin">
                        ⏳
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    📍 {placeDisplay}
                  </p>
                </div>

                {/* 6. Gotra */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-200/90 uppercase tracking-wider">
                    {txt("gotraLabel")}
                  </label>
                  <input
                    type="text"
                    value={form.gothra || ""}
                    onChange={(e) => setForm({ ...form, gothra: e.target.value })}
                    placeholder={txt("gotraPlaceholder")}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isCalculating || !isOnline}
                  className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base md:text-lg tracking-wide text-slate-950 shadow-2xl transition-all flex items-center justify-center gap-3 ${
                    isCalculating || !isOnline
                      ? "bg-slate-700 cursor-not-allowed text-slate-400"
                      : "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 hover:scale-[1.01] hover:shadow-amber-500/20 active:scale-95"
                  }`}
                >
                  {isCalculating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>{txt("generatingStatus")}</span>
                    </>
                  ) : (
                    <>
                      <span>🪐</span>
                      <span>{txt("generateBtn")}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-950/20 border border-slate-950/30 text-slate-950 font-bold">
                        🪙 {kundliGenCost} Coins
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ================================================================ */
          /* STEP 2: RESULT SCREEN (RICH & DYNAMIC)                           */
          /* ================================================================ */
          <div className="space-y-8 animate-fade-in">
            {/* 1. Summary Ribbon */}
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-amber-300 flex items-center gap-2">
                    <span>🕉️</span> {publicProfile.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    📅 {publicProfile.birthDate} · ⏰ {publicProfile.birthTime} · 📍 {placeDisplay} · 🎂 {publicProfile.ageYears} {txt("yearsLabel")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleStopNarration();
                    setResult(null);
                    setPublicProfile(null);
                    setIsLiveAnalysisOpen(false);
                    setLiveAnalysisInsights(null);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-amber-300 border border-amber-500/30 hover:bg-slate-700 transition-all flex items-center gap-1.5"
                >
                  <span>↺</span> {txt("resetFormBtn")}
                </button>
              </div>

              {/* 4 Core Astrological Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    {txt("lagnaBadge")}
                  </span>
                  <span className="text-base font-extrabold text-amber-300">
                    {publicProfile.lagnaSign} ({publicProfile.lagnaSanskrit})
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    {txt("rashiBadge")}
                  </span>
                  <span className="text-base font-extrabold text-amber-300">
                    {publicProfile.moonSign} ({publicProfile.moonSanskrit})
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    {txt("nakshatraBadge")}
                  </span>
                  <span className="text-base font-extrabold text-amber-300">
                    {publicProfile.moonNakshatra} ({publicProfile.moonPada})
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-3 text-center bg-emerald-950/20">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-semibold">
                    {txt("dashaBadge")}
                  </span>
                  <span className="text-base font-extrabold text-emerald-300">
                    {publicProfile.currentMahadasha} ({publicProfile.currentBhukti})
                  </span>
                  <span className="text-[10px] text-emerald-400/80 block mt-0.5 font-mono">
                    {publicProfile.dashaStartDateStr} → {publicProfile.dashaEndDateStr}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. THE SINGLE ACTION BUTTON */}
            <div className="text-center py-2">
              <button
                type="button"
                onClick={handleOpenLiveAnalysis}
                disabled={isSynthesizingAnalysis || !isOnline}
                className={`w-full py-5 px-6 rounded-3xl font-black text-base md:text-xl tracking-wide text-slate-950 shadow-[0_0_40px_rgba(245,158,11,0.35)] transition-all flex flex-col md:flex-row items-center justify-center gap-3 border-2 border-amber-300/80 ${
                  isSynthesizingAnalysis || !isOnline
                    ? "bg-slate-700 cursor-not-allowed text-slate-400 border-slate-600"
                    : "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] active:scale-95 animate-bounce-subtle"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl md:text-3xl">🔮</span>
                  <span className="text-slate-950 text-center md:text-left leading-tight">
                    {txt("singleActionBtnText")}
                  </span>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-slate-950 text-amber-300 font-mono text-xs md:text-sm font-bold shadow-md border border-amber-400/40">
                  🪙 {liveAnalysisCost.toLocaleString()} Coins
                </span>
              </button>
            </div>

            {/* 3. 6 RICH EXPLORER TABS (Includes Dedicated Personality Tab) */}
            <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-900/80 border border-amber-500/20 p-2 rounded-2xl shadow-inner">
              {[
                { id: "patrika", label: `📜 ${txt("tabPatrika")}` },
                { id: "personality", label: `🔮 ${txt("tabPersonality")}` },
                { id: "planets", label: `🪐 ${txt("tabPlanets")}` },
                { id: "dasha", label: `⏳ ${txt("tabDasha")}` },
                { id: "analysis", label: `🌟 ${txt("tabAnalysis")}` },
                { id: "remedies", label: `🪔 ${txt("tabRemedies")}` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id as any)}
                  className={`px-3.5 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md scale-105"
                      : "text-amber-200/80 hover:text-amber-100 hover:bg-slate-800/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ============================================================== */}
            {/* TAB CONTENT 2: PERSONALITY, HIDDEN PSYCHE & MAANDI INQUEST      */}
            {/* ============================================================== */}
            {activeTab === "personality" && deepPersonalityData && (
              <div className="space-y-6 animate-fade-in">
                {/* Audio Narration Toolbar */}
                <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h3 className="text-sm md:text-base font-extrabold text-amber-300 flex items-center gap-2">
                        <span>🎙️</span> {txt("astrologerDirectNarration")}
                      </h3>
                      <p className="text-[11px] text-amber-200/80">
                        {isPlayingNarration ? txt("narrationPlayingBadge") : "Chief Astrologer Face-to-Face Voice Narration"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isPlayingNarration ? (
                        <button
                          type="button"
                          onClick={handlePlayNarration}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <span>▶</span> {txt("narrationPlayBtn")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handlePauseNarration}
                          className="px-3.5 py-2 rounded-xl bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                        >
                          <span>⏸</span> {txt("narrationPauseBtn")}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleStopNarration}
                        disabled={!isPlayingNarration && !isPausedNarration}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 disabled:opacity-40"
                      >
                        <span>⏹</span> {txt("narrationStopBtn")}
                      </button>

                      {/* Narration Speed Switcher */}
                      <select
                        value={narrationSpeed}
                        onChange={(e) => setNarrationSpeed(parseFloat(e.target.value))}
                        className="bg-slate-950 border border-amber-500/30 text-amber-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none"
                      >
                        <option value={0.85}>0.85x</option>
                        <option value={1.0}>1.0x</option>
                        <option value={1.15}>1.15x</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 1: Core Personality & Demeanor */}
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-3">
                  <h3 className="text-base md:text-lg font-extrabold text-amber-300 flex items-center gap-2 border-b border-amber-500/20 pb-3">
                    <span>👤</span> {deepPersonalityData.personality.title}
                  </h3>
                  <div className="space-y-3 text-xs md:text-sm text-slate-200 leading-relaxed text-justify">
                    <p>{deepPersonalityData.personality.paragraph1}</p>
                    <p>{deepPersonalityData.personality.paragraph2}</p>
                  </div>
                </div>

                {/* Section 2: Hidden Secrets & Subconscious Psyche */}
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-3">
                  <h3 className="text-base md:text-lg font-extrabold text-amber-300 flex items-center gap-2 border-b border-amber-500/20 pb-3">
                    <span>👁️</span> {deepPersonalityData.hiddenSecrets.title}
                  </h3>
                  <div className="space-y-3 text-xs md:text-sm text-slate-200 leading-relaxed text-justify">
                    <p>{deepPersonalityData.hiddenSecrets.paragraph1}</p>
                    <p>{deepPersonalityData.hiddenSecrets.paragraph2}</p>
                  </div>
                </div>

                {/* Section 3: Why Astrology Right Now */}
                <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-3 bg-emerald-950/10">
                  <h3 className="text-base md:text-lg font-extrabold text-emerald-300 flex items-center gap-2 border-b border-emerald-500/20 pb-3">
                    <span>⏳</span> {deepPersonalityData.whyAstrology.title}
                  </h3>
                  <div className="space-y-3 text-xs md:text-sm text-emerald-100/90 leading-relaxed text-justify">
                    <p>{deepPersonalityData.whyAstrology.paragraph1}</p>
                    <p>{deepPersonalityData.whyAstrology.paragraph2}</p>
                  </div>
                </div>

                {/* Section 4: Burning Internal Questions */}
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-3">
                  <h3 className="text-base md:text-lg font-extrabold text-amber-300 flex items-center gap-2 border-b border-amber-500/20 pb-3">
                    <span>❓</span> {deepPersonalityData.internalQuestions.title}
                  </h3>
                  <div className="space-y-3 text-xs md:text-sm text-slate-200 leading-relaxed text-justify">
                    <p>{deepPersonalityData.internalQuestions.paragraph1}</p>
                    <p>{deepPersonalityData.internalQuestions.paragraph2}</p>
                  </div>
                </div>

                {/* Section 5: Maandi (Gulika) Deep Analysis */}
                <div className="bg-slate-900/90 border-2 border-red-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-3 bg-red-950/10">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-500/20 pb-3">
                    <h3 className="text-base md:text-lg font-extrabold text-red-300 flex items-center gap-2">
                      <span>🪐</span> {deepPersonalityData.maandiAnalysis.title}
                    </h3>
                    <span className="text-xs px-3 py-0.5 rounded-full bg-red-950 border border-red-500/40 text-red-300 font-mono font-bold">
                      {publicProfile.maandiHouse}th House · {publicProfile.maandiRashi}
                    </span>
                  </div>
                  <div className="space-y-3 text-xs md:text-sm text-red-100/90 leading-relaxed text-justify">
                    <p>{deepPersonalityData.maandiAnalysis.paragraph1}</p>
                    <p>{deepPersonalityData.maandiAnalysis.paragraph2}</p>
                  </div>
                </div>

                {/* Section 6: Dynamic Seed Questions */}
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
                  <h4 className="text-sm md:text-base font-bold text-amber-300 flex items-center gap-2">
                    <span>💬</span> {txt("sampleQuestionsLabel")}
                  </h4>
                  <div className="space-y-2">
                    {deepPersonalityData.seedQuestions.map((sq, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveTab("analysis");
                          handleAskQuestion(undefined, sq);
                        }}
                        className="w-full text-left text-xs md:text-sm bg-slate-950 border border-slate-800 hover:border-amber-500/60 text-amber-200/90 hover:text-white p-3.5 rounded-2xl transition-all flex items-start gap-2.5 shadow-sm"
                      >
                        <span className="text-amber-400 font-bold">#{idx + 1}</span>
                        <span>{sq}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 1: SACRED PATRIKA & PANCHANGA */}
            {activeTab === "patrika" && (
              <div className="space-y-6 animate-fade-in">
                <div className="rounded-3xl border border-amber-500/30 bg-white p-4 md:p-8 shadow-2xl overflow-x-auto flex justify-center">
                  <TraditionalSouthPatrika
                    kundli={result}
                    personName={form.name}
                    gothra={form.gothra}
                    birthDate={birthDatePicker ? formatPickerDateLocalYmd(birthDatePicker) : form.birthDate}
                    birthTime={birthTimeHm}
                    latitude={form.latitude}
                    longitude={form.longitude}
                    placeLabel={placeDisplay}
                    pincode={form.pincode}
                    ayanamsaModel="lahiri"
                  />
                </div>

                <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
                  <div className="border-b border-amber-500/20 pb-3">
                    <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                      <span>📜</span> {txt("panchangaDetailsTitle")}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{txt("samvatsaraLabel")}</span>
                      <strong className="text-amber-300">{pAttr?.samvatsaraKn} ({pAttr?.samvatsara})</strong>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{txt("masaLabel")}</span>
                      <strong className="text-amber-300">{pAttr?.masaKn} ({pAttr?.pakshaKn})</strong>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{txt("tithiLabel")}</span>
                      <strong className="text-amber-300">{pAttr?.tithiKn}</strong>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{txt("varaLabel")}</span>
                      <strong className="text-amber-300">{pAttr?.weekdayKn}</strong>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{txt("nakshatraLabel")}</span>
                      <strong className="text-amber-300">{publicProfile.moonNakshatra} ({publicProfile.moonPada})</strong>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{txt("yogaLabel")}</span>
                      <strong className="text-amber-300">{pAttr?.yogaKn}</strong>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{txt("karanaLabel")}</span>
                      <strong className="text-amber-300">{pAttr?.karanaKn}</strong>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{txt("yoniLabel")} / {txt("ganaLabel")}</span>
                      <strong className="text-amber-300">{pAttr?.yoniKn} / {pAttr?.ganaKn}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: PLANETARY POSITIONS TABLE */}
            {activeTab === "planets" && (
              <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 animate-fade-in overflow-x-auto">
                <div className="border-b border-amber-500/20 pb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <span>🪐</span> {txt("planetaryTableHeading")}
                  </h3>
                  <span className="text-xs text-slate-400">Lahiri Ayanamsa</span>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-amber-500/30 text-amber-300 bg-slate-950/50">
                      <th className="p-3">{txt("planetCol")}</th>
                      <th className="p-3">{txt("rashiCol")}</th>
                      <th className="p-3 text-center">{txt("degreeCol")}</th>
                      <th className="p-3 text-center">{txt("houseCol")}</th>
                      <th className="p-3">{txt("nakshatraCol")}</th>
                      <th className="p-3 text-center">{txt("padaCol")}</th>
                      <th className="p-3">{txt("lordCol")}</th>
                      <th className="p-3 text-center">{txt("dignityCol")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {publicProfile.planetaryRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          row.name === "Lagna" ? "text-amber-300 font-bold bg-amber-500/5" : "text-slate-300"
                        }`}
                      >
                        <td className="p-3 font-semibold">
                          {row.name} {row.isRetrograde ? `(${txt("retrogradeLabel")})` : ""}
                        </td>
                        <td className="p-3">
                          {row.rashi} ({row.sanskritRashi})
                        </td>
                        <td className="p-3 text-center font-mono text-amber-200/90">
                          {row.degreeStr}
                        </td>
                        <td className="p-3 text-center font-bold text-amber-400">
                          {row.house}
                        </td>
                        <td className="p-3">{row.nakshatra}</td>
                        <td className="p-3 text-center">{row.pada}</td>
                        <td className="p-3">{row.lord}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.dignity === "Exalted"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : row.dignity === "Debilitated"
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {row.dignity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* House Lords Summary */}
                <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    🏛️ {txt("houseLordsSummaryTitle")}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <span className="text-slate-400 block text-[10px]">{txt("lagnaLordTitle")}</span>
                      <strong className="text-amber-300 text-sm">{publicProfile.lagnaLord}</strong>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <span className="text-slate-400 block text-[10px]">{txt("lord10Title")}</span>
                      <strong className="text-amber-300 text-sm">{publicProfile.lord10}</strong>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <span className="text-slate-400 block text-[10px]">{txt("lord7Title")}</span>
                      <strong className="text-amber-300 text-sm">{publicProfile.lord7}</strong>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <span className="text-slate-400 block text-[10px]">{txt("lord6Title")}</span>
                      <strong className="text-amber-300 text-sm">{publicProfile.lord6}</strong>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <span className="text-slate-400 block text-[10px]">{txt("lord5Title")}</span>
                      <strong className="text-amber-300 text-sm">{publicProfile.lord5}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: 120-YEAR DASHA TIMELINE */}
            {activeTab === "dasha" && (
              <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 animate-fade-in overflow-x-auto">
                <div className="border-b border-amber-500/20 pb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <span>⏳</span> {txt("dashaTimelineHeading")}
                  </h3>
                  <span className="text-xs text-emerald-400 font-semibold">
                    120-Year Vimshottari Cycle
                  </span>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-amber-500/30 text-amber-300 bg-slate-950/50">
                      <th className="p-3">{txt("thDashaLord")}</th>
                      <th className="p-3 text-center">{txt("thDuration")}</th>
                      <th className="p-3 text-center">{txt("thAgeRange")}</th>
                      <th className="p-3 text-center">{txt("thDates")}</th>
                      <th className="p-3 text-center">{txt("thActiveStatus")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {publicProfile.dashaTimelineRows.map((d, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          d.status === "active"
                            ? "bg-emerald-500/10 border-l-4 border-emerald-400 text-emerald-200 font-bold"
                            : "text-slate-300 hover:bg-slate-800/40"
                        }`}
                      >
                        <td className="p-3 font-semibold">
                          {d.planet} ({d.sanskritPlanet})
                        </td>
                        <td className="p-3 text-center">
                          {d.durationYears} {txt("yearsLabel")}
                        </td>
                        <td className="p-3 text-center font-mono">
                          {d.startAge} - {d.endAge}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-400">
                          {d.startDateStr} → {d.endDateStr}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              d.status === "active"
                                ? "bg-emerald-500 text-slate-950 shadow-sm"
                                : d.status === "completed"
                                ? "bg-slate-800 text-slate-500"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {d.status === "active"
                              ? txt("activeDashaBadge")
                              : d.status === "completed"
                              ? txt("completedDashaBadge")
                              : txt("upcomingDashaBadge")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB CONTENT 5: LIVE LIFE ANALYSIS & DEVOTEE Q&A */}
            {activeTab === "analysis" && (
              <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md space-y-6 animate-fade-in relative overflow-hidden">
                <div className="border-b border-amber-500/20 pb-4 flex items-center justify-between">
                  <h3 className="text-lg md:text-xl font-extrabold text-amber-300 flex items-center gap-2">
                    <span>🌟</span> {txt("liveAnalysisHeading")}
                  </h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold">
                    ✓ 100% Authentic Lahiri Engine
                  </span>
                </div>

                {isSynthesizingAnalysis ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-medium text-amber-200">
                      {txt("answeringLoader")}
                    </p>
                  </div>
                ) : (
                  liveAnalysisInsights && (
                    <div className="space-y-5">
                      <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 md:p-5 space-y-1">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span>🪐</span> {txt("currentPhaseTitle")}
                        </h4>
                        <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                          {liveAnalysisInsights.currentPhase}
                        </p>
                      </div>

                      <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 md:p-5 space-y-1">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span>🧠</span> {txt("subconsciousMindTitle")}
                        </h4>
                        <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                          {liveAnalysisInsights.subconsciousMind}
                        </p>
                      </div>

                      <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 md:p-5 space-y-1">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span>💼</span> {txt("careerFinanceTitle")}
                        </h4>
                        <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                          {liveAnalysisInsights.careerFinance}
                        </p>
                      </div>

                      <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 md:p-5 space-y-1">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span>❤️</span> {txt("relationshipsHealthTitle")}
                        </h4>
                        <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                          {liveAnalysisInsights.relationshipsHealth}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-amber-950/70 via-slate-950 to-amber-950/70 border border-amber-500/40 rounded-2xl p-4 md:p-5 space-y-1">
                        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>🪔</span> {txt("gokarnaRemedyTitle")}
                        </h4>
                        <p className="text-xs md:text-sm text-amber-100/90 leading-relaxed font-medium">
                          {liveAnalysisInsights.gokarnaRemedy}
                        </p>
                      </div>

                      {/* Devotee Live Q&A Box */}
                      <div className="border-t border-amber-500/20 pt-6 space-y-4">
                        <h4 className="text-sm md:text-base font-bold text-amber-300 flex items-center gap-2">
                          <span>🎙️</span> {txt("askQuestionHeader")}
                        </h4>

                        <div className="space-y-1.5">
                          <span className="text-[11px] text-slate-400 block">
                            {txt("sampleQuestionsLabel")}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {[txt("sampleQ1"), txt("sampleQ2"), txt("sampleQ3")].map((sq, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleAskQuestion(undefined, sq)}
                                className="text-left text-xs bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-amber-200/90 px-3 py-1.5 rounded-xl transition-all"
                              >
                                💬 {sq}
                              </button>
                            ))}
                          </div>
                        </div>

                        <form onSubmit={(e) => handleAskQuestion(e)} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={userQuestion}
                            onChange={(e) => setUserQuestion(e.target.value)}
                            placeholder={isListening ? txt("voiceListening") : txt("questionPlaceholder")}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                          />

                          <button
                            type="button"
                            onClick={handleToggleVoiceDictation}
                            title="Voice Input"
                            className={`p-3 rounded-xl border transition-all ${
                              isListening
                                ? "bg-red-500 border-red-400 text-white animate-pulse"
                                : "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700"
                            }`}
                          >
                            🎤
                          </button>

                          <button
                            type="submit"
                            disabled={isAnsweringQuestion || !userQuestion.trim()}
                            className={`px-5 py-3 rounded-xl font-bold text-xs md:text-sm transition-all ${
                              isAnsweringQuestion || !userQuestion.trim()
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 font-extrabold shadow-md"
                            }`}
                          >
                            {isAnsweringQuestion ? "⏳ ..." : txt("askBtn")}
                          </button>
                        </form>

                        {qaHistory.length > 0 && (
                          <div className="space-y-3 pt-3">
                            {qaHistory.map((item, index) => (
                              <div
                                key={index}
                                className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2 animate-fade-in"
                              >
                                <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
                                  <span>👤</span> {item.question}
                                </div>
                                <div className="text-xs md:text-sm text-slate-200 leading-relaxed border-l-2 border-amber-500 pl-3">
                                  {item.answer}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* TAB CONTENT 6: PARIHARA & GOKARNA SEVAS */}
            {activeTab === "remedies" && (
              <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 animate-fade-in">
                <div className="border-b border-amber-500/20 pb-3">
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <span>🪔</span> {txt("pariharaHeading")}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Authentic Graha Parihara & Sri Kshetra Gokarna Mahabaleshwara Temple Sevas
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                      💎 {txt("gemstoneLabel")}
                    </span>
                    <span className="text-sm font-extrabold text-slate-100">
                      {publicProfile.gemstone}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                      📿 {txt("rudrakshaLabel")}
                    </span>
                    <span className="text-sm font-extrabold text-slate-100">
                      {publicProfile.rudraksha}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                      📅 {txt("auspiciousDayLabel")}
                    </span>
                    <span className="text-sm font-extrabold text-slate-100">
                      {publicProfile.auspiciousDay}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                      🕉️ {txt("deityLabel")}
                    </span>
                    <span className="text-sm font-extrabold text-slate-100">
                      {publicProfile.deity}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-5 space-y-2">
                  <span className="text-xs uppercase font-bold text-amber-300 tracking-wider block">
                    📜 {txt("mantraLabel")}
                  </span>
                  <p className="text-sm md:text-base font-serif text-amber-200 italic">
                    "{publicProfile.mantra}"
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-950/60 via-slate-950 to-amber-950/60 border border-amber-500/40 rounded-2xl p-5 space-y-2">
                  <span className="text-xs uppercase font-bold text-amber-300 tracking-wider block">
                    🏛️ {txt("gokarnaSevaLabel")}
                  </span>
                  <p className="text-sm md:text-base font-extrabold text-amber-100">
                    {publicProfile.gokarnaSevaName}
                  </p>
                </div>
              </div>
            )}

            {/* 4. GRAND PREMIUM CONSULTATION & DIRECT ASTROLOGER CALL (₹350) */}
            <div className="bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-950 border-2 border-amber-400/80 rounded-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center space-y-2 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-wider shadow-inner">
                  <span>✨ {txt("priceTagOnly350")}</span>
                </div>
                <h3 className="text-xl md:text-3xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                  {txt("premiumConsultationCardTitle")}
                </h3>
                <p className="text-xs md:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  {txt("premiumConsultationSubtitle")}
                </p>
              </div>

              {/* 5 Feature Highlight Badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-2.5">
                  <span className="text-lg">📑</span>
                  <span className="text-xs font-semibold text-amber-100/90">{txt("premiumFeature1")}</span>
                </div>
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-2.5">
                  <span className="text-lg">🪐</span>
                  <span className="text-xs font-semibold text-amber-100/90">{txt("premiumFeature2")}</span>
                </div>
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-2.5">
                  <span className="text-lg">⏳</span>
                  <span className="text-xs font-semibold text-amber-100/90">{txt("premiumFeature3")}</span>
                </div>
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-2.5">
                  <span className="text-lg">🔮</span>
                  <span className="text-xs font-semibold text-amber-100/90">{txt("premiumFeature4")}</span>
                </div>
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 md:col-span-2 bg-gradient-to-r from-amber-950/50 to-slate-950">
                  <span className="text-lg">🪔</span>
                  <span className="text-xs font-semibold text-amber-200">{txt("premiumFeature5")}</span>
                </div>
              </div>

              {/* CTA Action Buttons: Direct Call, Email Details & WhatsApp Chat */}
              <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 relative z-10">
                {/* 1. Direct Phone Call Action */}
                <a
                  href="tel:+919972339362"
                  id="direct-astrologer-call-btn"
                  data-testid="direct-astrologer-call-btn"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm md:text-base shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2.5 active:scale-95 border-2 border-amber-300"
                >
                  <span className="text-xl">📞</span>
                  <span>{txt("callAstrologerBtn")}</span>
                </a>

                {/* 2. Direct Email Action to spshripandit@gmail.com */}
                <button
                  type="button"
                  onClick={handleSendEmailToAstrologer}
                  disabled={isSendingEmail}
                  id="send-email-to-astrologer-btn"
                  data-testid="send-email-to-astrologer-btn"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm md:text-base shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 border border-blue-400/50"
                >
                  <span className="text-xl">📧</span>
                  <span>{isSendingEmail ? txt("emailSendingStatus") : txt("sendEmailToAstrologerBtn")}</span>
                </button>

                {/* 3. WhatsApp Share & Consultation Action */}
                <a
                  href={`https://api.whatsapp.com/send?phone=919972339362&text=${encodeURIComponent(
                    `🕉️ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ - ಗೋಕರ್ಣ 🕉️\n\nನಮಸ್ಕಾರ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರೇ,\nನಾನು ₹350 ರ ಸಂಪೂರ್ಣ ರಾಜವೈಭವ ಜಾತಕ PDF ಪುಸ್ತಕ ಹಾಗೂ ನೇರ ದೂರವಾಣಿ ಸಮಾಲೋಚನೆ ಪಡೆಯಲು ಇಚ್ಚಿಸುತ್ತೇನೆ.\n\n👤 ಭಕ್ತರ ಹೆಸರು: ${publicProfile.name}\n📅 ಜನನ ದಿನಾಂಕ: ${publicProfile.birthDate}\n⏰ ಜನನ ಸಮಯ: ${publicProfile.birthTime}\n📍 ಸ್ಥಳ: ${placeDisplay}\n🪐 ಲಗ್ನ: ${publicProfile.lagnaSign} (${publicProfile.lagnaSanskrit})\n🌙 ರಾಶಿ: ${publicProfile.moonSign} (${publicProfile.moonSanskrit})\n✨ ನಕ್ಷತ್ರ: ${publicProfile.moonNakshatra} (ಪಾದ ${publicProfile.moonPada})\n⏳ ಪ್ರಸ್ತುತ ದಶಾ: ${publicProfile.currentMahadasha} (${publicProfile.currentBhukti} ಭುಕ್ತಿ)\n\nದಯವಿಟ್ಟು ಮಾರ್ಗದರ್ಶನ ನೀಡಿ.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm md:text-base shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 border border-emerald-400/50"
                >
                  <span className="text-xl">📲</span>
                  <span>{txt("whatsappShareDetailsBtn")}</span>
                </a>
              </div>

              {emailStatusSuccess && (
                <div
                  id="email-sent-confirmation-alert"
                  data-testid="email-sent-confirmation-alert"
                  className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-center text-xs md:text-sm text-emerald-300 font-semibold relative z-10 animate-fade-in shadow-lg"
                >
                  {emailStatusSuccess}
                </div>
              )}
            </div>

            {/* 5. Chief Priest Endorsement Footer */}
            <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-5 text-center space-y-1">
              <span className="text-xs text-amber-300 font-bold block">
                🏛️ {txt("priestTitle")} · {txt("priestName")}
              </span>
              <p className="text-[11px] text-slate-400">
                {txt("priestContact")}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
