import React, { useEffect, useState, useRef, useMemo } from "react";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import { generateDashaTimeline, type DashaEntry } from "../core/DashaBhuktiEngine";
import { resolvePlaceFromPincode } from "../services/locationApi";
import { formatPickerDateLocalYmd } from "../core/birthTime";
import { askGemini } from "../core/GeminiEngine";
import { useAuthStore } from "../features/auth/authStore";
import { usePricingConfigStore } from "../features/wallet/pricingConfigStore";
import { useWalletStore } from "../features/wallet/walletStore";
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
  generateAuthenticRemediesWithReasoning,
  generateCustomQuestionAstrologyAnswer,
  getLocalizedRashiName,
  getLocalizedNakshatraName,
  getLocalizedDashaBhukti,
  type PublicKundliProfile,
  type DynamicLifeAnalysisOutput,
  type DeepPersonalityOutput,
  type PublicDashaRow,
  type PublicBhuktiRow,
  type PublicKundliDoshaItem,
  type CustomQuestionAnswerResult
} from "../features/publicKundli/publicKundliEngine";
import { DwadashaBhavaKundliChart } from "../components/kundli/DwadashaBhavaKundliChart";
import DatePicker from "../components/DatePicker";
import BirthTimePicker from "../components/BirthTimePicker";
import { decodeDevoteeToken } from "../utils/tokenCipher";
import { notifyPublicPremiumPdfRequested } from "../features/notifications/notificationService";
import {
  sanitizeDevoteeInput,
  checkLiveAiRateLimit,
  recordLiveAiInvocation,
  getCachedLiveAnalysis,
  setCachedLiveAnalysis,
  deductGuestCoins,
  getPublicGuestWallet
} from "../utils/publicKundliSecurity";

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
  const customQuestionCost = getCoins("PUBLIC_CUSTOM_QUESTION_QA", 500);

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

  // Check whether session is explicitly attributed to an authentic priest account
  const isPriestAttributed = useMemo(() => {
    if (currentUser && currentUser !== "PRIEST") return true;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const uParam = params.get("userId") || params.get("uid") || params.get("priestId");
      if (uParam && uParam !== "PRIEST") return true;
    }
    return false;
  }, [currentUser]);

  // Safe Deduction Router (Pillar 5 -> 100%):
  // When a priest is logged in or shared their link, deduct from that priest account.
  // When an anonymous public devotee accesses /public-kundli, deduct strictly from their
  // isolated Public Guest Wallet (initialized with 2,500 coins), completely shielding wallets/PRIEST!
  const executeSafeDeduction = async (coins: number, description: string, clientName?: string) => {
    if (isPriestAttributed && linkedUserId && linkedUserId !== "PRIEST") {
      return await deductPriestCoins(linkedUserId, coins, description, clientName);
    } else {
      return deductGuestCoins(coins, description);
    }
  };

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

  // 6. Interactive 3 Restructured Tabs (Patrika default, Dasha-Bhukti, Personality locked 1000 coins)
  const [activeTab, setActiveTab] = useState<
    "patrika" | "dasha" | "personality" | "analysis"
  >("patrika");
  const [isPersonalityUnlocked, setIsPersonalityUnlocked] = useState<boolean>(false);
  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [expandedMahaPlanet, setExpandedMahaPlanet] = useState<string | null>(null);

  // Floating coin deduction animation indicator state (-1,000 in red rising upwards)
  const [floatingDeductions, setFloatingDeductions] = useState<
    Array<{ id: number; amount: number; label: string }>
  >([]);

  const triggerDeductionAnimation = (amount: number, label?: string) => {
    const newId = Date.now() + Math.random();
    const displayLabel = label || `-${amount.toLocaleString()} Coins`;
    setFloatingDeductions((prev) => [
      ...prev.slice(-3),
      { id: newId, amount, label: displayLabel }
    ]);
    setTimeout(() => {
      setFloatingDeductions((prev) => prev.filter((d) => d.id !== newId));
    }, 3200);
  };

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

  // Dynamic Remedies with full Astrological Reasoning in current language
  const remediesData = useMemo(() => {
    if (!publicProfile || !result) return null;
    return generateAuthenticRemediesWithReasoning(publicProfile, result, selectedLang);
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

    // 1. Strict Input Sanitization & Anti-XSS (Pillar 3 -> 100%)
    const sanitizedName = sanitizeDevoteeInput(form.name, 60);
    const sanitizedGothra = sanitizeDevoteeInput(form.gothra, 40);

    if (!sanitizedName) {
      setErrorMessage(selectedLang === "kn" ? "ದಯವಿಟ್ಟು ಭಕ್ತರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ." : "Please enter the devotee name.");
      return;
    }

    setIsCalculating(true);
    setErrorMessage(null);

    try {
      const kundliPayload: KundliInput = {
        name: sanitizedName,
        birthDate: birthDateYmd,
        birthTime: cleanTime,
        latitude: form.latitude || 14.5479,
        longitude: form.longitude || 74.3188,
        gothra: sanitizedGothra,
        gender: form.gender || "Male",
        pincode: form.pincode || "581326"
      };

      const computed = await calculateKundliWithPlaceSun(kundliPayload, { ayanamsaModel: "lahiri" });
      const dasha = generateDashaTimeline(computed);
      const profile = calculatePublicKundliProfile(computed, birthDateYmd, cleanTime, form.latitude, form.longitude);
      profile.name = sanitizedName;

      setResult(computed);
      setDashaList(dasha);
      setPublicProfile(profile);

      const deterministicInsights = generateDynamicLifeInsights(profile, selectedLang);
      setLiveAnalysisInsights(deterministicInsights);
      setActiveTab("patrika");
      setExpandedMahaPlanet(profile.currentMahadasha);

      // Safe Deduction Router (Pillar 5 -> 100%): Deducts from priest or isolated guest wallet
      try {
        if (isPriestAttributed && linkedUserId && linkedUserId !== "PRIEST") {
          await getOrCreatePriestWallet(linkedUserId, linkedPriestName);
        }
        await executeSafeDeduction(
          kundliGenCost,
          `Public Janma Kundali: ${sanitizedName} (${computed.lagnaRashi.english} Lagna)`,
          sanitizedName
        );
        triggerDeductionAnimation(kundliGenCost, `-${kundliGenCost} Coins (₹${Math.round(kundliGenCost / 10)})`);
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
          userId: isPriestAttributed ? linkedUserId : "PUBLIC_GUEST",
          priestName: linkedPriestName,
          name: sanitizedName,
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

    // 1. Check Deterministic Session Cache (Pillar 4 -> 100%)
    const chartCacheKey = `${form.name.trim()}_${form.birthDate}_${form.birthTime}_${form.latitude}_${form.longitude}_${selectedLang}`;
    const cachedAnalysis = getCachedLiveAnalysis(chartCacheKey);
    if (cachedAnalysis) {
      setLiveAnalysisInsights(cachedAnalysis);
      setIsLiveAnalysisOpen(true);
      setActiveTab("analysis");
      return;
    }

    // 2. Token Bucket Rate Limiting & Cooldown Protection (Pillar 4 -> 100%)
    const rateCheck = checkLiveAiRateLimit();
    if (!rateCheck.allowed) {
      setErrorMessage(rateCheck.reason || "ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯ ನಿರೀಕ್ಷಿಸಿ.");
      return;
    }

    setIsLiveAnalysisOpen(true);
    setIsSynthesizingAnalysis(true);
    setActiveTab("analysis");

    try {
      try {
        await executeSafeDeduction(
          liveAnalysisCost,
          `Current Life Astrology Live Analysis & Q&A: ${form.name.trim()}`,
          form.name.trim()
        );
        triggerDeductionAnimation(liveAnalysisCost, `-${liveAnalysisCost} Coins (₹${Math.round(liveAnalysisCost / 10)})`);
      } catch (coinErr) {
        console.warn("[PublicKundli] Live analysis coin deduction error:", coinErr);
      }

      // Record invocation in Token Bucket Rate Limiter
      recordLiveAiInvocation();

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
          setCachedLiveAnalysis(chartCacheKey, parsedInsights);
          return;
        }
      } catch (parseErr) {
        console.warn("[PublicKundli] JSON parse fallback to deterministic engine:", parseErr);
      }

      const fallbackInsights = generateDynamicLifeInsights(publicProfile, selectedLang);
      setLiveAnalysisInsights(fallbackInsights);
      setCachedLiveAnalysis(chartCacheKey, fallbackInsights);
    } catch (analysisErr) {
      console.error("[PublicKundli] Analysis error:", analysisErr);
      const fallbackInsights = generateDynamicLifeInsights(publicProfile, selectedLang);
      setLiveAnalysisInsights(fallbackInsights);
    } finally {
      setIsSynthesizingAnalysis(false);
    }
  };

  // --------------------------------------------------------------------------
  // 3-Tab Selection & 1,000 Coin Unlock Handler
  // --------------------------------------------------------------------------
  const handleSelectTab = (tabId: "patrika" | "dasha" | "personality" | "analysis") => {
    if (tabId === "personality" && !isPersonalityUnlocked) {
      setShowUnlockModal(true);
      return;
    }
    setActiveTab(tabId);
  };

  const handleUnlockPersonality = async () => {
    setIsUnlocking(true);
    try {
      await executeSafeDeduction(
        1000,
        `Public Kundali Personality & Hidden Psyche Unlock (1,000 Coins): ${form.name.trim()}`,
        form.name.trim()
      );
      // Trigger floating deduction animation (-1,000 Coins) in vibrant red rising upwards
      triggerDeductionAnimation(1000, "-1,000 Coins (₹100)");
      try {
        const ws = useWalletStore.getState();
        if (ws && ws.recentDeductions) {
          ws.recentDeductions.push({
            id: `deduct_${Date.now()}`,
            coins: 1000,
            serviceName: "Public Kundali Personality Unlock",
            timestamp: Date.now()
          });
        }
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.warn("[PublicKundli] Personality unlock coin deduction error:", err);
    } finally {
      setIsPersonalityUnlocked(true);
      setShowUnlockModal(false);
      setIsUnlocking(false);
      setActiveTab("personality");
    }
  };

  // --------------------------------------------------------------------------
  // Action 3: Devotee Custom Q&A
  // --------------------------------------------------------------------------
  const handleAskQuestion = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const rawQuery = (customQ || userQuestion).trim();
    const query = sanitizeDevoteeInput(rawQuery, 250);
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

  // Action 5: Ask Any Other Custom Question (500 Coins)
  const [customQuestionInput, setCustomQuestionInput] = useState<string>("");
  const [customQuestionAnswers, setCustomQuestionAnswers] = useState<CustomQuestionAnswerResult[]>([]);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState<boolean>(false);
  const [customQuestionError, setCustomQuestionError] = useState<string | null>(null);

  const handleAskCustomQuestion = async () => {
    // 1. Strict Input Sanitization & Anti-XSS (Pillar 3 -> 100%)
    const sanitizedQuestion = sanitizeDevoteeInput(customQuestionInput, 250);

    if (!sanitizedQuestion) {
      setCustomQuestionError(txt("customQuestionEmptyAlert"));
      return;
    }
    if (!publicProfile || !result) return;

    setCustomQuestionError(null);
    setIsSubmittingQuestion(true);

    try {
      // Safe Deduction Router (Pillar 5 -> 100%): Deducts from priest or isolated guest wallet
      await executeSafeDeduction(
        customQuestionCost,
        `Public Kundli Custom Question Inquest: "${sanitizedQuestion.slice(0, 30)}..."`,
        form.name || "Devotee"
      );
      triggerDeductionAnimation(customQuestionCost, `-${customQuestionCost} Coins (₹${Math.round(customQuestionCost / 10)})`);

      const ans = generateCustomQuestionAstrologyAnswer(
        sanitizedQuestion,
        publicProfile,
        result,
        selectedLang
      );

      setCustomQuestionAnswers((prev) => [ans, ...prev]);
      setCustomQuestionInput("");
    } catch (err: any) {
      console.error("[PublicKundli] Custom question error:", err);
      setCustomQuestionError(err?.message || "Failed to process question. Please try again.");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  // Action 6: Send Details to spshripandit@gmail.com
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
      {/* 🪙 Floating Coin Deduction Upward Animation Toast (In Red)         */}
      {/* ------------------------------------------------------------------ */}
      {floatingDeductions.length > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex flex-col items-center gap-2">
          {floatingDeductions.map((d) => (
            <div
              key={d.id}
              className="animate-coin-deduct-float flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-mono font-black text-base md:text-lg shadow-[0_10px_35px_rgba(239,68,68,0.8)] border-2 border-amber-300 ring-4 ring-red-500/60 backdrop-blur-md whitespace-nowrap"
            >
              <span className="text-lg">🪙</span>
              <span className="tracking-wide text-white font-black drop-shadow-md">
                -{d.amount.toLocaleString()} Coins
              </span>
              <span className="text-xs font-sans font-bold bg-black/40 px-2 py-0.5 rounded text-amber-200">
                (₹{Math.round(d.amount / 10)})
              </span>
            </div>
          ))}
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

              {/* 4 Core Astrological Badges (100% Pure Localized Language - Zero English in Kannada) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    {txt("lagnaBadge")}
                  </span>
                  <span className="text-base font-extrabold text-amber-300">
                    {getLocalizedRashiName(publicProfile.lagnaSign, selectedLang)}
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    {txt("rashiBadge")}
                  </span>
                  <span className="text-base font-extrabold text-amber-300">
                    {getLocalizedRashiName(publicProfile.moonSign, selectedLang)}
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    {txt("nakshatraBadge")}
                  </span>
                  <span className="text-base font-extrabold text-amber-300">
                    {getLocalizedNakshatraName(publicProfile.moonNakshatra, publicProfile.moonPada, selectedLang)}
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-3 text-center bg-emerald-950/20">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-semibold">
                    {txt("dashaBadge")}
                  </span>
                  <span className="text-base font-extrabold text-emerald-300">
                    {getLocalizedDashaBhukti(publicProfile.currentMahadasha, publicProfile.currentBhukti, selectedLang)}
                  </span>
                  <span className="text-[10px] text-emerald-400/80 block mt-0.5 font-mono">
                    {publicProfile.dashaStartDateStr} → {publicProfile.dashaEndDateStr}
                  </span>
                </div>
              </div>

              {/* Karmic Dosha Inspection Box (Pitru Dosha, Kala Sarpa, Manglik, Guru Chandal) */}
              <div className="mt-4 bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3 border-b border-amber-500/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-lg">⚡</span>
                    <h4 className="text-xs md:text-sm font-bold text-amber-200 tracking-wide">
                      {txt("doshaSectionTitle")}
                    </h4>
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-mono">
                    ॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಗೋಕರ್ಣ ॥
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {publicProfile.karmicDoshas?.map((dosha) => {
                    const isDetected = dosha.isDetected;
                    return (
                      <div
                        key={dosha.id}
                        className={`rounded-xl p-3 border transition-all ${
                          isDetected
                            ? "bg-rose-950/30 border-rose-500/40 text-rose-100"
                            : "bg-emerald-950/20 border-emerald-500/30 text-emerald-100"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">
                              {isDetected ? "🔴" : "🟢"}
                            </span>
                            <span className="text-xs font-extrabold tracking-wide">
                              {dosha.name[selectedLang] || dosha.name.kn}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isDetected
                                ? "bg-rose-900/60 text-rose-200 border-rose-500/50"
                                : "bg-emerald-900/60 text-emerald-200 border-emerald-500/50"
                            }`}
                          >
                            {isDetected ? txt("doshaDetectedBadge") : txt("doshaCleanBadge")}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 space-y-1 mt-2">
                          <div className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-semibold min-w-[70px]">
                              {txt("priorityLabel")}:
                            </span>
                            <span className={isDetected ? "text-rose-300 font-bold" : "text-emerald-300 font-medium"}>
                              {dosha.priority[selectedLang] || dosha.priority.kn}
                            </span>
                          </div>

                          <div className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-semibold min-w-[70px]">
                              {txt("reasonLabel")}:
                            </span>
                            <span className="text-slate-200 leading-snug">
                              {dosha.reason[selectedLang] || dosha.reason.kn}
                            </span>
                          </div>

                          <div className={`flex items-start gap-1.5 pt-1.5 border-t mt-1.5 ${
                            isDetected ? "border-rose-500/20" : "border-emerald-500/20"
                          }`}>
                            <span className="text-amber-300 font-semibold min-w-[70px]">
                              {isDetected ? txt("pariharaLabel") : (selectedLang === "kn" ? "ಗೋಕರ್ಣ ಸೇವೆ" : "Gokarna Seva")}:
                            </span>
                            <span className={`${isDetected ? "text-amber-200 font-medium" : "text-slate-300"} leading-snug`}>
                              {dosha.gokarnaParihara[selectedLang] || dosha.gokarnaParihara.kn}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. THE SINGLE ACTION BUTTON */}
            <div className="text-center py-2">
              <button
                data-testid="single-action-btn"
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

            {/* 3 CORE RESTRUCTURED TABS (Patrika default, Dasha-Bhukti dropdown, Personality locked 1000 coins) */}
            <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-900/80 border border-amber-500/20 p-2 rounded-2xl shadow-inner relative">
              {[
                { id: "patrika", label: `📜 ${txt("tabPatrika")}` },
                { id: "dasha", label: `⏳ ${txt("tabDasha")}` },
                {
                  id: "personality",
                  label: isPersonalityUnlocked
                    ? `🔓 ${txt("tabPersonality")}`
                    : `🔒 ${txt("tabPersonality")} (1,000 Coins)`
                }
              ].map((tab) => (
                <div key={tab.id} className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => handleSelectTab(tab.id as any)}
                    className={`px-4 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md scale-105"
                        : "text-amber-200/80 hover:text-amber-100 hover:bg-slate-800/60"
                    }`}
                  >
                    {tab.label}
                  </button>

                  {/* 🪙 Red Floating Deduction Upward Animation Over Tab 3 When Unlocked */}
                  {tab.id === "personality" &&
                    floatingDeductions.some((d) => d.amount === 1000) && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-coin-deduct-float flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-mono font-black text-xs md:text-sm shadow-2xl border-2 border-amber-300 ring-4 ring-red-500/60 whitespace-nowrap">
                        <span className="text-sm">🪙</span>
                        <span className="tracking-wide text-white font-extrabold">-1,000</span>
                        <span className="text-[10px] bg-black/40 px-1 rounded text-amber-200 font-sans">
                          ₹100
                        </span>
                      </div>
                    )}
                </div>
              ))}
            </div>

            {/* ============================================================== */}
            {/* TAB 1: SACRED PATRIKA & PANCHANGA (DEFAULT ACTIVE TAB)         */}
            {/* ============================================================== */}
            {activeTab === "patrika" && (
              <div className="space-y-6 animate-fade-in">
                {/* Authentic 8-Page Premium Replica: Dwadasha Bhava Kundali Chart */}
                <div className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-4 md:p-8 shadow-2xl overflow-x-auto flex justify-center">
                  <DwadashaBhavaKundliChart
                    kundli={result}
                    profile={publicProfile}
                    personName={form.name}
                    birthDate={birthDatePicker ? formatPickerDateLocalYmd(birthDatePicker) : form.birthDate}
                    birthTime={birthTimeHm}
                    gothra={form.gothra}
                    lang={selectedLang}
                  />
                </div>

                {/* Divine Remedies & Gokarna Temple Pariharas */}
                <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
                  <div className="border-b border-amber-500/20 pb-3">
                    <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                      <span>🪔</span> {txt("pariharaHeading")}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Authentic Graha Parihara & Sri Kshetra Gokarna Mahabaleshwara Temple Sevas
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Gemstone */}
                    <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                          💎 {txt("gemstoneLabel")}
                        </span>
                      </div>
                      <span className="text-sm md:text-base font-extrabold text-amber-200 block">
                        {remediesData?.gemstone || publicProfile.gemstone}
                      </span>
                      {(remediesData?.gemstoneReason || publicProfile.gemstoneReason) && (
                        <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-3 text-xs text-slate-300 leading-relaxed">
                          <span className="text-amber-400 font-bold block text-[11px] mb-1">
                            📜 {selectedLang === "kn" ? "ಶಾಸ್ತ್ರೀಯ ಕಾರಣ:" : "Astrological Reason:"}
                          </span>
                          {remediesData?.gemstoneReason || publicProfile.gemstoneReason}
                        </div>
                      )}
                    </div>

                    {/* Rudraksha */}
                    <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                          📿 {txt("rudrakshaLabel")}
                        </span>
                      </div>
                      <span className="text-sm md:text-base font-extrabold text-amber-200 block">
                        {remediesData?.rudraksha || publicProfile.rudraksha}
                      </span>
                      {(remediesData?.rudrakshaReason || publicProfile.rudrakshaReason) && (
                        <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-3 text-xs text-slate-300 leading-relaxed">
                          <span className="text-amber-400 font-bold block text-[11px] mb-1">
                            📜 {selectedLang === "kn" ? "ಶಾಸ್ತ್ರೀಯ ಕಾರಣ:" : "Astrological Reason:"}
                          </span>
                          {remediesData?.rudrakshaReason || publicProfile.rudrakshaReason}
                        </div>
                      )}
                    </div>

                    {/* Auspicious Day */}
                    <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                          📅 {txt("auspiciousDayLabel")}
                        </span>
                      </div>
                      <span className="text-sm md:text-base font-extrabold text-amber-200 block">
                        {remediesData?.auspiciousDay || publicProfile.auspiciousDay}
                      </span>
                      {(remediesData?.auspiciousDayReason || publicProfile.auspiciousDayReason) && (
                        <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-3 text-xs text-slate-300 leading-relaxed">
                          <span className="text-amber-400 font-bold block text-[11px] mb-1">
                            📜 {selectedLang === "kn" ? "ಶಾಸ್ತ್ರೀಯ ಕಾರಣ:" : "Astrological Reason:"}
                          </span>
                          {remediesData?.auspiciousDayReason || publicProfile.auspiciousDayReason}
                        </div>
                      )}
                    </div>

                    {/* Aradhya Deity */}
                    <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                          🕉️ {txt("deityLabel")}
                        </span>
                      </div>
                      <span className="text-sm md:text-base font-extrabold text-amber-200 block">
                        {remediesData?.deity || publicProfile.deity}
                      </span>
                      {(remediesData?.deityReason || publicProfile.deityReason) && (
                        <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-3 text-xs text-slate-300 leading-relaxed">
                          <span className="text-amber-400 font-bold block text-[11px] mb-1">
                            📜 {selectedLang === "kn" ? "ಶಾಸ್ತ್ರೀಯ ಕಾರಣ:" : "Astrological Reason:"}
                          </span>
                          {remediesData?.deityReason || publicProfile.deityReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mantra */}
                  <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-5 space-y-2">
                    <span className="text-xs uppercase font-bold text-amber-300 tracking-wider block">
                      📜 {txt("mantraLabel")}
                    </span>
                    <p className="text-sm md:text-base font-serif text-amber-200 italic font-semibold">
                      "{remediesData?.mantra || publicProfile.mantra}"
                    </p>
                    {(remediesData?.mantraReason || publicProfile.mantraReason) && (
                      <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-3 text-xs text-slate-300 leading-relaxed mt-2">
                        <span className="text-amber-400 font-bold block text-[11px] mb-1">
                          📜 {selectedLang === "kn" ? "ಶಾಸ್ತ್ರೀಯ ಕಾರಣ:" : "Astrological Reason:"}
                        </span>
                        {remediesData?.mantraReason || publicProfile.mantraReason}
                      </div>
                    )}
                  </div>

                  {/* Gokarna Seva */}
                  <div className="bg-gradient-to-r from-amber-950/60 via-slate-950 to-amber-950/60 border border-amber-500/40 rounded-2xl p-5 space-y-2">
                    <span className="text-xs uppercase font-bold text-amber-300 tracking-wider block">
                      🏛️ {txt("gokarnaSevaLabel")}
                    </span>
                    <p className="text-sm md:text-base font-extrabold text-amber-100">
                      {remediesData?.gokarnaSevaName || publicProfile.gokarnaSevaName}
                    </p>
                    {(remediesData?.gokarnaSevaReason || publicProfile.gokarnaSevaReason) && (
                      <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-3 text-xs text-slate-300 leading-relaxed mt-2">
                        <span className="text-amber-400 font-bold block text-[11px] mb-1">
                          📜 {selectedLang === "kn" ? "ಶಾಸ್ತ್ರೀಯ ಕಾರಣ:" : "Astrological Reason:"}
                        </span>
                        {remediesData?.gokarnaSevaReason || publicProfile.gokarnaSevaReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Unlock CTA Banner for Tab 3 (Personality) */}
                {!isPersonalityUnlocked && (
                  <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border-2 border-amber-400/60 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div>
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <span className="text-2xl">🔒</span>
                        <h4 className="text-base md:text-lg font-black text-amber-300">
                          {txt("unlockPersonalityPromptTitle")}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                        {txt("unlockPersonalityPromptDesc")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUnlockModal(true)}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xs md:text-sm shadow-lg whitespace-nowrap active:scale-95 transition-all flex items-center gap-2"
                    >
                      <span>🪙</span>
                      <span>{txt("unlockPersonalityConfirmBtn")}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: DASHA & BHUKTI (INTERACTIVE ACCORDIONS + 2-LINE PREDICTIONS) */}
            {/* ============================================================== */}
            {activeTab === "dasha" && (
              <div className="space-y-6 animate-fade-in">
                {/* Active Running Dasha & Bhukti Card */}
                <div className="bg-gradient-to-r from-slate-950 via-emerald-950/40 to-slate-950 border-2 border-emerald-500/50 rounded-3xl p-5 md:p-6 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                        {txt("dashaBadge")}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black text-amber-300">
                        {getLocalizedDashaBhukti(publicProfile.currentMahadasha, publicProfile.currentBhukti, selectedLang)}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        <span className="text-emerald-400 font-mono font-semibold">
                          {publicProfile.dashaStartDateStr} → {publicProfile.dashaEndDateStr}
                        </span>{" "}
                        ({publicProfile.dashaStartAge} - {publicProfile.dashaEndAge} {txt("yearsLabel")})
                      </p>
                    </div>

                    <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      {txt("activeBhuktiBadge")}
                    </div>
                  </div>
                </div>

                {/* 120-Year Vimshottari Mahadashas with Expandable 9 Bhuktis Accordion */}
                <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 md:p-8 shadow-2xl space-y-4">
                  <div className="border-b border-amber-500/20 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                        <span>⏳</span> {txt("dashaTimelineHeading")}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {txt("clickToExpandBhuktis")}
                      </p>
                    </div>
                    <span className="text-xs text-emerald-400 font-semibold font-mono">
                      120-Year Vimshottari
                    </span>
                  </div>

                  <div className="space-y-3">
                    {publicProfile.dashaTimelineRows.map((d, idx) => {
                      const isExpanded = expandedMahaPlanet === d.planet;
                      const isActiveMaha = d.status === "active";

                      return (
                        <div
                          key={`${d.planet}_${d.startAge}_${idx}`}
                          className={`border rounded-2xl transition-all overflow-hidden ${
                            isActiveMaha
                              ? "bg-slate-950/90 border-emerald-500/70 shadow-lg ring-1 ring-emerald-500/30"
                              : d.nature === "challenging"
                              ? "bg-slate-950/70 border-rose-500/50 hover:border-rose-400"
                              : d.nature === "favorable"
                              ? "bg-slate-950/70 border-emerald-500/50 hover:border-emerald-400"
                              : "bg-slate-950/60 border-slate-800 hover:border-amber-500/40"
                          }`}
                        >
                          {/* Mahadasha Header Row */}
                          <div
                            onClick={() =>
                              setExpandedMahaPlanet(isExpanded ? null : d.planet)
                            }
                            className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                                  isActiveMaha
                                    ? "bg-emerald-500 text-slate-950 font-bold"
                                    : d.nature === "challenging"
                                    ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                                    : d.nature === "favorable"
                                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                                    : "bg-slate-800 text-amber-300"
                                }`}
                              >
                                {isExpanded ? "▲" : "▼"}
                              </span>
                              <div>
                                <h4 className="text-sm md:text-base font-extrabold text-amber-200">
                                  {d.sanskritPlanet || d.planet}{" "}
                                  {selectedLang === "kn" ? "ಮಹಾದಶಾ" : "Mahadasha"}
                                </h4>
                                <span className="text-xs text-slate-400 font-mono">
                                  {d.durationYears} {txt("yearsLabel")} ({d.startAge} - {d.endAge})
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                              {/* Color Coded Period Indicator */}
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                  d.nature === "challenging"
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                    : d.nature === "favorable"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                }`}
                              >
                                <span>{d.nature === "challenging" ? "🔴" : d.nature === "favorable" ? "🟢" : "🟡"}</span>
                                <span>
                                  {d.nature === "challenging"
                                    ? txt("dashaChallengingBadge")
                                    : d.nature === "favorable"
                                    ? txt("dashaFavorableBadge")
                                    : txt("dashaModerateBadge")}
                                </span>
                              </span>

                              <span className="text-xs font-mono text-slate-400">
                                {d.startDateStr} → {d.endDateStr}
                              </span>

                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  isActiveMaha
                                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                                    : d.status === "completed"
                                    ? "bg-slate-800 text-slate-400"
                                    : "bg-slate-900 text-slate-300 border border-slate-700"
                                }`}
                              >
                                {isActiveMaha
                                  ? txt("activeDashaBadge")
                                  : d.status === "completed"
                                  ? txt("completedDashaBadge")
                                  : txt("upcomingDashaBadge")}
                              </span>
                            </div>
                          </div>

                          {/* Expandable 9 Bhuktis Accordion Panel */}
                          {isExpanded && d.bhuktis && (
                            <div className="bg-slate-900/90 border-t border-slate-800/80 p-3 md:p-4 space-y-3 animate-fade-in">
                              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 mb-2 px-1">
                                {d.sanskritPlanet || d.planet}{" "}
                                {selectedLang === "kn" ? "ಮಹಾದಶೆಯ ೯ ಭುಕ್ತಿಗಳು ಮತ್ತು ಫಲಗಳು" : "9 Bhuktis & Predictions"}
                              </div>

                              <div className="grid grid-cols-1 gap-2.5">
                                {d.bhuktis.map((b) => {
                                  const isCurrentBhukti = b.isActive;
                                  const pred = b.predictions[selectedLang] || b.predictions.kn;

                                  return (
                                    <div
                                      key={`${d.planet}_${b.bhuktiPlanet}_${b.startAge}`}
                                      className={`rounded-xl p-3 border transition-all ${
                                        isCurrentBhukti
                                          ? "bg-emerald-950/40 border-emerald-400/80 shadow-md ring-2 ring-emerald-400/40"
                                          : b.nature === "challenging"
                                          ? "bg-rose-950/20 border-rose-500/50 hover:border-rose-400"
                                          : b.nature === "favorable"
                                          ? "bg-emerald-950/20 border-emerald-500/50 hover:border-emerald-400"
                                          : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700"
                                      }`}
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/60 pb-1.5 mb-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="text-xs font-bold text-amber-300">
                                            {b.bhuktiNameLocalized[selectedLang] || b.bhuktiNameLocalized.kn}
                                          </span>

                                          {/* Bhukti Nature Color Indicator */}
                                          <span
                                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                              b.nature === "challenging"
                                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                                : b.nature === "favorable"
                                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                            }`}
                                          >
                                            <span>{b.nature === "challenging" ? "🔴" : b.nature === "favorable" ? "🟢" : "🟡"}</span>
                                            <span>
                                              {b.nature === "challenging"
                                                ? txt("dashaChallengingBadge")
                                                : b.nature === "favorable"
                                                ? txt("dashaFavorableBadge")
                                                : txt("dashaModerateBadge")}
                                            </span>
                                          </span>

                                          {isCurrentBhukti && (
                                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                                              {txt("activeBhuktiBadge")}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[11px] text-slate-400 font-mono">
                                          {b.startDateStr} → {b.endDateStr} ({b.durationYears} {txt("yearsLabel")})
                                        </div>
                                      </div>

                                      {/* 2-Line Dynamic Astrological Predictive Phrases */}
                                      <div className="text-xs space-y-1.5">
                                        <div className="flex items-start gap-1.5">
                                          <span className="text-emerald-400 font-semibold min-w-[85px] text-[11px]">
                                            {txt("bhuktiClimateHeader")}
                                          </span>
                                          <span className="text-slate-200 leading-relaxed">
                                            {pred.climate}
                                          </span>
                                        </div>
                                        <div className="flex items-start gap-1.5 pt-1 border-t border-slate-800/40">
                                          <span className="text-amber-400 font-semibold min-w-[85px] text-[11px]">
                                            {txt("bhuktiIssueHeader")}
                                          </span>
                                          <span className="text-amber-200/90 leading-relaxed">
                                            {pred.issue}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: PERSONALITY & HIDDEN PSYCHE (LOCKED WITH 1,000 COIN GATE)*/}
            {/* ============================================================== */}
            {activeTab === "personality" && (
              <div className="space-y-6 animate-fade-in">
                {!isPersonalityUnlocked ? (
                  <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 md:p-10 shadow-2xl text-center space-y-5">
                    <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-4xl shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                      🔒
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-amber-300">
                        {txt("unlockPersonalityPromptTitle")}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-xl mx-auto leading-relaxed">
                        {txt("unlockPersonalityPromptDesc")}
                      </p>
                    </div>

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => setShowUnlockModal(true)}
                        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-sm md:text-base shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
                      >
                        <span>🪙</span>
                        <span>{txt("unlockPersonalityConfirmBtn")}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  deepPersonalityData && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Audio Narration Toolbar */}
                      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <h3 className="text-sm md:text-base font-extrabold text-amber-300 flex items-center gap-2">
                              <span>🎙️</span> {txt("astrologerDirectNarration")}
                            </h3>
                            <p className="text-[11px] text-amber-200/80">
                              {isPlayingNarration ? txt("narrationPlayingBadge") : txt("astrologerDirectNarration")}
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

                      {/* Section 1: Lagna External Personality */}
                      <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
                        <div className="border-b border-amber-500/20 pb-3 flex items-center justify-between">
                          <h4 className="text-base md:text-lg font-bold text-amber-300 flex items-center gap-2">
                            <span>👤</span> {txt("personalityReadingTitle")}
                          </h4>
                          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono border border-amber-500/30">
                            {deepPersonalityData.personality.title}
                          </span>
                        </div>
                        <div className="space-y-3 text-xs md:text-sm text-slate-200 leading-relaxed text-justify">
                          <p>{deepPersonalityData.personality.paragraph1}</p>
                          <p>{deepPersonalityData.personality.paragraph2}</p>
                        </div>
                      </div>

                      {/* Section 2: Moon Subconscious Mind & Secrets */}
                      <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
                        <div className="border-b border-amber-500/20 pb-3 flex items-center justify-between">
                          <h4 className="text-base md:text-lg font-bold text-amber-300 flex items-center gap-2">
                            <span>🌙</span> {txt("hiddenSecretsTitle")}
                          </h4>
                          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 font-mono border border-indigo-500/30">
                            {deepPersonalityData.hiddenSecrets.title}
                          </span>
                        </div>
                        <div className="space-y-3 text-xs md:text-sm text-slate-200 leading-relaxed text-justify">
                          <p>{deepPersonalityData.hiddenSecrets.paragraph1}</p>
                          <p>{deepPersonalityData.hiddenSecrets.paragraph2}</p>
                        </div>
                      </div>

                      {/* Section 3: Current Dasha & Gochara Climate */}
                      <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
                        <div className="border-b border-amber-500/20 pb-3 flex items-center justify-between">
                          <h4 className="text-base md:text-lg font-bold text-amber-300 flex items-center gap-2">
                            <span>⏳</span> {txt("currentDashaClimateTitle")}
                          </h4>
                          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/30">
                            {deepPersonalityData.whyAstrology.title}
                          </span>
                        </div>
                        <div className="space-y-3 text-xs md:text-sm text-slate-200 leading-relaxed text-justify">
                          <p>{deepPersonalityData.whyAstrology.paragraph1}</p>
                          <p>{deepPersonalityData.whyAstrology.paragraph2}</p>
                        </div>
                      </div>

                      {/* Section 4: Devotee's Burning Inquest */}
                      <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
                        <div className="border-b border-amber-500/20 pb-3 flex items-center justify-between">
                          <h4 className="text-base md:text-lg font-bold text-amber-300 flex items-center gap-2">
                            <span>❓</span> {txt("whyConsultingTitle")}
                          </h4>
                          <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 font-mono border border-purple-500/30">
                            {deepPersonalityData.internalQuestions.title}
                          </span>
                        </div>
                        <div className="space-y-3 text-xs md:text-sm text-slate-200 leading-relaxed text-justify">
                          <p>{deepPersonalityData.internalQuestions.paragraph1}</p>
                          <p>{deepPersonalityData.internalQuestions.paragraph2}</p>
                        </div>
                      </div>

                      {/* Section 5: Maandi Karmic Shadow & Gokarna Remedy */}
                      <div className="bg-slate-900/90 border border-red-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
                        <div className="border-b border-red-500/20 pb-3 flex items-center justify-between">
                          <h4 className="text-base md:text-lg font-bold text-red-300 flex items-center gap-2">
                            <span>🪐</span> {txt("maandiKarmicShadowTitle")}
                          </h4>
                          <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-300 font-mono border border-red-500/30">
                            {deepPersonalityData.maandiAnalysis.title}
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

                      {/* Section 7: Ask Any Other Custom Question (500 Coins) */}
                      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
                        <div className="border-b border-indigo-500/20 pb-3 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h4 className="text-base md:text-lg font-black text-indigo-300 flex items-center gap-2">
                              <span>❓</span> {txt("customQuestionSectionTitle")}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {txt("customQuestionSectionSubtitle")}
                            </p>
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/40 shadow-sm flex items-center gap-1">
                            <span>🪙</span> {customQuestionCost} Coins ({txt("customQuestionCostPill")})
                          </span>
                        </div>

                        {/* Textarea Input */}
                        <div className="space-y-2">
                          <textarea
                            value={customQuestionInput}
                            onChange={(e) => {
                              setCustomQuestionInput(e.target.value);
                              if (customQuestionError) setCustomQuestionError(null);
                            }}
                            rows={3}
                            placeholder={txt("customQuestionPlaceholder")}
                            className="w-full bg-slate-950/90 border border-indigo-500/30 focus:border-indigo-400 rounded-2xl p-3.5 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all resize-none shadow-inner"
                          />

                          {customQuestionError && (
                            <p className="text-xs text-rose-400 font-medium animate-fade-in flex items-center gap-1">
                              <span>⚠️</span> {customQuestionError}
                            </p>
                          )}

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={handleAskCustomQuestion}
                              disabled={isSubmittingQuestion}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-extrabold text-xs md:text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                              {isSubmittingQuestion ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>{txt("answeringLoader")}</span>
                                </>
                              ) : (
                                <>
                                  <span>✨</span>
                                  <span>{txt("customQuestionSubmitBtn")}</span>
                                  <span className="text-[10px] opacity-80 font-mono">({customQuestionCost} 🪙)</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* List of Answered Custom Questions */}
                        {customQuestionAnswers.length > 0 && (
                          <div className="space-y-3 pt-3 border-t border-indigo-500/20">
                            <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                              <span>📜</span> {txt("customQuestionAnswerHeading")} ({customQuestionAnswers.length})
                            </div>

                            {customQuestionAnswers.map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 md:p-5 space-y-3 shadow-md"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/20 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                      {item.categoryLocalized}
                                    </span>
                                    <span className="text-xs font-bold text-slate-200">
                                      "{item.question}"
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                    {item.shortVerdict}
                                  </span>
                                </div>

                                <p className="text-xs md:text-sm text-slate-200 leading-relaxed text-justify">
                                  {item.analysisText}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                                  <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-2.5 flex items-start gap-1.5">
                                    <span className="text-emerald-400 font-bold min-w-[70px]">
                                      {selectedLang === "kn" ? "ಶುಭ ಕಾಲಾವಧಿ:" : "Time Window:"}
                                    </span>
                                    <span className="text-slate-200">{item.auspiciousWindow}</span>
                                  </div>
                                  <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-2.5 flex items-start gap-1.5">
                                    <span className="text-amber-400 font-bold min-w-[70px]">
                                      {selectedLang === "kn" ? "ಗೋಕರ್ಣ ಸೇವೆ:" : "Gokarna Seva:"}
                                    </span>
                                    <span className="text-amber-200 font-medium">{item.recommendedGokarnaSeva}</span>
                                  </div>
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

            {/* TAB CONTENT: LIVE LIFE ANALYSIS & DEVOTEE Q&A (OPENED BY THE SINGLE ACTION BUTTON) */}
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

                      <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-amber-950/40 border border-amber-500/40 rounded-2xl p-4 md:p-5 space-y-1">
                        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>🪔</span> {txt("gokarnaTempleRemedyTitle")}
                        </h4>
                        <p className="text-xs md:text-sm text-amber-100 leading-relaxed">
                          {liveAnalysisInsights.gokarnaRemedy}
                        </p>
                      </div>
                    </div>
                  )
                )}

                {/* Devotee Q&A Interactive Input */}
                <div className="pt-4 border-t border-amber-500/20 space-y-4">
                  <h4 className="text-sm md:text-base font-extrabold text-amber-300 flex items-center gap-2">
                    <span>💬</span> {txt("askAstrologerInputLabel")}
                  </h4>

                  <form onSubmit={(e) => handleAskQuestion(e)} className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        placeholder={txt("askAstrologerPlaceholder")}
                        className="w-full bg-slate-950 border border-amber-500/40 rounded-2xl px-4 py-3.5 pr-24 text-xs md:text-sm text-amber-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleToggleVoiceDictation}
                          className={`p-2 rounded-xl transition-all ${
                            isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-800 text-amber-300 hover:bg-slate-700"
                          }`}
                          title={txt("micTitle")}
                        >
                          🎤
                        </button>
                        <button
                          type="submit"
                          disabled={isAnsweringQuestion || !userQuestion.trim()}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1"
                        >
                          {isAnsweringQuestion ? "..." : "➤"}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Q&A Thread History */}
                  {qaHistory.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {qaHistory.map((item, idx) => (
                        <div key={idx} className="bg-slate-950 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                          <div className="flex items-start gap-2 text-xs font-bold text-amber-400">
                            <span>Q:</span>
                            <span>{item.question}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs text-slate-200 pl-4 border-l-2 border-amber-500/40 leading-relaxed">
                            <span>{item.answer}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
      
      {/* ============================================================== */}
      {/* CONFIRMATION MODAL: 1,000 COIN DEDUCTION FOR PERSONALITY TAB    */}
      {/* ============================================================== */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.4)] text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mx-auto text-3xl">
              🔒
            </div>
            <h3 className="text-lg md:text-xl font-black text-amber-300">
              {txt("unlockPersonalityPromptTitle")}
            </h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {selectedLang === "kn"
                ? "ವ್ಯಕ್ತಿತ್ವ & ನಿಗೂಢ ರಹಸ್ಯ ಅನ್‌ಲಾಕ್ ಮಾಡಲು 1,000 ನಾಣ್ಯಗಳನ್ನು (Coins) ಕಡಿತಗೊಳಿಸಲಾಗುವುದು. ಮುಂದುವರಿಯಬೇಕೆ?"
                : "Unlocking Personality & Hidden Secrets will deduct 1,000 Coins from your wallet. Do you wish to proceed?"}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowUnlockModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-all"
              >
                {selectedLang === "kn" ? "ರದ್ದುಗೊಳಿಸಿ" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleUnlockPersonality}
                disabled={isUnlocking}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 hover:from-yellow-300 hover:to-amber-400 font-extrabold text-xs md:text-sm shadow-lg transition-all flex items-center gap-2"
              >
                {isUnlocking ? "ಅನ್‌ಲಾಕ್ ಆಗುತ್ತಿದೆ..." : "🪙 ಹೌದು, ಅನ್‌ಲಾಕ್ ಮಾಡಿ"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
    </div>
  );
}
