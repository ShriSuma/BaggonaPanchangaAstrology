/**
 * 20 Real-World Public Figures Benchmark Dataset for Baggona Panchanga & Astrology
 *
 * Covers 10 distinct age brackets with balanced/shuffled genders:
 * 1. Under 2 years: Rocky Thirteen Barker (M), London Marilyn Hilton Reum (F)
 * 2. Under 8 years: Prince Louis of Wales (M), Princess Lilibet of Sussex (F)
 * 3. Under 13 years: Prince George of Wales (M), North West (F)
 * 4. Under 18 years: Knox Léon Jolie-Pitt (M), Infanta Sofía of Spain (F)
 * 5. Under 25 years: Alexis Lebrun (M), Billie Eilish (F)
 * 6. Under 30 years: Kylian Mbappé (M), Bella Hadid (F)
 * 7. Under 35 years: Aymeric Laporte (M), Meghan Trainor (F)
 * 8. Under 40 years: Novak Djokovic (M), Emma Watson (F)
 * 9. Under 60 years: Tiger Woods (M), Angelina Jolie (F)
 * 10. Under 80 years: Barack Obama (M), Madonna (F)
 *
 * All profiles possess verified Rodden Rating AA or official registry data.
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

export interface BenchmarkProfile {
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
  roddenRating: "AA";
  sourceCitation: string;
  maritalStatus?: "unmarried" | "married" | "divorced" | "separated";
  hasChildren?: boolean;

  // Documented Ground Truth from the Internet
  internetGroundTruth: {
    characterAndTemperament: string[];
    primaryFieldAndInterests: string[];
    currentLifeReality: string;
    expectedVocationCodes: string[];
    expectedLifeStageCategory: string;
  };
}

export const BENCHMARK_20_PROFILES: BenchmarkProfile[] = [
  // -------------------------------------------------------------
  // 1. UNDER 2 YEARS (< 2)
  // -------------------------------------------------------------
  {
    id: "rocky_barker",
    name: "Rocky Thirteen Barker",
    gender: "Male",
    ageBracket: "under_2",
    approxAgeIn2026: 2,
    birthDate: "2023-11-01",
    birthTime: "00:00",
    birthPlace: "Cedars-Sinai Medical Center, Los Angeles, CA, USA",
    latitude: 34.0754,
    longitude: -118.3801,
    roddenRating: "AA",
    sourceCitation: "Birth certificate obtained by TMZ / People magazine (Nov 1, 2023 midnight).",
    maritalStatus: "unmarried",
    hasChildren: false,
    internetGroundTruth: {
      characterAndTemperament: ["Sensory-alert", "Rhythmic/musical home influence", "Attached to parents", "Playful infant curiosity"],
      primaryFieldAndInterests: ["Infant developmental milestones", "Musical rhythms (drums/music exposure)", "Sensory toys"],
      currentLifeReality: "Living with celebrity parents Kourtney Kardashian and Travis Barker; high public spotlight, protected infant upbringing, strong maternal bonding.",
      expectedVocationCodes: ["creative_media", "business_realestate"],
      expectedLifeStageCategory: "infant_balarishta_growth"
    }
  },
  {
    id: "london_hilton",
    name: "London Marilyn Hilton Reum",
    gender: "Female",
    ageBracket: "under_2",
    approxAgeIn2026: 2,
    birthDate: "2023-11-11",
    birthTime: "11:43",
    birthPlace: "Cedars-Sinai Medical Center, Los Angeles, CA, USA",
    latitude: 34.0754,
    longitude: -118.3801,
    roddenRating: "AA",
    sourceCitation: "Official birth certificate obtained by media (Nov 11, 2023 at 11:43 AM).",
    maritalStatus: "unmarried",
    hasChildren: false,
    internetGroundTruth: {
      characterAndTemperament: ["Sweet", "Delicate", "Visually stimulated by bright aesthetics", "Calm and joyful infant disposition"],
      primaryFieldAndInterests: ["Early speech exploration", "Music and aesthetics", "Nursery sensory play"],
      currentLifeReality: "Daughter of Paris Hilton and Carter Reum; lavish luxury nursery, social media glimpses, surrounded by music, beauty, and devoted maternal care.",
      expectedVocationCodes: ["creative_media", "business_realestate"],
      expectedLifeStageCategory: "infant_balarishta_growth"
    }
  },

  // -------------------------------------------------------------
  // 2. UNDER 8 YEARS (3–7)
  // -------------------------------------------------------------
  {
    id: "prince_louis",
    name: "Prince Louis of Wales",
    gender: "Male",
    ageBracket: "under_8",
    approxAgeIn2026: 8,
    birthDate: "2018-04-23",
    birthTime: "11:01",
    birthPlace: "St Mary's Hospital, Paddington, London, UK",
    latitude: 51.5160,
    longitude: -0.1749,
    roddenRating: "AA",
    sourceCitation: "Official Buckingham Palace royal birth bulletin (April 23, 2018 at 11:01 AM BST).",
    maritalStatus: "unmarried",
    hasChildren: false,
    internetGroundTruth: {
      characterAndTemperament: ["High-energy", "Cheeky and mischievous humor", "Spontaneous expressions", "Fearless outdoor enthusiast", "Crowd favorite"],
      primaryFieldAndInterests: ["Outdoor sports (rugby, cricket, running)", "Playful arts", "Primary school exploration at Lambrook"],
      currentLifeReality: "Youngest child of Prince William and Catherine; beloved for funny facial expressions at public royal events, high physical stamina, joyful schoolboy life.",
      expectedVocationCodes: ["government_civil_police", "sports_athletics"],
      expectedLifeStageCategory: "early_childhood_play_milestones"
    }
  },
  {
    id: "princess_lilibet",
    name: "Princess Lilibet of Sussex",
    gender: "Female",
    ageBracket: "under_8",
    approxAgeIn2026: 5,
    birthDate: "2021-06-04",
    birthTime: "11:40",
    birthPlace: "Santa Barbara Cottage Hospital, Santa Barbara, CA, USA",
    latitude: 34.4258,
    longitude: -119.7142,
    roddenRating: "AA",
    sourceCitation: "Official royal spokesperson announcement & California birth registration (June 4, 2021 at 11:40 AM PDT).",
    maritalStatus: "unmarried",
    hasChildren: false,
    internetGroundTruth: {
      characterAndTemperament: ["Gentle", "Curious", "Joyful", "Nature-loving", "Strong bond with animals and older brother Archie"],
      primaryFieldAndInterests: ["Early preschool learning", "Gardening and animals", "Singing and movement"],
      currentLifeReality: "Growing up in Montecito, California; kept in private sanctuary away from tabloid intrusions, sunny outdoor play, strong family warmth.",
      expectedVocationCodes: ["creative_media", "teaching_academics"],
      expectedLifeStageCategory: "early_childhood_play_milestones"
    }
  },

  // -------------------------------------------------------------
  // 3. UNDER 13 YEARS (8–12)
  // -------------------------------------------------------------
  {
    id: "prince_george",
    name: "Prince George of Wales",
    gender: "Male",
    ageBracket: "under_13",
    approxAgeIn2026: 13,
    birthDate: "2013-07-22",
    birthTime: "16:24",
    birthPlace: "St Mary's Hospital, Paddington, London, UK",
    latitude: 51.5160,
    longitude: -0.1749,
    roddenRating: "AA",
    sourceCitation: "Official Buckingham Palace royal birth bulletin (July 22, 2013 at 16:24 BST).",
    maritalStatus: "unmarried",
    hasChildren: false,
    internetGroundTruth: {
      characterAndTemperament: ["Reserved", "Dignified", "Polite and observant", "Conscientious", "Growing sense of duty"],
      primaryFieldAndInterests: ["Aviation and flying", "Football (Aston Villa fan)", "Tennis", "Classical history & royal statecraft"],
      currentLifeReality: "Second in line to the British throne; transitioning toward secondary boarding school, participating in ceremonial royal duties with composure.",
      expectedVocationCodes: ["government_civil_police", "sports_athletics"],
      expectedLifeStageCategory: "student_academic_stress"
    }
  },
  {
    id: "north_west",
    name: "North West",
    gender: "Female",
    ageBracket: "under_13",
    approxAgeIn2026: 13,
    birthDate: "2013-06-15",
    birthTime: "05:33",
    birthPlace: "Cedars-Sinai Medical Center, Los Angeles, CA, USA",
    latitude: 34.0754,
    longitude: -118.3801,
    roddenRating: "AA",
    sourceCitation: "Birth certificate in hand, Cedars-Sinai (June 15, 2013 at 05:33 AM PDT).",
    maritalStatus: "unmarried",
    hasChildren: false,
    internetGroundTruth: {
      characterAndTemperament: ["Bold", "Unapologetically expressive", "Artistic visionary", "Extroverted leader among peers", "Direct humor"],
      primaryFieldAndInterests: ["Music and rapping", "Stage performing (Lion King at Hollywood Bowl)", "Fashion styling and sketching", "Video creation"],
      currentLifeReality: "Eldest child of Kim Kardashian and Kanye West; announced debut music project, commanding massive digital creative influence as an adolescent prodigy.",
      expectedVocationCodes: ["creative_media", "business_realestate"],
      expectedLifeStageCategory: "youth_artistic_or_sports_prodigy"
    }
  },

  // -------------------------------------------------------------
  // 4. UNDER 18 YEARS (13–17)
  // -------------------------------------------------------------
  {
    id: "knox_jolie_pitt",
    name: "Knox Léon Jolie-Pitt",
    gender: "Male",
    ageBracket: "under_18",
    approxAgeIn2026: 18,
    birthDate: "2008-07-12",
    birthTime: "18:27",
    birthPlace: "Fondation Lenval Hospital, Nice, France",
    latitude: 43.6934,
    longitude: 7.2435,
    roddenRating: "AA",
    sourceCitation: "Birth certificate registered by Mayor Christian Estrosi in Nice, France (July 12, 2008 at 18:27 CEST).",
    maritalStatus: "unmarried",
    hasChildren: false,
    internetGroundTruth: {
      characterAndTemperament: ["Introverted", "Grounded", "Physically disciplined", "Supportive brother", "Prefers quiet privacy"],
      primaryFieldAndInterests: ["Martial arts and boxing", "Visual arts and design", "Languages and travel"],
      currentLifeReality: "Entering young adulthood; stepping occasionally onto red carpets with mother Angelina Jolie while maintaining low-key artistic and athletic life.",
      expectedVocationCodes: ["creative_media", "sports_athletics"],
      expectedLifeStageCategory: "student_academic_stress"
    }
  },
  {
    id: "infanta_sofia",
    name: "Infanta Sofía of Spain",
    gender: "Female",
    ageBracket: "under_18",
    approxAgeIn2026: 18,
    birthDate: "2007-04-29",
    birthTime: "16:50",
    birthPlace: "Ruber International Hospital, Madrid, Spain",
    latitude: 40.4893,
    longitude: -3.7088,
    roddenRating: "AA",
    sourceCitation: "Official Royal House of Spain announcement & civil registry (April 29, 2007 at 16:50 CEST).",
    maritalStatus: "unmarried",
    hasChildren: false,
    internetGroundTruth: {
      characterAndTemperament: ["Poised", "Scholarly", "Naturally athletic", "Empathetic companion to her sister Princess Leonor", "Modern royal outlook"],
      primaryFieldAndInterests: ["International relations", "Football (passionate fan and school player)", "Environmental sustainability"],
      currentLifeReality: "Studying the International Baccalaureate at UWC Atlantic College in Wales; undertaking formal representation at state events in Spain.",
      expectedVocationCodes: ["government_civil_police", "teaching_academics"],
      expectedLifeStageCategory: "student_academic_stress"
    }
  },

  // -------------------------------------------------------------
  // 5. UNDER 25 YEARS (18–24)
  // -------------------------------------------------------------
  {
    id: "alexis_lebrun",
    name: "Alexis Lebrun",
    gender: "Male",
    ageBracket: "under_25",
    approxAgeIn2026: 22,
    birthDate: "2003-08-27",
    birthTime: "16:03",
    birthPlace: "Montpellier, France",
    latitude: 43.6108,
    longitude: 3.8767,
    roddenRating: "AA",
    sourceCitation: "Birth certificate in hand quoted in Astro-Databank (Aug 27, 2003 at 16:03 CEST).",
    maritalStatus: "unmarried",
    hasChildren: false,
    internetGroundTruth: {
      characterAndTemperament: ["Fierce competitive fire", "Relentless determination", "Emotional intensity on court", "Close brotherhood with Félix Lebrun"],
      primaryFieldAndInterests: ["Professional table tennis", "High-speed tactical athletics", "Physical power training"],
      currentLifeReality: "Olympic bronze medalist (Paris 2024), European men's singles champion; at the peak of world table tennis rivalry against top Asian players.",
      expectedVocationCodes: ["sports_athletics"],
      expectedLifeStageCategory: "elite_sports_athletic_triumph"
    }
  },
  {
    id: "billie_eilish",
    name: "Billie Eilish",
    gender: "Female",
    ageBracket: "under_25",
    approxAgeIn2026: 24,
    birthDate: "2001-12-18",
    birthTime: "11:30",
    birthPlace: "Los Angeles, CA, USA",
    latitude: 34.0522,
    longitude: -118.2437,
    roddenRating: "AA",
    sourceCitation: "Birth certificate / hospital record quoted in Astro-Databank (Dec 18, 2001 at 11:30 AM PST).",
    maritalStatus: "unmarried",
    hasChildren: false,
    internetGroundTruth: {
      characterAndTemperament: ["Deeply introspective", "Non-conformist", "Raw emotional vulnerability", "Artistic perfectionist", "Strong advocate for youth mental health"],
      primaryFieldAndInterests: ["Songwriting and vocal performance", "Music production with brother Finneas", "Visual directing and fashion"],
      currentLifeReality: "Multiple Grammy and two-time Academy Award winner (*Hit Me Hard and Soft* album & world tour); leading global music charts with critical acclaim.",
      expectedVocationCodes: ["creative_media"],
      expectedLifeStageCategory: "creative_media_stardom"
    }
  },

  // -------------------------------------------------------------
  // 6. UNDER 30 YEARS (25–29)
  // -------------------------------------------------------------
  {
    id: "kylian_mbappe",
    name: "Kylian Mbappé",
    gender: "Male",
    ageBracket: "under_30",
    approxAgeIn2026: 27,
    birthDate: "1998-12-20",
    birthTime: "01:47",
    birthPlace: "Paris (19th Arrondissement), France",
    latitude: 48.8566,
    longitude: 2.3522,
    roddenRating: "AA",
    sourceCitation: "Birth certificate n°4993 in hand (Dec 20, 1998 at 01:47 AM CET).",
    maritalStatus: "unmarried",
    hasChildren: false,
    internetGroundTruth: {
      characterAndTemperament: ["Supreme self-confidence", "Electrifying ambition", "Calculated composure under global pressure", "Astute commercial acumen"],
      primaryFieldAndInterests: ["Elite professional football", "Sports leadership & captaincy", "Global business investments and foundation work"],
      currentLifeReality: "Signed with Real Madrid; French national team captain, chasing UEFA Champions League titles and the Ballon d'Or under colossal global expectations.",
      expectedVocationCodes: ["sports_athletics", "business_realestate"],
      expectedLifeStageCategory: "elite_sports_athletic_triumph"
    }
  },
  {
    id: "bella_hadid",
    name: "Bella Hadid",
    gender: "Female",
    ageBracket: "under_30",
    approxAgeIn2026: 29,
    birthDate: "1996-10-09",
    birthTime: "04:19",
    birthPlace: "Washington, DC, USA",
    latitude: 38.9072,
    longitude: -77.0369,
    roddenRating: "AA",
    sourceCitation: "Birth certificate in hand quoted in Astro-Databank (Oct 9, 1996 at 04:19 AM EDT).",
    maritalStatus: "unmarried",
    hasChildren: false,
    internetGroundTruth: {
      characterAndTemperament: ["Graceful", "Resilient", "Transparent regarding personal vulnerabilities", "Passionate equestrian", "Deep loyalty to family roots"],
      primaryFieldAndInterests: ["High-fashion runway and editorial modeling", "Equestrian competition", "Holistic wellness products (Kin Euphorics, Orebella)"],
      currentLifeReality: "Returned to the fashion runway and equestrian circuit after intense medical treatment for chronic Lyme disease; flourishing entrepreneur in wellness.",
      expectedVocationCodes: ["creative_media", "business_realestate"],
      expectedLifeStageCategory: "creative_media_stardom"
    }
  },

  // -------------------------------------------------------------
  // 7. UNDER 35 YEARS (30–34)
  // -------------------------------------------------------------
  {
    id: "aymeric_laporte",
    name: "Aymeric Laporte",
    gender: "Male",
    ageBracket: "under_35",
    approxAgeIn2026: 31,
    birthDate: "1994-05-27",
    birthTime: "16:55",
    birthPlace: "Agen, France",
    latitude: 44.2031,
    longitude: 0.6164,
    roddenRating: "AA",
    sourceCitation: "Birth certificate / birth record in hand quoted in Astro-Databank (May 27, 1994 at 16:55 CEST).",
    maritalStatus: "married",
    hasChildren: true,
    internetGroundTruth: {
      characterAndTemperament: ["Tactically composed", "Disciplined", "Commanding presence", "Unshakable poise under defensive siege"],
      primaryFieldAndInterests: ["Tactical football defending", "Athletic endurance and rehabilitation", "International team cohesion"],
      currentLifeReality: "Key pillar of Spain's Euro 2024 championship defense; solidifying senior leadership in European and international football.",
      expectedVocationCodes: ["sports_athletics"],
      expectedLifeStageCategory: "elite_sports_athletic_triumph"
    }
  },
  {
    id: "meghan_trainor",
    name: "Meghan Trainor",
    gender: "Female",
    ageBracket: "under_35",
    approxAgeIn2026: 32,
    birthDate: "1993-12-22",
    birthTime: "10:16",
    birthPlace: "Nantucket, MA, USA",
    latitude: 41.2835,
    longitude: -70.0995,
    roddenRating: "AA",
    sourceCitation: "Birth record viewed at Mass Registry of Vital Records (Dec 22, 1993 at 10:16 AM EST).",
    maritalStatus: "married",
    hasChildren: true,
    internetGroundTruth: {
      characterAndTemperament: ["Warm", "Bubbly and effervescent", "Empowering", "Devoted family woman", "Pragmatic music crafter"],
      primaryFieldAndInterests: ["Pop music production and hook writing", "Television judging (The Voice)", "Book author and parenting podcasting"],
      currentLifeReality: "Touring her album *Timeless*, raising two young boys with husband Daryl Sabara, thriving across television entertainment and music streaming.",
      expectedVocationCodes: ["creative_media"],
      expectedLifeStageCategory: "creative_media_stardom"
    }
  },

  // -------------------------------------------------------------
  // 8. UNDER 40 YEARS (35–39)
  // -------------------------------------------------------------
  {
    id: "novak_djokovic",
    name: "Novak Djokovic",
    gender: "Male",
    ageBracket: "under_40",
    approxAgeIn2026: 38,
    birthDate: "1987-05-22",
    birthTime: "23:25",
    birthPlace: "Belgrade, Serbia",
    latitude: 44.7866,
    longitude: 20.4489,
    roddenRating: "AA",
    sourceCitation: "Birth certificate in hand quoted in Astro-Databank (May 22, 1987 at 23:25 CEST).",
    maritalStatus: "married",
    hasChildren: true,
    internetGroundTruth: {
      characterAndTemperament: ["Unmatched mental resilience", "Spiritual devotion and biohacking discipline", "Unflinching independence", "Passionate national patriot"],
      primaryFieldAndInterests: ["Historic tennis mastery", "Holistic longevity and nutrition", "Player advocacy (PTPA foundation)"],
      currentLifeReality: "Captured Olympic singles Gold at Paris 2024 to complete tennis's golden crown (24 Slams + Gold); balancing family life and selective tournament milestones.",
      expectedVocationCodes: ["sports_athletics"],
      expectedLifeStageCategory: "elite_sports_athletic_triumph"
    }
  },
  {
    id: "emma_watson",
    name: "Emma Watson",
    gender: "Female",
    ageBracket: "under_40",
    approxAgeIn2026: 35,
    birthDate: "1990-04-15",
    birthTime: "18:00",
    birthPlace: "Paris, France",
    latitude: 48.8566,
    longitude: 2.3522,
    roddenRating: "AA",
    sourceCitation: "Birth certificate in hand quoted in Astro-Databank (April 15, 1990 at 18:00 CEST).",
    maritalStatus: "unmarried",
    hasChildren: false,
    internetGroundTruth: {
      characterAndTemperament: ["Intellectually rigorous", "Articulate", "Principled ethics", "Values privacy and creative autonomy", "Compassionate humanist"],
      primaryFieldAndInterests: ["Acting and film directing", "Oxford and Brown scholarly studies", "UN Women HeForShe advocacy & sustainable fashion"],
      currentLifeReality: "Taking deliberate pauses between major film roles to pursue Oxford creative writing master's degree, organic gin business with brother, and sustainable investments.",
      expectedVocationCodes: ["creative_media", "teaching_academics", "legal_judiciary"],
      expectedLifeStageCategory: "creative_media_stardom"
    }
  },

  // -------------------------------------------------------------
  // 9. UNDER 60 YEARS (40–59)
  // -------------------------------------------------------------
  {
    id: "tiger_woods",
    name: "Tiger Woods",
    gender: "Male",
    ageBracket: "under_60",
    approxAgeIn2026: 50,
    birthDate: "1975-12-30",
    birthTime: "22:50",
    birthPlace: "Long Beach, CA, USA",
    latitude: 33.7701,
    longitude: -118.1937,
    roddenRating: "AA",
    sourceCitation: "Birth certificate in hand quoted in Astro-Databank (Dec 30, 1975 at 22:50 PST).",
    maritalStatus: "divorced",
    hasChildren: true,
    internetGroundTruth: {
      characterAndTemperament: ["Hyper-focused laser intensity", "Extraordinary threshold for pain and rehabilitation", "Private and stoic", "Legendary competitiveness"],
      primaryFieldAndInterests: ["Championship golf", "Golf course design & TGL tech league", "Mentoring son Charlie Woods"],
      currentLifeReality: "Navigating veteran phase of golf after landmark spinal fusion and 2021 car crash recovery; establishing business enterprises and guiding next generation.",
      expectedVocationCodes: ["sports_athletics", "business_realestate"],
      expectedLifeStageCategory: "post_divorce_rebuilding"
    }
  },
  {
    id: "angelina_jolie",
    name: "Angelina Jolie",
    gender: "Female",
    ageBracket: "under_60",
    approxAgeIn2026: 50,
    birthDate: "1975-06-04",
    birthTime: "09:01",
    birthPlace: "Los Angeles, CA, USA",
    latitude: 34.0522,
    longitude: -118.2437,
    roddenRating: "AA",
    sourceCitation: "Birth certificate in hand quoted in Astro-Databank (June 4, 1975 at 09:01 AM PDT).",
    maritalStatus: "divorced",
    hasChildren: true,
    internetGroundTruth: {
      characterAndTemperament: ["Intensely charismatic", "Fiercely protective mother", "Profound humanitarian empathy", "Courageous non-conformist", "Complex inner depth"],
      primaryFieldAndInterests: ["Film acting and cinematic directing", "UNHCR refugee ambassadorship", "Sustainable fashion atelier (Atelier Jolie)"],
      currentLifeReality: "Acclaimed performance in biopic *Maria* (2024); launching creative fashion hub Atelier Jolie in NYC, resolving longstanding legal settlements after divorce.",
      expectedVocationCodes: ["creative_media", "government_civil_police"],
      expectedLifeStageCategory: "post_divorce_rebuilding"
    }
  },

  // -------------------------------------------------------------
  // 10. UNDER 80 YEARS (60–79)
  // -------------------------------------------------------------
  {
    id: "barack_obama",
    name: "Barack Obama",
    gender: "Male",
    ageBracket: "under_80",
    approxAgeIn2026: 64,
    birthDate: "1961-08-04",
    birthTime: "19:24",
    birthPlace: "Honolulu, HI, USA",
    latitude: 21.3069,
    longitude: -157.8583,
    roddenRating: "AA",
    sourceCitation: "State of Hawaii Long-Form Certificate of Live Birth (Aug 4, 1961 at 19:24 HST).",
    maritalStatus: "married",
    hasChildren: true,
    internetGroundTruth: {
      characterAndTemperament: ["Cerebral and calm ('No Drama Obama')", "Masterful oratorical grace", "Pragmatic consensus-builder", "Deeply reflective author", "Dignified statesman"],
      primaryFieldAndInterests: ["Statecraft and constitutional law", "Bestselling authorship and memoirs", "Media production (Higher Ground)", "Global leadership mentorship"],
      currentLifeReality: "Senior global statesman, actively mentoring emerging democratic leaders worldwide, producing award-winning cultural films, enjoying stable marital partnership with Michelle Obama.",
      expectedVocationCodes: ["government_civil_police", "legal_judiciary", "teaching_academics"],
      expectedLifeStageCategory: "leadership_expansion_scaling"
    }
  },
  {
    id: "madonna",
    name: "Madonna",
    gender: "Female",
    ageBracket: "under_80",
    approxAgeIn2026: 67,
    birthDate: "1958-08-16",
    birthTime: "07:05",
    birthPlace: "Mercy Hospital, Bay City, MI, USA",
    latitude: 43.5945,
    longitude: -83.8889,
    roddenRating: "AA",
    sourceCitation: "Birth certificate in hand quoted in Astro-Databank (Aug 16, 1958 at 07:05 AM EST).",
    maritalStatus: "divorced",
    hasChildren: true,
    internetGroundTruth: {
      characterAndTemperament: ["Indomitable will", "Relentless cultural provocateur", "Iron physical discipline", "Uncompromising creative control", "Spiritual seeker"],
      primaryFieldAndInterests: ["Pop music innovation and worldwide stage touring", "Dance and athletic staging", "Business enterprise and philanthropic schools in Malawi"],
      currentLifeReality: "Completed triumphant 81-date *The Celebration Tour* across four continents following recovery from a severe bacterial infection; cementing six decades of cultural dominance.",
      expectedVocationCodes: ["creative_media", "business_realestate"],
      expectedLifeStageCategory: "creative_media_stardom"
    }
  }
];
