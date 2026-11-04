import type { PlaceSunTimes } from "./birthSunTimes";
import { calculateExactNoaaSunTimes, sunTimesSyncForBirth, vedicWeekdayAtBirth } from "./birthSunTimes";
import { resolveSunTimesForJyotish } from "./hinduSunTimes";
import { calculateLocalSiderealTime, dateToJulianUt, degreeToRashi, getAyanamsa, normalizeDegree } from "./AstroMath";
import type { AyanamsaModel } from "./AstroTypes";
import { ascendantTropicalDegrees, meanObliquityDegrees } from "./EphemerisEngine";
import { formatClockAtPlace } from "./placeTime";
import { patrikaNavamshaFromDegree } from "./localeNumbers";

const MANDI_GHATI_DAY = [26, 22, 18, 14, 10, 6, 2]; // Sun=0, Mon=1...
const MANDI_GHATI_NIGHT = [10, 6, 2, 26, 22, 18, 14];

export const computeMaandi = (
  birthUtc: Date,
  latitude: number,
  longitude: number,
  pincode = "",
  ayanamsaModel: AyanamsaModel = "lahiri",
  sunTimes?: PlaceSunTimes
): {
  degree: number;
  rashi: ReturnType<typeof degreeToRashi>;
  navamsha: number;
  windowLabel: string;
} => {
  const actualSunTimes = sunTimes ?? sunTimesSyncForBirth(birthUtc, latitude, longitude, pincode);

  const birthMs = birthUtc.getTime();
  const sunriseMs = actualSunTimes.sunrise.getTime();
  const sunsetMs = actualSunTimes.sunset.getTime();

  let targetMs = 0;
  let wd = 0;
  const isNight = birthMs >= sunsetMs || birthMs < sunriseMs;

  if (isNight) {
    if (birthMs < sunriseMs) {
      // Night birth before sunrise (belongs to previous Hindu day).
      // vedicWeekdayAtBirth automatically detects birthUtc < sunrise and steps back 24h.
      wd = vedicWeekdayAtBirth(birthUtc, actualSunTimes.sunrise, latitude, longitude);
      
      const yesterdayDate = new Date(birthUtc.getTime() - 86_400_000);
      const yesterdayNoaa = calculateExactNoaaSunTimes(yesterdayDate, latitude, longitude);
      const yesterdaySun = resolveSunTimesForJyotish(yesterdayNoaa, latitude, longitude, pincode);
      const yesterdaySunsetMs = yesterdaySun.sunset.getTime();
      
      const nightMs = sunriseMs - yesterdaySunsetMs;
      const ghati = MANDI_GHATI_NIGHT[wd] ?? 14;
      targetMs = yesterdaySunsetMs + (ghati / 30) * nightMs;
    } else {
      // Night birth after sunset (belongs to today's Hindu day).
      wd = vedicWeekdayAtBirth(birthUtc, actualSunTimes.sunrise, latitude, longitude);
      
      const tomorrowDate = new Date(birthUtc.getTime() + 86_400_000);
      const tomorrowNoaa = calculateExactNoaaSunTimes(tomorrowDate, latitude, longitude);
      const tomorrowSun = resolveSunTimesForJyotish(tomorrowNoaa, latitude, longitude, pincode);
      const tomorrowSunriseMs = tomorrowSun.sunrise.getTime();
      
      const nightMs = tomorrowSunriseMs - sunsetMs;
      const ghati = MANDI_GHATI_NIGHT[wd] ?? 14;
      targetMs = sunsetMs + (ghati / 30) * nightMs;
    }
  } else {
    // Daytime birth
    wd = vedicWeekdayAtBirth(birthUtc, actualSunTimes.sunrise, latitude, longitude);
    const dayMs = sunsetMs - sunriseMs;
    const ghati = MANDI_GHATI_DAY[wd] ?? 14;
    targetMs = sunriseMs + (ghati / 30) * dayMs;
  }

  const mid = new Date(targetMs);
  const jd = dateToJulianUt(mid);
  const lst = calculateLocalSiderealTime(mid, longitude);
  const eps = meanObliquityDegrees(jd);
  const ascTropical = ascendantTropicalDegrees(lst, latitude, eps);
  const ayan = getAyanamsa(mid, ayanamsaModel);
  const deg = normalizeDegree(ascTropical - ayan);

  const clockTime = formatClockAtPlace(mid, "en-IN", latitude, longitude, pincode);
  const ghatiVal = isNight ? MANDI_GHATI_NIGHT[wd] : MANDI_GHATI_DAY[wd];
  const windowLabel = `${ghatiVal} Gh (${clockTime})`;

  return {
    degree: deg,
    rashi: degreeToRashi(deg),
    navamsha: patrikaNavamshaFromDegree(deg),
    windowLabel
  };
};

export interface MaandiPerspectiveInquest {
  title: string;
  paragraph1: string;
  paragraph2: string;
  house: number;
}

export const getMaandiHouseFromLagna = (maandiRashiIndex: number, lagnaRashiIndex: number): number => {
  return (((maandiRashiIndex - lagnaRashiIndex) % 12 + 12) % 12) + 1;
};

interface HouseInterpretation {
  title: Record<string, string>;
  paragraph1: Record<string, string>;
  paragraph2: Record<string, string>;
}

const MAANDI_PERSPECTIVE_DATA: Record<number, HouseInterpretation> = {
  "1": {
    "title": {
      "kn": "ಆಂತರಿಕ ತೇಜಸ್ಸು, ನಿಗೂಢ ಚೇತನ ಹಾಗೂ ಆತ್ಮಸ್ಥೈರ್ಯ",
      "en": "Inner Resilience, Soul Awakening & Sacred Self-Reliance",
      "hi": "आंतरिक तेज, आत्मबल एवं गूढ़ चेतना शक्ति",
      "te": "ఆంతరంగిక చైతన్యం & ఆత్మస్థైర్యం",
      "ta": "உள் வலிமை & ஆன்ம விழிப்புணர்வு"
    },
    "paragraph1": {
      "kn": "ನಿಮ್ಮ ಜೀವನದ ಅಂತರಾಳವನ್ನು ಗಮನಿಸಿದಾಗ, ಬಾಹ್ಯ ಪ್ರಪಂಚಕ್ಕೆ ನೀವು ಅಚಲ ಧೈರ್ಯಶಾಲಿ ಮತ್ತು ಗಂಭೀರ ವ್ಯಕ್ತಿಯಂತೆ ಕಂಡರೂ, ನಿಮ್ಮ ಮನಸ್ಸಿನೊಳಗೆ ನಿರಂತರವಾಗಿ ಒಂದು ಮೌನ ಹೋರಾಟ ನಡೆಯುತ್ತಿರುತ್ತದೆ. ಯಾವುದೇ ಕೆಲಸವನ್ನು ಇತರರಿಗಿಂತ ಎರಡು ಪಟ್ಟು ಶ್ರಮವಹಿಸಿ ನಿರ್ವಹಿಸಿದರೂ, ಅಂತಿಮ ಕ್ಷಣದಲ್ಲಿ ಸಿಗಬೇಕಾದ ಮನ್ನಣೆ ಅಥವಾ ಫಲಿತಾಂಶವು ಕೈತಪ್ಪಿ ಹೋಗುವಂತಹ ಅನುಭವಗಳು ನಿಮ್ಮನ್ನು ಅನೇಕ ಬಾರಿ ಕಾಡಿರುತ್ತವೆ. ನಿಮ್ಮ ಆಂತರ್ಯದಲ್ಲಿ ಒಂದು ವಿಧದ ನಿಗೂಢ ಒಂಟಿತನ ಹಾಗೂ ಸ್ವಾವಲಂಬನೆಯ ಅದಮ್ಯ ಛಲವಿದೆ. ಅನ್ಯಾಯವನ್ನು ಎಂದಿಗೂ ಸಹಿಸದ ನಿಮ್ಮ ನೇರ ನಡೆ ಮತ್ತು ಕರ್ತವ್ಯನಿಷ್ಠೆ ಕೆಲವೊಮ್ಮೆ ನಿಮ್ಮ ಅತ್ಯಂತ ಆಪ್ತರಲ್ಲೂ ತಪ್ಪು ಕಲ್ಪನೆಗಳನ್ನು ಹುಟ್ಟುಹಾಕುತ್ತದೆ. ಶಾರೀರಿಕ ಆಯಾಸಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿ, ಪ್ರತಿಯೊಂದನ್ನೂ ಪರಿಪೂರ್ಣವಾಗಿ ಒಬ್ಬರೇ ನಿಭಾಯಿಸಬೇಕೆಂಬ ಮಾನಸಿಕ ಒತ್ತಡವು ನಿಮ್ಮ ವಿಶ್ರಾಂತಿಯನ್ನು ಕಸಿದುಕೊಳ್ಳುತ್ತದೆ.",
      "en": "Observing the deepest chambers of your inner life, while the outer world perceives you as an unshakable, deeply composed, and authoritative individual, you carry an unspoken solitary battle within your soul. You frequently experience that despite putting in twice the effort of others, true recognition and the final fruits of your toil seem to stall right at the threshold. A profound current of solitary self-reliance defines your nature; you fiercely avoid being a burden to anyone. Your uncompromising moral standards and transparent conduct sometimes cause even close companions to misunderstand your serious demeanor. More than physical exhaustion, the relentless internal pressure to hold everything together alone taxes your peace of mind.",
      "hi": "आपके जीवन के अंतःकरण को देखने पर, यद्यपि बाहरी दुनिया आपको एक अचल, गंभीर और प्रभावशाली व्यक्ति मानती है, आपके भीतर एक मौन संघर्ष निरंतर चलता रहता है। दूसरों से दोगुना परिश्रम करने के उपरांत भी अंतिम क्षण में मिलने वाला श्रेय अथवा परिणाम कई बार हाथ से फिसल जाता है। आपके भीतर एक अनोखा आत्मसम्मान और स्वावलंबन है। आपका स्पष्टवादी व्यवहार कई बार निकटतम जनों में भी गलतफहमियां उत्पन्न कर देता है। शारीरिक थकान से अधिक, प्रत्येक कार्य को अकेले ही पूर्ण करने का मानसिक तनाव आपके सुख-चैन को प्रभावित करता है।",
      "te": "మీ అంతరంగాన్ని పరిశీలిస్తే, బాహ్య ప్రపంచానికి మీరు ఎంతో ధైర్యవంతుడిగా, గంభీర వ్యక్తిగా కనిపించినప్పటికీ, మీ మనస్సులో ఒక నిరంతర నిశ్శబ్ద పోరాటం జరుగుతూనే ఉంటుంది. ఇతరులకన్నా రెట్టింపు శ్రమతో పనిచేసినప్పటికీ, చివరి క్షణంలో దక్కాల్సిన గుర్తింపు లేదా ఫలితం చేజారిపోయిన అనుభవాలు మిమ్మల్ని బాధించి ఉంటాయి. మీలో ఎవరిపై ఆధారపడకూడదనే స్వయంప్రతిపత్తి దృఢంగా ఉంది. అన్యాయాన్ని సహించని మీ ముక్కుసూటి తనం ఆప్తులలో కూడా అపార్థాలకు దారితీయవచ్చు. శారీరక శ్రమ కన్నా, అన్నింటినీ మీరే పరిపూర్ణంగా నిర్వహించాలనే మానసిక ఒత్తిడి మీ విశ్రాంతిని హరిస్తుంది.",
      "ta": "உங்கள் ஆழ்மனதை உற்றுநோக்கினால், வெளி உலகிற்கு நீங்கள் அமைதியான, கம்பீரமான மற்றும் மனஉறுதி கொண்ட மனிதராகத் தோன்றினாலும், உங்கள் இதயத்திற்குள் ஒரு மௌனப் போராட்டம் தொடர்ந்து நிகழ்கிறது. மற்றவர்களை விட இருமடங்கு கடுமையாக உழைத்தாலும், இறுதித் தருணத்தில் கிடைக்க வேண்டிய அங்கீகாரமும் நற்பலனும் கைநழுவிப் போகும் அனுபவங்கள் உங்களை வருத்தியுள்ளன. யாரிடமும் கையேந்தக் கூடாது என்ற அதீத சுயமரியாதை உங்களிடம் உண்டு. அநீதியை சகித்துக் கொள்ளாத உங்கள் நேர்மையான பேச்சு சில சமயங்களில் நெருங்கியவர்களாலும் தவறாகப் புரிந்து கொள்ளப்படுகிறது. உடல் களைப்பை விட, அனைத்தையும் தனியாளாகச் சுமக்க வேண்டும் என்ற மன அழுத்தம் உங்கள் நிம்மதியைக் குலைக்கிறது."
    },
    "paragraph2": {
      "kn": "ಆದರೆ ಈ ಕಠಿಣ ಪರೀಕ್ಷೆಯೇ ನಿಮ್ಮ ಆತ್ಮವನ್ನು ಅಪೂರ್ವವಾಗಿ ಪುಟವಿಟ್ಟಿದೆ ಎಂಬುದನ್ನು ನೀವು ಅರಿಯಬೇಕು. ನಿಮ್ಮ ಈ ಅಗಾಧವಾದ ಸಹನ ಶಕ್ತಿಯು ಪೂರ್ವಾರ್ಜಿತ ಕರ್ಮದ ಬಿಡುಗಡೆಗೆ ಕಾರಣವಾಗುತ್ತಿದ್ದು, ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಒಂದು ದೈವಿಕ ತಿರುವು ಆರಂಭವಾಗಲಿದೆ. ಇತರರ ಕ್ಷಣಿಕ ಮೆಚ್ಚುಗೆಗಾಗಿ ಹಂಬಲಿಸದೆ ನಿಮ್ಮ ಆತ್ಮಸಾಕ್ಷಿಯನ್ನೇ ಪರಮ ಶಕ್ತಿಯನ್ನಾಗಿಸಿಕೊಂಡಾಗ, ಈ ಕಠೋರ ಅಡೆತಡೆಗಳೇ ನಿಮ್ಮ ಅತಿ ದೊಡ್ಡ ರಕ್ಷಣಾ ಕವಚವಾಗಿ ಬದಲಾಗುತ್ತವೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಸಂಕಲ್ಪವು ನಿಮ್ಮ ಈ ಮೌನ ತಪಸ್ಸಿಗೆ ಸಾರ್ಥಕತೆಯನ್ನು ಕರುಣಿಸಲಿದೆ. ಪ್ರತಿದಿನ ಸಂಜೆ ಪ್ರಶಾಂತವಾಗಿ ಧ್ಯಾನಸ್ಥರಾಗಿ ಶಿವಪಂಚಾಕ್ಷರಿ ಜಪಿಸುವುದರಿಂದ ಹಾಗೂ ಶನಿವಾರದಂದು ದೀಪಾರಾಧನೆ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಮನಸ್ಸಿನ ಕಲ್ಮಷಗಳು ಕರಗಿ, ಅಪೂರ್ವ ಆತ್ಮತೇಜಸ್ಸು ಹಾಗೂ ನಿಶ್ಚಿಂತ ಜೀವನ ನಿಮ್ಮದಾಗಲಿದೆ.",
      "en": "Yet, you must recognize that this intense karmic pressure is the very fire that is refining your soul into pure gold. This immense endurance is actively burning away past karmic debts, and a profound spiritual and worldly breakthrough is now quietly taking root in your life. The moment you stop seeking external validation and anchor yourself fully in your sacred inner conscience, these persistent roadblocks transform into an impenetrable spiritual armor. The benevolent grace of Lord Gokarna Mahabaleshwara directly watches over your quiet penance. Dedicating a few moments each twilight to peaceful contemplation, invoking the sacred Shiva Panchakshari, and maintaining serene faith will dissolve all inner shadows, unlocking radiant self-sovereignty, boundless clarity, and enduring peace.",
      "hi": "परंतु आपको यह समझना होगा कि यह कठिन साधना आपकी आत्मा को कुंदन की तरह निखार रही है। यह अगाध सहनशीलता पूर्व संचित कर्मों की निवृत्ति कर रही है और शीघ्र ही आपके जीवन में एक दैवीय मोड़ आने वाला है। जब आप दूसरों की प्रशंसा की अपेक्षा छोड़ अपने आत्मबल को जाग्रत करेंगे, तो यही बाधाएं आपकी सुरक्षा कवच बन जाएंगी। श्री क्षेत्र गोकर्ण के महाबलेश्वर स्वामी की कृपा से आपकी इस मौन तपस्या को सिद्धि प्राप्त होगी। नित्य सायं काल में शिव पंचाक्षरी मंत्र का जप और शनिवार को दीप दान करने से मानसिक शांति एवं अखंड तेज की प्राप्ति होगी।",
      "te": "అయితే ఈ కఠిన పరిస్థితులే మీ ఆత్మశక్తిని మరింత పరిపక్వం చేస్తున్నాయని గ్రహించండి. మీ అపారమైన ఓర్పు పూర్వ సంచిత కర్మల విముక్తికి కారణమవుతోంది. బాహ్య ప్రశంసల కోసం తాపత్రయపడకుండా మీ అంతరాత్మనే పరమ ప్రమాణంగా స్వీకరించినప్పుడు, ఈ అవరోధాలే మీకు అజేయమైన రక్షా కవచంగా మారతాయి. శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామి అనుగ్రహం మీ శ్రమకు సార్థకతను చేకూరుస్తుంది. ప్రతిరోజూ సాయంత్రం ప్రశాంతంగా శివ పంచాక్షరీ జపం చేయడం వల్ల మానసిక ఆందోళనలు తొలగి, పరమ శాంతి మరియు ఆత్మతేజస్సు లభిస్తాయి.",
      "ta": "ஆனால் இந்த கடுமையான சோதனைகளே உங்கள் ஆன்மாவைத் தங்கமாகப் புடம்போடுகின்றன என்பதை உணருங்கள். இந்த பொறுமை முற்பிறவி கர்ம வினைகளைக் கரைத்து, மிக விரைவில் உங்கள் வாழ்வில் ஒரு தெய்வீகத் திருப்பத்தை ஏற்படுத்தப் போகிறது. மற்றவர்களின் தற்காலிகப் புகழ்ச்சியை எதிர்பார்க்காமல் உங்கள் மனசாட்சியையே வழிகாட்டியாகக் கொள்ளும்போது, தடைகளே உங்கள் பாதுகாப்பு அரணாக மாறும். ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் அருள் உங்கள் உழைப்பிற்கு வெற்றியைத் தரும். மாலையில் சிவ பஞ்சாட்சர ஜபமும், சனிக்கிழமை நல்லெண்ணெய் தீபமும் மன அமைதியையும் பேரானந்தத்தையும் வழங்கும்."
    }
  },
  "2": {
    "title": {
      "kn": "ಆರ್ಥಿಕ ಜಾಗೃತಿ, ವಾಗ್ವಿವೇಕ ಹಾಗೂ ಕುಟುಂಬ ಸಮೃದ್ಧಿ",
      "en": "Resource Vigilance, Articulate Wisdom & Prosperity Crossroads",
      "hi": "आर्थिक विवेक, वाणी संयम एवं पारिवारिक स्थिरता",
      "te": "ఆర్థిక వివేకం & కుటుంబ సమృద్ధి",
      "ta": "பொருளாதார விவேகம் & குடும்ப சுபிட்சம்"
    },
    "paragraph1": {
      "kn": "ನಿಮ್ಮ ಜೀವನ ಪಯಣದಲ್ಲಿ ಧನ ಸಂಪಾದನೆ ಮತ್ತು ಕುಟುಂಬದ ಜವಾಬ್ದಾರಿಗಳ ವಿಷಯದಲ್ಲಿ ನೀವು ಅತ್ಯಂತ ವಿಚಿತ್ರವಾದ ಏರಿಳಿತಗಳನ್ನು ಅನುಭವಿಸಿರುತ್ತೀರಿ. ಪ್ರಾಮಾಣಿಕವಾಗಿ ಕಷ್ಟಪಟ್ಟು ಉಳಿಸಿದ ಹಣವು ನಿರೀಕ್ಷಿಸದ ಕೌಟುಂಬಿಕ ತುರ್ತುಗಳಿಗೆ ಅಥವಾ ಇತರರ ಜವಾಬ್ದಾರಿಗೆ ಖರ್ಚಾಗಿ ಹೋಗುವುದು ನಿಮಗೆ ಆಗಾಗ ಆತಂಕ ತಂದಿರುತ್ತದೆ. ನಿಮ್ಮ ಮಾತುಗಳು ಸತ್ಯವಾಗಿದ್ದರೂ, ಕೆಲವೊಮ್ಮೆ ಅವು ಕಟುವಾಗಿ ಕೇಳಿ ಕುಟುಂಬ ಸದಸ್ಯರಲ್ಲಿ ಮನಸ್ತಾಪಗಳಿಗೆ ದಾರಿಮಾಡಿಕೊಡಬಹುದು. ಹಣಕಾಸಿನ ಯೋಜನೆಗಳು ೯೯% ಪೂರ್ಣಗೊಂಡ ಹಂತದಲ್ಲೇ ಅನಿರೀಕ್ಷಿತ ತಡೆ ಉಂಟಾಗುವುದು ನಿಮ್ಮ ತಾಳ್ಮೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತದೆ. ಸಂಪತ್ತನ್ನು ಕೂಡಿಡುವ ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕ ಇಚ್ಛೆಯು ಅನೇಕ ಕೌಟುಂಬಿಕ ಹೊಣೆಗಾರಿಕೆಗಳ ನಡುವೆ ಮರೆಯಾಗಿ, ಒಂಟಿಯಾಗಿ ಆರ್ಥಿಕ ಹೊರೆ ಹೊರಬೇಕಾದ ಸನ್ನಿವೇಶಗಳು ಎದುರಾಗುತ್ತವೆ.",
      "en": "Throughout your life's financial journey, you have weathered perplexing fluctuations between dedicated accumulation and sudden unanticipated expenses. Money earned through righteous toil often gets diverted toward urgent family emergencies or fulfilling obligations for others, leaving your personal reserves under strain. Even though your words stem from unfiltered truth, their bluntness sometimes sparks unintended friction among loved ones. You know the exact frustration of financial deals and investments halting at the 99% mark just before fruition, demanding superhuman patience to cross the finish line.",
      "hi": "आपके जीवन में धन उपार्जन और पारिवारिक उत्तरदायित्वों को लेकर कई उतार-चढ़ाव आए हैं। ईमानदारी और कठिन परिश्रम से संचित किया गया धन कई बार अचानक आने वाले पारिवारिक दायित्वों में व्यय हो जाता है। आपकी वाणी में सत्य होने के उपरांत भी, उसका स्पष्ट रूप कभी-कभी परिजनों में मतभेद का कारण बन जाता है। वित्तीय सौदों और योजनाओं का 99% पूर्ण होकर अंतिम चरण में रुक जाना आपके धैर्य की परीक्षा लेता रहा है।",
      "te": "మీ జీవిత ప్రయాణంలో ధన సంపాదన మరియు కుటుంబ బాధ్యతల విషయంలో ఆకస్మిక ఒడిదుడుకులు ఎదురై ఉంటాయి. కష్టపడి కూడబెట్టిన ధనం అనుకోని కుటుంబ అవసరాలకు లేదా ఇతరుల బాధ్యతలకు ఖర్చయిపోవడం ఆందోళన కలిగిస్తుంది. మీ మాటలలో నిజాయితీ ఉన్నప్పటికీ, అది కొన్నిసార్లు సూటిగా ఉండటం వల్ల ఆప్తులలో అపార్థాలకు దారితీయవచ్చు. 99% పూర్తయిన ఆర్థిక ప్రణాళికలు ఆఖరి క్షణంలో ఆగడం మీ సహనాన్ని పరీక్షిస్తుంది.",
      "ta": "உங்கள் வாழ்வில் தன வரவு மற்றும் குடும்பப் பொறுப்புகளில் விசித்திரமான ஏற்றத்தாழ்வுகளைச் சந்தித்துள்ளீர்கள். நேர்மையாக உழைத்துச் சேர்த்த பணம் எதிர்பாராத குடும்பக் கடமைகளுக்கும் மற்றவர்களின் தேவைகளுக்கும் செலவாகி மன அழுத்தத்தை உண்டாக்குகிறது. உங்கள் பேச்சில் உண்மை இருப்பினும், அதன் நேரடித்தன்மை குடும்பத்தில் சிறிய சங்கடங்களை ஏற்படுத்தலாம். 99% முடிந்த நிதி விவகாரங்கள் இறுதி நொடியில் தாமதமாவது உங்கள் பொறுமையைச் சோதிக்கிறது."
    },
    "paragraph2": {
      "kn": "ಆದಾಗ್ಯೂ, ಈ ಆರ್ಥಿಕ ಸವಾಲುಗಳು ನಿಮಗೆ ನಿಜವಾದ ಮೌಲ್ಯಗಳ ಅರಿವು ಮೂಡಿಸುವ ದೈವಿಕ ಪಾಠಗಳಾಗಿವೆ. ನಿಮ್ಮ ವಾಕ್ ಶಕ್ತಿಯನ್ನು ಸದಾ ಮೃದುವಾಗಿಸಿ, ಸತ್ಯವನ್ನು ಪ್ರೀತಿಯಿಂದ ಹೇಳುವ ಅಭ್ಯಾಸ ಬೆಳೆಸಿಕೊಂಡರೆ ಕುಟುಂಬದ ಎಲ್ಲ ತಪ್ಪುಗ್ರಹಿಕೆಗಳು ತಾವಾಗಿಯೇ ಮರೆಯಾಗುತ್ತವೆ. ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಅನಿರೀಕ್ಷಿತ ಸ್ಥಿರಾಸ್ತಿ ಅಥವಾ ಸ್ಥಿರ ಆದಾಯದ ಬಾಗಿಲುಗಳು ತೆರೆದುಕೊಳ್ಳಲಿವೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಲಕ್ಷ್ಮಿ ಸಹಿತ ಮಹಾಬಲೇಶ್ವರನ ಅನುಗ್ರಹದಿಂದ ನಿಮ್ಮ ಸಂಚಿತ ಸಂಪತ್ತು ಸಂರಕ್ಷಿತವಾಗಲಿದೆ. ಪ್ರತಿದಿನ ಅಲ್ಪಸ್ವಲ್ಪ ಅನ್ನದಾನ ಮಾಡುವುದು ಹಾಗೂ ಮನೆಯಲ್ಲಿ ಸದಾ ಧೂಪ-ದೀಪ ಪ್ರಜ್ವಲಿಸುವುದು ನಿಮ್ಮ ಆರ್ಥಿಕ ಮಾರ್ಗದ ಅಡೆತಡೆಗಳನ್ನು ನಿವಾರಿಸಿ ಸಮೃದ್ಧಿ ತರಲಿದೆ.",
      "en": "Yet, these financial crucibles are divine lessons designed to anchor you in genuine material prudence and unshakeable values. As you temper your speech with gentle warmth and speak truth with loving patience, family misunderstandings naturally dissolve. Very soon, unexpected avenues of immovable property and resilient income streams will unlock in direct proportion to your past patience. Under the grace of Lord Gokarna Mahabaleshwara and Mahalakshmi, your accumulated assets will remain divinely protected. Practicing small acts of food charity and keeping sacred lamps lit at home will banish all monetary obstacles and usher in lasting prosperity.",
      "hi": "तथापि, ये आर्थिक चुनौतियां आपको सच्चे मूल्यों का बोध कराने वाली साधना हैं। वाणी में मधुरता और प्रेम का समावेश करने से पारिवारिक सौहार्द पुनः लौट आएगा। शीघ्र ही आपके पूर्व धैर्य के अनुपात में अचल संपत्ति और स्थिर आय के नए द्वार खुलेंगे। श्री क्षेत्र गोकर्ण में महालक्ष्मी सहित महाबलेश्वर के अनुग्रह से आपका संचित धन सुरक्षित रहेगा। नित्य अन्नदान और संध्या दीप प्रज्वलन से समस्त आर्थिक रुकावटें दूर होंगी।",
      "te": "అయితే, ఈ ఆర్థిక సవాళ్లు మీకు నిజమైన సంపద విలువలను నేర్పే గుణపాఠాలు. మీ వాక్కులో మాధుర్యాన్ని అలవర్చుకుంటే కుటుంబ కలహాలు వాటంతట అవే సమసిపోతాయి. అతి త్వరలోనే మీ శ్రమకు తగ్గ స్థిరాస్తి మరియు స్థిర ఆదాయ మార్గాలు తెరుచుకుంటాయి. శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి మరియు మహాలక్ష్మి అనుగ్రహంతో మీ సంపదకు రక్షణ కలుగుతుంది. నిత్యం గోసేవ లేదా అన్నదానం చేయడం వల్ల ఆర్థిక మార్గంలోని ఆటంకాలు తొలగిపోతాయి.",
      "ta": "ஆயினும், இந்த பொருளாதார சவால்கள் உங்களுக்கு உண்மையான விவேகத்தை புகட்டும் பயிற்சிகளாகும். உங்கள் பேச்சில் கனிவையும் அன்பையும் இணைத்துக்கொண்டால் குடும்பத்தில் மனக்கசப்புகள் அகலும். விரைவில் உழைப்பிற்கேற்ற நிலையான வருமானமும் சொத்து சேர்க்கையும் உண்டாகும். ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் மற்றும் மகாலட்சுமியின் அருளால் உங்கள் சேமிப்பு பாதுகாக்கப்படும். அன்னதானமும் தீப வழிபாடும் நிதித் தடைகளை நீக்கி சுபிட்சத்தை வழங்கும்."
    }
  },
  "3": {
    "title": {
      "kn": "ಅಪಾರ ಧೈರ್ಯ, ಸ್ವಯಂ ಪರಿಶ್ರಮ ಹಾಗೂ ಕಾರ್ಯಸಿದ್ಧಿ",
      "en": "Indomitable Courage, Enterprise & Unstoppable Willpower",
      "hi": "अदम्य साहस, स्वप्रयत्न एवं कार्य सिद्धि",
      "te": "అపార ధైర్యం & కార్యసిద్ధి",
      "ta": "அபார தைரியம் & காரிய சித்தி"
    },
    "paragraph1": {
      "kn": "ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದಲ್ಲಿ ಎದ್ದು ಕಾಣುವ ಪ್ರಮುಖ ಗುಣವೆಂದರೆ ಎಂದೂ ಸೋಲೊಪ್ಪದ ಅದಮ್ಯ ಧೈರ್ಯ ಮತ್ತು ಸ್ವಂತ ಕಾಲ ಮೇಲೆ ನಿಲ್ಲುವ ಹಠ. ಆದರೆ ಒಡಹುಟ್ಟಿದವರೊಂದಿಗೆ ಅಥವಾ ನಿಕಟ ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗೆ ಸಣ್ಣಪುಟ್ಟ ವಿಷಯಗಳಿಗೂ ಉಂಟಾಗುವ ಸಂವಹನ ಕೊರತೆ ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತೀವ್ರ ನೋವುಂಟುಮಾಡುತ್ತದೆ. ಯಾವುದೇ ಕೆಲಸವನ್ನು ಸ್ವತಃ ನೀವೇ ಮುಂಚೂಣಿಯಲ್ಲಿ ನಿಂತು ಮುಗಿಸಬೇಕೇ ವಿನಃ, ಇತರರನ್ನು ನಂಬಿ ವಹಿಸಿದ ಕೆಲಸಗಳು ಅರ್ಧದಲ್ಲೇ ನಿಂತುಹೋಗುತ್ತವೆ. ನಿಮ್ಮ ಕೈಯಿಂದ ಉಪಕಾರ ಪಡೆದವರೇ ಕಾಲಾನಂತರದಲ್ಲಿ ಕೃತಘ್ನರಾಗುವುದು ನಿಮ್ಮ ಹೃದಯಕ್ಕೆ ಘಾಸಿ ಮಾಡುತ್ತದೆ. ಕೈಗೆತ್ತಿಕೊಂಡ ಸಾಹಸಮಯ ಯೋಜನೆಗಳು ಆರಂಭದಲ್ಲಿ ಕಠಿಣ ವಿರೋಧಗಳನ್ನು ಎದುರಿಸಿದರೂ, ನಿಮ್ಮ ಛಲವು ನಿಮ್ಮನ್ನು ಮುನ್ನಡೆಸುತ್ತದೆ.",
      "en": "Your core temperament is distinguished by fearless courage, enterprise, and a fierce refusal to surrender before daunting odds. However, recurring misunderstandings with siblings, neighbors, or close colleagues often leave deep, unvoiced wounds in your heart. You have repeatedly discovered that tasks you manage personally succeed, whereas delegating to others leads to eleventh-hour stagnation. The ingratitude of individuals you selflessly assisted in their times of crisis has tested your faith in human nature. Even when ventures encounter fierce headwinds at their inception, your solitary grit refuses to bow.",
      "hi": "आपके व्यक्तित्व की सबसे बड़ी विशेषता अदम्य साहस और आत्मनिर्भरता है। परंतु भाई-बहनों या सहयोगियों के साथ संवाद की कमी कई बार मन को गहरी ठेस पहुंचाती है। आपने सदैव पाया है कि जिन कार्यों को आप स्वयं करते हैं, वे सफल होते हैं, परंतु दूसरों पर निर्भर रहने पर कार्य अटक जाते हैं। आपकी सहायता प्राप्त करने वाले लोग समय आने पर कृतघ्न हो जाते हैं, जिससे मन व्यथित होता है।",
      "te": "మీ వ్యక్తిత్వంలో ప్రస్ఫుటంగా కనిపించే లక్షణం అజేయమైన ధైర్యం మరియు సొంత కాళ్లపై నిలబడే పట్టుదల. అయితే తోబుట్టువులతో లేదా సహచరులతో వచ్చే చిన్నపాటి కమ్యూనికేషన్ లోపం మిమ్మల్ని బాధిస్తుంది. మీరు స్వయంగా చేసిన పనులే విజయవంతమవుతాయి కానీ, ఇతరులను నమ్మి అప్పగించిన పనులు నిలిచిపోతాయి. మీరు మేలు చేసిన వారే సమయానికి కృతజ్ఞత చూపకపోవడం మీకు నిరాశ కలిగిస్తుంది.",
      "ta": "உங்கள் இயல்பில் தனித்துவமானது அஞ்சாத தைரியமும் தன்னம்பிக்கையுமே ஆகும். ஆனால் உடன் பிறந்தவர்கள் அல்லது சகாக்களுடன் ஏற்படும் கருத்து வேறுபாடுகள் மனதை வதைக்கின்றன. நீங்களே முன்னின்று செய்யும் காரியங்கள் வெற்றியடைகின்றன, பிறரை நம்பி ஒப்படைக்கும்போது தாமதமாகின்றன. நீங்கள் உதவி செய்தவர்களே நன்றி மறப்பது உங்களுக்கு வேதனையளித்தாலும், உங்கள் வைராக்கியம் உங்களை தொடர்ந்து வழிநடத்துகிறது."
    },
    "paragraph2": {
      "kn": "ಈ ಸಂಘರ್ಷಮಯ ಅನುಭವಗಳೇ ನಿಮ್ಮನ್ನು ಅಪ್ರತಿಮ ನಾಯಕರನ್ನಾಗಿ ರೂಪಿಸುತ್ತಿವೆ. ಇತರರ ಮೇಲಿನ ಅತಿಯಾದ ನಿರೀಕ್ಷೆಯನ್ನು ತ್ಯಜಿಸಿ, ನಿಮ್ಮ ಸ್ವಂತ ಪರಿಶ್ರಮ ಮತ್ತು ದೇವರ ಮೇಲಿನ ವಿಶ್ವಾಸವನ್ನೇ ಆಯುಧವನ್ನಾಗಿಸಿಕೊಂಡರೆ ವಿಜಯ ನಿಮ್ಮದೇ ಆಗಲಿದೆ. ಸಹೋದರ ಅಥವಾ ಮಿತ್ರರೊಂದಿಗಿನ ಹಳೆಯ ಕಹಿ ನೆನಪುಗಳನ್ನು ಕ್ಷಮಿಸಿ ಮರೆತಾಗ ನಿಮ್ಮ ಆಂತರಿಕ ಚೇತನಕ್ಕೆ ಮಹತ್ತರ ಶಕ್ತಿ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ರಕ್ಷಾ ಕವಚವು ನಿಮ್ಮ ಸಾಹಸಗಳಿಗೆ ಜಯವನ್ನು ತಂದುಕೊಡಲಿದೆ. ಸುಬ್ರಹ್ಮಣ್ಯ ಹಾಗೂ ಕಾಲಭೈರವನ ಉಪಾಸನೆಯು ನಿಮ್ಮ ಬಾಕಿ ಉಳಿದಿರುವ ಎಲ್ಲ ಸಾಹಸಮಯ ಕೆಲಸಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸಲು ನೆರವಾಗಲಿದೆ.",
      "en": "These trials are intentionally molding you into an unyielding leader who depends neither on luck nor on fragile human loyalties. The moment you release past grudges and forgive those who failed you, a floodgate of spiritual vitality returns to your heart. Victory is destined to crown your personal endeavors because your efforts are purified through integrity. The protective shield of Lord Gokarna Mahabaleshwara surrounds your bold initiatives. Contemplating Lord Kartikeya and Bhairava will demolish lingering delays, empowering you to conclude all stalled projects with resounding triumph.",
      "hi": "ये संघर्ष आपको एक सक्षम नेतृत्वकर्ता के रूप में गढ़ रहे हैं। दूसरों से अति-अपेक्षा त्यागकर केवल अपने कर्म और ईश्वर पर विश्वास रखें, विजय निश्चित होगी। पुरानी कड़वाहट को क्षमा कर देने से अपार आत्मबल प्राप्त होगा। श्री गोकर्ण महाबलेश्वर का रक्षा कवच आपके प्रत्येक साहसिक कार्य को सफल बनाएगा। भगवान कार्तिकेय और कालभैरव की उपासना से अटके हुए कार्य पूर्ण होंगे।",
      "te": "ఈ పరీక్షలే మిమ్మల్ని అద్భుతమైన నాయకుడిగా తీర్చిదిద్దుతున్నాయి. ఇతరులపై అతిగా ఆశలు పెట్టుకోకుండా మీ శ్రమను, దైవాన్ని నమ్ముకుంటే విజయం మీదే. పాత చేదు జ్ఞాపకాలను క్షమించి విడిచిపెట్టినప్పుడు మీలో అపారమైన చైతన్యం వెల్లివిరుస్తుంది. శ్రీ గోಕರ್ణ మహాబలేశ్వరుని రక్షణ కవచం మీ ప్రయత్నాలకు విజయాన్ని చేకూరుస్తుంది. సుబ్రహ్మణ్య స్వామి మరియు కాలభైరవ ఆరాధనతో మీ పనులన్నీ పూర్తవుతాయి.",
      "ta": "இந்த போராட்டங்களே உங்களை அசைக்க முடியாத தலைவராக உருவாக்குகின்றன. மற்றவர்களின் மீது அதீத எதிர்பார்ப்பை விடுத்து, சுய உழைப்பையும் இறைவனையும் நம்பினால் வெற்றி நிச்சயம். பழைய கசப்புகளை மன்னித்து மறக்கும்போது உங்கள் ஆன்ம சக்தி பன்மடங்கு பெருகும். ஸ்ரீ கோகர்ண மகாபலேஸ்வரரின் அருள் உங்கள் முயற்சிகளை வெற்றிப் பாதையில் செலுத்தும். முருகப் பெருமான் மற்றும் காலபைரவர் வழிபாடு நிலுவையில் உள்ள காரியங்களை நிறைவேற்றும்."
    }
  },
  "4": {
    "title": {
      "kn": "ಮನಃಶಾಂತಿ, ಗೃಹಕ್ಷೇಮ ಹಾಗೂ ಆಂತರಿಕ ನೆಮ್ಮದಿಯ ಅನ್ವೇಷಣೆ",
      "en": "Inner Peace, Emotional Sanctuary & Domestic Tranquility",
      "hi": "मानसिक शांति, गृह सौख्य एवं अंतःकरण शुद्धि",
      "te": "మానసిక శాంతి & గృహ సౌఖ్యం",
      "ta": "மன அமைதி & இல்லற நிம்மதி"
    },
    "paragraph1": {
      "kn": "ಬಾಹ್ಯವಾಗಿ ಸುಖ-ಭೋಗಗಳಿದ್ದರೂ ನಿಮ್ಮ ಮನಸ್ಸಿನ ಆಳದಲ್ಲಿ ಸದಾ ಒಂದು ರೀತಿಯ ಅಶಾಂತಿ ಮತ್ತು ಆತಂಕದ ನೆರಳು ಸುಳಿದಾಡುತ್ತಿರುತ್ತದೆ. ಸ್ವಂತ ಮನೆ ಅಥವಾ ವಾಹನದಂತಹ ಸ್ಥಿರಾಸ್ತಿ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಅನಗತ್ಯ ಗೊಂದಲಗಳು, ದಸ್ತಾವೇಜು ವಿಳಂಬ ಅಥವಾ ತಾಯಿಯವರ ಆರೋಗ್ಯದ ಬಗೆಗಿನ ನಿರಂತರ ಚಿಂತೆ ನಿಮ್ಮ ನಿದ್ರೆಗೆ ಭಂಗ ತಂದಿರುತ್ತದೆ. ಎಲ್ಲ ಸೌಕರ್ಯಗಳಿದ್ದರೂ ಮನೆಯಲ್ಲಿ ದೀರ್ಘಕಾಲ ನೆಮ್ಮದಿಯಿಂದ ಕುಳಿತುಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗದಂತಹ ಒಂದು ನಿಗೂಢ ಒತ್ತಡ ನಿಮ್ಮನ್ನು ಕಾಡುತ್ತದೆ. ಕುಟುಂಬದ ಎಲ್ಲರ ಸಂತೋಷಕ್ಕಾಗಿ ನೀವು ಎಲ್ಲವನ್ನೂ ತ್ಯಾಗ ಮಾಡಿದರೂ, ಮನೆಯವರ ಕಡೆಯಿಂದ ನಿರೀಕ್ಷಿತ ಭಾವನಾತ್ಮಕ ಬೆಂಬಲ ಸಿಗದಿರುವುದು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಒಂಟಿತನದ ಭಾವನೆಯನ್ನು ತರುತ್ತದೆ.",
      "en": "Beneath whatever outward comforts and conveniences you possess, an elusive shadow of restlessness and subconscious domestic anxiety frequently haunts your quiet moments. Matters concerning home ownership, vehicles, or ancestral properties have been plagued by bureaucratic delays or unexpected complications. Continuous worry regarding your mother's health or emotional well-being has weighed heavily upon your thoughts. Despite your tireless sacrifices to provide safety and warmth for your family, the absence of mutual emotional reassurance often leaves you feeling isolated within your own home.",
      "hi": "बाहरी सुख-सुविधाओं के होते हुए भी अंतःकरण में एक अज्ञात अशांति और बेचैनी की छाया बनी रहती है। गृह, वाहन या संपत्ति से जुड़े मामलों में अप्रत्याशित विलंब अथवा माताजी के स्वास्थ्य को लेकर चिंताएं मन को व्यथित करती हैं। परिजनों की प्रसन्नता के लिए सब कुछ न्योछावर करने पर भी अपेक्षित भावनात्मक सहयोग न मिलना कभी-कभी एकाकीपन का अनुभव कराता है।",
      "te": "బాహ్యంగా సౌకర్యాలు ఉన్నప్పటికీ, మనస్సులో ఎల్లప్పుడూ ఒక అశాంతి మరియు ఆందోళన నీడలా వెంటాడుతుంటాయి. ఇల్లు, వాహనం లేదా స్థిరాస్తి వ్యవహారాలలో డాక్యుమెంట్ల జాప్యం లేదా తల్లి గారి ఆరోగ్యం గురించిన నిరంతర ఆందోళన మీ ప్రశాంతతను దెబ్బతీస్తుంది. కుటుంబం కోసం ఎంతో త్యాగం చేసినప్పటికీ, వారి నుండి ఆశించిన భావోద్వేగ మద్దతు లభించకపోవడం ఒంటరితనాన్ని కలిగిస్తుంది.",
      "ta": "வெளிப்புற வசதிகள் அனைத்தும் இருந்தபோதிலும், இதயத்தின் ஆழத்தில் சொல்ல முடியாத மனஅமைதியின்மையும் சஞ்சலமும் நிழலாடுகிறது. வீடு, வாகனம் அல்லது பூர்வீக சொத்து விவகாரங்களில் ஆவணத் தாமதங்கள் அல்லது தாயாரின் உடல்நலம் குறித்த தொடர் கவலைகள் உங்கள் தூக்கத்தைக் கெடுக்கின்றன. குடும்பத்தினரின் மகிழ்ச்சிக்காக அனைத்தையும் தியாகம் செய்தும், உரிய மனரீதியான ஆதரவு கிடைக்காதது தனிமை உணர்வைத் தருகிறது."
    },
    "paragraph2": {
      "kn": "ನಿಮ್ಮ ಈ ಆಂತರಿಕ ತೊಳಲಾಟವು ಬಾಹ್ಯ ಭೌತಿಕ ವಿಷಯಗಳಿಂದ ಮುಕ್ತಿ ಪಡೆದು ಸಾತ್ವಿಕ ನೆಮ್ಮದಿಯನ್ನು ಕಂಡುಕೊಳ್ಳಲು ಬಂದಿರುವ ದೈವಿಕ ಕರೆಯಾಗಿದೆ. ಮನೆಯಲ್ಲಿ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳನ್ನು ನಿವಾರಿಸಲು ವಾಸ್ತು ಮತ್ತು ಸಕಾರಾತ್ಮಕ ವಾತಾವರಣವನ್ನು ನಿರ್ಮಿಸುವುದು ಅತಿ ಮುಖ್ಯವಾಗಿದೆ. ತಾಯಿಯವರ ಆಶೀರ್ವಾದವನ್ನು ನಿತ್ಯವೂ ಭಕ್ತಿಯಿಂದ ಪಡೆಯುವುದರಿಂದ ನಿಮ್ಮ ಜನ್ಮದ ಬಹುತೇಕ ಕಷ್ಟಗಳು ಕರಗಿ ನೀರಾಗಲಿವೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಪವಿತ್ರ ಕೋಟಿತೀರ್ಥದ ಸ್ಮರಣೆಯು ನಿಮ್ಮ ಗೃಹಕ್ಕೆ ಶಾಂತಿಯನ್ನು ತುಂಬಲಿದೆ. ಮನೆಯಲ್ಲಿ ಗೋಮಯ ದೀಪ ಹಾಗೂ ತುಳಸಿ ಪೂಜೆಯನ್ನು ನಿಷ್ಠೆಯಿಂದ ಮುಂದುವರಿಸಿದರೆ, ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಕಳೆದುಹೋದ ದಿವ್ಯ ನೆಮ್ಮದಿ ಮತ್ತು ಗೃಹ ಸೌಖ್ಯ ಮರಳಿ ದೊರೆಯುವುದು ಖಚಿತ.",
      "en": "This emotional yearning is a sacred summons to build your true sanctuary within your own heart rather than depending on external surroundings. Cleansing your living space of negative static and receiving your mother's heartfelt blessings will dissolve the heaviest karmic knot resting upon your domestic life. Remembering the sacred Kotiteertha of Gokarna will restore peaceful vibrations to your dwelling. Lighting pure sesame oil or cow-ghee lamps and nurturing the holy Tulasi plant will permanently dissolve this restlessness, crowning your home with serene harmony and profound mental solace.",
      "hi": "यह अंतर्द्वंद्व आपको सांसारिक मोह से ऊपर उठकर आत्मिक शांति प्राप्त करने का दैवीय संकेत है। माताजी के चरण स्पर्श और आशीर्वाद से आपके जीवन के अनेक कष्ट शांत होंगे। श्री क्षेत्र गोकर्ण के पवित्र कोटितीर्थ का स्मरण आपके घर में सकारात्मक ऊर्जा का संचार करेगा। घर में नित्य तुलसी पूजन और तिल के तेल का दीप प्रज्वलित करने से गृह क्लेश समाप्त होकर परम शांति मिलेगी।",
      "te": "ఈ మానసిక సంఘర్షణ మీకు అంతర్గత ఆధ్యాత్మిక శాంతిని అందించే దైవిక పిలుపు. తల్లి గారి ఆశీర్వాదం నిత్యం భక్తితో తీసుకోవడం వల్ల మీ అనేక కష్టాలు తొలగిపోతాయి. శ్రీ క్షేత్ర గోకర్ణ పవిత్ర కోటితీర్థ స్మరణ మీ నివాసంలో శాంతిని నింపుతుంది. ఇంట్లో తులసి పూజ మరియు ఆవు నేతి దీపారాధన నిరంతరం చేయడం వల్ల గృహ సౌఖ్యం మరియు అద్భుతమైన మనశ్శాంతి చేకూరుతాయి.",
      "ta": "இந்த மனப்போராட்டம் உங்களுக்கு உண்மையான உள் அமைதியைத் தேடித்தரும் ஆன்மீக அழைப்பாகும். தாயாரின் பாதங்களைத் தொட்டு ஆசி பெறுவது உங்கள் பெரும்பாலான துன்பங்களைக் கரைத்துவிடும். ஸ்ரீ கோகர்ண கோடிதீர்த்தத்தின் நினைவு உங்கள் இல்லத்தில் அமைதியை உண்டாக்கும். வீட்டில் துளசி வழிபாடும் நெய் தீபமும் மனச்சஞ்சலத்தைப் போக்கி அளவற்ற குடும்ப நிம்மதியைத் தரும்."
    }
  },
  "5": {
    "title": {
      "kn": "ಪೂರ್ವಪುಣ್ಯ ಪ್ರಜ್ಞೆ, ಸೂಕ್ಷ್ಮ ಬುದ್ಧಿಮತ್ತೆ ಹಾಗೂ ದೈವಜ್ಞಾನ",
      "en": "Karmic Intuition, Creative Awakening & Dharmic Grace",
      "hi": "पूर्वपुण्य संस्कार, सूक्ष्म प्रज्ञा एवं आध्यात्मिक मेधा",
      "te": "పూర్వపుణ్య సంస్కారం & సూక్ష్మ ప్రజ్ఞ",
      "ta": "பூர்வபுண்ணிய ஞானம் & உள்ளுணர்வு ஆற்றல்"
    },
    "paragraph1": {
      "kn": "ನಿಮ್ಮ ಬುದ್ಧಿಶಕ್ತಿಯು ಅತ್ಯಂತ ತೀಕ್ಷ್ಣವಾಗಿದ್ದು, ಯಾವುದೇ ವಿಷಯದ ಸಾರವನ್ನು ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಗ್ರಹಿಸುವ ಅಪೂರ್ವ ಪ್ರತಿಭೆ ನಿಮ್ಮಲ್ಲಿದೆ. ಆದರೆ ನಿಮ್ಮ ಸೃಜನಶೀಲ ಯೋಜನೆಗಳು ಅಥವಾ ಹೂಡಿಕೆಗಳು ಫಲಕೊಡುವ ಹಂತದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ನಿರಾಶೆ ಅಥವಾ ಮಕ್ಕಳ ಪ್ರಗತಿಯ ಬಗೆಗಿನ ದೀರ್ಘಕಾಲೀನ ಚಿಂತೆ ನಿಮ್ಮನ್ನು ಕಾಡುತ್ತಿರುತ್ತದೆ. ಹಿಂದಿನ ಜನ್ಮದ ಸಂಚಿತ ಕರ್ಮದ ಒಂದು ಸಣ್ಣ ಗಂಟು ನಿಮ್ಮ ನಿರ್ಧಾರಗಳನ್ನು ಕೆಲವೊಮ್ಮೆ ಸಂದಿಗ್ಧತೆಗೆ ತಳ್ಳುತ್ತದೆ. ಇತರರಿಗೆ ಅತ್ಯುತ್ತಮ ಸಲಹೆಗಳನ್ನು ನೀಡುವ ನೀವು, ನಿಮ್ಮ ಸ್ವಂತ ಜೀವನದ ನಿರ್ಣಾಯಕ ಹಂತಗಳಲ್ಲಿ ತೀರ್ಮಾನ ತೆಗೆದುಕೊಳ್ಳಲು ಹಿಂಜರಿಯುವುದು ನಿಮ್ಮ ಮನಸ್ಸಿನ ನಿಗೂಢ ಹೋರಾಟಕ್ಕೆ ಸಾಕ್ಷಿಯಾಗಿದೆ.",
      "en": "Your intellect is exceptionally penetrating, gifted with an intuitive faculty that discerns the hidden truths of situations in an instant. Yet, your grandest creative inspirations and strategic investments have frequently met sudden, frustrating pauses just as they were ready to manifest. Prolonged anxieties regarding your children's welfare, academic trajectory, or emotional balance have quietly drained your vitality. While you effortlessly provide profound counsel that resolves others' crises, you paradoxically experience agonizing hesitation when deciding critical junctures in your own life.",
      "hi": "आपकी बुद्धि अत्यंत तीक्ष्ण और सूक्ष्मग्राही है, जो किसी भी परिस्थिति के गूढ़ सत्य को क्षण भर में समझ लेती है। फिर भी, आपकी रचनात्मक योजनाएं और निवेश अक्सर सफलता के निकट पहुंचकर रुक जाते हैं। संतान की शिक्षा अथवा प्रगति को लेकर मन में चिंताएं बनी रहती हैं। दूसरों को सटीक परामर्श देने वाले आप, स्वयं के निर्णायक क्षणों में निर्णय लेने में संकोच का अनुभव करते हैं।",
      "te": "మీ బుద్ధి బలం అత్యంత తీక్షణమైనది, ఏ విషయాన్నైనా క్షణాల్లో గ్రహించగల అరుదైన ప్రతిభ మీలో ఉంది. అయినప్పటికీ, మీ సృజనాత్మక ఆలోచనలు లేదా పెట్టుబడులు ఫలితాన్నిచ్చే సమయంలో ఆకస్మిక జాప్యం ఎదురవుతుంది. సంతాన పురోగతి లేదా వారి భవిష్యత్తు గురించిన ఆలోచనలు మిమ్మల్ని కలవరపెడుతుంటాయి. ఇతరులకు అద్భుతమైన సలహాలు ఇచ్చే మీరు, మీ స్వంత కీలక విషయాలలో నిర్ణయాలు తీసుకోవడానికి సంకోచిస్తుంటారు.",
      "ta": "உங்கள் புத்தி கூர்மையானது; எந்தவொரு விஷயத்தின் சாராம்சத்தையும் நொடியில் கிரகிக்கும் அரிய ஆற்றல் உங்களிடம் உண்டு. இருப்பினும், உங்கள் படைப்பாற்றல் மிக்க திட்டங்களும் முதலீடுகளும் பலன் தரும் நேரத்தில் எதிர்பாராத தடைகளைச் சந்திக்கின்றன. குழந்தைகளின் கல்வி அல்லது எதிர்காலம் குறித்த சிந்தனைகள் மனதை வாட்டுகின்றன. மற்றவர்களுக்குச் சிறந்த ஆலோசனை கூறும் நீங்கள், உங்கள் சொந்த முக்கிய முடிவுகளில் தயங்குவது ஆழ்மனப் போராட்டத்தைக் காட்டுகிறது."
    },
    "paragraph2": {
      "kn": "ಆದರೆ ನಿಮ್ಮಲ್ಲಿ ಸುಪ್ತವಾಗಿರುವ ಈ ಸೂಕ್ಷ್ಮ ಪ್ರಜ್ಞೆಯೇ ನಿಮ್ಮ ನಿಜವಾದ ದೈವಿಕ ಶಕ್ತಿ. ಮಂತ್ರ ಜಪ, ಇಷ್ಟದೇವತಾ ಆರಾಧನೆ ಮತ್ತು ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆಯಿಂದ ಈ ಸಂಚಿತ ಕರ್ಮದ ಗಂಟು ಸುಲಭವಾಗಿ ಕಳಚಿಕೊಳ್ಳುತ್ತದೆ. ಮಕ್ಕಳೊಂದಿಗೆ ಪ್ರೀತಿ ಮತ್ತು ತಾಳ್ಮೆಯಿಂದ ವರ್ತಿಸುವುದು ಹಾಗೂ ನಿಮ್ಮ ಜ್ಞಾನವನ್ನು ಇತರರಿಗೆ ನಿಸ್ವಾರ್ಥವಾಗಿ ಧಾರೆ ಎರೆಯುವುದು ನಿಮ್ಮ ಭಾಗ್ಯವನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಸಾನ್ನಿಧ್ಯದಲ್ಲಿ ಮಾಡುವ ರುದ್ರಾಭಿಷೇಕವು ನಿಮ್ಮ ಬುದ್ಧಿಗೆ ಅಗಾಧ ಸ್ಪಷ್ಟತೆಯನ್ನು ನೀಡಲಿದೆ. ಮುಂದಿನ ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ ಸೃಜನಶೀಲತೆ ಜಗತ್ತಿಗೆ ಪರಿಚಯವಾಗಿ, ಉನ್ನತ ಗೌರವ ಹಾಗೂ ಸಂತೋಷ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.",
      "en": "Understand that this latent intuitive sensitivity is your greatest spiritual inheritance from past births. Through dedicated mantra japa and invoking your Kuladevata, the karmic knot clouding your discernment will completely untie. Nurturing your children with compassionate patience and selflessly sharing your wisdom will awaken dormant ancestral merit. Performing sacred Rudrabhisheka at Sri Gokarna Mahabaleshwara will bestow crystal-clear visionary focus upon your mind, paving the way for celebrated intellectual accomplishments and deep domestic fulfillment.",
      "hi": "यह अंतर्ज्ञान आपकी पूर्वजन्म की आध्यात्मिक धरोहर है। नित्य मंत्र जप और कुलदेवता की आराधना से यह कर्म-ग्रंथि शीघ्र सुलझ जाएगी। बच्चों के साथ धैर्य और प्रेम का व्यवहार रखने से तथा अपने ज्ञान को निःस्वार्थ भाव से बांटने से भाग्योदय होगा। श्री गोकर्ण महाबलेश्वर के सान्निध्य में रुद्राभिषेक आपकी मेधा को असीम स्पष्टता प्रदान कर प्रतिष्ठा दिलाएगा।",
      "te": "మీలో దాగివున్న ఈ సూక్ష్మ ప్రజ్ఞ మీ పూర్వజన్మల పుణ్యఫలం. ఇష్టదైవ ఆరాధన మరియు కులదేవతా ప్రార్థనతో ఈ కర్మ అవరోధాలు తొలగిపోతాయి. పిల్లలతో ఓర్పుతో వ్యవహరించడం, మీ జ్ఞానాన్ని నిస్వార్థంగా నలుగురితో పంచుకోవడం భాగ్యాన్ని మేల్కొలుపుతుంది. శ్రీ గోಕರ್ణ మహాబలేశ్వరునికి రుద్రాభిషేకం చేయించడం వల్ల మీ ఆలోచనలలో స్పష్టత వచ్చి ఉన్నత గౌరవం లభిస్తుంది.",
      "ta": "இந்த நுண்ணறிவு உங்கள் பூர்வபுண்ணியப் பேறாகும். மந்திர ஜபமும் குலதெய்வ வழிபாடும் இந்த கர்மத் தடையை எளிதில் உடைக்கும். குழந்தைகளிடம் அன்பும் பொறுமையும் காட்டுவதும், உங்கள் ஞானத்தைப் பிறருக்குப் பகிர்வதும் நல்வாய்ப்புகளை ஈர்க்கும். ஸ்ரீ கோகர்ண மகாபலேஸ்வரருக்கு ருத்ராபிஷேகம் செய்வது உங்கள் சிந்தனையில் தெளிவை ஏற்படுத்தி, பெரும் புகழையும் நிம்மதியையும் தரும்."
    }
  },
  "6": {
    "title": {
      "kn": "ಸಂಕಷ್ಟ ನಿವಾರಣೆ, ರೋಗ ನಿರೋಧಕ ಶಕ್ತಿ ಹಾಗೂ ವಿಜಯ ಪಥ",
      "en": "Karmic Armor, Triumph Over Adversity & Vital Renewal",
      "hi": "विघ्न निवारण, आत्मरक्षा बल एवं विजय संकल्प",
      "te": "విఘ్న నివారణ & శత్రు జయం",
      "ta": "துன்ப நிவர்த்தி & வெற்றிப் பாதை"
    },
    "paragraph1": {
      "kn": "ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಎದುರಾಗುವ ಸ್ಪರ್ಧೆಗಳು, ಗುಪ್ತ ವಿರೋಧಿಗಳ ಕುತಂತ್ರಗಳು ಮತ್ತು ಹಳೆಯ ಸಾಲ ಅಥವಾ ಆರೋಗ್ಯದ ಏರುಪೇರುಗಳು ನಿಮ್ಮ ತಾಳ್ಮೆಯ ಪರಮಾವಧಿಯನ್ನು ಪರೀಕ್ಷಿಸಿರುತ್ತವೆ. ನೀವು ಯಾರಿಗೂ ಕೆಡುಕನ್ನು ಬಯಸದಿದ್ದರೂ, ನಿಮ್ಮ ಏಳಿಗೆಯನ್ನು ಕಂಡು ಅಸೂಯೆಪಡುವ ಗುಪ್ತ ಶತ್ರುಗಳ ಉಪಟಳ ನಿಮಗೆ ಹಲವು ಬಾರಿ ಮಾನಸಿಕ ಕ್ಲೇಶವನ್ನು ಉಂಟುಮಾಡಿದೆ. ರೋಗ ಲಕ್ಷಣಗಳು ಸ್ಪಷ್ಟವಾಗಿ ತೋರದಿದ್ದರೂ ದೇಹದಲ್ಲಿ ನಿರಂತರ ನಿಶ್ಯಕ್ತಿ ಅಥವಾ ಜೀರ್ಣಾಂಗ ಸಂಬಂಧಿ ತೊಂದರೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ದಿನಚರಿಯನ್ನು ಏರುಪೇರು ಮಾಡುತ್ತದೆ. ನ್ಯಾಯಾಲಯದಂತಹ ವಿವಾದಗಳು ಅಥವಾ ಸಾಲದ ಹೊರೆಗಳು ದೀರ್ಘಕಾಲ ಎಳೆಯುವುದು ನಿಮ್ಮನ್ನು ಬೇಸರಗೊಳಿಸಿರಬಹುದು.",
      "en": "Life has repeatedly thrust you into intense arenas of competition, hidden hostility, and lingering obligations that have stretched your endurance to its limits. Even though you harbor malice toward none, your quiet progress has ignited unprovoked envy and passive opposition in certain quarters. Unexplained bouts of fatigue or digestive sensitivity have periodically dampened your physical stamina, resisting conventional diagnosis. Drawn-out financial liabilities or institutional frictions have tested your nerves, making you wonder when complete freedom will arrive.",
      "hi": "प्रतिस्पर्धाएं, गुप्त विरोधियों का ईर्ष्या भाव और पुराने ऋण अथवा स्वास्थ्य संबंधी उतार-चढ़ाव आपके धैर्य की परीक्षा लेते रहे हैं। किसी का अहित न चाहने पर भी आपकी प्रगति से ईर्ष्या करने वाले गुप्त शत्रु मानसिक अशांति उत्पन्न करते हैं। स्पष्ट निदान के बिना भी शरीर में थकान या पाचन संबंधी समस्याएं दिनचर्या को प्रभावित करती हैं।",
      "te": "పోటీతత్వం, రహస్య శత్రువుల అసూయ మరియు పాత రుణాలు లేదా ఆరోగ్య సమస్యలు మీ సహనాన్ని తీవ్రంగా పరీక్షించి ఉంటాయి. మీరు ఎవరికీ కీడు తలపెట్టకపోయినా, మీ ఎదుగుదలను చూసి ఓర్వలేని వారి పరోక్ష విరోధం మిమ్మల్ని కలవరపెడుతుంది. స్పష్టమైన కారణం లేకుండానే అలసట లేదా జీర్ణకోశ సమస్యలు ఎదురవుతాయి. రుణాల భారం లేదా వివాదాలు ఆలస్యం కావడం విసుగు కలిగిస్తుంది.",
      "ta": "போட்டிகள், மறைமுக எதிரிகளின் பொறாமை மற்றும் பழைய கடன்கள் அல்லது உடல்நலப் பின்னடைவுகள் உங்கள் பொறுமையை எல்லை வரை சோதித்துள்ளன. நீங்கள் எவருக்கும் தீங்கு நினையாதபோதும், உங்கள் முன்னேற்றத்தைக் கண்டு சிலர் கொண்ட காழ்ப்புணர்ச்சி மன உளைச்சலைத் தந்துள்ளது. தெளிவான அறிகுறிகள் இன்றி ஏற்படும் உடல் சோர்வு உங்கள் அன்றாட வேலைகளைப் பாதிக்கிறது."
    },
    "paragraph2": {
      "kn": "ಆದರೆ ನೆನಪಿಡಿ, ಈ ಯಾವುದೇ ಸವಾಲುಗಳು ನಿಮ್ಮನ್ನು ಎಂದಿಗೂ ಮಣಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ; ಏಕೆಂದರೆ ನಿಮ್ಮಲ್ಲಿ ನೈಸರ್ಗಿಕವಾಗಿಯೇ ಅದ್ಭುತ ರೋಗ ನಿರೋಧಕ ಮತ್ತು ಶತ್ರುಜಯ ಶಕ್ತಿಯಿದೆ. ನೀವು ಎದುರಿಸಿದ ಪ್ರತಿಯೊಂದು ಬಿಕ್ಕಟ್ಟೂ ನಿಮ್ಮನ್ನು ಮತ್ತಷ್ಟು ಉಕ್ಕಿನಂತೆ ಗಟ್ಟಿಗೊಳಿಸಿದೆ. ನಿಯಮಿತ ದಿನಚರಿ, ಸಾತ್ವಿಕ ಆಹಾರ ಮತ್ತು ಋಣ ವಿಮೋಚನಾ ಸಂಕಲ್ಪದಿಂದ ಸಕಲ ಬಾಧೆಗಳೂ ದೂರವಾಗಲಿವೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ಮೃತ್ಯುಂಜಯ ಜಪ ಹಾಗೂ ಆಂಜನೇಯ ಸ್ವಾಮಿಯ ಕವಚ ಪಠಣವು ನಿಮ್ಮ ಸುತ್ತ ಒಂದು ರಕ್ಷಣಾತ್ಮಕ ಕೋಟೆಯನ್ನು ನಿರ್ಮಿಸಲಿದೆ. ಶೀಘ್ರದಲ್ಲೇ ವಿರೋಧಿಗಳೆಲ್ಲ ತಲೆಬಾಗಿ, ನಿಮ್ಮ ಸಕಲ ಸಂಕಷ್ಟಗಳೂ ಪೂರ್ಣವಾಗಿ ನಿವಾರಣೆಯಾಗಲಿವೆ.",
      "en": "Take heart, for within your spirit resides an invincible warrior resilience that cannot be broken by petty adversities. Every single confrontation you survived has forged you into steel. By adhering to a disciplined Ayurvedic routine and maintaining unwavering ethical purity, these debts and ailments will dissolve one by one. The sacred Mahamrityunjaya vibration of Lord Gokarna Mahabaleshwara combined with Hanuman Chalisa creates an impenetrable armor around your life. Your competitors will inevitably retreat, and triumphant resolution is guaranteed across all contested fronts.",
      "hi": "परंतु स्मरण रहे, कोई भी बाधा आपको परास्त नहीं कर सकती क्योंकि आपके भीतर स्वाभाविक आत्मरक्षा और विजय की शक्ति है। प्रत्येक संकट ने आपको और अधिक दृढ़ बनाया है। नियमित दिनचर्या, सात्विक आहार और श्री गोकर्ण महाबलेश्वर के लिए महामृत्युंजय जप तथा हनुमान चालीसा का पाठ आपके चारों ओर अभेद्य सुरक्षा चक्र स्थापित करेगा। शीघ्र ही समस्त बाधाएं शांत होंगी।",
      "te": "గుర్తుంచుకోండి, ఏ అవరోధమూ మిమ్మల్ని ఓడించలేదు; ఎందుకంటే మీలో సహజసిద్ధమైన ప్రతిఘటన మరియు విజయ శక్తి ఉంది. మీరు ఎదుర్కొన్న ప్రతి సవాలు మిమ్మల్ని ఉక్కులా మార్చింది. సాత్విక ఆహారం, క్రమశిక్షణతో కూడిన జీవనవిధానం మరియు శ్రీ గోకర్ణ మహాబలేశ్వరుని మహా మృత్యుంజయ జపం, హనుమాన్ చాలీసా పఠనం మీ చుట్టూ రక్షా కవచాన్ని నిర్మిస్తాయి. త్వరలోనే శత్రు బాధలు తొలగి విజయం వరిస్తుంది.",
      "ta": "எந்த சவாலும் உங்களை வீழ்த்த முடியாது; இயல்பாகவே நோயெதிர்ப்பு மற்றும் எதிரிகளை வெல்லும் சக்தி உங்களிடம் உள்ளது. நீங்கள் சந்தித்த ஒவ்வொரு நெருக்கடியும் உங்களை இரும்பைப் போல் உறுதிப்படுத்தியுள்ளது. சீரான உணவுப் பழக்கம், ஸ்ரீ கோகர்ண மகாபலேஸ்வரரின் மகா மிருத்யுஞ்சய மந்திரம் மற்றும் அனுமன் சாலிசா பாராயணம் உங்களைச் சுற்றி ஒரு கவசத்தை உருவாக்கும். தடைகள் விலகி முழு வெற்றி கிட்டும்."
    }
  },
  "7": {
    "title": {
      "kn": "ದಾಂಪತ್ಯ ಸೌಹಾರ್ದ, ಪಾಲುದಾರಿಕೆ ವಿವೇಕ ಹಾಗೂ ಸಾಮರಸ್ಯ",
      "en": "Relational Harmony, Compassionate Poise & Partnership Grace",
      "hi": "दांपत्य सौहार्द, साझेदारी विवेक एवं आपसी सामंजस्य",
      "te": "దాంపత్య సామరస్యం & భాగస్వామ్య వివేకం",
      "ta": "தாம்பத்ய நல்லிணக்கம் & கூட்டு விவேகம்"
    },
    "paragraph1": {
      "kn": "ವೈವಾಹಿಕ ಜೀವನ ಅಥವಾ ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ಪರಸ್ಪರ ನಂಬಿಕೆ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಹೊಂದಾಣಿಕೆಯು ನಿಮ್ಮ ಜೀವನದ ಪ್ರಮುಖ ಸವಾಲಾಗಿರುತ್ತದೆ. ನಿಮ್ಮ ಜೀವನ ಸಂಗಾತಿಯು ಸದ್ಗುಣಿಯಾಗಿದ್ದರೂ, ಇಬ್ಬರ ನಡುವೆ ಸಣ್ಣ ವಿಷಯಗಳಿಗೂ ಅಹಂ ಸಂಘರ್ಷಗಳು ಅಥವಾ ಮೂರನೆಯವರ ಹಸ್ತಕ್ಷೇಪದಿಂದಾಗಿ ಅಪಾರ್ಥಗಳು ತಲೆದೋರುವುದು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತೀವ್ರ ವೇದನೆ ತಂದಿರುತ್ತದೆ. ನಿಮ್ಮ ಭಾವನೆಗಳನ್ನು ಸಂಗಾತಿಗೆ ಸರಿಯಾಗಿ ಅರ್ಥಮಾಡಿಸಲು ಸಾಧ್ಯವಾಗದ ಮೌನ ಕಂದಕವು ಕೆಲವೊಮ್ಮೆ ಏಕಾಂತಕ್ಕೆ ದೂಡುತ್ತದೆ. ಪಾಲುದಾರಿಕೆ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಪ್ರಾಮಾಣಿಕತೆ ಇದ್ದರೂ, ಕರಾರುಗಳಲ್ಲಿ ಎಚ್ಚರ ತಪ್ಪಿದರೆ ನಷ್ಟ ಅಥವಾ ಮನಸ್ತಾಪ ಅನುಭವಿಸಬೇಕಾಗುತ್ತದೆ.",
      "en": "In the delicate realm of partnerships and holy matrimony, establishing deep emotional consensus has demanded tremendous inner sacrifice. Even though your partner is noble and well-intentioned, minor triggers or external interference by third parties have often provoked painful communication standoffs. You know the ache of feeling profoundly misunderstood by the very person you cherish most, retreating into wounded silence rather than escalating arguments. In collaborative business endeavors, blind trust without meticulous written clarity has previously brought bitter disillusionment.",
      "hi": "वैवाहिक जीवन अथवा व्यावसायिक साझेदारी में परस्पर विश्वास और भावनात्मक सामंजस्य आपकी मुख्य साधना रही है। जीवनसाथी के सद्गुणी होने पर भी, तीसरे व्यक्तियों के हस्तक्षेप अथवा अहंकार के टकराव से गलतफहमियां उत्पन्न हो जाती हैं। अपनी सच्ची भावनाओं को व्यक्त न कर पाने के कारण उपजा मौन कभी-कभी दूरियां बढ़ा देता है। साझेदारी के कार्यों में कागजी स्पष्टता का अभाव तनाव का कारण बन सकता है।",
      "te": "వైవాహిక జీవితంలో లేదా వ్యాపార భాగస్వామ్యంలో పరస్పర నమ్మకం మరియు సామరస్యం చాలా కీలకం. మీ జీవిత భాగస్వామి సద్గుణవంతులే అయినప్పటికీ, చిన్న విషయాలకు అహం ఘర్షణలు లేదా ఇతరుల జోక్యం వల్ల అపార్థాలు ఏర్పడటం బాధ కలిగిస్తుంది. మీ భావాలను భాగస్వామికి సరిగ్గా అర్థమయ్యేలా చెప్పలేక నిశ్శబ్దంగా ఉండిపోవడం ఒంటరితనానికి దారితీస్తుంది. భాగస్వామ్యాల్లో రాతపూర్వక ఒప్పందాలు లేకపోతే నష్టం కలగవచ్చు.",
      "ta": "திருமண வாழ்க்கை அல்லது தொழில் கூட்டாண்மையில் பரஸ்பர நம்பிக்கையும் இணக்கமும் முக்கிய சவாலாக இருந்துள்ளன. உங்கள் துணை நற்குணம் கொண்டவராக இருப்பினும், மூன்றாவது நபர்களின் தலையீடு அல்லது ஈகோ மோதல்களால் மனஸ்தாபங்கள் எழுகின்றன. உங்கள் உண்மையான உணர்வுகளை வெளிப்படுத்த முடியாமல் மௌனமாவது தனிமைக்குத் தள்ளுகிறது. கூட்டுத் தொழிலில் முறையான ஒப்பந்தங்கள் இன்றி கண்மூடித்தனமாக நம்புவது ஏமாற்றத்தைத் தரும்."
    },
    "paragraph2": {
      "kn": "ಈ ಸಂಬಂಧಗಳ ಪರೀಕ್ಷೆಯು ನಿಮ್ಮಲ್ಲಿ ತ್ಯಾಗ, ಮೌನ ಹಾಗೂ ಆಳವಾದ ಪ್ರಬುದ್ಧತೆಯನ್ನು ಜಾಗೃತಗೊಳಿಸಲು ಬಂದಿರುವ ಕರ್ಮದ ಹಾದಿಯಾಗಿದೆ. ಸಂಗಾತಿಯ ಸಣ್ಣಪುಟ್ಟ ದೋಷಗಳನ್ನು ಕ್ಷಮಿಸಿ, ಪ್ರೀತಿಪೂರ್ವಕ ಮಾತುಕತೆಯ ಮೂಲಕ ವಿಶ್ವಾಸವನ್ನು ಮರುಸ್ಥಾಪಿಸಿದರೆ ದಾಂಪತ್ಯದಲ್ಲಿ ಅದ್ಭುತ ಮಧುರತೆ ನೆಲೆಸಲಿದೆ. ಯಾವುದೇ ಹೊರಗಿನವರ ಮಾತುಗಳನ್ನು ನಂಬಿ ಕುಟುಂಬದ ನೆಮ್ಮದಿಯನ್ನು ಹಾಳುಮಾಡಿಕೊಳ್ಳಬೇಡಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಉಮಾಮಹೇಶ್ವರ ಸೇವೆ ಹಾಗೂ ದಂಪತಿ ಸಮೇತ ಸಂಕಲ್ಪ ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸುವುದರಿಂದ ಸಂಬಂಧಗಳಲ್ಲಿನ ಎಲ್ಲ ಅಡೆತಡೆಗಳು ಮಂಜಿನಂತೆ ಕರಗಲಿವೆ. ಪರಸ್ಪರ ಗೌರವದಿಂದ ಕೂಡಿದ ನೂತನ ಸುಖಮಯ ಜೀವನವು ಶೀಘ್ರದಲ್ಲೇ ಚಿಗುರೊಡೆಯಲಿದೆ.",
      "en": "These relational crucibles exist not to sever bonds, but to purify ego into compassionate, mature companionship. By consciously replacing reactive defense mechanisms with gentle listening, you will witness old walls crumbling into renewed tenderness. Never allow outside gossip to dictate the sanctuary of your marriage. Invoking the divine union of Uma-Maheshwara at Gokarna Kshetra dissolves accumulated bitterness, ushering in an era of sublime mutual reverence, joyous teamwork, and unshakeable conjugal harmony.",
      "hi": "यह संबंध-परीक्षा आपको अहंकार से मुक्त कर परिपक्व सहचर्य सिखाने आई है। क्षमा और मधुर संवाद से दाम्पत्य में पुनः मिठास घुल जाएगी। बाहरी लोगों की बातों से परिवार की शांति को भंग न होने दें। श्री क्षेत्र गोकर्ण में उमा-महेश्वर सेवा और दंपती संकल्प पूजा से समस्त दूरियां समाप्त होकर सुखमय जीवन का शुभारंभ होगा।",
      "te": "ఈ పరీక్షలు మీలో పరిణతిని, క్షమాగుణాన్ని పెంపొందించడానికే ఏర్పడ్డాయి. చిన్నపాటి లోపాలను క్షమించి, ప్రేమతో మాట్లాడితే దాంపత్యంలో మధురత నెలకొంటుంది. బయటి వ్యక్తుల మాటలు విని సంసార సుఖాన్ని పాడుచేసుకోవద్దు. శ్రీ క్షేత్ర గోಕರ್ణంలో ఉమామహేశ్వర పూజ లేదా దంపతుల సంకల్పం నెరవేర్చడం వల్ల అనుబంధం మరింత దృఢపడి సంతోషం వెల్లివిరుస్తుంది.",
      "ta": "இந்த சோதனைகள் பக்குவத்தையும் தியாகத்தையும் வளர்ப்பதற்கே ஏற்பட்டுள்ளன. சிறிய குறைகளை மன்னித்து, அன்போடு உரையாடினால் தாம்பத்தியத்தில் இனிய வசந்தம் மலரும். வெளி ஆட்களின் பேச்சைக் கேட்டு குடும்ப அமைதியைக் கெடுத்துக்கொள்ள வேண்டாம். ஸ்ரீ கோகர்ணத்தில் உமா-மகேஸ்வரர் வழிபாடும் தம்பதி சங்கல்பமும் உறவுகளில் உள்ள தடைகளைக் கரைத்து, பரஸ்பர மரியாதையையும் மகிழ்ச்சியையும் நிலைநிறுத்தும்."
    }
  },
  "8": {
    "title": {
      "kn": "ಆಧ್ಯಾತ್ಮಿಕ ಪರಿವರ್ತನೆ, ಆಯುಷ್ಯ ರಕ್ಷಣೆ ಹಾಗೂ ನಿಗೂಢ ಜ್ಞಾನ",
      "en": "Sacred Rebirth, Transformative Turning Points & Hidden Truths",
      "hi": "आध्यात्मिक रूपांतरण, गूढ़ ज्ञान एवं प्राण रक्षा",
      "te": "ఆధ్యాత్మిక పరివర్తన & ఆయుష్య రక్షణ",
      "ta": "ஆன்மீக மறுமலர்ச்சி & ஆயுள் பாதுகாப்பு"
    },
    "paragraph1": {
      "kn": "ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಹಲವು ಬಾರಿ ಊಹಿಸಲೂ ಅಸಾಧ್ಯವಾದ ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳು ಮತ್ತು ಆಘಾತಕಾರಿ ಘಟನೆಗಳು ಸಂಭವಿಸಿ ನಿಮ್ಮ ಬದುಕಿನ ದಿಕ್ಕನ್ನೇ ಬದಲಿಸಿರಬಹುದು. ಹಠಾತ್ ಧನನಷ್ಟ, ವಂಚನೆ ಅಥವಾ ಆಪ್ತರ ಅಗಲಿಕೆಯಂತಹ ಸನ್ನಿವೇಶಗಳು ನಿಮ್ಮನ್ನು ಮಾನಸಿಕವಾಗಿ ತೀವ್ರ ಆಘಾತಕ್ಕೆ ದೂಡಿದ ಅನುಭವಗಳಾಗಿವೆ. ನಿಮ್ಮಲ್ಲಿ ಒಂದು ಅದ್ಭುತವಾದ ಆರನೇ ಇಂದ್ರಿಯ ಶಕ್ತಿಯಿದ್ದು, ನಡೆಯಬಹುದಾದ ಕೆಡುಕುಗಳು ನಿಮಗೆ ಮೊದಲೇ ಕನಸಿನಲ್ಲೋ ಅಥವಾ ಮನಸ್ಸಿನ ತಳಮಳದಲ್ಲೋ ಸುಳಿವು ನೀಡುತ್ತವೆ. ಗೂಢ ವಿದ್ಯೆಗಳು, ಜ್ಯೋತಿಷ್ಯ ಮತ್ತು ನಿಗೂಢ ಆಧ್ಯಾತ್ಮಿಕ ರಹಸ್ಯಗಳ ಬಗ್ಗೆ ನಿಮ್ಮ ಅಂತರಾಳದಲ್ಲಿ ಅಪಾರವಾದ ಸೆಳೆತ ಮತ್ತು ಜ್ಞಾನದಾಹವಿದೆ.",
      "en": "Your biography is marked by sudden, seismically unexpected plot twists that tore down old realities and forced you into radical rebirth. You have looked directly into the abyss of unexpected financial reversals, emotional betrayals, or traumatic endings that would have permanently shattered lesser souls. You possess an uncanny sixth sense—a subconscious radar that warns you of danger long before words are spoken or events manifest physically. A deep, magnetic fascination with occult wisdom, astrology, and metaphysical mysteries beats incessantly within your heart.",
      "hi": "आपके जीवन में अप्रत्याशित और चमत्कारी मोड़ आते रहे हैं जिन्होंने जीवन की दिशा ही बदल दी। अचानक वित्तीय उतार-चढ़ाव अथवा विश्वासघात जैसी घटनाओं ने आपको भीतर तक हिलाया है। आपके पास एक विलक्षण छठी इंद्री (Sixth Sense) है जो संकट आने से पूर्व ही अंतर्मन में संकेत दे देती है। ज्योतिष, तंत्र एवं आध्यात्मिक रहस्यों के प्रति आपका अगाध आकर्षण है।",
      "te": "మీ జీవితంలో ఊహించని ఆకస్మిక మలుపులు ఎదురై మీ ప్రయాణపు దిశనే మార్చివేసి ఉంటాయి. ధన నష్టం, నమ్మకద్రోహం లేదా ఆప్తుల దూరమవడం వంటి సంఘటనలు తీవ్ర మనోవేదనను కలిగించి ఉండవచ్చు. మీలో అద్భుతమైన ఆరవ ఇంద్రియ శక్తి (Sixth Sense) ఉంది, జరగబోయే ముప్పును ముందే పసిగట్టగలరు. గూఢ విద్యలు, జ్యోతిష్యం మరియు ఆధ్యాత్మిక రహస్యాల పట్ల మీకు విశేషమైన ఆసక్తి ఉంటుంది.",
      "ta": "உங்கள் வாழ்க்கைப் பாதையில் எதிர்பாராத திடீர் திருப்பங்கள் ஏற்பட்டு பழைய சூழ்நிலைகளை அடியோடு மாற்றி அமைத்துள்ளன. திடீர் பண இழப்பு, ஏமாற்றம் அல்லது நெருங்கியவர்களின் பிரிவு மனதை ஆழமாகப் பாதித்துள்ளது. வரவிருக்கும் ஆபத்துக்களை முன்கூட்டியே உணரும் உள்ளுணர்வு (Sixth Sense) உங்களிடம் உள்ளது. ஜோதிடம், ஆன்மீக ரகசியங்கள் மற்றும் மறைபொருள் அறிவியலில் உங்களுக்கு அளப்பரிய ஈர்ப்பு உண்டு."
    },
    "paragraph2": {
      "kn": "ಈ ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳು ಕೇವಲ ಸವಾಲುಗಳಲ್ಲ, ನಿಮ್ಮ ಆತ್ಮವನ್ನು ಲೌಕಿಕ ಭ್ರಮೆಗಳಿಂದ ಎಚ್ಚರಿಸಿ ಪರಮ ಸತ್ಯದತ್ತ ಕೊಂಡೊಯ್ಯುವ ದೈವಿಕ ರಹಸ್ಯವಾಗಿದೆ. ಪ್ರತಿಯೊಂದು ಬಿಕ್ಕಟ್ಟಿನ ನಂತರವೂ ನೀವು ಫೀನಿಕ್ಸ್ ಹಕ್ಕಿಯಂತೆ ಹೊಸ ಶಕ್ತಿಯೊಂದಿಗೆ ಪುನರ್ಜನ್ಮ ಪಡೆದು ಮೇಲೆದ್ದಿದ್ದೀರಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗದ ಆರಾಧನೆಯು ನಿಮ್ಮ ಆಯುಷ್ಯಕ್ಕೆ ದಿವ್ಯ ರಕ್ಷೆ ನೀಡಲಿದ್ದು, ಅಕಾಲಿಕ ಭಯ ಮತ್ತು ಆತಂಕಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಭಸ್ಮ ಮಾಡಲಿದೆ. ನಿತ್ಯವೂ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಅಮಾವಾಸ್ಯೆಯಂದು ಪಿತೃತರ್ಪಣ ಶ್ರಾದ್ಧ ಮಾಡುವುದರಿಂದ ಪೂರ್ವಜರ ಆಶೀರ್ವಾದ ಸದಾ ನಿಮ್ಮ ಮೇಲಿದ್ದು, ಮಹೋನ್ನತ ಆಧ್ಯಾತ್ಮಿಕ ಶಕ್ತಿ ಲಭಿಸಲಿದೆ.",
      "en": "Know with certainty that these severe transformational storms were not punishments, but sacred initiations stripping away fragile worldly illusions. Like the legendary Phoenix, you have risen from every ash heap stronger, wiser, and spiritually invincible. Surrendering to the primordial Atmalinga of Gokarna Mahabaleshwara blesses you with longevity, neutralizing sudden fear and phantom phobias. Chanting the sacred Mahamrityunjaya Mantra and offering reverent Tarpanam to ancestors will unlock profound esoteric wisdom and grant you enduring vitality.",
      "hi": "ये आकस्मिक घटनाएं दंड नहीं, अपितु आपकी आत्मा को जागृत करने वाली दैवीय दीक्षा थीं। आप प्रत्येक संकट के बाद फीनिक्स पक्षी की भांति अधिक सशक्त होकर उभरे हैं। श्री गोकर्ण महाबलेश्वर आत्मलिंग की शरण से दीर्घायु की प्राप्ति होगी और अकारण भय नष्ट होगा। महामृत्युंजय मंत्र का जप और अमावस्या पर पितृ तर्पण से असीम आध्यात्मिक शक्ति और सुरक्षा प्राप्त होगी।",
      "te": "ఈ ఆకస్మిక మలుపులు శిక్షలు కావు, మీ ఆత్మను మాయ నుండి మేల్కొలిపే దైవిక సంకేతాలు. ప్రతి సంక్షోభం తర్వాత మీరు ఫీనిక్స్ పక్షిలా మరింత బలవంతులుగా పునర్జన్మ పొందారు. శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర ఆత్మలింగ ఆరాధన మీ ఆయుష్షును కాపాడుతుంది, అకారణ భయాలను తొలగిస్తుంది. మహా మృత్యుంజయ మంత్ర జపం మరియు పితృ తర్పణాల ద్వారా పూర్వీకుల ఆశీస్సులు లభించి దివ్య శక్తి చేకూరుతుంది.",
      "ta": "இந்த தீவிர திருப்பங்கள் தண்டனை அல்ல, மாறாக உங்கள் ஆன்மாவை உலக மாயையிலிருந்து விடுவிக்கும் தீட்சையாகும். ஒவ்வொரு வீழ்ச்சிக்குப் பிறகும் பீனிக்ஸ் பறவை போல் புத்துயிர் பெற்று எழுந்துள்ளீர்கள். ஸ்ரீ கோகர்ண மகாபலேஸ்வரரின் ஆத்மலிங்க வழிபாடு நீண்ட ஆயுளையும் அச்சமற்ற வாழ்வையும் அருளும். மகா மிருத்யுஞ்சய ஜபமும் பித்ருக்களுக்குத் தர்ப்பணமும் உங்கள் ஆன்ம பலத்தை ஓங்கச் செய்யும்."
    }
  },
  "9": {
    "title": {
      "kn": "ಭಾಗ್ಯೋದಯದ ತಿರುವು, ಧರ್ಮ ನಿಷ್ಠೆ ಹಾಗೂ ದೈವಿಕ ಅನುಗ್ರಹ",
      "en": "Destiny Awakening, Faith Refined & Dharmic Breakthrough",
      "hi": "भाग्योदय का मोड़, धर्म निष्ठा एवं ईश्वरीय कृपा",
      "te": "భాగ్యోదయ మలుపు & ధర్మ నిష్ఠ",
      "ta": "பாக்கியோதயத் திருப்பம் & தர்ம நிஷ்டை"
    },
    "paragraph1": {
      "kn": "ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಅದೃಷ್ಟವು ಸುಲಭವಾಗಿ ಕೈಗೆಟುಕದೆ, ಪ್ರತಿಯೊಂದು ಭಾಗ್ಯೋದಯವೂ ಅಪಾರ ಪರೀಕ್ಷೆಗಳು ಮತ್ತು ವಿಳಂಬಗಳ ನಂತರವೇ ಪ್ರಾಪ್ತವಾಗುವ ಅನುಭವ ನಿಮಗಾಗಿದೆ. ತಂದೆಯವರೊಂದಿಗಿನ ಸೈದ್ಧಾಂತಿಕ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು ಅಥವಾ ಪೂರ್ವಜರ ಆಸ್ತಿ-ಪಾಸ್ತಿಗಳ ವಿಷಯದಲ್ಲಿ ಉಂಟಾದ ಅನಿರೀಕ್ಷಿತ ತೊಡಕುಗಳು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಅಸಮಾಧಾನವನ್ನು ಉಳಿಸಿರುತ್ತವೆ. ದೇವರ ಮೇಲಿನ ನಂಬಿಕೆಯು ಅನೇಕ ಕಠಿಣ ಸಂದರ್ಭಗಳಲ್ಲಿ ಪ್ರಶ್ನಿಸಲ್ಪಟ್ಟರೂ, ಆಂತರ್ಯದಲ್ಲಿ ಧರ್ಮದ ಹಾದಿಯನ್ನು ಬಿಡದ ನಿಮ್ಮ ನೈತಿಕತೆ ಪ್ರಶಂಸನೀಯವಾಗಿದೆ. ಧಾರ್ಮಿಕ ಯಾತ್ರೆಗಳು ಅಥವಾ ಉನ್ನತ ಶಿಕ್ಷಣದ ಪ್ರಯತ್ನಗಳು ಅಂತಿಮ ಕ್ಷಣದಲ್ಲಿ ಮುಂದೂಡಲ್ಪಟ್ಟ ಸಂದರ್ಭಗಳು ನಿಮ್ಮನ್ನು ನಿರಾಶೆಗೊಳಿಸಿರಬಹುದು.",
      "en": "Fortune has never arrived for you as an effortless gift; every single blessing of destiny has been chiseled out of prolonged patience and grueling trials. Philosophical differences or emotional distance with your father or paternal elders have cast a lingering shadow over your heart. There were painful periods where prolonged injustice caused you to question divine fairness, yet you stubbornly refused to abandon moral righteousness. Pilgrimages, higher academic pursuits, or foreign aspirations were often deferred right before departure, testing your faith.",
      "hi": "भाग्य आपको कभी सहजता से प्राप्त नहीं हुआ; प्रत्येक उपलब्धि कठोर तप और विलंब के बाद ही मिली है। पिता अथवा वरिष्ठों के साथ वैचारिक मतभेद अथवा पैतृक संपत्ति के मामलों में उलझनें मन को खिन्न करती रही हैं। कठिन समय में ईश्वर पर विश्वास डगमगाया अवश्य, परंतु आपने धर्म का मार्ग कभी नहीं छोड़ा। तीर्थयात्राएं या उच्च शिक्षा के प्रयास अंतिम समय पर टलने से निराशा हुई होगी।",
      "te": "అదృష్టం మీకు అంత సులభంగా వరించలేదు; ప్రతి భాగ్యోదయమూ తీవ్ర పరీక్షలు, జాప్యాల తర్వాతే దక్కింది. తండ్రిగారితో లేదా పెద్దలతో సిద్ధాంతపరమైన విభేదాలు లేదా పూర్వీకుల ఆస్తి విషయాలలో అడ్డంకులు మనస్సును బాధించి ఉంటాయి. కష్టకాలంలో దైవంపై నమ్మకం సడలినట్లు అనిపించినా, ధర్మ మార్గాన్ని వీడని మీ నిబద్ధత గొప్పది. తీర్థయాత్రలు లేదా ఉన్నత విద్యా ప్రయత్నాలు చివరి క్షణంలో వాయిదా పడటం నిరాశ కలిగించి ఉండవచ్చు.",
      "ta": "அதிர்ஷ்டம் உங்களுக்கு எளிதில் கைவரவில்லை; ஒவ்வொரு நற்பேறும் நீண்ட காத்திருப்பிற்கும் சோதனைகளுக்கும் பிறகே கிட்டியுள்ளது. தந்தையார் அல்லது பெரியவர்களுடனான கருத்து வேறுபாடுகள் அல்லது பூர்வீக சொத்து விவகாரங்களில் ஏற்பட்ட தடைகள் மனவருத்தத்தைத் தந்திருக்கலாம். சோதனையான காலங்களில் இறைநம்பிக்கை சோதிக்கப்பட்டாலும், தர்மத்தை விடாத உங்கள் குணம் போற்றத்தக்கது. புனித யாத்திரைகள் தள்ளிப்போனது கவலை அளித்திருக்கலாம்."
    },
    "paragraph2": {
      "kn": "ಆದರೆ ಕಠಿಣ ಪರಿಸ್ಥಿತಿಗಳಲ್ಲಿ ಪರಿಶುದ್ಧಗೊಂಡ ನಿಮ್ಮ ಧರ್ಮನಿಷ್ಠೆಯೇ ಈಗ ನಿಮ್ಮ ಬಹುದೊಡ್ಡ ಭಾಗ್ಯವಾಗಿ ಫಲ ನೀಡಲು ಸಿದ್ಧವಾಗಿದೆ. ತಂದೆ, ಗುರುಹಿರಿಯರ ಸೇವೆ ಮತ್ತು ಆಶೀರ್ವಾದವು ನಿಮ್ಮ ಜನ್ಮದ ಸಕಲ ದುರದೃಷ್ಟಗಳನ್ನು ತೊಳೆದುಹಾಕುವ ಪರಮೌಷಧಿಯಾಗಿದೆ. ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮ ಭಾಗ್ಯಸ್ಥಾನವು ಜಾಗೃತಗೊಂಡು, ದೀರ್ಘಕಾಲದಿಂದ ನಿಂತುಹೋಗಿದ್ದ ಮಹತ್ವದ ಕಾರ್ಯಗಳು ದೈವಬಲದಿಂದ ಪುನರಾರಂಭಗೊಳ್ಳಲಿವೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಗುರು ಸೇವೆ, ಗೋಪೂಜೆ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ದರ್ಶನವು ನಿಮ್ಮ ಭವಿಷ್ಯಕ್ಕೆ ರಾಜಮಾರ್ಗವನ್ನು ನಿರ್ಮಿಸಲಿದೆ. ಸದಾ ಧರ್ಮದ ಪರವಾಗಿ ನಿಲ್ಲಿ, ದೈವಿಕ ಅನುಗ್ರಹವು ನಿಮ್ಮನ್ನು ಉನ್ನತ ಕೀರ್ತಿ ಮತ್ತು ಯಶಸ್ಸಿನ ಶಿಖರಕ್ಕೆ ಕೊಂಡೊಯ್ಯಲಿದೆ.",
      "en": "That very integrity, tested through fire, is now ripening into extraordinary karmic fortune. The blessings of your preceptors and sincere service to elders will transmute past misfortune into magnificent breakthroughs. A dormant gateway of fortune is preparing to swing open, resurrecting projects that lay frozen for years. Serving cows, respecting mentors, and seeking the holy feet of Lord Mahabaleshwara at Gokarna will carve a royal highway for your destiny, elevating your name with honor and boundless divine grace.",
      "hi": "अग्निपरीक्षा में तपी आपकी धर्मनिष्ठा अब महान भाग्योदय का रूप लेने जा रही है। पिता और गुरुजनों की सेवा से पूर्व संचित दुर्भाग्य नष्ट होगा। शीघ्र ही आपका भाग्य स्थान जाग्रत होकर वर्षों से अटके कार्यों को गति देगा। श्री गोकर्ण में गुरु सेवा, गोपूजा और महाबलेश्वर दर्शन आपके भविष्य को स्वर्णिम मार्ग प्रदान करेंगे।",
      "te": "అగ్నిపరీక్షలో నెగ్గిన మీ ధర్మనిష్ఠే ఇప్పుడు గొప్ప భాగ్యోదయంగా మారబోతోంది. తండ్రి, గురువుల సేవ మరియు ఆశీర్వాదం సకల దురదృష్టాలను పారద్రోలుతాయి. త్వరలోనే మీ అదృష్ట ద్వారాలు తెరుచుకుని నిలిచిపోయిన పనులు వేగవంతమవుతాయి. గోకర్ణంలో గురుసేవ, గోపూజ, మహాబలేశ్వర దర్శనం మీ భవిష్యత్తుకు రాజమార్గాన్ని నిర్మిస్తాయి.",
      "ta": "சோதனைகளில் புடம்போடப்பட்ட உங்கள் தர்மமே இப்போது பேராற்றலாக மாறவுள்ளது. தந்தை மற்றும் குருமார்களின் சேவையும் ஆசியும் துரதிர்ஷ்டங்களை விரட்டும் மாமருந்தாகும். விரைவில் உங்கள் பாக்கிய ஸ்தானம் விழித்துக்கொண்டு முடங்கிக் கிடந்த பணிகளை முன்னெடுக்கும். ஸ்ரீ கோகர்ணத்தில் குரு சேவை, கோபூஜை மற்றும் மகாபலேஸ்வரர் தரிசனம் உங்கள் வாழ்வை உயர்த்தி நற்புகழைத் தரும்."
    }
  },
  "10": {
    "title": {
      "kn": "ವೃತ್ತಿ ಧರ್ಮ, ಕರ್ಮ ಸಿದ್ಧಿ ಹಾಗೂ ನಾಯಕತ್ವದ ಕೀರ್ತಿ",
      "en": "Professional Mastery, Karma Siddhi & Enduring Stature",
      "hi": "कर्म सिद्धि, कार्यक्षेत्र प्रतिष्ठा एवं नेतृत्व विजय",
      "te": "వృత్తి ధర్మం & నాయకత్వ కీర్తి",
      "ta": "தொழில் வெற்றி & தலைமைப் புகழ்"
    },
    "paragraph1": {
      "kn": "ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮ್ಮ ಸಾಮರ್ಥ್ಯ, ಪ್ರಾಮಾಣಿಕತೆ ಮತ್ತು ಕಠಿಣ ಪರಿಶ್ರಮಕ್ಕೆ ಎಂದೂ ಕೊರತೆಯಿಲ್ಲದಿದ್ದರೂ, ಪ್ರಮೋಷನ್ ಅಥವಾ ಉನ್ನತ ಸ್ಥಾನಮಾನಗಳು ಸಿಗುವ ೯೯% ಹಂತದಲ್ಲೇ ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು ಎದುರಾಗಿ ನಿಲ್ಲುವುದು ನಿಮ್ಮ ಅನುಭವಕ್ಕೆ ಬಂದಿರುತ್ತದೆ. ನೀವು ಕಷ್ಟಪಟ್ಟು ರೂಪಿಸಿದ ಯೋಜನೆಗಳ ಶ್ರೇಯಸ್ಸನ್ನು ಕಣ್ಣೆದುರೇ ಇತರರು ಕಸಿದುಕೊಳ್ಳುವುದು ನಿಮ್ಮ ಸ್ವಾಭಿಮಾನಕ್ಕೆ ತೀವ್ರ ಆಘಾತವನ್ನುಂಟುಮಾಡಿರಬಹುದು. ಹಿರಿಯ ಅಧಿಕಾರಿಗಳೊಂದಿಗೆ ಅಥವಾ ವ್ಯವಸ್ಥೆಯೊಂದಿಗೆ ಹೊಂದಾಣಿಕೆ ಮಾಡಿಕೊಳ್ಳಲಾಗದಂತಹ ಅಸಹಾಯಕತೆ ಕೆಲವೊಮ್ಮೆ ಉದ್ಯೋಗ ಬದಲಾವಣೆಯ ಯೋಚನೆಗೆ ದೂಡುತ್ತದೆ. ನಿಮ್ಮ ಅರ್ಹತೆಗೆ ತಕ್ಕ ಮನ್ನಣೆ ತಕ್ಷಣಕ್ಕೆ ಸಿಗದಿದ್ದರೂ, ನಿಮ್ಮ ಕರ್ತವ್ಯನಿಷ್ಠೆ ಎಂದೂ ಕುಂದಿಲ್ಲ.",
      "en": "In your vocation and professional sphere, your technical mastery and tireless diligence are beyond question, yet you have repeatedly confronted the heart-wrenching 99% bottleneck—career promotions, titles, or tenders halting right at the signing table. You have witnessed less-deserving opportunists hijack the credit for your painstaking innovations, wounding your professional dignity. Clashes with rigid organizational politics or authoritarian superiors have repeatedly prompted thoughts of walking away to launch independent ventures.",
      "hi": "कार्यक्षेत्र में आपकी योग्यता और निष्ठा असंदिग्ध है, फिर भी पदोन्नति अथवा प्रतिष्ठा के 99% पूर्ण होने पर अंतिम क्षण में बाधाएं आना आपकी व्यथा रही है। आपकी मेहनत का श्रेय दूसरों द्वारा ले जाना आपके स्वाभिमान को आहत करता रहा है। कार्यस्थल की राजनीति से तालमेल न बैठ पाने के कारण स्वतंत्र कार्य की भावना प्रबल होती है।",
      "te": "వృత్తి రంగంలో మీ నైపుణ్యం మరియు కష్టపడే తత్వానికి ఏమాత్రం కొరత లేనప్పటికీ, పదోన్నతి లేదా ఉన్నత స్థానాలు లభించే 99% సమయంలో ఊహించని అడ్డంకులు ఎదురవుతుంటాయి. మీరు కష్టపడి చేసిన పనుల గుర్తింపును ఇతరులు తన్నుకుపోవడం మీ ఆత్మగౌరవాన్ని దెబ్బతీసి ఉండవచ్చు. సంస్థాగత రాజకీయాలతో సర్దుబాటు కాలేక స్వతంత్ర వ్యాపారం చేయాలనే ఆలోచనలు వస్తుంటాయి.",
      "ta": "தொழில் மற்றும் உத்தியோகத்தில் உங்கள் திறமையும் கடின உழைப்பும் கேள்விக்கு அப்பாற்பட்டவை; ஆயினும் பதவி உயர்வு அல்லது அங்கீகாரம் கிடைக்க வேண்டிய 99% கட்டத்தில் தடைகள் ஏற்படுவது உங்களை வருத்தியுள்ளது. உங்கள் உழைப்பின் புகழை மற்றவர்கள் தட்டிப்பறிப்பது சுயமரியாதையை பாதித்துள்ளது. அலுவலக அரசியலுடன் ஒத்துப் போக முடியாமல் சொந்தத் தொழில் தொடங்கும் எண்ணம் எழுகிறது."
    },
    "paragraph2": {
      "kn": "ಆದರೆ ತಿಳಿಯಿರಿ, ಈ ವಿಳಂಬಗಳು ನಿಮ್ಮನ್ನು ಕೇವಲ ಒಬ್ಬ ಸಾಮಾನ್ಯ ಉದ್ಯೋಗಿಯನ್ನಾಗಿ ಉಳಿಸದೆ, ಭವಿಷ್ಯದ ಅಪ್ರತಿಮ ಸ್ವತಂತ್ರ ನಾಯಕನನ್ನಾಗಿ ರೂಪಿಸಲು ಸೃಷ್ಟಿಯಾದ ಕರ್ಮ ಸಿದ್ಧತೆಯಾಗಿದೆ. ಯಾರ ಕೃಪೆಯೂ ಇಲ್ಲದೆ ನಿಮ್ಮ ಸ್ವಂತ ಶಕ್ತಿಯಿಂದಲೇ ಉನ್ನತ ಕೀರ್ತಿ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಗೌರವವನ್ನು ಗಳಿಸುವ ಕಾಲ ಸನ್ನಿಹಿತವಾಗಿದೆ. ಕಚೇರಿ ರಾಜಕೀಯಕ್ಕೆ ತಲೆಕೆಡಿಸಿಕೊಳ್ಳದೆ ನಿಮ್ಮ ಕರ್ಮಧರ್ಮವನ್ನು ನಿಷ್ಠೆಯಿಂದ ಪಾಲಿಸಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸುವುದು ಹಾಗೂ ಸೂರ್ಯ ನಮಸ್ಕಾರವನ್ನು ನಿತ್ಯವೂ ಕೈಗೊಳ್ಳುವುದು ನಿಮ್ಮ ವೃತ್ತಿ ಬದುಕಿನ ಎಲ್ಲ ಸಂಕೋಲೆಗಳನ್ನು ಮುರಿದು, ಅಪೂರ್ವ ಯಶಸ್ಸು ಮತ್ತು ಅಧಿಕಾರವನ್ನು ತಂದುಕೊಡಲಿದೆ.",
      "en": "Recognize that these career delays were orchestrated not to suppress you, but to emancipate you from mediocre dependency and prepare you for sovereign leadership. The hour has arrived where your relentless craftsmanship will be acknowledged on the grand stage without needing to pander to power. Dedicate your labor directly as a sacred offering to the Divine. Offering daily Surya Namaskar and sponsoring Rudrabhisheka at Sri Kshetra Gokarna will smash every professional ceiling, establishing you in authentic authority and permanent public respect.",
      "hi": "ये विलंब आपको आश्रित न रखकर एक स्वतंत्र नेतृत्वकर्ता बनाने की तैयारी हैं। अब वह समय आ चुका है जब आपका कौशल व्यापक स्तर पर सम्मानित होगा। राजनीति की चिंता छोड़कर अपने कर्तव्य को ईश्वरार्पण करें। श्री गोकर्ण में रुद्राभिषेक और नित्य सूर्यनमस्कार आपके करियर के समस्त बंधनों को काटकर सर्वोच्च सत्ता और यश प्रदान करेंगे।",
      "te": "ఈ జాప్యాలు మిమ్మల్ని ఇతరులపై ఆధారపడే వ్యక్తిగా కాకుండా, స్వతంత్ర నాయకుడిగా నిలబెట్టేందుకే జరిగాయి. ఎవరి దయాదాక్షిణ్యాలతో పనిలేకుండా మీ స్వశక్తితోనే ఉన్నత కీర్తి ప్రతిష్టలు పొందే కాలం ఆసన్నమైంది. ఆఫీస్ రాజకీయాలను పట్టించుకోకుండా మీ కర్తవ్యాన్ని నిర్వహించండి. శ్రీ గోకర్ణ మహాబలేశ్వరునికి రుద్రాభిషేకం, నిత్య సూర్యనమస్కారాలు మీ వృత్తి జీవితంలో ఉన్నత విజయాలను అందిస్తాయి.",
      "ta": "இந்த தாமதங்கள் உங்களை எவரிடமும் கையேந்த விடாமல், ஒரு தலைவனாக உயர்த்தவே ஏற்பட்டுள்ளன. பிறரின் தயவின்றி உங்கள் சுய பலத்தால் உயர்ந்த நற்பெயரும் சமூக அந்தஸ்தும் கிட்டும் காலம் நெருங்கிவிட்டது. அலுவலக அரசியலைக் கண்டு அஞ்சாமல் உங்கள் கடமையைச் செய்யுங்கள். ஸ்ரீ கோகர்ணத்தில் ருத்ராபிஷேகமும் சூரிய நமஸ்காரமும் தொழில் தடைகளை உடைத்து நிரந்தர அதிகாரத்தையும் வெற்றியையும் தரும்."
    }
  },
  "11": {
    "title": {
      "kn": "ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ, ಸಂಚಿತ ಧನಲಾಭ ಹಾಗೂ ಸಾರ್ಥಕ ಪಯಣ",
      "en": "Aspiration Manifestation, Delayed Abundance & True Alliances",
      "hi": "मनोरथ सिद्धि, अप्रत्याशित लाभ एवं संचित समृद्धि",
      "te": "మనోరథ సిద్ధి & సంచిత ధనలాభం",
      "ta": "ஆசைகள் ஈடேறுதல் & தன லாபம்"
    },
    "paragraph1": {
      "kn": "ನಿಮ್ಮ ಆಕಾಂಕ್ಷೆಗಳು ಮತ್ತು ದೊಡ್ಡ ಕನಸುಗಳು ಫಲಪ್ರದವಾಗುವ ಹಂತದಲ್ಲಿ ನಿರೀಕ್ಷೆಗಿಂತ ಹೆಚ್ಚು ಸಮಯ ತೆಗೆದುಕೊಳ್ಳುವುದು ನಿಮಗೆ ನಿರಂತರ ತಾಳ್ಮೆಯ ಪರೀಕ್ಷೆಯಾಗಿದೆ. ಅಪಾರ ಲಾಭ ತರಬೇಕಾದ ದೊಡ್ಡ ಯೋಜನೆಗಳು ಕೊನೆಯ ಗಳಿಗೆಯಲ್ಲಿ ಸಣ್ಣ ಲಾಭಕ್ಕೆ ಸೀಮಿತವಾಗುವುದು ಅಥವಾ ಹಿರಿಯ ಸಹೋದರರೊಂದಿಗೆ, ಆಪ್ತ ಸ್ನೇಹಿತರೊಂದಿಗೆ ಹಣಕಾಸಿನ ವ್ಯವಹಾರಗಳಿಂದ ಮನಸ್ತಾಪಗಳು ಉಂಟಾಗಿರುವುದು ನಿಮ್ಮ ಹೃದಯಕ್ಕೆ ನೋವು ತಂದಿರುತ್ತದೆ. ನೀವು ನಂಬಿದ ಸ್ನೇಹಿತರ ವಲಯವೇ ಕೆಲವೊಮ್ಮೆ ನಿಮ್ಮ ಅಗತ್ಯದ ಸಮಯದಲ್ಲಿ ಕೈಕೊಟ್ಟ ಅನುಭವಗಳು ನಿಮ್ಮನ್ನು ಜಾಗರೂಕರನ್ನಾಗಿ ಮಾಡಿವೆ. ಆದರೂ ನಿಮ್ಮ ಆಶಾವಾದ ಮತ್ತು ಗುರಿ ತಲುಪುವ ಛಲ ಎಂದೂ ಅಳಿಸಿಲ್ಲ.",
      "en": "Your grandest long-term ambitions have undergone agonizing gestation periods, requiring double the patience expected in ordinary undertakings. High-stakes ventures that promised abundant returns ended up yielding modest windfalls at the final hour. Financial entanglements or joint ventures with trusted friends or elder siblings produced awkward friction, revealing that superficial acquaintances evaporate the moment adversity strikes. Even so, your innate optimism and stubborn pursuit of noble ideals remain undiminished.",
      "hi": "आपकी उच्च आकांक्षाओं की पूर्ति में अप्रत्याशित विलंब ने आपके धैर्य की परीक्षा ली है। बड़े लाभ की योजनाएं कई बार सीमित प्रतिफल में बदल गईं। मित्रों अथवा बड़े भाई-बहनों के साथ वित्तीय व्यवहार से मतभेद उत्पन्न हुए हैं। कठिन समय में निकटतम मित्रों का पीछे हट जाना आपको सावधान बना चुका है, फिर भी आपका आशावादी दृष्टिकोण अटूट है।",
      "te": "మీ ఉన్నత లక్ష్యాలు నెరవేరే క్రమంలో ఊహించిన దానికంటే ఎక్కువ సమయం పట్టడం మీ సహనాన్ని పరీక్షిస్తుంది. భారీ లాభాలు రావాల్సిన ప్రాజెక్టులు చివరి నిమిషంలో స్వల్ప లాభానికి పరిమితం కావడం లేదా మిత్రులతో, అన్నదమ్ములతో ఆర్థిక లావాదేవీల వల్ల మనస్పర్థలు రావడం బాధ కలిగిస్తుంది. కష్టకాలంలో నమ్మిన మిత్రులే ఆదుకోకపోవడం మిమ్మల్ని జాగరూకులను చేసింది.",
      "ta": "உங்கள் பெரிய கனவுகளும் லட்சியங்களும் கைகூடும் வேளையில் அதிக தாமதமாவது உங்கள் பொறுமையைச் சோதிக்கிறது. பெருத்த லாபம் தரவேண்டிய திட்டங்கள் குறைந்த ஆதாயத்தில் முடிவதும், நண்பர்கள் அல்லது மூத்த சகோதரர்களுடனான பண விவகாரங்களில் கருத்து வேறுபாடுகள் ஏற்படுவதும் வேதனை தந்துள்ளது. இக்கட்டான வேளையில் நண்பர்கள் கைவிட்ட அனுபவம் உங்களை எச்சரிக்கையடையச் செய்துள்ளது."
    },
    "paragraph2": {
      "kn": "ನಿಮ್ಮ ದೀರ್ಘಕಾಲದ ಕಾಯುವಿಕೆಗೆ ಈಗ ಪರಿಪೂರ್ಣ ಫಲ ಸಿಗುವ ಸಮಯ ಸನ್ನಿಹಿತವಾಗಿದೆ. ಕಾಲಕ್ರಮೇಣ ಈ ವಿಳಂಬಗಳೇ ನಿಮಗೆ ಯಾರು ನಿಜವಾದ ಆಪ್ತರು, ಯಾರು ಸ್ವಾರ್ಥಿಗಳು ಎಂಬುದನ್ನು ನಿಖರವಾಗಿ ಕಲಿಸಿವೆ. ಶೀಘ್ರದಲ್ಲೇ ನೀವು ಊಹಿಸದ ಮೂಲಗಳಿಂದ ಅನಿರೀಕ್ಷಿತ ಧನಲಾಭ, ಹಳೆಯ ಬಾಕಿ ವಸೂಲಾತಿ ಮತ್ತು ಸಮಾಜದ ಪ್ರಭಾವಿ ವ್ಯಕ್ತಿಗಳ ಬೆಂಬಲ ದೊರೆಯಲಿದೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಕೃಪೆಯಿಂದ ನಿಮ್ಮ ಇಷ್ಟಾರ್ಥಗಳೆಲ್ಲವೂ ಈಡೇರಲಿವೆ. ಬಡ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವಿದ್ಯಾಭ್ಯಾಸಕ್ಕೆ ನೆರವು ನೀಡುವುದು ಹಾಗೂ ಶನಿವಾರದಂದು ದಾನ ಧರ್ಮಗಳನ್ನು ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಲಾಭಸ್ಥಾನವು ಸದಾ ತುಂಬಿ ತುಳುಕಲಿದೆ.",
      "en": "The arduous season of waiting is drawing to a victorious close. Those painful delays have blessed you with peerless discernment, weeding out fair-weather companions and leaving only loyal allies. You are entering a harvest window where long-deferred gains, trapped capital, and unexpected patronage will surge into your accounts. Supporting underprivileged students and offering Saturday charities will activate your house of fulfillment. Lord Gokarna Mahabaleshwara will satisfy your heartfelt aspirations, blessing you with overflowing abundance.",
      "hi": "प्रतीक्षा की वह कठिन अवधि अब समाप्त होने को है। इन विलंबों ने आपको सच्चे और स्वार्थी मित्रों की पहचान करा दी है। शीघ्र ही अप्रत्याशित स्रोतों से लाभ, फंसा हुआ धन और प्रभावशाली व्यक्तियों का सहयोग प्राप्त होगा। श्री गोकर्ण महाबलेश्वर की कृपा से समस्त मनोरथ सिद्ध होंगे। निर्धन विद्यार्थियों की सहायता और शनिवार को दान करने से प्रचुर समृद्धि प्राप्त होगी।",
      "te": "దీర్ఘకాలిక నిరీక్షణకు ఇప్పుడు పూర్తి ఫలితం దక్కే సమయం వచ్చింది. ఈ జాప్యాలే మీకు నిజమైన శ్రేయోభిలాషులెవరో నేర్పాయి. అతి త్వరలోనే ఊహించని మార్గాల ద్వారా ధనలాభం, నిలిచిపోయిన బకాయిలు వసూలు కావడం మరియు సమాజంలో ప్రముఖుల మద్దతు లభిస్తాయి. శ్రీ గోకర్ణ మహాబలేశ్వరుని కృపతో మీ కోరికలన్నీ నెరవేరుతాయి. పేద విద్యార్థులకు సాయం చేయడం, శనివారం దానధర్మాలు చేయడం వల్ల లాభస్థానం బలపడుతుంది.",
      "ta": "நீண்ட நாள் காத்திருப்பிற்கு இனிமையான பலன் கிட்டும் நேரம் வந்துவிட்டது. இந்த தாமதங்களே யார் உண்மையான நண்பன் என்பதை உங்களுக்கு உணர்த்தியுள்ளன. விரைவில் எதிர்பாராத வழிகளில் தன லாபம், வராத பாக்கிகள் வசூலாதல் மற்றும் செல்வாக்கு மிக்கவர்களின் ஆதரவு கிடைக்கும். ஸ்ரீ கோகர்ண மகாபலேஸ்வரரின் அருளால் உங்கள் ஆசைகள் அனைத்தும் ஈடேறும். ஏழை மாணவர்களுக்கு உதவுவதும் சனிக்கிழமை தானமும் லாப ஸ்தானத்தை வலுப்படுத்தும்."
    }
  },
  "12": {
    "title": {
      "kn": "ಆಧ್ಯಾತ್ಮಿಕ ಮುಕ್ತಿ, ಧ್ಯಾನಾನುಭವ ಹಾಗೂ ನಿಶ್ಚಿಂತ ಜೀವನ",
      "en": "Spiritual Transcendence, Solitary Sanctuary & Inner Freedom",
      "hi": "आध्यात्मिक मुक्ति, ध्यान साधना एवं परम शांति",
      "te": "ఆధ్యాత్మిక ముక్తి & ఏకాంత సాధన",
      "ta": "ஆன்மீக முக்தி & தியான சாந்தி"
    },
    "paragraph1": {
      "kn": "ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಬರುವ ಆದಾಯಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿ ನಿರೀಕ್ಷಿಸದ ವ್ಯಯಗಳು ಮತ್ತು ಆಸ್ಪತ್ರೆ ಅಥವಾ ಅನಿವಾರ್ಯ ಪ್ರವಾಸಗಳಿಗೆ ಖರ್ಚಾಗುವ ಪರಿಸ್ಥಿತಿಗಳು ನಿಮ್ಮನ್ನು ಚಿಂತೆಗೀಡುಮಾಡಿರಬಹುದು. ರಾತ್ರಿ ವೇಳೆ ಗಾಢ ನಿದ್ರೆ ಬಾರದೆ ಅತಿಯಾದ ಆಲೋಚನೆಗಳು, ಏಕಾಂತದ ಹಂಬಲ ಮತ್ತು ಲೌಕಿಕ ಜಗತ್ತಿನ ಕೃತಕತೆಯಿಂದ ದೂರ ಸರಿಯಬೇಕೆಂಬ ತೀವ್ರ ವೈರಾಗ್ಯದ ಭಾವನೆಗಳು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಸುಳಿದಾಡುತ್ತವೆ. ವಿದೇಶ ಪ್ರವಾಸ ಅಥವಾ ಜನ್ಮಸ್ಥಳದಿಂದ ದೂರವಿರುವ ದೂರದ ಊರುಗಳಲ್ಲಿ ಬದುಕು ಕಟ್ಟಿಕೊಳ್ಳುವ ಸನ್ನಿವೇಶಗಳು ಎದುರಾಗುತ್ತವೆ. ಪ್ರಪಂಚಕ್ಕೆ ನಿಮ್ಮ ತ್ಯಾಗ ಮತ್ತು ಮೌನ ಅರ್ಥವಾಗದೆ, ಕೆಲವರು ನಿಮ್ಮನ್ನು ತಪ್ಪಾಗಿ ಗ್ರಹಿಸಿರಬಹುದು.",
      "en": "Uncontrollable financial leakages, unexpected medical outlays, or compulsory travel expenses have repeatedly disrupted your carefully budgeted savings. During quiet nights, restorative deep sleep frequently eludes you as racing thoughts and subconscious anxieties replay past memories. A profound sense of spiritual dispassion (Vairagya) and a deep yearning to withdraw from the hollow theater of worldly politics tugs incessantly at your soul. Destiny often pushes you toward foreign shores or living far away from your birthplace to find true purpose.",
      "hi": "आय की तुलना में अप्रत्याशित व्यय, चिकित्सा अथवा अनिवार्य यात्राओं के खर्चे कई बार आपकी बचत को प्रभावित करते हैं। रात्रि में गहरी नींद का अभाव, अत्यधिक विचार और सांसारिक दिखावे से दूर एकांत में रहने की इच्छा मन में उठती है। विदेश अथवा जन्मस्थान से दूर रहने के योग बनते हैं। संसार आपकी त्याग भावना को न समझकर कई बार आपको गलत समझ लेता है।",
      "te": "ఆదాయం కంటే అనూహ్యమైన ఖర్చులు, ఆసుపత్రి లేదా అనివార్య ప్రయాణాల వల్ల పొదుపు తగ్గడం మిమ్మల్ని ఆలోచింపజేస్తుంది. రాత్రి వేళల్లో ప్రశాంతమైన నిద్ర కరువై అతిగా ఆలోచించడం, ఏకాంతాన్ని కోరుకోవడం, ప్రాపంచిక విషయాలపై విరక్తి కలుగుతుంటాయి. జన్మస్థలానికి దూరంగా లేదా విదేశాలలో స్థిరపడే పరిస్థితులు ఏర్పడతాయి. మీ త్యాగాలను లోకం సరిగ్గా అర్థం చేసుకోకపోవచ్చు.",
      "ta": "வருமானத்தை விட எதிர்பாராத செலவுகள், மருத்துவச் செலவுகள் அல்லது தவிர்க்க முடியாத பயணங்கள் உங்கள் சேமிப்பைக் கரைத்து விடுகின்றன. இரவில் ஆழ்ந்த தூக்கமின்மை, தொடர் சிந்தனைகள் மற்றும் உலக மாயையிலிருந்து விலகி தனிமையில் இருக்க வேண்டும் என்ற வைராக்கியம் எழுகிறது. வெளிநாடு அல்லது பிறந்த ஊரை விட்டு தூரத்தில் வசிக்கும் சூழல் உருவாகிறது. உங்கள் தியாகங்களை உலகம் தவறாகப் புரிந்துகொண்டிருக்கலாம்."
    },
    "paragraph2": {
      "kn": "ನಿಮ್ಮ ಈ ಆಧ್ಯಾತ್ಮಿಕ ತುಡಿತವು ಈ ಜನ್ಮದಲ್ಲಿ ಮುಕ್ತಿ ಮತ್ತು ಆತ್ಮಸಾಕ್ಷಾತ್ಕಾರವನ್ನು ಪಡೆಯಲು ಬಂದಿರುವ ಪರಮ ಪವಿತ್ರ ಸಂಸ್ಕಾರವಾಗಿದೆ. ಅತಿಯಾದ ವ್ಯಯಗಳನ್ನು ನಿಯಂತ್ರಿಸಲು ನಿತ್ಯವೂ ದಾನ-ಧರ್ಮಗಳ ಸಂಕಲ್ಪ ಮಾಡುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಪರಿಹಾರವಾಗಿದೆ. ಏಕಾಂತದಲ್ಲಿ ಕುಳಿತು ಮಾಡುವ ಪ್ರಾಣಾಯಾಮ ಮತ್ತು ಧ್ಯಾನವು ನಿಮ್ಮ ನಿದ್ರಾಹೀನತೆಯನ್ನು ಹೋಗಲಾಡಿಸಿ ಪರಮ ಆನಂದವನ್ನು ತುಂಬಲಿದೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕಾಲ ಕಳೆಯುವುದು ಹಾಗೂ ಸಂಜೆ ಶಿವನಾಮ ಸ್ಮರಣೆ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಮನಸ್ಸಿನ ಎಲ್ಲ ಭಾರಗಳೂ ಇಳಿದು, ಸಾಕ್ಷಾತ್ ಈಶ್ವರನ ಪರಮ ಕೃಪೆಯು ನಿಮ್ಮನ್ನು ನಿಶ್ಚಿಂತ ಮುಕ್ತ ಜೀವನಕ್ಕೆ ಮುನ್ನಡೆಸಲಿದೆ.",
      "en": "This spiritual yearning is not an affliction, but your soul's supreme initiation toward true liberation and inner peace. By proactively channeling your wealth into sacred charities and temple services, you invert unwanted expenditures into eternal spiritual merit. Practicing evening Pranayama and silent meditation will dissolve insomnia, gifting you sweet, rejuvenating rest. Spending contemplative moments at the sacred sea-shore Atmalinga of Gokarna will lift every subconscious weight from your shoulders, establishing you in serene bliss, clarity, and sovereign freedom.",
      "hi": "यह आध्यात्मिक झुकाव इस जन्म में मोक्ष और आत्मज्ञान प्राप्त करने की पवित्र प्रेरणा है। व्यर्थ व्यय को रोकने हेतु स्वेच्छा से धर्मार्थ दान करना सर्वश्रेष्ठ उपाय है। सायंकाल प्राणायाम और मौन ध्यान अनिद्रा को दूर कर मन को शांति देगा। श्री गोकर्ण महाबलेश्वर के पावन सान्निध्य में समय बिताना आपके समस्त मानसिक भार को उतारकर जीवन को परम शांति प्रदान करेगा।",
      "te": "ఈ ఆధ్యాత్మిక తపన మీకు మోక్షం మరియు ఆత్మసాక్షాత్కారాన్ని అందించే పవిత్ర సంస్కారం. అధిక ఖర్చులను అరికట్టడానికి సేవా కార్యక్రమాలలో భాగస్వామ్యం కావడం ఉత్తమ పరిహారం. సాయంత్రం వేళల్లో ప్రాణాయామం మరియు ధ్యానం చేయడం వల్ల నిద్రలేమి సమస్య తీరి పరమ శాంతి లభిస్తుంది. శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధిలో గడపడం వల్ల మీ మానసిక భారం తొలగి ఈశ్వర కృప కలుగుతుంది.",
      "ta": "இந்த ஆன்மீக ஏக்கம் இந்த பிறவியில் முக்தியை அடைவதற்கான புனித உந்துதலாகும். வீண் செலவுகளைக் கட்டுப்படுத்த நற்காரியங்களுக்குத் தானம் செய்வது சிறந்த பரிகாரமாகும். மாலையில் பிராணாயாமமும் தியானமும் தூக்கமின்மையைப் போக்கி அமைதியைத் தரும். ஸ்ரீ கோகர்ண மகாபலேஸ்வரரின் சந்நிதியில் மனதை நிலைநிறுத்தி வழிபடுவது பாரங்களை நீக்கி பேரானந்தத்தை வழங்கும்."
    }
  }
};

export const getMaandiPerspectiveInterpretation = (
  houseNumber: number,
  rashiIndex: number,
  lang: string = "kn",
  _name?: string
): MaandiPerspectiveInquest => {
  const h = Math.max(1, Math.min(12, Math.floor(houseNumber) || 1));
  const data = MAANDI_PERSPECTIVE_DATA[h] || MAANDI_PERSPECTIVE_DATA[1];

  const targetLang = (lang || "kn").split("-")[0].toLowerCase();

  const title =
    data.title[targetLang] ||
    data.title.en ||
    data.title.kn ||
    "ಆಂತರಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ನಿಗೂಢ ಚೇತನ ಶಕ್ತಿ";

  const p1 =
    data.paragraph1[targetLang] ||
    data.paragraph1.kn ||
    data.paragraph1.en;

  const p2 =
    data.paragraph2[targetLang] ||
    data.paragraph2.kn ||
    data.paragraph2.en;

  return {
    title,
    paragraph1: p1,
    paragraph2: p2,
    house: h
  };
};


