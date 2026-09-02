import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { FaceFeaturesTab } from "../components/facereading/FaceFeaturesTab";
import { FaceChronologyTab } from "../components/facereading/FaceChronologyTab";
import { FaceMolesTab } from "../components/facereading/FaceMolesTab";
import { FaceScannerLoader } from "../components/facereading/FaceScannerLoader";
import { FaceReadingPdfTemplate } from "../components/facereading/FaceReadingPdfTemplate";
import {
  VEDIC_PANCHA_MAHABHUTA_FACES,
  VEDIC_MAHAPURUSHA_FACIAL_ARCHETYPES,
  VEDIC_LALATA_PLANETARY_LINES,
  VEDIC_EYE_TYPES,
  VEDIC_12_FACIAL_MOLE_ZONES_L5,
  VEDIC_7_FACIAL_FEATURES_CATALOG_L5
} from "../features/facereading/samudrikaFaceKnowledge";
import { executeFaceReading, type FaceReadingResult } from "../features/facereading/faceReadingEngine";

describe("Muka Samudrika (Face Reading) Dynamic Tabs & Localization Audit", () => {
  afterEach(() => {
    cleanup();
  });

  const mockResult: FaceReadingResult = {
    imageDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    devoteeName: "Aditi Sharma",
    estimatedAge: 34,
    facialConstitution: {
      primaryElement: {
        kn: "ಅಗ್ನಿ ತತ್ತ್ವ (Agni / Fire)",
        en: "Fire Element (Tejas & Radiant Will)",
        hi: "अग्नि तत्व (तेजस्वी एवं दृढ़ संकल्प)",
        te: "అగ్ని తత్త్వం (తేజస్సు)",
        ta: "நெருப்பு தத்துவம் (தேஜஸ்)"
      },
      ayurvedicDosha: {
        kn: "ಪಿತ್ತ-ಕಫ (Pitta-Kapha)",
        en: "Pitta-Kapha",
        hi: "पित्त-कफ",
        te: "పిత్త-కఫ",
        ta: "பித்தம்-கபம்"
      },
      auraGlow: {
        kn: "ತೇಜಸ್ವಿ & ಪ್ರಕಾಶಮಾನ (Radiant Tejas)",
        en: "Radiant Tejas & Ojas",
        hi: "तेजस्वी व कांतिमय",
        te: "వర్చస్సు",
        ta: "தேஜஸ்"
      },
      mahapurushaArchetype: {
        kn: "ಹಂಸ ಮಹಾಪುರುಷ ಯೋಗ (ಗುರು ಪ್ರಭಾವ)",
        en: "Hamsa Mahapurusha Archetype (Jupiter)",
        hi: "हंस महापुरुष योग (बृहस्पति)",
        te: "హంస మహాపురుష యోగం (గురు)",
        ta: "ஹம்ச மகாபுருஷ யோகம் (குரு)"
      },
      eyeShapeType: {
        kn: "ಪದ್ಮಾಕ್ಷಿ (ಕಮಲದಳ ನೇತ್ರ)",
        en: "Padmakshi (Lotus/Almond Eyes)",
        hi: "पद्माक्षी (कमलनयन)",
        te: "పద్మాక్షి (కమల నేత్రాలు)",
        ta: "பத்மாக்ஷி (தாமரைக் கண்கள்)"
      }
    },
    features: VEDIC_7_FACIAL_FEATURES_CATALOG_L5,
    foreheadLines: [
      {
        planet: { kn: "ಶನಿ", en: "Saturn", hi: "शनि", te: "శని", ta: "சனி" },
        status: { kn: "ಸ್ಪಷ್ಟ ರೇಖೆ", en: "Clear line", hi: "स्पष्ट रेखा", te: "స్పష్టమైన రేఖ", ta: "தெளிவான ரேகை" },
        indication: { kn: "ದೀರ್ಘಾಯುಷ್ಯ", en: "Longevity", hi: "दीर्घायु", te: "దీర్ఘాయుష్షు", ta: "நீண்ட ஆயுள்" }
      }
    ],
    philtrumBrahmaRekha: {
      depth: {
        kn: "ಆಳವಾದ ಬ್ರಹ್ಮ ರೇಖೆ",
        en: "Deep Brahma Rekha",
        hi: "गहरी ब्रह्म रेखा",
        te: "లోతైన బ్రహ్మ రేఖ",
        ta: "ஆழமான பிரம்ம ரேகை"
      },
      indication: {
        kn: "ಉತ್ತಮ ಸಂತಾನ ಭಾಗ್ಯ",
        en: "Auspicious lineage",
        hi: "शुभ संतान योग",
        te: "సంతాన యోగం",
        ta: "சந்தான பாக்கியம்"
      }
    },
    ageMilestones: [
      {
        agePhase: {
          kn: "೧. ಯೌವನ & ವಿದ್ಯಾಭ್ಯಾಸ",
          en: "1. Youth & Foundation",
          hi: "१. यौवन एवं विद्याभ्यास",
          te: "౧. యవ్వనం & విద్యాభ్యాసం",
          ta: "1. இளமை & கல்விப் பருவம்"
        },
        ageWindow: {
          kn: "೧೫ ರಿಂದ ೩೦ ವರ್ಷ",
          en: "15 to 30 Years",
          hi: "15 से 30 वर्ष",
          te: "15 నుండి 30 సంవత్సరాలు",
          ta: "15 முதல் 30 ஆண்டுகள்"
        },
        facialArea: { kn: "ಲಲಾಟ", en: "Forehead", hi: "ललाट", te: "లలాటం", ta: "நெற்றி" },
        prediction: { kn: "ವಿದ್ಯಾ ಸಾಧನೆ", en: "Academic achievement", hi: "विद्या लाभ", te: "విద్యా లాభం", ta: "கல்வி யோகம்" }
      },
      {
        agePhase: {
          kn: "೨. ವೃತ್ತಿ ಉನ್ನತಿ & ವಿವಾಹ",
          en: "2. Career & Marriage",
          hi: "२. करियर उन्नति एवं विवाह",
          te: "౨. వృత్తి ఉన్నతి & వివాహం",
          ta: "2. தொழில் உயர்வு & திருமணம்"
        },
        ageWindow: {
          kn: "೩೧ ರಿಂದ ೪೦ ವರ್ಷ",
          en: "31 to 40 Years",
          hi: "31 से 40 वर्ष",
          te: "31 నుండి 40 సంవత్సరాలు",
          ta: "31 முதல் 40 ஆண்டுகள்"
        },
        facialArea: { kn: "ನೇತ್ರ", en: "Eyes", hi: "नेत्र", te: "నేత్రాలు", ta: "கண்கள்" },
        prediction: { kn: "ವಿವಾಹ ಯೋಗ", en: "Marital harmony", hi: "विवाह सुख", te: "వివాహ యోగం", ta: "திருமண யோகம்" }
      }
    ],
    moles: [
      {
        location: { kn: "ಹಣೆಯ ಬಲಭಾಗ", en: "Right Forehead", hi: "दायां ललाट", te: "కుడి నుదురు", ta: "வலது நெற்றி" },
        significance: { kn: "ಧನಾಗಮನ", en: "Financial gains", hi: "धन लाभ", te: "ధన లాభం", ta: "தன லாபம்" },
        isAuspicious: true
      }
    ],
    overallTejasScore: 92,
    kundliData: {
      lagna: "ಮೇಷ",
      rashi: "ಧನಸ್ಸು",
      nakshatra: "ಮೂಲ",
      maandi: "ಕುಂಭ",
      dasha: "ಗುರು"
    },
    verdictTitle: {
      kn: "🌟 ರಾಜಲಕ್ಷಣ ಯುಕ್ತ ತೇಜಸ್ವಿ ಮುಖ ಸಾಮುದ್ರಿಕ ಯೋಗ",
      en: "🌟 Auspicious Royal Facial Feature Realization",
      hi: "🌟 अत्यंत शुभ राजलक्षण मुख सामुद्रिक योग",
      te: "🌟 అత్యుత్తమ రాజలక్షణ ముఖ సాముద్రిక యోగం",
      ta: "🌟 ராஜலக்ஷண முக சாமூத்ரிகா யோகம்"
    },
    aiPrediction: "Test Vedic face reading prediction.",
    remedyRecommendation: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ರುದ್ರಾಭಿಷೇಕ",
      en: "Offer Rudrabhisheka at Sri Gokarna Mahabaleshwara temple",
      hi: "श्री गोकर्ण महाबलेश्वर को रुद्राभिषेक करें",
      te: "శ్రీ గోకర్ణ మహాబలేశ్వరునికి రుద్రాభిషేకం చేయండి",
      ta: "ஶ்ரீ கோகர்ண மகாபலேஸ்வரருக்கு ருத்ராபிஷேகம் செய்யவும்"
    },
    generatedAt: "2026-09-02T10:00:00Z"
  };

  describe("1. Knowledge Base (samudrikaFaceKnowledge) 5-Language Completeness", () => {
    const requiredLangs = ["kn", "en", "hi", "te", "ta"] as const;

    it("ensures all 5 Pancha Mahabhuta faces have 5-language descriptions", () => {
      Object.entries(VEDIC_PANCHA_MAHABHUTA_FACES).forEach(([key, face]) => {
        requiredLangs.forEach((lang) => {
          expect(face.name[lang], `Mahabhuta face '${key}' missing name in ${lang}`).toBeTruthy();
          expect(face.traits[lang], `Mahabhuta face '${key}' missing traits in ${lang}`).toBeTruthy();
        });
      });
    });

    it("ensures all 5 Mahapurusha archetypes have 5-language descriptions", () => {
      Object.entries(VEDIC_MAHAPURUSHA_FACIAL_ARCHETYPES).forEach(([key, arch]) => {
        requiredLangs.forEach((lang) => {
          expect(arch.name[lang], `Mahapurusha archetype '${key}' missing name in ${lang}`).toBeTruthy();
          expect(arch.features[lang], `Mahapurusha archetype '${key}' missing features in ${lang}`).toBeTruthy();
        });
      });
    });

    it("ensures all 7 Lalata planetary lines have 5-language descriptions", () => {
      VEDIC_LALATA_PLANETARY_LINES.forEach((line, idx) => {
        requiredLangs.forEach((lang) => {
          expect(line.planet[lang], `Lalata line #${idx} missing planet in ${lang}`).toBeTruthy();
          expect(line.meaning[lang], `Lalata line #${idx} missing meaning in ${lang}`).toBeTruthy();
        });
      });
    });

    it("ensures all 4 eye shape types have 5-language descriptions", () => {
      Object.entries(VEDIC_EYE_TYPES).forEach(([key, eye]) => {
        requiredLangs.forEach((lang) => {
          expect(eye.name[lang], `Eye type '${key}' missing name in ${lang}`).toBeTruthy();
          expect(eye.meaning[lang], `Eye type '${key}' missing meaning in ${lang}`).toBeTruthy();
        });
      });
    });

    it("ensures all 12 facial mole zones have 5-language descriptions", () => {
      expect(VEDIC_12_FACIAL_MOLE_ZONES_L5.length).toBe(12);
      VEDIC_12_FACIAL_MOLE_ZONES_L5.forEach((zone) => {
        requiredLangs.forEach((lang) => {
          expect(zone.location[lang], `Mole zone '${zone.id}' missing location in ${lang}`).toBeTruthy();
          expect(zone.meaning[lang], `Mole zone '${zone.id}' missing meaning in ${lang}`).toBeTruthy();
        });
      });
    });

    it("ensures all 7 facial features catalog items have 5-language descriptions and valid scores", () => {
      expect(VEDIC_7_FACIAL_FEATURES_CATALOG_L5.length).toBe(7);
      VEDIC_7_FACIAL_FEATURES_CATALOG_L5.forEach((feat) => {
        expect(feat.score).toBeGreaterThanOrEqual(80);
        expect(feat.score).toBeLessThanOrEqual(100);
        requiredLangs.forEach((lang) => {
          expect(feat.name[lang], `Feature '${feat.featureKey}' missing name in ${lang}`).toBeTruthy();
          expect(feat.planetaryRuler[lang], `Feature '${feat.featureKey}' missing planetaryRuler in ${lang}`).toBeTruthy();
          expect(feat.observedStructure[lang], `Feature '${feat.featureKey}' missing observedStructure in ${lang}`).toBeTruthy();
          expect(feat.vedicIndication[lang], `Feature '${feat.featureKey}' missing vedicIndication in ${lang}`).toBeTruthy();
        });
      });
    });
  });

  describe("2. FaceReadingEngine Localization & Kundli Support", () => {
    it("generates authentic fallback reading with 5-language support", async () => {
      const resEn = await executeFaceReading("mockDataUrl", "Ramesh", "en");
      expect(resEn.devoteeName).toBe("Ramesh");
      expect(resEn.features.length).toBe(7);
      expect(resEn.aiPrediction).toContain("Greetings Ramesh");

      const resKn = await executeFaceReading("mockDataUrl", "ರಾಮೇಶ್", "kn");
      expect(resKn.aiPrediction).toContain("ನಮಸ್ಕಾರ ರಾಮೇಶ್");

      const resHi = await executeFaceReading("mockDataUrl", "रमेश", "hi");
      expect(resHi.aiPrediction).toContain("नमस्ते रमेश");

      const resTe = await executeFaceReading("mockDataUrl", "రమేష్", "te");
      expect(resTe.aiPrediction).toContain("నమస్కారం రమేష్");

      const resTa = await executeFaceReading("mockDataUrl", "ரமேஷ்", "ta");
      expect(resTa.aiPrediction).toContain("வணக்கம் ரமேஷ்");
    });
  });

  describe("3. FaceScannerLoader 5-Language Rendering", () => {
    it("renders Kannada scanner steps correctly", () => {
      render(<FaceScannerLoader lang="kn" isKn={true} />);
      expect(screen.getByText(/ಪ್ರಾಚೀನ ಮುಖ ಲಕ್ಷಣ ಸ್ಕ್ಯಾನರ್/i)).toBeDefined();
      expect(screen.getByText(/॥ ಮುಖಂ ವದತಿ ಧರ್ಮಜ್ಞಂ ಲಕ್ಷಣಂ ಜಯದಾಯಕಮ್ ॥/i)).toBeDefined();
    });

    it("renders English scanner steps correctly", () => {
      cleanup();
      render(<FaceScannerLoader lang="en" isKn={false} />);
      expect(screen.getByText(/Vedic Physiognomy Scanner/i)).toBeDefined();
      expect(screen.getByText(/Mukham Vadati Dharmajnam Lakshanam Jayadayakam/i)).toBeDefined();
    });

    it("renders Hindi scanner steps correctly", () => {
      cleanup();
      render(<FaceScannerLoader lang="hi" isKn={false} />);
      expect(screen.getByText(/वैदिक मुख सामुद्रिक स्कैनर/i)).toBeDefined();
      expect(screen.getByText(/लक्षणं जयदायकम्/i)).toBeDefined();
    });
  });

  describe("4. FaceFeaturesTab Dynamic Rendering & Localization", () => {
    it("renders all 7 features and Metoposcopy in English", () => {
      render(<FaceFeaturesTab result={mockResult} features={mockResult.features} lang="en" />);
      expect(screen.getByText(/7 Facial Features, Mahapurusha Yogas & Metoposcopy/i)).toBeDefined();
      expect(screen.getAllByText(/Strength:/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/7 Forehead Planetary Lines/i)).toBeDefined();
    });

    it("renders all 7 features and Metoposcopy in Kannada", () => {
      cleanup();
      render(<FaceFeaturesTab result={mockResult} features={mockResult.features} lang="kn" />);
      expect(screen.getByText(/ಸಪ್ತ ಮುಖ ಲಕ್ಷಣಗಳು, ಮಹಾಪುರುಷ ಯೋಗ & ಲಲಾಟ ರೇಖೆಗಳು/i)).toBeDefined();
      expect(screen.getAllByText(/ಬಲ:/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/ಲಲಾಟ ಸಪ್ತ ಗ್ರಹ ರೇಖಾ ವಿಶ್ಲೇಷಣೆ/i)).toBeDefined();
    });

    it("renders in Telugu without hardcoded Kannada strength badge", () => {
      cleanup();
      render(<FaceFeaturesTab result={mockResult} features={mockResult.features} lang="te" />);
      expect(screen.getAllByText(/బలం:/i).length).toBeGreaterThan(0);
    });
  });

  describe("5. FaceChronologyTab Dynamic Age Phase & Glowing Current Phase", () => {
    it("renders age badge and activates glowing Current Phase for estimatedAge 34", () => {
      render(
        <FaceChronologyTab
          milestones={mockResult.ageMilestones}
          lang="en"
          estimatedAge={34}
        />
      );

      // Estimated age 34 should trigger phase 2 (31 to 40 Years)
      expect(screen.getByText(/Estimated Face Age: ~34 Years/i)).toBeDefined();
      expect(screen.getByText(/✨ Current Phase/i)).toBeDefined();
      expect(screen.getAllByText(/Age:/i).length).toBeGreaterThan(0);
    });

    it("renders age badge in Kannada with localized Current Phase", () => {
      cleanup();
      render(
        <FaceChronologyTab
          milestones={mockResult.ageMilestones}
          lang="kn"
          estimatedAge={34}
        />
      );

      expect(screen.getByText(/ಮುಖದ ರೇಖಾ ವಯಸ್ಸು: ಸುಮಾರು 34 ವರ್ಷಗಳು/i)).toBeDefined();
      expect(screen.getByText(/✨ ಪ್ರಸ್ತುತ ಹಂತ/i)).toBeDefined();
      expect(screen.getAllByText(/ವಯಸ್ಸು:/i).length).toBeGreaterThan(0);
    });
  });

  describe("6. FaceMolesTab 12-Zone Explorer & Priest Contact Audit", () => {
    it("renders 12-zone mole explorer and verified Gokarna Priest contact", () => {
      render(<FaceMolesTab moles={mockResult.moles} lang="en" />);
      expect(screen.getByText(/12-Zone Facial Mole Explorer:/i)).toBeDefined();
      expect(screen.getByText(/Brihat Samhita Ch. 68/i)).toBeDefined();
      expect(screen.getByText(/Priest Contact: Sri Shreeram Pandit \(\+91 99723 39362\)/i)).toBeDefined();
      expect(screen.getByText(/Auspicious/i)).toBeDefined();
    });

    it("renders 12-zone mole explorer in Kannada with Shreeram Pandit contact", () => {
      cleanup();
      render(<FaceMolesTab moles={mockResult.moles} lang="kn" />);
      expect(screen.getByText(/ದ್ವಾದಶ ಮುಖ ಸ್ಥಾನಗಳ ಮಚ್ಚೆ ಫಲ/i)).toBeDefined();
      expect(screen.getByText(/ಬೃಹತ್ ಸಂಹಿತಾ ಅಧ್ಯಾ. ೬೮/i)).toBeDefined();
      expect(screen.getByText(/ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಅರ್ಚಕರ ಸನ್ನಿಧಿ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ \(\+91 99723 39362\)/i)).toBeDefined();
      expect(screen.getByText(/ಶುಭ/i)).toBeDefined();
    });
  });

  describe("7. FaceReadingPdfTemplate Layout & Feature Count Audit", () => {
    it("renders all 7 features in the PDF template without slicing", () => {
      const { container } = render(
        <FaceReadingPdfTemplate
          result={mockResult}
          devoteeName="Aditi Sharma"
          lang="en"
        />
      );

      // Verify the PDF container exists
      const printable = container.querySelector("#facereading-pdf-printable");
      expect(printable).not.toBeNull();

      // Ensure all 7 features are rendered (no .slice(0, 4) truncation)
      expect(screen.getByText(/1. Forehead \(Lalata\)/i)).toBeDefined();
      expect(screen.getByText(/2. Eyes \(Netra\)/i)).toBeDefined();
      expect(screen.getByText(/3. Nose & Wealth Bridge \(Nasika\)/i)).toBeDefined();
      expect(screen.getByText(/4. Lips & Expression \(Oshtha\)/i)).toBeDefined();
      expect(screen.getByText(/5. Chin & Jawline \(Chibuka\)/i)).toBeDefined();
      expect(screen.getByText(/6. Ears & Lobes \(Karna\)/i)).toBeDefined();
      expect(screen.getByText(/7. Cheeks & Aura Radiance \(Gandasthala\)/i)).toBeDefined();

      // Ensure Priest Contact is present
      expect(screen.getByText(/Sri Shreeram Pandit · Chief Priest, Gokarna Kshetra \(Phone: \+91 99723 39362\)/i)).toBeDefined();
    });
  });
});
