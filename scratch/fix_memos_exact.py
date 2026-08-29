filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

s_marker = "  // ─── DYNAMIC PAGE 4 DATA (Natal Planets, Yogas & Doshas) ───"
e_marker = "  // ─── DYNAMIC PAGE 6 DATA (8-Month Roadmap - 240 Days) ───"

s_idx = content.find(s_marker)
e_idx = content.find(e_marker)

print(f"s_idx: {s_idx}, e_idx: {e_idx}")

new_memos = '''  // ─── DYNAMIC PAGE 4 DATA (Characteristics, Nigoodha Rahasya & Prastuta Jeevana) ───
  const page4Data = React.useMemo(() => {
    if (!birthKundli) return null;
    const isKn = code === "kn";
    const isHi = code === "hi";

    const moon = birthKundli.planets.find(p => p.name === "Moon");
    const lagnaRashiName = birthKundli.lagnaRashi ? birthKundli.lagnaRashi.sanskrit : "ಲಗ್ನ";
    const moonRashiName = birthKundli.moonSign ? birthKundli.moonSign.sanskrit : "ರಾಶಿ";
    const nakshatraName = moon && moon.nakshatra ? moon.nakshatra.sanskrit : "ನಕ್ಷತ್ರ";

    let card1Text = "";
    if (isKn) {
      card1Text = `${displayName} ಅವರ ಜನ್ಮ ಲಗ್ನ ${lagnaRashiName} ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ ${moonRashiName} (ನಕ್ಷತ್ರ: ${nakshatraName}) ಆಗಿದೆ. ಲಗ್ನಾಧಿಪತಿಯ ಪ್ರಭಾವದಿಂದ ನಿಮ್ಮ ಆಲೋಚನೆಗಳಲ್ಲಿ ಸದಾ ಸಾತ್ವಿಕ ತೇಜಸ್ಸು, ಸ್ವಾಭಿಮಾನ ಹಾಗೂ ಶ್ರಮದಾಯಕ ದಕ್ಷತೆ ಜಾಗೃತವಾಗಿರುತ್ತದೆ. ಕಾರ್ಯ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೀವು ವಹಿಸಿಕೊಳ್ಳುವ ಜವಾಬ್ದಾರಿಯು ಸಂಸ್ಥೆಯಲ್ಲಿ ಉನ್ನತ ಅಧಿಕಾರಿಗಳ ಮೆಚ್ಚುಗೆಗೆ ಪಾತ್ರವಾಗಲಿದೆ. ಸತ್ಯವಂತಿಕೆ, ನ್ಯಾಯಪರತೆ ಹಾಗೂ ಅನ್ಯಾಯವನ್ನು ಸಹಿಸದ ಗುಣ ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದ ಪ್ರಮುಖ ಗುರುತಾಗಿದೆ.`;
    } else if (isHi) {
      card1Text = `${displayName} का जन्म लग्न ${lagnaRashiName} तथा चंद्र राशि ${moonRashiName} (नक्षत्र: ${nakshatraName}) है। लग्नेश के प्रभाव से आपमें स्वाभिमान, कर्तव्यनिष्ठा और कार्यकुशलता की प्रबलता रहती है। आप अपनी सत्यनिष्ठा और न्यायप्रियता के लिए जाने जाते हैं।`;
    } else {
      card1Text = `The birth Lagna of ${displayName} is ${lagnaRashiName} and Moon Sign is ${moonRashiName} (Nakshatra: ${nakshatraName}). Influenced by the ascendant lord, your core personality exhibits self-respect, meticulous dedication, and strong moral principles. You are deeply respected for your integrity, analytical skill, and unwavering commitment to justice.`;
    }

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

    const activeCard = dashaCardsData && dashaCardsData.length > 0 ? dashaCardsData[0] : null;
    const mahaName = activeCard ? activeCard.mahaName : (isKn ? "ಗುರು" : "Jupiter");

    let prastutaCareer = "";
    let prastutaFamily = "";
    let prastutaFinance = "";
    let prastutaHealth = "";

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

'''

if s_idx != -1 and e_idx != -1:
    new_content = content[:s_idx] + new_memos + content[e_idx:]
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Fixed memos exact replacement successfully.")
