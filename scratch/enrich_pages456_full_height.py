filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update page4Data and page5Data memo hooks
s_memo_marker = "  // ─── DYNAMIC PAGE 4 DATA (Characteristics, Nigoodha Rahasya & Prastuta Jeevana) ───"
e_memo_marker = "  // ─── DYNAMIC PAGE 6 DATA (8-Month Roadmap - 240 Days) ───"

s_memo_idx = content.find(s_memo_marker)
e_memo_idx = content.find(e_memo_marker)

print(f"s_memo_idx: {s_memo_idx}, e_memo_idx: {e_memo_idx}")

new_memos = '''  // ─── DYNAMIC PAGE 4 DATA (Characteristics, Nigoodha Rahasya & Prastuta Jeevana) ───
  const page4Data = React.useMemo(() => {
    if (!birthKundli) return null;
    const isKn = code === "kn";
    const isHi = code === "hi";

    const moon = birthKundli.planets.find(p => p.name === "Moon");
    const lagnaRashiName = birthKundli.lagnaRashi ? birthKundli.lagnaRashi.sanskrit : "ಲಗ್ನ";
    const moonRashiName = birthKundli.moonSign ? birthKundli.moonSign.sanskrit : "ರಾಶಿ";
    const nakshatraName = moon && moon.nakshatra ? moon.nakshatra.sanskrit : "ನಕ್ಷತ್ರ";

    let card1Text1 = "";
    let card1Text2 = "";
    if (isKn) {
      card1Text1 = `${displayName} ಅವರ ಜನ್ಮ ಲಗ್ನ ${lagnaRashiName} ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ ${moonRashiName} (ನಕ್ಷತ್ರ: ${nakshatraName}) ಆಗಿದೆ. ಲಗ್ನಾಧಿಪತಿಯ ಸೌಮ್ಯ ಹಾಗೂ ಬಲವಾದ ಪ್ರಭಾವದಿಂದ ನಿಮ್ಮ ಆಲೋಚನೆಗಳಲ್ಲಿ ಸದಾ ಸಾತ್ವಿಕ ತೇಜಸ್ಸು, ಆತ್ಮಗೌರವ ಹಾಗೂ ಉನ್ನತ ಧರ್ಮ ಶ್ರದ್ಧೆ ಜಾಗೃತವಾಗಿರುತ್ತದೆ. ನೀವು ಕೈಗೊಳ್ಳುವ ಪ್ರತಿಯೊಂದು ಕಾರ್ಯದಲ್ಲೂ ಸ್ವಪ್ರಯತ್ನ, ಕಾರ್ಯಕ್ಷಮತೆ ಹಾಗೂ ಸಮಯ ಪ್ರಜ್ಞೆಗೆ ಅತ್ಯಂತ ಆದ್ಯತೆ ನೀಡುವಿರಿ. ಸತ್ಯವಂತಿಕೆ, ನ್ಯಾಯಪರತೆ ಹಾಗೂ ಅನ್ಯಾಯವನ್ನು ಸಹಿಸದ ನಿರ್ಭೀತ ಗುಣ ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದ ಮುಖ್ಯ ದಿವ್ಯ ಲಕ್ಷಣವಾಗಿದೆ.`;
      card1Text2 = `ಕೇಂದ್ರ ಹಾಗೂ ತ್ರಿಕೋಣ ಭಾವಗಳ ಶುಭ ಸ್ಥಿತಿಯಿಂದಾಗಿ ನಿಮ್ಮ ಆಲೋಚನಾ ಶಕ್ತಿ ಅತ್ಯಂತ ಚುರುಕಾಗಿದ್ದು, ಸಮಾಜದಲ್ಲಿ ಗೌರವಾನ್ವಿತ ಸಾಂಸ್ಥಿಕ ಮಾರ್ಗದರ್ಶಕರಾಗಿ ಗುರುತಿಸಿಕೊಳ್ಳುವಿರಿ. ಯಾವುದೇ ಸವಾಲು ಅಥವಾ ಪ್ರಬಲ ವಿರೋಧ ಎದುರಾದರೂ, ಆಂತರಿಕ ಧೈರ್ಯ ಹಾಗೂ ಪವಿತ್ರ ಬೌದ್ಧಿಕ ಚಾತುರ್ಯದಿಂದ ಸಕಲ ವಿಘ್ನಗಳನ್ನು ನಿವಾರಿಸಿಕೊಂಡು ನಿರಂತರ ಯಶಸ್ಸಿನ ಹಾದಿಯಲ್ಲಿ ಮುನ್ನಡೆಯುವಿರಿ.`;
    } else if (isHi) {
      card1Text1 = `${displayName} का जन्म लग्न ${lagnaRashiName} तथा चंद्र राशि ${moonRashiName} (नक्षत्र: ${nakshatraName}) है। लग्नेश के प्रभाव से आपमें स्वाभिमान, धर्मनिष्ठा और कार्यकुशलता की प्रबलता रहती है। आप अपनी सत्यनिष्ठा और न्यायप्रियता के लिए समाज में जाने जाते हैं।`;
      card1Text2 = `केन्द्र व त्रिकोण भावों की शुभ स्थिति से आपकी निर्णय क्षमता अत्यंत तीव्र है। किसी भी कठिन परिस्थिति में आप अपने बौद्धिक चातुर्य से विजय प्राप्त करते हैं।`;
    } else {
      card1Text1 = `The birth Lagna of ${displayName} is ${lagnaRashiName} and Moon Sign is ${moonRashiName} (Nakshatra: ${nakshatraName}). Influenced by the ascendant lord, your core personality exhibits self-respect, high ethical standards, and meticulous dedication. You are deeply respected for your integrity, analytical focus, and commitment to truth.`;
      card1Text2 = `Harmonious Kendra and Trikona house placements confer sharp decision-making capabilities, organizational leadership, and an indomitable spirit that successfully navigates all life challenges.`;
    }

    let nigoodhaText1 = "";
    let nigoodhaText2 = "";
    if (isKn) {
      nigoodhaText1 = `ನಿಮ್ಮ ಪ್ರಶಾಂತ ಹಾಗೂ ಸೌಮ್ಯ ಮುಖಭಾವದ ಅಡಿಯಲ್ಲಿ ತೀವ್ರವಾದ ಆಂತರಿಕ ನಿಗೂಢ ಕೋಪ, ಅಸಹನೆ ಹಾಗೂ ಮಾನಸಿಕ ಉಗ್ರತೆ ಅಡಗಿದೆ. ಅಂದುಕೊಂಡ ಕಾರ್ಯಗಳು ಅನಿರೀಕ್ಷಿತವಾಗಿ ವಿಳಂಬವಾದಾಗ ಅಥವಾ ನೆಚ್ಚಿನ ಜನರಿಂದ ನಂಬಿಕೆಗೆ ಧಕ್ಕೆ ಉಂಟಾದಾಗ ಮನಸ್ಸಿನ ಒಳಗಡೆ ತೀವ್ರ ಅಶಾಂತಿ ಜಾಗೃತಗೊಳ್ಳುತ್ತದೆ. ಈ ಆಂತರಿಕ ಕೋಪವನ್ನು ಹೊರಹಾಕದೆ ಮನಸ್ಸಿನಲ್ಲೇ ಬಂಧಿಸಿಡುವುದರಿಂದ ಕೆಲವೊಮ್ಮೆ ಶಿರೋವೇದನೆ, ರಕ್ತದೊತ್ತಡ ಹಾಗೂ ನಿದ್ರಾಹೀನತೆಯಂತಹ ಸಮಸ್ಯೆಗಳು ಎದುರಾಗಬಹುದು.`;
      nigoodhaText2 = `ಆತುರದ ಆವೇಶದ ಕ್ಷಣಗಳಲ್ಲಿ ಆಡುವ ಬಾಣದಂತಹ ಮಾತುಗಳು ಆಪ್ತ ಸಂಬಂಧಗಳಲ್ಲಿ ಬಿರುಕು ಮೂಡಿಸದಂತೆ ಸದಾ ಎಚ್ಚರ ವಹಿಸುವುದು ಅತ್ಯಂತ ಆವಶ್ಯಕವಾಗಿದೆ. ಕೋಪ ಶಮನ ಹಾಗೂ ಮಾನಸಿಕ ಶಾಂತಿಗಾಗಿ ನಿತ್ಯ ೧೦ ನಿಮಿಷ ಪ್ರಾಣಾಯಾಮ, ಶ್ರೀ ಹನುಮಾನ್ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ರುದ್ರಾಭಿಷೇಕ ಸ್ಮರಣೆಯು ಆಂತರಿಕ ಉಗ್ರತೆಯನ್ನು ಶಮನಗೊಳಿಸಿ ನಿರಂತರ ತೇಜಸ್ಸು ನೀಡುತ್ತದೆ.`;
    } else if (isHi) {
      nigoodhaText1 = `आपके शांत स्वभाव के पीछे एक गुप्त आंतरिक क्रोध और असंतोष छुपा रहता है। जब कार्य में विलंब होता है, तो मन में तीव्र उग्रता जागृत होती है। इसे मन में दबाने से मानसिक तनाव हो सकता है।`;
      nigoodhaText2 = `क्रोध में कठोर शब्दों के प्रयोग से बचें। शांति हेतु नित्य प्राणायाम करें तथा श्री गोಕರ್ಣ महाबलेश्वर मंदिर के रुद्राभिषेक का स्मरण करें।`;
    } else {
      nigoodhaText1 = `Beneath your calm exterior lies a subtle hidden layer of intense impatience and inner anger when expected outcomes are delayed or trust is breached. Internalizing this anger can cause stress and insomnia.`;
      nigoodhaText2 = `Exercise care with hasty words during moments of frustration. Daily pranayama and remembrance of Sri Gokarna Mahabaleshwara Rudrabhishekam bring deep emotional serenity.`;
    }

    const activeCard = dashaCardsData && dashaCardsData.length > 0 ? dashaCardsData[0] : null;
    const mahaName = activeCard ? activeCard.mahaName : (isKn ? "ಗುರು" : "Jupiter");

    let prastutaCareer = "";
    let prastutaFamily = "";
    let prastutaFinance = "";
    let prastutaHealth = "";

    if (isKn) {
      prastutaCareer = `${displayName} ಅವರ ಜನ್ಮ ಕುಂಡಲಿಯ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ಪ್ರಸ್ತುತ ${mahaName} ಮಹಾದಶಾ ನಾಥನ ಶುಭ ಬಲದಿಂದ ವೃತ್ತಿರಂಗದಲ್ಲಿ ಪ್ರಮುಖ ಬಡ್ತಿ, ನೂತನ ಜವಾಬ್ದಾರಿ ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ಅಧಿಕಾರ ವೃದ್ಧಿ ಅತ್ಯಂತ ನಿಶ್ಚಿತವಾಗಿದೆ. ಸಂಸ್ಥೆಯಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷಮತೆ ಹಾಗೂ ಸೃಜನಶೀಲ ನಾಯಕತ್ವಕ್ಕೆ ಉನ್ನತಾಧಿಕಾರಿಗಳಿಂದ ಅತ್ಯುನ್ನತ ಗೌರವ ಮತ್ತು ಮಾನ್ಯತೆ ದೊರೆಯಲಿದೆ.`;
      prastutaFamily = `ನಿಮ್ಮ ಕುಂಡಲಿಯ ಚಂದ್ರ ಹಾಗೂ ಗುರು ಗ್ರಹಗಳ ಪವಿತ್ರ ದೃಷ್ಟಿಯಿಂದ ಗೃಹದಲ್ಲಿ ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಬಲ, ದಾಂಪತ್ಯ ಸೌಖ್ಯ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿಯ ಸಂತಾನ ಯೋಗಕ್ಕೆ ಅತ್ಯಂತ ಪೂರಕ ವಾತಾವರಣ ಉಂಟಾಗಲಿದೆ. ನೂತನ ದೇವತಾ ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳು ಹಾಗೂ ಶುಭ ಮಂಗಲೋತ್ಸವಗಳು ವಿಜೃಂಭಣೆಯಿಂದ ನೆರವೇರಲಿವೆ.`;
      prastutaFinance = `ದೀರ್ಘಕಾಲಿಕ ಭೂಮಿ, ಮನೆ ಅಥವಾ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿಗಳ ಯೋಜನಾ ಹೂಡಿಕೆಗಳಿಗೆ ಪ್ರಸ್ತುತ ಗುರು ಹಾಗೂ ಶನಿ ಗ್ರಹಗಳ ಸಂಚಾರವು ಅತ್ಯಂತ ಶುಭ ಫಲ ನೀಡಲಿದೆ. ಅಪಾಯಕಾರಿ ಆತುರದ ಶೇರು ವಹಿವಾಟುಗಳನ್ನು ಹೊರತುಪಡಿಸಿ, ಶಿಸ್ತುಬದ್ಧ ನಿಧಿ ಶೇಖರಣೆಯಿಂದ ಸಮಾಜದಲ್ಲಿ ಆರ್ಥಿಕ ಸುದೃಢತೆ ಮತ್ತು ಸಮೃದ್ಧಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`;
      prastutaHealth = `ಮಾನಸಿಕ ಒತ್ತಡ ಹಾಗೂ ಆತಂಕ ಶಮನಕ್ಕೆ ನಿತ್ಯ ಧ್ಯಾನ, ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವನೆ ಹಾಗೂ ಪರ್ಯಾಪ್ತ ನಿದ್ರೆ ಅತ್ಯಗತ್ಯ. ದೂರದ ಪ್ರಯಾಣಗಳ ವೇಳೆಯಲ್ಲಿ ಸೂಕ್ತ ವಿಶ್ರಾಂತಿ ಪಡೆಯುವುದರಿಂದ ಸಂಪೂರ್ಣ ದೈಹಿಕ ಚೇತರಿಕೆ ಹಾಗೂ ಉಲ್ಲಾಸ ಸದಾ ಕಾಯ್ದುಕೊಳ್ಳಬಹುದು.`;
    } else {
      prastutaCareer = `Under the influence of the Ascendant Lord and active ${mahaName} Mahadasha, significant career advancement, leadership roles, and organizational recognition are indicated.`;
      prastutaFamily = `Benefic aspects of Jupiter and Moon foster marital harmony, family peace, and auspicious domestic celebrations with elders' blessings.`;
      prastutaFinance = `Favorable transits of Saturn and Jupiter support long-term investments in real estate and property, resulting in steady financial consolidation.`;
      prastutaHealth = `Prioritize balanced nutrition and mindfulness practices to manage work stress and maintain high physical energy.`;
    }

    return {
      card1Text1,
      card1Text2,
      nigoodhaText1,
      nigoodhaText2,
      prastutaCareer,
      prastutaFamily,
      prastutaFinance,
      prastutaHealth
    };
  }, [birthKundli, dashaCardsData, code]);


  // ─── DYNAMIC PAGE 5 DATA (Yogas, Doshas & Live Gochara Transits) ───
  const page5Data = React.useMemo(() => {
    if (!birthKundli) return null;
    const isKn = code === "kn";

    let yogaText1 = "";
    let yogaText2 = "";
    if (isKn) {
      yogaText1 = `${displayName} ಅವರ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಚಂದ್ರರ ಪವಿತ್ರ ಸಮಸಪ್ತಕ ದೃಷ್ಟಿ ಸಂಯೋಗದಿಂದ 'ಗಜಕೇಸರಿ ರಾಜಯೋಗ' ಅತ್ಯಂತ ಶಕ್ತಿಯುತವಾಗಿ ಜಾಗೃತಗೊಂಡಿದೆ. ಈ ದಿವ್ಯ ರಾಜಯೋಗದ ಅನುಗ್ರಹದಿಂದ ಸಮಾಜದಲ್ಲಿ ಗೌರವಾನ್ವಿತ ಸ್ಥಾನಮಾನ, ಆಪತ್ತಿನ ವೇಳೆಯಲ್ಲಿ ಜಯ ತಂದುಕೊಡುವ ದೈವಿಕ ರಕ್ಷಣೆ ಹಾಗೂ ಸ್ಥಿರವಾದ ಯಶಸ್ಸು ಲಭಿಸಲಿದೆ. ನಿಮ್ಮ ವೃತ್ತಿ ಅಥವಾ ವ್ಯಾಪಾರ ಕ್ಷೇತ್ರದಲ್ಲಿ ಎಂತಹ ಪ್ರಬಲ ಪ್ರತಿರೋಧಗಳು ಎದುರಾದರೂ, ಆಂತರಿಕ ಬೌದ್ಧಿಕ ದಕ್ಷತೆ ಹಾಗೂ ಧೈರ್ಯದಿಂದ ಎಲ್ಲವನ್ನೂ ಮೆಟ್ಟಿ ನಿಂತು ಅಗ್ರಸ್ಥಾನ ಗಳಿಸುವಿರಿ. ದೇವಗುರುವಿನ ಶುಭ ದೃಷ್ಟಿಯು ಮನಸ್ಸಿನಲ್ಲಿ ಸದಾ ಧಾರ್ಮಿಕ ಆಲೋಚನೆ ಹಾಗೂ ಸತ್ಯದ ಹಾದಿಯಲ್ಲಿ ನಡೆಯುವ ವಿವೇಕವನ್ನು ನೀಡುತ್ತದೆ.`;
      yogaText2 = `ಲಗ್ನ ಹಾಗೂ ತ್ರಿಕೋಣ ಭಾವಗಳ ಅಧಿಪತಿಗಳ ಬಲವಾದ ಸಂಯೋಜನೆಯಿಂದ 'ಬುಧಾದಿತ್ಯ ಯೋಗ' ಹಾಗೂ 'ಲಕ್ಷ್ಮಿ ಯೋಗ' ಸಿದ್ಧಿಸಿದ್ದು, ತೀಕ್ಷ್ಣ ಗ್ರಹಣ ಶಕ್ತಿ, ಸಮಯೋಚಿತ ನಿರ್ಧಾರ ಹಾಗೂ ಅಪಾರ ಆರ್ಥಿಕ ಸಂಪತ್ತನ್ನು ಖಾತ್ರಿಪಡಿಸುತ್ತದೆ. ಧನ ಹಾಗೂ ಲಾಭ ಭಾವಗಳ ಮೇಲೆ ಶುಭ ಗ್ರಹಗಳ ಸೌಮ್ಯ ದೃಷ್ಟಿ ಇರುವ ಕಾರಣ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ನೂತನ ಗೃಹ ನಿರ್ಮಾಣ ಹಾಗೂ ಶೇರು/ಉದ್ಯೋಗ ಹೂಡಿಕೆಗಳಲ್ಲಿ ನಿರಂತರ ಧನ ಹರಿವು ಉಂಟಾಗಲಿದೆ. ಮಹತ್ವಾಕಾಂಕ್ಷೆಯ ಪ್ರತಿಯೊಂದು ಗುರಿಯೂ ಸಿದ್ದಿಯಾಗಲಿದೆ.`;
    } else {
      yogaText1 = `In the natal chart of ${displayName}, the sacred aspectual alignment of Jupiter and Moon forms a powerful 'Gajakesari Rajayoga'. This bestows divine protection, high status, and enduring success. No matter how challenging the professional opposition, your wisdom and courage will ensure triumph.`;
      yogaText2 = `Strong Kendra-Trikona lord associations form 'Budhaditya Yoga' and 'Lakshmi Yoga', guaranteeing sharp intellect, timely decision-making, and financial growth through real estate and sound investments.`;
    }

    let doshaText1 = "";
    let doshaText2 = "";
    if (isKn) {
      doshaText1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ರಾಹು-ಕೇತು ಅಥವಾ ಮಂಗಳ ಗ್ರಹದ ಸೂಕ್ಷ್ಮ ಭಾವ ಸ್ಥಾನದಿಂದಾಗಿ ಆತುರದ ಆರ್ಥಿಕ ನಿರ್ಧಾರಗಳು ಹಾಗೂ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಸಣ್ಣಪುಟ್ಟ ಬಿರುಕು ಎದುರಾಗುವ ಕರ್ಮಿಕ ದೋಷ ಗೋಚರಿಸುತ್ತದೆ. ಶನಿ ದೇವನ ೭.೫/ಅರ್ಧಾಷ್ಟಮ ಗೋಚಾರ ಪ್ರಭಾವದಿಂದ ಅಪೇಕ್ಷಿತ ಫಲಗಳ ಲಭ್ಯತೆಯಲ್ಲಿ ವಿಳಂಬ ಉಂಟಾಗಬಹುದು. ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ ತಕ್ಷಣ ಸಿಗದೆ ಮಾನಸಿಕ ಸವಾಲು ಎದುರಾಗಬಹುದು.`;
      doshaText2 = `ಈ ಕರ್ಮಿಕ ದೋಷ ಶಮನಕ್ಕಾಗಿ ಪ್ರತಿ ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ, ಬಡವರಿಗೆ ಅನ್ನದಾನ ಮಾಡಿ ಹಾಗೂ ಪವಿತ್ರ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ನೆರವೇರಿಸಿ. ಗೋಕರ್ಣ ಪಂಚಾಂಗದ ಸಿದ್ಧ ಮುಹೂರ್ತದಲ್ಲಿ ಶನಿ ಶಾಂತಿ ಪೂಜೆ ಹಾಗೂ ತಿಲ ಹೋಮ ನೆರವೇರಿಸುವುದರಿಂದ ಗ್ರಹ ದೋಷಗಳು ಸಂಪೂರ್ಣ ಶಮನಗೊಂಡು ವಿಜಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`;
    } else {
      doshaText1 = `Karmic influences from Rahu-Ketu or Mars house positions indicate occasional relationship friction or financial delays during Saturn transits.`;
      doshaText2 = `To mitigate these karmic challenges, recite Sri Hanuman Chalisa on Saturdays, engage in charity, and offer Rudrabhishekam at Sri Gokarna Mahabaleshwara temple.`;
    }

    let gocharaText1 = "";
    let gocharaText2 = "";
    if (isKn) {
      gocharaText1 = `ವರ್ತಮಾನ ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರದಲ್ಲಿ ಶನಿ ದೇವನ ಪ್ರಸ್ತುತ ಸ್ಥಾನವು ನಿಮ್ಮ ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಿಸ್ತು, ಕಠಿಣ ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ಹಾಗೂ ತಾಳ್ಮೆಯ ಪರೀಕ್ಷೆಯನ್ನು ನಡೆಸುತ್ತಿದೆ. ಆತುರದ ಹೂಡಿಕೆ ಅಥವಾ ಶಾರ್ಟ್‌ಕಟ್ ಮಾರ್ಗಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತ್ಯಜಿಸಿ, ಹಿರಿಯ ಅನುಭವಿಗಳ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಶ್ರಮಿಸುವುದರಿಂದ ವೃತ್ತಿ ರಂಗದಲ್ಲಿ ಸುದೀರ್ಘ ಭದ್ರತೆ ಹಾಗೂ ಅತ್ಯುನ್ನತ ಆಡಳಿತಾತ್ಮಕ ಸ್ಥಾನಮಾನ ದೊರೆಯಲಿದೆ. ಗೋಚಾರ ಶನಿಯು ಭವಿಷ್ಯದಲ್ಲಿ ಸುದೃಢ ಅಡಿಪಾಯ ನಿರ್ಮಿಸಲಿದ್ದಾನೆ.`;
      gocharaText2 = `ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಕೂಲಕರ ಗೋಚಾರ ಸಂಚಾರ ಹಾಗೂ ನವಮ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಆಶಾಭಾವನೆ, ಅಪಾರ ಧನ ಆಗಮನ ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಸಾಂಸಾರಿಕ ಸಂತೋಷವನ್ನು ಹೆಚ್ಚಿಸಲಿದೆ. ಕುಟುಂಬದಲ್ಲಿ ಶುಭ ಮಂಗಲೋತ್ಸವಗಳ ಆಯೋಜನೆಗೆ ಅತ್ಯಂತ ಪೂರಕ ವಾತಾವರಣವಿದೆ. ಪ್ರಸ್ತುತ ಸಮಯವು ಶ್ರೀ ಗೋಕರ್ಣ ಪಂಚಾಂಗದ ಪವಿತ್ರ ಮುಹೂರ್ತಗಳಲ್ಲಿ ದೇವತಾ ಸೇವೆಗಳನ್ನು ನೆರವೇರಿಸಲು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವಾಗಿದೆ.`;
    } else {
      gocharaText1 = `Current Saturn transit tests professional patience and discipline. Avoiding hasty financial shortcuts while working under experienced guidance guarantees long-term stability.`;
      gocharaText2 = `Jupiter's favorable transit aspects bring financial gains, family happiness, and auspicious divine opportunities for Seva and Pujas at Gokarna.`;
    }

    return {
      yogaText1,
      yogaText2,
      doshaText1,
      doshaText2,
      gocharaText1,
      gocharaText2
    };
  }, [birthKundli, code]);
'''

content = content[:s_memo_idx] + new_memos + content[e_memo_idx:]

# 2. Update JSX layout for Pages 4, 5, 6 with larger fonts, better gaps, and complete A4 coverage
s_jsx_marker = "{/* ─────────────────────────────────────────────────────────────\n          PAGE 4:"
e_jsx_marker = "{/* ─────────────────────────────────────────────────────────────\n          PAGE 7: ROYAL 90-DAY CALENDAR SYNC"

s_jsx_idx = content.find(s_jsx_marker)
e_jsx_idx = content.find(e_jsx_marker)

print(f"s_jsx_idx: {s_jsx_idx}, e_jsx_idx: {e_jsx_idx}")

new_jsx = '''{/* ─────────────────────────────────────────────────────────────
          PAGE 4: CHARACTERISTICS, NEEGOODAH RAHASYA & PRASTUTA JEEVANA
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "12px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "8px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೩: ವ್ಯಕ್ತಿತ್ವ, ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಜೀವನದ ಹಂತ" : "Chapter 3: Personal Characteristics, Hidden Truth & Current Life Phase"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ನಕ್ಷತ್ರ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿಯ ಆಧಾರದ ಮೇಲೆ ಸಿದ್ಧಪಡಿಸಿದ ವ್ಯಕ್ತಿತ್ವ ವಿಶ್ಲೇಷಣೆ" : "Comprehensive breakdown of personality traits, hidden karmic patterns, and current life phase."}
            </div>
          </div>

          {/* Content Stack - 3 Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Card 1: Characteristics (ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ಜನ್ಮ ಗುಣಲಕ್ಷಣಗಳು) */}
            <div style={{ background: "#FFFDF5", border: "1.5px solid #D97706", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🌟 {code === "kn" ? "ಜನ್ಮ ಗುಣಲಕ್ಷಣಗಳು & ವ್ಯಕ್ತಿತ್ವ ವಿಶ್ಲೇಷಣೆ" : "Birth Characteristics & Personality Synthesis"}</span>
                <span style={{ fontSize: "11.5px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ಸ್ವಭಾವ ಬಲ" : "Core Traits"}</span>
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify" }}>
                {page4Data?.card1Text1}
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify", marginTop: "8px", borderTop: "1px solid #FDE68A", paddingTop: "8px" }}>
                🌟 {page4Data?.card1Text2}
              </div>
            </div>

            {/* Card 2: Nigoodha Rahasya (ನಿಗೂಢ ರಹಸ್ಯ - ಗೋಪ್ಯ ಸತ್ಯ) */}
            <div style={{ background: "#FFF1F2", border: "1.5px solid #F43F5E", borderRadius: "8px", padding: "12px 16px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#991B1B", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🔮 {code === "kn" ? "ಅಂತರಂಗದ ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಕೋಪ" : "Nigoodha Rahasya: Inner Secret & Spiritual Remedy"}</span>
                <span style={{ fontSize: "11.5px", color: "#9F1239", background: "#FFE4E6", border: "1px solid #F43F5E", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ಆಂತರಿಕ ಶಮನ" : "Hidden Karma"}</span>
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#881337", textAlign: "justify" }}>
                {page4Data?.nigoodhaText1}
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#991B1B", textAlign: "justify", marginTop: "8px", borderTop: "1px solid #FECDD3", paddingTop: "8px", fontWeight: 600 }}>
                🕊️ {page4Data?.nigoodhaText2}
              </div>
            </div>

            {/* Card 3: Prastuta Jeevana (ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ ಹಾಗೂ ೪ ಮುಖ್ಯಾಂಶಗಳು) */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "8px", padding: "12px 16px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🌅 {code === "kn" ? "ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ ಹಾಗೂ ೪ ಮುಖ್ಯಾಂಶಗಳು" : "Prastuta Jeevana: Current Life Stage & 4 Key Pillars"}</span>
                <span style={{ fontSize: "11.5px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ವರ್ತಮಾನ ಘಟ್ಟ" : "Active Stage"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", lineHeight: "1.6" }}>
                <div style={{ background: "#FEF3C7", padding: "8px 12px", borderRadius: "6px" }}>
                  <strong style={{ color: "#065F46", display: "block", marginBottom: "3px", fontSize: "12.5px" }}>💼 {code === "kn" ? "ವೃತ್ತಿ ಉದ್ಯೋಗ & ಅಧಿಕಾರ ಸ್ಥಾನ:" : "Career, Business & Position:"}</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>{page4Data?.prastutaCareer}</div>
                </div>
                <div style={{ background: "#F5F3FF", padding: "8px 12px", borderRadius: "6px" }}>
                  <strong style={{ color: "#5B21B6", display: "block", marginBottom: "3px", fontSize: "12.5px" }}>🏠 {code === "kn" ? "ಸಂಸಾರ, ದಾಂಪತ್ಯ & ಕುಟುಂಬ ಸುಖ:" : "Family, Marriage & Domestic Peace:"}</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>{page4Data?.prastutaFamily}</div>
                </div>
                <div style={{ background: "#ECFDF5", padding: "8px 12px", borderRadius: "6px" }}>
                  <strong style={{ color: "#047857", display: "block", marginBottom: "3px", fontSize: "12.5px" }}>💰 {code === "kn" ? "ಧನ-ಧಾನ್ಯ ಆಸ್ತಿ & ಆರ್ಥಿಕ ಭದ್ರತೆ:" : "Wealth, Finance & Assets:"}</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>{page4Data?.prastutaFinance}</div>
                </div>
                <div style={{ background: "#FFF1F2", padding: "8px 12px", borderRadius: "6px" }}>
                  <strong style={{ color: "#991B1B", display: "block", marginBottom: "3px", fontSize: "12.5px" }}>🌿 {code === "kn" ? "ಆರೋಗ್ಯ ದೈಹಿಕ ಶಕ್ತಿ & ಸಾತ್ವಿಕ ಸೌಖ್ಯ:" : "Health, Energy & Well-being:"}</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>{page4Data?.prastutaHealth}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          PAGE 5: YOGAS, DOSHAS & LIVE GOCHARA TRANSITS
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "12px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "8px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೪: ಜನ್ಮ ಕುಂಡಲಿ ಯೋಗಗಳು, ದೋಷಗಳು ಹಾಗೂ ಲೈವ್ ಗೋಚಾರ ಫಲಗಳು" : "Chapter 4: Planetary Yogas, Doshas & Live Gochara Transits"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿರುವ ಪ್ರಮುಖ ರಾಜಯೋಗಗಳು, ಗ್ರಹ ದೋಷ ವಿವೇಚನೆ ಹಾಗೂ ಗೋಚಾರ ಫಲಗಳ ನಿಖರ ವಿಶ್ಲೇಷಣೆ" : "In-depth breakdown of active Rajayogas, karmic challenges, and live Gochara transits."}
            </div>
          </div>

          {/* Content Stack - 3 Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Card 1: Yogas (ಜನ್ಮ ಕುಂಡಲಿಯ ಮುಖ್ಯ ರಾಜಯೋಗಗಳು & ಶುಭ ಗ್ರಹ ಬಲ) */}
            <div style={{ background: "#FFFDF5", border: "1.5px solid #D97706", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>✨ {code === "kn" ? "ಜನ್ಮ ಕುಂಡಲಿಯ ಮುಖ್ಯ ರಾಜಯೋಗಗಳು & ಶುಭ ಗ್ರಹ ಬಲ" : "Auspicious Rajayogas & Planetary Strengths"}</span>
                <span style={{ fontSize: "11.5px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center" }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>{code === "kn" ? "ರಾಜಯೋಗ ವಿಶ್ಲೇಷಣೆ" : "Rajayogas"}</span></span>
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify" }}>
                {page5Data?.yogaText1}
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify", marginTop: "8px", borderTop: "1px solid #FDE68A", paddingTop: "8px" }}>
                🌟 {page5Data?.yogaText2}
              </div>
            </div>

            {/* Card 2: Doshas & Gokarna Remedy (ಗ್ರಹ ದೋಷ ವಿವೇಚನೆ & ಸಿದ್ಧ ಗೋಕರ್ಣ ಪರಿಹಾರ) */}
            <div style={{ background: "#FFF5F5", border: "1.5px solid #F43F5E", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#991B1B", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>⚠️ {code === "kn" ? "ಗ್ರಹ ದೋಷ ವಿವೇಚನೆ & ಸಿದ್ಧ ಗೋಕರ್ಣ ಪರಿಹಾರ" : "Karmic Doshas & Gokarna Sacred Remedies"}</span>
                <span style={{ fontSize: "11.5px", color: "#9F1239", background: "#FFE4E6", border: "1px solid #F43F5E", padding: "2px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center" }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>{code === "kn" ? "ದೋಷ ಶಮನ" : "Karmic Remedies"}</span></span>
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#7F1D1D", textAlign: "justify" }}>
                {page5Data?.doshaText1}
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#991B1B", textAlign: "justify", marginTop: "8px", borderTop: "1px solid #FECDD3", paddingTop: "8px", fontWeight: 600 }}>
                🕉️ {page5Data?.doshaText2}
              </div>
            </div>

            {/* Card 3: Live Gochara Transits (ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಫಲಗಳು & ವರ್ತಮಾನ ಸಂಚಾರ) */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🍃 {code === "kn" ? "ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಫಲಗಳು & ವರ್ತಮಾನ ಸಂಚಾರ" : "Live Gochara Transits & Present Position"}</span>
                <span style={{ fontSize: "11.5px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center" }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>{code === "kn" ? "ವರ್ತಮಾನ ಗೋಚಾರ" : "Live Transits"}</span></span>
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify" }}>
                {page5Data?.gocharaText1}
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify", marginTop: "8px", borderTop: "1px solid #FDE68A", paddingTop: "8px" }}>
                🌿 {page5Data?.gocharaText2}
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          PAGE 6: 100% NEXT 8 MONTHS (240 DAYS) ROADMAP (2 COLUMNS x 4 ROWS)
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "10px", padding: "18px 16px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "8px 14px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#78350F", lineHeight: "1.25" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೫: ಮುಂಬರುವ ೮ ತಿಂಗಳುಗಳ (೨೪೦ ದಿನಗಳು) ಸಮಗ್ರ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಚರಣೆ ರೋಡ್‌ಮ್ಯಾಪ್" : "Chapter 5: Upcoming 8 Months (240 Days) Planetary Roadmap"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹ ಬಲ ಹಾಗೂ ದಶಾ-ಅಂತರ್ದಶಾ ಆಧಾರಿತ ಮುಂಬರುವ ೮ ತಿಂಗಳ ನಿಖರ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ" : "Dynamic month-by-month planetary guidance tailored to your chart."}
            </div>
          </div>

          {/* Special Sandhi / Transition Alert Banner */}
          <div style={{
            background: "#FEF2F2",
            border: "1.5px solid #EF4444",
            borderRadius: "7px",
            padding: "6px 12px",
            boxShadow: "0 2px 4px rgba(239, 68, 68, 0.05)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <div style={{ fontSize: "18px", transform: "translateY(-2px)" }}>⚡</div>
            <div style={{ fontSize: "11.5px", color: "#991B1B", lineHeight: "1.4", transform: "translateY(-2px)" }}>
              <strong style={{ color: "#7F1D1D" }}>{code === "kn" ? "ವಿಶೇಷ ಗೋಚಾರ & ದಶಾ ಸಂಧಿ ಜಾಗೃತಿ (೨೦೨೬-೨೦೨᱗):" : "Special Transit & Dasha Sandhi Awareness:"}</strong> {code === "kn" ? "ಗೋಚಾರ ಹಾಗೂ ದಶಾ ಸಂಧಿ ಕಾಲದಲ್ಲಿ ಮುಖ್ಯ ಆರ್ಥಿಕ ಒಪ್ಪಂದಗಳಲ್ಲಿ ತಾಳ್ಮೆ ವಹಿಸಿ, ಪೂಜಾ ಆರಾಧನೆ ಕಾಯ್ದುಕೊಳ್ಳಿ." : "Maintain patience and regular prayers during planetary transit shifts."}
            </div>
          </div>

          {/* 8-Month Detailed Grid (2 Columns x 4 Rows) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {page6Data.map((m: any, i: number) => {
              const bgColors = ["#FFFFFF", "#ECFDF5", "#F5F3FF", "#FFFFFF", "#FEF2F2", "#ECFDF5", "#EFF6FF", "#FFFBEB"];
              const borderColors = ["#FCD34D", "#10B981", "#8B5CF6", "#FCD34D", "#EF4444", "#10B981", "#3B82F6", "#F59E0B"];
              const textColors = ["#78350F", "#065F46", "#5B21B6", "#78350F", "#991B1B", "#065F46", "#1E40AF", "#78350F"];
              const badgeBgs = ["#FEF3C7", "#D1FAE5", "#EDE9FE", "#FEF3C7", "#FEE2E2", "#D1FAE5", "#DBEAFE", "#FEF3C7"];
              const badgeBorders = ["#F59E0B", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981", "#3B82F6", "#F59E0B"];
              const badgeColors = ["#92400E", "#065F46", "#5B21B6", "#92400E", "#991B1B", "#065F46", "#1E40AF", "#92400E"];

              return (
                <div key={i} style={{ background: bgColors[i % 8], border: `1.5px solid ${borderColors[i % 8]}`, borderRadius: "8px", padding: "10px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: textColors[i % 8], marginBottom: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>🗓️ {m.mTitle}</span>
                    <span style={{ fontSize: "11px", background: badgeBgs[i % 8], border: `1px solid ${badgeBorders[i % 8]}`, color: badgeColors[i % 8], padding: "3px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", height: "22px", boxSizing: "border-box" }}>
                      <span style={{ transform: "translateY(-4px)", display: "inline-block" }}>{m.badge}</span>
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", lineHeight: "1.45", color: textColors[i % 8] }}>
                    <div style={{ marginBottom: "3px" }}>1. <strong style={{ color: "#065F46" }}>{code === "kn" ? "ಫಲಾಫಲ:" : "Vibe:"}</strong> {m.f1}</div>
                    <div style={{ marginBottom: "3px" }}>2. <strong style={{ color: "#92400E" }}>{code === "kn" ? "ಉದ್ಯೋಗ/ಆರ್ಥಿಕ:" : "Focus:"}</strong> {m.f2}</div>
                    <div style={{ marginBottom: "3px" }}>3. <strong style={{ color: "#D97706" }}>{code === "kn" ? "ಸವಾಲು:" : "Caution:"}</strong> {m.f3}</div>
                    <div>4. <strong style={{ color: "#991B1B" }}>{code === "kn" ? "ಮಾರ್ಗದರ್ಶನ:" : "Remedy:"}</strong> {m.f4}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>
'''

content = content[:s_jsx_idx] + new_jsx + "\n\n      " + content[e_jsx_idx:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Enriched Pages 4, 5, 6 with complete A4 coverage and larger fonts successfully.")
