import type { AccurateProfessionCode } from "../core/CurrentLifeAndCareerDiagnosticEngine";

export interface BenchmarkProfile25 {
  id: string;
  name: string;
  category: "criminal_scam" | "trial_lawyer" | "celebrity_sports" | "visionary_leader" | "normal_citizen";
  expectedRole: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  gender: "Male" | "Female";
  maritalStatus?: "married" | "unmarried" | "separated" | "divorced";
  expectedCareerCode: AccurateProfessionCode;
  expectedInterestFields: string[];
  negativeShadeScoreRange: [number, number];
  expectedDim1Risk: boolean; // Affairs / Sensual Transgression
  expectedDim2Risk: boolean; // Theft / Scam / Embezzlement
  expectedDim3Risk: boolean; // Violence / Murder / Physical Assault
  expectedDim4Risk: boolean; // Legal Bandhana / Prison / Custody
  expectedSecrecyType: "kullam_kulla" | "pragmatic_discretion" | "diplomatic_mask" | "deep_vault";
  expectedIsTeetotaler?: boolean;
  expectedHighFidelity?: boolean;
  expectedMultipleRelRisk?: boolean;
  
  // Real-world ground truth documentation
  currentLifeReality2026: string;
  wivesCount: string;
  affairsStatus: string;
  criminalStatus: string;
  theftScamStatus: string;
  murderViolenceStatus: string;
  secrecyStatus: string;
}

export const BENCHMARK_25_PROFILES: BenchmarkProfile25[] = [
  // =========================================================================
  // 1. CRIMINALS, SCAMMERS, MURDERERS & PRISON SENTENCES (5 PROFILES)
  // =========================================================================
  {
    id: "bernie-madoff",
    name: "Bernie Madoff",
    category: "criminal_scam",
    expectedRole: "Wall Street Securities Chairman / $65B Ponzi Swindler / 150-Yr Prison Sentence",
    birthDate: "1938-04-29",
    birthTime: "13:40",
    latitude: 40.7282,
    longitude: -73.7949, // Queens, NY (Rodden Rating AA)
    gender: "Male",
    maritalStatus: "married",
    expectedCareerCode: "banking_finance",
    expectedInterestFields: [
      "Investment Fund Management",
      "Stock Market Trading",
      "Securities Exchange",
      "Asset Management",
      "Hedge Funds"
    ],
    negativeShadeScoreRange: [40, 85],
    expectedDim1Risk: false,
    expectedDim2Risk: true,  // $64.8B Ponzi fraud & embezzlement
    expectedDim3Risk: false,
    expectedDim4Risk: true,  // 150-year federal prison sentence; died in federal prison
    expectedSecrecyType: "deep_vault", // Wore an elite social mask, secretly hid $65B Ponzi for decades without telling family
    currentLifeReality2026: "Operated the largest Ponzi scheme in world history ($64.8 Billion). Pleaded guilty to 11 federal felony charges in 2009. Sentenced to 150 years federal prison, where he died in custody in April 2021.",
    wivesCount: "1 wife (Ruth Alpern Madoff, married 1959 until his death)",
    affairsStatus: "One known long-term extramarital affair (Sheryl Weinstein), but primarily financial obsession.",
    criminalStatus: "Convicted federal felon (11 counts including securities fraud, wire fraud, money laundering, theft).",
    theftScamStatus: "Massive $64.8 Billion Ponzi swindle; biggest financial fraud in human history.",
    murderViolenceStatus: "Zero physical murder/violence, but indirect devastation led to multiple investor suicides and his eldest son Mark's suicide.",
    secrecyStatus: "Deep Emotional Vault / Covert Mask: Kept the Ponzi scheme completely hidden inside for decades, maintaining a respected country-club facade; confessed only on the brink of total collapse."
  },
  {
    id: "ted-bundy",
    name: "Ted Bundy",
    category: "criminal_scam",
    expectedRole: "American Serial Killer / Law Student & Courtroom Fighter / Executed in Electric Chair",
    birthDate: "1946-11-24",
    birthTime: "16:35",
    latitude: 44.4759,
    longitude: -73.2121, // Burlington, VT (Rodden Rating AA)
    gender: "Male",
    maritalStatus: "married",
    expectedCareerCode: "legal_judiciary", // Studied law at UPS Law School; acted as his own defense lawyer in capital trials
    expectedInterestFields: [
      "Criminal Defense Advocacy",
      "Courtroom Litigation",
      "Psychology & Criminology",
      "Trial Cross-Examination",
      "Legal Jurisprudence"
    ],
    negativeShadeScoreRange: [45, 95],
    expectedDim1Risk: true,
    expectedDim2Risk: false,
    expectedDim3Risk: true,  // Brutal kidnapping, rape, and homicide of 30+ young women
    expectedDim4Risk: true,  // Escaped custody twice; capital murder trials; death row; executed Jan 24, 1989
    expectedSecrecyType: "pragmatic_discretion", // Charismatic exterior / charming student facade hiding dark necrophilic serial murder urges
    currentLifeReality2026: "Infamous American serial killer executed in Florida electric chair on Jan 24, 1989 after confessing to 30 murders across 7 states.",
    wivesCount: "1 wife (Carole Ann Boone, married inside courtroom during trial, later divorced)",
    affairsStatus: "Promiscuous, highly deceitful; multiple concurrent girlfriends (Elizabeth Kendall) while committing murders.",
    criminalStatus: "Convicted serial killer, rapist, burglar; sentenced to death three times.",
    theftScamStatus: "Theft, burglary, vehicle theft, shoplifting during killing sprees.",
    murderViolenceStatus: "Extreme serial homicide; murdered at least 30 women with sadistic brutality.",
    secrecyStatus: "Deep Emotional Vault: Wore a polite, intelligent, civic-minded persona (volunteer crisis hotline operator) while concealing horrific urges and double life inside."
  },
  {
    id: "charles-manson",
    name: "Charles Manson",
    category: "criminal_scam",
    expectedRole: "Cult Demagogue / Tate-LaBianca Murder Conspirator / 45+ Years Incarceration",
    birthDate: "1934-11-12",
    birthTime: "16:40",
    latitude: 39.1031,
    longitude: -84.5120, // Cincinnati, OH (Rodden Rating AA)
    gender: "Male",
    maritalStatus: "separated",
    expectedCareerCode: "creative_media", // Musician, cult manipulator, media demagogue
    expectedInterestFields: [
      "Underground Music & Songwriting",
      "Mass Cult Leadership",
      "Psychological Hypnosis",
      "Media Demagoguery",
      "Subculture Manipulation"
    ],
    negativeShadeScoreRange: [45, 95],
    expectedDim1Risk: true,
    expectedDim2Risk: false,
    expectedDim3Risk: true,  // Instigated Tate-LaBianca murders (9 victims)
    expectedDim4Risk: true,  // Sentenced to death (commuted to life); imprisoned 46 years until death in 2017
    expectedSecrecyType: "kullam_kulla", // Brazen apocalyptic preaching; bizarre courtroom outbursts; carving swastika on forehead
    currentLifeReality2026: "Leader of the infamous Manson Family cult. Incarcerated continuously in Corcoran State Prison from 1971 until his death in November 2017.",
    wivesCount: "2 wives (Rosalie Willis, Candy Stevens; both divorced)",
    affairsStatus: "Polygamous cult harem with numerous female followers ('Family').",
    criminalStatus: "Convicted of first-degree murder and conspiracy to commit murder in 7 deaths.",
    theftScamStatus: "Lifelong record of car theft, armed robbery, forgery, and pimping.",
    murderViolenceStatus: "Mastermind and director of the horrific Tate-LaBianca murders.",
    secrecyStatus: "Brazen Candor / Kullam-Kulla: Boastful, provocative, and unapologetically radical in courtroom and televised interviews; zero conventional shame."
  },
  {
    id: "oj-simpson",
    name: "O.J. Simpson",
    category: "criminal_scam",
    expectedRole: "NFL Superstar & Heisman Winner / Double Murder Trial / 9 Years Armed Robbery Prison",
    birthDate: "1947-07-09",
    birthTime: "08:08",
    latitude: 37.7749,
    longitude: -122.4194, // San Francisco, CA (Rodden Rating AA)
    gender: "Male",
    maritalStatus: "separated",
    expectedCareerCode: "sports_athletics", // Legendary NFL Hall of Fame running back, Buffalo Bills MVP
    expectedInterestFields: [
      "Professional Football & NFL Athletics",
      "Competitive Sprinting & Physical Agility",
      "Sports Broadcasting & Media",
      "Athletic Celebrity Endorsements",
      "Championship Athletics"
    ],
    negativeShadeScoreRange: [40, 85],
    expectedDim1Risk: true,  // Infidelity, volatile marriages
    expectedDim2Risk: false,
    expectedDim3Risk: true,  // Domestic battery history, acquitted in double murder, civil wrongful death liability
    expectedDim4Risk: true,  // Convicted in 2008 of armed robbery & kidnapping; served 9 years in Lovelock Prison
    expectedSecrecyType: "deep_vault",
    currentLifeReality2026: "NFL Hall of Fame legend. Tried and acquitted for the 1994 murders of Nicole Brown Simpson and Ron Goldman; later convicted in 2008 for armed robbery and kidnapping; released on parole in 2017; died of cancer in April 2024.",
    wivesCount: "2 wives (Marguerite Whitley, Nicole Brown Simpson; both divorced)",
    affairsStatus: "Extensive extramarital liaisons and relationship volatility documented in court records.",
    criminalStatus: "Convicted of 12 felony counts (armed robbery, kidnapping) in Las Vegas; served 9 years in Nevada state prison.",
    theftScamStatus: "Armed robbery at gunpoint at Palace Station hotel room.",
    murderViolenceStatus: "Extensive history of domestic violence; found civilly liable for wrongful deaths of Nicole Brown and Ron Goldman ($33.5M judgment).",
    secrecyStatus: "Deep Emotional Vault: Charming public persona and broadcast smile masking boiling domestic rage and private turmoil."
  },
  {
    id: "darshan-thoogudeepa",
    name: "Darshan Thoogudeepa",
    category: "criminal_scam",
    expectedRole: "Kannada Cinema Superstar / Renukaswamy Murder Case / Judicial Custody",
    birthDate: "1977-02-16",
    birthTime: "12:00",
    latitude: 12.15,
    longitude: 75.93, // Ponnampet, Karnataka
    gender: "Male",
    maritalStatus: "married",
    expectedCareerCode: "creative_media", // Major film actor & producer
    expectedInterestFields: [
      "Cinema Acting & Mass Entertainment",
      "Film Production & Distribution",
      "Cinematic Action Choreography",
      "Celebrity Fan Base Leadership",
      "Media Stardom"
    ],
    negativeShadeScoreRange: [45, 90],
    expectedDim1Risk: true,  // Public extramarital relationship with Pavithra Gowda
    expectedDim2Risk: false,
    expectedDim3Risk: true,  // Alleged brutal torture and murder of fan Renukaswamy
    expectedDim4Risk: true,  // Arrested in June 2024, lodged in Parappana Agrahara / Bellary Central Jail
    expectedSecrecyType: "pragmatic_discretion",
    currentLifeReality2026: "Prominent Kannada film actor arrested by Bengaluru Police on June 11, 2024 for the alleged murder of Renukaswamy; remains under judicial trial and custody.",
    wivesCount: "1 lawful wife (Vijayalakshmi, married 2003)",
    affairsStatus: "High-profile long-term extramarital relationship with actress Pavithra Gowda, central to the 2024 murder case.",
    criminalStatus: "Under judicial custody in central jail facing murder, kidnapping, and criminal conspiracy charges.",
    theftScamStatus: "No direct theft/financial scam record.",
    murderViolenceStatus: "Accused in gruesome kidnapping, assault, and murder of Renukaswamy.",
    secrecyStatus: "Diplomatic Deflection: Used celebrity power, star influence, and private farmhouses to coordinate covert operations away from public scrutiny."
  },

  // =========================================================================
  // 2. TRIAL LAWYERS, LITIGATORS & COURT FIGHTERS (3 PROFILES)
  // =========================================================================
  {
    id: "johnnie-cochran",
    name: "Johnnie Cochran",
    category: "trial_lawyer",
    expectedRole: "Legendary American Trial Defense Attorney / 'Dream Team' Lead Counsel / O.J. Simpson Acquittal",
    birthDate: "1937-10-02",
    birthTime: "16:30",
    latitude: 32.5252,
    longitude: -93.7502, // Shreveport, LA (Rodden Rating AA)
    gender: "Male",
    maritalStatus: "married",
    expectedCareerCode: "legal_judiciary",
    expectedInterestFields: [
      "Criminal Defense Trial Advocacy",
      "Courtroom Cross-Examination",
      "Civil Rights & Police Brutality Litigation",
      "High-Stakes Constitutional Oratory",
      "Appellate & Jury Trial Strategy"
    ],
    negativeShadeScoreRange: [0, 25],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "diplomatic_mask",
    currentLifeReality2026: "Celebrated American defense attorney who led the 'Dream Team' defense in the 1995 O.J. Simpson murder trial ('If it doesn't fit, you must acquit'). Represented Michael Jackson, Tupac Shakur, and civil rights victims. Passed away in 2005.",
    wivesCount: "2 marriages (Barbara Jean Burrell, Sylvia Dale; one divorce)",
    affairsStatus: "Long-term relationship with Patricia Cochran (palimony suit), but no criminal or moral turpitude findings.",
    criminalStatus: "Clean record; licensed trial lawyer of highest professional stature; Deputy City Attorney.",
    theftScamStatus: "Clean record; renowned legal firm managing multi-million dollar tort awards.",
    murderViolenceStatus: "Zero violence; dedicated career to fighting police misconduct and constitutional violations.",
    secrecyStatus: "Deep Emotional Vault: Masterful courtroom dramatist who kept his personal strategies and private life tightly controlled behind professional charisma."
  },
  {
    id: "ruth-bader-ginsburg",
    name: "Ruth Bader Ginsburg",
    category: "trial_lawyer",
    expectedRole: "US Supreme Court Justice / Constitutional Jurisprudence Titan / Civil Rights Pioneer",
    birthDate: "1933-03-15",
    birthTime: "14:00",
    latitude: 40.6782,
    longitude: -73.9442, // Brooklyn, NY (Rodden Rating AA)
    gender: "Female",
    maritalStatus: "married",
    expectedCareerCode: "legal_judiciary",
    expectedInterestFields: [
      "Constitutional Jurisprudence & Appellate Law",
      "Gender Equality & Civil Rights Litigation",
      "Supreme Court Judicial Opinions",
      "Federal Statutory Interpretation",
      "Constitutional Advocacy"
    ],
    negativeShadeScoreRange: [0, 10],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "deep_vault",
    currentLifeReality2026: "Iconic Associate Justice of the US Supreme Court from 1993 until her passing in September 2020. Trailblazing advocate for gender equality and civil rights.",
    wivesCount: "1 husband (Martin D. Ginsburg, married 56 years until his death in 2010)",
    affairsStatus: "Lifelong loving fidelity; celebrated golden marriage with tax law professor Martin Ginsburg.",
    criminalStatus: "Impeccable civic record; highest judicial office in the United States.",
    theftScamStatus: "Zero financial wrongdoing; pristine fiduciary record.",
    murderViolenceStatus: "Dedicated entirely to non-violent constitutional jurisprudence and civil liberties.",
    secrecyStatus: "Open & Candid / Resolute Jurist: Articulated dissents with uncompromising moral clarity, fierce intellectual openness, and complete transparency."
  },
  {
    id: "ram-jethmalani",
    name: "Ram Jethmalani",
    category: "trial_lawyer",
    expectedRole: "India's Greatest Criminal Defense Jurist / Union Law Minister / Brazenly Candid Courtroom Titan",
    birthDate: "1923-09-14",
    birthTime: "08:30",
    latitude: 27.9575,
    longitude: 68.6378, // Shikarpur, Sindh (Publicly documented Rodden A)
    gender: "Male",
    maritalStatus: "married",
    expectedCareerCode: "legal_judiciary",
    expectedInterestFields: [
      "Criminal Defense Trial Advocacy",
      "Constitutional Law & Habeas Corpus",
      "Supreme Court Cross-Examination",
      "High-Profile Political Defense",
      "Parliamentary Jurisprudence"
    ],
    negativeShadeScoreRange: [0, 20],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "kullam_kulla", // Famously lived openly with two wives ('I have two wives and I am happy with both'); zero hypocrisy
    currentLifeReality2026: "Doyen of the Indian criminal bar, legendary defense counsel in landmark cases (Nanavati, Indira Gandhi assassination, Rajiv Gandhi case, Harshad Mehta, L.K. Advani). Former Union Law Minister and 6-term Rajya Sabha MP. Passed away in 2019 at age 95.",
    wivesCount: "2 wives (Durga and Ratna, both openly married and supported with full mutual harmony)",
    affairsStatus: "Zero covert infidelity; openly transparent about his personal life; completely rejected Victorian hypocrisy.",
    criminalStatus: "Impeccable legal standing; Chairman of the Bar Council of India.",
    theftScamStatus: "Zero financial embezzlement; highest earning criminal lawyer in Indian history.",
    murderViolenceStatus: "Fought fearlessly in courts against authoritarian state abuse and habeas corpus suspensions.",
    secrecyStatus: "Brazen Candor / Kullam-Kulla: Legendary for speaking raw, unfiltered truth to judges, prime ministers, and public media; hid nothing from the world."
  },

  // =========================================================================
  // 3. CELEBRITIES, SPORTS LEGENDS & POLITICS (7 PROFILES)
  // =========================================================================
  {
    id: "tiger-woods",
    name: "Tiger Woods",
    category: "celebrity_sports",
    expectedRole: "15-Time Major Golf Champion / Global Sports Icon / Infidelity Scandal",
    birthDate: "1975-12-30",
    birthTime: "22:50",
    latitude: 33.8045,
    longitude: -118.0648, // Cypress, CA (Rodden Rating AA)
    gender: "Male",
    maritalStatus: "divorced",
    expectedCareerCode: "sports_athletics",
    expectedInterestFields: [
      "PGA Championship Golf",
      "Precision Athletic Stroke Mechanics",
      "Elite Athletic Mental Focus",
      "Global Sports Franchise",
      "Athletic Course Architecture"
    ],
    negativeShadeScoreRange: [15, 45],
    expectedDim1Risk: true,  // Infamous 2009 extramarital infidelity scandal involving dozens of mistresses
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "pragmatic_discretion",
    currentLifeReality2026: "One of the greatest golfers in history, 15 Major championships, 82 PGA Tour victories. Overcame severe injuries to win the 2019 Masters. Continues competing on PGA Tour.",
    wivesCount: "1 marriage (Elin Nordegren, married 2004, divorced 2010)",
    affairsStatus: "Extensive extramarital affairs revealed in late 2009, resulting in public apology and divorce.",
    criminalStatus: "Clean criminal record (one DUI reckless driving charge in 2017 resolved via diversion program).",
    theftScamStatus: "Zero financial theft or scam.",
    murderViolenceStatus: "Zero violence or assault.",
    secrecyStatus: "Deep Emotional Vault: Maintained a squeaky-clean corporate image for years while keeping intense extramarital liaisons tightly concealed."
  },
  {
    id: "bill-clinton",
    name: "Bill Clinton",
    category: "celebrity_sports",
    expectedRole: "42nd US President / Rhodes Scholar / Lewinsky Extramarital Scandal",
    birthDate: "1946-08-19",
    birthTime: "08:51",
    latitude: 33.6671,
    longitude: -93.5913, // Hope, AR (Rodden Rating AA)
    gender: "Male",
    maritalStatus: "married",
    expectedCareerCode: "government_civil_police",
    expectedInterestFields: [
      "Sovereign Presidential Governance",
      "International Diplomatic Statecraft",
      "Economic Policy & Budgetary Balance",
      "Public Oratory & Political Strategy",
      "Global Philanthropic Leadership"
    ],
    negativeShadeScoreRange: [20, 50],
    expectedDim1Risk: true,  // Multiple extramarital affairs (Lewinsky, Gennifer Flowers, Paula Jones)
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: true,  // Impeached in 1998 for perjury/obstruction of justice (acquitted by Senate)
    expectedSecrecyType: "deep_vault",
    currentLifeReality2026: "42nd President of the United States (1993–2001). Oversaw the longest economic expansion in peacetime American history. Founder of the Clinton Foundation.",
    wivesCount: "1 wife (Hillary Rodham Clinton, married 1975 to present)",
    affairsStatus: "Extramarital affairs documented extensively; admitted relationship with Monica Lewinsky in 1998.",
    criminalStatus: "Impeached by House of Representatives (1998); acquitted by Senate (1999); law license suspended for 5 years.",
    theftScamStatus: "Investigated in Whitewater land transactions (cleared of personal criminal wrongdoing).",
    murderViolenceStatus: "Zero personal violence.",
    secrecyStatus: "Deep Emotional Vault / Tactical Charm: Used legalistic hair-splitting ('depends on what the meaning of the word is is') to conceal private conduct."
  },
  {
    id: "elon-musk",
    name: "Elon Musk",
    category: "celebrity_sports",
    expectedRole: "Tech Industrialist / SpaceX & Tesla Founder / Multiple Relationships / Unfiltered Candor",
    birthDate: "1971-06-28",
    birthTime: "06:30",
    latitude: -25.7479,
    longitude: 28.2293, // Pretoria, South Africa (Rodden Rating AA)
    gender: "Male",
    maritalStatus: "divorced",
    expectedCareerCode: "it_software",
    expectedInterestFields: [
      "Aerospace Rocketry & Spacecraft Engineering",
      "Electric Vehicle Powertrains & Autonomous AI",
      "Large-Scale Software Architecture",
      "Neural Engineering & Robotics",
      "High-Tech Venture Industrialization"
    ],
    negativeShadeScoreRange: [15, 45],
    expectedDim1Risk: true,  // Multiple marriages, children with multiple partners (Justine, Talulah, Grimes, Shivon Zilis)
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "kullam_kulla", // Tweets unvarnished opinions at 3 AM; admits personal eccentricities publicly
    currentLifeReality2026: "World's wealthiest industrialist, CEO of Tesla, SpaceX, xAI, Neuralink, and owner of X (Twitter). Leading orbital spaceflights and AI humanoid robotics.",
    wivesCount: "2 former wives (Justine Wilson 2000–2008, Talulah Riley married/divorced twice 2010–2016)",
    affairsStatus: "Fathered 12 children across 3 partners; openly complex relationship history.",
    criminalStatus: "Clean criminal record; SEC regulatory settlement in 2018 regarding tweets.",
    theftScamStatus: "Zero embezzlement; builds physical factories, rockets, and electric vehicles.",
    murderViolenceStatus: "Zero violence.",
    secrecyStatus: "Brazen Candor / Kullam-Kulla: Extremely vocal, posts unedited personal and political thoughts directly on X to 200+ million followers; refuses conventional corporate PR filters."
  },
  {
    id: "sanjay-dutt",
    name: "Sanjay Dutt",
    category: "celebrity_sports",
    expectedRole: "Bollywood Actor / 1993 Arms Act Conviction / Served Sentence in Yerwada Jail",
    birthDate: "1959-07-29",
    birthTime: "14:45",
    latitude: 18.9220,
    longitude: 72.8347, // Mumbai, India (Rodden Rating AA)
    gender: "Male",
    maritalStatus: "married",
    expectedCareerCode: "creative_media",
    expectedInterestFields: [
      "Cinema Acting & Mass Entertainment",
      "Action Film Dramaturgy",
      "Character Stardom",
      "Performing Arts",
      "Media Stardom"
    ],
    negativeShadeScoreRange: [35, 75],
    expectedDim1Risk: true,  // Multiple marriages, past substance addiction
    expectedDim2Risk: false,
    expectedDim3Risk: false, // Acquitted of TADA terrorism charges; convicted only of illegal weapons possession
    expectedDim4Risk: true,  // Convicted under Arms Act; served 5-year prison sentence in Yerwada Central Jail
    expectedSecrecyType: "deep_vault",
    currentLifeReality2026: "Acclaimed Bollywood actor with dozens of blockbuster films (Munna Bhai M.B.B.S., KGF Chapter 2). Overcame substance addiction and completed his full prison term in 2016.",
    wivesCount: "3 marriages (Richa Sharma died 1996, Rhea Pillai divorced, Manyata Dutt married 2008)",
    affairsStatus: "Past bohemian lifestyle, openly recounted in his biopic 'Sanju'.",
    criminalStatus: "Convicted under Indian Arms Act (illegal possession of AK-56); fully served 5-year sentence in Yerwada Prison.",
    theftScamStatus: "Zero financial theft.",
    murderViolenceStatus: "Acquitted of all conspiracy and terrorism charges under TADA; possessed weapon for family protection.",
    secrecyStatus: "Deep Emotional Vault: Faced severe psychological isolation and trauma during custody; later spoke openly in recovery."
  },
  {
    id: "ar-rahman",
    name: "A.R. Rahman",
    category: "celebrity_sports",
    expectedRole: "Two-Time Oscar-Winning Music Maestro / Spiritual Devotee / Recent Marital Separation",
    birthDate: "1967-01-06",
    birthTime: "05:50",
    latitude: 13.0827,
    longitude: 80.2707, // Chennai, Tamil Nadu (Rodden Rating A)
    gender: "Male",
    maritalStatus: "separated",
    expectedCareerCode: "creative_media",
    expectedInterestFields: [
      "Symphonic Musical Composition",
      "Acoustic & Digital Audio Engineering",
      "Global Film Scoring & Orchestration",
      "Sufi & Devotional Music",
      "Performing Arts"
    ],
    negativeShadeScoreRange: [0, 10],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "kullam_kulla",
    currentLifeReality2026: "World-renowned composer and music producer. Won 2 Academy Awards, 2 Grammys, and a BAFTA for Slumdog Millionaire. In November 2024, announced mutual separation from wife Saira Banu after 29 years of marriage.",
    wivesCount: "1 wife (Saira Banu, married 1995, announced joint amicable separation in Nov 2024)",
    affairsStatus: "Impeccable personal character; zero affairs; high spiritual devotion.",
    criminalStatus: "Pristine record; recipient of Padma Bhushan.",
    theftScamStatus: "Zero financial impropriety; extensive philanthropic music schools (KM Music Conservatory).",
    murderViolenceStatus: "Strictly non-violent, Sufi spiritual devotee.",
    secrecyStatus: "Open & Candid / Dignified Grace: Addressed his marital separation with poetic transparency and prayerful maturity on public social media."
  },
  {
    id: "novak-djokovic",
    name: "Novak Djokovic",
    category: "celebrity_sports",
    expectedRole: "24-Time Grand Slam Tennis GOAT / Strict Teetotaler / High Athletic Stamina",
    birthDate: "1987-05-22",
    birthTime: "23:25",
    latitude: 44.7866,
    longitude: 20.4489, // Belgrade, Serbia (Rodden Rating AA)
    gender: "Male",
    maritalStatus: "married",
    expectedCareerCode: "sports_athletics",
    expectedInterestFields: [
      "Grand Slam Professional Tennis",
      "Elite Athletic Conditioning & Stamina",
      "Agility & Precision Reflexes",
      "Competitive Tournament Champion",
      "Sports Physical Recovery"
    ],
    negativeShadeScoreRange: [0, 15],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "deep_vault",
    expectedIsTeetotaler: true,
    currentLifeReality2026: "All-time men's tennis record holder with 24 Grand Slam singles titles and Olympic Gold Medal. Dedicated vegetarian/plant-based diet, strict teetotaler.",
    wivesCount: "1 wife (Jelena Ristic Djokovic, married 2014 to present)",
    affairsStatus: "Faithful marriage; family travels together on tour.",
    criminalStatus: "Pristine civic record; established Novak Djokovic Foundation for preschool education.",
    theftScamStatus: "Zero fraud; highest prize-money earner in tennis history.",
    murderViolenceStatus: "Zero violence.",
    secrecyStatus: "Open & Candid: Articulates his convictions on health, diet, and philosophy with total transparency and zero hesitation."
  },
  {
    id: "emma-watson",
    name: "Emma Watson",
    category: "celebrity_sports",
    expectedRole: "Acclaimed British Actress / UN Women Goodwill Ambassador / Oxford Scholar",
    birthDate: "1990-04-15",
    birthTime: "18:00",
    latitude: 48.8566,
    longitude: 2.3522, // Paris, France (Rodden Rating AA)
    gender: "Female",
    maritalStatus: "unmarried",
    expectedCareerCode: "creative_media",
    expectedInterestFields: [
      "Dramatic Acting & Cinema Performance",
      "Human Rights & Gender Equality Advocacy",
      "Literary & Creative Arts",
      "Global Humanitarian Representation",
      "Sustainable Fashion & Ethical Media"
    ],
    negativeShadeScoreRange: [0, 10],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "pragmatic_discretion",
    currentLifeReality2026: "Celebrated actress (Hermione Granger in Harry Potter, Beauty and the Beast, Little Women), Brown University graduate, UN Women Goodwill Ambassador (HeForShe campaign).",
    wivesCount: "Unmarried (dedicated to scholarship and creative work)",
    affairsStatus: "Zero scandals; dignified privacy in personal life.",
    criminalStatus: "Pristine civic record.",
    theftScamStatus: "Zero financial wrongdoing; ethical investor.",
    murderViolenceStatus: "Zero violence; dedicated human rights champion.",
    secrecyStatus: "Pragmatic Discretion: Maintains a healthy, quiet boundary between public advocacy and private contemplative life."
  },

  // =========================================================================
  // 4. VISIONARIES, SCIENTISTS & STATESMEN (5 PROFILES)
  // =========================================================================
  {
    id: "barack-obama",
    name: "Barack Obama",
    category: "visionary_leader",
    expectedRole: "44th US President / Constitutional Law Professor / Nobel Peace Laureate",
    birthDate: "1961-08-04",
    birthTime: "19:24",
    latitude: 21.3069,
    longitude: -157.8583, // Honolulu, HI (Rodden Rating AA - Official Birth Certificate)
    gender: "Male",
    maritalStatus: "married",
    expectedCareerCode: "government_civil_police",
    expectedInterestFields: [
      "Sovereign Presidential Administration",
      "Constitutional Law & Jurisprudence",
      "Statecraft & Diplomatic Peacemaking",
      "Public Policy & Healthcare Reform",
      "National Executive Leadership"
    ],
    negativeShadeScoreRange: [0, 10],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "deep_vault",
    currentLifeReality2026: "44th President of the United States (2009–2017). Author of presidential memoirs, co-founder of Higher Ground Productions, and Nobel Peace Prize laureate.",
    wivesCount: "1 wife (Michelle Robinson Obama, married 1992 to present)",
    affairsStatus: "Pristine marital fidelity for over 33 years; exemplary family life.",
    criminalStatus: "Pristine civic record; constitutional law professor at University of Chicago.",
    theftScamStatus: "Zero financial impropriety; audited public disclosures.",
    murderViolenceStatus: "Zero personal violence; peaceful demeanor.",
    secrecyStatus: "Deep Emotional Vault / Composed Statesman: Famed for his 'No Drama Obama' equanimity, carefully measuring every word with dignified self-control."
  },
  {
    id: "steve-jobs",
    name: "Steve Jobs",
    category: "visionary_leader",
    expectedRole: "Apple Co-Founder / Personal Computing & Smartphone Pioneer / Tech Visionary",
    birthDate: "1955-02-24",
    birthTime: "19:15",
    latitude: 37.7749,
    longitude: -122.4194, // San Francisco, CA (Rodden Rating AA)
    gender: "Male",
    maritalStatus: "married",
    expectedCareerCode: "it_software",
    expectedInterestFields: [
      "Hardware & Software Product Architecture",
      "User Interface & Aesthetic Industrial Design",
      "Consumer Electronics Innovation",
      "Digital Media Ecosystems",
      "Visionary Technology Executive"
    ],
    negativeShadeScoreRange: [10, 30],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "kullam_kulla",
    currentLifeReality2026: "Visionary co-founder of Apple, NeXT, and Pixar. Revolutionized six industries: personal computers, animated movies, music, phones, tablet computing, and digital publishing. Passed away in 2011.",
    wivesCount: "1 wife (Laurene Powell Jobs, married 1991 until his death in 2011)",
    affairsStatus: "Early unmarried daughter (Lisa Brennan-Jobs) later fully reconciled; faithful marriage to Laurene Powell.",
    criminalStatus: "Pristine criminal record; recipient of National Medal of Technology.",
    theftScamStatus: "Stock options backdating inquiry in 2006 (cleared of personal enrichment or fraud).",
    murderViolenceStatus: "Zero physical violence; intense verbal perfectionism.",
    secrecyStatus: "Open & Candid / Direct Firebrand: Famed for brutal honesty and 'reality distortion field'; never held back his unvarnished thoughts on products or people."
  },
  {
    id: "bill-gates",
    name: "Bill Gates",
    category: "visionary_leader",
    expectedRole: "Microsoft Co-Founder / Software Pioneer / World-Leading Philanthropist",
    birthDate: "1955-10-28",
    birthTime: "22:00",
    latitude: 47.6062,
    longitude: -122.3321, // Seattle, WA (Rodden Rating AA)
    gender: "Male",
    maritalStatus: "divorced",
    expectedCareerCode: "it_software",
    expectedInterestFields: [
      "Operating Systems & Software Engineering",
      "Enterprise Computing Architecture",
      "Global Health Philanthropy & Eradication",
      "Clean Energy & Climate Innovation",
      "Quantitative Venture Capital"
    ],
    negativeShadeScoreRange: [0, 20],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "deep_vault",
    currentLifeReality2026: "Co-founder of Microsoft, co-chair of the Bill & Melinda Gates Foundation donating tens of billions to eradicate polio and combat malaria.",
    wivesCount: "1 former wife (Melinda French Gates, married 1994, divorced 2021)",
    affairsStatus: "Reported workplace affair in 2000, amicably settled divorce in 2021.",
    criminalStatus: "Clean record; antitrust civil antitrust litigation resolved in 2001.",
    theftScamStatus: "Zero financial fraud; world's leading philanthropist.",
    murderViolenceStatus: "Zero violence.",
    secrecyStatus: "Diplomatic Deflection: Highly analytical, calm, and measured in corporate communication and public life."
  },
  {
    id: "dr-devi-shetty",
    name: "Dr. Devi Prasad Shetty",
    category: "visionary_leader",
    expectedRole: "World-Renowned Cardiac Surgeon / Narayana Health Founder / Affordable Healthcare Visionary",
    birthDate: "1953-05-08",
    birthTime: "05:45",
    latitude: 13.1977,
    longitude: 74.8876, // Kinnigoli, Dakshina Kannada, Karnataka (Documented Public Records)
    gender: "Male",
    maritalStatus: "married",
    expectedCareerCode: "medical_healthcare",
    expectedInterestFields: [
      "Pediatric & Adult Cardiac Surgery",
      "Super-Specialty Hospital Architecture",
      "Affordable Healthcare Systems",
      "Clinical Diagnostics & Surgery",
      "Medical Innovation"
    ],
    negativeShadeScoreRange: [0, 10],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "kullam_kulla",
    expectedIsTeetotaler: true,
    expectedHighFidelity: true,
    currentLifeReality2026: "Celebrated Indian cardiac surgeon who has performed over 15,000 heart operations. Founder and Chairman of Narayana Health (chain of 21 medical centers). Padma Bhushan and Padma Shri awardee.",
    wivesCount: "1 wife (Dr. Shakuntala Shetty, married to present)",
    affairsStatus: "Impeccable moral rectitude and marital devotion.",
    criminalStatus: "Pristine record; national healthcare leader.",
    theftScamStatus: "Zero financial theft; pioneered low-cost heart surgeries for impoverished children.",
    murderViolenceStatus: "Saves thousands of lives; embodiment of Dhanvantari medical seva.",
    secrecyStatus: "Open & Candid / Compassionate Healer: Transparent, humble, and openhearted in his communication with patients, doctors, and society."
  },
  {
    id: "dr-apj-kalam",
    name: "Dr. A.P.J. Abdul Kalam",
    category: "visionary_leader",
    expectedRole: "11th President of India / 'Missile Man' Aerospace Scientist / Lifelong Ascetic Bachelor",
    birthDate: "1931-10-15",
    birthTime: "01:15",
    latitude: 9.2876,
    longitude: 79.3129, // Rameswaram, Tamil Nadu (Rodden Rating A)
    gender: "Male",
    maritalStatus: "unmarried",
    expectedCareerCode: "engineering_core",
    expectedInterestFields: [
      "Aerospace & Rocket Propulsion Systems",
      "Satellite Launch Vehicle Engineering",
      "Defense Missile Technology (Agni/Prithvi)",
      "Scientific Research & Youth Mentorship",
      "Sovereign Statesmanship"
    ],
    negativeShadeScoreRange: [0, 5],
    expectedDim1Risk: false, // Lifelong Naishtika Brahmachari / Sanyasa Yoga
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "deep_vault",
    expectedIsTeetotaler: true,
    expectedHighFidelity: false, // Celibate / Unmarried
    currentLifeReality2026: "11th President of India (2002–2007). Renowned scientist who directed India's civilian space program (SLV-III) and military missile development. Bharat Ratna awardee. Passed away in 2015 while addressing students at IIM Shillong.",
    wivesCount: "Unmarried (Lifelong celibate ascetic / Naishtika Brahmachari)",
    affairsStatus: "Complete lifelong celibacy; saintly detachment from worldly pleasures.",
    criminalStatus: "Pristine civic and spiritual integrity; revered across India.",
    theftScamStatus: "Owned almost nothing when he died besides 2,500 books, a veena, a wristwatch, and six shirts.",
    murderViolenceStatus: "Dedicated to peaceful scientific defense of the nation.",
    secrecyStatus: "Deep Emotional Reserve / Pure Ascetic: Maintained deep inner spiritual simplicity, humility, and contemplative calm while inspiring millions."
  },

  // =========================================================================
  // 5. NORMAL EVERYDAY LAW-ABIDING CITIZENS (5 PROFILES)
  // =========================================================================
  {
    id: "raghavendra-rao",
    name: "Raghavendra Rao",
    category: "normal_citizen",
    expectedRole: "Senior Cloud Solutions Architect / Dedicated Family Man / Clean Civic Record",
    birthDate: "1985-12-12",
    birthTime: "06:15",
    latitude: 12.9716,
    longitude: 77.5946, // Bengaluru, Karnataka
    gender: "Male",
    maritalStatus: "married",
    expectedCareerCode: "it_software",
    expectedInterestFields: [
      "Cloud Infrastructure Architecture",
      "Enterprise Distributed Systems",
      "DevOps & Microservices Engineering",
      "Full-Stack Software Architecture",
      "Database Scalability"
    ],
    negativeShadeScoreRange: [0, 10],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "deep_vault",
    expectedIsTeetotaler: true,
    expectedHighFidelity: true,
    currentLifeReality2026: "Senior IT Architect working at a multinational software technology firm in Whitefield, Bengaluru. Happily married for 14 years with two children; zero criminal record.",
    wivesCount: "1 wife (married 2012, peaceful grihasthashrama)",
    affairsStatus: "Strictly faithful; zero extramarital affairs.",
    criminalStatus: "Clean record; tax-paying upright citizen.",
    theftScamStatus: "Zero financial theft or dispute.",
    murderViolenceStatus: "Zero violence; peace-loving household.",
    secrecyStatus: "Open & Candid: Discusses all household and financial matters transparently with his spouse and close family."
  },
  {
    id: "suma-kulkarni",
    name: "Suma Kulkarni",
    category: "normal_citizen",
    expectedRole: "High School Mathematics Teacher / Mother & Dedicated Educator / Clean Record",
    birthDate: "1978-05-22",
    birthTime: "07:30",
    latitude: 15.3647,
    longitude: 75.1240, // Hubballi, Karnataka
    gender: "Female",
    maritalStatus: "married",
    expectedCareerCode: "teaching_academics",
    expectedInterestFields: [
      "Mathematics Pedagogy & Curriculum Design",
      "Secondary School Academic Mentorship",
      "Student Counseling & Character Building",
      "Educational Administration",
      "Academic Excellence"
    ],
    negativeShadeScoreRange: [0, 10],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "pragmatic_discretion",
    expectedIsTeetotaler: true,
    expectedHighFidelity: true,
    currentLifeReality2026: "Senior Mathematics teacher in a reputed higher secondary school in Dharwad. Married for 23 years with a son studying engineering; respected community educator.",
    wivesCount: "1 husband (married 2003, stable family)",
    affairsStatus: "Devoted wife; zero extramarital inclinations.",
    criminalStatus: "Clean record; recipient of District Best Teacher award.",
    theftScamStatus: "Zero financial wrongdoing.",
    murderViolenceStatus: "Zero violence.",
    secrecyStatus: "Diplomatic Deflection: Gentle, patient educator who balances home life and school responsibilities with calm composure."
  },
  {
    id: "venkatesh-sharma",
    name: "Venkatesh Sharma",
    category: "normal_citizen",
    expectedRole: "Public Sector Bank Branch Manager / Treasury & Loan Officer / Clean Civic Record",
    birthDate: "1981-08-15",
    birthTime: "07:00",
    latitude: 12.2958,
    longitude: 76.6394, // Mysuru, Karnataka
    gender: "Male",
    maritalStatus: "married",
    expectedCareerCode: "banking_finance",
    expectedInterestFields: [
      "Commercial Banking & Branch Operations",
      "Retail Credit & Agricultural Loans",
      "Financial Audit & Compliance",
      "Treasury Management",
      "Customer Portfolio Advisory"
    ],
    negativeShadeScoreRange: [0, 10],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "deep_vault",
    expectedIsTeetotaler: true,
    expectedHighFidelity: true,
    currentLifeReality2026: "Branch Manager at a premier public sector bank in Saraswathipuram, Mysuru. Married for 17 years; handles tens of crores in deposits and loans with zero audit defects.",
    wivesCount: "1 wife (married 2009)",
    affairsStatus: "Faithful marriage; disciplined family life.",
    criminalStatus: "Clean record; impeccable bank vigilance record.",
    theftScamStatus: "Zero theft or financial impropriety; 100% compliant audits.",
    murderViolenceStatus: "Zero violence.",
    secrecyStatus: "Open & Candid: Transparent in domestic affairs, prudent and confidential in banking matters per banking secrecy laws."
  },
  {
    id: "manjunath-gowda",
    name: "Manjunath Gowda",
    category: "normal_citizen",
    expectedRole: "Karnataka State Police Sub-Inspector / Law & Order Officer / Disciplined Service",
    birthDate: "1988-11-05",
    birthTime: "14:15",
    latitude: 12.5223,
    longitude: 76.8973, // Mandya, Karnataka
    gender: "Male",
    maritalStatus: "married",
    expectedCareerCode: "government_civil_police",
    expectedInterestFields: [
      "Law & Order Field Enforcement",
      "Criminal Investigation & FIR Filing",
      "Public Safety & Crowd Control",
      "Traffic & Crime Prevention",
      "Police Station Administration"
    ],
    negativeShadeScoreRange: [0, 15],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "diplomatic_mask",
    expectedIsTeetotaler: true,
    expectedHighFidelity: true,
    currentLifeReality2026: "Active Police Sub-Inspector (PSI) in Karnataka State Police. Serves in crime investigation and law enforcement with a spotless service record and commendation letters.",
    wivesCount: "1 wife (married 2017)",
    affairsStatus: "Faithful marriage; disciplined lifestyle.",
    criminalStatus: "Law enforcement officer; zero departmental inquiries.",
    theftScamStatus: "Zero corruption record; upright officer.",
    murderViolenceStatus: "Enforces law under statutory authority; zero unlawful violence.",
    secrecyStatus: "Diplomatic Deflection: Retains strict operational security on police investigations while being open and warm with family."
  },
  {
    id: "vidyadhar-hegde",
    name: "Vidyadhar Hegde",
    category: "normal_citizen",
    expectedRole: "Full-Stack Software Engineer / Bachelor & Career Focused / Upright Young Professional",
    birthDate: "1996-06-18",
    birthTime: "18:45",
    latitude: 14.6195,
    longitude: 74.8354, // Sirsi, Uttara Kannada, Karnataka
    gender: "Male",
    maritalStatus: "unmarried",
    expectedCareerCode: "it_software",
    expectedInterestFields: [
      "Modern Web Applications & React/Node.js",
      "Cloud Backend API Engineering",
      "Algorithms & Data Structures",
      "Database Optimization",
      "Open-Source Software Development"
    ],
    negativeShadeScoreRange: [0, 10],
    expectedDim1Risk: false,
    expectedDim2Risk: false,
    expectedDim3Risk: false,
    expectedDim4Risk: false,
    expectedSecrecyType: "kullam_kulla",
    expectedIsTeetotaler: true,
    currentLifeReality2026: "29-year-old software engineer working remotely for a tech startup. Focused on coding, career advancement, and saving for marriage. Respectful of cultural heritage.",
    wivesCount: "Unmarried (Bachelor preparing for marriage settlement)",
    affairsStatus: "Clean personal conduct; focused on career.",
    criminalStatus: "Clean civic record; law-abiding youth.",
    theftScamStatus: "Zero financial wrongdoing.",
    murderViolenceStatus: "Zero violence.",
    secrecyStatus: "Deep Emotional Vault: Quiet, introverted nature; prefers solving technical problems calmly rather than talking excessively."
  }
];
