/**
 * Devotee Cloud Firestore Streak & Milestone Rewards Engine (ಭಕ್ತರ ನಿತ್ಯ ಸಾಧನಾ ದೀಕ್ಷೆ & ದೈವಿಕ ಪುರಸ್ಕಾರಗಳು)
 * 
 * Tracks daily pooja sankalpa and 11-time remedy japas in Cloud Firestore (`devoteeStreaks`).
 * Unlocks high-tier spiritual milestone perks, culminating in:
 * 🔥 200-Day Maha Siddha Streak -> Unlimited VIP Access to AI Prashna Shastra Oracle!
 */

import { firestore } from "../../services/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { SevaLang } from "./sevaLocale";

export interface DevoteeMilestoneReward {
  days: number;
  icon: string;
  badgeTitle: Record<SevaLang, string>;
  rewardTitle: Record<SevaLang, string>;
  rewardDesc: Record<SevaLang, string>;
  perkType: "karma_gem" | "remedy_pdf" | "priest_ashirvada" | "ayur_bhavishya" | "master_voice" | "prashna_shastra_unlimited";
  isGrandReward?: boolean;
}

export const DEVOTEE_MILESTONES: DevoteeMilestoneReward[] = [
  {
    days: 3,
    icon: "🥉",
    badgeTitle: {
      kn: "ಆರಂಭ ದೀಕ್ಷೆ",
      hi: "आरंभ दीक्षा",
      te: "ఆరంభ దీక్ష",
      ta: "ஆரம்ப தீட்சை",
      en: "Arambha Deeksha"
    },
    rewardTitle: {
      kn: "ಗೋಲ್ಡನ್ ಅವರ್ & ಕರ್ಮ ಗೈಡ್ ಅನ್‌ಲಾಕ್",
      hi: "गोल्डन ऑवर एवं कर्म गाइड अनलॉक",
      te: "గోల్డెన్ అవర్ & కర్మ గైడ్ అన్‌లాక్",
      ta: "கோல்டன் ஹவர் & கர்ம கைடு திறக்கப்பட்டது",
      en: "Golden Hour & Karma Navigator Unlocked"
    },
    rewardDesc: {
      kn: "ಸತತ ೩ ದಿನಗಳ ಪೂಜಾ-ಜಪ ಸಾಧನೆಗೆ ನಿತ್ಯ ಅದೃಷ್ಟ ರತ್ನ ಹಾಗೂ ಗೋಲ್ಡನ್ ಅವರ್ ಸೌಲಭ್ಯ.",
      hi: "लगातार ३ दिन की साधना पर दैनिक लकी जेम एवं गोल्डन ऑवर मार्गदर्शन।",
      te: "వరుసగా 3 రోజుల సాధనకు లక్కీ జెమ్ మరియు గోల్డెన్ అవర్ సౌకర్యం.",
      ta: "தொடர்ந்து 3 நாட்கள் வழிபாட்டிற்கு அதிர்ஷ்ட ரத்தின வழிகாட்டல்.",
      en: "Unlocked personalized Daily Lucky Gem & Golden Hour guidance."
    },
    perkType: "karma_gem"
  },
  {
    days: 7,
    icon: "🌟",
    badgeTitle: {
      kn: "ಸಪ್ತಾಹ ಸಿದ್ಧಿ",
      hi: "सप्ताह सिद्धि",
      te: "సప్తాహ సిద్ధి",
      ta: "சப்தாக சித்தி",
      en: "Saptaha Siddhi (7-Day)"
    },
    rewardTitle: {
      kn: "೮-ಪುಟಗಳ ಜನ್ಮಕುಂಡಲಿ ಪರಿಹಾರ PDF ಅನ್‌ಲಾಕ್",
      hi: "८-पृष्ठ जन्मकुंडली निवारण PDF अनलॉक",
      te: "8-పేజీల జన్మకుండలి నివారణ PDF అన్‌లాక్",
      ta: "8-பக்க ஜாதக பரிகார PDF திறக்கப்பட்டது",
      en: "Full 8-Page Kundali Remedy PDF Unlocked"
    },
    rewardDesc: {
      kn: "೭ ದಿನಗಳ ಸತತ ದೀಕ್ಷೆಗೆ ಸಂಪೂರ್ಣ ಕುಂಡಲಿ ದೋಷ ನಿವಾರಣಾ ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ಲಭ್ಯ.",
      hi: "७ दिनों की अखंड साधना पर संपूर्ण कुंडली दोष निवारण रिपोर्ट डाउनलोड।",
      te: "7 రోజుల నిరంతర సాధనకు సంపూర్ణ కుండలి నివారణ నివేదిక లభ్యం.",
      ta: "7 நாட்கள் தொடர் வழிபாட்டிற்கு முழு ஜாதக பரிகார அறிக்கை இலவசம்.",
      en: "Unlocked downloadable high-resolution 8-Page Kundali Remedy & Stotra PDF."
    },
    perkType: "remedy_pdf"
  },
  {
    days: 21,
    icon: "🔱",
    badgeTitle: {
      kn: "ಏಕವಿಂಶತಿ ಮಹಾ ವ್ರತ",
      hi: "एकविंशति महा व्रत",
      te: "ఏకవింశతి మహా వ్రతం",
      ta: "ஏகவிம்சதி மகா விரதம்",
      en: "Ekavimshati Maha Vow (21-Day)"
    },
    rewardTitle: {
      kn: "ಗೋಕರ್ಣ ಪ್ರಧಾನ ಅರ್ಚಕರ ವಿಶೇಷ ಆಶೀರ್ವಾದ",
      hi: "गोकर्ण मुख्य पुजारी विशेष आशीर्वाद",
      te: "గోకర్ణ ప్రధాన అర్చకుల విశేష ఆశీర్వాదం",
      ta: "கோகர்ண முதன்மை அர்ச்சகரின் சிறப்பு ஆசீர்வாதம்",
      en: "Priority Gokarna Priest Ashirvada Blessing"
    },
    rewardDesc: {
      kn: "೨೧ ದಿನಗಳ ಸತತ ತಪಸ್ಸಿಗೆ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಪ್ರಧಾನ ಅರ್ಚಕರ ಪ್ರತ್ಯಕ್ಷ ಆಶೀರ್ವಾದ & ಮುಹೂರ್ತ ಸ್ಕ್ಯಾನರ್.",
      hi: "२१ दिनों की साधना पर मुख्य पुजारी का विशेष मंगल आशीर्वाद एवं मुहूर्त स्कैनर।",
      te: "21 రోజుల సాధనకు ప్రధాన అర్చకుల దివ్య ఆశీర్వాదం మరియు ముహూర్త స్కానర్.",
      ta: "21 நாட்கள் தவத்திற்கு தலைமை அர்ச்சகரின் சிறப்பு ஆசீர்வாதம்.",
      en: "Direct sanctum priest benediction audio and priority Shubha Muhurtha scanner."
    },
    perkType: "priest_ashirvada"
  },
  {
    days: 48,
    icon: "👑",
    badgeTitle: {
      kn: "ಮಂಡಲೋತ್ಸವ ಸಾಧನೆ",
      hi: "मंडलोत्सव साधना",
      te: "మండలోత్సవ సాధన",
      ta: "மண்டலோற்சவ சாதனை",
      en: "Mandala Pooja Mastery (48-Day)"
    },
    rewardTitle: {
      kn: "ಆಯುರ್ ಸಂಜೀವಿನಿ & ಲೈಫ್-ಸ್ಟೇಜ್ ಭವಿಷ್ಯ",
      hi: "आयुर् संजीवनी एवं जीवन भविष्य अनलॉक",
      te: "ఆయుర్ సంజీవిని & లైఫ్-స్టేజ్ భవిష్యత్తు",
      ta: "ஆயுர் சஞ்சீவினி & வாழ்க்கை கணிப்புகள்",
      en: "Ayur Sanjeevini & Grand Life Predictions"
    },
    rewardDesc: {
      kn: "೪೮ ದಿನಗಳ ಸಂಪೂರ್ಣ ಮಂಡಲ ಪೂಜೆಗೆ ಆಯುರ್ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ & ದಶ-ವರ್ಷ ಭವಿಷ್ಯ ಅನ್‌ಲಾಕ್.",
      hi: "४८ दिनों के संपूर्ण मंडल व्रत पर स्वास्थ्य विश्लेषण एवं दीर्घकालिक भविष्य।",
      te: "48 రోజుల మండల పూజకు ఆరోగ్య విశ్లేషణ మరియు భవిష్యత్ మార్గదర్శనం.",
      ta: "48 நாட்கள் மண்டல பூஜைக்கு ஆரோக்கிய பகுப்பாய்வு மற்றும் எதிர்கால கணிப்புகள்.",
      en: "Unlocked comprehensive Vedic health diagnostic & multi-year life stage guidance."
    },
    perkType: "ayur_bhavishya"
  },
  {
    days: 108,
    icon: "💎",
    badgeTitle: {
      kn: "ದಿವ್ಯ ತಪಸ್ವಿ ಮಾಲೆ",
      hi: "दिव्य तपस्वी माला",
      te: "దివ్య తపస్వి మాల",
      ta: "திவ்ய தபஸ்வி மாலை",
      en: "Divya Tapaswi 108 Milestone"
    },
    rewardTitle: {
      kn: "ಮಾಸ್ಟರ್ ವಾಯ್ಸ್ ದರ್ಶನ & ಸನ್ನಿಧಿ VIP ಪಾಸ್",
      hi: "मास्टर वॉयस दर्शन एवं गर्भगृह VIP पास",
      te: "మాస్టర్ వాయిస్ దర్శనం & సన్నిధి VIP పాస్",
      ta: "மாஸ்டர் வாய்ஸ் தரிசனம் & சன்னிதி VIP பாஸ்",
      en: "Master Voice Sanctum & Direct VIP Pass"
    },
    rewardDesc: {
      kn: "೧೦೮ ದಿನಗಳ ಪರಮ ಭಕ್ತಿಗೆ ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದ ವಿಶೇಷ ದೈವಿಕ ಪಾಸ್.",
      hi: "१०८ दिनों की परम भक्ति पर गोकर्ण क्षेत्र का विशेष दर्शन पास एवं मास्टर वॉयस।",
      te: "108 రోజుల తపస్సుకు గోకర్ణ క్షేత్ర విశేష దివ్య పాస్.",
      ta: "108 நாட்கள் தீவிர பக்திக்கு கோகர்ண தலத்தின் சிறப்பு தரிசன பாஸ்.",
      en: "Unlocked full master cloned voice narration & Gokarna Sanctum digital VIP Darshana pass."
    },
    perkType: "master_voice"
  },
  {
    days: 200,
    icon: "🏆",
    badgeTitle: {
      kn: "ಮಹಾ ಸಿದ್ಧ ಪ್ರಕಾಶ (ಗ್ರ್ಯಾಂಡ್ ಅವಾರ್ಡ್)",
      hi: "महा सिद्ध प्रकाश (सर्वोच्च पुरस्कार)",
      te: "మహా సిద్ధ ప్రకాశం (గ్రాండ్ అవార్డు)",
      ta: "மகா சித்த பிரகாசம் (மகத்தான பரிசு)",
      en: "Maha Siddha 200 (Grand Milestone)"
    },
    rewardTitle: {
      kn: "ಅನ್ಲಿಮಿಟೆಡ್ ಪ್ರಶ್ನಶಾಸ್ತ್ರ & ಜ್ಯೋತಿಷ್ಯ VIP ಪ್ರವೇಶ!",
      hi: "अनलिमिटेड प्रश्नशास्त्र एवं ज्योतिष VIP प्रवेश!",
      te: "అపరిమిత ప్రశ్నశాస్త్రం & జ్యోతిష్య VIP ఉచిత ప్రవేశం!",
      ta: "வரம்பற்ற பிரஷ்ன சாஸ்திரம் & ஜோதிட VIP இலவச அனுமதி!",
      en: "UNLIMITED FREE VIP ACCESS TO PRASHNA SHASTRA!"
    },
    rewardDesc: {
      kn: "ಅದ್ಭುತ ಸಾಧನೆ! ಸತತ ೨೦೦ ದಿನಗಳ ದೀಕ್ಷೆ ಪೂರೈಸಿದ ಪರಮ ಭಕ್ತರಿಗೆ AI ಪ್ರಶ್ನಶಾಸ್ತ್ರ ಒರಾಕಲ್ ಸಂಪೂರ್ಣ ಉಚಿತ & ಅನ್ಲಿಮಿಟೆಡ್!",
      hi: "अद्भुत उपलब्धि! २०० दिन अखंड साधना करने वाले साधक को AI प्रश्नशास्त्र एवं ज्योतिषी परामर्श पूर्णतः असीमित एवं निःशुल्क!",
      te: "అద్భుత విజయం! 200 రోజులు నిరంతర సాధన చేసిన భక్తులకు AI ప్రశ్నశాస్త్రం జీవితాంతం ఉచితం & అపరిమితం!",
      ta: "மகத்தான சாதனை! 200 நாட்கள் இடைவிடாது வழிபட்ட பக்தருக்கு AI பிரஷ்ன சாஸ்திரம் வாழ்நாள் முழுவதும் இலவசம்!",
      en: "Supreme achievement! 200 days continuous devotion unlocks UNLIMITED lifetime VIP access to AI Prashna Shastra Oracle & Consultations!"
    },
    perkType: "prashna_shastra_unlimited",
    isGrandReward: true
  }
];

export interface DevoteeStreakRecord {
  devoteeKey: string;
  devoteeName: string;
  gotra: string;
  currentStreak: number;
  highestStreak: number;
  totalPoojas: number;
  totalJapas: number;
  lastPoojaDate: string;
  lastJapaDate: string;
  unlockedMilestones: number[];
  updatedAt?: string;
}

const STREAK_CACHE_PREFIX = "baggona_devotee_streak_";

/**
 * Reads the devotee's streak and milestone progress from Cloud Firestore with local cache fallback.
 */
export async function getDevoteeStreakData(devoteeKey = "devotee_default"): Promise<DevoteeStreakRecord> {
  const defaultRecord: DevoteeStreakRecord = {
    devoteeKey,
    devoteeName: "ಭಕ್ತರು",
    gotra: "ಕಾಶ್ಯಪ",
    currentStreak: 1,
    highestStreak: 1,
    totalPoojas: 1,
    totalJapas: 0,
    lastPoojaDate: "",
    lastJapaDate: "",
    unlockedMilestones: []
  };

  // 1. Read from LocalStorage Cache immediately
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`${STREAK_CACHE_PREFIX}${devoteeKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.assign(defaultRecord, parsed);
      }
    } catch {}
  }

  // 2. Read from Cloud Firestore
  try {
    const docRef = doc(firestore, "devoteeStreaks", `streak_${devoteeKey}`);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const cloudData = snap.data() as DevoteeStreakRecord;
      const merged: DevoteeStreakRecord = {
        ...defaultRecord,
        ...cloudData,
        currentStreak: Math.max(defaultRecord.currentStreak, cloudData.currentStreak || 1),
        highestStreak: Math.max(defaultRecord.highestStreak, cloudData.highestStreak || 1),
        totalPoojas: Math.max(defaultRecord.totalPoojas, cloudData.totalPoojas || 1),
        totalJapas: Math.max(defaultRecord.totalJapas, cloudData.totalJapas || 0),
        unlockedMilestones: Array.from(new Set([...(defaultRecord.unlockedMilestones || []), ...(cloudData.unlockedMilestones || [])]))
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`${STREAK_CACHE_PREFIX}${devoteeKey}`, JSON.stringify(merged));
        } catch {}
      }
      return merged;
    }
  } catch (err) {
    console.warn("[DevoteeStreakService] Firestore read failed, using local cache:", err);
  }

  return defaultRecord;
}

/**
 * Records a completed 11-time Japa in Cloud Firestore, updates streak, checks for milestone unlocks.
 */
export async function recordDevoteeJapaCompleted(
  devoteeKey = "devotee_default",
  devoteeName = "ಭಕ್ತರು",
  gotra = "ಕಾಶ್ಯಪ"
): Promise<{ updatedStreak: DevoteeStreakRecord; newlyUnlockedMilestones: DevoteeMilestoneReward[] }> {
  const today = new Date().toISOString().split("T")[0];
  const current = await getDevoteeStreakData(devoteeKey);

  const isAlreadyDoneToday = current.lastJapaDate === today;
  let newCurrentStreak = current.currentStreak;
  let newTotalJapas = current.totalJapas + 1;

  if (!isAlreadyDoneToday) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (current.lastJapaDate === yesterday || current.lastPoojaDate === yesterday || current.lastPoojaDate === today) {
      newCurrentStreak += 1;
    } else if (!current.lastJapaDate) {
      newCurrentStreak = Math.max(current.currentStreak, 1);
    }
  }

  const newHighestStreak = Math.max(current.highestStreak, newCurrentStreak);

  // Check which milestones are unlocked
  const newlyUnlockedMilestones: DevoteeMilestoneReward[] = [];
  const allUnlocked = new Set(current.unlockedMilestones || []);

  for (const m of DEVOTEE_MILESTONES) {
    if (newHighestStreak >= m.days && !allUnlocked.has(m.days)) {
      allUnlocked.add(m.days);
      newlyUnlockedMilestones.push(m);
    }
  }

  const updatedRecord: DevoteeStreakRecord = {
    devoteeKey,
    devoteeName,
    gotra,
    currentStreak: newCurrentStreak,
    highestStreak: newHighestStreak,
    totalPoojas: current.totalPoojas,
    totalJapas: newTotalJapas,
    lastPoojaDate: current.lastPoojaDate,
    lastJapaDate: today,
    unlockedMilestones: Array.from(allUnlocked),
    updatedAt: new Date().toISOString()
  };

  // 1. Write to LocalStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${STREAK_CACHE_PREFIX}${devoteeKey}`, JSON.stringify(updatedRecord));
    } catch {}
  }

  // 2. Write to Cloud Firestore (Async)
  try {
    const docRef = doc(firestore, "devoteeStreaks", `streak_${devoteeKey}`);
    await setDoc(docRef, {
      ...updatedRecord,
      serverTime: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("[DevoteeStreakService] Firestore write failed:", err);
  }

  return { updatedStreak: updatedRecord, newlyUnlockedMilestones };
}

/**
 * Checks if the devotee has unlocked Unlimited VIP Prashna Shastra access (>= 200 Days).
 */
export function hasPrashnaShastraVipAccess(streakData?: DevoteeStreakRecord | null): boolean {
  if (!streakData) return false;
  return (
    streakData.currentStreak >= 200 ||
    streakData.highestStreak >= 200 ||
    streakData.unlockedMilestones?.includes(200) ||
    false
  );
}
