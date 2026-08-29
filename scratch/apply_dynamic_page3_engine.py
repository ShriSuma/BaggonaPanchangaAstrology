filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Remedy Map for 5 Languages
remedy_map_code = '''
const PLANET_REMEDY_MAP_L5: Record<string, Record<string, string>> = {
  Sun: { kn: "ರವಿವಾರ ಶ್ರೀ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಹಾಗೂ ಸೂರ್ಯದೇವನಿಗೆ ಅರ್ಘ್ಯ ನೀಡಿ.", en: "Recite Sri Aditya Hrudayam on Sundays and offer Arghya to Sun.", hi: "रविवार को श्री आदित्य हृदय स्तोत्र का पाठ करें और सूर्यदेव को अर्घ्य दें।", te: "ఆదివారం శ్రీ ఆదిత్య హృదయ స్తోత్రం పఠించండి.", ta: "ஞாயிற்றுக்கிழமைகளில் ஸ்ரீ ஆதித்ய ஹ்ருதயம் பாராயணம் செய்யவும்." },
  Moon: { kn: "ಸೋಮವಾರ ಶ್ರೀ ಶಿವಪೂಜೆ ಮಾಡಿ ಹಾಗೂ ಬಡವರಿಗೆ ಶ್ವೇತ ವಸ್ತ್ರ ದಾನ ಮಾಡಿ.", en: "Perform Shiva Puja on Mondays and donate white clothes to needy.", hi: "सोमवार को श्री शिव पूजा करें और जरूरतमंदों को सफेद वस्त्र दान करें।", te: "సోమవారం శ్రీ శివ పూజ చేయండి.", ta: "திங்கள்கிழமைகளில் ஸ்ரீ சிவ பூஜை செய்யவும்." },
  Mars: { kn: "ಮಂಗಳವಾರ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ / ಹನುಮಾನ್ ಪೂಜೆ ಮಾಡಿ ಹಾಗೂ ತೊಗರಿ ಬೇಳೆ ದಾನ ಮಾಡಿ.", en: "Worship Lord Subrahmanya or Hanuman on Tuesdays.", hi: "मंगलवार को श्री सुब्रह्मण्य या हनुमान पूजा करें।", te: "మంగళవారం శ్రీ సుబ్రహ్మణ్య స్వామి పూజ చేయండి.", ta: "செவ்வாய்க்கிழமைகளில் ஸ்ரீ சுப்ரமண்யர் பூஜை செய்யவும்." },
  Mercury: { kn: "ಬುಧವಾರ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ ಹಾಗೂ ಹಸಿರು ಬೇಳೆ ದಾನ ಮಾಡಿ.", en: "Recite Sri Vishnu Sahasranama on Wednesdays.", hi: "बुधवार को श्री विष्णु सहस्रनाम का पाठ करें।", te: "బుధవారం శ్రీ విష్ణు సహస్రనామ పారాయణం చేయండి.", ta: "புதன்கிழமைகளில் ஸ்ரீ விஷ்ணு சஹஸ்ரநாமம் பாராயணம் செய்யவும்." },
  Jupiter: { kn: "ಗುರುವಾರ ಶ್ರೀ ದತ್ತಾತ್ರೇಯ / ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಪೂಜೆ ಮಾಡಿ ಹಾಗೂ ಕಡಲೆ ದಾನ ಮಾಡಿ.", en: "Worship Lord Dattatreya or Raghavendra Swamy on Thursdays.", hi: "गुरुवार को श्री दत्तात्रेय या राघवेंद्र स्वामी की पूजा करें।", te: "గురువారం శ్రీ దత్తాత్రేయ పూజ చేయండి.", ta: "வியாழக்கிழமைகளில் ஸ்ரீ ராகவேந்திரர் பூஜை செய்யவும்." },
  Venus: { kn: "ಶುಕ್ರವಾರ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜೆ ಮಾಡಿ ಹಾಗೂ ದೇವಿಗೆ ಕಲ್ಕಂಡು ಅರ್ಪಿಸಿ.", en: "Perform Sri Mahalakshmi Puja on Fridays.", hi: "शुक्रवार को श्री महालक्ष्मी पूजा करें।", te: "శుక్రవారం శ్రీ महालक्ष्मी पूजा करें।", ta: "வெள்ளிக்கிழமைகளில் ஸ்ரீ மகாலட்சுமி பூஜை செய்யவும்." },
  Saturn: { kn: "ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ ಹಾಗೂ ಬಡವರಿಗೆ ಎಳ್ಳಿನ ದಾನ ಮಾಡಿ.", en: "Recite Sri Hanuman Chalisa on Saturdays and donate sesame seeds.", hi: "शनिवार को श्री हनुमान चालीसा का पाठ करें।", te: "శనివారం శ్రీ హనుమాన్ చాలీసా పఠించండి.", ta: "சனிக்கிழமைகளில் ஸ்ரீ ஹனுமான் சாலீசா பாராயணம் செய்யவும்." },
  Rahu: { kn: "ಶನಿವಾರ/ಮಂಗಳವಾರ ಶ್ರೀ ದುರ್ಗಾ ಸಪ್ತಶತಿ ಪಠಿಸಿ ಹಾಗೂ ಕಪ್ಪು ಉದ್ದು ದಾನ ಮಾಡಿ.", en: "Recite Sri Durga Saptashati and donate black gram.", hi: "श्री दुर्गा सप्तशती का पाठ करें।", te: "శ్రీ దుర్గా సప్తశతి పారాయణం చేయండి.", ta: "ஸ்ரீ துர்க்கா சப்தசதி பாராயணம் செய்யவும்." },
  Ketu: { kn: "ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿಯಂದು ಶ್ರೀ ಗಣೇಶ ಸಂಕಟನಾಶನ ಸ್ತೋತ್ರ ಪಠಿಸಿ.", en: "Recite Sri Ganesha Sankata Nashana Stotra on Sankashti Chaturthi.", hi: "संकष्टी चतुर्थी को श्री गणेश संकटनाशन स्तोत्र का पाठ करें।", te: "శ్రీ గణేశ సంకటనాశన స్తోత్రం పఠించండి.", ta: "ஸ்ரீ கணேச சங்கடநாசன ஸ்தோத்திரம் பாராயணம் செய்யவும்." }
};
'''

if "PLANET_REMEDY_MAP_L5" not in content:
    content = content.replace("const renderSouthIndianGrid", remedy_map_code + "\nconst renderSouthIndianGrid")

# Dynamic Page 3 calculation inside RoyalBooklet8PageTemplate
memo_dasha_cards = '''  const dashaCardsData = React.useMemo(() => {
    if (!birthKundli) return [];
    const timeline = generateBhuktiTimeline(birthKundli, 100);
    if (!timeline || timeline.length === 0) return [];

    let bDate = new Date();
    if (dobStr && /^\\d{4}-\\d{2}-\\d{2}$/.test(dobStr)) {
      bDate = new Date(dobStr + "T12:00:00");
    }

    const now = new Date();
    const currentAgeDecimal = Math.max(0, (now.getTime() - bDate.getTime()) / (365.25 * 86400000));

    let activeIdx = timeline.findIndex(b => currentAgeDecimal >= b.startAge && currentAgeDecimal < b.endAge);
    if (activeIdx < 0) activeIdx = 0;

    const selectedSpans = timeline.slice(activeIdx, activeIdx + 5);

    return selectedSpans.map((span, idx) => {
      const isCurrent = idx === 0;
      const mahaName = (PLANET_SHORT_L5[span.maha] as any)?.[code] || span.maha;
      const bhuktiName = (PLANET_SHORT_L5[span.bhukti] as any)?.[code] || span.bhukti;

      const startDate = new Date(bDate.getTime() + span.startAge * 365.25 * 86400000);
      const endDate = new Date(bDate.getTime() + span.endAge * 365.25 * 86400000);
      const startYmd = startDate.toISOString().split("T")[0];
      const endYmd = endDate.toISOString().split("T")[0];

      const startAgeInt = Math.floor(span.startAge);
      const endAgeInt = Math.ceil(span.endAge);

      const bhuktiPos = birthKundli.planets.find(p => p.name === span.bhukti);
      const house = bhuktiPos ? bhuktiPos.house : 1;
      const isGood = [1, 4, 5, 7, 9, 10, 11].includes(house);

      let badgeText = "";
      if (isCurrent) {
        badgeText = code === "kn" ? "📌 ಪ್ರಸ್ತುತ ನಡವಳಿಕೆ" : (code === "hi" ? "📌 वर्तमान समय" : "📌 Current Active Period");
      } else if (isGood) {
        badgeText = code === "kn" ? "✨ ಶುಭ ಯೋಗ & ಧನ ವೃದ್ಧಿ" : (code === "hi" ? "✨ शुभ योग व धन वृद्धि" : "✨ Favorable Prosperity Period");
      } else {
        badgeText = code === "kn" ? "⚖️ ಪರಿಶ್ರಮ & ಸ್ಥಿರ ಕರ್ಮ" : (code === "hi" ? "⚖️ परिश्रम व धैर्य काल" : "⚖️ Patience & Discipline Period");
      }

      const careerText = isGood
        ? (code === "kn" ? `${bhuktiName} ದಶೆಯಲ್ಲಿ ಉದ್ಯೋಗ ಪ್ರಗತಿ, ಜವಾಬ್ದಾರಿ ಹೆಚ್ಚಳ ಹಾಗೂ ವೃತ್ತಿರಂಗದಲ್ಲಿ ಯಶಸ್ಸು.` : `Career advancement and positive achievements under ${bhuktiName} period.`)
        : (code === "kn" ? `${bhuktiName} ದಶೆಯಲ್ಲಿ ವೃತ್ತಿಯಲ್ಲಿ ತಾಳ್ಮೆ, ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಹಾಗೂ ದೀರ್ಘಕಾಲಿಕ ಅನುಭವ ಸಿದ್ಧಿ.` : `Career stability requiring patience and focused dedication during ${bhuktiName} period.`);

      const financeText = isGood
        ? (code === "kn" ? `ಆದಾಯ ಮೂಲಗಳ ವೃದ್ಧಿ, ಆಸ್ತಿ ಹೂಡಿಕೆಯಲ್ಲಿ ಅನುಕೂಲ ಹಾಗೂ ಆರ್ಥಿಕ ಭದ್ರತೆ.` : `Financial growth, property investments, and monetary stability.`)
        : (code === "kn" ? `ಧನ ಶೇಖರಣೆಯಲ್ಲಿ ಜಾಗರೂಕತೆ, ನಿಯಂತ್ರಿತ ಖರ್ಚು ಹಾಗೂ ಭವಿಷ್ಯದ ಸುರಕ್ಷಿತ ಹೂಡಿಕೆ.` : `Disciplined savings, prudent expenditure, and secure long-term investments.`);

      const familyText = isGood
        ? (code === "kn" ? `ಗೃಹದಲ್ಲಿ ಸಂತೋಷ, ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಹಾಗೂ ಸುಖಕರ ಕುಟುಂಬ ಜೀವನ.` : `Domestic peace, elders' blessings, and harmonious family environment.`)
        : (code === "kn" ? `ಕುಟುಂಬದಲ್ಲಿ ಪರಸ್ಪರ ಸಹನೆ, ಸೌಹಾರ್ದಯುತ ಮಾತುಕತೆ ಹಾಗೂ ಶಾಂತಿ ನಿರ್ವಹಣೆ.` : `Mutual understanding, patient communication, and peaceful domestic life.`);

      const remedyText = (PLANET_REMEDY_MAP_L5[span.bhukti] as any)?.[code] || PLANET_REMEDY_MAP_L5[span.bhukti]?.kn || "ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ ಹಾಗೂ ಬಡವರಿಗೆ ದಾನ ಮಾಡಿ.";

      return {
        mahaName,
        bhuktiName,
        startYmd,
        endYmd,
        startAgeInt,
        endAgeInt,
        isCurrent,
        badgeText,
        careerText,
        financeText,
        familyText,
        remedyText
      };
    });
  }, [birthKundli, dobStr, code]);
'''

if "const dashaCardsData =" not in content:
    content = content.replace("const userAge = React.useMemo(() => {", memo_dasha_cards + "\n\n  const userAge = React.useMemo(() => {")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Added dashaCardsData memo calculation to RoyalBooklet8PageTemplate.tsx successfully.")
