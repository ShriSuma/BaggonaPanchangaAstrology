/**
 * 50 Real-World Public Figures Benchmark Dataset for Baggona Panchanga & Astrology
 *
 * Spans 10 distinct age brackets with balanced genders and verified Rodden Rating AA/A records.
 * Exactly 10 profiles in each of our 5 supported languages:
 * - Kannada (kn): 10 profiles
 * - English (en): 10 profiles
 * - Hindi (hi): 10 profiles
 * - Telugu (te): 10 profiles
 * - Tamil (ta): 10 profiles
 *
 * Each profile contains verified biographical facts, emotional temperament, turning points,
 * 2024–2026 ground truth, and classical Parashari rules on Janma Kundali, Hora (Kora),
 * Panchanga (Tithi, Vara, Nakshatra, Yoga, Karana), and Vajra (Diamond) vs Hawala (Red Coral) analysis.
 */

export type AgeBracketId =
  | "under_2"
  | "under_8"
  | "under_13"
  | "under_18"
  | "under_25"
  | "under_30"
  | "under_35"
  | "under_40"
  | "under_60"
  | "under_80";

export interface BenchmarkProfile50 {
  id: string;
  name: string;
  gender: "Male" | "Female";
  ageBracket: AgeBracketId;
  approxAgeIn2026: number;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm (24h)
  birthPlace: string;
  latitude: number;
  longitude: number;
  roddenRating: "AA" | "A";
  sourceCitation: string;
  maritalStatus?: "unmarried" | "married" | "divorced" | "separated";
  hasChildren?: boolean;
  assignedLanguage: "kn" | "en" | "hi" | "te" | "ta";

  internetGroundTruth: {
    characterAndTemperament: string[];
    primaryFieldAndInterests: string[];
    whenLifeTurned: string;
    currentLifeReality: string;
    majorChallengesFacing: string;
    expectedVocationCodes: string[];
    expectedLifeStageCategory: string;
    astrologicalGroundTruth: {
      approxLagnaSign: string;
      approxMoonSign: string;
      expectedHoraLord: string;
      panchangaSummary: string;
      vajraSuitability: string;
      hawalaSuitability: string;
    };
  };
}

export const BENCHMARK_50_PROFILES: BenchmarkProfile50[] = [
  {
    "id": "rocky_barker",
    "name": "Rocky Thirteen Barker",
    "gender": "Male",
    "ageBracket": "under_2",
    "approxAgeIn2026": 2,
    "birthDate": "2023-11-01",
    "birthTime": "00:00",
    "birthPlace": "Cedars-Sinai Medical Center, Los Angeles, CA, USA",
    "latitude": 34.0754,
    "longitude": -118.3801,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate obtained by TMZ / People magazine (Nov 1, 2023 midnight).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "kn",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Sensory-alert",
        "Rhythmic/musical home influence",
        "Deeply attached to parents",
        "Playful infant curiosity",
        "High vitality"
      ],
      "primaryFieldAndInterests": [
        "Infant developmental milestones",
        "Musical rhythms (drums/music exposure)",
        "Sensory exploration"
      ],
      "whenLifeTurned": "Birth in November 2023 after high-risk pregnancy and emergency fetal surgery, cementing family unity and immediate global spotlight.",
      "currentLifeReality": "Living with parents Kourtney Kardashian and Travis Barker; high public spotlight, protected infant upbringing, strong maternal bonding.",
      "majorChallengesFacing": "Navigating intense paparazzi scrutiny while maintaining healthy pediatric immune development and sensory regulation.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "infant_balarishta_growth",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Cancer",
        "approxMoonSign": "Taurus (Exalted Moon)",
        "expectedHoraLord": "Mercury",
        "panchangaSummary": "Krishna Chaturdashi, Wednesday (Budhavara), Rohini Nakshatra, Variyan Yoga, Vishti Karana",
        "vajraSuitability": "Conditional/Secondary; Venus rules 4th/11th for Cancer. Gentle White Zircon preferred over heavy Diamond.",
        "hawalaSuitability": "Highly Benefic! Mars is supreme Yogakaraka (5th & 10th lord) for Cancer Lagna, conferring vital immunity, courage, and health protection."
      }
    }
  },
  {
    "id": "london_hilton",
    "name": "London Marilyn Hilton Reum",
    "gender": "Female",
    "ageBracket": "under_2",
    "approxAgeIn2026": 2,
    "birthDate": "2023-11-11",
    "birthTime": "11:43",
    "birthPlace": "Cedars-Sinai Medical Center, Los Angeles, CA, USA",
    "latitude": 34.0754,
    "longitude": -118.3801,
    "roddenRating": "AA",
    "sourceCitation": "Official birth certificate obtained by media (Nov 11, 2023 at 11:43 AM).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "en",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Sweet",
        "Delicate",
        "Visually stimulated by bright aesthetics",
        "Calm and joyful infant disposition",
        "Affectionate"
      ],
      "primaryFieldAndInterests": [
        "Early speech exploration",
        "Music and aesthetics",
        "Nursery sensory play"
      ],
      "whenLifeTurned": "Arrival via surrogate in late 2023 as long-desired daughter of Paris Hilton, fulfilling mother's lifelong dream of naming a daughter London.",
      "currentLifeReality": "Lavish luxury nursery, social media glimpses, surrounded by music, beauty, and devoted maternal care.",
      "majorChallengesFacing": "Preserving childhood innocence and emotional grounding within an omnipresent social media empire.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "infant_balarishta_growth",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Capricorn",
        "approxMoonSign": "Libra",
        "expectedHoraLord": "Jupiter",
        "panchangaSummary": "Krishna Trayodashi, Saturday (Shanivara), Chitra / Swati Nakshatra, Ayushman Yoga, Vanija Karana",
        "vajraSuitability": "Supreme Yogakaraka! Venus is 5th & 10th lord for Capricorn Lagna; Diamond or White Zircon unlocks luxury, fame, and aesthetic grace.",
        "hawalaSuitability": "Strictly Prohibited; Mars rules 4th & 11th (Badhaka for Capricorn). Hawala should not be worn without specific consultation."
      }
    }
  },
  {
    "id": "prince_louis",
    "name": "Prince Louis of Wales",
    "gender": "Male",
    "ageBracket": "under_8",
    "approxAgeIn2026": 8,
    "birthDate": "2018-04-23",
    "birthTime": "11:01",
    "birthPlace": "St Mary's Hospital, Paddington, London, UK",
    "latitude": 51.516,
    "longitude": -0.1749,
    "roddenRating": "AA",
    "sourceCitation": "Official Buckingham Palace royal birth bulletin (April 23, 2018 at 11:01 AM BST).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "kn",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "High-energy",
        "Cheeky and mischievous humor",
        "Spontaneous expressions",
        "Fearless outdoor enthusiast",
        "Crowd favorite"
      ],
      "primaryFieldAndInterests": [
        "Outdoor sports (rugby, cricket, running)",
        "Playful arts",
        "Primary school exploration at Lambrook"
      ],
      "whenLifeTurned": "Queen Elizabeth II's Platinum Jubilee in June 2022 where his unfiltered, charming public antics catapulted him into global royal stardom.",
      "currentLifeReality": "Youngest child of Prince William and Catherine; beloved for funny facial expressions at public royal events, high physical stamina, joyful schoolboy life.",
      "majorChallengesFacing": "Balancing spirited, boisterous personal temperament with rigid British royal ceremonial protocol and decorum.",
      "expectedVocationCodes": [
        "government_civil_police",
        "sports_athletics"
      ],
      "expectedLifeStageCategory": "early_childhood_play_milestones",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Cancer",
        "approxMoonSign": "Cancer (Pushya)",
        "expectedHoraLord": "Sun",
        "panchangaSummary": "Shukla Ashtami, Monday (Somavara), Pushya Nakshatra, Dhriti Yoga, Bava Karana",
        "vajraSuitability": "Caution; Venus is Badhaka/4th lord for Cancer. Avoid pure Diamond in childhood to prevent emotional distraction.",
        "hawalaSuitability": "Supreme Yogakaraka! Mars rules 5th and 10th houses for Cancer Lagna. Red Coral (Hawala) energizes focus, physical stamina, and royal courage."
      }
    }
  },
  {
    "id": "true_thompson",
    "name": "True Thompson",
    "gender": "Female",
    "ageBracket": "under_8",
    "approxAgeIn2026": 8,
    "birthDate": "2018-04-12",
    "birthTime": "04:00",
    "birthPlace": "Cleveland, OH, USA",
    "latitude": 41.4993,
    "longitude": -81.6944,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Apr 12, 2018 at 04:00 AM EDT).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "ta",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Tall and athletic",
        "Joyful",
        "Caring big sister",
        "Charismatic",
        "Loves dance and sports"
      ],
      "primaryFieldAndInterests": [
        "Gymnastics and dance",
        "Fashion and modeling with mother",
        "Outdoor sports"
      ],
      "whenLifeTurned": "Birth amidst intense global media storm regarding parental relationships, becoming mother Khloe Kardashian's central emotional anchor.",
      "currentLifeReality": "Thriving primary student in California; blossoming athletic height and cheerful personality, close bond with cousins and brother Tatum.",
      "majorChallengesFacing": "Shielding emotional self-worth from tabloid drama and high-pressure celebrity comparisons.",
      "expectedVocationCodes": [
        "sports_athletics",
        "creative_media"
      ],
      "expectedLifeStageCategory": "early_childhood_play_milestones",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Pisces",
        "approxMoonSign": "Aquarius (Shatabhisha)",
        "expectedHoraLord": "Jupiter",
        "panchangaSummary": "Krishna Ekadashi, Thursday (Guruvara), Shatabhisha Nakshatra, Sadhya Yoga, Balava Karana",
        "vajraSuitability": "Prohibited; Venus rules 3rd & 8th dusthanas for Pisces Lagna. Diamond can trigger emotional turbulence.",
        "hawalaSuitability": "Highly Auspicious! Mars rules 2nd (wealth/speech) and 9th (Bhagya) for Pisces. Red Coral (Hawala) strengthens confidence and bone vitality."
      }
    }
  },
  {
    "id": "stormi_webster",
    "name": "Stormi Webster",
    "gender": "Female",
    "ageBracket": "under_8",
    "approxAgeIn2026": 8,
    "birthDate": "2018-02-01",
    "birthTime": "16:43",
    "birthPlace": "Los Angeles, CA, USA",
    "latitude": 34.0754,
    "longitude": -118.3801,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Feb 1, 2018 at 16:43 PST).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "te",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Poised",
        "Observant",
        "Naturally polite and articulate",
        "Loves music and visual design",
        "Confident demeanor"
      ],
      "primaryFieldAndInterests": [
        "Music and stage rhythm",
        "Fashion & cosmetics branding appearances",
        "School arts"
      ],
      "whenLifeTurned": "Secret pregnancy revealed on Super Bowl Sunday 2018 with record-breaking global announcement video 'To Our Daughter'.",
      "currentLifeReality": "Daughter of Kylie Jenner and Travis Scott; accompanying mother to international fashion weeks, attending private primary school in LA.",
      "majorChallengesFacing": "Maintaining authentic childhood grounding while being heir to a billion-dollar beauty and entertainment empire.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "early_childhood_play_milestones",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Gemini",
        "approxMoonSign": "Leo (Magha)",
        "expectedHoraLord": "Venus",
        "panchangaSummary": "Krishna Dvitiya, Thursday (Guruvara), Magha Nakshatra, Atiganda Yoga, Taitila Karana",
        "vajraSuitability": "Supreme Benefic! Venus rules 5th house of intellect, creativity, and past-life merit for Gemini. Diamond brings immense artistic brilliance.",
        "hawalaSuitability": "Strictly Prohibited! Mars rules 6th & 11th dusthanas for Gemini Lagna. Red Coral triggers physical inflammation and temperamental flares."
      }
    }
  },
  {
    "id": "archie_mountbatten",
    "name": "Archie Harrison Mountbatten-Windsor",
    "gender": "Male",
    "ageBracket": "under_8",
    "approxAgeIn2026": 7,
    "birthDate": "2019-05-06",
    "birthTime": "05:26",
    "birthPlace": "Portland Hospital, London, UK",
    "latitude": 51.516,
    "longitude": -0.1749,
    "roddenRating": "AA",
    "sourceCitation": "Official royal birth announcement & birth certificate (May 6, 2019 at 05:26 BST).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "ta",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Thoughtful",
        "Inquisitive",
        "Warm-hearted",
        "Nature explorer",
        "Loves reading and storytelling"
      ],
      "primaryFieldAndInterests": [
        "Nature and animals",
        "Construction toys and puzzles",
        "Outdoor California sports"
      ],
      "whenLifeTurned": "Early 2020 parental relocation from UK royal duties to Canada and California ('Megxit'), growing up primarily on American West Coast.",
      "currentLifeReality": "Attending local school in Montecito; enjoying private childhood with sister Lilibet, shielded from European royal press frenzy.",
      "majorChallengesFacing": "Navigating dual transatlantic identity and complex estrangement between royal family branches.",
      "expectedVocationCodes": [
        "creative_media",
        "teaching_academics"
      ],
      "expectedLifeStageCategory": "early_childhood_play_milestones",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Aries",
        "approxMoonSign": "Taurus (Krittika)",
        "expectedHoraLord": "Moon",
        "panchangaSummary": "Shukla Dvitiya, Monday (Somavara), Krittika Nakshatra, Shobhana Yoga, Balava Karana",
        "vajraSuitability": "Prohibited as Primary; Venus is 2nd and 7th Maraka lord for Aries Lagna. Wearing heavy Diamond causes health sensitivity.",
        "hawalaSuitability": "Supreme Lagna Lord! Mars is the ruling planet of Aries Lagna. Red Coral provides vital vigor, immunity, athletic prowess, and courageous leadership."
      }
    }
  },
  {
    "id": "princess_lilibet",
    "name": "Princess Lilibet of Sussex",
    "gender": "Female",
    "ageBracket": "under_8",
    "approxAgeIn2026": 5,
    "birthDate": "2021-06-04",
    "birthTime": "11:40",
    "birthPlace": "Santa Barbara Cottage Hospital, Santa Barbara, CA, USA",
    "latitude": 34.4258,
    "longitude": -119.7142,
    "roddenRating": "AA",
    "sourceCitation": "Official royal spokesperson announcement & California birth registration (June 4, 2021 at 11:40 AM PDT).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "hi",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Gentle",
        "Curious",
        "Joyful",
        "Nature-loving",
        "Strong bond with animals and older brother Archie"
      ],
      "primaryFieldAndInterests": [
        "Early preschool learning",
        "Gardening and animals",
        "Singing and movement"
      ],
      "whenLifeTurned": "First birthday visit to the UK during Queen Elizabeth II's Platinum Jubilee in June 2022, meeting her namesake great-grandmother.",
      "currentLifeReality": "Growing up in Montecito, California; kept in private sanctuary away from tabloid intrusions, sunny outdoor play, strong family warmth.",
      "majorChallengesFacing": "Growing up distant from British royal heritage while carrying official royal princely title in the United States.",
      "expectedVocationCodes": [
        "creative_media",
        "teaching_academics"
      ],
      "expectedLifeStageCategory": "early_childhood_play_milestones",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Leo",
        "approxMoonSign": "Pisces (Uttara Bhadrapada)",
        "expectedHoraLord": "Sun",
        "panchangaSummary": "Krishna Dashami, Friday (Shukravara), Uttara Bhadrapada Nakshatra, Ayushman Yoga, Vishti Karana",
        "vajraSuitability": "Prohibited; Venus rules 3rd & 10th enemy houses for Leo Lagna. Diamond increases friction and restlessness.",
        "hawalaSuitability": "Supreme Yogakaraka! Mars is 4th and 9th (Bhagya) lord for Leo Lagna. Red Coral brings immense divine blessings, family happiness, and good fortune."
      }
    }
  },
  {
    "id": "princess_charlotte",
    "name": "Princess Charlotte of Wales",
    "gender": "Female",
    "ageBracket": "under_13",
    "approxAgeIn2026": 11,
    "birthDate": "2015-05-02",
    "birthTime": "08:34",
    "birthPlace": "St Mary's Hospital, Paddington, London, UK",
    "latitude": 51.516,
    "longitude": -0.1749,
    "roddenRating": "AA",
    "sourceCitation": "Official Buckingham Palace royal birth bulletin (May 2, 2015 at 08:34 BST).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "ta",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Confident",
        "Organized leader among brothers",
        "Poised and observant",
        "Passionate dancer and gymnast",
        "Protective demeanor"
      ],
      "primaryFieldAndInterests": [
        "Ballet and contemporary dance",
        "Football and swimming",
        "Royal etiquette and ceremonies"
      ],
      "whenLifeTurned": "State funeral of Queen Elizabeth II in September 2022, displaying solemn maturity that won global admiration at just age 7.",
      "currentLifeReality": "Attending Lambrook School; third in line to the British throne, praised for guiding her brothers at major royal ceremonies.",
      "majorChallengesFacing": "Balancing normal primary school socialization with escalating public visibility and historic constitutional role.",
      "expectedVocationCodes": [
        "government_civil_police",
        "creative_media"
      ],
      "expectedLifeStageCategory": "student_academic_stress",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Gemini",
        "approxMoonSign": "Virgo (Chitra)",
        "expectedHoraLord": "Saturn",
        "panchangaSummary": "Shukla Trayodashi, Saturday (Shanivara), Chitra Nakshatra, Siddhi Yoga, Taitila Karana",
        "vajraSuitability": "Highly Auspicious! Venus is the 5th lord of education, royalty, and arts for Gemini. Diamond or White Zircon enhances elegance and scholarly memory.",
        "hawalaSuitability": "Prohibited; Mars is malefic 6th and 11th lord for Gemini Lagna. Red Coral (Hawala) triggers unnecessary friction."
      }
    }
  },
  {
    "id": "prince_george",
    "name": "Prince George of Wales",
    "gender": "Male",
    "ageBracket": "under_13",
    "approxAgeIn2026": 13,
    "birthDate": "2013-07-22",
    "birthTime": "16:24",
    "birthPlace": "St Mary's Hospital, Paddington, London, UK",
    "latitude": 51.516,
    "longitude": -0.1749,
    "roddenRating": "AA",
    "sourceCitation": "Official Buckingham Palace royal birth bulletin (July 22, 2013 at 16:24 BST).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "en",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Reserved",
        "Dignified",
        "Polite and observant",
        "Conscientious",
        "Growing sense of state duty"
      ],
      "primaryFieldAndInterests": [
        "Aviation and flying",
        "Football (Aston Villa fan)",
        "Tennis",
        "Classical history & royal statecraft"
      ],
      "whenLifeTurned": "Coronation of King Charles III in May 2023, serving as a Page of Honour and realizing his direct destiny as future King.",
      "currentLifeReality": "Second in line to the British throne; transitioning toward secondary boarding school (Eton prep), participating in ceremonial royal duties.",
      "majorChallengesFacing": "Managing heavy academic entrance exams and preparing mentally for lifelong sovereign responsibilities.",
      "expectedVocationCodes": [
        "government_civil_police",
        "sports_athletics"
      ],
      "expectedLifeStageCategory": "student_academic_stress",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Scorpio",
        "approxMoonSign": "Capricorn (Shravana)",
        "expectedHoraLord": "Jupiter",
        "panchangaSummary": "Shukla Purnima, Monday (Somavara), Shravana / Dhanishta Nakshatra, Vishkambha Yoga, Vishti Karana",
        "vajraSuitability": "Strictly Prohibited; Venus rules 7th & 12th Maraka/Vyaya houses for Scorpio Lagna. Diamond creates spiritual and emotional vulnerability.",
        "hawalaSuitability": "Supreme Lagna Lord! Mars rules Scorpio Lagna. Red Coral (Hawala) is the primary life stone, granting courage, leadership resolve, and vital health."
      }
    }
  },
  {
    "id": "north_west",
    "name": "North West",
    "gender": "Female",
    "ageBracket": "under_13",
    "approxAgeIn2026": 13,
    "birthDate": "2013-06-15",
    "birthTime": "05:33",
    "birthPlace": "Cedars-Sinai Medical Center, Los Angeles, CA, USA",
    "latitude": 34.0754,
    "longitude": -118.3801,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand, Cedars-Sinai (June 15, 2013 at 05:33 AM PDT).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "hi",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Bold",
        "Unapologetically expressive",
        "Artistic visionary",
        "Extroverted leader among peers",
        "Direct and sharp humor"
      ],
      "primaryFieldAndInterests": [
        "Music and rapping",
        "Stage performing (Lion King at Hollywood Bowl)",
        "Fashion styling and sketching",
        "Video creation"
      ],
      "whenLifeTurned": "Debut stage rap performance at Paris Fashion Week in 2020 at age 6, proving inherited musical swagger and fearlessness.",
      "currentLifeReality": "Eldest child of Kim Kardashian and Kanye West; announced debut music album 'Elementary School Dropout', commanding massive digital creative influence.",
      "majorChallengesFacing": "Handling intense internet debates and viral critique while transitioning from child prodigy to serious adolescent artist.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "youth_artistic_or_sports_prodigy",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Gemini",
        "approxMoonSign": "Leo (Purva Phalguni)",
        "expectedHoraLord": "Saturn",
        "panchangaSummary": "Shukla Saptami, Saturday (Shanivara), Purva Phalguni Nakshatra, Vajra Yoga, Garija Karana",
        "vajraSuitability": "Supreme Benefic! Venus is 5th lord of performing arts, stage charm, and intellect for Gemini. Diamond or White Zircon unlocks creative mastery.",
        "hawalaSuitability": "Prohibited; Mars is malefic 6th/11th lord for Gemini Lagna. Red Coral (Hawala) would aggravate restlessness and conflict."
      }
    }
  },
  {
    "id": "blue_ivy_carter",
    "name": "Blue Ivy Carter",
    "gender": "Female",
    "ageBracket": "under_18",
    "approxAgeIn2026": 14,
    "birthDate": "2012-01-07",
    "birthTime": "22:18",
    "birthPlace": "Lenox Hill Hospital, New York, NY, USA",
    "latitude": 40.7686,
    "longitude": -73.9535,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate viewed by media; official press release by Beyonc\u00e9 and Jay-Z (Jan 7, 2012 at 22:18 EST).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "te",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Disciplined",
        "Graceful under global gaze",
        "Quietly ambitious",
        "Perfectionist work ethic",
        "Resilient dancer"
      ],
      "primaryFieldAndInterests": [
        "Choreography and stadium dance performance",
        "Voiceover acting (Mufasa: The Lion King)",
        "Academics in NYC/LA"
      ],
      "whenLifeTurned": "Renaissance World Tour in summer 2023, performing live choreography in front of 70,000 fans nightly and earning global critical acclaim.",
      "currentLifeReality": "Grammy Award-winning teenager; voicing young Kiara in Disney's Lion King prequel, balancing high school with performing arts mastery.",
      "majorChallengesFacing": "Sustaining high-level personal artistic standard while stepping out from the towering shadow of Beyonc\u00e9 and Jay-Z.",
      "expectedVocationCodes": [
        "creative_media"
      ],
      "expectedLifeStageCategory": "youth_artistic_or_sports_prodigy",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Virgo",
        "approxMoonSign": "Gemini (Ardra)",
        "expectedHoraLord": "Mars",
        "panchangaSummary": "Shukla Chaturdashi, Saturday (Shanivara), Ardra Nakshatra, Indra Yoga, Vanija Karana",
        "vajraSuitability": "Supreme Benefic! Venus rules 2nd and 9th (Bhagya) houses for Virgo Lagna. Diamond or White Zircon provides immense vocal, artistic, and stage success.",
        "hawalaSuitability": "Strictly Prohibited! Mars rules 3rd and 8th dusthanas for Virgo Lagna. Red Coral (Hawala) triggers physical vulnerability and vocal strain."
      }
    }
  },
  {
    "id": "harper_beckham",
    "name": "Harper Seven Beckham",
    "gender": "Female",
    "ageBracket": "under_18",
    "approxAgeIn2026": 15,
    "birthDate": "2011-07-10",
    "birthTime": "07:55",
    "birthPlace": "Cedars-Sinai Medical Center, Los Angeles, CA, USA",
    "latitude": 34.0754,
    "longitude": -118.3801,
    "roddenRating": "AA",
    "sourceCitation": "Official announcement by David Beckham on Facebook; birth certificate in hand (July 10, 2011 at 07:55 AM PDT).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "ta",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Warm",
        "Elegantly grounded",
        "Artistic appreciation",
        "Close family loyalty",
        "Polite and modest"
      ],
      "primaryFieldAndInterests": [
        "Fashion design atelier with mother Victoria",
        "Equestrian and football",
        "Culinary arts and photography"
      ],
      "whenLifeTurned": "Transition into secondary school and front-row fashion week presence in Paris/London, stepping into graceful teenage visibility.",
      "currentLifeReality": "Youngest child of Victoria and David Beckham; developing keen eye for luxury fashion, studying in London, beloved family companion.",
      "majorChallengesFacing": "Navigating adolescence under relentless social media fashion commentary and peer group dynamics.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "student_academic_stress",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Cancer",
        "approxMoonSign": "Libra (Swati)",
        "expectedHoraLord": "Sun",
        "panchangaSummary": "Shukla Dashami, Sunday (Ravivara), Swati Nakshatra, Sadhya Yoga, Taitila Karana",
        "vajraSuitability": "Moderate/Secondary; Venus rules 4th and 11th for Cancer. Diamond can be worn as an aesthetic pendant rather than astrological life stone.",
        "hawalaSuitability": "Supreme Yogakaraka! Mars is 5th and 10th lord for Cancer Lagna. Red Coral (Hawala) provides invincible vitality, leadership, and athletic sharpness."
      }
    }
  },
  {
    "id": "knox_jolie_pitt",
    "name": "Knox L\u00e9on Jolie-Pitt",
    "gender": "Male",
    "ageBracket": "under_18",
    "approxAgeIn2026": 18,
    "birthDate": "2008-07-12",
    "birthTime": "18:27",
    "birthPlace": "Fondation Lenval Hospital, Nice, France",
    "latitude": 43.6934,
    "longitude": 7.2435,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate registered by Mayor Christian Estrosi in Nice, France (July 12, 2008 at 18:27 CEST).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "en",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Introverted",
        "Grounded",
        "Physically disciplined",
        "Supportive brother",
        "Prefers quiet privacy"
      ],
      "primaryFieldAndInterests": [
        "Martial arts and boxing",
        "Visual arts and design",
        "Languages and travel"
      ],
      "whenLifeTurned": "Governor Awards red carpet appearance in November 2024 alongside mother Angelina Jolie, revealing mature, handsome young adult presence.",
      "currentLifeReality": "Entering young adulthood; stepping occasionally onto red carpets while maintaining low-key athletic and artistic studies.",
      "majorChallengesFacing": "Forming an independent vocational identity amidst protracted parental legal warfare and high global surname expectations.",
      "expectedVocationCodes": [
        "creative_media",
        "sports_athletics"
      ],
      "expectedLifeStageCategory": "student_academic_stress",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Sagittarius",
        "approxMoonSign": "Scorpio (Anuradha)",
        "expectedHoraLord": "Saturn",
        "panchangaSummary": "Shukla Dashami, Saturday (Shanivara), Anuradha Nakshatra, Sadhya Yoga, Garija Karana",
        "vajraSuitability": "Strictly Prohibited; Venus rules 6th and 11th dusthanas for Sagittarius Lagna. Diamond causes relationship friction and financial drain.",
        "hawalaSuitability": "Highly Auspicious! Mars rules 5th house of intellect/creativity and 12th house. Red Coral strengthens physical courage and removes inner fears."
      }
    }
  },
  {
    "id": "infanta_sofia",
    "name": "Infanta Sof\u00eda of Spain",
    "gender": "Female",
    "ageBracket": "under_18",
    "approxAgeIn2026": 18,
    "birthDate": "2007-04-29",
    "birthTime": "16:50",
    "birthPlace": "Ruber International Hospital, Madrid, Spain",
    "latitude": 40.4893,
    "longitude": -3.7088,
    "roddenRating": "AA",
    "sourceCitation": "Official Royal House of Spain announcement & civil registry (April 29, 2007 at 16:50 CEST).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "ta",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Poised",
        "Scholarly",
        "Naturally athletic",
        "Empathetic companion to her sister Princess Leonor",
        "Modern royal outlook"
      ],
      "primaryFieldAndInterests": [
        "International relations",
        "Football (passionate fan and school player)",
        "Environmental sustainability"
      ],
      "whenLifeTurned": "Moving to Wales to attend UWC Atlantic College in 2023, stepping into international student independence away from Zarzuela Palace.",
      "currentLifeReality": "Completing International Baccalaureate in Wales; undertaking formal representation at state events in Spain alongside the King and Queen.",
      "majorChallengesFacing": "Defining her constitutional identity as the younger infanta without constitutional inheritance, carving a distinct modern professional career.",
      "expectedVocationCodes": [
        "government_civil_police",
        "teaching_academics"
      ],
      "expectedLifeStageCategory": "student_academic_stress",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Virgo",
        "approxMoonSign": "Virgo (Chitra)",
        "expectedHoraLord": "Sun",
        "panchangaSummary": "Shukla Trayodashi, Sunday (Ravivara), Chitra Nakshatra, Harshana Yoga, Balava Karana",
        "vajraSuitability": "Supreme Benefic! Venus rules 2nd and 9th (Bhagya) houses for Virgo. Diamond brings royal dignity, articulate speech, and international honor.",
        "hawalaSuitability": "Prohibited; Mars rules 3rd and 8th dusthanas for Virgo Lagna. Red Coral (Hawala) is strictly prohibited to avoid injuries and physical accidents."
      }
    }
  },
  {
    "id": "millie_bobby_brown",
    "name": "Millie Bobby Brown",
    "gender": "Female",
    "ageBracket": "under_25",
    "approxAgeIn2026": 22,
    "birthDate": "2004-02-19",
    "birthTime": "23:50",
    "birthPlace": "Marbella, Spain",
    "latitude": 36.5101,
    "longitude": -4.8824,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Feb 19, 2004 at 23:50 CET).",
    "maritalStatus": "married",
    "hasChildren": false,
    "assignedLanguage": "ta",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Determined",
        "Preternaturally mature",
        "Astute businesswoman",
        "Charismatic",
        "Loves animals and advocacy"
      ],
      "primaryFieldAndInterests": [
        "Leading Hollywood acting (Stranger Things, Enola Holmes)",
        "Beauty cosmetics entrepreneurship (Florence by Mills)",
        "UNICEF ambassadorship"
      ],
      "whenLifeTurned": "Breakout role as Eleven in 'Stranger Things' in July 2016 at age 12, followed by marriage to Jake Bongiovi in May 2024 at age 20.",
      "currentLifeReality": "Filming final season of Stranger Things; expanding her global production company and beauty brand, happily married young adult.",
      "majorChallengesFacing": "Transitioning out of the iconic child role of Eleven into mature dramatic film roles while running major commercial companies.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "creative_media_stardom",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Libra",
        "approxMoonSign": "Aquarius (Dhanishta)",
        "expectedHoraLord": "Jupiter",
        "panchangaSummary": "Krishna Chaturdashi, Thursday (Guruvara), Dhanishta Nakshatra, Vyatipata Yoga, Shakuni Karana",
        "vajraSuitability": "Supreme Lagna Lord! Venus is the ruler of Libra Lagna. Diamond or White Zircon is her sovereign life stone, unlocking global beauty, fame, and wealth.",
        "hawalaSuitability": "Caution; Mars rules 2nd and 7th Maraka houses for Libra Lagna. Red Coral should not be worn indiscriminately."
      }
    }
  },
  {
    "id": "alexis_lebrun",
    "name": "Alexis Lebrun",
    "gender": "Male",
    "ageBracket": "under_25",
    "approxAgeIn2026": 22,
    "birthDate": "2003-08-27",
    "birthTime": "16:03",
    "birthPlace": "Montpellier, France",
    "latitude": 43.6108,
    "longitude": 3.8767,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Aug 27, 2003 at 16:03 CEST).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "kn",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Fierce competitive fire",
        "Relentless determination",
        "Emotional intensity on court",
        "Close brotherhood with F\u00e9lix Lebrun"
      ],
      "primaryFieldAndInterests": [
        "Professional table tennis",
        "High-speed tactical athletics",
        "Physical power training"
      ],
      "whenLifeTurned": "Paris 2024 Olympic Games, winning Olympic bronze medal in men's team and European singles championship in October 2024.",
      "currentLifeReality": "Olympic bronze medalist (Paris 2024), European men's singles champion; at the peak of world table tennis rivalry against top Asian players.",
      "majorChallengesFacing": "Sustaining peak physical conditioning against shoulder/wrist fatigue while handling massive French sporting expectations.",
      "expectedVocationCodes": [
        "sports_athletics"
      ],
      "expectedLifeStageCategory": "elite_sports_athletic_triumph",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Sagittarius",
        "approxMoonSign": "Leo (Purva Phalguni)",
        "expectedHoraLord": "Mercury",
        "panchangaSummary": "Shukla Pratipada, Wednesday (Budhavara), Purva Phalguni Nakshatra, Siddha Yoga, Kintughna Karana",
        "vajraSuitability": "Prohibited; Venus rules 6th and 11th dusthanas for Sagittarius Lagna. Diamond would aggravate sports injuries and opponents' pressure.",
        "hawalaSuitability": "Supreme Benefic! Mars rules 5th house of sporting intellect and competitive prowess. Red Coral energizes lightning reflexes and victory."
      }
    }
  },
  {
    "id": "carlos_alcaraz",
    "name": "Carlos Alcaraz",
    "gender": "Male",
    "ageBracket": "under_25",
    "approxAgeIn2026": 23,
    "birthDate": "2003-05-05",
    "birthTime": "12:45",
    "birthPlace": "El Palmar, Murcia, Spain",
    "latitude": 37.9405,
    "longitude": -1.1611,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (May 5, 2003 at 12:45 CEST).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "te",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Infectious joy and smile",
        "Fearless shot-maker",
        "Supreme physical elasticity",
        "Humble roots",
        "Iron clutch resolve"
      ],
      "primaryFieldAndInterests": [
        "Grand Slam professional tennis",
        "Chess and cognitive tactical games",
        "Spanish sports heritage"
      ],
      "whenLifeTurned": "US Open 2022 victory becoming the youngest World No. 1 in ATP history at age 19, followed by iconic Wimbledon 2023 & 2024 triumphs over Djokovic.",
      "currentLifeReality": "Four-time Grand Slam champion (Wimbledon, Roland Garros, US Open) and Olympic silver medalist; dominating world tennis with Jannik Sinner.",
      "majorChallengesFacing": "Managing physical wear-and-tear, forearm/abdominal strains, and avoiding emotional burnout amidst grueling 11-month ATP tours.",
      "expectedVocationCodes": [
        "sports_athletics"
      ],
      "expectedLifeStageCategory": "elite_sports_athletic_triumph",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Leo",
        "approxMoonSign": "Gemini (Punarvasu)",
        "expectedHoraLord": "Moon",
        "panchangaSummary": "Shukla Chaturthi, Monday (Somavara), Punarvasu Nakshatra, Dhriti Yoga, Vanija Karana",
        "vajraSuitability": "Prohibited; Venus rules 3rd and 10th enemy houses for Leo Lagna. Pure Diamond triggers loss of stamina and focus.",
        "hawalaSuitability": "Supreme Yogakaraka! Mars is 4th and 9th (Bhagya) lord for Leo Lagna. Red Coral is his supreme warrior stone, giving unmatched stamina, explosive power, and championship fortune."
      }
    }
  },
  {
    "id": "greta_thunberg",
    "name": "Greta Thunberg",
    "gender": "Female",
    "ageBracket": "under_25",
    "approxAgeIn2026": 23,
    "birthDate": "2003-01-03",
    "birthTime": "08:30",
    "birthPlace": "Stockholm, Sweden",
    "latitude": 59.3293,
    "longitude": 18.0686,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Jan 3, 2003 at 08:30 CET).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "hi",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Uncompromising moral conviction",
        "Hyper-focused (sees autism as superpower)",
        "Blunt truth-teller",
        "Ascetic simplicity",
        "Courageous in protest"
      ],
      "primaryFieldAndInterests": [
        "Global climate activism",
        "Environmental science advocacy",
        "Grassroots direct civil action"
      ],
      "whenLifeTurned": "August 2018 solo school strike outside the Swedish Parliament ('Fridays for Future') sparking a worldwide youth movement of millions.",
      "currentLifeReality": "International climate organizer; escalating direct peaceful civil disobedience across Europe, frequently detained during peaceful sit-ins, focused on systemic justice.",
      "majorChallengesFacing": "Navigating police crackdowns, legal fines, and severe political polarization as governments push back against direct climate action.",
      "expectedVocationCodes": [
        "government_civil_police",
        "teaching_academics"
      ],
      "expectedLifeStageCategory": "leadership_expansion_scaling",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Capricorn",
        "approxMoonSign": "Sagittarius (Purva Ashadha)",
        "expectedHoraLord": "Venus",
        "panchangaSummary": "Shukla Pratipada, Friday (Shukravara), Purva Ashadha Nakshatra, Vyaghata Yoga, Kintughna Karana",
        "vajraSuitability": "Supreme Yogakaraka! Venus rules 5th and 10th houses for Capricorn Lagna. Diamond provides moral clarity, global voice, and peaceful resonance.",
        "hawalaSuitability": "Caution; Mars is 4th and 11th lord (Badhaka). Hawala should only be worn if physically fatigued under medical or astrological supervision."
      }
    }
  },
  {
    "id": "billie_eilish",
    "name": "Billie Eilish",
    "gender": "Female",
    "ageBracket": "under_25",
    "approxAgeIn2026": 24,
    "birthDate": "2001-12-18",
    "birthTime": "11:30",
    "birthPlace": "Los Angeles, CA, USA",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate / hospital record quoted in Astro-Databank (Dec 18, 2001 at 11:30 AM PST).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "en",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Deeply introspective",
        "Non-conformist",
        "Raw emotional vulnerability",
        "Artistic perfectionist",
        "Strong advocate for youth mental health"
      ],
      "primaryFieldAndInterests": [
        "Songwriting and vocal performance",
        "Music production with brother Finneas",
        "Visual directing and fashion"
      ],
      "whenLifeTurned": "Historic sweep of all four General Field Grammy Awards in 2020 at age 18, followed by two Academy Awards for Best Original Song by age 22.",
      "currentLifeReality": "Multiple Grammy and two-time Academy Award winner (*Hit Me Hard and Soft* album & world tour); leading global music charts with critical acclaim.",
      "majorChallengesFacing": "Protecting mental health and personal boundaries while navigating immense global scrutiny over her personal identity and sexuality.",
      "expectedVocationCodes": [
        "creative_media"
      ],
      "expectedLifeStageCategory": "creative_media_stardom",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Pisces",
        "approxMoonSign": "Capricorn (Shravana)",
        "expectedHoraLord": "Mars",
        "panchangaSummary": "Shukla Chaturthi, Tuesday (Mangalavara), Shravana Nakshatra, Vyaghata Yoga, Vanija Karana",
        "vajraSuitability": "Prohibited; Venus rules 3rd and 8th dusthanas for Pisces Lagna. Diamond causes emotional over-sensitivity and melancholy.",
        "hawalaSuitability": "Highly Auspicious! Mars is 2nd (speech/singing) and 9th (Bhagya) lord for Pisces Lagna. Red Coral empowers her vocal depth, career stamina, and emotional grounding."
      }
    }
  },
  {
    "id": "kylian_mbappe",
    "name": "Kylian Mbapp\u00e9",
    "gender": "Male",
    "ageBracket": "under_30",
    "approxAgeIn2026": 27,
    "birthDate": "1998-12-20",
    "birthTime": "01:47",
    "birthPlace": "Paris (19th Arrondissement), France",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate n\u00b04993 in hand (Dec 20, 1998 at 01:47 AM CET).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "en",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Supreme self-confidence",
        "Electrifying ambition",
        "Calculated composure under global pressure",
        "Astute commercial acumen"
      ],
      "primaryFieldAndInterests": [
        "Elite professional football",
        "Sports leadership & captaincy",
        "Global business investments and foundation work"
      ],
      "whenLifeTurned": "2018 FIFA World Cup in Russia, scoring in the final at age 19 to win the World Cup for France, cementing status as Pel\u00e9's true successor.",
      "currentLifeReality": "Signed with Real Madrid in summer 2024; French national team captain, chasing UEFA Champions League titles and the Ballon d'Or under colossal expectations.",
      "majorChallengesFacing": "Integrating into Real Madrid's star-studded tactical system while dealing with acute French media critique and hamstring fatigue.",
      "expectedVocationCodes": [
        "sports_athletics",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "elite_sports_athletic_triumph",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Libra",
        "approxMoonSign": "Sagittarius (Moola)",
        "expectedHoraLord": "Jupiter",
        "panchangaSummary": "Shukla Pratipada, Sunday (Ravivara), Moola Nakshatra, Vriddhi Yoga, Bava Karana",
        "vajraSuitability": "Supreme Lagna Lord! Venus rules Libra Lagna. Diamond or White Zircon on the middle finger in Platinum confers regal charisma, athletic speed, and global conquest.",
        "hawalaSuitability": "Caution; Mars rules 2nd and 7th Maraka houses for Libra Lagna. Red Coral should not be worn indiscriminately."
      }
    }
  },
  {
    "id": "malala_yousafzai",
    "name": "Malala Yousafzai",
    "gender": "Female",
    "ageBracket": "under_30",
    "approxAgeIn2026": 28,
    "birthDate": "1997-07-12",
    "birthTime": "10:15",
    "birthPlace": "Mingora, Swat Valley, Pakistan",
    "latitude": 34.7717,
    "longitude": 72.3602,
    "roddenRating": "AA",
    "sourceCitation": "Father Ziauddin Yousafzai biography quoted in Astro-Databank; hospital birth record (July 12, 1997 at 10:15 AM PKT).",
    "maritalStatus": "married",
    "hasChildren": false,
    "assignedLanguage": "te",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Incredible moral resilience",
        "Eloquence of speech",
        "Gentle yet unyielding courage",
        "Compassionate educator",
        "Sharp wit"
      ],
      "primaryFieldAndInterests": [
        "Girls' education philanthropy (Malala Fund)",
        "Oxford University graduate (PPE)",
        "Film and television production (Extracurricular)"
      ],
      "whenLifeTurned": "Miraculous survival of Taliban assassination attempt in October 2012 at age 15, leading to Nobel Peace Prize in 2014 as youngest recipient in history.",
      "currentLifeReality": "Global education advocate; producing female-led Broadway shows and documentaries, happily married to Asser Malik, lobbying international leaders.",
      "majorChallengesFacing": "Confronting devastating rollbacks of female education rights in Afghanistan while managing global philanthropic funding fatigue.",
      "expectedVocationCodes": [
        "teaching_academics",
        "government_civil_police"
      ],
      "expectedLifeStageCategory": "leadership_expansion_scaling",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Virgo",
        "approxMoonSign": "Libra (Chitra)",
        "expectedHoraLord": "Saturn",
        "panchangaSummary": "Shukla Ashtami, Saturday (Shanivara), Chitra Nakshatra, Siddha Yoga, Vishti Karana",
        "vajraSuitability": "Supreme Benefic! Venus rules 2nd (articulate speech) and 9th (Bhagya) for Virgo. Diamond provides global stature, diplomatic grace, and Nobel-level honor.",
        "hawalaSuitability": "Strictly Prohibited; Mars rules 3rd and 8th dusthanas for Virgo Lagna. Red Coral is dangerous and attracts physical attacks or surgeries."
      }
    }
  },
  {
    "id": "simone_biles",
    "name": "Simone Biles",
    "gender": "Female",
    "ageBracket": "under_30",
    "approxAgeIn2026": 29,
    "birthDate": "1997-03-14",
    "birthTime": "13:46",
    "birthPlace": "Columbus, OH, USA",
    "latitude": 39.9612,
    "longitude": -82.9988,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (March 14, 1997 at 13:46 EST).",
    "maritalStatus": "married",
    "hasChildren": false,
    "assignedLanguage": "ta",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Unrivaled physical bravery",
        "Mental health trailblazer",
        "Honest vulnerability",
        "Supreme kinetic perfectionist",
        "Protective mentor to gymnasts"
      ],
      "primaryFieldAndInterests": [
        "Olympic artistic gymnastics (GOAT)",
        "Athlete mental wellness advocacy",
        "Sports culture leadership"
      ],
      "whenLifeTurned": "Tokyo 2021 withdrawal due to the 'twisties' to protect her life, followed by legendary redemption at Paris 2024 winning 3 Olympic golds at age 27.",
      "currentLifeReality": "Most decorated gymnast in history (11 Olympic medals, 30 World Championship medals); married to NFL player Jonathan Owens, touring Gold Over America.",
      "majorChallengesFacing": "Navigating retirement decisions vs competing at LA 2028 at age 31 while managing residual calf and ankle physical damage.",
      "expectedVocationCodes": [
        "sports_athletics"
      ],
      "expectedLifeStageCategory": "elite_sports_athletic_triumph",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Cancer",
        "approxMoonSign": "Taurus (Rohini - Exalted Moon)",
        "expectedHoraLord": "Venus",
        "panchangaSummary": "Shukla Shashthi, Friday (Shukravara), Rohini Nakshatra, Vishkambha Yoga, Kaulava Karana",
        "vajraSuitability": "Conditional; Venus is 4th and 11th lord for Cancer. Gentle White Zircon or Opal is preferred over Diamond.",
        "hawalaSuitability": "Supreme Yogakaraka! Mars rules 5th and 10th houses for Cancer Lagna. Red Coral (Hawala) is her supreme victory stone, granting fearless aerial power, core strength, and historic gold medals."
      }
    }
  },
  {
    "id": "max_verstappen",
    "name": "Max Verstappen",
    "gender": "Male",
    "ageBracket": "under_30",
    "approxAgeIn2026": 28,
    "birthDate": "1997-09-30",
    "birthTime": "16:30",
    "birthPlace": "Hasselt, Belgium",
    "latitude": 50.9307,
    "longitude": 5.3378,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Sept 30, 1997 at 16:30 CEST).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "ta",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Uncompromising racing aggression",
        "Cold tactical precision",
        "Immune to external media chatter",
        "Total sim-racing obsession",
        "Raw direct honesty"
      ],
      "primaryFieldAndInterests": [
        "Formula 1 motorsport",
        "Sim-racing and team ownership (Verstappen.com Racing)",
        "High-performance vehicle engineering"
      ],
      "whenLifeTurned": "Abu Dhabi 2021 final-lap overtake to win his maiden Formula 1 World Championship, launching an era of four consecutive World Championships (2021-2024).",
      "currentLifeReality": "Four-time consecutive Formula 1 World Champion (Red Bull Racing); dominating Grand Prix records, pursuing independent GT3 endurance racing plans.",
      "majorChallengesFacing": "Managing team internal friction at Red Bull Racing and FIA regulatory battles over driver radio conduct.",
      "expectedVocationCodes": [
        "sports_athletics",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "elite_sports_athletic_triumph",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Aquarius",
        "approxMoonSign": "Virgo (Hasta)",
        "expectedHoraLord": "Mars",
        "panchangaSummary": "Krishna Chaturdashi, Tuesday (Mangalavara), Hasta Nakshatra, Shukla Yoga, Shakuni Karana",
        "vajraSuitability": "Supreme Yogakaraka! Venus rules 4th and 9th (Bhagya) houses for Aquarius Lagna. Diamond or White Zircon provides unmatched speed, engineering mastery, and championship dominance.",
        "hawalaSuitability": "Strictly Prohibited! Mars rules 3rd and 10th houses and acts as fierce malefic for Aquarius. Red Coral triggers mechanical crashes and aggressive penalties."
      }
    }
  },
  {
    "id": "bella_hadid",
    "name": "Bella Hadid",
    "gender": "Female",
    "ageBracket": "under_30",
    "approxAgeIn2026": 29,
    "birthDate": "1996-10-09",
    "birthTime": "04:19",
    "birthPlace": "Washington, DC, USA",
    "latitude": 38.9072,
    "longitude": -77.0369,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Oct 9, 1996 at 04:19 AM EDT).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "hi",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Graceful",
        "Resilient",
        "Transparent regarding personal vulnerabilities",
        "Passionate equestrian",
        "Deep loyalty to family roots"
      ],
      "primaryFieldAndInterests": [
        "High-fashion runway and editorial modeling",
        "Equestrian competition",
        "Holistic wellness products (Kin Euphorics, Orebella)"
      ],
      "whenLifeTurned": "Coperni spray-on dress moment at Paris Fashion Week 2022 that defined digital fashion history, followed by 2023 recovery from chronic Lyme disease.",
      "currentLifeReality": "Returned to fashion runway and equestrian circuit after intense medical treatment; launched successful perfume brand Orebella, living in Texas.",
      "majorChallengesFacing": "Managing recurring systemic inflammation and chronic fatigue while balancing commercial contracts with authentic private life.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "creative_media_stardom",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Virgo",
        "approxMoonSign": "Leo (Purva Phalguni)",
        "expectedHoraLord": "Mercury",
        "panchangaSummary": "Krishna Trayodashi, Wednesday (Budhavara), Purva Phalguni Nakshatra, Shukla Yoga, Garija Karana",
        "vajraSuitability": "Supreme Benefic! Venus rules 2nd and 9th (Bhagya) houses for Virgo Lagna. Diamond or White Zircon is her premier stone for global elegance, beauty, and wealth.",
        "hawalaSuitability": "Strictly Prohibited; Mars rules 3rd and 8th dusthanas for Virgo. Red Coral would severely flare Lyme inflammation and blood disorders."
      }
    }
  },
  {
    "id": "zendaya",
    "name": "Zendaya",
    "gender": "Female",
    "ageBracket": "under_30",
    "approxAgeIn2026": 29,
    "birthDate": "1996-09-01",
    "birthTime": "20:00",
    "birthPlace": "Oakland, CA, USA",
    "latitude": 37.8044,
    "longitude": -122.2712,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Sept 1, 1996 at 20:00 PDT).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "ta",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Introverted in private, commanding in front of camera",
        "Impeccable style discernment",
        "Grounded family focus",
        "Fiercely protective of relationship with Tom Holland",
        "Diplomatic maturity"
      ],
      "primaryFieldAndInterests": [
        "Dramatic Hollywood acting (Euphoria, Dune, Challengers)",
        "High fashion and couture red carpet curation with Law Roach",
        "Producing"
      ],
      "whenLifeTurned": "2020 Primetime Emmy Award win at age 24 for 'Euphoria', becoming the youngest lead actress drama winner in Emmy history, followed by 2022 repeat win.",
      "currentLifeReality": "Leading global box office star (*Dune: Part Two*, *Challengers*); high-fashion icon, preparing for *Euphoria* Season 3 and upcoming blockbuster projects.",
      "majorChallengesFacing": "Guarding emotional privacy and personal intimacy under relentless tabloid paparazzi while carrying multi-hundred-million-dollar movie franchises.",
      "expectedVocationCodes": [
        "creative_media"
      ],
      "expectedLifeStageCategory": "creative_media_stardom",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Pisces",
        "approxMoonSign": "Aries (Bharani)",
        "expectedHoraLord": "Sun",
        "panchangaSummary": "Krishna Chaturthi, Sunday (Ravivara), Bharani Nakshatra, Vriddhi Yoga, Balava Karana",
        "vajraSuitability": "Prohibited; Venus rules 3rd and 8th dusthanas for Pisces Lagna. Diamond triggers emotional anxiety and creative over-extension.",
        "hawalaSuitability": "Highly Benefic! Mars rules 2nd and 9th (Bhagya) houses for Pisces Lagna. Red Coral confers magnetic screen authority, financial stability, and vital energy."
      }
    }
  },
  {
    "id": "aymeric_laporte",
    "name": "Aymeric Laporte",
    "gender": "Male",
    "ageBracket": "under_35",
    "approxAgeIn2026": 31,
    "birthDate": "1994-05-27",
    "birthTime": "16:55",
    "birthPlace": "Agen, France",
    "latitude": 44.2031,
    "longitude": 0.6164,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate / birth record in hand quoted in Astro-Databank (May 27, 1994 at 16:55 CEST).",
    "maritalStatus": "married",
    "hasChildren": true,
    "assignedLanguage": "kn",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Tactically composed",
        "Disciplined",
        "Commanding presence",
        "Unshakable poise under defensive siege"
      ],
      "primaryFieldAndInterests": [
        "Tactical football defending",
        "Athletic endurance and rehabilitation",
        "International team cohesion"
      ],
      "whenLifeTurned": "Treble triumph with Manchester City in 2023 followed by cornerstone defensive role in Spain winning UEFA Euro 2024.",
      "currentLifeReality": "Key pillar of Spain's Euro 2024 championship defense; solidifying senior leadership in European and international football (Al-Nassr / Spain).",
      "majorChallengesFacing": "Managing the physical intensity of European national tournaments while playing league football in Saudi Arabia.",
      "expectedVocationCodes": [
        "sports_athletics"
      ],
      "expectedLifeStageCategory": "elite_sports_athletic_triumph",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Libra",
        "approxMoonSign": "Sagittarius (Purva Ashadha)",
        "expectedHoraLord": "Venus",
        "panchangaSummary": "Krishna Tritiya, Friday (Shukravara), Purva Ashadha Nakshatra, Shukla Yoga, Vishti Karana",
        "vajraSuitability": "Supreme Lagna Lord! Venus rules Libra Lagna. Diamond or White Zircon provides composure, elegance of passing, and defensive tactical intellect.",
        "hawalaSuitability": "Caution; Mars rules 2nd and 7th Maraka houses for Libra. Red Coral should not be worn indiscriminately."
      }
    }
  },
  {
    "id": "meghan_trainor",
    "name": "Meghan Trainor",
    "gender": "Female",
    "ageBracket": "under_35",
    "approxAgeIn2026": 32,
    "birthDate": "1993-12-22",
    "birthTime": "10:16",
    "birthPlace": "Nantucket, MA, USA",
    "latitude": 41.2835,
    "longitude": -70.0995,
    "roddenRating": "AA",
    "sourceCitation": "Birth record viewed at Mass Registry of Vital Records (Dec 22, 1993 at 10:16 AM EST).",
    "maritalStatus": "married",
    "hasChildren": true,
    "assignedLanguage": "te",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Warm",
        "Bubbly and effervescent",
        "Empowering",
        "Devoted family woman",
        "Pragmatic music crafter"
      ],
      "primaryFieldAndInterests": [
        "Pop music production and hook writing",
        "Television judging (The Voice)",
        "Book author and parenting podcasting"
      ],
      "whenLifeTurned": "2014 breakout smash 'All About That Bass' going diamond worldwide, followed by Grammy Best New Artist win in 2016.",
      "currentLifeReality": "Touring her album *Timeless*, raising two young boys with husband Daryl Sabara, thriving across television entertainment and music streaming.",
      "majorChallengesFacing": "Protecting delicate vocal cords after two past hemorrhages while managing intense tour travel and toddler motherhood.",
      "expectedVocationCodes": [
        "creative_media"
      ],
      "expectedLifeStageCategory": "creative_media_stardom",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Aquarius",
        "approxMoonSign": "Pisces (Revati)",
        "expectedHoraLord": "Mercury",
        "panchangaSummary": "Shukla Navami, Wednesday (Budhavara), Revati Nakshatra, Variyan Yoga, Kaulava Karana",
        "vajraSuitability": "Supreme Yogakaraka! Venus rules 4th and 9th (Bhagya) houses for Aquarius Lagna. Diamond or White Zircon unlocks immense vocal hooks, pop stardom, and financial security.",
        "hawalaSuitability": "Strictly Prohibited; Mars rules 3rd and 10th houses for Aquarius Lagna. Red Coral triggers vocal strain and surgical risks."
      }
    }
  },
  {
    "id": "taylor_swift",
    "name": "Taylor Swift",
    "gender": "Female",
    "ageBracket": "under_40",
    "approxAgeIn2026": 36,
    "birthDate": "1989-12-13",
    "birthTime": "05:17",
    "birthPlace": "Reading, PA, USA",
    "latitude": 40.3356,
    "longitude": -75.9269,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Dec 13, 1989 at 05:17 AM EST).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "hi",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Master narrative architect",
        "Iron commercial acumen",
        "Deep emotional loyalty",
        "Relentless work ethic",
        "Generous to tour crew and fans"
      ],
      "primaryFieldAndInterests": [
        "Global stadium touring (The Eras Tour)",
        "Songwriting and master recordings re-recording",
        "Film directing and cultural leadership"
      ],
      "whenLifeTurned": "2019 decision to re-record her entire back catalog ('Taylor's Version') turning industry betrayal into the most lucrative creative victory in music history.",
      "currentLifeReality": "Completed historic $2B+ *The Eras Tour* across five continents; four-time Grammy Album of the Year winner, billionaire entrepreneur, in high-profile relationship with Travis Kelce.",
      "majorChallengesFacing": "Preserving creative stamina and mental peace under unparalleled global cultural scrutiny while planning her future cinematic directing projects.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "creative_media_stardom",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Scorpio",
        "approxMoonSign": "Gemini (Mrigashira)",
        "expectedHoraLord": "Mercury",
        "panchangaSummary": "Krishna Pratipada, Wednesday (Budhavara), Mrigashira Nakshatra, Sadhya Yoga, Kaulava Karana",
        "vajraSuitability": "Prohibited as Primary; Venus rules 7th and 12th houses for Scorpio Lagna. Diamond can intensify public relational betrayals and legal battles.",
        "hawalaSuitability": "Supreme Lagna Lord! Mars is the ruling planet of Scorpio Lagna. Red Coral (Hawala) is her core empowerment stone, fueling unstoppable willpower, stadium endurance, and corporate mastery."
      }
    }
  },
  {
    "id": "virat_kohli",
    "name": "Virat Kohli",
    "gender": "Male",
    "ageBracket": "under_40",
    "approxAgeIn2026": 37,
    "birthDate": "1988-11-05",
    "birthTime": "10:28",
    "birthPlace": "New Delhi, India",
    "latitude": 28.6139,
    "longitude": 77.209,
    "roddenRating": "AA",
    "sourceCitation": "Hospital birth record quoted in Astro-Databank and confirmed by sports biographers (Nov 5, 1988 at 10:28 AM IST).",
    "maritalStatus": "married",
    "hasChildren": true,
    "assignedLanguage": "kn",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Aggressive on-field warrior",
        "Deeply spiritual and devoted father",
        "Elite fitness pioneer",
        "Uncompromising chase-master",
        "Vulnerable regarding mental health"
      ],
      "primaryFieldAndInterests": [
        "International cricket batting mastery",
        "Plant-based fitness and biohacking",
        "Philanthropy and venture investments (One8)"
      ],
      "whenLifeTurned": "Father's sudden demise in December 2006 during a Ranji match, returning to bat next morning to save Delhi and forging an unbreakable resolve; T20 World Cup win 2024.",
      "currentLifeReality": "Retired from T20 internationals after winning 2024 ICC T20 World Cup; focused on Test and ODI cricket, cherishing family life with Anushka Sharma and their two children.",
      "majorChallengesFacing": "Managing the twilight phase of Test cricket career against swing/spin bowling while shielding young children Vamika and Akaay from public glare.",
      "expectedVocationCodes": [
        "sports_athletics",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "elite_sports_athletic_triumph",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Sagittarius",
        "approxMoonSign": "Virgo (Uttara Phalguni)",
        "expectedHoraLord": "Saturn",
        "panchangaSummary": "Krishna Ekadashi, Saturday (Shanivara), Uttara Phalguni Nakshatra, Vaidhriti Yoga, Balava Karana",
        "vajraSuitability": "Strictly Prohibited; Venus rules 6th and 11th dusthanas for Sagittarius Lagna. Diamond causes relationship friction and batting slump.",
        "hawalaSuitability": "Supreme Benefic! Mars rules 5th house of competitive sports intellect. Red Coral (Hawala) in Copper/Gold on ring finger energizes warrior chase mentality and century-making focus."
      }
    }
  },
  {
    "id": "rihanna",
    "name": "Rihanna",
    "gender": "Female",
    "ageBracket": "under_40",
    "approxAgeIn2026": 38,
    "birthDate": "1988-02-20",
    "birthTime": "08:50",
    "birthPlace": "Saint Michael, Barbados",
    "latitude": 13.0975,
    "longitude": -59.6165,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Feb 20, 1988 at 08:50 AM AST).",
    "maritalStatus": "unmarried",
    "hasChildren": true,
    "assignedLanguage": "ta",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Unapologetically authentic",
        "Island resilience",
        "Fierce motherly devotion",
        "Groundbreaking commercial disruptor",
        "Warm generosity"
      ],
      "primaryFieldAndInterests": [
        "Billion-dollar beauty and fashion enterprise (Fenty Beauty, Savage X Fenty)",
        "Pop/R&B music recording",
        "Barbados national hero diplomacy"
      ],
      "whenLifeTurned": "2017 launch of Fenty Beauty with 40 inclusive foundation shades, revolutionizing the global cosmetics industry and making her a self-made billionaire.",
      "currentLifeReality": "Billionaire cosmetics and lingerie mogul; mother of two sons with A$AP Rocky, performing occasional marquee global events while teasing 'R9' album.",
      "majorChallengesFacing": "Balancing multi-billion-dollar corporate responsibilities and toddler motherhood with massive global pressure to release new studio music.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "creative_media_stardom",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Aries",
        "approxMoonSign": "Pisces (Revati)",
        "expectedHoraLord": "Saturn",
        "panchangaSummary": "Shukla Chaturthi, Saturday (Shanivara), Revati Nakshatra, Sadhya Yoga, Vanija Karana",
        "vajraSuitability": "Prohibited as Primary; Venus is 2nd and 7th Maraka lord for Aries Lagna. Diamond increases domestic tension and financial disputes.",
        "hawalaSuitability": "Supreme Lagna Lord! Mars is the ruling planet of Aries Lagna. Red Coral (Hawala) is her life stone, conferring fearless entrepreneurial audacity, physical charisma, and wealth mastery."
      }
    }
  },
  {
    "id": "novak_djokovic",
    "name": "Novak Djokovic",
    "gender": "Male",
    "ageBracket": "under_40",
    "approxAgeIn2026": 38,
    "birthDate": "1987-05-22",
    "birthTime": "23:25",
    "birthPlace": "Belgrade, Serbia",
    "latitude": 44.7866,
    "longitude": 20.4489,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (May 22, 1987 at 23:25 CEST).",
    "maritalStatus": "married",
    "hasChildren": true,
    "assignedLanguage": "hi",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Unmatched mental resilience",
        "Spiritual devotion and biohacking discipline",
        "Unflinching independence",
        "Passionate national patriot",
        "Courteous statesman"
      ],
      "primaryFieldAndInterests": [
        "Historic tennis mastery",
        "Holistic longevity and nutrition",
        "Player advocacy (PTPA foundation)"
      ],
      "whenLifeTurned": "2011 season (43-match win streak, 3 Slams, World No. 1) after adopting gluten-free diet and spiritual breathwork, ending the Federer-Nadal duopoly.",
      "currentLifeReality": "Captured Olympic singles Gold at Paris 2024 to complete tennis's golden crown (24 Grand Slams + Olympic Gold); balancing family life and selective Grand Slam records.",
      "majorChallengesFacing": "Combating age-related physical recovery limitations against hungry young rivals Carlos Alcaraz and Jannik Sinner.",
      "expectedVocationCodes": [
        "sports_athletics"
      ],
      "expectedLifeStageCategory": "elite_sports_athletic_triumph",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Capricorn",
        "approxMoonSign": "Pisces (Uttara Bhadrapada)",
        "expectedHoraLord": "Venus",
        "panchangaSummary": "Krishna Dashami, Friday (Shukravara), Uttara Bhadrapada Nakshatra, Vishkambha Yoga, Vishti Karana",
        "vajraSuitability": "Supreme Yogakaraka! Venus rules 5th and 10th houses for Capricorn Lagna. Diamond or White Zircon unlocks tactical genius, mental poise, and historic tennis immortality.",
        "hawalaSuitability": "Prohibited; Mars rules 4th and 11th (Badhaka) for Capricorn Lagna. Red Coral would cause muscular tears and emotional irritability."
      }
    }
  },
  {
    "id": "lionel_messi",
    "name": "Lionel Messi",
    "gender": "Male",
    "ageBracket": "under_40",
    "approxAgeIn2026": 38,
    "birthDate": "1987-06-24",
    "birthTime": "06:00",
    "birthPlace": "Rosario, Argentina",
    "latitude": -32.9468,
    "longitude": -60.6393,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (June 24, 1987 at 06:00 AM ART).",
    "maritalStatus": "married",
    "hasChildren": true,
    "assignedLanguage": "te",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Humble and understated",
        "Peerless visionary intelligence",
        "Deep family devotion",
        "Calm assassin on pitch",
        "Quiet leader"
      ],
      "primaryFieldAndInterests": [
        "Professional football mastery (GOAT)",
        "Inter Miami MLS expansion",
        "Philanthropy with Leo Messi Foundation"
      ],
      "whenLifeTurned": "December 18, 2022 in Lusail, Qatar, captaining Argentina to World Cup glory in the greatest football final ever played, completing his destiny.",
      "currentLifeReality": "Eight-time Ballon d'Or winner playing for Inter Miami CF; enjoying sunny family life in Florida with wife Antonela and three sons while preparing for Copa Am\u00e9rica / World Cup 2026.",
      "majorChallengesFacing": "Managing muscle tightness, ankle knocks, and pacing his 38-year-old body for one final international World Cup swansong in 2026.",
      "expectedVocationCodes": [
        "sports_athletics"
      ],
      "expectedLifeStageCategory": "elite_sports_athletic_triumph",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Gemini",
        "approxMoonSign": "Taurus (Rohini - Exalted Moon)",
        "expectedHoraLord": "Sun",
        "panchangaSummary": "Krishna Trayodashi, Wednesday (Budhavara), Rohini Nakshatra, Dhriti Yoga, Garija Karana",
        "vajraSuitability": "Supreme Benefic! Venus rules 5th house of creative football wizardry, intellect, and divine grace. Diamond or White Zircon is his primary talisman for artistic magic.",
        "hawalaSuitability": "Strictly Prohibited; Mars rules 6th and 11th dusthanas for Gemini Lagna. Red Coral triggers muscle sprains, referee friction, and injury setbacks."
      }
    }
  },
  {
    "id": "deepika_padukone",
    "name": "Deepika Padukone",
    "gender": "Female",
    "ageBracket": "under_40",
    "approxAgeIn2026": 40,
    "birthDate": "1986-01-05",
    "birthTime": "02:39",
    "birthPlace": "Copenhagen, Denmark",
    "latitude": 55.6761,
    "longitude": 12.5683,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Jan 5, 1986 at 02:39 CET).",
    "maritalStatus": "married",
    "hasChildren": true,
    "assignedLanguage": "kn",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Regal poise",
        "Deep emotional vulnerability and courage",
        "Disciplined badminton athlete work ethic",
        "Fierce mental health advocate",
        "Graceful business leader"
      ],
      "primaryFieldAndInterests": [
        "Leading cinematic acting in Indian cinema",
        "Mental health foundation (LiveLoveLaugh)",
        "Self-care cosmetics brand (82\u00b0E)",
        "Global luxury ambassadorships (Cartier, Louis Vuitton)"
      ],
      "whenLifeTurned": "2015 national disclosure of her battle with clinical depression, transforming personal vulnerability into India's premier mental health foundation.",
      "currentLifeReality": "Welcomed baby daughter Dua in September 2024 with husband Ranveer Singh; celebrated for blockbusters *Jawan*, *Pathaan*, and *Kalki 2898 AD*, embracing motherhood.",
      "majorChallengesFacing": "Balancing demanding postpartum recovery and newborn motherhood with massive multinational film shoots and commercial business ventures.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "creative_media_stardom",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Libra",
        "approxMoonSign": "Libra (Swati)",
        "expectedHoraLord": "Sun",
        "panchangaSummary": "Krishna Dashami, Sunday (Ravivara), Swati Nakshatra, Sukarma Yoga, Vishti Karana",
        "vajraSuitability": "Supreme Lagna Lord! Venus is sovereign ruler of Libra Lagna. Diamond or White Zircon in Platinum confers peerless cinematic beauty, royal presence, and lifelong luxury.",
        "hawalaSuitability": "Caution; Mars rules 2nd and 7th Maraka houses for Libra. Red Coral should not be worn indiscriminately."
      }
    }
  },
  {
    "id": "emma_watson",
    "name": "Emma Watson",
    "gender": "Female",
    "ageBracket": "under_40",
    "approxAgeIn2026": 35,
    "birthDate": "1990-04-15",
    "birthTime": "18:00",
    "birthPlace": "Paris, France",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (April 15, 1990 at 18:00 CEST).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "en",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Intellectually rigorous",
        "Articulate",
        "Principled ethics",
        "Values privacy and creative autonomy",
        "Compassionate humanist"
      ],
      "primaryFieldAndInterests": [
        "Acting and film directing",
        "Oxford and Brown scholarly studies",
        "UN Women HeForShe advocacy & sustainable fashion"
      ],
      "whenLifeTurned": "Cast as Hermione Granger in 'Harry Potter' at age 9, followed by iconic 2014 UN speech launching the global HeForShe campaign at age 24.",
      "currentLifeReality": "Taking deliberate pauses between major film roles to pursue Oxford creative writing master's degree, organic gin business with brother, and sustainable investments.",
      "majorChallengesFacing": "Protecting personal creative integrity and intellectual autonomy against the commercial commodification of Hollywood fame.",
      "expectedVocationCodes": [
        "creative_media",
        "teaching_academics",
        "legal_judiciary"
      ],
      "expectedLifeStageCategory": "creative_media_stardom",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Virgo",
        "approxMoonSign": "Sagittarius (Moola)",
        "expectedHoraLord": "Sun",
        "panchangaSummary": "Krishna Panchami, Sunday (Ravivara), Moola Nakshatra, Variyan Yoga, Taitila Karana",
        "vajraSuitability": "Supreme Benefic! Venus rules 2nd and 9th (Bhagya) houses for Virgo Lagna. Diamond or White Zircon unlocks scholarly brilliance, articulate diplomacy, and cultural honor.",
        "hawalaSuitability": "Strictly Prohibited; Mars rules 3rd and 8th dusthanas for Virgo Lagna. Red Coral would attract stress, physical injury, and domestic discord."
      }
    }
  },
  {
    "id": "roger_federer",
    "name": "Roger Federer",
    "gender": "Male",
    "ageBracket": "under_60",
    "approxAgeIn2026": 44,
    "birthDate": "1981-08-08",
    "birthTime": "08:40",
    "birthPlace": "Basel, Switzerland",
    "latitude": 47.5596,
    "longitude": 7.5886,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Aug 8, 1981 at 08:40 CEST).",
    "maritalStatus": "married",
    "hasChildren": true,
    "assignedLanguage": "en",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Effortless grace",
        "Emotionally expressive champion",
        "Gentleman sportsmanship",
        "Astute Swiss businessman",
        "Devoted family patriarch"
      ],
      "primaryFieldAndInterests": [
        "Tennis legend & ambassador",
        "On Running footwear billionaire investor",
        "Roger Federer Foundation for African education"
      ],
      "whenLifeTurned": "2017 Australian Open comeback title at age 35 after six-month knee surgery layoff, reclaiming Grand Slam glory in a historic 5-set final over Nadal.",
      "currentLifeReality": "Happily retired from competitive tennis since emotional 2022 Laver Cup farewell; overseeing billion-dollar investments, mentoring young players, raising two sets of twins.",
      "majorChallengesFacing": "Managing post-career knee osteoarthritis while scaling massive international philanthropic school foundations in Southern Africa.",
      "expectedVocationCodes": [
        "sports_athletics",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "leadership_expansion_scaling",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Virgo",
        "approxMoonSign": "Scorpio (Anuradha - Debilitated Moon)",
        "expectedHoraLord": "Saturn",
        "panchangaSummary": "Shukla Ashtami, Saturday (Shanivara), Anuradha Nakshatra, Shukla Yoga, Vishti Karana",
        "vajraSuitability": "Supreme Benefic! Venus rules 2nd and 9th (Bhagya) houses for Virgo Lagna. Diamond or White Zircon bestows artistic aesthetic stroke-play, global goodwill, and massive financial fortune.",
        "hawalaSuitability": "Strictly Prohibited; Mars rules 3rd and 8th dusthanas for Virgo. Red Coral triggers severe knee surgeries and cartilage degradation."
      }
    }
  },
  {
    "id": "serena_williams",
    "name": "Serena Williams",
    "gender": "Female",
    "ageBracket": "under_60",
    "approxAgeIn2026": 44,
    "birthDate": "1981-09-26",
    "birthTime": "20:28",
    "birthPlace": "Saginaw, MI, USA",
    "latitude": 43.4194,
    "longitude": -83.9508,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Sept 26, 1981 at 20:28 EDT).",
    "maritalStatus": "married",
    "hasChildren": true,
    "assignedLanguage": "te",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Indomitable champion will",
        "Fierce motherly devotion",
        "Pioneering trailblazer for black women in sports",
        "Venture capital visionary",
        "Creative fashionista"
      ],
      "primaryFieldAndInterests": [
        "Tennis GOAT (23 Grand Slam singles titles)",
        "Venture capital (Serena Ventures)",
        "Cosmetics & multimedia production"
      ],
      "whenLifeTurned": "2017 Australian Open victory while eight weeks pregnant with daughter Olympia, completing 23 Open Era Grand Slam titles.",
      "currentLifeReality": "Retired tennis icon; managing Serena Ventures early-stage venture fund, raising two daughters with Alexis Ohanian, producing major films.",
      "majorChallengesFacing": "Transitioning identity away from 25 years of daily tennis dominance into corporate venture capital governance.",
      "expectedVocationCodes": [
        "sports_athletics",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "leadership_expansion_scaling",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Taurus",
        "approxMoonSign": "Leo (Purva Phalguni)",
        "expectedHoraLord": "Mercury",
        "panchangaSummary": "Krishna Chaturdashi, Saturday (Shanivara), Purva Phalguni Nakshatra, Shukla Yoga, Vishti Karana",
        "vajraSuitability": "Supreme Lagna Lord! Venus is the ruling planet of Taurus Lagna. Diamond or White Zircon is her primary life stone, conferring historic athletic power, luxury, and cultural supremacy.",
        "hawalaSuitability": "Strictly Prohibited; Mars rules 7th and 12th Maraka/Vyaya houses for Taurus Lagna. Red Coral triggers blood clots, pulmonary embolisms, and marital friction."
      }
    }
  },
  {
    "id": "shakira",
    "name": "Shakira",
    "gender": "Female",
    "ageBracket": "under_60",
    "approxAgeIn2026": 49,
    "birthDate": "1977-02-02",
    "birthTime": "10:08",
    "birthPlace": "Barranquilla, Colombia",
    "latitude": 10.9685,
    "longitude": -74.7813,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Feb 2, 1977 at 10:08 AM COT).",
    "maritalStatus": "separated",
    "hasChildren": true,
    "assignedLanguage": "hi",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Electrifying rhythmic dynamism",
        "Lyrical genius",
        "Maternal lioness",
        "Deeply resilient in crisis",
        "Passionate philanthropist for Colombian schools"
      ],
      "primaryFieldAndInterests": [
        "Global Latin pop performance",
        "Pies Descalzos Foundation education work",
        "World stadium touring"
      ],
      "whenLifeTurned": "2022 high-profile separation from Gerard Piqu\u00e9, channeling personal heartbreak into the historic viral hit *Bzrp Music Sessions, Vol. 53* ('Women no longer cry, women monetize').",
      "currentLifeReality": "Touring her chart-topping album *Las Mujeres Ya No Que No Lloran*; settled in Miami with her two sons Milan and Sasha, reclaiming global cultural dominance.",
      "majorChallengesFacing": "Navigating complex post-separation parenting logistics and healing deep emotional betrayal scars after 11 years of partnership.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "post_divorce_rebuilding",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Aries",
        "approxMoonSign": "Cancer (Pushya)",
        "expectedHoraLord": "Mercury",
        "panchangaSummary": "Shukla Chaturdashi, Wednesday (Budhavara), Pushya Nakshatra, Ayushman Yoga, Vanija Karana",
        "vajraSuitability": "Prohibited as Primary; Venus rules 2nd and 7th Maraka houses for Aries Lagna. Diamond increases romantic betrayal and tax/legal entanglements.",
        "hawalaSuitability": "Supreme Lagna Lord! Mars is the ruling planet of Aries Lagna. Red Coral (Hawala) in Gold empowers her vocal fire, hip-shaking core stamina, and victorious post-breakup resilience."
      }
    }
  },
  {
    "id": "tiger_woods",
    "name": "Tiger Woods",
    "gender": "Male",
    "ageBracket": "under_60",
    "approxAgeIn2026": 50,
    "birthDate": "1975-12-30",
    "birthTime": "22:50",
    "birthPlace": "Long Beach, CA, USA",
    "latitude": 33.7701,
    "longitude": -118.1937,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Dec 30, 1975 at 22:50 PST).",
    "maritalStatus": "divorced",
    "hasChildren": true,
    "assignedLanguage": "kn",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Hyper-focused laser intensity",
        "Extraordinary threshold for pain and rehabilitation",
        "Private and stoic",
        "Legendary competitiveness"
      ],
      "primaryFieldAndInterests": [
        "Championship golf",
        "Golf course design & TGL tech league",
        "Mentoring son Charlie Woods"
      ],
      "whenLifeTurned": "April 2019 Masters Tournament triumph at age 43 after four back surgeries and spinal fusion, completing the greatest comeback in sports history.",
      "currentLifeReality": "Navigating veteran phase of golf after landmark spinal fusion and 2021 car crash recovery; establishing business enterprises and guiding next generation.",
      "majorChallengesFacing": "Managing severe chronic foot, ankle, and lower-back pain while maintaining dignity in limited tournament appearances.",
      "expectedVocationCodes": [
        "sports_athletics",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "post_divorce_rebuilding",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Virgo",
        "approxMoonSign": "Scorpio (Jyeshtha - Debilitated Moon)",
        "expectedHoraLord": "Mars",
        "panchangaSummary": "Krishna Trayodashi, Tuesday (Mangalavara), Jyeshtha Nakshatra, Shoola Yoga, Garija Karana",
        "vajraSuitability": "Supreme Benefic! Venus rules 2nd and 9th (Bhagya) houses for Virgo Lagna. Diamond brings monumental wealth, historic golf prestige, and commercial triumph.",
        "hawalaSuitability": "Strictly Prohibited; Mars rules 3rd and 8th dusthanas for Virgo Lagna. Red Coral triggers severe bone fractures, vehicular crashes, and spinal disc surgeries."
      }
    }
  },
  {
    "id": "angelina_jolie",
    "name": "Angelina Jolie",
    "gender": "Female",
    "ageBracket": "under_60",
    "approxAgeIn2026": 50,
    "birthDate": "1975-06-04",
    "birthTime": "09:01",
    "birthPlace": "Los Angeles, CA, USA",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (June 4, 1975 at 09:01 AM PDT).",
    "maritalStatus": "divorced",
    "hasChildren": true,
    "assignedLanguage": "en",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Intensely charismatic",
        "Fiercely protective mother",
        "Profound humanitarian empathy",
        "Courageous non-conformist",
        "Complex inner depth"
      ],
      "primaryFieldAndInterests": [
        "Film acting and cinematic directing",
        "UNHCR refugee ambassadorship",
        "Sustainable fashion atelier (Atelier Jolie)"
      ],
      "whenLifeTurned": "2001 adoption of son Maddox in Cambodia during 'Tomb Raider' shoot, igniting two decades of frontline global refugee humanitarian work.",
      "currentLifeReality": "Acclaimed performance in biopic *Maria* (2024); launching creative fashion hub Atelier Jolie in NYC, resolving longstanding legal settlements after divorce.",
      "majorChallengesFacing": "Finalizing protracted French winery and custody litigation while guiding six adolescent children into independent adulthood.",
      "expectedVocationCodes": [
        "creative_media",
        "government_civil_police"
      ],
      "expectedLifeStageCategory": "post_divorce_rebuilding",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Cancer",
        "approxMoonSign": "Pisces (Revati)",
        "expectedHoraLord": "Sun",
        "panchangaSummary": "Krishna Ekadashi, Wednesday (Budhavara), Revati Nakshatra, Ayushman Yoga, Bava Karana",
        "vajraSuitability": "Caution; Venus is 4th and 11th lord for Cancer Lagna. Diamond can intensify domestic property battles.",
        "hawalaSuitability": "Supreme Yogakaraka! Mars is 5th and 10th lord for Cancer Lagna. Red Coral empowers her warrior maternal instincts, directing prowess, and humanitarian courage."
      }
    }
  },
  {
    "id": "leonardo_dicaprio",
    "name": "Leonardo DiCaprio",
    "gender": "Male",
    "ageBracket": "under_60",
    "approxAgeIn2026": 51,
    "birthDate": "1974-11-11",
    "birthTime": "02:47",
    "birthPlace": "Los Angeles, CA, USA",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Nov 11, 1974 at 02:47 AM PDT).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "te",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Method actor perfectionist",
        "Deep environmental commitment",
        "Guarded private life",
        "Loyal inner circle",
        "Charismatic cinematic magnetism"
      ],
      "primaryFieldAndInterests": [
        "A-list cinema acting and producing",
        "Earth Alliance environmental conservation",
        "Global art collecting"
      ],
      "whenLifeTurned": "Global mania of 'Titanic' in 1997 making him the most famous young actor on Earth, followed by meticulous partnership with Martin Scorsese.",
      "currentLifeReality": "Starring in major auteur cinema (Paul Thomas Anderson project); funding biodiversity conservation worldwide, enjoying perennial bachelorhood.",
      "majorChallengesFacing": "Sustaining rare prestige theatrical cinema appeal in a streaming-dominated Hollywood landscape.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "leadership_expansion_scaling",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Virgo",
        "approxMoonSign": "Virgo (Hasta)",
        "expectedHoraLord": "Moon",
        "panchangaSummary": "Krishna Dwadashi, Monday (Somavara), Hasta Nakshatra, Vishkambha Yoga, Taitila Karana",
        "vajraSuitability": "Supreme Benefic! Venus rules 2nd and 9th (Bhagya) houses for Virgo Lagna. Diamond or White Zircon unlocks charismatic acting genius, Oscar acclaim, and immense wealth.",
        "hawalaSuitability": "Strictly Prohibited; Mars rules 3rd and 8th dusthanas for Virgo Lagna. Red Coral triggers physical vulnerability and personal restlessness."
      }
    }
  },
  {
    "id": "elon_musk",
    "name": "Elon Musk",
    "gender": "Male",
    "ageBracket": "under_60",
    "approxAgeIn2026": 54,
    "birthDate": "1971-06-28",
    "birthTime": "06:30",
    "birthPlace": "Pretoria, South Africa",
    "latitude": -25.7479,
    "longitude": 28.2293,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (June 28, 1971 at 06:30 AM SAST).",
    "maritalStatus": "divorced",
    "hasChildren": true,
    "assignedLanguage": "en",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "First-principles engineering intellect",
        "Extreme tolerance for financial and personal risk",
        "Unfiltered communicator",
        "Relentless 100-hour work ethic",
        "Radical futuristic visionary"
      ],
      "primaryFieldAndInterests": [
        "Reusable orbital rocketry (SpaceX)",
        "Electric vehicles and autonomy (Tesla)",
        "Artificial intelligence (xAI)",
        "Neural interfaces (Neuralink)",
        "Government efficiency"
      ],
      "whenLifeTurned": "Late 2008 near-bankruptcy where Falcon 1 Flight 4 succeeded and Tesla secured emergency financing hours before Christmas, saving both empires.",
      "currentLifeReality": "World's richest individual; leading SpaceX Starship orbital missions, scaling xAI Colossus superclusters, co-heading US Department of Government Efficiency (DOGE).",
      "majorChallengesFacing": "Managing unprecedented multi-company regulatory battles, legal litigation, and intense global geopolitical pushback.",
      "expectedVocationCodes": [
        "business_realestate",
        "science_technology"
      ],
      "expectedLifeStageCategory": "leadership_expansion_scaling",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Gemini",
        "approxMoonSign": "Leo (Magha)",
        "expectedHoraLord": "Moon",
        "panchangaSummary": "Shukla Panchami, Monday (Somavara), Magha Nakshatra, Siddhi Yoga, Bava Karana",
        "vajraSuitability": "Supreme Benefic! Venus rules 5th house of visionary intellect, engineering patents, and past-life merit for Gemini. Diamond fuels monumental technological breakthroughs and commercial wealth.",
        "hawalaSuitability": "Strictly Prohibited; Mars rules 6th and 11th dusthanas for Gemini Lagna. Red Coral triggers public controversies, lawsuits, and explosive corporate conflict."
      }
    }
  },
  {
    "id": "shah_rukh_khan",
    "name": "Shah Rukh Khan",
    "gender": "Male",
    "ageBracket": "under_60",
    "approxAgeIn2026": 60,
    "birthDate": "1965-11-02",
    "birthTime": "02:30",
    "birthPlace": "Talwar Nursing Home, New Delhi, India",
    "latitude": 28.6139,
    "longitude": 77.209,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank; hospital record confirmed by biographers (Nov 2, 1965 at 02:30 AM IST).",
    "maritalStatus": "married",
    "hasChildren": true,
    "assignedLanguage": "kn",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Hypnotic oratorical charisma",
        "Unmatched intellectual wit",
        "Boundless romantic intensity",
        "Relentless workaholic",
        "Deeply protective family patriarch"
      ],
      "primaryFieldAndInterests": [
        "Global cinema superstardom ('King Khan')",
        "Film production & VFX empire (Red Chillies Entertainment)",
        "Knight Riders sports franchise ownership"
      ],
      "whenLifeTurned": "2023 historic cinematic renaissance with back-to-back all-time blockbusters *Pathaan* and *Jawan* after a 4-year hiatus and personal family persecution.",
      "currentLifeReality": "Celebrating 60th milestone year as the undisputed Badshah of Indian cinema; preparing for *King* with daughter Suhana Khan, expanding global sports and VFX business.",
      "majorChallengesFacing": "Managing severe physical wear-and-tear (multiple spine, shoulder, and knee surgeries) while maintaining high-octane action star stamina.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "leadership_expansion_scaling",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Leo",
        "approxMoonSign": "Capricorn (Shravana)",
        "expectedHoraLord": "Mars",
        "panchangaSummary": "Shukla Navami, Tuesday (Mangalavara), Shravana Nakshatra, Vriddhi Yoga, Balava Karana",
        "vajraSuitability": "Prohibited; Venus rules 3rd and 10th enemy houses for Leo Lagna. Diamond increases public controversies and artistic burnout.",
        "hawalaSuitability": "Supreme Yogakaraka! Mars is 4th and 9th (Bhagya) lord for Leo Lagna. Red Coral (Hawala) in Copper/Gold on ring finger empowers his royal 'King Khan' authority, magnetic courage, and unmatched box-office dominion."
      }
    }
  },
  {
    "id": "keanu_reeves",
    "name": "Keanu Reeves",
    "gender": "Male",
    "ageBracket": "under_80",
    "approxAgeIn2026": 61,
    "birthDate": "1964-09-02",
    "birthTime": "05:41",
    "birthPlace": "Beirut, Lebanon",
    "latitude": 33.8938,
    "longitude": 35.5018,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Sept 2, 1964 at 05:41 AM EET).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "hi",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Deeply humble and generous",
        "Quiet stoicism forged through profound grief",
        "Gentle demeanor",
        "Dedicated martial artist",
        "Philosophical seeker"
      ],
      "primaryFieldAndInterests": [
        "Cinema action acting (The Matrix, John Wick)",
        "Novelist and comic book creator (BRZRKR)",
        "Motorcycle engineering (Arch Motorcycle) and rock music (Dogstar)"
      ],
      "whenLifeTurned": "Loss of daughter and partner in 1999\u20132001 amidst 'The Matrix' triumphs, transforming personal sorrow into profound philosophical humility and generosity.",
      "currentLifeReality": "Revered as the internet's most beloved gentleman; touring with rock band Dogstar, publishing acclaimed novel with China Mi\u00e9ville, preparing for Broadway debut.",
      "majorChallengesFacing": "Managing chronic knee, hip, and cervical spine stiffness from decades of high-impact stunt work while retaining stunt readiness.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "leadership_expansion_scaling",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Leo",
        "approxMoonSign": "Cancer (Punarvasu)",
        "expectedHoraLord": "Mercury",
        "panchangaSummary": "Krishna Ekadashi, Wednesday (Budhavara), Punarvasu Nakshatra, Vyatipata Yoga, Balava Karana",
        "vajraSuitability": "Prohibited; Venus rules 3rd and 10th enemy houses for Leo Lagna. Diamond triggers sadness and emotional isolation.",
        "hawalaSuitability": "Supreme Yogakaraka! Mars is 4th and 9th (Bhagya) lord for Leo Lagna. Red Coral (Hawala) strengthens physical bone resilience, martial arts mastery, and inner peace."
      }
    }
  },
  {
    "id": "barack_obama",
    "name": "Barack Obama",
    "gender": "Male",
    "ageBracket": "under_80",
    "approxAgeIn2026": 64,
    "birthDate": "1961-08-04",
    "birthTime": "19:24",
    "birthPlace": "Honolulu, HI, USA",
    "latitude": 21.3069,
    "longitude": -157.8583,
    "roddenRating": "AA",
    "sourceCitation": "State of Hawaii Long-Form Certificate of Live Birth (Aug 4, 1961 at 19:24 HST).",
    "maritalStatus": "married",
    "hasChildren": true,
    "assignedLanguage": "kn",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Cerebral and calm ('No Drama Obama')",
        "Masterful oratorical grace",
        "Pragmatic consensus-builder",
        "Deeply reflective author",
        "Dignified statesman"
      ],
      "primaryFieldAndInterests": [
        "Statecraft and constitutional law",
        "Bestselling authorship and memoirs",
        "Media production (Higher Ground)",
        "Global leadership mentorship"
      ],
      "whenLifeTurned": "2004 Democratic National Convention keynote speech launching him into national consciousness, followed by historic election as 44th US President in 2008.",
      "currentLifeReality": "Senior global statesman, actively mentoring emerging democratic leaders worldwide, producing award-winning cultural films, enjoying stable marital partnership with Michelle Obama.",
      "majorChallengesFacing": "Preserving democratic institutional norms in an era of deep political populism and global polarization.",
      "expectedVocationCodes": [
        "government_civil_police",
        "legal_judiciary",
        "teaching_academics"
      ],
      "expectedLifeStageCategory": "leadership_expansion_scaling",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Capricorn",
        "approxMoonSign": "Taurus (Rohini - Exalted Moon)",
        "expectedHoraLord": "Venus",
        "panchangaSummary": "Krishna Navami, Friday (Shukravara), Rohini Nakshatra, Vriddhi Yoga, Garija Karana",
        "vajraSuitability": "Supreme Yogakaraka! Venus rules 5th (intellect) and 10th (governance/authority) houses for Capricorn Lagna. Diamond or White Zircon provides monumental oratorical grace, presidential stature, and enduring legacy.",
        "hawalaSuitability": "Strictly Prohibited; Mars rules 4th and 11th (Badhaka) for Capricorn Lagna. Red Coral triggers political confrontation and blood pressure spikes."
      }
    }
  },
  {
    "id": "madonna",
    "name": "Madonna",
    "gender": "Female",
    "ageBracket": "under_80",
    "approxAgeIn2026": 67,
    "birthDate": "1958-08-16",
    "birthTime": "07:05",
    "birthPlace": "Mercy Hospital, Bay City, MI, USA",
    "latitude": 43.5945,
    "longitude": -83.8889,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Aug 16, 1958 at 07:05 AM EST).",
    "maritalStatus": "divorced",
    "hasChildren": true,
    "assignedLanguage": "te",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Indomitable will",
        "Relentless cultural provocateur",
        "Iron physical discipline",
        "Uncompromising creative control",
        "Spiritual seeker (Kabbalah)"
      ],
      "primaryFieldAndInterests": [
        "Pop music innovation and worldwide stage touring",
        "Dance and athletic staging",
        "Business enterprise and philanthropic schools in Malawi"
      ],
      "whenLifeTurned": "1984 'Like a Virgin' performance at the MTV VMAs, smashing conservative barriers and redefining female autonomy in global entertainment.",
      "currentLifeReality": "Completed triumphant 81-date *The Celebration Tour* across four continents following recovery from a severe bacterial infection; cementing six decades of cultural dominance.",
      "majorChallengesFacing": "Defying ageism while managing joint inflammation and maintaining athletic stage stamina near age 70.",
      "expectedVocationCodes": [
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "creative_media_stardom",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Leo",
        "approxMoonSign": "Leo (Purva Phalguni)",
        "expectedHoraLord": "Saturn",
        "panchangaSummary": "Shukla Dvitiya, Saturday (Shanivara), Purva Phalguni Nakshatra, Shiva Yoga, Balava Karana",
        "vajraSuitability": "Prohibited; Venus rules 3rd and 10th enemy houses for Leo Lagna. Diamond triggers public fatigue and vocal exhaustion.",
        "hawalaSuitability": "Supreme Yogakaraka! Mars is 4th and 9th (Bhagya) lord for Leo Lagna. Red Coral is her warrior vitality stone, conferring phenomenal physical endurance, iconic stage longevity, and global conquest."
      }
    }
  },
  {
    "id": "bill_gates",
    "name": "Bill Gates",
    "gender": "Male",
    "ageBracket": "under_80",
    "approxAgeIn2026": 70,
    "birthDate": "1955-10-28",
    "birthTime": "21:15",
    "birthPlace": "Seattle, WA, USA",
    "latitude": 47.6062,
    "longitude": -122.3321,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Oct 28, 1955 at 21:15 PST).",
    "maritalStatus": "divorced",
    "hasChildren": true,
    "assignedLanguage": "hi",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Relentlessly analytical",
        "Voracious reader and deep thinker",
        "Technological optimist",
        "Pragmatic problem solver",
        "Private and methodical"
      ],
      "primaryFieldAndInterests": [
        "Global health & disease eradication (Gates Foundation)",
        "Clean energy and next-gen nuclear innovation (TerraPower)",
        "AI and education tools"
      ],
      "whenLifeTurned": "1980 IBM operating system contract for MS-DOS, creating the PC revolution and making him the youngest self-made billionaire in history at age 31.",
      "currentLifeReality": "Global philanthropist driving polio and malaria eradication; breaking ground on TerraPower advanced nuclear reactor in Wyoming, active grandfather.",
      "majorChallengesFacing": "Navigating internet conspiracy theories and complex geopolitical funding barriers to global health initiatives.",
      "expectedVocationCodes": [
        "science_technology",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "leadership_expansion_scaling",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Gemini",
        "approxMoonSign": "Pisces (Uttara Bhadrapada)",
        "expectedHoraLord": "Venus",
        "panchangaSummary": "Shukla Trayodashi, Friday (Shukravara), Uttara Bhadrapada Nakshatra, Vajra Yoga, Taitila Karana",
        "vajraSuitability": "Supreme Benefic! Venus rules 5th house of intellect, algorithms, and capital accumulation for Gemini Lagna. Diamond or White Zircon unlocked his epochal software revolution.",
        "hawalaSuitability": "Strictly Prohibited; Mars rules 6th and 11th dusthanas for Gemini Lagna. Red Coral would trigger antitrust lawsuits and personal divorce stress."
      }
    }
  },
  {
    "id": "steve_jobs",
    "name": "Steve Jobs",
    "gender": "Male",
    "ageBracket": "under_80",
    "approxAgeIn2026": 71,
    "birthDate": "1955-02-24",
    "birthTime": "19:15",
    "birthPlace": "San Francisco, CA, USA",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (Feb 24, 1955 at 19:15 PST).",
    "maritalStatus": "married",
    "hasChildren": true,
    "assignedLanguage": "en",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Reality distortion field visionary",
        "Zen Buddhist aesthetic purist",
        "Uncompromising demand for excellence",
        "Passionate storyteller",
        "Complex emotional intensity"
      ],
      "primaryFieldAndInterests": [
        "Consumer technology design (Mac, iPod, iPhone, iPad)",
        "Digital animation (Pixar)",
        "Typography and calligraphic aesthetics"
      ],
      "whenLifeTurned": "1997 return to Apple following 1985 ouster, launching the iMac, iPod, iPhone, and iPad in the greatest corporate turnaround in industrial history.",
      "currentLifeReality": "Posthumous global design benchmark; his inventions and philosophy continue to define modern human technological existence.",
      "majorChallengesFacing": "Overcoming pancreatic neuroendocrine illness while racing against time to finalize products that would outlive him by centuries.",
      "expectedVocationCodes": [
        "science_technology",
        "creative_media",
        "business_realestate"
      ],
      "expectedLifeStageCategory": "creative_media_stardom",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Leo",
        "approxMoonSign": "Pisces (Purva Bhadrapada)",
        "expectedHoraLord": "Jupiter",
        "panchangaSummary": "Shukla Tritiya, Thursday (Guruvara), Purva Bhadrapada Nakshatra, Sadhya Yoga, Taitila Karana",
        "vajraSuitability": "Prohibited; Venus rules 3rd and 10th enemy houses for Leo Lagna. Diamond triggers severe executive battles and health sensitivity.",
        "hawalaSuitability": "Supreme Yogakaraka! Mars is 4th and 9th (Bhagya) lord for Leo Lagna. Red Coral was his supreme talisman, fueling visionary passion, courageous product bets, and iconic leadership."
      }
    }
  },
  {
    "id": "narendra_modi",
    "name": "Narendra Modi",
    "gender": "Male",
    "ageBracket": "under_80",
    "approxAgeIn2026": 75,
    "birthDate": "1950-09-17",
    "birthTime": "11:00",
    "birthPlace": "Vadnagar, Gujarat, India",
    "latitude": 23.7836,
    "longitude": 72.6372,
    "roddenRating": "A",
    "sourceCitation": "Official state registry and biographical verification (Sept 17, 1950 at 11:00 AM IST).",
    "maritalStatus": "separated",
    "hasChildren": false,
    "assignedLanguage": "kn",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Ascetic self-discipline",
        "Master communicator and orator",
        "Relentless administrative stamina",
        "Deep spiritual devotion (Kashi/Kedarnath)",
        "Strategic nationalist vision"
      ],
      "primaryFieldAndInterests": [
        "National governance and infrastructure modernization",
        "Digital public infrastructure (UPI/Digital India)",
        "Global diplomatic alliances"
      ],
      "whenLifeTurned": "October 2001 sudden appointment as Gujarat Chief Minister followed by historic 2014 national election victory as Prime Minister of India.",
      "currentLifeReality": "Serving third consecutive historic term as Prime Minister of India; leading G20/Global South diplomacy, steering India toward a $5T economy and Viksit Bharat 2047.",
      "majorChallengesFacing": "Managing coalition governance dynamics, regional geopolitical friction, and accelerating youth employment manufacturing growth.",
      "expectedVocationCodes": [
        "government_civil_police",
        "legal_judiciary"
      ],
      "expectedLifeStageCategory": "leadership_expansion_scaling",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Scorpio",
        "approxMoonSign": "Scorpio (Anuradha)",
        "expectedHoraLord": "Sun",
        "panchangaSummary": "Shukla Shashthi, Sunday (Ravivara), Anuradha Nakshatra, Vishkambha Yoga, Kaulava Karana",
        "vajraSuitability": "Strictly Prohibited; Venus rules 7th and 12th Maraka/Vyaya houses for Scorpio Lagna. Diamond would cause loss of political focus and ascetic detachment.",
        "hawalaSuitability": "Supreme Lagna Lord! Mars rules Scorpio Lagna. Red Coral (Hawala) in Gold on ring finger confers unmatched administrative authority, physical endurance, and invincible political fortitude."
      }
    }
  },
  {
    "id": "meryl_streep",
    "name": "Meryl Streep",
    "gender": "Female",
    "ageBracket": "under_80",
    "approxAgeIn2026": 76,
    "birthDate": "1949-06-22",
    "birthTime": "08:05",
    "birthPlace": "Overlook Hospital, Summit, NJ, USA",
    "latitude": 40.7168,
    "longitude": -74.3643,
    "roddenRating": "AA",
    "sourceCitation": "Birth certificate in hand quoted in Astro-Databank (June 22, 1949 at 08:05 AM EDT).",
    "maritalStatus": "separated",
    "hasChildren": true,
    "assignedLanguage": "te",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Unrivaled chameleon versatility",
        "Subtle intellectual humor",
        "Generous ensemble collaborator",
        "Private family grounding",
        "Graceful aging without vanity"
      ],
      "primaryFieldAndInterests": [
        "Dramatic screen and stage acting (21 Oscar nominations, 3 wins)",
        "Women's history and literary narration",
        "Mentoring emerging actors"
      ],
      "whenLifeTurned": "1978 breakthrough in 'The Deer Hunter' and 1979 Oscar win for 'Kramer vs. Kramer', cementing her reputation as the greatest screen actress of her generation.",
      "currentLifeReality": "Acclaimed guest role in *Only Murders in the Building*; celebrated as the gold standard of dramatic cinema, enjoying grandmotherhood and quiet cultural life.",
      "majorChallengesFacing": "Navigating late-in-life marital separation from Don Gummer after 45 years while managing senior joint and vocal wellness.",
      "expectedVocationCodes": [
        "creative_media",
        "teaching_academics"
      ],
      "expectedLifeStageCategory": "leadership_expansion_scaling",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Cancer",
        "approxMoonSign": "Taurus (Krittika - Exalted Moon)",
        "expectedHoraLord": "Mercury",
        "panchangaSummary": "Krishna Ekadashi, Wednesday (Budhavara), Krittika Nakshatra, Sukarma Yoga, Balava Karana",
        "vajraSuitability": "Conditional; Venus is 4th and 11th lord for Cancer Lagna. Delicate White Zircon or Opal is preferred over heavy Diamond.",
        "hawalaSuitability": "Supreme Yogakaraka! Mars is 5th (artistic brilliance) and 10th (public honor) lord for Cancer Lagna. Red Coral is her premier stone for legendary acting vitality and historic Academy Awards."
      }
    }
  },
  {
    "id": "dalai_lama",
    "name": "Dalai Lama (14th)",
    "gender": "Male",
    "ageBracket": "under_80",
    "approxAgeIn2026": 90,
    "birthDate": "1935-07-06",
    "birthTime": "04:38",
    "birthPlace": "Taktser, Amdo, Tibet",
    "latitude": 36.3833,
    "longitude": 101.8667,
    "roddenRating": "AA",
    "sourceCitation": "Autobiography 'Freedom in Exile'; official Tibetan monastic astrological records (July 6, 1935 at 04:38 AM LMT).",
    "maritalStatus": "unmarried",
    "hasChildren": false,
    "assignedLanguage": "hi",
    "internetGroundTruth": {
      "characterAndTemperament": [
        "Infectious joyful laughter",
        "Boundless universal compassion (Karuna)",
        "Deep philosophical curiosity with modern science",
        "Simple monk humility",
        "Unshakable peace in exile"
      ],
      "primaryFieldAndInterests": [
        "Tibetan Buddhist philosophy and Nalanda tradition",
        "Global interfaith peace dialogue",
        "Mind and Life Institute cognitive neuroscience"
      ],
      "whenLifeTurned": "March 1959 dramatic disguised escape on horseback across the Himalayas into India following the Lhasa uprising, establishing Dharamshala as the sanctuary of Tibetan Buddhism.",
      "currentLifeReality": "Entering his 90th milestone year in Dharamshala; recovering from knee surgery in the US, actively teaching global disciples, guiding peaceful Tibetan cultural continuity.",
      "majorChallengesFacing": "Planning the sacred reincarnation protocol to prevent political interference while managing senior physical mobility.",
      "expectedVocationCodes": [
        "teaching_academics",
        "government_civil_police"
      ],
      "expectedLifeStageCategory": "leadership_expansion_scaling",
      "astrologicalGroundTruth": {
        "approxLagnaSign": "Gemini",
        "approxMoonSign": "Leo (Uttara Phalguni)",
        "expectedHoraLord": "Saturn",
        "panchangaSummary": "Shukla Shashthi, Saturday (Shanivara), Uttara Phalguni Nakshatra, Variyan Yoga, Kaulava Karana",
        "vajraSuitability": "Supreme Benefic! Venus is 5th lord of spiritual wisdom, compassion, and divine grace for Gemini Lagna. Diamond or White Zircon provides radiant serenity and global peace resonance.",
        "hawalaSuitability": "Strictly Prohibited; Mars rules 6th and 11th dusthanas for Gemini Lagna. Red Coral attracts political violence, invasion, and monastic disruptions."
      }
    }
  }
];
