/**
 * benchmarkProfiles20Fresh.ts
 *
 * 20 Fresh, Verified Public Internet Profiles (Never Taken in Previous Benchmarks).
 * Contains rich real-life ground truth, personality characteristics, current life challenges,
 * gemstone/ring interventions (Havala/Coral, Pukhraj, Panna, Neelam, etc.),
 * and destiny catalysts (Name changes, Marriage Bhagya, Daughter Bhagya / Lakshmi arrival).
 */

import type { AccurateProfessionCode, CurrentLifeSituationCategory } from "../core/CurrentLifeAndCareerDiagnosticEngine";

export interface FreshBenchmarkProfile {
  id: string;
  name: string;
  publicRole: string;
  category: "sports_legend" | "cinema_superstar" | "cultural_maestro" | "business_media";
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  gender: "Male" | "Female";
  maritalStatusInput: "married" | "unmarried";
  hasChildren?: boolean;
  expectedCareerCodes: AccurateProfessionCode[];
  expectedMarriageVerdict: "already_married" | "delayed_marriage" | "assured_marriage";
  expectedLifeCategories: CurrentLifeSituationCategory[];
  
  // Real-world ground truth data
  knownGemstonesWorn: string[];
  gemstoneImpactDescription: string;
  catalysts: {
    hasNameOrSpellingChange: boolean;
    nameChangeDetails: string;
    hasMarriageBhagya: boolean;
    marriageBhagyaDetails: string;
    hasDaughterBhagya: boolean;
    daughterBhagyaDetails: string;
    hasGemstoneShift: boolean;
  };
  personalityCharacteristics: string[];
  currentLifeReality2026: string;
  currentAcuteChallenge: string;
}

export const TWENTY_FRESH_BENCHMARKS: FreshBenchmarkProfile[] = [
  // 1. VIRAT KOHLI
  {
    id: "virat-kohli",
    name: "Virat Kohli",
    publicRole: "Cricket Legend, Former Indian Captain & 50+ ODI Century Record Holder",
    category: "sports_legend",
    birthDate: "1988-11-05",
    birthTime: "10:28",
    latitude: 28.6139,
    longitude: 77.2090, // Delhi, India
    gender: "Male",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["sports_athletics"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["prolonged_drought_legendary_resurgence", "elite_sports_athletic_triumph"],
    knownGemstonesWorn: ["Yellow Sapphire (Pushparaga)", "Sacred Protective Karas / Threads"],
    gemstoneImpactDescription: "Wears sacred protective wrist threads and yellow sapphire/gemstones; anchored divine faith during peak competitive challenges.",
    catalysts: {
      hasNameOrSpellingChange: false,
      nameChangeDetails: "Retained original name; brand power established under 'King Kohli'.",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Married Anushka Sharma in Dec 2017 in Tuscany; their partnership cemented India's premier power couple and gave him mental equilibrium during intense captaincy pressure.",
      hasDaughterBhagya: true,
      daughterBhagyaDetails: "Daughter Vamika born in Jan 2021; fatherhood acted as a profound emotional anchor during Covid bio-bubbles and grueling career transitions.",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Fierce competitive fire, aggressive passion on the field coupled with deeply grounded family values",
      "Immense physical fitness pioneer who revolutionized Indian cricket's athletic culture",
      "Vulnerable yet resilient; openly acknowledged mental health fatigue and returned stronger"
    ],
    currentLifeReality2026: "Won the ICC Men's T20 World Cup 2024 as Player of the Final; retired from T20Is on top; welcomed son Akaay in Feb 2024; living a balanced family life.",
    currentAcuteChallenge: "Navigating post-captaincy workload, balancing international test cricket commitments with prolonged stays abroad in London."
  },

  // 2. KARAN JOHAR
  {
    id: "karan-johar",
    name: "Karan Johar",
    publicRole: "Bollywood Filmmaker, Producer (Dharma Productions) & Talk Show Host",
    category: "cinema_superstar",
    birthDate: "1972-05-25",
    birthTime: "02:10",
    latitude: 18.9220,
    longitude: 72.8347, // Mumbai, India
    gender: "Male",
    maritalStatusInput: "unmarried",
    hasChildren: true,
    expectedCareerCodes: ["creative_media", "business_realestate"],
    expectedMarriageVerdict: "delayed_marriage",
    expectedLifeCategories: ["reputation_crisis_phoenix_brand_revival", "creative_media_stardom"],
    knownGemstonesWorn: ["Emerald (Panna)", "Pearl (Mukta)", "Ruby (Manikya)"],
    gemstoneImpactDescription: "Famous for wearing an emerald ring on his little finger and a pearl/ruby on his right hand on astrological advice to stabilize emotions and media ventures.",
    catalysts: {
      hasNameOrSpellingChange: true,
      nameChangeDetails: "Famously added 'K' to all film titles (Kuch Kuch Hota Hai, Kabhi Khushi Kabhie Gham, Kal Ho Naa Ho, Kabhi Alvida Naa Kehna) following numerology advice which built Dharma Productions into an empire.",
      hasMarriageBhagya: false,
      marriageBhagyaDetails: "Single parent; channeled all creative and emotional devotion into family and cinema.",
      hasDaughterBhagya: true,
      daughterBhagyaDetails: "Welcomed twins daughter Roohi and son Yash via surrogacy in Feb 2017; stated that daughter Roohi's arrival brought unconditional emotional healing and grounded his life.",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Witty, flamboyant, emotionally sensitive behind a sharp showbiz exterior",
      "Unmatched eye for spectacle, glamour, high-emotion family drama, and music",
      "Deep loyalty to inner circle despite facing immense public polarization"
    ],
    currentLifeReality2026: "Heads Dharma Productions, Dharmatic Entertainment; successfully directed Rocky Aur Rani Ki Prem Kahani; producing diverse streaming and theatrical releases.",
    currentAcuteChallenge: "Facing digital boycott vitriol, managing large-scale studio financing in an unpredictable post-pandemic theatrical economy."
  },

  // 3. EKTA KAPOOR
  {
    id: "ekta-kapoor",
    name: "Ekta Kapoor",
    publicRole: "Television Czarina, Film Producer & Head of Balaji Telefilms",
    category: "business_media",
    birthDate: "1975-06-07",
    birthTime: "07:15",
    latitude: 18.9220,
    longitude: 72.8347, // Mumbai, India
    gender: "Female",
    maritalStatusInput: "unmarried",
    hasChildren: true,
    expectedCareerCodes: ["creative_media", "business_realestate"],
    expectedMarriageVerdict: "delayed_marriage",
    expectedLifeCategories: ["name_vibration_unbroken_hit_streak", "creative_media_stardom"],
    knownGemstonesWorn: ["Red Coral (Havala)", "Emerald (Panna)", "Yellow Sapphire (Pushparaga)", "Pearl"],
    gemstoneImpactDescription: "India's most prominent public wearer of multiple gemstone rings (including Red Coral/Havala, Emerald, and Pukhraj) on both hands, crediting them for overcoming hurdles and anchoring business dominance.",
    catalysts: {
      hasNameOrSpellingChange: true,
      nameChangeDetails: "Legendary numerological practice of starting television show titles with the letter 'K' (Kyunki Saas Bhi Kabhi Bahu Thi, Kahaani Ghar Ghar Kii, Kasautii Zindagii Kay, Kahiin To Hoga) which shaped Indian television history.",
      hasMarriageBhagya: false,
      marriageBhagyaDetails: "Remained single, building independent billion-rupee media enterprise.",
      hasDaughterBhagya: false,
      daughterBhagyaDetails: "Welcomed son Ravie via surrogacy in Jan 2019.",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Unyielding work ethic, sharp intuition for mass audience psychology",
      "Fiercely protective of her creators and family; deeply spiritual and ritualistic",
      "Fearless risk-taker across daily soaps, edgy feature films, and OTT platforms"
    ],
    currentLifeReality2026: "Joint Managing Director of Balaji Telefilms, producing blockbuster films (Dream Girl 2, Crew) and OTT content.",
    currentAcuteChallenge: "Navigating changing regulatory frameworks for digital streaming platforms and adapting long-form television to changing viewer attention."
  },

  // 4. SHILPA SHETTY
  {
    id: "shilpa-shetty",
    name: "Shilpa Shetty Kundra",
    publicRole: "Bollywood Actress, Fitness Entrepreneur & Big Brother Winner",
    category: "cinema_superstar",
    birthDate: "1975-06-08",
    birthTime: "05:30",
    latitude: 12.9141,
    longitude: 74.8560, // Mangalore, Karnataka
    gender: "Female",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["creative_media", "business_realestate"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["reputation_crisis_phoenix_brand_revival", "creative_media_stardom"],
    knownGemstonesWorn: ["Emerald (Panna) on little finger"],
    gemstoneImpactDescription: "Her mother Sunanda Shetty gifted her an energized Emerald ring for her little finger; within months, she entered Celebrity Big Brother UK (2007) and won it, sparking a global career turnaround.",
    catalysts: {
      hasNameOrSpellingChange: false,
      nameChangeDetails: "Added Kundra post-marriage, maintained core brand Shilpa Shetty.",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Married Raj Kundra in Nov 2009; ventured into IPL franchise ownership, hospitality, wellness, and real estate investments.",
      hasDaughterBhagya: true,
      daughterBhagyaDetails: "Welcomed daughter Samisha in Feb 2020 via surrogacy; celebrated her arrival as Goddess Lakshmi bringing immense light during difficult family phases.",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Exemplary grace under pressure, infectious positivity, and discipline",
      "Pioneered yoga, wellness, and healthy cooking books in mainstream Bollywood",
      "Remarkable resilience in the face of public controversies and trials"
    ],
    currentLifeReality2026: "Active judge on top dance reality shows, running her successful fitness app, acting in streaming series (Indian Police Force) and cinema.",
    currentAcuteChallenge: "Weathered severe public scrutiny and legal stress during husband's 2021 controversy, successfully shielding her children and brand."
  },

  // 5. KAREENA KAPOOR KHAN
  {
    id: "kareena-kapoor",
    name: "Kareena Kapoor Khan",
    publicRole: "Iconic Bollywood Actress across 25+ Years & Style Trendsetter",
    category: "cinema_superstar",
    birthDate: "1980-09-21",
    birthTime: "14:00",
    latitude: 18.9220,
    longitude: 72.8347, // Mumbai, India
    gender: "Female",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["creative_media"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["creative_media_stardom"],
    knownGemstonesWorn: ["Red Coral (Havala / Moonga)", "Yellow Sapphire (Pushparaga)"],
    gemstoneImpactDescription: "Wears Red Coral (Havala) and Yellow Sapphire rings based on astrological guidance to harness Mars and Jupiter for career longevity and stability.",
    catalysts: {
      hasNameOrSpellingChange: true,
      nameChangeDetails: "Added 'Khan' to her public name post-marriage, solidifying her royal Pataudi connection while sustaining her own mega-stardom.",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Married Saif Ali Khan in Oct 2012; shattered industry stereotypes by remaining an A-list heroine post-marriage and motherhood.",
      hasDaughterBhagya: false,
      daughterBhagyaDetails: "Mother of two sons (Taimur & Jeh).",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Effortless natural charisma, spontaneous acting brilliance without overthinking",
      "Unapologetic authenticity, fiercely proud of her Kapoor family acting lineage",
      "Trendsetter who normalized pregnancy fashion and working through motherhood"
    ],
    currentLifeReality2026: "Delivering massive box office hits (Crew) and critically acclaimed performances (Jaane Jaan, The Buckingham Murders); producer.",
    currentAcuteChallenge: "Balancing intense acting/producing schedules with demanding family life and constant media paparazzi attention on her children."
  },

  // 6. AISHWARYA RAI BACHCHAN
  {
    id: "aishwarya-rai",
    name: "Aishwarya Rai Bachchan",
    publicRole: "Global Icon, Miss World 1994 & International Film Star",
    category: "cinema_superstar",
    birthDate: "1973-11-01",
    birthTime: "11:05",
    latitude: 12.9141,
    longitude: 74.8560, // Mangalore, Karnataka
    gender: "Female",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["creative_media"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["creative_media_stardom"],
    knownGemstonesWorn: ["Diamond / Opal", "Yellow Sapphire (Pushparaga)"],
    gemstoneImpactDescription: "Wears diamond and sapphire rings; performed sacred Kumbha Vivaha / Kuja shanti remedies prior to marriage in 2007 to mitigate severe Manglik dosha.",
    catalysts: {
      hasNameOrSpellingChange: true,
      nameChangeDetails: "Added 'Bachchan' to her name following marriage to Abhishek Bachchan in April 2007.",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Marriage into Indian cinema's royal Bachchan family cemented her status as an enduring cultural ambassador.",
      hasDaughterBhagya: true,
      daughterBhagyaDetails: "Daughter Aaradhya born in Nov 2011; proved to be her ultimate life turning point, shifting her focus from ceaseless commercial films to devoted motherhood and select auteur cinema.",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Incredible dignity, poise, and cultural grace on the world stage for three decades",
      "Intensely private and fiercely protective of her daughter and family",
      "Stunning screen presence with unmatched classical dance mastery"
    ],
    currentLifeReality2026: "Acclaimed for her majestic performance as Nandini in Mani Ratnam's Ponniyin Selvan I & II; Cannes Film Festival regular; focusing on family.",
    currentAcuteChallenge: "Dealing with recurring tabloid rumors regarding family dynamics and health of aging parents while maintaining complete public silence."
  },

  // 7. RAJINIKANTH (SHIVAJI RAO GAEKWAD)
  {
    id: "rajinikanth",
    name: "Rajinikanth (Shivaji Rao Gaekwad)",
    publicRole: "Megastar / Thalaiva of Indian Cinema & Cultural Phenomenon",
    category: "cinema_superstar",
    birthDate: "1950-12-12",
    birthTime: "23:54",
    latitude: 12.9716,
    longitude: 77.5946, // Bangalore, Karnataka
    gender: "Male",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["creative_media"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["name_vibration_unbroken_hit_streak", "creative_media_stardom"],
    knownGemstonesWorn: ["Blue Sapphire (Neelam)", "Red Coral (Havala)", "Sphatika & Rudraksha Malas"],
    gemstoneImpactDescription: "Wears blue sapphire and coral alongside sacred rudraksha and sphatika malas; deeply devoted to Mahavatar Babaji and spiritual penance in the Himalayas.",
    catalysts: {
      hasNameOrSpellingChange: true,
      nameChangeDetails: "Born Shivaji Rao Gaekwad; director K. Balachander renamed him 'Rajinikanth' (Night Lord) in 1975, which miraculously sparked one of the greatest film careers in Asian history.",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Married Latha Rangachari in Feb 1981, which provided emotional stability and discipline after turbulent early years.",
      hasDaughterBhagya: true,
      daughterBhagyaDetails: "Father to two accomplished daughters (Aishwarya & Soundarya), both of whom directed him in landmark films (3, Kochadaiiyaan, Lal Salaam).",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Unmatched humility in real life contrasted with volcanic screen charisma and style",
      "Deep spiritual seeker who regularly retreats to Himalayan caves for meditation",
      "Generous philanthropist who avoids political vanity and stays true to cinema"
    ],
    currentLifeReality2026: "Delivering massive worldwide box office triumphs (Jailer, Vettaiyan, Coolie) in his 70s; undisputed king of mass entertainment.",
    currentAcuteChallenge: "Managing physical vitality and stamina post-2011 kidney transplant while shooting high-octane action sequences."
  },

  // 8. DHANUSH (VENKATESH PRABHU)
  {
    id: "dhanush",
    name: "Dhanush (Venkatesh Prabhu)",
    publicRole: "Four-Time National Award-Winning Actor, Director, Lyricist & Singer",
    category: "cinema_superstar",
    birthDate: "1983-07-28",
    birthTime: "10:20",
    latitude: 13.0827,
    longitude: 80.2707, // Chennai, Tamil Nadu
    gender: "Male",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["creative_media"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["creative_media_stardom", "post_divorce_rebuilding"],
    knownGemstonesWorn: ["Gemstone Ring", "Rudraksha Beads"],
    gemstoneImpactDescription: "Wears sacred rudraksha and astrological rings for creative focus, vocal modulation, and protection against competitive jealousy.",
    catalysts: {
      hasNameOrSpellingChange: true,
      nameChangeDetails: "Born Venkatesh Prabhu Kasthuri Raja; changed his name to 'Dhanush' inspired by a film title, which unlocked his national and Hollywood breakthrough (The Gray Man).",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Married Aishwarya Rajinikanth in Nov 2004 (separated in 2022); marriage established high status and family support during his formative creative rise.",
      hasDaughterBhagya: false,
      daughterBhagyaDetails: "Father to two sons (Yatra & Linga).",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Intensely committed actor capable of both grounded realism (Asuran, Aadukalam) and commercial flair",
      "Prolific multi-hyphenate: writer, director, lyricist, and global viral singer (Kolaveri Di)",
      "Tenacious underdog spirit who overcame initial industry mockery through raw craft"
    ],
    currentLifeReality2026: "Directed and acted in his 50th film milestone (Raayan), directing youth romances, actively filming major projects across Tamil and Hindi cinema.",
    currentAcuteChallenge: "Navigating life after his 2022 marital separation and handling public copyright disputes with co-stars while maintaining rapid production output."
  },

  // 9. AJAY DEVGN (VISHAL DEVGAN)
  {
    id: "ajay-devgn",
    name: "Ajay Devgn (Vishal Devgan)",
    publicRole: "Four-Time National Award Actor, Blockbuster Director & Producer",
    category: "cinema_superstar",
    birthDate: "1969-04-02",
    birthTime: "13:40",
    latitude: 28.6139,
    longitude: 77.2090, // New Delhi, India
    gender: "Male",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["creative_media", "business_realestate"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["name_vibration_unbroken_hit_streak", "creative_media_stardom"],
    knownGemstonesWorn: ["Yellow Sapphire (Pukhraj)", "Natural Pearl (Mukta)"],
    gemstoneImpactDescription: "Wears yellow sapphire and natural pearl rings on hands to balance intense Mars energy and attract steady financial success.",
    catalysts: {
      hasNameOrSpellingChange: true,
      nameChangeDetails: "Born Vishal Devgan; changed screen name to Ajay Devgn, and in 2009 famously dropped the 'a' to become 'Devgn' on numerology advice! This 2009 shift triggered 15 straight years of mega-franchise hits (Golmaal 3, Singham, Drishyam, Tanhaji).",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Married superstar actress Kajol in Feb 1999; their complementary temperaments created one of Hindi cinema's most respected and stable power marriages.",
      hasDaughterBhagya: true,
      daughterBhagyaDetails: "Daughter Nysa born in April 2003; fatherhood grounded his risk-taking and initiated his transition into successful studio producer and director (NY VFXWaala).",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Intense brooding eyes, minimal words, exceptional action timing and deadpan comedic genius",
      "Pioneer in high-end VFX infrastructure and multiplex cinema exhibition chains (NY Cinemas)",
      "Staunchly private family man who shuns Bollywood parties and social gossip"
    ],
    currentLifeReality2026: "Massive box office juggernaut (Singham Again, Drishyam series, Shaitaan, Maidaan); running India's top VFX and production houses.",
    currentAcuteChallenge: "High capital commitments in cinema exhibition and VFX scaling in a volatile market."
  },

  // 10. HRITHIK ROSHAN
  {
    id: "hrithik-roshan",
    name: "Hrithik Roshan",
    publicRole: "Bollywood Superstar, Iconic Dancer & Fitness Icon",
    category: "cinema_superstar",
    birthDate: "1974-01-10",
    birthTime: "03:30",
    latitude: 18.9220,
    longitude: 72.8347, // Mumbai, India
    gender: "Male",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["creative_media"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["post_accident_surgery_miracle_comeback", "creative_media_stardom"],
    knownGemstonesWorn: ["Ruby (Manikya)", "Emerald (Panna)"],
    gemstoneImpactDescription: "Wears ruby and emerald rings to strengthen vitality, speech expression, and nerve-tissue resilience.",
    catalysts: {
      hasNameOrSpellingChange: false,
      nameChangeDetails: "Retained birth name with unique spelling.",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Married childhood sweetheart Sussanne Khan in Dec 2000; their divorce in 2014 was handled with exemplary mutual respect and co-parenting.",
      hasDaughterBhagya: false,
      daughterBhagyaDetails: "Father to two sons (Hrehaan & Hridhaan).",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Physical double thumb on right hand (Anga Lakshana), regarded as a sacred lucky blessing",
      "Overcame severe childhood stammer and spinal scoliosis through monumental discipline",
      "World-class athletic perfectionist in choreography and action execution"
    ],
    currentLifeReality2026: "Delivering massive action spectacles (War, Fighter); filming War 2; co-founder of the global HRX fitness apparel brand.",
    currentAcuteChallenge: "Miraculously recovered from emergency brain surgery (subdural hematoma) in 2013 and multiple joint injuries, requiring perpetual physical therapy."
  },

  // 11. ANUSHKA SHARMA
  {
    id: "anushka-sharma",
    name: "Anushka Sharma",
    publicRole: "Acclaimed Actress, Visionary Producer (Clean Slate Filmz) & Power Icon",
    category: "cinema_superstar",
    birthDate: "1988-05-01",
    birthTime: "12:45",
    latitude: 26.7922,
    longitude: 82.1998, // Ayodhya, Uttar Pradesh
    gender: "Female",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["creative_media", "business_realestate"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["transcontinental_relocation_cultural_establishment", "creative_media_stardom"],
    knownGemstonesWorn: ["Sacred Gemstone Pendants", "Protective Amulet Bands"],
    gemstoneImpactDescription: "Wears delicate energised gemstone pendants; deeply invested in Vedic spiritual visits (Neem Karoli Baba ashram, Vrindavan, Ujjain).",
    catalysts: {
      hasNameOrSpellingChange: true,
      nameChangeDetails: "Public persona unified under 'Virushka' power brand.",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Married Virat Kohli in Dec 2017; their mutual spiritual grounding helped them weather public storms and establish immense personal peace.",
      hasDaughterBhagya: true,
      daughterBhagyaDetails: "Welcomed daughter Vamika in Jan 2021; welcomed son Akaay in Feb 2024; prioritized sacred domestic privacy and motherhood above all film offers.",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Fiercely honest, independent, and ethical with zero tolerance for pretense or sycophancy",
      "Pioneered genre-defying feminist cinema production (NH10, Pari, Bulbbul, Paatal Lok)",
      "Uncompromising dedication to animal welfare, vegetarianism, and spiritual tranquility"
    ],
    currentLifeReality2026: "Living predominantly between London and Mumbai, focusing on raising her young children in peace while awaiting release of Chakda 'Xpress.",
    currentAcuteChallenge: "Navigating prolonged international relocation, fiercely guarding family privacy from invasive Indian media culture."
  },

  // 12. MS DHONI
  {
    id: "ms-dhoni",
    name: "Mahendra Singh Dhoni (MS Dhoni)",
    publicRole: "Iconic World Cup Captain, 5-Time IPL Champion & Cricket Legend",
    category: "sports_legend",
    birthDate: "1981-07-07",
    birthTime: "11:15",
    latitude: 23.3441,
    longitude: 85.3096, // Ranchi, Jharkhand
    gender: "Male",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["sports_athletics", "business_realestate"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["legendary_transition_mentor_elderhood", "elite_sports_athletic_triumph"],
    knownGemstonesWorn: ["Protective Wrist Cords", "Sacred Rudraksha"],
    gemstoneImpactDescription: "Wears sacred protective threads and rudraksha; renowned for numerology connection with #7 (born on 7th day of 7th month).",
    catalysts: {
      hasNameOrSpellingChange: false,
      nameChangeDetails: "Built immortal national brand 'MSD / Thala' around Jersey #7.",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Married Sakshi Singh Rawat on July 4, 2010; exactly 9 months later, he struck the winning six to lift the ICC Cricket World Cup on April 2, 2011!",
      hasDaughterBhagya: true,
      daughterBhagyaDetails: "Daughter Ziva born in Feb 2015 during 2015 World Cup; his devotion to national duty ('I am on national duty, other things can wait') followed by Ziva's presence became his beloved lucky charm.",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Legendary 'Captain Cool' equanimity; immune to extreme highs of victory and lows of defeat",
      "Uncanny lightning-fast tactical instincts behind the stumps and finishing matches under maximum pressure",
      "Deeply humble connection to rural roots, farming, army parachute regiment, and family"
    ],
    currentLifeReality2026: "Cherished spiritual and tactical mentor of Chennai Super Kings (CSK); leading organic farming and production house ventures; revered elder statesman of Indian sports.",
    currentAcuteChallenge: "Managing knee cartilage wear and recovery post-2023 arthroscopy surgery while fulfilling IPL tournament commitments."
  },

  // 13. RISHABH PANT
  {
    id: "rishabh-pant",
    name: "Rishabh Pant",
    publicRole: "Match-Winning Wicketkeeper-Batsman, Gabba Hero & T20 World Cup Champion",
    category: "sports_legend",
    birthDate: "1997-10-04",
    birthTime: "12:10",
    latitude: 29.8543,
    longitude: 77.8880, // Roorkee, Uttarakhand
    gender: "Male",
    maritalStatusInput: "unmarried",
    hasChildren: false,
    expectedCareerCodes: ["sports_athletics"],
    expectedMarriageVerdict: "delayed_marriage",
    expectedLifeCategories: ["post_accident_surgery_miracle_comeback", "elite_sports_athletic_triumph"],
    knownGemstonesWorn: ["Gemstone Ring", "Sacred Red Thread / Raksha Sutra"],
    gemstoneImpactDescription: "Wears energized protective red thread and gemstone ring; credited divine grace and temple visits (Badrinath, Kedarnath) for saving his life.",
    catalysts: {
      hasNameOrSpellingChange: false,
      nameChangeDetails: "Maintained original identity; celebrated as an instinctive, fearless match-winner.",
      hasMarriageBhagya: false,
      marriageBhagyaDetails: "Unmarried, laser-focused on athletic rehabilitation and cricket leadership.",
      hasDaughterBhagya: false,
      daughterBhagyaDetails: "No children.",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Extraordinary mental resilience and boundless cheerfulness even in life-or-death crises",
      "Unorthodox, audacious batting genius who changes test matches in a single session",
      "Deeply affectionate and loyal to teammates and mentors"
    ],
    currentLifeReality2026: "Survived a horrific near-fatal car crash in Dec 2022; underwent complete knee ligament reconstruction; made a miraculous comeback in IPL 2024 and won the T20 World Cup 2024 with India.",
    currentAcuteChallenge: "Continuous athletic rehabilitation to protect repaired knee joints while fulfilling grueling test cricket wicketkeeping demands."
  },

  // 14. SOURAV GANGULY
  {
    id: "sourav-ganguly",
    name: "Sourav Ganguly",
    publicRole: "Former Indian Captain ('Dada'), BCCI President & Legendary Leader",
    category: "sports_legend",
    birthDate: "1972-07-08",
    birthTime: "08:36",
    latitude: 22.5726,
    longitude: 88.3639, // Kolkata, West Bengal
    gender: "Male",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["sports_athletics", "business_realestate"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["legendary_transition_mentor_elderhood", "elite_sports_athletic_triumph", "leadership_expansion_scaling"],
    knownGemstonesWorn: ["Yellow Sapphire (Pukhraj)", "Red Coral (Havala)"],
    gemstoneImpactDescription: "Famously wears large Yellow Sapphire and Red Coral rings to strengthen Mars and Jupiter, ward off controversies, and command fearless leadership.",
    catalysts: {
      hasNameOrSpellingChange: false,
      nameChangeDetails: "Maintained birth name; celebrated as the 'Prince of Kolkata' and 'Dada'.",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Eloped and married classical dancer Dona Roy in Feb 1997; marriage resolved family feuds and kicked off his greatest phase as India's revolutionary captain.",
      hasDaughterBhagya: true,
      daughterBhagyaDetails: "Daughter Sana born in Nov 2001; coincided with India's historic resurgence (Eden Gardens victory, NatWest 2002, 2003 World Cup finals).",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Fierce, unapologetic leadership that backed youngsters and taught Indian cricket to win overseas",
      "Aristocratic dignity, astute administrative acumen, and passionate emotional expressiveness",
      "Resilient fighter who made one of international cricket's greatest comebacks in 2006-2007"
    ],
    currentLifeReality2026: "Director of Cricket for IPL franchises, leading corporate boards, media commentator and administrative elder statesman.",
    currentAcuteChallenge: "Managing cardiovascular health following 2021 coronary angioplasty while maintaining intense corporate schedules."
  },

  // 15. SMRITI MANDHANA
  {
    id: "smriti-mandhana",
    name: "Smriti Mandhana",
    publicRole: "World #1 Batter in Women's Cricket & Historic RCB WPL Title Captain",
    category: "sports_legend",
    birthDate: "1996-07-18",
    birthTime: "07:30",
    latitude: 18.9220,
    longitude: 72.8347, // Mumbai, Maharashtra
    gender: "Female",
    maritalStatusInput: "unmarried",
    hasChildren: false,
    expectedCareerCodes: ["sports_athletics", "creative_media"],
    expectedMarriageVerdict: "delayed_marriage",
    expectedLifeCategories: ["elite_sports_athletic_triumph", "marriage_delay"],
    knownGemstonesWorn: ["Lucky Band", "Sacred Wrist Thread"],
    gemstoneImpactDescription: "Wears lucky band and sacred protective wrist threads for batting focus and injury prevention.",
    catalysts: {
      hasNameOrSpellingChange: false,
      nameChangeDetails: "Retained birth name; premier global face of women's cricket.",
      hasMarriageBhagya: false,
      marriageBhagyaDetails: "Unmarried, devoted entirely to leading national team and franchises.",
      hasDaughterBhagya: false,
      daughterBhagyaDetails: "No children.",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Silky-smooth, elegant left-handed strokeplay evoking comparisons with Sourav Ganguly and Kumar Sangakkara",
      "Calm, inclusive leadership style that inspired RCB Women to their maiden WPL title in March 2024",
      "Modest, focused, and deeply dedicated to raising the profile of women's sports globally"
    ],
    currentLifeReality2026: "Pinnacle of international women's cricket; ICC Women's Cricketer of the Year; leading Team India and Royal Challengers Bangalore.",
    currentAcuteChallenge: "Handling heavy international schedule, managing batting consistency under intense public expectations for World Cup silverware."
  },

  // 16. SUNIL CHHETRI
  {
    id: "sunil-chhetri",
    name: "Sunil Chhetri",
    publicRole: "India's Greatest Football Captain, 94 International Goals & Sporting Legend",
    category: "sports_legend",
    birthDate: "1984-08-03",
    birthTime: "10:45",
    latitude: 17.4399,
    longitude: 78.4983, // Secunderabad, Telangana
    gender: "Male",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["sports_athletics"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["legendary_transition_mentor_elderhood", "elite_sports_athletic_triumph"],
    knownGemstonesWorn: ["Protective Band"],
    gemstoneImpactDescription: "Wears protective wrist bands and maintains ascetic physical fitness routines.",
    catalysts: {
      hasNameOrSpellingChange: false,
      nameChangeDetails: "Iconic national leader celebrated as 'Captain, Leader, Legend'.",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Married Sonam Bhattacharya in Dec 2017 after a 13-year courtship; marriage provided a rock-solid emotional foundation for his longevity.",
      hasDaughterBhagya: false,
      daughterBhagyaDetails: "Welcomed baby son Dhruv in Aug 2023.",
      hasGemstoneShift: false
    },
    personalityCharacteristics: [
      "Phenomenal professionalism, strict fitness regimen rivaling international elite athletes into his 40s",
      "Passionate national patriot whose emotional plea in 2018 filled Indian football stadiums",
      "Selfless mentor who groomed multiple generations of Indian footballers"
    ],
    currentLifeReality2026: "Retired from international football in June 2024 with an emotional standing ovation at Salt Lake Stadium; continuing as Bengaluru FC talisman.",
    currentAcuteChallenge: "Transitioning away from the frontline national team jersey into club leadership and sports mentoring."
  },

  // 17. SONU NIGAM
  {
    id: "sonu-nigam",
    name: "Sonu Nigam",
    publicRole: "Master Playback Singer, National Award Winner & Padma Shri 2022",
    category: "cultural_maestro",
    birthDate: "1973-07-30",
    birthTime: "05:45",
    latitude: 28.4089,
    longitude: 77.3178, // Faridabad, Haryana
    gender: "Male",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["creative_media"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["creative_media_stardom"],
    knownGemstonesWorn: ["Red Coral (Havala)", "Natural Pearl (Mukta)"],
    gemstoneImpactDescription: "Wears Red Coral (Havala) and Pearl rings to harmonize intense Mars-Moon energy and protect his vocal apparatus and emotional balance.",
    catalysts: {
      hasNameOrSpellingChange: true,
      nameChangeDetails: "Experimented with numerology spelling 'Sonu Niigaam' in the early 2000s (Kal Ho Naa Ho era), later reverted to original spelling 'Sonu Nigam' with enriched spiritual peace.",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Married Madhurima Mishra in Feb 2002; celebrated two decades of partnership.",
      hasDaughterBhagya: false,
      daughterBhagyaDetails: "Father to son Nevaan Nigam.",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Peerless vocal versatility, pitch perfection, and emotional nuance across 30+ languages",
      "Fiercely outspoken, stands by his principles even when facing media boycotts",
      "Spiritual devotee who views music as direct divine sadhana"
    ],
    currentLifeReality2026: "Selling out global arena concert tours across Europe, US, Middle East; awarded Padma Shri in 2022 and National Film Award for Laal Singh Chaddha.",
    currentAcuteChallenge: "Vocal health preservation against endless travel and high-altitude concerts; navigating industry music label politics."
  },

  // 18. MADHURI DIXIT NENE
  {
    id: "madhuri-dixit",
    name: "Madhuri Dixit Nene",
    publicRole: "Iconic Bollywood Actress, Kathak Maestro & Cultural Symbol",
    category: "cinema_superstar",
    birthDate: "1967-05-15",
    birthTime: "18:15",
    latitude: 18.9220,
    longitude: 72.8347, // Mumbai, Maharashtra
    gender: "Female",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["creative_media"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["transcontinental_relocation_cultural_establishment", "creative_media_stardom"],
    knownGemstonesWorn: ["Emerald (Panna)", "Diamond (Vajra)"],
    gemstoneImpactDescription: "Wears emerald and diamond/white zircon to enhance Venus and Mercury benefic power for artistic rhythm and enduring elegance.",
    catalysts: {
      hasNameOrSpellingChange: true,
      nameChangeDetails: "Adopted 'Madhuri Dixit Nene' post-marriage.",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Married cardiovascular surgeon Dr. Shriram Nene in Oct 1999 and relocated to Denver, USA; step back from Bollywood gave her complete domestic fulfillment, enabling a triumphant second innings in India in 2011.",
      hasDaughterBhagya: false,
      daughterBhagyaDetails: "Mother to two sons (Arin & Ryan).",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Mesmerizing, expressive Kathak dance artistry and unforgettable smile that defined an era",
      "Seamlessly balanced world-class superstardom with grounded domestic life as a mother and wife",
      "Empowering mentor who created online dance academies and produces progressive films"
    ],
    currentLifeReality2026: "Premier dance reality television judge, starring in critically acclaimed streaming dramas (The Fame Game) and running her production company (RnM Moving Images).",
    currentAcuteChallenge: "Balancing production studio obligations with extensive transcontinental family connections in the US."
  },

  // 19. AYUSHMANN KHURRANA
  {
    id: "ayushmann-khurrana",
    name: "Ayushmann Khurrana",
    publicRole: "National Award Actor, Singer & Pioneer of Progressive Social Cinema",
    category: "cinema_superstar",
    birthDate: "1984-09-14",
    birthTime: "09:30",
    latitude: 30.7333,
    longitude: 76.7794, // Chandigarh, Punjab
    gender: "Male",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["creative_media"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["name_vibration_unbroken_hit_streak", "creative_media_stardom"],
    knownGemstonesWorn: ["Emerald (Panna)", "Blue Sapphire (Neelam)"],
    gemstoneImpactDescription: "Wears emerald and sapphire rings on fingers; father P. Khurrana was a renowned astrologer and author who actively guided his astrological and gemstone alignment.",
    catalysts: {
      hasNameOrSpellingChange: true,
      nameChangeDetails: "Born Nishant Khurrana; parents renamed him Ayushman Khurana; later his astrologer father famously added an extra 'n' and 'r' to spell 'Ayushmann Khurrana'! This exact spelling shift launched an extraordinary streak of 8 consecutive critical and commercial blockbusters (Vicky Donor, Andhadhun, Badhaai Ho, Article 15, Bala).",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Married childhood sweetheart Tahira Kashyap in Nov 2008; their mutual courage while battling Tahira's breast cancer inspired millions nationwide.",
      hasDaughterBhagya: true,
      daughterBhagyaDetails: "Daughter Varushka born in 2014 alongside son Virajveer; fatherhood inspired his deepest artistic breakthroughs.",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Courage to choose taboo, socially transformative subjects that redefine mainstream cinema",
      "Soulful playback singer and acoustic guitarist (Pani Da Rang, Saadi Galli Aaja)",
      "Deeply intellectual, poetic writer and theater practitioner"
    ],
    currentLifeReality2026: "Leading Bollywood star; TIME 100 Most Influential Person; UNICEF National Ambassador for child rights; touring internationally with his band.",
    currentAcuteChallenge: "Coping with the passing of his beloved astrologer father P. Khurrana in 2023 and revitalizing the mid-budget social cinema genre in theaters."
  },

  // 20. ROHIT SHETTY
  {
    id: "rohit-shetty",
    name: "Rohit Shetty",
    publicRole: "Director of the Billion-Rupee Cop Universe & Highest-Grossing Action Filmmaker",
    category: "cinema_superstar",
    birthDate: "1974-03-14",
    birthTime: "03:30",
    latitude: 18.9220,
    longitude: 72.8347, // Mumbai, Maharashtra
    gender: "Male",
    maritalStatusInput: "married",
    hasChildren: true,
    expectedCareerCodes: ["creative_media", "business_realestate"],
    expectedMarriageVerdict: "already_married",
    expectedLifeCategories: ["post_accident_surgery_miracle_comeback", "creative_media_stardom"],
    knownGemstonesWorn: ["Yellow Sapphire (Pukhraj)", "Cat's Eye (Vaidurya)"],
    gemstoneImpactDescription: "Wears Yellow Sapphire (Pukhraj) and Cat's Eye (Vaidurya) rings to harness Jupiter for expansive film scale and ward off Ketu hazards during explosive stunt shoots.",
    catalysts: {
      hasNameOrSpellingChange: false,
      nameChangeDetails: "Built Indian cinema's most lucrative directorial brand 'Rohit Shetty Picturez'.",
      hasMarriageBhagya: true,
      marriageBhagyaDetails: "Married Maya More in May 2005; right after marriage, he directed Golmaal: Fun Unlimited (2006) which initiated an unprecedented multi-decade comedy and action empire.",
      hasDaughterBhagya: false,
      daughterBhagyaDetails: "Father to son Ishaan Shetty.",
      hasGemstoneShift: true
    },
    personalityCharacteristics: [
      "Staggering work ethic rising from Rs 35/day assistant director and body double to India's #1 commercial director",
      "Pioneered cinematic vehicular stunts, explosive action choreography, and clean family comedy",
      "Fiercely loyal to his technical crew and stunt performers, providing comprehensive insurance and support"
    ],
    currentLifeReality2026: "Heads Bollywood's monumental Cop Universe (Singham Again); host of Khatron Ke Khiladi; producing streaming series and film franchises.",
    currentAcuteChallenge: "Suffered severe hand lacerations and emergency surgery on the sets of Indian Police Force in Jan 2023, miraculously returning to the set within 12 hours."
  }
];

export const BENCHMARK_PROFILES_20_FRESH = TWENTY_FRESH_BENCHMARKS;
