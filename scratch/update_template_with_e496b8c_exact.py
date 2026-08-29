import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace page4Data, page5Data, page6Data memo definitions
old_memos_regex = re.compile(
    r'// ─── DYNAMIC PAGE 4 DATA.*?return \[\s*\{ mTitle:.*?\}\s*\];\s*\}, \[birthKundli, code\]\);',
    re.DOTALL
)

new_memos_code = '''// ─── DYNAMIC PAGE 4 DATA (Characteristics, Nigoodha Rahasya & Prastuta Jeevana) ───
  const page4Data = React.useMemo(() => {
    if (!birthKundli) return null;
    const isKn = code === "kn";
    const isHi = code === "hi";
    const isTe = code === "te";
    const isTa = code === "ta";

    const moon = birthKundli.planets.find(p => p.name === "Moon");
    const sun = birthKundli.planets.find(p => p.name === "Sun");
    const lagnaRashiName = birthKundli.lagnaRashi ? birthKundli.lagnaRashi.sanskrit : "ಲಗ್ನ";
    const moonRashiName = birthKundli.moonSign ? birthKundli.moonSign.sanskrit : "ರಾಶಿ";
    const nakshatraName = moon && moon.nakshatra ? moon.nakshatra.sanskrit : "ನಕ್ಷತ್ರ";

    // 1. Characteristics
    let card1Text = "";
    if (isKn) {
      card1Text = `${displayName} ಅವರ ಜನ್ಮ ಲಗ್ನ ${lagnaRashiName} ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ ${moonRashiName} (ನಕ್ಷತ್ರ: ${nakshatraName}) ಆಗಿದೆ. ಲಗ್ನಾಧಿಪತಿಯ ಪ್ರಭಾವದಿಂದ ನಿಮ್ಮ ಆಲೋಚನೆಗಳಲ್ಲಿ ಸದಾ ಸಾತ್ವಿಕ ತೇಜಸ್ಸು, ಸ್ವಾಭಿಮಾನ ಹಾಗೂ ಶ್ರಮದಾಯಕ ದಕ್ಷತೆ ಜಾಗೃತವಾಗಿರುತ್ತದೆ. ಕಾರ್ಯ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೀವು ವಹಿಸಿಕೊಳ್ಳುವ ಜವಾಬ್ದಾರಿಯು ಸಂಸ್ಥೆಯಲ್ಲಿ ಉನ್ನತ ಅಧಿಕಾರಿಗಳ ಮೆಚ್ಚುಗೆಗೆ ಪಾತ್ರವಾಗಲಿದೆ. ಸತ್ಯವಂತಿಕೆ, ನ್ಯಾಯಪರತೆ ಹಾಗೂ ಅನ್ಯಾಯವನ್ನು ಸಹಿಸದ ಗುಣ ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದ ಪ್ರಮುಖ ಗುರುತಾಗಿದೆ.`;
    } else if (isHi) {
      card1Text = `${displayName} का जन्म लग्न ${lagnaRashiName} तथा चंद्र राशि ${moonRashiName} (नक्षत्र: ${nakshatraName}) है। लग्नेश के प्रभाव से आपमें स्वाभिमान, कर्तव्यनिष्ठा और कार्यकुशलता की प्रबलता रहती है। आप अपनी सत्यनिष्ठा और न्यायप्रियता के लिए जाने जाते हैं।`;
    } else {
      card1Text = `The birth Lagna of ${displayName} is ${lagnaRashiName} and Moon Sign is ${moonRashiName} (Nakshatra: ${nakshatraName}). Influenced by the ascendant lord, your core personality exhibits self-respect, meticulous dedication, and strong moral principles. You are deeply respected for your integrity, analytical skill, and unwavering commitment to justice.`;
    }

    // 2. Nigoodha Rahasya
    let nigoodhaText1 = "";
    let nigoodhaText2 = "";
    if (isKn) {
      nigoodhaText1 = `ನಿಮ್ಮ ಪ್ರಶಾಂತ ಮುಖಭಾವದ ಅಡಿಯಲ್ಲಿ ತೀವ್ರವಾದ ಆಂತರಿಕ ನಿಗೂಢ ಕೋಪ ಹಾಗೂ ಅಸಹನೆ ಅಡಗಿದೆ. ಅಂದುಕೊಂಡ ಕೆಲಸಗಳು ವಿಳಂಬವಾದಾಗ ಅಥವಾ ನಂಬಿಕೆಗೆ ಧಕ್ಕೆ ಉಂಟಾದಾಗ ಮನಸ್ಸಿನ ಒಳಗಡೆ ತೀವ್ರ ಉಗ್ರತೆ ಜಾಗೃತಗೊಳ್ಳುತ್ತದೆ. ಈ ಆಂತರಿಕ ಕೋಪವನ್ನು ಹೊರಹಾಕದೆ ಮನಸ್ಸಿನಲ್ಲೇ ಬಂಧಿಸಿಡುವುದರಿಂದ ಕೆಲವೊಮ್ಮೆ ತಲೆನೋವು, ಮಾನಸಿಕ ಅಶಾಂತಿ ಹಾಗೂ ನಿದ್ರಾಹೀನತೆ ಎದುರಾಗಬಹುದು.`;
      nigoodhaText2 = `ಆತುರದ ಕೋಪದ ರಭಸದಲ್ಲಿ ಆಡುವ ಮಾತುಗಳು ಆಪ್ತ ಬಾಂಧವರೊಡನೆ ಬಿರುಕು ಮೂಡಿಸದಂತೆ ಎಚ್ಚರ ವಹಿಸುವುದು ಅವಶ್ಯಕ. ಕೋಪ ಶಮನಕ್ಕಾಗಿ ನಿತ್ಯ ೧೦ ನಿಮಿಷ ಪ್ರಾಣಾಯಾಮ ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರುದ್ರಾಭಿಷೇಕ ಸ್ಮರಣೆಯು ಆಂತರಿಕ ಉಗ್ರತೆಯನ್ನು ಶಮನಗೊಳಿಸಿ ಪ್ರಶಾಂತತೆ ನೀಡುತ್ತದೆ.`;
    } else if (isHi) {
      nigoodhaText1 = `आपके शांत स्वभाव के पीछे एक गुप्त आंतरिक क्रोध और असंतोष छुपा रहता है। जब कार्य में विलंब होता है, तो मन में तीव्र उग्रता जागृत होती है। इसे मन में दबाने से मानसिक तनाव हो सकता है।`;
      nigoodhaText2 = `क्रोध में कठोर शब्दों के प्रयोग से बचें। शांति हेतु नित्य प्राणायाम करें तथा श्री गोकर्ण महाबलेश्वर मंदिर के रुद्राभिषेक का स्मरण करें।`;
    } else {
      nigoodhaText1 = `Beneath your calm exterior lies a subtle hidden layer of intense impatience and inner anger when expected outcomes are delayed or trust is breached. Internalizing this anger can cause stress and insomnia.`;
      nigoodhaText2 = `Exercise care with hasty words during moments of frustration. Daily pranayama and remembrance of Sri Gokarna Mahabaleshwara Rudrabhishekam bring deep emotional serenity.`;
    }

    // 3. Prastuta Jeevana Highlights
    let prastutaCareer = "";
    let prastutaFamily = "";
    let prastutaFinance = "";
    let prastutaHealth = "";

    const activeCard = dashaCardsData && dashaCardsData.length > 0 ? dashaCardsData[0] : null;
    const mahaName = activeCard ? activeCard.mahaName : (isKn ? "ಗುರು" : "Jupiter");

    if (isKn) {
      prastutaCareer = `${displayName} ಅವರ ಜನ್ಮ ಕುಂಡಲಿಯ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ಪ್ರಸ್ತುತ ${mahaName} ಮಹಾದಶಾ ನಾಥನ ಬಲದಿಂದ ವೃತ್ತಿಯಲ್ಲಿ ಪ್ರಮುಖ ಬಡ್ತಿ, ನೂತನ ಜವಾಬ್ದಾರಿ ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ಅಧಿಕಾರ ವೃದ್ಧಿ ಅತ್ಯಂತ ನಿಶ್ಚಿತವಾಗಿದೆ. ಸಂಸ್ಥೆಯಲ್ಲಿ ನಿಮ್ಮ ದಕ್ಷತೆ ಮತ್ತು ಕೀರ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸಲಿದೆ.`;
      prastutaFamily = `ನಿಮ್ಮ ಕುಂಡಲಿಯ ಚಂದ್ರ ಹಾಗೂ ಗುರು ಗ್ರಹಗಳ ದೃಷ್ಟಿಯಿಂದ ಗೃಹದಲ್ಲಿ ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಬಲದಿಂದ ದಾಂಪತ್ಯ ಸೌಖ್ಯ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿಯ ಸಂತಾನ ಯೋಗಕ್ಕೆ ಅತ್ಯಂತ ಪೂರಕ ವಾತಾವರಣ ಉಂಟಾಗಲಿದೆ. ದೇವತಾ ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳು ನೆರವೇರಲಿವೆ.`;
      prastutaFinance = `ದೀರ್ಘಕಾಲಿಕ ಭೂಮಿ, ಮನೆ ಅಥವಾ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿಗಳ ಯೋಜನಾ ಹೂಡಿಕೆಗಳಿಗೆ ಪ್ರಸ್ತುತ ಗುರು ಹಾಗೂ ಶನಿ ಗ್ರಹಗಳ ಸಂಚಾರವು ಅತ್ಯಂತ ಶುಭ ಫಲ ನೀಡಲಿದೆ. ಶಿಸ್ತುಬದ್ಧ ನಿಧಿ ಶೇಖರಣೆಯಿಂದ ಸಮಾಜದಲ್ಲಿ ಆರ್ಥಿಕ ಸುದೃಢತೆ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`;
      prastutaHealth = `ಮಾನಸಿಕ ಒತ್ತಡ ಶಮನಕ್ಕೆ ಧ್ಯಾನ ಹಾಗೂ ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವನೆ ಅತ್ಯಗತ್ಯ. ನಿರಂತರ ಪ್ರಯಾಣಗಳ ವೇಳೆಯಲ್ಲಿ ಸೂಕ್ತ ವಿಶ್ರಾಂತಿ ಪಡೆಯುವುದರಿಂದ ಸಂಪೂರ್ಣ ದೈಹಿಕ ಚೇತರಿಕೆ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`;
    } else {
      prastutaCareer = `Under the influence of the Ascendant Lord and active ${mahaName} Mahadasha, significant career advancement, leadership roles, and organizational recognition are indicated.`;
      prastutaFamily = `Benefic aspects of Jupiter and Moon foster marital harmony, family peace, and auspicious domestic celebrations with elders' blessings.`;
      prastutaFinance = `Favorable transits of Saturn and Jupiter support long-term investments in real estate and property, resulting in steady financial consolidation.`;
      prastutaHealth = `Prioritize balanced nutrition and mindfulness practices to manage work stress and maintain high physical energy.`;
    }

    return {
      card1Text,
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
    const isHi = code === "hi";

    let yogaText1 = "";
    let yogaText2 = "";
    if (isKn) {
      yogaText1 = `${displayName} ಅವರ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಚಂದ್ರರ ಪವಿತ್ರ ಸಮಸಪ್ತಕ ದೃಷ್ಟಿ ಸಂಯೋಗದಿಂದ 'ಗಜಕೇಸರಿ ರಾಜಯೋಗ' ಅತ್ಯಂತ ಶಕ್ತಿಯುತವಾಗಿ ಜಾಗೃತಗೊಂಡಿದೆ. ಈ ದಿವ್ಯ ರಾಜಯೋಗದ ಅನುಗ್ರಹದಿಂದ ಸಮಾಜದಲ್ಲಿ ಗೌರವಾನ್ವಿತ ಸ್ಥಾನಮಾನ, ಆಪತ್ತಿನ ವೇಳೆಯಲ್ಲಿ ಜಯ ತಂದುಕೊಡುವ ದೈವಿಕ ರಕ್ಷಣೆ ಹಾಗೂ ಸ್ಥಿರವಾದ ಯಶಸ್ಸು ಲಭಿಸಲಿದೆ. ನಿಮ್ಮ ವೃತ್ತಿ ಅಥವಾ ವ್ಯಾಪಾರ ಕ್ಷೇತ್ರದಲ್ಲಿ ಎಂತಹ ಪ್ರಬಲ ಪ್ರತಿರೋಧಗಳು ಎದುರಾದರೂ, ಆಂತರಿಕ ಬೌದ್ಧಿಕ ದಕ್ಷತೆ ಹಾಗೂ ಧೈರ್ಯದಿಂದ ಎಲ್ಲವನ್ನೂ ಮೆಟ್ಟಿ ನಿಂತು ಅಗ್ರಸ್ಥಾನ ಗಳಿಸುವಿರಿ.`;
      yogaText2 = `ಲಗ್ನ ಹಾಗೂ ತ್ರಿಕೋಣ ಭಾವಗಳ ಅಧಿಪತಿಗಳ ಬಲವಾದ ಸಂಯೋಜನೆಯಿಂದ 'ಬುಧಾದಿತ್ಯ ಯೋಗ' ಹಾಗೂ 'ಲಕ್ಷ್ಮಿ ಯೋಗ' ಸಿದ್ಧಿಸಿದ್ದು, ತೀಕ್ಷ್ಣ ಗ್ರಹಣ ಶಕ್ತಿ, ಸಮಯೋಚಿತ ನಿರ್ಧಾರ ಹಾಗೂ ಅಪಾರ ಆರ್ಥಿಕ ಸಂಪತ್ತನ್ನು ಖಾತ್ರಿಪಡಿಸುತ್ತದೆ. ಧನ ಹಾಗೂ ಲಾಭ ಭಾವಗಳ ಮೇಲೆ ಶುಭ ಗ್ರಹಗಳ ಸೌಮ್ಯ ದೃಷ್ಟಿ ಇರುವ ಕಾರಣ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ ಹಾಗೂ ಉದ್ಯೋಗ ಹೂಡಿಕೆಗಳಲ್ಲಿ ನಿರಂತರ ಧನ ಹರಿವು ಉಂಟಾಗಲಿದೆ.`;
    } else {
      yogaText1 = `In the natal chart of ${displayName}, the sacred aspectual alignment of Jupiter and Moon forms a powerful 'Gajakesari Rajayoga'. This bestows divine protection, high status, and enduring success. No matter how challenging the professional opposition, your wisdom and courage will ensure triumph.`;
      yogaText2 = `Strong Kendra-Trikona lord associations form 'Budhaditya Yoga' and 'Lakshmi Yoga', guaranteeing sharp intellect, timely decision-making, and financial growth through real estate and sound investments.`;
    }

    let doshaText1 = "";
    let doshaText2 = "";
    if (isKn) {
      doshaText1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ರಾಹು-ಕೇತು ಅಥವಾ ಮಂಗಳ ಗ್ರಹದ ಸೂಕ್ಷ್ಮ ಭಾವ ಸ್ಥಾನದಿಂದಾಗಿ ಆತುರದ ಆರ್ಥಿಕ ನಿರ್ಧಾರಗಳು ಹಾಗೂ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಸಣ್ಣಪುಟ್ಟ ಬಿರುಕು ಎದುರಾಗುವ ಕರ್ಮಿಕ ದೋಷ ಗೋಚರಿಸುತ್ತದೆ. ಶನಿ ದೇವನ ೭.೫/ಅರ್ಧಾಷ್ಟಮ ಗೋಚಾರ ಪ್ರಭಾವದಿಂದ ಅಪೇಕ್ಷಿತ ಫಲಗಳ ಲಭ್ಯತೆಯಲ್ಲಿ ವಿಳಂಬ ಉಂಟಾಗಬಹುದು.`;
      doshaText2 = `ಈ ಕರ್ಮಿಕ ದೋಷ ಶಮನಕ್ಕಾಗಿ ಪ್ರತಿ ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ, ಬಡವರಿಗೆ ಅನ್ನದಾನ ಮಾಡಿ ಹಾಗೂ ಪವಿತ್ರ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ನೆರವೇರಿಸಿ. ಗೋಕರ್ಣ ಪಂಚಾಂಗದ ಸಿದ್ಧ ಮುಹೂರ್ತದಲ್ಲಿ ಶನಿ ಶಾಂತಿ ಪೂಜೆಯು ಕಷ್ಟಗಳನ್ನು ಸಂಪೂರ್ಣ ದೂರ ಮಾಡಲಿದೆ.`;
    } else {
      doshaText1 = `Karmic influences from Rahu-Ketu or Mars house positions indicate occasional relationship friction or financial delays during Saturn transits.`;
      doshaText2 = `To mitigate these karmic challenges, recite Sri Hanuman Chalisa on Saturdays, engage in charity, and offer Rudrabhishekam at Sri Gokarna Mahabaleshwara temple.`;
    }

    let gocharaText1 = "";
    let gocharaText2 = "";
    if (isKn) {
      gocharaText1 = `ವರ್ತಮಾನ ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರದಲ್ಲಿ ಶನಿ ದೇವನ ಪ್ರಸ್ತುತ ಸ್ಥಾನವು ನಿಮ್ಮ ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಿಸ್ತು, ಕಠಿಣ ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ಹಾಗೂ ತಾಳ್ಮೆಯ ಪರೀಕ್ಷೆಯನ್ನು ನಡೆಸುತ್ತಿದೆ. ಆತುರದ ಹೂಡಿಕೆ ಅಥವಾ ಶಾರ್ಟ್‌ಕಟ್ ಮಾರ್ಗಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತ್ಯಜಿಸಿ, ಹಿರಿಯ ಅನುಭವಿಗಳ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಶ್ರಮಿಸುವುದರಿಂದ ವೃತ್ತಿ ರಂಗದಲ್ಲಿ ಸುದೀರ್ಘ ಭದ್ರತೆ ಹಾಗೂ ಅತ್ಯುನ್ನತ ಆಡಳಿತಾತ್ಮಕ ಸ್ಥಾನಮಾನ ದೊರೆಯಲಿದೆ.`;
      gocharaText2 = `ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಕೂಲಕರ ಗೋಚಾರ ಸಂಚಾರ ಹಾಗೂ ನವಮ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಆಶಾಭಾವನೆ, ಅಪಾರ ಧನ ಆಗಮನ ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಸಾಂಸಾರಿಕ ಸಂತೋಷವನ್ನು ಹೆಚ್ಚಿಸಲಿದೆ. ಪ್ರಸ್ತುತ ಸಮಯವು ಶ್ರೀ ಗೋಕರ್ಣ ಪಂಚಾಂಗದ ಪವಿತ್ರ ಮುಹೂರ್ತಗಳಲ್ಲಿ ದೇವತಾ ಸೇವೆಗಳನ್ನು ನೆರವೇರಿಸಲು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವಾಗಿದೆ.`;
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


  // ─── DYNAMIC PAGE 6 DATA (8-Month Roadmap - 240 Days) ───
  const page6Data = React.useMemo(() => {
    if (!birthKundli) return [];
    const isKn = code === "kn";
    const isHi = code === "hi";

    const monthsKn = ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
    const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonthIdx = now.getMonth();

    const badgesKn = ["ವೃತ್ತಿ ವೃದ್ಧಿ", "ಧನ ಸಮೃದ್ಧಿ", "ಕುಟುಂಬ ಸೌಖ್ಯ", "ಆಸ್ತಿ & ವಾಹನ", "⚠️ ಭುಕ್ತಿ ಸಂಧಿ", "ರಾಜಯೋಗ ಬಲ", "ವಿದ್ಯಾ ಸಿದ್ಧಿ", "ಶತ್ರು ಜಯ"];
    const badgesEn = ["Career Growth", "Wealth Gain", "Family Joy", "Assets & Vehicle", "⚠️ Transit Caution", "Rajayoga Strength", "Intellect Success", "Triumph Over Obstacles"];

    const roadmap = [];
    for (let i = 0; i < 8; i++) {
      const targetMonthIdx = (curMonthIdx + i) % 12;
      const yearOffset = Math.floor((curMonthIdx + i) / 12);
      const targetYear = curYear + yearOffset;

      const mName = isKn ? monthsKn[targetMonthIdx] : monthsEn[targetMonthIdx];
      const mNumKn = toKnDigits(i + 1);
      const mYearKn = toKnDigits(targetYear);

      const mTitle = isKn ? `${mNumKn} ನೇ ತಿಂಗಳು (${mName} ${mYearKn})` : `Month ${i + 1} (${mName} ${targetYear})`;
      const badge = isKn ? badgesKn[i % 8] : badgesEn[i % 8];

      let f1 = "", f2 = "", f3 = "", f4 = "";
      if (isKn) {
        if (i === 0) {
          f1 = "ಗುರು ದೃಷ್ಟಿ ಬಲದಿಂದ ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೂತನ ಉನ್ನತ ಹುದ್ದೆಯ ಅವಕಾಶ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ಸಂಸ್ಥೆಯಲ್ಲಿ ಮೇಲಾಧಿಕಾರಿಗಳಿಂದ ಪೂರ್ಣ ಮೆಚ್ಚುಗೆ.";
          f2 = "ವೃತ್ತಿಪರ ನಾಯಕತ್ವಕ್ಕೆ ಪೂರ್ಣ ಬೆಂಬಲ ಲಭ್ಯವಾಗಿ ಆರ್ಥಿಕ ಶ್ರೇಯಸ್ಸು ಉಂಟಾಗಲಿದೆ.";
          f3 = "ಅಧಿಕ ಕೆಲಸದ ಒತ್ತಡದಿಂದ ವಿಶ್ರಾಂತಿಯ ಕೊರತೆ ಎದುರಾಗಬಹುದು; ಆರೋಗ್ಯ ಗಮನಿಸಿ.";
          f4 = "ಸೂರ್ಯೋದಯಕ್ಕೆ ಅರ್ಘ್ಯ ನೀಡಿ, ಶ್ರೀ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಾಡಿ.";
        } else if (i === 1) {
          f1 = "ದ್ವಿತೀಯ ಭಾವ ಬಲದಿಂದ ಧನ ಲಾಭ ಹಾಗೂ ನೂತನ ಹೂಡಿಕೆಗಳು ಪೂರ್ಣ ಫಲಪ್ರದವಾಗಲಿವೆ. ಹಳೆಯ ಧನ ಸಂಗ್ರಹಣೆಯಲ್ಲಿ ಯಶಸ್ಸು.";
          f2 = "ಹಣಕಾಸಿನ ಹರಿವು ಸುಗಮವಾಗಿ ಆರ್ಥಿಕ ಭದ್ರತೆ ಪೂರ್ಣ ವೃದ್ಧಿಯಾಗಲಿದೆ.";
          f3 = "ಅನಗತ್ಯ ಖರ್ಚುಗಳ ಮೇಲೆ ನಿಗ್ರಹ ಅಗತ್ಯ; ಹಣಕಾಸಿನ ಶಿಸ್ತು ಕಾಪಾಡಿ.";
          f4 = "ಶುಕ್ರವಾರ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜೆ ಮಾಡಿ, ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಿಸಿ.";
        } else if (i === 2) {
          f1 = "ಗೃಹದಲ್ಲಿ ಮಂಗಳ ಕಾರ್ಯಗಳ ಶುಭ ಯೋಜನೆ ಹಾಗೂ ಬಂಧುಮಿತ್ರರ ಸಮಾಗಮ. ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ನೆಮ್ಮದಿ నెಲೆಸಲಿದೆ.";
          f2 = "ಕುಟುಂಬದ ಎಲ್ಲಾ ಸದಸ್ಯರ ಸಹಕಾರ ಸಿಕ್ಕು ಸಂತೋಷದ ವಾತಾವರಣ ನಿರ್ಮಾಣ.";
          f3 = "ಸಣ್ಣ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳನ್ನು ಪ್ರೀತಿ ಹಾಗೂ ತಾಳ್ಮೆಯಿಂದ ಬಗೆಹರಿಸಿ.";
          f4 = "ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಕುಟುಂಬ ಸಮೇತ ತೀರ್ಥ ದರ್ಶನ ಮಾಡಿ.";
        } else if (i === 3) {
          f1 = "ಚತುರ್ಥ ಸ್ಥಾನದ ಬಲದಿಂದ ಭೂಮಿ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಅಂತಿಮ ಯಶಸ್ಸು ಪ್ರಾಪ್ತಿ. ನೂತನ ಗೃಹೋಪಕರಣಗಳ ಖರೀದಿ.";
          f2 = "ಸ್ಥಿರಾಸ್ತಿಯ ಮೌಲ್ಯ ಹೆಚ್ಚಿ ಕುಟುಂಬದಲ್ಲಿ ಆನಂದ ಉಂಟಾಗಲಿದೆ.";
          f3 = "ಆಸ್ತಿ ನೋಂದಣಿ ಪತ್ರಗಳನ್ನು ಕೂಲಂಕಷವಾಗಿ ಪರಿಶೀಲಿಸಿ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಿ.";
          f4 = "ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ, ಬಡವರಿಗೆ ಅನ್ನದಾನ ಮಾಡಿ.";
        } else if (i === 4) {
          f1 = "ದಶಾ-ಅಂತರ್ದಶಾ ಸಂಧಿಯ ಕಾಲ; ಹೊಸ ಯೋಜನೆಗಳಿಗೆ ಸೂಕ್ತ ತಯಾರಿ ಹಾಗೂ ವಿವೇಕ ಅಗತ್ಯ. ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ತಪ್ಪಿಸಿ.";
          f2 = "ಉದ್ಯೋಗ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸ್ಥಿರತೆ ಕಾಯ್ದುಕೊಳ್ಳಲು ಸಂಯಮ ಅತ್ಯಗತ್ಯ.";
          f3 = "ಮಾನಸಿಕ ಚಾಂಚಲ್ಯ ಹಾಗೂ ಸಣ್ಣ ವೈಚಾರಿಕ್ ಗೊಂದಲ ಎದುರಾಗಬಹುದು.";
          f4 = "ಬುಧವಾರ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ, ಹಸಿರು ಬೇಳೆ ದಾನ ಮಾಡಿ.";
        } else if (i === 5) {
          f1 = "ಬುಧ ಅಂತರ್ದಶೆಯ ಪೂರ್ಣ ಶುಭಾರಂಭ; ಬೌದ್ಧಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ವಾಗ್ಬಲ ವೃದ್ಧಿ. ನೂತನ ಉದ್ಯೋಗ ಪ್ರಮೋಷನ್ ಹಾಗೂ ವ್ಯಾಪಾರ ಶ್ರೇಯಸ್ಸು.";
          f2 = "ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಯಕ್ಕೆ ಪೂರ್ಣ ಮಾನ್ಯತೆ ದೊರೆಯಲಿದೆ.";
          f3 = "ಅತಿಯಾದ ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಸಣ್ಣ ಸಣ್ಣ ತಪ್ಪುಗಳು ಸಂಭವಿಸದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.";
          f4 = "ನಿತ್ಯ ಪ್ರಾಣಾಯಾಮ ಹಾಗೂ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ.";
        } else if (i === 6) {
          f1 = "ಪಂಚಮ ಭಾವ ಬಲದಿಂದ ವಿದ್ಯಾ ಕ್ಷೇತ್ರ, ನೂತನ ಕೌಶಲ್ಯ ಕಲಿಕೆ ಹಾಗೂ ಸಂಶೋಧನೆಗಳಲ್ಲಿ ಅತ್ಯುನ್ನತ ಸಿದ್ಧಿ.";
          f2 = "ಮಾನಸಿಕ ನಿಖರತೆ ಹೆಚ್ಚಿ ನಿರ್ಧಾರಗಳು ಯಶಸ್ವಿಯಾಗಲಿವೆ.";
          f3 = "ಸಮಯ ವ್ಯರ್ಥ ಮಾಡುವ ಕೆಲಸಗಳಿಂದ ದೂರವಿರಿ.";
          f4 = "ಶ್ರೀ ಸರಸ್ವತಿ ಸ್ತೋತ್ರ ಪಠಿಸಿ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪುಸ್ತಕ ದಾನ ಮಾಡಿ.";
        } else {
          f1 = "ಷಷ್ಠ ಸ್ಥಾನ ಶಮನ ಬಲದಿಂದ ಶತ್ರು ಭಯ ನಿವಾರಣೆ, ಸಾಲ ಬಾಧೆಗಳ ಶಮನ ಹಾಗೂ ಕಾನೂನು ವಿಷಯಗಳಲ್ಲಿ ಯಶಸ್ಸು.";
          f2 = "ಬಾಕಿ ಉಳಿದಿದ್ದ ಸಾಲಗಳ ಮರುಪಾವತಿ ಸಾಧ್ಯವಾಗಲಿದೆ.";
          f3 = "ಆರೋಗ್ಯದಲ್ಲಿ ಸಣ್ಣ ಹವಾಮಾನ ಏರುಪೇರುಗಳನ್ನು ಗಮನಿಸಿ.";
          f4 = "ಪ್ರತಿ ಮಂಗಳವಾರ ಶ್ರೀ ದುರ್ಗಾ ಚಾಲೀಸಾ ಪಠಿಸಿ ಹಾಗೂ ದೀಪಾರಾಧನೆ ಮಾಡಿ.";
        }
      } else {
        f1 = `Benefic planetary aspects bring new opportunities and professional success during ${mName} ${targetYear}.`;
        f2 = `Financial stability improves through disciplined planning and steady income flow.`;
        f3 = `Avoid emotional arguments and maintain patience in decision-making.`;
        f4 = `Offer prayers to Sri Gokarna Mahabaleshwara and practice regular meditation.`;
      }

      roadmap.push({ mTitle, badge, f1, f2, f3, f4 });
    }

    return roadmap;
  }, [birthKundli, code]);'''

content = old_memos_regex.sub(new_memos_code, content)
with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated template dynamic memo hooks successfully.")
