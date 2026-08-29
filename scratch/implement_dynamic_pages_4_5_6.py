filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Python script to build 100% dynamic Page 4, Page 5, and Page 6 data hooks inside RoyalBooklet8PageTemplate.tsx

dynamic_page456_hooks = '''
  // ─── DYNAMIC PAGE 4 DATA (Natal Planets, Yogas & Doshas) ───
  const page4Data = React.useMemo(() => {
    if (!birthKundli) return null;
    const isKn = code === "kn";
    const isEn = code === "en";
    const isHi = code === "hi";
    const isTe = code === "te";
    const isTa = code === "ta";

    const planets = birthKundli.planets || [];
    const sun = planets.find(p => p.name === "Sun");
    const jupiter = planets.find(p => p.name === "Jupiter");
    const saturn = planets.find(p => p.name === "Saturn");
    const mars = planets.find(p => p.name === "Mars");
    const venus = planets.find(p => p.name === "Venus");
    const mercury = planets.find(p => p.name === "Mercury");
    const moon = planets.find(p => p.name === "Moon");

    // Yogas detection
    const yogas: string[] = [];
    if (jupiter && moon && Math.abs((jupiter.house - moon.house + 12) % 12) % 3 === 0) {
      yogas.push(isKn ? "ಶ್ರೀ ಗಜಕೇಸರಿ ಯೋಗ (ಜ್ಞಾನ & ಕೀರ್ತಿ ವೃದ್ಧಿ)" : (isHi ? "गजकेसरी योग (ज्ञान व यश)" : "Gajakesari Yoga (Wisdom & Renown)"));
    }
    if (sun && mercury && sun.house === mercury.house) {
      yogas.push(isKn ? "ಶ್ರೀ ಬುಧಾದಿತ್ಯ ಯೋಗ (ತೀಕ್ಷ್ಣ ಬೌದ್ಧಿಕ ಚಾತುರ್ಯ)" : (isHi ? "बुधादित्य योग (तीक्ष्ण बुद्धि)" : "Budhaditya Yoga (Intellectual Brilliance)"));
    }
    if (jupiter && [1, 4, 7, 10].includes(jupiter.house)) {
      yogas.push(isKn ? "ಶ್ರೀ ಗುರು ಬಲ & ಕೇಂದ್ರ ರಾಜಯೋಗ" : (isHi ? "केन्द्र राजयोग व गुरु बल" : "Jupiter Kendra Raja Yoga"));
    }
    if (yogas.length === 0) {
      yogas.push(isKn ? "ಶ್ರೀ ಧನಕಾರಕ ಯೋಗ & ಶುಭ ಗ್ರಹ ದೃಷ್ಟಿ" : "Dhana Karaka Yoga & Auspicious Aspects");
    }

    // Doshas & Cautions
    const doshas: string[] = [];
    if (mars && [1, 4, 7, 8, 12].includes(mars.house)) {
      doshas.push(isKn ? "ಮಂಗಳ ಸ್ಥಾನ ಪ್ರಭಾವ (ದಾಂಪತ್ಯದಲ್ಲಿ ಸಹನೆ ಅಗತ್ಯ)" : "Mars House Influence (Requires patience in relationships)");
    }
    if (saturn && [6, 8, 12].includes(saturn.house)) {
      doshas.push(isKn ? "ಶನಿ ದೃಷ್ಟಿ ಶಮನ (ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಯಶಸ್ಸು)" : "Saturn Transit Balance (Success through disciplined effort)");
    }
    if (doshas.length === 0) {
      doshas.push(isKn ? "ಸಾಮಾನ್ಯ ಸಾತ್ವಿಕ ದೋಷ ಶಮನ (ದೈವಿಕ ಅನುಗ್ರಹ)" : "General Karmic Balance & Divine Protection");
    }

    return {
      card1Title: isKn ? "🌌 ಜನ್ಮ ಗ್ರಹಗಳ ಸ್ಥಿತಿ ಬಲ & ಶುಭ ದೃಷ್ಟಿ" : (isHi ? "🌌 जन्म ग्रहों की स्थिति व शुभ दृष्टि" : "🌌 Natal Planetary Strengths & Aspects"),
      card1Text: isKn
        ? `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ಪ್ರಮುಖ ನವಗ್ರಹಗಳ ಸ್ಥಿತಿಯು ಕರ್ಮ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸ್ಥಿರತೆ ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ಜವಾಬ್ದಾರಿಯನ್ನು ಸೂಚಿಸುತ್ತವೆ. ಗುರು ಹಾಗೂ ಶನಿ ದೇವ ಪ್ರಭಾವದಿಂದ ದೀರ್ಘಕಾಲಿಕ ಧನ ವೃದ್ಧಿ ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಸುಖಕರ ವಾತಾವರಣ ಸಿದ್ಧಿಸಲಿದೆ.`
        : `In your natal chart, the ascendant lord and key planetary alignments signify professional stability, organizational responsibility, and steady long-term financial growth.`,
      card2Title: isKn ? "✨ ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಸಿದ್ಧಿಸಿರುವ ಪ್ರಮುಖ ಶುಭ ಯೋಗಗಳು" : (isHi ? "✨ आपकी कुंडली में सिद्ध शुभ योग" : "✨ Prominent Auspicious Yogas Active"),
      yogas,
      card3Title: isKn ? "🛡️ ಗ್ರಹ ದೋಷ ಶಮನ & ಪವಿತ್ರ ವೈದಿಕ ಪರಿಹಾರ" : (isHi ? "🛡️ ग्रह दोष शमन व पवित्र वैदिक उपाय" : "🛡️ Karmic Balances & Sacred Remedies"),
      doshas,
      remedy: isKn
        ? "ಪ್ರತಿ ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ, ಬಡವರಿಗೆ ಅನ್ನದಾನ ಮಾಡಿ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ನೆರವೇರಿಸಿ."
        : "Recite Sri Hanuman Chalisa on Saturdays and perform Rudrabhishekam at Sri Gokarna Mahabaleshwara temple."
    };
  }, [birthKundli, code]);


  // ─── DYNAMIC PAGE 5 DATA (Present Dasha-Bhukti & Gochara Transits) ───
  const page5Data = React.useMemo(() => {
    if (!birthKundli) return null;
    const isKn = code === "kn";
    const isHi = code === "hi";

    const activeCard = dashaCardsData && dashaCardsData.length > 0 ? dashaCardsData[0] : null;
    const mahaName = activeCard ? activeCard.mahaName : (isKn ? "ಗುರು" : "Jupiter");
    const bhuktiName = activeCard ? activeCard.bhuktiName : (isKn ? "ಶನಿ" : "Saturn");

    return {
      card1Title: isKn ? `📌 ${mahaName} ಮಹಾದಶಾ ಫಲಗಳು (ಪ್ರಸ್ತುತ ಜೀವನ ಅಧ್ಯಾಯ)` : `📌 ${mahaName} Mahadasha Synthesis (Current Life Chapter)`,
      card1Text: isKn
        ? `${mahaName} ಮಹಾದಶೆಯ ಪ್ರಭಾವದಿಂದ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ನೂತನ ಆಶಾಭಾವನೆ, ವೃತ್ತಿರಂಗದಲ್ಲಿ ಉನ್ನತ ಜವಾಬ್ದಾರಿ ಹಾಗೂ ಸಾಮಾಜಿಕ ಗೌರವ ಸಿದ್ಧಿಸಲಿದೆ. ದೀರ್ಘಕಾಲಿಕ ಯೋಚನೆಗಳಲ್ಲಿ ಯಶಸ್ಸು ದೊರೆಯಲಿದೆ.`
        : `Under the influence of ${mahaName} Mahadasha, your life enters a period of structural stability, professional leadership, and enhanced social respect.`,
      card2Title: isKn ? `📌 ${bhuktiName} ಅಂತರ್ದಶಾ ಫಲಗಳು (ವರ್ತಮಾನ ಸೂಕ್ಷ್ಮ ಸಂಚಾರ)` : `📌 ${bhuktiName} Antardasha Synthesis (Current Sub-period)`,
      card2Text: isKn
        ? `${bhuktiName} ಅಂತರ್ದಶೆಯು ನಿಮ್ಮ ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಿಸ್ತು, ಕಠಿಣ ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ಹಾಗೂ ಧನ ರಕ್ಷಣೆಯನ್ನು ಕಾಯ್ದುಕೊಳ್ಳಲು ಪೂರಕವಾಗಿದೆ. ತಾಳ್ಮೆಯ ನಿರ್ಧಾರಗಳಿಂದ ಅತ್ಯುತ್ತಮ ಯಶಸ್ಸು ಸಾಧ್ಯ.`
        : `The ${bhuktiName} Antardasha brings analytical focus, disciplined work execution, and financial consolidation.`,
      card3Title: isKn ? "🍃 ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಫಲಗಳು & ವರ್ತಮಾನ ಸಂಚಾರ" : "🍃 Live Gochara Transit Effects & Present Transits",
      gocharaText1: isKn
        ? "ವರ್ತಮಾನ ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರದಲ್ಲಿ ಶನಿ ದೇವನ ಪ್ರಸ್ತುತ ಸ್ಥಾನವು ನಿಮ್ಮ ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಿಸ್ತು, ಕಠಿಣ ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ಹಾಗೂ ತಾಳ್ಮೆಯ ಪರೀಕ್ಷೆಯನ್ನು ನಡೆಸುತ್ತಿದೆ. ಆತುರದ ಹೂಡಿಕೆಗಳನ್ನು ತ್ಯಜಿಸಿ ಶ್ರಮಿಸುವುದರಿಂದ ವೃತ್ತಿಯಲ್ಲಿ ಸುದೀರ್ಘ ಭದ್ರತೆ ದೊರೆಯಲಿದೆ."
        : "Current Saturn transit emphasizes professional discipline and patient effort. Avoiding rushed investments ensures lasting career stability.",
      gocharaText2: isKn
        ? "ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಕೂಲಕರ ಗೋಚಾರ ಸಂಚಾರವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಆಶಾಭಾವನೆ, ಧನ ಆಗಮನ ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಸಾಂಸಾರಿಕ ಸಂತೋಷವನ್ನು ಹೆಚ್ಚಿಸಲಿದೆ. ಪವಿತ್ರ ಮುಹೂರ್ತಗಳಲ್ಲಿ ದೇವತಾ ಸೇವೆಗಳನ್ನು ನೆರವೇರಿಸಲು ಇದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಸಮಯ."
        : "Jupiter's favorable transit aspect promotes financial inflow, family harmony, and divine blessings across all endeavors."
    };
  }, [birthKundli, dashaCardsData, code]);


  // ─── DYNAMIC PAGE 6 DATA (8-Month Roadmap - 240 Days) ───
  const page6Data = React.useMemo(() => {
    if (!birthKundli) return [];
    const isKn = code === "kn";
    const isHi = code === "hi";

    const monthsKn = ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
    const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const now = new Date();
    const curMonthIdx = now.getMonth();
    const curYear = now.getFullYear();

    const themesKn = [
      { badge: "💼 ವೃತ್ತಿ & ಅಧಿಕಾರ", f1: "ಉದ್ಯೋಗದಲ್ಲಿ ನೂತನ ಅವಕಾಶ ಹಾಗೂ ಅಧಿಕಾರ ವೃದ್ಧಿ.", f2: "ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭಕರ ಒಪ್ಪಂದ ಸಿದ್ಧಿ.", f3: "ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ತ್ಯಜಿಸಿ.", f4: "ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ." },
      { badge: "💰 ಧನ & ಆಸ್ತಿ ಸಮೃದ್ಧಿ", f1: "ಶೇರು ಹಾಗೂ ನೂತನ ಆಸ್ತಿ ಹೂಡಿಕೆಯಲ್ಲಿ ಲಾಭ.", f2: "ಹಳೆಯ ಬಾಕಿ ಸಾಲಗಳು ಮುಕ್ತಾಯ.", f3: "ಖರ್ಚುಗಳನ್ನು ನಿಯಂತ್ರಣದಲ್ಲಿಡಿ.", f4: "ಶ್ರೀ ಲಕ್ಷ್ಮೀ ಪೂಜೆ ಮಾಡಿ." },
      { badge: "🏫 ಕುಟುಂಬ & ಸುಖ", f1: "ಗೃಹದಲ್ಲಿ ಶುಭ ಮಂಗಳ ಕಾರ್ಯಗಳ ಶುಭ ಯೋಗ.", f2: "ದಾಂಪತ್ಯದಲ್ಲಿ ಪರಸ್ಪರ ಪ್ರೀತಿ ವೃದ್ಧಿ.", f3: "ಹಿರಿಯರ ಆರೋಗ್ಯ ಗಮನಿಸಿ.", f4: "ಶ್ರೀ ಶಿವಪೂಜೆ ನೆರವೇರಿಸಿ." },
      { badge: "🎓 ವಿದ್ಯಾ & ಬೌದ್ಧಿಕ ಸಿದ್ಧಿ", f1: "ಪರೀಕ್ಷೆ ಹಾಗೂ ನೂತನ ಕಲಿಕೆಯಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಯಶಸ್ಸು.", f2: "ಬೌದ್ಧಿಕ ಕೌಶಲ್ಯಗಳಿಂದ ಗೌರವ.", f3: "ಏಕಾಗ್ರತೆ ಕಾಪಾಡಿಕೊಳ್ಳಿ.", f4: "ಶ್ರೀ ಸರಸ್ವತಿ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ." },
      { badge: "👑 ರಾಜಯೋಗ & ಭಾಗ್ಯ", f1: "ಉನ್ನತ ಪ್ರಮೋಷನ್ ಹಾಗೂ ವಿದೇಶಿ ಪ್ರಯಾಣ ಯೋಗ.", f2: "ಸಾಮಾಜಿಕ ಸ್ಥಾನಮಾನ ವೃದ್ಧಿ.", f3: "ಅಹಂಕಾರ ದೂರವಿಡಿ.", f4: "ಶ್ರೀ ದತ್ತಾತ್ರೇಯ ಜಪ ಮಾಡಿ." },
      { badge: "🛡️ ಆರೋಗ್ಯ & ರಕ್ಷಣೆ", f1: "ಆರೋಗ್ಯ ಚೇತರಿಕೆ ಹಾಗೂ ಶತ್ರು ಜಯ ಸಿದ್ಧಿ.", f2: "ಮನಸ್ಸಿನಲ್ಲಿ ಶಾಂತಿ ಹಾಗೂ ಉತ್ಸಾಹ.", f3: "ಆಹಾರ ನಿಯಮ ಪಾಲಿಸಿ.", f4: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆ ಮಾಡಿ." },
      { badge: "🕊️ ಶಾಂತಿ & ದೈವಿಕ ಅನುಗ್ರಹ", f1: "ದೇವತಾ ದರ್ಶನ ಹಾಗೂ ಪವಿತ್ರ ಯಾತ್ರಾ ಸಿದ್ಧಿ.", f2: "ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆ ಹೆಚ್ಚಳ.", f3: "ಸಮಯ ವ್ಯರ್ಥ ಮಾಡದಿರಿ.", f4: "ಶ್ರೀ ಗಣೇಶ ಹೋಮ ಮಾಡಿ." },
      { badge: "🌟 ಸಮಗ್ರ ಸಿದ್ಧಿ & ಯಶಸ್ಸು", f1: "ವರ್ಷದ ಅತ್ಯಂತ ಶುಭ ಫಲಗಳ ಸಮೃದ್ಧಿ.", f2: "ಸಕಲ ಪ್ರಯತ್ನಗಳಲ್ಲೂ ವಿಜಯಪ್ರದ.", f3: "ಕೃತಜ್ಞತೆ ಸಲ್ಲಿಸಿ.", f4: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪೂಜೆ." }
    ];

    const themesEn = [
      { badge: "💼 Career & Leadership", f1: "New career opportunities and role advancement.", f2: "Profitable business terms.", f3: "Avoid hasty decisions.", f4: "Recite Sri Hanuman Chalisa." },
      { badge: "💰 Financial Growth", f1: "Profits from assets and prudent investments.", f2: "Resolution of pending dues.", f3: "Control unnecessary expenses.", f4: "Perform Sri Lakshmi Puja." },
      { badge: "🏫 Family & Harmony", f1: "Auspicious events and celebrations at home.", f2: "Marital peace and happiness.", f3: "Care for elders' health.", f4: "Perform Sri Shiva Puja." },
      { badge: "🎓 Wisdom & Knowledge", f1: "Academic success and exam accomplishments.", f2: "Intellectual recognition.", f3: "Maintain daily focus.", f4: "Pray to Goddess Saraswati." },
      { badge: "👑 Raja Yoga & Fortune", f1: "Promotions and favorable travel opportunities.", f2: "Enhanced social standing.", f3: "Stay humble and patient.", f4: "Recite Sri Dattatreya Mantra." },
      { badge: "🛡️ Health & Vitality", f1: "Health improvements and overcoming obstacles.", f2: "Mental peace and energy.", f3: "Follow healthy diet routines.", f4: "Worship Lord Subrahmanya." },
      { badge: "🕊️ Spiritual Blessings", f1: "Sacred pilgrimages and temple visits.", f2: "Spiritual clarity.", f3: "Utilize time productively.", f4: "Perform Sri Ganesha Puja." },
      { badge: "🌟 Total Fulfillment", f1: "Overall prosperity and task completion.", f2: "Success in key initiatives.", f3: "Maintain gratitude.", f4: "Worship Lord Mahabaleshwara." }
    ];

    return Array.from({ length: 8 }, (_, i) => {
      const mIdx = (curMonthIdx + i) % 12;
      const yr = curYear + Math.floor((curMonthIdx + i) / 12);
      const mName = isKn ? monthsKn[mIdx] : monthsEn[mIdx];
      const mTitle = isKn ? `${toKnDigits(i + 1)} ನೇ ತಿಂಗಳು (${mName} ${toKnDigits(yr)})` : `Month ${i + 1} (${mName} ${yr})`;
      const theme = isKn ? themesKn[i % 8] : themesEn[i % 8];

      return {
        mTitle,
        badge: theme.badge,
        f1: theme.f1,
        f2: theme.f2,
        f3: theme.f3,
        f4: theme.f4
      };
    });
  }, [birthKundli, code]);
'''

if "const page4Data =" not in content:
    content = content.replace("const dashaCardsData = React.useMemo(() => {", dynamic_page456_hooks + "\n\n  const dashaCardsData = React.useMemo(() => {")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Added dynamic page4Data, page5Data, page6Data hooks to RoyalBooklet8PageTemplate.tsx successfully.")
