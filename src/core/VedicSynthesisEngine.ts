import { PlanetName, type KundliOutput, type PlanetPosition, type Rashi, type Nakshatra } from "./AstroTypes";
import { normalizeDegree, degreeToRashi, degreeToNakshatra, degreeToNakshatraPada } from "./AstroMath";
import { computeSubDivisionalAmsha, type SubDivisionalAmsha } from "./subDivisions";
import { calculateKpSubLord, type KpSubLordInfo } from "./kpSubLordEngine";
import { calculateHoroscopeRashmi, type HoroscopeRashmiSynthesis, type PlanetRashmiInfo } from "./rashmiChinthaEngine";
import { signLord, naturalRelation } from "./KundliInsightsEngine";
import { calculateTaraBala, calculateChandraBala, friendshipBetween } from "./TaraBalaEngine";
import { findBhuktiAtAge } from "./DashaBhuktiEngine";
import { ageDecimalYearsAt } from "./birthTime";
import { getVedicSynthesisLocale, type SupportedLocale } from "../i18n/vedicSynthesisLocale";

/* ==========================================================================
   1. DETAILED 27 NAKSHATRA TAXONOMY & ENCYCLOPEDIC DATA
   ========================================================================== */

export interface NakshatraTaxonomy {
  index: number;
  sanskrit: string;
  english: string;
  deity: string;
  lord: PlanetName;
  tatva: "Fire" | "Earth" | "Air" | "Water" | "Ether";
  guna: "Sattva" | "Rajas" | "Tamas";
  gana: "Deva" | "Manushya" | "Rakshasa";
  yoni: string;
  nadi: "Adi" | "Madhya" | "Antya";
  bodyPart: string;
  palmistryMarker: string;
  exaltationAnchor?: { planet: PlanetName; degree: number; note: string };
  debilitationAnchor?: { planet: PlanetName; degree: number; note: string };
  bestBhavas: number[];
  worstBhavas: number[];
  mysticalFormula: string;
  remedialMantra: string;
}

export const NAKSHATRA_TAXONOMIES: NakshatraTaxonomy[] = [
  {
    index: 0,
    sanskrit: "ಅಶ್ವಿನಿ (Ashwini)",
    english: "Ashwini",
    deity: "Ashwini Kumaras (Twin Divine Physicians)",
    lord: PlanetName.Ketu,
    tatva: "Earth",
    guna: "Sattva",
    gana: "Deva",
    yoni: "Horse (ಅಶ್ವ)",
    nadi: "Adi",
    bodyPart: "Head, Brain, Cerebral Cortex",
    palmistryMarker: "Upper Mount of Mars & Apollo line inception",
    exaltationAnchor: { planet: PlanetName.Sun, degree: 10, note: "Sun reaches deep exaltation at 10° Aries (Ashwini Pada 3)" },
    bestBhavas: [1, 10, 5],
    worstBhavas: [8, 12],
    mysticalFormula: "Instantaneous Initiation & Cellular Rejuvenation",
    remedialMantra: "ॐ अश्विनीकुमाराभ्यां नमः (Om Ashwini Kumarabhyam Namah)"
  },
  {
    index: 1,
    sanskrit: "ಭರಣಿ (Bharani)",
    english: "Bharani",
    deity: "Yama (Lord of Cosmic Justice & Dharma)",
    lord: PlanetName.Venus,
    tatva: "Earth",
    guna: "Rajas",
    gana: "Manushya",
    yoni: "Elephant (ಗಜ)",
    nadi: "Madhya",
    bodyPart: "Head Organs, Eyes, Female Reproductive Organs",
    palmistryMarker: "Mount of Venus & Girdle of Venus",
    debilitationAnchor: { planet: PlanetName.Saturn, degree: 20, note: "Saturn reaches deep debilitation at 20° Aries (Bharani Pada 3)" },
    bestBhavas: [2, 8, 11],
    worstBhavas: [6, 12],
    mysticalFormula: "Transformative Restraint & Primal Wealth Accumulation",
    remedialMantra: "ॐ यमाय नमः (Om Yamaya Namah)"
  },
  {
    index: 2,
    sanskrit: "ಕೃತ್ತಿಕಾ (Krittika)",
    english: "Krittika",
    deity: "Agni (God of Sacred Fire)",
    lord: PlanetName.Sun,
    tatva: "Fire",
    guna: "Rajas",
    gana: "Rakshasa",
    yoni: "Goat (ಮೇಷ)",
    nadi: "Antya",
    bodyPart: "Neck, Throat, Tonsils, Thyroid Gland",
    palmistryMarker: "Mount of Sun & Ring of Solomon",
    exaltationAnchor: { planet: PlanetName.Moon, degree: 33, note: "Moon reaches deep exaltation at 3° Taurus (Krittika Pada 2)" },
    bestBhavas: [1, 3, 9, 10],
    worstBhavas: [7, 8],
    mysticalFormula: "Purifying Flame & Razor-Sharp Discrimination",
    remedialMantra: "ॐ अग्नये नमः (Om Agnaye Namah)"
  },
  {
    index: 3,
    sanskrit: "ರೋಹಿಣಿ (Rohini)",
    english: "Rohini",
    deity: "Brahma / Prajapati (Cosmic Creator)",
    lord: PlanetName.Moon,
    tatva: "Earth",
    guna: "Rajas",
    gana: "Manushya",
    yoni: "Serpent (ಸರ್ಪ)",
    nadi: "Antya",
    bodyPart: "Face, Tongue, Mouth, Neck vertebrae",
    palmistryMarker: "Mount of Moon (Radiant & Unblemished)",
    bestBhavas: [2, 4, 5, 9],
    worstBhavas: [6, 8],
    mysticalFormula: "Fertile Manifestation, Aesthetics & Magnetic Grace",
    remedialMantra: "ॐ ब्रह्मणे नमः (Om Brahmane Namah)"
  },
  {
    index: 4,
    sanskrit: "ಮೃಗಶಿರ (Mrigashirsha)",
    english: "Mrigashira",
    deity: "Soma (God of Divine Nectar / Chandra)",
    lord: PlanetName.Mars,
    tatva: "Earth",
    guna: "Tamas",
    gana: "Deva",
    yoni: "Serpent (ಸರ್ಪ)",
    nadi: "Madhya",
    bodyPart: "Chin, Cheeks, Vocal Cords, Shoulders",
    palmistryMarker: "Line of Head starting with delicate fork",
    bestBhavas: [3, 5, 10, 11],
    worstBhavas: [7, 12],
    mysticalFormula: "The Eternal Quest, Research & Fluid Intellect",
    remedialMantra: "ॐ सोमाय नमः (Om Somaya Namah)"
  },
  {
    index: 5,
    sanskrit: "ಆರ್ದ್ರಾ (Ardra)",
    english: "Ardra",
    deity: "Rudra (Lord of Storms & Dissolution)",
    lord: PlanetName.Rahu,
    tatva: "Water",
    guna: "Tamas",
    gana: "Manushya",
    yoni: "Dog (ಶ್ವಾನ)",
    nadi: "Adi",
    bodyPart: "Eyes, Skull, Nervous Pathways",
    palmistryMarker: "Mount of Rahu with clear upward trident",
    bestBhavas: [6, 8, 10, 11],
    worstBhavas: [2, 7],
    mysticalFormula: "Emotional Storm followed by Transcendent Clarity",
    remedialMantra: "ॐ रुद्राय नमः (Om Rudraya Namah)"
  },
  {
    index: 6,
    sanskrit: "ಪುನರ್ವಸು (Punarvasu)",
    english: "Punarvasu",
    deity: "Aditi (Mother of the Gods / Infinite Abundance)",
    lord: PlanetName.Jupiter,
    tatva: "Water",
    guna: "Sattva",
    gana: "Deva",
    yoni: "Cat (ಮಾರ್ಜಾಲ)",
    nadi: "Adi",
    bodyPart: "Ears, Throat, Lungs, Respiratory System",
    palmistryMarker: "Mount of Jupiter with strong vertical empathy rays",
    bestBhavas: [1, 4, 9, 10],
    worstBhavas: [6, 8],
    mysticalFormula: "Return of the Light, Renewal & Safe Haven",
    remedialMantra: "ॐ अदितये नमः (Om Aditaye Namah)"
  },
  {
    index: 7,
    sanskrit: "ಪುಷ್ಯ (Pushya)",
    english: "Pushya",
    deity: "Brihaspati (Divine Guru / Priest of Gods)",
    lord: PlanetName.Saturn,
    tatva: "Water",
    guna: "Tamas",
    gana: "Deva",
    yoni: "Goat (ಮೇಷ)",
    nadi: "Madhya",
    bodyPart: "Lungs, Chest, Breast, Ribs",
    palmistryMarker: "Teacher's Square under Mount of Jupiter",
    exaltationAnchor: { planet: PlanetName.Jupiter, degree: 95, note: "Jupiter reaches deep exaltation at 5° Cancer (Pushya Pada 1)" },
    bestBhavas: [2, 4, 9, 10, 11],
    worstBhavas: [12],
    mysticalFormula: "Nourishment of Dharma, Spiritual Authority & Lasting Fortune",
    remedialMantra: "ॐ बृहस्पतये नमः (Om Brihaspataye Namah)"
  },
  {
    index: 8,
    sanskrit: "ಆಶ್ಲೇಷಾ (Ashlesha)",
    english: "Ashlesha",
    deity: "Nagas (Serpent Deities of Kundalini & Esoteric Wisdom)",
    lord: PlanetName.Mercury,
    tatva: "Water",
    guna: "Sattva",
    gana: "Rakshasa",
    yoni: "Cat (ಮಾರ್ಜಾಲ)",
    nadi: "Antya",
    bodyPart: "Stomach, Esophagus, Pancreas",
    palmistryMarker: "Ring of Solomon & Intuition Crescent on Mount of Moon",
    debilitationAnchor: { planet: PlanetName.Mars, degree: 118, note: "Mars reaches deep debilitation at 28° Cancer (Ashlesha Pada 4)" },
    bestBhavas: [5, 8, 10, 11],
    worstBhavas: [1, 7],
    mysticalFormula: "Hypnotic Penetration & Occult Psychological Mastery",
    remedialMantra: "ॐ सर्पेभ्यो नमः (Om Sarpabhyo Namah)"
  },
  {
    index: 9,
    sanskrit: "ಮಘಾ (Magha)",
    english: "Magha",
    deity: "Pitrs (Ancestral Lineage Deities)",
    lord: PlanetName.Ketu,
    tatva: "Water",
    guna: "Tamas",
    gana: "Rakshasa",
    yoni: "Rat (ಮೂಷಕ)",
    nadi: "Adi",
    bodyPart: "Heart, Spine, Dorsal vertebrae",
    palmistryMarker: "Deep Sun Line connecting with ancestral lifeline root",
    bestBhavas: [1, 9, 10],
    worstBhavas: [6, 8, 12],
    mysticalFormula: "Ancestral Dominion, Regal Dignity & Lineage Honor",
    remedialMantra: "ॐ पितृभ्यो नमः (Om Pitribhyo Namah)"
  },
  {
    index: 10,
    sanskrit: "ಪೂರ್ವ ಫಲ್ಗುಣಿ (Purva Phalguni)",
    english: "Purva Phalguni",
    deity: "Bhaga (God of Prosperity & Conjugal Bliss)",
    lord: PlanetName.Venus,
    tatva: "Water",
    guna: "Rajas",
    gana: "Manushya",
    yoni: "Rat (ಮೂಷಕ)",
    nadi: "Madhya",
    bodyPart: "Spinal Column, Heart, Spleen",
    palmistryMarker: "Branching Heart Line merging into Mount of Jupiter",
    bestBhavas: [2, 5, 7, 11],
    worstBhavas: [6, 8],
    mysticalFormula: "Creative Celebration, Romance & Harmonious Alliances",
    remedialMantra: "ॐ भगाय नमः (Om Bhagaya Namah)"
  },
  {
    index: 11,
    sanskrit: "ಉತ್ತರ ಫಲ್ಗುಣಿ (Uttara Phalguni)",
    english: "Uttara Phalguni",
    deity: "Aryaman (God of Patronage, Contracts & Noble Friendship)",
    lord: PlanetName.Sun,
    tatva: "Fire",
    guna: "Tamas",
    gana: "Manushya",
    yoni: "Cow (ಗೌ)",
    nadi: "Antya",
    bodyPart: "Intestines, Liver, Lower spine",
    palmistryMarker: "Straight, resolute Fate Line reaching Saturn Mount",
    bestBhavas: [1, 7, 9, 10],
    worstBhavas: [8, 12],
    mysticalFormula: "Dharmic Philanthropy, Steadfast Loyalty & Leadership",
    remedialMantra: "ॐ अर्यम्णे नमः (Om Aryamne Namah)"
  },
  {
    index: 12,
    sanskrit: "ಹಸ್ತ (Hasta)",
    english: "Hasta",
    deity: "Savitar (The Solar Craftsman / Golden Dawn)",
    lord: PlanetName.Moon,
    tatva: "Fire",
    guna: "Rajas",
    gana: "Deva",
    yoni: "Buffalo (ಮಹಿಷ)",
    nadi: "Adi",
    bodyPart: "Hands, Fingers, Wrists, Forearms",
    palmistryMarker: "Clear quadrangle and agile hand agility lines",
    exaltationAnchor: { planet: PlanetName.Mercury, degree: 165, note: "Mercury reaches deep exaltation at 15° Virgo (Hasta Pada 2)" },
    bestBhavas: [2, 3, 5, 10, 11],
    worstBhavas: [6, 12],
    mysticalFormula: "Mastery of Dexterity, Precision Engineering & Healing Hands",
    remedialMantra: "ॐ सवित्रे नमः (Om Savitre Namah)"
  },
  {
    index: 13,
    sanskrit: "ಚಿತ್ರಾ (Chitra)",
    english: "Chitra",
    deity: "Tvashtar (Divine Celestial Architect & Sculptor)",
    lord: PlanetName.Mars,
    tatva: "Fire",
    guna: "Tamas",
    gana: "Rakshasa",
    yoni: "Tiger (ವ್ಯಾಘ್ರ)",
    nadi: "Madhya",
    bodyPart: "Forehead, Abdomen, Pelvic Region",
    palmistryMarker: "Star on Mount of Apollo (Artistic Brilliance)",
    debilitationAnchor: { planet: PlanetName.Venus, degree: 177, note: "Venus reaches deep debilitation at 27° Virgo (Chitra Pada 2)" },
    bestBhavas: [3, 5, 10, 11],
    worstBhavas: [6, 8],
    mysticalFormula: "Visual Perfection, Dimensional Geometry & Multi-Disciplinary Art",
    remedialMantra: "ॐ त्वष्ट्रे नमः (Om Tvashtre Namah)"
  },
  {
    index: 14,
    sanskrit: "ಸ್ವಾತಿ (Swati)",
    english: "Swati",
    deity: "Vayu (God of Prana, Wind & Movement)",
    lord: PlanetName.Rahu,
    tatva: "Fire",
    guna: "Tamas",
    gana: "Deva",
    yoni: "Buffalo (ಮಹಿಷ)",
    nadi: "Antya",
    bodyPart: "Kidneys, Bladder, Skin, Epidermis",
    palmistryMarker: "Supple thumb and expansive Line of Mercury (Hepatica)",
    exaltationAnchor: { planet: PlanetName.Saturn, degree: 200, note: "Saturn reaches deep exaltation at 20° Libra (Swati Pada 4)" },
    debilitationAnchor: { planet: PlanetName.Sun, degree: 190, note: "Sun reaches deep debilitation at 10° Libra (Swati Pada 2)" },
    bestBhavas: [7, 9, 10, 11],
    worstBhavas: [1, 6],
    mysticalFormula: "Spontaneous Independence, Trade Mastery & Free Flow of Prana",
    remedialMantra: "ॐ वायवे नमः (Om Vayave Namah)"
  },
  {
    index: 15,
    sanskrit: "ವಿಶಾಖಾ (Vishakha)",
    english: "Vishakha",
    deity: "Indra-Agni (Alliance of Sovereign Might & Sacred Fire)",
    lord: PlanetName.Jupiter,
    tatva: "Fire",
    guna: "Sattva",
    gana: "Rakshasa",
    yoni: "Tiger (ವ್ಯಾಘ್ರ)",
    nadi: "Antya",
    bodyPart: "Lower Abdomen, Groin, Appendicitis zone",
    palmistryMarker: "Strong ambition branch from Head Line to Jupiter",
    debilitationAnchor: { planet: PlanetName.Moon, degree: 213, note: "Moon reaches deep debilitation at 3° Scorpio (Vishakha Pada 4)" },
    bestBhavas: [1, 5, 9, 11],
    worstBhavas: [6, 8, 12],
    mysticalFormula: "Single-Pointed Triumph, Competitive Victory & Zenith Focus",
    remedialMantra: "ॐ इन्द्राग्निभ्यां नमः (Om Indragnibhyam Namah)"
  },
  {
    index: 16,
    sanskrit: "ಅನುರಾಧಾ (Anuradha)",
    english: "Anuradha",
    deity: "Mitra (God of Divine Friendship & Global Fellowship)",
    lord: PlanetName.Saturn,
    tatva: "Fire",
    guna: "Tamas",
    gana: "Deva",
    yoni: "Deer (ಹರಿಣ)",
    nadi: "Madhya",
    bodyPart: "Bladder, Genital Organs, Pelvis bones",
    palmistryMarker: "Long mystic cross between Heart and Head lines",
    bestBhavas: [4, 7, 9, 11, 12],
    worstBhavas: [6, 8],
    mysticalFormula: "Unconditional Devotion, Organizational Diplomatic Bridge",
    remedialMantra: "ॐ मित्राय नमः (Om Mitraya Namah)"
  },
  {
    index: 17,
    sanskrit: "ಜ್ಯೇಷ್ಠಾ (Jyeshtha)",
    english: "Jyeshtha",
    deity: "Indra (King of the Gods / Chief Protector)",
    lord: PlanetName.Mercury,
    tatva: "Air",
    guna: "Sattva",
    gana: "Rakshasa",
    yoni: "Deer (ಹರಿಣ)",
    nadi: "Adi",
    bodyPart: "Colon, Anus, Ovaries / Prostate",
    palmistryMarker: "Upper Mount of Mars with strong defensive resilience lines",
    bestBhavas: [3, 6, 10, 11],
    worstBhavas: [7, 8, 12],
    mysticalFormula: "Elder Authority, Strategic Shielding & Sovereign Protection",
    remedialMantra: "ॐ इन्द्राय नमः (Om Indraya Namah)"
  },
  {
    index: 18,
    sanskrit: "ಮೂಲಾ (Mula)",
    english: "Mula",
    deity: "Nirriti (Goddess of Deep Dissolution & Root Transformation)",
    lord: PlanetName.Ketu,
    tatva: "Air",
    guna: "Tamas",
    gana: "Rakshasa",
    yoni: "Dog (ಶ್ವಾನ)",
    nadi: "Adi",
    bodyPart: "Hips, Thighs, Sciatic Nerve",
    palmistryMarker: "Islanded start of Life Line transforming into deep, unbroken trunk",
    bestBhavas: [8, 9, 12],
    worstBhavas: [2, 7],
    mysticalFormula: "Root Extraction, Uprooting Illusion & Esoteric Awakening",
    remedialMantra: "ॐ निर्ऋतये नमः (Om Nirritaye Namah)"
  },
  {
    index: 19,
    sanskrit: "ಪೂರ್ವಾಷಾಢಾ (Purva Ashadha)",
    english: "Purva Ashadha",
    deity: "Apas (Cosmic Waters of Invincible Purity)",
    lord: PlanetName.Venus,
    tatva: "Air",
    guna: "Rajas",
    gana: "Manushya",
    yoni: "Monkey (ವಾನರ)",
    nadi: "Madhya",
    bodyPart: "Thighs, Femur, Arterial circulation",
    palmistryMarker: "Graceful curve of Sun Line on Apollo Mount",
    bestBhavas: [1, 5, 9, 11],
    worstBhavas: [6, 8],
    mysticalFormula: "Invincible Declaration, Cleansing Waters & Unconquerable Will",
    remedialMantra: "ॐ अद्भ्यो नमः (Om Adbhyo Namah)"
  },
  {
    index: 20,
    sanskrit: "ಉತ್ತರಾಷಾಢಾ (Uttara Ashadha)",
    english: "Uttara Ashadha",
    deity: "Vishvadevas (Universal Cosmic Principles of Truth)",
    lord: PlanetName.Sun,
    tatva: "Air",
    guna: "Sattva",
    gana: "Manushya",
    yoni: "Mongoose (ನಕುಲ)",
    nadi: "Antya",
    bodyPart: "Thighs, Knees, Skin structure",
    palmistryMarker: "Double Fate Line signifying unyielding societal responsibility",
    debilitationAnchor: { planet: PlanetName.Jupiter, degree: 275, note: "Jupiter reaches deep debilitation at 5° Capricorn (Uttara Ashadha Pada 3)" },
    bestBhavas: [1, 9, 10, 11],
    worstBhavas: [6, 8],
    mysticalFormula: "Final Victory through Dharma, Universal Harmony & Unwavering Duty",
    remedialMantra: "ॐ विश्वेभ्यो देवेभ्यो नमः (Om Vishvebhyo Devebhyo Namah)"
  },
  {
    index: 21,
    sanskrit: "ಶ್ರವಣ (Shravana)",
    english: "Shravana",
    deity: "Vishnu (The Preserver & Sustainer of the Cosmos)",
    lord: PlanetName.Moon,
    tatva: "Air",
    guna: "Rajas",
    gana: "Deva",
    yoni: "Monkey (ವಾನರ)",
    nadi: "Antya",
    bodyPart: "Ears, Auditory Organs, Knees",
    palmistryMarker: "Line of Intuition curved towards Mount of Mercury",
    bestBhavas: [2, 4, 9, 10, 11],
    worstBhavas: [6, 12],
    mysticalFormula: "The Art of Listening, Oral Tradition Preservation & Supreme Wisdom",
    remedialMantra: "ॐ विष्णवे नमः (Om Vishnave Namah)"
  },
  {
    index: 22,
    sanskrit: "ಧನಿಷ್ಠಾ (Dhanishtha)",
    english: "Dhanishtha",
    deity: "Ashta Vasus (Eight Gods of Universal Energy & Elemental Wealth)",
    lord: PlanetName.Mars,
    tatva: "Ether",
    guna: "Tamas",
    gana: "Rakshasa",
    yoni: "Lion (ಸಿಂಹ)",
    nadi: "Madhya",
    bodyPart: "Knees, Ankles, Shin Bones",
    palmistryMarker: "Symmetrical Ring of Venus and high rhythmic palm arches",
    exaltationAnchor: { planet: PlanetName.Mars, degree: 298, note: "Mars reaches deep exaltation at 28° Capricorn (Dhanishtha Pada 2)" },
    bestBhavas: [3, 6, 10, 11],
    worstBhavas: [7, 12],
    mysticalFormula: "Symphonic Rhythm, Martial Valour & Inexhaustible Abundance",
    remedialMantra: "ॐ वसुभ्यो नमः (Om Vasubhyo Namah)"
  },
  {
    index: 23,
    sanskrit: "ಶತಭಿಷಾ (Shatabhisha)",
    english: "Shatabhisha",
    deity: "Varuna (Cosmic Ocean of Celestial Cosmic Law)",
    lord: PlanetName.Rahu,
    tatva: "Ether",
    guna: "Tamas",
    gana: "Rakshasa",
    yoni: "Horse (ಅಶ್ವ)",
    nadi: "Adi",
    bodyPart: "Calves, Ankles, Nervous reflex arcs",
    palmistryMarker: "Healer's Medical Stigmata on Mount of Mercury",
    bestBhavas: [8, 10, 11, 12],
    worstBhavas: [1, 7],
    mysticalFormula: "The Hundred Healers, Cosmic Secret Codes & Dimensional Therapy",
    remedialMantra: "ॐ वरुणाय नमः (Om Varunaya Namah)"
  },
  {
    index: 24,
    sanskrit: "ಪೂರ್ವ ಭಾದ್ರಪದ (Purva Bhadrapada)",
    english: "Purva Bhadrapada",
    deity: "Aja Ekapada (One-Footed Primordial Serpent / Cosmic Lightning)",
    lord: PlanetName.Jupiter,
    tatva: "Ether",
    guna: "Sattva",
    gana: "Manushya",
    yoni: "Lion (ಸಿಂಹ)",
    nadi: "Adi",
    bodyPart: "Ankles, Soles of feet, Blood circulation in legs",
    palmistryMarker: "Deep fork at termination of Head Line indicating dual philosophical acumen",
    bestBhavas: [5, 8, 9, 12],
    worstBhavas: [6, 7],
    mysticalFormula: "Ascetic Fire of Penance, Radical Transformation & Mystical Power",
    remedialMantra: "ॐ अजैकपदे नमः (Om Aja Ekapade Namah)"
  },
  {
    index: 25,
    sanskrit: "ಉತ್ತರ ಭಾದ್ರಪದ (Uttara Bhadrapada)",
    english: "Uttara Bhadrapada",
    deity: "Ahirbudhnya (Serpent of the Primordial Deep Oceans)",
    lord: PlanetName.Saturn,
    tatva: "Ether",
    guna: "Tamas",
    gana: "Manushya",
    yoni: "Cow (ಗೌ)",
    nadi: "Madhya",
    bodyPart: "Feet, Soles, Lymphatic balance",
    palmistryMarker: "High, serene Mount of Moon with deep spiritual ascension lines",
    debilitationAnchor: { planet: PlanetName.Mercury, degree: 345, note: "Mercury reaches deep debilitation at 15° Pisces (Uttara Bhadrapada Pada 4)" },
    bestBhavas: [4, 8, 9, 12],
    worstBhavas: [6, 7],
    mysticalFormula: "Quiet Wisdom of the Deep, Kundalini Stability & Universal Peace",
    remedialMantra: "ॐ अहिर्बुध्न्याय नमः (Om Ahirbudhnyaya Namah)"
  },
  {
    index: 26,
    sanskrit: "ರೇವತಿ (Revati)",
    english: "Revati",
    deity: "Pushan (Nourisher of Travelers & Safe Guide to Souls)",
    lord: PlanetName.Mercury,
    tatva: "Ether",
    guna: "Sattva",
    gana: "Deva",
    yoni: "Elephant (ಗಜ)",
    nadi: "Antya",
    bodyPart: "Toes, Feet, Ankle joints",
    palmistryMarker: "Well-defined Solomon Ring and unbroken travel lines from Mount of Moon",
    exaltationAnchor: { planet: PlanetName.Venus, degree: 357, note: "Venus reaches deep exaltation at 27° Pisces (Revati Pada 4)" },
    bestBhavas: [4, 9, 11, 12],
    worstBhavas: [6, 8],
    mysticalFormula: "The Safe Journey to Light, Cosmic Nourishment & Prosperous Completion",
    remedialMantra: "ॐ पूष्णे नमः (Om Pushne Namah)"
  }
];

export const getNakshatraTaxonomy = (nakIndex: number): NakshatraTaxonomy => {
  const i = ((Math.floor(nakIndex) % 27) + 27) % 27;
  return NAKSHATRA_TAXONOMIES[i]!;
};

/* ==========================================================================
   2. DATA MODELS & SYNTHESIS OUTPUTS
   ========================================================================== */

export interface GrahaAmshaProfile {
  name: PlanetName | "Lagna" | "Maandi";
  degree: number;
  rashi: Rashi;
  nakshatra: Nakshatra;
  pada: 1 | 2 | 3 | 4;
  amsha: SubDivisionalAmsha; // D-1, D-9, D-7, D-10, D-12
  amshaDisplayBadge: string; // e.g. "Lagna (D-9: 4 | D-7: 2 | D-10: 8)"
  kpSubLord: KpSubLordInfo;
  rashmi: PlanetRashmiInfo | null;
  grahBalScore: number; // 0-100%
  bhavBalScore: number; // 0-100%
  stellarRelationship: "Synergistic Amplification" | "Balanced / Neutral" | "Paradoxical Synthesis" | "Exalted Star Elevation" | "Debilitated Star Challenge";
  sutraOutcome: "Active / Manifest" | "Latent / Delayed" | "Redirected" | "Paradoxical";
  sutraDiagnosis: string;
  logicGateFormula: string; // e.g. "Graha (Saturn) + Nakshatra (Pushya) + Bhava (10th) + SubLord (Venus) -> Sustained Executive Authority"
}

export interface BhavaSynthesisGate {
  houseNumber: number; // 1 to 12
  sanskritName: string; // Tanu, Dhana, Sahaja...
  englishName: string;
  rashi: Rashi;
  houseLord: PlanetName;
  cuspSubLord: KpSubLordInfo;
  occupants: (PlanetName | "Maandi")[];
  bhavBalScore: number; // 0-100%
  isTrikaLeakageNode: boolean; // 6th, 8th, 12th
  vastuDirection: string; // East, Southeast, South, Southwest, West, Northwest, North, Northeast
  vastuElement: string;
  vastuAlignmentAdvice: string;
  synthesizedPrediction: string;
  dasaValidationStatus: "Active Window (TRUE)" | "Dormant (NULL)";
}

export interface MaandiDiagnosticProfile {
  degree: number;
  rashi: Rashi;
  house: number;
  d9NavamsaNumber: number;
  windowLabel: string;
  isUpachayaGain: boolean; // 3rd, 6th, 10th, 11th
  isAfflictionNode: boolean; // 1st, 2nd, 7th, 8th, 12th
  diagnosticReading: string;
  shantiRemedy: string;
}

export interface PhalitSutraGateChecks {
  rule1_grahBalLatency: {
    passed: boolean;
    latentPlanets: PlanetName[];
    description: string;
  };
  rule2_bhavBalRedirection: {
    compromisedHouses: number[];
    redirectedPlanets: PlanetName[];
    description: string;
  };
  rule3_stellarContradiction: {
    paradoxicalPlanets: PlanetName[];
    synergisticPlanets: PlanetName[];
    description: string;
  };
  rule4_dasaValidation: {
    runningMahaLord: string;
    runningBhuktiLord: string;
    validatedHouses: number[];
    dormantHouses: number[];
    description: string;
  };
}

export interface AdvancedMethodologiesOutput {
  nadiKarmicAudit: {
    pendingKarmaSummary: string;
    saturnJupiterKarmicAxis: string;
    rahuKetuSoulLesson: string;
  };
  jaiminiSynthesis: {
    arudhaLagna: { house: number; rashi: Rashi; meaning: string };
    upapadaLagna: { house: number; rashi: Rashi; meaning: string };
    darapadaA7: { house: number; rashi: Rashi; meaning: string };
    rajyapadaA10: { house: number; rashi: Rashi; meaning: string };
    atmakaraka: { planet: PlanetName; degree: number; soulTheme: string };
    amatyakaraka: { planet: PlanetName; degree: number; careerTheme: string };
  };
  lalKitabAudit: {
    pitraDoshaDetected: boolean;
    pitraDoshaDiagnosis: string;
    totkeRemedies: string[];
  };
  medicalPalmistryCorrelation: {
    vulnerableOrgans: string[];
    palmistryHardwareMarkers: string[];
    remedialLifestyleAdvice: string;
  };
  sarvatobhadraArishtaAlerts: string[];
}

export interface VedicSynthesisResult {
  metadata: {
    name: string;
    birthDate: string;
    birthTime: string;
    currentAgeDecimal: number;
    runningMahadasha: string;
    runningBhukti: string;
    lang: SupportedLocale;
  };
  grahaAmshaProfiles: GrahaAmshaProfile[];
  bhavaSynthesis: BhavaSynthesisGate[];
  maandiProfile: MaandiDiagnosticProfile | null;
  rashmiSynthesis: HoroscopeRashmiSynthesis;
  phalitSutras: PhalitSutraGateChecks;
  advancedMethodologies: AdvancedMethodologiesOutput;
  synthesisSummary: {
    overallExecutiveTone: string;
    peakStrengthBhavas: number[];
    focusPariharas: string[];
  };
}

/* ==========================================================================
   3. INTERNAL CALCULATION HELPERS
   ========================================================================== */

const BHAVA_NAMES: { sanskrit: string; english: string }[] = [
  { sanskrit: "ತನು ಭಾವ (Tanu Bhava)", english: "1st House (Physical Vitality & Persona)" },
  { sanskrit: "ಧನ ಭಾವ (Dhana Bhava)", english: "2nd House (Accumulated Wealth & Speech)" },
  { sanskrit: "ಸಹಜ ಭಾವ (Sahaja Bhava)", english: "3rd House (Courage, Siblings & Initiative)" },
  { sanskrit: "ಸುಖ ಭಾವ (Sukha Bhava)", english: "4th House (Home, Mother & Vehicles)" },
  { sanskrit: "ಪುತ್ರ ಭಾವ (Putra Bhava)", english: "5th House (Progeny, Intellect & Poorva Punya)" },
  { sanskrit: "ಅರಿ ಭಾವ (Ari Bhava)", english: "6th House (Debts, Disease & Competitive Triumph)" },
  { sanskrit: "ಯುವತಿ ಭಾವ (Yuvati Bhava)", english: "7th House (Spouse, Marriage & Business Alliances)" },
  { sanskrit: "ರಂಧ್ರ ಭಾವ (Randhra Bhava)", english: "8th House (Longevity, Transformation & Esoteric Research)" },
  { sanskrit: "ಧರ್ಮ ಭಾವ (Dharma Bhava)", english: "9th House (Fortune, Father, Guru & High Philosophy)" },
  { sanskrit: "ಕರ್ಮ ಭಾವ (Karma Bhava)", english: "10th House (Profession, Status & Executive Authority)" },
  { sanskrit: "ಲಾಭ ಭಾವ (Labha Bhava)", english: "11th House (Unconditional Gains, Fulfillment & Network)" },
  { sanskrit: "ವ್ಯಯ ಭಾವ (Vyaya Bhava)", english: "12th House (Moksha, Foreign Lands & Subconscious Travel)" }
];

const VASTU_DIRECTIONS = [
  { dir: "East (ಪೂರ್ವ)", elem: "Fire / Sun", advice: "Keep the Eastern zone clear and open. Install copper Surya Yantra or brass oil lamp for Lagna vitality." },
  { dir: "Southeast (ಆಗ್ನೇಯ)", elem: "Fire / Venus", advice: "Position the kitchen or culinary fire in the Southeast. Avoid water leakage to protect wealth and reproductive health." },
  { dir: "South (ದಕ್ಷಿಣ)", elem: "Earth-Fire / Mars", advice: "Maintain structural heaviness in the South. Keep red coral or high walls to bolster courage and administrative authority." },
  { dir: "Southwest (ನೈಋತ್ಯ)", elem: "Earth / Rahu-Pitrs", advice: "Master bedroom or heaviest furniture belongs in the Southwest. Ensure zero water storage to prevent Rahu-induced instability." },
  { dir: "West (ಪಶ್ಚಿಮ)", elem: "Air / Saturn", advice: "Dining area or study works well in the West. Install blue/dark metal accents to stabilize Saturnian longevity and career discipline." },
  { dir: "Northwest (ವಾಯುವ್ಯ)", elem: "Air / Moon", advice: "Guest room or pantry fits Northwest. Ensure smooth airflow to eliminate emotional anxiety and maintain fluid cashflow." },
  { dir: "North (ಉತ್ತರ)", elem: "Water-Earth / Mercury", advice: "Keep the North sector open, clean, and filled with green plants or Kubera Yantra for rapid financial influx." },
  { dir: "Northeast (ಈಶಾನ್ಯ)", elem: "Water-Ether / Jupiter", advice: "Pooja altar and meditation sanctum must reside in the Northeast. Zero clutter here guarantees divine guru blessings." },
  { dir: "Center (ಬ್ರಹ್ಮಸ್ಥಾನ)", elem: "Ether / Cosmic Balance", advice: "The central courtyard must remain open to the sky or clutter-free for seamless cosmic ray circulation." },
  { dir: "South (ದಕ್ಷಿಣ)", elem: "Fire / Mars", advice: "Keep heavy storage in South-Southwest to anchor professional standing." },
  { dir: "North (ಉತ್ತರ)", elem: "Air / Mercury", advice: "North-Northeast placement of treasury enhances compound gains." },
  { dir: "East (ಪೂರ್ವ)", elem: "Ether / Jupiter", advice: "East-Northeast study room invites luminous scholarly focus." }
];

/**
 * Computes Jaimini Arudha Padas for houses 1 (AL), 7 (A7/Darapada), 9 (A9), 10 (A10/Rajyapada), 12 (UL/Upapada).
 * Rule: Count from house to house lord; count that same number of houses from house lord.
 * Exception: If Arudha falls in the house itself or 7th from it, shift by 10 houses (or 4 houses in standard Jaimini Sutras).
 */
const computeArudhaPada = (kundli: KundliOutput, houseNum: number): { house: number; rashi: Rashi; meaning: string } => {
  const lagnaRashiIdx = kundli.lagnaRashi.index;
  const houseRashiIdx = (lagnaRashiIdx + (houseNum - 1)) % 12;
  const lord = signLord(houseRashiIdx);
  const lordPlanet = kundli.planets.find((p) => p.name === lord);
  const lordHouse = lordPlanet ? lordPlanet.house : houseNum;

  const dist = ((lordHouse - houseNum + 12) % 12) + 1;
  let arudhaHouse = ((lordHouse + (dist - 1) - 1) % 12) + 1;

  // Jaimini Exception (Svam / Saptamam check)
  if (arudhaHouse === houseNum) {
    arudhaHouse = ((arudhaHouse + 9) % 12) + 1; // 10th from it
  } else if (((arudhaHouse - houseNum + 12) % 12) + 1 === 7) {
    arudhaHouse = ((arudhaHouse + 9) % 12) + 1;
  }

  const arudhaRashiIdx = (lagnaRashiIdx + (arudhaHouse - 1)) % 12;
  const arudhaRashi = degreeToRashi(arudhaRashiIdx * 30);

  let meaning = "";
  if (houseNum === 1) meaning = "Arudha Lagna (AL): Public image, external persona, and how the worldly sphere perceives your status.";
  else if (houseNum === 7) meaning = "Darapada (A7): Business partners, marital image, and commercial contracts.";
  else if (houseNum === 10) meaning = "Rajyapada (A10): Professional zenith, societal fame, and governmental authority.";
  else if (houseNum === 12) meaning = "Upapada Lagna (UL): Marital stability, sacred domestic covenant, and spouse's noble background.";
  else meaning = `Arudha of House ${houseNum}`;

  return { house: arudhaHouse, rashi: arudhaRashi, meaning };
};

/**
 * Computes 7 Jaimini Chara Karakas based on planetary degrees within sign (excluding Rahu/Ketu in standard 7-karaka scheme).
 */
const computeCharaKarakas = (kundli: KundliOutput) => {
  const validPlanets = kundli.planets.filter((p) => p.name !== PlanetName.Rahu && p.name !== PlanetName.Ketu);
  const sorted = [...validPlanets].sort((a, b) => {
    const degA = normalizeDegree(a.degree) % 30;
    const degB = normalizeDegree(b.degree) % 30;
    return degB - degA; // highest degree within sign first
  });

  const atmakaraka = sorted[0]!;
  const amatyakaraka = sorted[1]!;

  return {
    atmakaraka: {
      planet: atmakaraka.name,
      degree: Number((normalizeDegree(atmakaraka.degree) % 30).toFixed(2)),
      soulTheme: `${atmakaraka.name} is your Atmakaraka (King of the Chart). Your core soul evolution centers on mastering ${atmakaraka.name}'s dharmic lessons.`
    },
    amatyakaraka: {
      planet: amatyakaraka.name,
      degree: Number((normalizeDegree(amatyakaraka.degree) % 30).toFixed(2)),
      careerTheme: `${amatyakaraka.name} is your Amatyakaraka (Prime Minister). Your career trajectory and professional intellect are channeled through ${amatyakaraka.name}.`
    }
  };
};

/* ==========================================================================
   4. PRIMARY SYNTHESIS ENGINE
   ========================================================================== */

export async function generateVedicSynthesis(
  kundli: KundliOutput,
  options?: {
    name?: string;
    birthDate?: string;
    birthTime?: string;
    latitude?: number;
    longitude?: number;
    lang?: string;
  }
): Promise<VedicSynthesisResult> {
  const lang = (options?.lang?.split("-")[0]?.toLowerCase() ?? "en") as SupportedLocale;
  const t = getVedicSynthesisLocale(lang);

  const birthDate = options?.birthDate ?? "2000-01-01";
  const birthTime = options?.birthTime ?? "12:00";
  const lat = options?.latitude ?? 14.5479;
  const lon = options?.longitude ?? 74.3187;

  const ageDecimal = ageDecimalYearsAt(birthDate, birthTime, lat, lon, new Date());
  const currentDasha = findBhuktiAtAge(kundli, ageDecimal);
  const mahaLord = currentDasha?.maha.planet ?? PlanetName.Sun;
  const bhuktiLord = currentDasha?.bhukti ?? PlanetName.Sun;

  // 1. Rashmi Chintha (Planetary Rays)
  const rashmiSynthesis = calculateHoroscopeRashmi(kundli);

  // 2. Graha Profiles (with KP Sub-Lords, D-1/D-9/D-7/D-10 Amshas, Rashmi, Bal, Phalit Sutra Gates)
  const grahaAmshaProfiles: GrahaAmshaProfile[] = [];

  // Add Lagna
  const lagnaAmsha = computeSubDivisionalAmsha(kundli.ascendant);
  const lagnaKp = calculateKpSubLord(kundli.ascendant);
  const lagnaPada = degreeToNakshatraPada(kundli.ascendant);
  const lagnaTaxonomy = getNakshatraTaxonomy(lagnaKp.nakshatraIndex);

  grahaAmshaProfiles.push({
    name: "Lagna",
    degree: Number(kundli.ascendant.toFixed(2)),
    rashi: kundli.lagnaRashi,
    nakshatra: lagnaKp.nakshatra,
    pada: lagnaPada,
    amsha: lagnaAmsha,
    amshaDisplayBadge: `Lagna (D-9: ${lagnaAmsha.d9NavamsaNumber} | D-7: ${lagnaAmsha.d7SaptamsaNumber} | D-10: ${lagnaAmsha.d10DasamsaNumber})`,
    kpSubLord: lagnaKp,
    rashmi: null,
    grahBalScore: 85,
    bhavBalScore: 90,
    stellarRelationship: "Balanced / Neutral",
    sutraOutcome: "Active / Manifest",
    sutraDiagnosis: `Lagna sits in ${lagnaKp.nakshatra.english} ruled by ${lagnaKp.nakshatraLord} with KP Sub-Lord ${lagnaKp.subLord}. Vital energy projects cleanly.`,
    logicGateFormula: `Lagna (${kundli.lagnaRashi.english}) + Star (${lagnaKp.nakshatra.english}) + SubLord (${lagnaKp.subLord}) -> Anchors Core Physical Constitution`
  });

  // Process 9 Grahas
  for (const p of kundli.planets) {
    const deg = normalizeDegree(p.degree);
    const amsha = computeSubDivisionalAmsha(deg);
    const kp = calculateKpSubLord(deg);
    const pada = degreeToNakshatraPada(deg);
    const taxonomy = getNakshatraTaxonomy(kp.nakshatraIndex);
    const rashmi = rashmiSynthesis.planets.find((r) => r.planet === p.name) ?? null;

    // Evaluate Grah Bal & Bhav Bal
    let grahBal = 50;
    if (p.isExalted) grahBal += 35;
    else if (p.isDebilitated) grahBal -= 30;
    if (amsha.isVargottama) grahBal += 15;
    if (amsha.isPushkaramsha) grahBal += 10;
    if (p.isRetrograde && p.name !== PlanetName.Rahu && p.name !== PlanetName.Ketu) grahBal += 10;
    if (rashmi && rashmi.modifiedRashmi > (rashmi.maxRashmi * 0.75)) grahBal += 10;
    grahBal = Math.max(15, Math.min(100, grahBal));

    let bhavBal = 50;
    if ([1, 4, 7, 10].includes(p.house)) bhavBal += 15; // Kendra
    if ([5, 9].includes(p.house)) bhavBal += 20; // Trikona
    if ([6, 8, 12].includes(p.house)) bhavBal -= 20; // Dusthana
    if (taxonomy.bestBhavas.includes(p.house)) bhavBal += 15;
    if (taxonomy.worstBhavas.includes(p.house)) bhavBal -= 15;
    bhavBal = Math.max(10, Math.min(100, bhavBal));

    // Stellar Relationship between Planet and Nakshatra Lord
    const nakLord = kp.nakshatraLord;
    const rel = friendshipBetween(p.name as any, nakLord as any);
    
    let stellarRelationship: GrahaAmshaProfile["stellarRelationship"] = "Balanced / Neutral";
    if (taxonomy.exaltationAnchor && taxonomy.exaltationAnchor.planet === p.name) {
      stellarRelationship = "Exalted Star Elevation";
    } else if (taxonomy.debilitationAnchor && taxonomy.debilitationAnchor.planet === p.name) {
      stellarRelationship = "Debilitated Star Challenge";
    } else if (p.name === nakLord || rel === "friend" || rel === "same") {
      stellarRelationship = "Synergistic Amplification";
    } else if (rel === "enemy") {
      stellarRelationship = "Paradoxical Synthesis";
    }

    // Apply 4 Phalit Sutras
    let sutraOutcome: GrahaAmshaProfile["sutraOutcome"] = "Active / Manifest";
    let sutraDiagnosis = "";

    if (grahBal < 40) {
      sutraOutcome = "Latent / Delayed";
      sutraDiagnosis = `Rule 1 Active: ${p.name} Grah Bal (${grahBal}%) is below optimal threshold. Outcomes undergo a karmic maturation delay until Dasa trigger.`;
    } else if (bhavBal < 35) {
      sutraOutcome = "Redirected";
      sutraDiagnosis = `Rule 2 Active: ${p.name} is placed in compromised House ${p.house} (Bhav Bal ${bhavBal}%). Energy is redirected through dispositor ${signLord(p.rashi.index)}.`;
    } else if (stellarRelationship === "Paradoxical Synthesis") {
      sutraOutcome = "Paradoxical";
      sutraDiagnosis = `Rule 3 Active: ${p.name} conflicts with Nakshatra Lord ${nakLord} (${taxonomy.english}). Produces non-linear, unconventional or paradoxical outcomes.`;
    } else {
      sutraOutcome = "Active / Manifest";
      sutraDiagnosis = `${p.name} in ${taxonomy.english} operates with high fidelity. Energy transmits directly to House ${p.house} affairs.`;
    }

    const logicGateFormula = `Graha (${p.name}) + Star (${taxonomy.english}) + Bhava (${p.house}th) + SubLord (${kp.subLord}) -> ${sutraOutcome === "Paradoxical" ? "Paradoxical Mastery" : sutraOutcome === "Latent / Delayed" ? "Gestation & Eventual Rise" : "Direct Auspicious Manifestation"}`;

    grahaAmshaProfiles.push({
      name: p.name,
      degree: Number(deg.toFixed(2)),
      rashi: p.rashi,
      nakshatra: p.nakshatra,
      pada,
      amsha,
      amshaDisplayBadge: `${p.name} (D-9: ${amsha.d9NavamsaNumber} | D-7: ${amsha.d7SaptamsaNumber} | D-10: ${amsha.d10DasamsaNumber})`,
      kpSubLord: kp,
      rashmi,
      grahBalScore: grahBal,
      bhavBalScore: bhavBal,
      stellarRelationship,
      sutraOutcome,
      sutraDiagnosis,
      logicGateFormula
    });
  }

  // Add Maandi if present
  let maandiProfile: MaandiDiagnosticProfile | null = null;
  if (kundli.maandi) {
    const mDeg = normalizeDegree(kundli.maandi.degree);
    const mAmsha = computeSubDivisionalAmsha(mDeg);
    const mKp = calculateKpSubLord(mDeg);
    const mPada = degreeToNakshatraPada(mDeg);
    const mHouse = ((kundli.maandi.rashi.index - kundli.lagnaRashi.index + 12) % 12) + 1;

    const isUpachaya = [3, 6, 10, 11].includes(mHouse);
    const isAffliction = [1, 2, 7, 8, 12].includes(mHouse);

    let diagnosticReading = "";
    let shantiRemedy = "";

    if (mHouse === 6 || mHouse === 11) {
      diagnosticReading = `Maandi in House ${mHouse} acts as a powerful Upachaya shield! Utterly crushes rival strategies, removes stubborn debts, and creates unexpected asset windfalls.`;
      shantiRemedy = "Perform occasional Kartikeya / Shiva Abhisheka to sustain the protective aura.";
    } else if (mHouse === 1) {
      diagnosticReading = "Maandi in 1st House (Lagna) produces acute sensitivity, digestive fire fluctuations, and introspective temperament. Requires energy purification.";
      shantiRemedy = "Gokarna Maandi Shanti, Mahamrityunjaya Japa, and feeding black sesame seeds to birds on Saturdays.";
    } else if (mHouse === 7) {
      diagnosticReading = "Maandi in 7th House indicates marital testing, partner with stubborn convictions, and need for clear commercial boundaries.";
      shantiRemedy = "Gokarna Seva for Kuja-Maandi Shanti and offering silver bilva leaves to Lord Shiva.";
    } else if (mHouse === 8) {
      diagnosticReading = "Maandi in 8th House opens deep esoteric and occult channels, but necessitates caution during long-distance travels.";
      shantiRemedy = "Annual Tripindi Shraddha or Narayana Bali Seva in Gokarna to dissolve ancestral hurdles.";
    } else {
      diagnosticReading = `Maandi in House ${mHouse} stabilizes after mid-life. Channelling energy into ethical discipline yields sustained peace.`;
      shantiRemedy = "Recite Hanuman Chalisa daily and light a sesame oil lamp on Saturdays.";
    }

    maandiProfile = {
      degree: Number(mDeg.toFixed(2)),
      rashi: kundli.maandi.rashi,
      house: mHouse,
      d9NavamsaNumber: mAmsha.d9NavamsaNumber,
      windowLabel: kundli.maandi.windowLabel,
      isUpachayaGain: isUpachaya,
      isAfflictionNode: isAffliction,
      diagnosticReading,
      shantiRemedy
    };

    grahaAmshaProfiles.push({
      name: "Maandi",
      degree: Number(mDeg.toFixed(2)),
      rashi: kundli.maandi.rashi,
      nakshatra: mKp.nakshatra,
      pada: mPada,
      amsha: mAmsha,
      amshaDisplayBadge: `Maandi (D-9: ${mAmsha.d9NavamsaNumber} | D-7: ${mAmsha.d7SaptamsaNumber} | D-10: ${mAmsha.d10DasamsaNumber})`,
      kpSubLord: mKp,
      rashmi: null,
      grahBalScore: isUpachaya ? 85 : 45,
      bhavBalScore: isUpachaya ? 90 : 40,
      stellarRelationship: isUpachaya ? "Synergistic Amplification" : "Debilitated Star Challenge",
      sutraOutcome: isUpachaya ? "Active / Manifest" : "Redirected",
      sutraDiagnosis: diagnosticReading,
      logicGateFormula: `Maandi (${kundli.maandi.rashi.english}) + Star (${mKp.nakshatra.english}) + Bhava (${mHouse}th) -> ${isUpachaya ? "Upachaya Triumph" : "Requires Shanti Tuning"}`
    });
  }

  // 3. 12 Bhava Synthesis
  const bhavaSynthesis: BhavaSynthesisGate[] = [];
  const validatedHouses: number[] = [];
  const dormantHouses: number[] = [];

  for (let h = 1; h <= 12; h++) {
    const rashiIdx = (kundli.lagnaRashi.index + (h - 1)) % 12;
    const rashi = degreeToRashi(rashiIdx * 30);
    const houseLord = signLord(rashiIdx);
    const cuspDeg = normalizeDegree(kundli.ascendant + (h - 1) * 30);
    const cuspSubLord = calculateKpSubLord(cuspDeg);

    const occupants = kundli.planets
      .filter((p) => p.house === h)
      .map((p) => p.name as PlanetName | "Maandi");

    if (maandiProfile && maandiProfile.house === h) {
      occupants.push("Maandi");
    }

    const isTrika = h === 6 || h === 8 || h === 12;
    const vastu = VASTU_DIRECTIONS[h - 1]!;

    // Bhav Bal Score
    const lordPlanet = kundli.planets.find((p) => p.name === houseLord);
    const lordProf = grahaAmshaProfiles.find((g) => g.name === houseLord);
    const lordBal = lordProf?.grahBalScore ?? 50;

    let score = lordBal * 0.5 + 25;
    if (occupants.includes(PlanetName.Jupiter) || occupants.includes(PlanetName.Venus)) score += 15;
    if (occupants.includes(PlanetName.Rahu) || occupants.includes(PlanetName.Saturn)) score -= 10;
    if ([1, 4, 7, 10].includes(h)) score += 10; // Kendra
    if ([5, 9].includes(h)) score += 15; // Trikona
    if (isTrika) score -= 15;
    score = Math.max(10, Math.min(100, Math.round(score)));

    // Dasa Activation Validation (Rule 4)
    const isLordActive = houseLord === mahaLord || houseLord === bhuktiLord;
    const isOccupantActive = occupants.some((o) => o === mahaLord || o === bhuktiLord);
    const isSubLordActive = cuspSubLord.subLord === mahaLord || cuspSubLord.subLord === bhuktiLord;
    const isDasaValid = isLordActive || isOccupantActive || isSubLordActive;

    if (isDasaValid) {
      validatedHouses.push(h);
    } else {
      dormantHouses.push(h);
    }

    let synthesizedPrediction = "";
    if (h === 10) {
      // 10th House Bhrigu Nadi Career synthesis
      const saturn = kundli.planets.find((p) => p.name === PlanetName.Saturn);
      const jupiter = kundli.planets.find((p) => p.name === PlanetName.Jupiter);
      synthesizedPrediction = `10th Bhava (Aajeevika Vichar): Ruled by ${houseLord} with KP Sub-Lord ${cuspSubLord.subLord}. Bhrigu Nadi synthesis connects Saturnian discipline in House ${saturn?.house} with Jupiterian expansion in House ${jupiter?.house}, confirming career elevation through specialized executive authority.`;
    } else if (h === 2) {
      synthesizedPrediction = `2nd Bhava (Dhana & Kutumba): Ruled by ${houseLord}. Financial accumulation is guarded by KP Sub-Lord ${cuspSubLord.subLord}. ${occupants.length ? `Occupied by ${occupants.join(", ")}.` : "No direct malefics obstructing family reserves."}`;
    } else if (h === 7) {
      synthesizedPrediction = `7th Bhava (Yuvati & Alliances): Ruled by ${houseLord} with Sub-Lord ${cuspSubLord.subLord}. Partnership covenant is stabilized when mutual ego demands are moderated.`;
    } else if (isTrika) {
      synthesizedPrediction = `${BHAVA_NAMES[h - 1]!.english}: Trika leakage node. Ruled by ${houseLord}. Requires mindful boundary management and periodic spiritual purification to convert obstacles into spiritual resilience.`;
    } else {
      synthesizedPrediction = `${BHAVA_NAMES[h - 1]!.english}: Ruled by ${houseLord}. Operating at ${score}% Bhav Bal. Supported by ${cuspSubLord.nakshatra.english} constellation vibrations.`;
    }

    bhavaSynthesis.push({
      houseNumber: h,
      sanskritName: BHAVA_NAMES[h - 1]!.sanskrit,
      englishName: BHAVA_NAMES[h - 1]!.english,
      rashi,
      houseLord,
      cuspSubLord,
      occupants,
      bhavBalScore: score,
      isTrikaLeakageNode: isTrika,
      vastuDirection: vastu.dir,
      vastuElement: vastu.elem,
      vastuAlignmentAdvice: vastu.advice,
      synthesizedPrediction,
      dasaValidationStatus: isDasaValid ? "Active Window (TRUE)" : "Dormant (NULL)"
    });
  }

  // 4. Phalit Sutra Gate Checks
  const latentPlanets = grahaAmshaProfiles
    .filter((g) => g.sutraOutcome === "Latent / Delayed" && g.name !== "Lagna" && g.name !== "Maandi")
    .map((g) => g.name as PlanetName);

  const redirectedPlanets = grahaAmshaProfiles
    .filter((g) => g.sutraOutcome === "Redirected" && g.name !== "Lagna" && g.name !== "Maandi")
    .map((g) => g.name as PlanetName);

  const paradoxicalPlanets = grahaAmshaProfiles
    .filter((g) => g.sutraOutcome === "Paradoxical" && g.name !== "Lagna" && g.name !== "Maandi")
    .map((g) => g.name as PlanetName);

  const synergisticPlanets = grahaAmshaProfiles
    .filter((g) => g.stellarRelationship === "Synergistic Amplification" && g.name !== "Lagna" && g.name !== "Maandi")
    .map((g) => g.name as PlanetName);

  const compromisedHouses = bhavaSynthesis
    .filter((b) => b.bhavBalScore < 40)
    .map((b) => b.houseNumber);

  const phalitSutras: PhalitSutraGateChecks = {
    rule1_grahBalLatency: {
      passed: latentPlanets.length === 0,
      latentPlanets,
      description: latentPlanets.length
        ? `Planets with latent/delayed outcomes: ${latentPlanets.join(", ")}. These grahas require Dasa activation or specific seed mantras to trigger.`
        : "All key Grahas possess adequate Grah Bal; results manifest on schedule without latent gestation bottlenecks."
    },
    rule2_bhavBalRedirection: {
      compromisedHouses,
      redirectedPlanets,
      description: compromisedHouses.length
        ? `Compromised Bhavas: ${compromisedHouses.join(", ")}. Redirected planets: ${redirectedPlanets.join(", ") || "None"}. Energy flows via dispositor houses.`
        : "All 12 Bhavas maintain healthy structural equilibrium with no severe leakage nodes."
    },
    rule3_stellarContradiction: {
      paradoxicalPlanets,
      synergisticPlanets,
      description: paradoxicalPlanets.length
        ? `Stellar Contradiction observed for ${paradoxicalPlanets.join(", ")} (Graha nature contrasts with Nakshatra Lord). Synergistic stars: ${synergisticPlanets.join(", ")}.`
        : `High stellar harmony. Synergistic Graha-Nakshatra pairs: ${synergisticPlanets.join(", ")}.`
    },
    rule4_dasaValidation: {
      runningMahaLord: mahaLord,
      runningBhuktiLord: bhuktiLord,
      validatedHouses,
      dormantHouses,
      description: `Current Dasa (${mahaLord} / ${bhuktiLord}) directly validates Houses ${validatedHouses.join(", ")} (Event = TRUE). Remaining houses stay dormant (Event = NULL).`
    }
  };

  // 5. Advanced Methodologies (Nadi, Jaimini, Lal Kitab, Medical Palmistry)
  const charaKarakas = computeCharaKarakas(kundli);
  const al = computeArudhaPada(kundli, 1);
  const ul = computeArudhaPada(kundli, 12);
  const a7 = computeArudhaPada(kundli, 7);
  const a10 = computeArudhaPada(kundli, 10);

  // Lal Kitab Pitra Dosha Check
  const ninthHouseLord = signLord((kundli.lagnaRashi.index + 8) % 12);
  const ninthLordPlanet = kundli.planets.find((p) => p.name === ninthHouseLord);
  const sunPlanet = kundli.planets.find((p) => p.name === PlanetName.Sun);
  const rahuPlanet = kundli.planets.find((p) => p.name === PlanetName.Rahu);
  const isPitraDosha =
    (sunPlanet && rahuPlanet && sunPlanet.house === rahuPlanet.house) ||
    (ninthLordPlanet && [6, 8, 12].includes(ninthLordPlanet.house));

  const advancedMethodologies: AdvancedMethodologiesOutput = {
    nadiKarmicAudit: {
      pendingKarmaSummary: "Bhrigu Nandi Nadi reveals a past-life covenant regarding scholarly discipline and family duty. Current life provides opportunities to resolve ancestral debts through selfless service.",
      saturnJupiterKarmicAxis: "The Saturn-Jupiter axis connects professional endurance with higher dharmic philosophy, assuring delayed but unbreakable prosperity.",
      rahuKetuSoulLesson: "Rahu pulls focus towards material innovation and foreign outreach, while Ketu anchors deep detachment and spiritual contemplation."
    },
    jaiminiSynthesis: {
      arudhaLagna: al,
      upapadaLagna: ul,
      darapadaA7: a7,
      rajyapadaA10: a10,
      atmakaraka: charaKarakas.atmakaraka,
      amatyakaraka: charaKarakas.amatyakaraka
    },
    lalKitabAudit: {
      pitraDoshaDetected: !!isPitraDosha,
      pitraDoshaDiagnosis: isPitraDosha
        ? "Lal Kitab Pitra Dosha indication detected due to ancestral 9th house affliction or Sun-Rahu alignment. Causes unexplained career hurdles or delay in progeny."
        : "Zero Pitra Dosha affliction detected. Ancestral lineage rays are harmonious and protective.",
      totkeRemedies: isPitraDosha
        ? [
            "Lal Kitab Totke: Water a sacred Peepal tree every Saturday without touching the bark.",
            "Offer jaggery and roasted gram to cows on Sundays to fortify Sun's paternal rays.",
            "Conduct Gokarna Tripindi Shraddha or Narayana Bali to dissolve ancestral lineage knots."
          ]
        : [
            "Maintain a small silver square in your wallet for sustained financial balance.",
            "Feed birds grains on Wednesday mornings to activate Mercury's commercial intelligence."
          ]
    },
    medicalPalmistryCorrelation: {
      vulnerableOrgans: [
        getNakshatraTaxonomy(lagnaKp.nakshatraIndex).bodyPart,
        ...(kundli.planets.filter((p) => p.isDebilitated || [6, 8].includes(p.house)).map((p) => getNakshatraTaxonomy(calculateKpSubLord(p.degree).nakshatraIndex).bodyPart))
      ],
      palmistryHardwareMarkers: [
        getNakshatraTaxonomy(lagnaKp.nakshatraIndex).palmistryMarker,
        "Deep, uninterrupted Life Line indicating robust foundational vitality.",
        "Clear Mercury Line reflecting active digestive-nervous metabolism."
      ],
      remedialLifestyleAdvice: "Practice early morning Pranayama and Dhanvantari Stotra chanting. Align diet with natural circadian rhythm to keep cellular vitality luminous."
    },
    sarvatobhadraArishtaAlerts: [
      `Transit check: Ensure Moon does not cross your Janma Nakshatra (${kundli.planets.find((p) => p.name === PlanetName.Moon)?.nakshatra.english}) during debilitated Gochara days.`,
      "Sanghatta Chakra cross-points remain clear of major malefic strikes for the upcoming quarter."
    ]
  };

  // 6. Overall Executive Tone & Synthesis Summary
  const topBhavas = [...bhavaSynthesis]
    .sort((a, b) => b.bhavBalScore - a.bhavBalScore)
    .slice(0, 3)
    .map((b) => b.houseNumber);

  const focusPariharas = [
    `Daily chant: ${getNakshatraTaxonomy(lagnaKp.nakshatraIndex).remedialMantra}`,
    `Vastu Optimization: ${bhavaSynthesis[0]!.vastuAlignmentAdvice}`,
    ...(maandiProfile ? [`Maandi Remedy: ${maandiProfile.shantiRemedy}`] : [])
  ];

  return {
    metadata: {
      name: options?.name ?? "Devotee",
      birthDate,
      birthTime,
      currentAgeDecimal: Number(ageDecimal.toFixed(2)),
      runningMahadasha: mahaLord,
      runningBhukti: bhuktiLord,
      lang
    },
    grahaAmshaProfiles,
    bhavaSynthesis,
    maandiProfile,
    rashmiSynthesis,
    phalitSutras,
    advancedMethodologies,
    synthesisSummary: {
      overallExecutiveTone: `Comprehensive synthesis integrates ${kundli.planets.length} Grahas across 27 Nakshatras, KP Sub-Lords, D-1/D-9/D-7/D-10 Amshas, and 12 Bhavas. Total Planetary Rashmi stands at ${rashmiSynthesis.totalRashmi} (${rashmiSynthesis.strengthGrade}). Current Dasa actively triggers Houses ${validatedHouses.join(", ")}.`,
      peakStrengthBhavas: topBhavas,
      focusPariharas
    }
  };
}
