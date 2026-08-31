/**
 * Priest Audio Narrator Engine for Baggona Panchanga Virtual Pooja
 * 
 * Provides authentic, resonant voice recitation for Vedic Pooja steps:
 * 1. Temple Bell Invocation Mantra (ಆಗಮಾರ್ಥಂ ತು ದೇವಾನಾಂ...)
 * 2. Deepa & Mantrakshate Offering (ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ... ಮಂಗಳಾಕ್ಷತಾಂ ಸಮರ್ಪಯಾಮಿ)
 * 3. Personalized Vedic Sankalpa with Devotee Name, Gotra, Rashi, Nakshatra
 * 4. Chief Priest Mangalarathi & Ashirvada with Priest Name
 */

import type { SevaLang } from "./sevaLocale";
import { getVoiceProfileById, type PriestAudioKey } from "../audio/priestVoiceDatabase";

export interface PriestNarratorParams {
  devoteeName: string;
  gotra?: string;
  rashiName?: string;
  nakshatraName?: string;
  priestName?: string;
  lang?: SevaLang;
  step: number; // 1: Bell, 2: Deepa/Akshata, 3: Sankalpa, 4: Ashirvada
}

export function getPriestStepSpeechText(params: PriestNarratorParams): { sanskritMantra: string; narrationText: string } {
  const { devoteeName, gotra = "ಕಾಶ್ಯಪ", rashiName = "ಧನು", nakshatraName = "ಮೂಲ", priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್", lang = "kn", step } = params;
  const code = (lang || "en").slice(0, 2);

  switch (step) {
    case 1:
      return {
        sanskritMantra: "ಓಂ ಆಗಮಾರ್ಥಂ ತು ದೇವಾನಾಂ ಗಮನಾರ್ಥಂ ತು ರಾಕ್ಷಸಾಮ್, ಕುರ್ವೇ ಘಂಟಾರವಂ ತತ್ರ ದೇವತಾಹ್ವಾನ ಲಕ್ಷಣಮ್ ॥",
        narrationText: code === "kn"
          ? `ಹರಿ ಓಂ. ನಾನು ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಅರ್ಚಕ ${priestName}. ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಗೆ ಭಕ್ತಿಪೂರ್ವಕ ಸ್ವಾಗತ. ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ನಿವಾರಣೆಗಾಗಿ ಹಾಗೂ ದೈವಿಕ ಶಕ್ತಿ ಆಹ್ವಾನಿಸಲು ದಯವಿಟ್ಟು ದೇವಸ್ಥಾನದ ಘಂಟಾನಾದವನ್ನು ಮೊಳಗಿಸಿ.`
          : code === "hi"
          ? `हरि ॐ। मैं गोकर्ण क्षेत्र का मुख्य अर्चक ${priestName}। श्री महाबलेश्वर सन्निधि में आपका स्वागत है। नकारात्मक ऊर्जा निवारण एवं दैवीय शक्ति जागरण हेतु कृपया मन्दिर का घण्टानाद करें।`
          : code === "te"
          ? `హరి ఓం. నేను గోకర్ణ క్షేత్ర ముఖ్య అర్చకులు ${priestName}. శ్రీ మహాబలేశ్వర సన్నిధికి స్వాగతం. ప్రతికూల శక్తుల నివారణకు మరియు దైవిక శక్తిని ఆహ్వానించుటకు దయచేసి ఆలయ ఘంటానాదం చేయండి.`
          : code === "ta"
          ? `ஹரி ஓம். நான் கோகர்ண க்ஷேத்திரத்தின் தலைமை அர்ச்சகர் ${priestName}. ஸ்ரீ மகாபலேஸ்வரர் சந்நிதிக்கு நல்வரவு. எதிர்மறை ஆற்றல்களை நீக்கி தெய்வீக அருளைப் பெற ஆலய மணி ஒலிக்கவும்.`
          : `Hari Om. I am Chief Priest ${priestName} from Sri Gokarna Kshetra. Welcome to Lord Mahabaleshwara's Sacred Sanctum. Ring the holy temple bell to awaken positive spiritual vibrations and dispel negative energies.`
      };
    case 2:
      return {
        sanskritMantra: "ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ ದೀಪಜ್ಯೋತಿರ್ಜನಾರ್ದನಃ । ದೀಪೋ ಹರತು ಮೇ ಪಾಪಂ ದೀಪಜ್ಯೋತಿರ್ನಮೋಸ್ತು ತೇ ॥ ಮಂಗಳಾಕ್ಷತಾಂ ಸಮರ್ಪಯಾಮಿ ॥",
        narrationText: code === "kn"
          ? `ಈಗ ಜ್ಞಾನಜ್ಯೋತಿ ದೀಪವನ್ನು ಪ್ರಜ್ವಲಿಸಿ, ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಾನಕ್ಕೆ ಪವಿತ್ರ ಮಂಗಳಾಕ್ಷತೆಯನ್ನು ಭಕ್ತಿಯಿಂದ ಸಮರ್ಪಿಸಿ.`
          : code === "hi"
          ? `अब ज्ञानज्योति दीप प्रज्वलित करें और श्री महाबलेश्वर आत्मलिंग के चरणों में पवित्र मंगलाक्षत श्रद्धापूर्वक अर्पित करें।`
          : code === "te"
          ? `ఇప్పుడు జ్ఞానజ్యోతి దీపాన్ని వెలిగించి, శ్రీ మహాబలేశ్వర ఆత్మలింగ సన్నిధిలో పవిత్ర మంగళాక్షతలను భక్తితో సమర్పించండి.`
          : code === "ta"
          ? `இப்போது ஞானஜோதி தீபம் ஏற்றி, ஸ்ரீ மகாபலேஸ்வரர் ஆத்மலிங்க சந்நிதியில் புனித மங்களாட்சதையை பக்தியுடன் சமர்ப்பிக்கவும்.`
          : `Now light the sacred divine lamp and offer holy mantrakshata grains with devotion at Lord Mahabaleshwara's Atma Linga.`
      };
    case 3:
      return {
        sanskritMantra: `ಅದ್ಯ ಪೂರ್ವೋಕ್ತ ಏವಂ ಗುಣ ವಿಶೇಷಣ ವಿಶಿಷ್ಟಾಯಾಂ ಶುಭ ಪುಣ್ಯ ತಿಥೌ, ${devoteeName} ಶರ್ಮಣಃ, ${gotra} ಗೋತ್ರೋದ್ಭವಸ್ಯ, ${rashiName} ರಾಶಿ, ${nakshatraName} ನಕ್ಷತ್ರ ಜಾತಸ್ಯ, ಮಮೋಪಾತ್ತ ಸಮಸ್ತ ದುರಿತಕ್ಷಯದ್ವಾರಾ ಶ್ರೀ ಪರಮೇಶ್ವರ ಪ್ರೀತ್ಯರ್ಥಂ ಸಕಲ ಮನೋರಥ ಸಿದ್ಧ್ಯರ್ಥಂ ಮಹಾಸಂಕಲ್ಪಂ ಕುರ್ಯಾತ್ ॥`,
        narrationText: code === "kn"
          ? `ಪೂಜ್ಯ ${devoteeName} ಅವರೇ, ನಿಮ್ಮ ${gotra} ಗೋತ್ರ, ${rashiName} ರಾಶಿ, ${nakshatraName} ನಕ್ಷತ್ರದೊಂದಿಗೆ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ಸಂಕಲ್ಪ ಪೂರ್ಣಗೊಂಡಿದೆ.`
          : code === "hi"
          ? `प्रिय ${devoteeName} जी, आपके ${gotra} गोत्र, ${rashiName} राशि, एवं ${nakshatraName} नक्षत्र के साथ गोकर्ण महाबलेश्वर सन्निधि में विशेष संकल्प संपन्न हुआ।`
          : code === "te"
          ? `భక్తులు ${devoteeName} గారు, మీ ${gotra} గోత్రం, ${rashiName} రాశి, మరియు ${nakshatraName} నక్షత్రంతో గోకర్ణ మహాబలేశ్వర సన్నిధిలో విశేష సంకల్పం సంపూర్ణమైనది.`
          : code === "ta"
          ? `பக்தர் ${devoteeName} அவர்களே, உங்கள் ${gotra} கோத்திரம், ${rashiName} ராசி, மற்றும் ${nakshatraName} நட்சத்திரத்துடன் கோகர்ண மகாபலேஸ்வரர் சந்நிதியில் மகா சங்கல்பம் நிறைவுற்றது.`
          : `Dear ${devoteeName}, sacred Sankalpa with ${gotra} Gotra, ${rashiName} Rashi, and ${nakshatraName} Nakshatra is dedicated at Gokarna Mahabaleshwara Sanctum.`
      };
    case 4:
    default:
      return {
        sanskritMantra: "ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ । ಸರ್ವೇ ಭದ್ರಾಣಿ ಪಶ್ಯಂತು ಮಾ ಕಶ್ಚಿತ್ ದುಃಖಭಾಗ್ಭವತ್ ॥",
        narrationText: code === "kn"
          ? `ಮುಖ್ಯ ಅರ್ಚಕ ${priestName} ಅವರಿಂದ ಸನ್ನಿಧಿ ಆಶೀರ್ವಚನ: ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಕೃಪೆಯಿಂದ ನಿಮಗೆ ಹಾಗೂ ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಆಯುರಾರೋಗ್ಯ, ಸುಖ-ಶಾಂತಿ ಮತ್ತು ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿಯಾಗಲಿ. ಓಂ ಶಾಂತಿಃ ಶಾಂತಿಃ ಶಾಂತಿಃ.`
          : code === "hi"
          ? `मुख्य अर्चक ${priestName} जी की ओर से दिव्य आशीर्वाद: श्री गोकर्ण महाबलेश्वर स्वामी की कृपा से आपको एवं आपके परिवार को उत्तम स्वास्थ्य, सुख-शांति एवं सर्व कार्य सिद्धि प्राप्त हो। ॐ शान्तिः शान्तिः शान्तिः।`
          : code === "te"
          ? `ముఖ్య అర్చకులు ${priestName} గారి దివ్య ఆశీర్వచనం: శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి అనుగ్రహంతో మీకు మరియు మీ కుటుంబానికి ఆయురారోగ్యాలు, సుఖశాంతులు మరియు సర్వ కార్య సిద్ధి కలుగుగాక. ಓಂ ಶಾಂತಿಃ ಶಾಂತಿಃ ಶಾಂತಿಃ.`
          : code === "ta"
          ? `தலைமை அர்ச்சகர் ${priestName} அவர்களின் தெய்வீக ஆசீர்வாதம்: ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் அருளால் உங்களுக்கும் உங்கள் குடும்பத்தினருக்கும் நீண்ட ஆயுள், நல்வாழ்வு, அமைதி மற்றும் சகல காரிய வெற்றியும் உண்டாகட்டும். ஓம் சாந்தி சாந்தி சாந்தி.`
          : `Divine Benediction by Chief Priest ${priestName}: May Lord Mahabaleshwara bless ${devoteeName} and your entire family with peace, longevity, prosperity, and success.`
      };
  }
}

/**
 * Plays resonant multi-harmonic temple bell using Web Audio API
 */
export function playTempleBellChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.35, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);
    masterGain.connect(ctx.destination);

    // Harmonic bell frequencies for realistic bronze temple bell
    const harmonics = [432, 864, 1296, 1728, 2160, 2592];
    harmonics.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const amp = 1 / (idx + 1.2);
      oscGain.gain.setValueAtTime(amp, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (3.0 / (idx * 0.4 + 1)));

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 3.2);
    });
  } catch (err) {
    console.warn("[PriestAudioNarrator] Web Audio chime note:", err);
  }
}

let activeAudioElement: HTMLAudioElement | null = null;

/**
 * Recites text using custom recorded audio if available from the selected Priest Voice Profile,
 * or Male Priest TTS voice with deep Vedic resonance tuned to the profile's pitch and rate
 */
export function speakPriestNarration(
  text: string,
  lang: SevaLang = "kn",
  onEnd?: () => void,
  stepKey?: PriestAudioKey,
  voiceId?: string
): () => void {
  if (typeof window === "undefined") {
    if (onEnd) setTimeout(onEnd, 2000);
    return () => {};
  }

  const profile = getVoiceProfileById(voiceId);

  // 1. Check if user uploaded a custom priest voice recording for this step in this profile
  if (stepKey && profile?.audioClips?.[stepKey]) {
    const customAudio = profile.audioClips[stepKey];
    if (customAudio && customAudio.dataUrl) {
      try {
        stopPriestAudio();
        const audio = new Audio(customAudio.dataUrl);
        activeAudioElement = audio;
        audio.onended = () => {
          activeAudioElement = null;
          if (onEnd) onEnd();
        };
        audio.onerror = () => {
          activeAudioElement = null;
          // fallback to TTS below
          fallbackMaleTTS(text, lang, onEnd, profile.voicePitch, profile.voiceRate);
        };
        audio.play().catch(() => {
          fallbackMaleTTS(text, lang, onEnd, profile.voicePitch, profile.voiceRate);
        });
        return () => {
          if (activeAudioElement) {
            activeAudioElement.pause();
            activeAudioElement = null;
          }
        };
      } catch {
        // Fallback to TTS below
      }
    }
  }

  return fallbackMaleTTS(text, lang, onEnd, profile?.voicePitch || 0.74, profile?.voiceRate || 0.86);
}

function fallbackMaleTTS(
  text: string,
  lang: SevaLang = "kn",
  onEnd?: () => void,
  pitch = 0.74,
  rate = 0.86
): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) setTimeout(onEnd, 2000);
    return () => {};
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  if (lang === "kn") utterance.lang = "kn-IN";
  else if (lang === "hi") utterance.lang = "hi-IN";
  else if (lang === "te") utterance.lang = "te-IN";
  else if (lang === "ta") utterance.lang = "ta-IN";
  else utterance.lang = "en-IN";

  // Priest resonant chanting pitch & solemn masculine pace from profile
  utterance.pitch = pitch; // Deep masculine priest pitch
  utterance.rate = rate;  // Solemn, authoritative Vedic recitation pace
  utterance.volume = 1.0;

  // Filter explicitly for Indian Male voices
  const voices = window.speechSynthesis.getVoices();
  const maleKeywords = ["male", "ravi", "hemant", "madhav", "kiran", "pradeep", "manoj", "pankaj", "tarun", "deep", "wavenet-b", "standard-b", "neural2-b"];
  const femaleKeywords = ["female", "zira", "swara", "kalpana", "neerja", "heera", "sunita", "harita", "shruti", "priya", "pooja", "sangeeta", "wavenet-a", "standard-a"];

  const maleVoice = voices.find(v => {
    const vName = v.name.toLowerCase();
    const isIndian = v.lang.includes("IN") || v.lang.includes("kn") || v.lang.includes("hi");
    const isExplicitlyMale = maleKeywords.some(k => vName.includes(k));
    const isExplicitlyFemale = femaleKeywords.some(k => vName.includes(k));
    return isIndian && isExplicitlyMale && !isExplicitlyFemale;
  }) || voices.find(v => {
    const vName = v.name.toLowerCase();
    const isIndian = v.lang.includes("IN") || v.lang.includes("kn") || v.lang.includes("hi");
    const isExplicitlyFemale = femaleKeywords.some(k => vName.includes(k));
    return isIndian && !isExplicitlyFemale;
  }) || voices.find(v => {
    const vName = v.name.toLowerCase();
    return maleKeywords.some(k => vName.includes(k)) && !femaleKeywords.some(k => vName.includes(k));
  });

  if (maleVoice) {
    utterance.voice = maleVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn("[PriestAudioNarrator] Speech synthesis notice:", e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };
}

export function stopPriestAudio(): void {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
