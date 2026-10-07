/**
 * Baggona Panchanga Astrology - Public Kundali 30-Day Calendar & Priest QR Card
 * High-Resolution Printable A4 Card with Scannable Google Calendar QR & Purohita details
 * Compliant with baggona-qr-code-guard (ASCII-only compact URL, Level L error correction)
 */

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { PublicKundliProfile } from "../../features/publicKundli/publicKundliEngine";
import {
  generateQrPayloadByTarget,
  calculateDeterministicRhythmDay,
  getSafeProductionOrigin,
  generateCompactGoogleCalendarUrlForQR
} from "../../features/seva/icsCalendarGenerator";
import { getPublicKundliText, type PublicKundliLang } from "../../features/publicKundli/publicKundliLocale";

export interface KundliQrProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  lagnaSign: string;
  lagnaSanskrit?: string;
  moonSign: string;
  moonSanskrit?: string;
  moonNakshatra: string;
  moonPada?: string | number;
  currentMahadasha?: string;
  currentBhukti?: string;
  moonNakshatraIndex?: number;
  moonRashiIndex?: number;
}

export interface Kundli30DayQrCardProps {
  profile: KundliQrProfile;
  lang?: string;
  panditName?: string;
  priestPhone?: string;
  qrDataUrl?: string;
  placeLabel?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
}

const I18N: Record<string, Record<string, string>> = {
  kn: {
    templeBanner: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    cardTitle: "ಮುಂದಿನ ೩೦-ದಿನಗಳ ದೈನಂದಿನ ಪಂಚಾಂಗ & ಶುಭ ಮುಹೂರ್ತ ಕ್ಯಾಲೆಂಡರ್",
    cardSubtitle: "ದೈನಂದಿನ ತಿಥಿ, ವಾರ, ನಕ್ಷತ್ರ, ಚಂದ್ರಬಲ ಹಾಗೂ ಶುಭ ಮುಹೂರ್ತಗಳನ್ನು ಗೂಗಲ್ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಲು ಈ ಕೆಳಗಿನ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    devoteeTitle: "ಜಾತಕರ ಜನ್ಮ ಕುಂಡಲಿ ಸಾರಾಂಶ",
    nameLabel: "ಹೆಸರು:",
    birthDetailsLabel: "ಜನನ ವಿವರ:",
    lagnaLabel: "ಲಗ್ನ:",
    rashiLabel: "ರಾಶಿ:",
    nakshatraLabel: "ನಕ್ಷತ್ರ:",
    dashaLabel: "ಪ್ರಸ್ತುತ ಮಹಾದಶಾ-ಭುಕ್ತಿ:",
    featuresTitle: "೩೦-ದಿನಗಳ ದೈನಂದಿನ ಕ್ಯಾಲೆಂಡರ್ ವಿಶೇಷತೆಗಳು:",
    feat1: "🌅 ನಿತ್ಯ ತಿಥಿ, ವಾರ & ನಕ್ಷತ್ರ ಗಣನೆ",
    feat2: "⏰ ಪ್ರತಿದಿನ ಬೆಳಗ್ಗೆ ೭:೦೦ಕ್ಕೆ ಸ್ಮಾರ್ಟ್ ಅಲರ್ಟ್",
    feat3: "✨ ಅಮೃತ ಕಾಲ, ರಾಹು ಕಾಲ & ಶುಭ ಮುಹೂರ್ತ",
    feat4: "🪔 ಜನ್ಮ ನಕ್ಷತ್ರ ಶಾಂತಿ & ದೈನಂದಿನ ದೇವತಾ ಆರಾಧನೆ",
    scanInstructionsTitle: "ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಮಾಡುವ ಸರಳ ಹಂತಗಳು:",
    step1: "೧. ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾ ಅಥವಾ Google Lens ತೆರೆಯಿರಿ.",
    step2: "೨. ಈ ಕೆಳಗಿನ ಕ್ಯೂಆರ್ ಕೋಡ್ ಅನ್ನು ನೇರವಾಗಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    step3: "೩. ತೆರೆಯುವ ಲಿಂಕ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ 'Add to Calendar' ಆಯ್ಕೆಮಾಡಿ.",
    step4: "೪. ಮುಂದಿನ ೩೦ ದಿನಗಳ ನಿತ್ಯ ಪಂಚಾಂಗ ಮತ್ತು ಶುಭ ಮುಹೂರ್ತ ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಲಭ್ಯ!",
    guidelinesTitle: "ದೈನಂದಿನ ಪಂಚಾಂಗ ಪರಿಪಾಲನಾ ಸಂಕಲ್ಪ:",
    guidelinesDesc: "ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲದಲ್ಲಿ ತಿಥಿ, ವಾರ, ನಕ್ಷತ್ರ ಮತ್ತು ಚಂದ್ರಬಲವನ್ನು ಸ್ಮರಿಸುವುದರಿಂದ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ದೈವಿಕ ರಕ್ಷಣೆ ಸಿದ್ಧಿಸುತ್ತದೆ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಆಶೀರ್ವಾದ ಸದಾ ಇರಲಿ.",
    priestHeader: "ಮುಖ್ಯ ಜ್ಯೋತಿಷಿಗಳು & ಪುರೋಹಿತರ ಅಧಿಕೃತ ಸಂಪರ್ಕ",
    priestName: "ವೇದಮೂರ್ತಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    priestRole: "ಪ್ರಧಾನ ಅರ್ಚಕರು ಹಾಗೂ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಸಲಹೆಗಾರರು",
    templeAddress: "ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ, ಕರ್ನಾಟಕ - ೫೮೧೩೨೬",
    priestPhoneLabel: "ನೇರ ಸಂಪರ್ಕ & ವಾಟ್ಸಾಪ್ (WhatsApp):",
    priestBlessing: "ಯಾವುದೇ ದೋಷ ಪರಿಹಾರ, ಪೂಜಾ ಸಂಕಲ್ಪ, ಕುಂಡಲಿ ಸಮಾಲೋಚನೆ ಅಥವಾ ಶಾಂತಿ ಹೋಮಗಳಿಗಾಗಿ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.",
    templeSealTitle: "॥ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥",
    templeSealLabel: "ಅಧಿಕೃತ ಸನ್ನಿಧಿ ಮುದ್ರೆ",
    pageFooterBanner: "॥ ಶ್ರೀ ಸದಾಶಿವೋ ರಕ್ಷತು · ಶ್ರೀ ಮಹಾಗಣಪತಿ ಪ್ರಸನ್ನ ॥ · ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ"
  },
  en: {
    templeBanner: "॥ Shri Gokarna Mahabaleshwara Sannidhana · Baggona Panchanga Astrology ॥",
    cardTitle: "Next 30-Day Daily Panchanga & Auspicious Calendar QR",
    cardSubtitle: "Scan the QR code below to automatically sync the next 30 days of daily tithi, nakshatra, and auspicious muhurthas directly into your Google Calendar.",
    devoteeTitle: "Devotee Janma Kundali Summary",
    nameLabel: "Devotee Name:",
    birthDetailsLabel: "Birth Details:",
    lagnaLabel: "Lagna:",
    rashiLabel: "Moon Sign (Rashi):",
    nakshatraLabel: "Janma Nakshatra:",
    dashaLabel: "Current Dasha-Bhukti:",
    featuresTitle: "30-Day Daily Calendar Sync Highlights:",
    feat1: "🌅 Daily Tithi, Vara & Nakshatra",
    feat2: "⏰ Daily 7:00 AM Smart Notification",
    feat3: "✨ Amrita Kaala, Rahu Kaala & Auspicious Times",
    feat4: "🪔 Janma Nakshatra Alignment & Daily Prayers",
    scanInstructionsTitle: "Simple Steps to Sync Your Calendar:",
    step1: "1. Open your smartphone Camera or Google Lens.",
    step2: "2. Scan the official QR code shown below.",
    step3: "3. Tap the link and select 'Add to Calendar' / 'Save'.",
    step4: "4. Receive daily morning auspicious muhurthas and daily tithi on your phone!",
    guidelinesTitle: "Daily Panchanga Observance Guidelines:",
    guidelinesDesc: "Remembering the daily Tithi, Vara, Nakshatra, and Moon rhythm every morning bestows vitality, peace, and spiritual protection under Sri Gokarna Mahabaleshwara's grace.",
    priestHeader: "Official Priest (Purohita) & Astrologer Contact",
    priestName: "Vedamurthy Shreeram Pandit",
    priestRole: "Chief Priest & Vedic Astrology Consultant",
    templeAddress: "Shri Baggona Panchanga Jyotishya Karyalaya, Gokarna Kshetra, Karnataka - 581326",
    priestPhoneLabel: "Direct Call & WhatsApp:",
    priestBlessing: "For personal astrology consultations, dosha parihara sankalpa, temple poojas, or shanti homas, please contact directly.",
    templeSealTitle: "॥ Gokarna Sannidhi ॥",
    templeSealLabel: "Official Temple Seal",
    pageFooterBanner: "॥ Sri Sadashivo Rakshatu · Sri Mahaganapati Prasanna ॥ · Sri Gokarna Mahabaleshwara Kshetra"
  },
  hi: {
    templeBanner: "॥ श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    cardTitle: "आगामी ३०-दिवसीय दैनिक पंचांग एवं शुभ मुहूर्त कैलेंडर",
    cardSubtitle: "दैनिक तिथि, वार, नक्षत्र एवं शुभ मुहूर्त को अपने गूगल कैलेंडर में सिंक करने के लिए नीचे दिया गया क्यूआर कोड स्कैन करें।",
    devoteeTitle: "जातक जन्म कुंडली सारांश",
    nameLabel: "नाम:",
    birthDetailsLabel: "जन्म विवरण:",
    lagnaLabel: "लग्न:",
    rashiLabel: "राशि:",
    nakshatraLabel: "नक्षत्र:",
    dashaLabel: "वर्तमान महादशा-भुक्ति:",
    featuresTitle: "३०-दिवसीय दैनिक कैलेंडर की प्रमुख विशेषताएं:",
    feat1: "🌅 दैनिक तिथि, वार एवं नक्षत्र गणना",
    feat2: "⏰ प्रतिदिन प्रातः ७:०० बजे स्मार्ट सूचना",
    feat3: "✨ अमृत काल, राहु काल एवं शुभ मुहूर्त",
    feat4: "🪔 जन्म नक्षत्र शांति एवं दैनिक देव आराधना",
    scanInstructionsTitle: "कैलेंडर सिंक करने के सरल चरण:",
    step1: "१. अपने फोन का कैमरा अथवा Google Lens खोलें।",
    step2: "२. नीचे दिए गए आधिकारिक क्यूआर कोड को स्कैन करें।",
    step3: "३. लिंक पर क्लिक करके 'Add to Calendar' चुनें।",
    step4: "४. अगले ३० दिनों का दैनिक पंचांग सीधे आपके फोन पर उपलब्ध!",
    guidelinesTitle: "दैनिक पंचांग परिपालन संकल्प:",
    guidelinesDesc: "प्रतिदिन प्रातःकाल तिथि, वार, नक्षत्र एवं चंद्रबल का स्मरण करने से आयु, आरोग्य एवं दैवीय सुरक्षा प्राप्त होती है। श्री गोकर्ण महाबलेश्वर की कृपा सदा बनी रहे।",
    priestHeader: "मुख्य ज्योतिषी एवं पुरोहित आधिकारिक संपर्क",
    priestName: "वेदामूर्ति श्रीराम पंडित",
    priestRole: "प्रधान पुरोहित एवं वैदिक ज्योतिष परामर्शदाता",
    templeAddress: "श्री बग्गोण पंचांग ज्योतिष कार्यालय, गोकर्ण क्षेत्र, कर्नाटक - ५८१೩೨೬",
    priestPhoneLabel: "सीधा संपर्क एवं व्हाट्सएप:",
    priestBlessing: "किसी भी दोष परिहार, पूजा संकल्प, कुंडली परामर्श अथवा शांति होम हेतु सीधे संपर्क करें।",
    templeSealTitle: "॥ गोकर्ण सन्निधि ॥",
    templeSealLabel: "अधिकारिक सन्निधि मुहर",
    pageFooterBanner: "॥ श्री सदाशिवो रक्षतु · श्री महागणपति प्रसन्न ॥ · श्री गोकर्ण महाबलेश्वर सन्निधान"
  },
  te: {
    templeBanner: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    cardTitle: "రాబోయే 30 రోజుల దైనందిన పంచాంగం & శుభ ముహూర్తాల క్యాలెండర్",
    cardSubtitle: "దైనందిన తిథి, నక్షత్రం మరియు శుభ ముహూర్తాలను గూగుల్ క్యాలెండర్‌లో సింక్ చేయడానికి ఈ క్యూఆర్ కోడ్‌ను స్కాన్ చేయండి.",
    devoteeTitle: "జాతక జన్మ కుండలి సారాంశం",
    nameLabel: "పేరు:",
    birthDetailsLabel: "జన్మ వివరాలు:",
    lagnaLabel: "లగ్నం:",
    rashiLabel: "రాశి:",
    nakshatraLabel: "నక్షత్రం:",
    dashaLabel: "ప్రస్తుత మహాదశ-భుక్తి:",
    featuresTitle: "30 రోజుల దైనందిన క్యాలెండర్ ప్రత్యేకతలు:",
    feat1: "🌅 దైనందిన తిథి, వారం & నక్షత్రం",
    feat2: "⏰ ప్రతిరోజూ ఉదయం 7:00 గంటలకు అలర్ట్",
    feat3: "✨ అమృత కాలం, రాహు కాలం & శుభ ముహూర్తం",
    feat4: "🪔 జన్మ నక్షత్ర శాంతి & నిత్య దేవతా ఆరాధన",
    scanInstructionsTitle: "క్యాలెండర్ సింక్ చేసే సులభ దశలు:",
    step1: "1. మీ స్మార్ట్‌ఫోన్ కెమెరా లేదా Google Lens తెరవండి.",
    step2: "2. కింద ఉన్న క్యూఆర్ కోడ్‌ను స్కాన్ చేయండి.",
    step3: "3. లింక్‌ను నొక్కి 'Add to Calendar' ఎంచుకోండి.",
    step4: "4. రాబోయే 30 రోజుల పంచాంగ సమాచారం మీ ఫోన్‌లో అందుబాటులో ఉంటుంది!",
    guidelinesTitle: "దైనందిన పంచాంగ పరిపాలన సంకల్పం:",
    guidelinesDesc: "ప్రతిరోజూ ఉదయం తిథి, వారం, నక్షత్రం మరియు చంద్రబలాన్ని స్మరించడం వలన ఆయురారోగ్యాలు, మానసిక ప్రశాంతత లభిస్తాయి. శ్రీ గోకర్ణ మహాబలేశ్వరుని కృప సదా ఉండుగాక.",
    priestHeader: "ప్రధాన జ్యోతిష్యులు & పురోహితుల సంప్రదింపు వివరాలు",
    priestName: "వేదమూర్తి శ్రీరామ్ పండిత్",
    priestRole: "ప్రధాన అర్చకులు & వైదిక జ్యోతిష్య సలహాదారులు",
    templeAddress: "శ్రీ బగ్గోణ పంచాంగ జ్యోతిష్య కార్యాలయం, గోకర్ణ క్షేత్రం, కర్ణాటక - 581326",
    priestPhoneLabel: "ప్రత్యక్ష సంప్రదింపు & వాట్సాప్:",
    priestBlessing: "దోష పరిహారాలు, పూజా సంకల్పం లేదా జాతక విశ్లేషణ కోసం నేరుగా సంప్రదించండి.",
    templeSealTitle: "॥ గోకర్ణ సన్నిధి ॥",
    templeSealLabel: "అధికారిక సన్నిధి ముద్ర",
    pageFooterBanner: "॥ శ్రీ సదాశివో రక్షతు · శ్రీ మహాగణపతి ప్రసన్న ॥ · శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం"
  },
  ta: {
    templeBanner: "॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதானம் · பக்ககோண பஞ்சாங்க ஜோதிடம் ॥",
    cardTitle: "அடுத்த 30 நாட்களுக்கான தினசரி பஞ்சாங்கம் & சுப முகூர்த்த காலண்டர்",
    cardSubtitle: "தினசரி திதி, நட்சத்திரம் மற்றும் சுப முகூர்த்தங்களை கூகுள் காலண்டரில் இணைக்க கீழேயுள்ள QR குறியீட்டை ஸ்கேன் செய்யவும்.",
    devoteeTitle: "ஜாதகர் ஜன்ம குண்டலி சுருக்கம்",
    nameLabel: "பெயர்:",
    birthDetailsLabel: "பிறப்பு விவரங்கள்:",
    lagnaLabel: "லக்னம்:",
    rashiLabel: "ராசி:",
    nakshatraLabel: "நட்சத்திரம்:",
    dashaLabel: "தற்போதைய மகாதிசை-புக்தி:",
    featuresTitle: "30 நாட்களுக்கான தினசரி காலண்டர் சிறப்பம்சங்கள்:",
    feat1: "🌅 தினசரி திதி, வாரம் & நட்சத்திரம்",
    feat2: "⏰ தினசரி காலை 7:00 மணிக்கு நினைவூட்டல்",
    feat3: "✨ அமிர்த காலம், ராகு காலம் & சுப முகூர்த்தம்",
    feat4: "🪔 ஜன்ம நட்சத்திர சாந்தி & தினசரி வழிபாடு",
    scanInstructionsTitle: "காலண்டர் இணைக்கும் எளிய முறைகள்:",
    step1: "1. உங்கள் தொலைபேசி கேமரா அல்லது Google Lens திறக்கவும்.",
    step2: "2. கீழேயுள்ள அதிகாரப்பூர்வ QR குறியீட்டை ஸ்கேன் செய்யவும்.",
    step3: "3. 'Add to Calendar' என்பதைத் தேர்ந்தெடுத்து சேமிக்கவும்.",
    step4: "4. அடுத்த 30 நாட்களின் சுப தகவல்கள் உங்கள் கைபேசியில் உடனுக்குடன்!",
    guidelinesTitle: "தினசரி பஞ்சாங்க வழிபாட்டு சங்கல்பம்:",
    guidelinesDesc: "தினசரி காலையில் திதி, வாரம், நட்சத்திரம் ஆகியவற்றை தியானிப்பதால் ஆயுள், ஆரோக்கியம் மற்றும் தெய்விக பாதுகாப்பு உண்டாகும். ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் அருள் நிலைக்கட்டும்.",
    priestHeader: "முதன்மை ஜோதிடர் மற்றும் புரோகிதர் தொடர்பு விவரங்கள்",
    priestName: "வேதமூர்த்தி ஸ்ரீராம் பண்டிதர்",
    priestRole: "தலைமை அர்ச்சகர் மற்றும் வேத ஜோதிட ஆலோசகர்",
    templeAddress: "ஸ்ரீ பக்ககோண பஞ்சாங்க ஜோதிட நிலையம், கோகர்ணம், கர்நாடகா - 581326",
    priestPhoneLabel: "நேரடி அழைப்பு & வாட்ஸ்அப்:",
    priestBlessing: "தோஷ பரிகாரங்கள், பூஜை சங்கல்பம் அல்லது ஜாதக ஆலோசனைக்கு நேரடியாகத் தொடர்பு கொள்ளவும்.",
    templeSealTitle: "॥ கோகர்ண சந்நிதி ॥",
    templeSealLabel: "அதிகாரப்பூர்வ சந்நிதி முத்திரை",
    pageFooterBanner: "॥ ஸ்ரீ சதாசிவோ ரக்ஷது · ஸ்ரீ மஹாகணபதி பிரசன்னம் ॥ · ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி"
  }
};

export const Kundli30DayQrCard: React.FC<Kundli30DayQrCardProps> = ({
  profile,
  lang = "kn",
  panditName = "Shreeram Pandit",
  priestPhone = "9972339362",
  qrDataUrl: externalQr,
  placeLabel,
  pincode = "581326",
  lat = 14.54,
  lng = 74.31
}) => {
  const currentLang = (lang && I18N[lang]) ? lang : "kn";
  const t = I18N[currentLang];
  const [generatedQr, setGeneratedQr] = useState<string>(externalQr || "");
  const activeQr = externalQr || generatedQr;

  useEffect(() => {
    if (externalQr) {
      setGeneratedQr(externalQr);
      return;
    }

    try {
      const nakIdx = typeof profile.moonNakshatraIndex === "number" ? profile.moonNakshatraIndex : 0;
      const rashiIdx = typeof profile.moonRashiIndex === "number" ? profile.moonRashiIndex : 0;

      const rhythmDays = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const ymd = d.toISOString().slice(0, 10);
        return calculateDeterministicRhythmDay(ymd, nakIdx, rashiIdx);
      });

      const qrPayload = generateQrPayloadByTarget("google", {
        days: rhythmDays,
        lang: currentLang,
        panditName: panditName || "Shreeram Pandit",
        priestPhone: priestPhone || "9972339362",
        overrideCalendarPhone: true,
        notificationTime: "07:00",
        personName: profile.name,
        pincode: pincode || "581326",
        lat: typeof lat === "number" && !isNaN(lat) ? lat : 14.54,
        lng: typeof lng === "number" && !isNaN(lng) ? lng : 74.31,
        locationName: placeLabel || "Gokarna",
        dob: profile.birthDate,
        tob: profile.birthTime,
        birthNakshatraIndex: nakIdx,
        birthRashiIndex: rashiIdx
      });

      QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: "L",
        margin: 2,
        width: 320,
        color: {
          dark: "#78350F", // Royal deep gold/amber
          light: "#FFFFFF"
        }
      })
        .then((url) => setGeneratedQr(url))
        .catch((err) => {
          console.warn("[Kundli30DayQrCard] QR generation fallback:", err);
          const fallback = `${getSafeProductionOrigin()}/daily?action=ics&lang=${currentLang}&priestPhone=${encodeURIComponent(priestPhone || "9972339362")}`;
          QRCode.toDataURL(fallback, { errorCorrectionLevel: "L", margin: 2, width: 320 }).then(setGeneratedQr);
        });
    } catch (e) {
      console.error("[Kundli30DayQrCard] QR build error:", e);
      const fallback = `${getSafeProductionOrigin()}/daily?action=ics&lang=${currentLang}&priestPhone=${encodeURIComponent(priestPhone || "9972339362")}`;
      QRCode.toDataURL(fallback, { errorCorrectionLevel: "L", margin: 2, width: 320 }).then(setGeneratedQr).catch(() => {});
    }
  }, [externalQr, currentLang, profile, panditName, priestPhone, pincode, placeLabel, lat, lng]);

  const getFontFamily = (langCode: string): string => {
    switch (langCode) {
      case "kn":
        return `'Tiro Kannada', 'Noto Serif Kannada', 'Noto Sans Kannada', serif, sans-serif`;
      case "te":
        return `'Noto Sans Telugu', serif, sans-serif`;
      case "ta":
        return `'Noto Sans Tamil', serif, sans-serif`;
      case "hi":
        return `'Noto Sans Devanagari', serif, sans-serif`;
      case "en":
      default:
        return `'Outfit', 'Cinzel', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    }
  };
  const activeFontFamily = getFontFamily(currentLang);

  return (
    <div
      id="kundli-30day-qr-card"
      className="pdf-page"
      style={{
        width: "900px",
        height: "1273px",
        minHeight: "1273px",
        maxHeight: "1273px",
        padding: "16px 20px",
        boxSizing: "border-box",
        backgroundColor: "#fffdfa",
        color: "#0f172a",
        fontFamily: activeFontFamily,
        letterSpacing: "normal",
        position: "relative",
        overflow: "hidden",
        display: "block"
      }}
    >
      {/* Outer Royal Gold Dual Frame */}
      <div
        style={{
          border: "3px double #92400E",
          outline: "1.5px solid #D97706",
          outlineOffset: "-5px",
          borderRadius: "14px",
          padding: "14px 18px",
          height: "1241px",
          maxHeight: "1241px",
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          gap: "9px",
          overflow: "hidden",
          boxShadow: "inset 0 0 30px rgba(180, 83, 9, 0.03)"
        }}
      >
        {/* Top Header & Temple Emblem */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #b45309", paddingBottom: "8px" }}>
          <div style={{ fontSize: "17px", color: "#b45309", letterSpacing: "1.5px", fontWeight: "bold" }}>
            🕉️ {t.templeBanner}
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#78350f", marginTop: "4px" }}>
            {t.cardTitle}
          </div>
          <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "3px", maxWidth: "700px", margin: "3px auto 0", lineHeight: 1.35 }}>
            {t.cardSubtitle}
          </div>
        </div>

        {/* Section 1: Devotee Janma Kundali Summary Card */}
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1.5px solid #fde68a",
            borderRadius: "10px",
            padding: "10px 14px"
          }}
        >
          <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#92400e", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>👤</span>
            <span>{t.devoteeTitle}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", fontSize: "12px" }}>
            <div>
              <span style={{ color: "#78350f", fontWeight: 700 }}>{t.nameLabel} </span>
              <span style={{ fontWeight: 800, color: "#0f172a" }}>{profile.name}</span>
            </div>
            <div>
              <span style={{ color: "#78350f", fontWeight: 700 }}>{t.birthDetailsLabel} </span>
              <span style={{ color: "#0f172a" }}>{profile.birthDate} | {profile.birthTime} ({placeLabel || pincode || "Gokarna"})</span>
            </div>
            <div>
              <span style={{ color: "#78350f", fontWeight: 700 }}>{t.lagnaLabel} </span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{profile.lagnaSign} {profile.lagnaSanskrit ? `(${profile.lagnaSanskrit})` : ""}</span>
            </div>
            <div>
              <span style={{ color: "#78350f", fontWeight: 700 }}>{t.rashiLabel} </span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{profile.moonSign} {profile.moonSanskrit ? `(${profile.moonSanskrit})` : ""}</span>
            </div>
            <div>
              <span style={{ color: "#78350f", fontWeight: 700 }}>{t.nakshatraLabel} </span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{profile.moonNakshatra} {profile.moonPada ? `(${profile.moonPada})` : ""}</span>
            </div>
            <div>
              <span style={{ color: "#78350f", fontWeight: 700 }}>{t.dashaLabel} </span>
              <span style={{ fontWeight: 800, color: "#b45309" }}>{profile.currentMahadasha || "—"} {profile.currentBhukti ? `- ${profile.currentBhukti}` : ""}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Features Grid */}
        <div
          style={{
            backgroundColor: "#fefce8",
            border: "1.5px solid #fef08a",
            borderRadius: "10px",
            padding: "8px 14px"
          }}
        >
          <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#854d0e", marginBottom: "6px" }}>
            ✨ {t.featuresTitle}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 14px", fontSize: "11px", color: "#713f12" }}>
            <div style={{ backgroundColor: "#ffffff", padding: "5px 8px", borderRadius: "6px", border: "1px solid #fde047" }}>
              {t.feat1}
            </div>
            <div style={{ backgroundColor: "#ffffff", padding: "5px 8px", borderRadius: "6px", border: "1px solid #fde047" }}>
              {t.feat2}
            </div>
            <div style={{ backgroundColor: "#ffffff", padding: "5px 8px", borderRadius: "6px", border: "1px solid #fde047" }}>
              {t.feat3}
            </div>
            <div style={{ backgroundColor: "#ffffff", padding: "5px 8px", borderRadius: "6px", border: "1px solid #fde047" }}>
              {t.feat4}
            </div>
          </div>
        </div>

        {/* Section 3: Large Scannable QR Code and Scan Steps */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            backgroundColor: "#fdf8ee",
            border: "1.5px dashed #b45309",
            borderRadius: "12px",
            padding: "12px 18px"
          }}
        >
          {/* QR Image Box */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "8px",
                borderRadius: "10px",
                border: "2px solid #b45309",
                display: "block",
                margin: "0 auto",
                width: "fit-content"
              }}
            >
              {activeQr ? (
                <img
                  src={activeQr}
                  alt="30-Day Baggona Panchanga Google Calendar QR"
                  style={{ width: "180px", height: "180px", display: "block" }}
                />
              ) : (
                <div style={{ width: "180px", height: "180px", display: "flex", alignItems: "center", justifyContent: "center", color: "#b45309", fontSize: "12px" }}>
                  Generating QR...
                </div>
              )}
            </div>
            <div style={{ marginTop: "6px", fontSize: "10px", fontWeight: 700, color: "#78350f", letterSpacing: "0.5px" }}>
              ✦ 100% SCANNABLE GOOGLE CALENDAR QR ✦
            </div>
          </div>

          {/* Simple Steps Box */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "8px" }}>
              📱 {t.scanInstructionsTitle}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11.5px", color: "#1e293b", lineHeight: 1.45 }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                <span>📷</span>
                <span>{t.step1}</span>
              </div>
              <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                <span>🔍</span>
                <span>{t.step2}</span>
              </div>
              <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                <span>📅</span>
                <span>{t.step3}</span>
              </div>
              <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                <span>🔔</span>
                <span style={{ fontWeight: 700, color: "#047857" }}>{t.step4}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Sacred Observance Guidelines Card */}
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1.5px solid #86efac",
            borderRadius: "10px",
            padding: "9px 14px"
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#166534", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🌿</span>
            <span>{t.guidelinesTitle}</span>
          </div>
          <div style={{ fontSize: "11.5px", color: "#14532d", lineHeight: 1.45 }}>
            {t.guidelinesDesc}
          </div>
        </div>

        {/* Section 5: Official Purohita (Priest) Details Card with Circular Temple Seal */}
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1.5px solid #b45309",
            borderRadius: "12px",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px"
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>
              {t.priestHeader}
            </div>
            <div style={{ fontSize: "17px", fontWeight: 900, color: "#78350f" }}>
              {panditName || t.priestName}
            </div>
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px", fontWeight: 600 }}>
              {t.priestRole} · {t.templeAddress}
            </div>

            {/* Contact Highlight Pill */}
            <div
              style={{
                marginTop: "6px",
                display: "flex",
                width: "fit-content",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#ffffff",
                border: "1.5px solid #b45309",
                borderRadius: "20px",
                padding: "4px 16px",
                boxShadow: "0 2px 6px rgba(180, 83, 9, 0.1)"
              }}
            >
              <span style={{ fontSize: "14px" }}>📞</span>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#78350f" }}>{t.priestPhoneLabel}</span>
              <span style={{ fontSize: "14px", fontWeight: 900, color: "#047857", letterSpacing: "0.5px" }}>
                +91 {priestPhone}
              </span>
            </div>

            <div style={{ marginTop: "6px", fontSize: "10.5px", color: "#334155", fontStyle: "italic", lineHeight: 1.35 }}>
              "{t.priestBlessing}"
            </div>
          </div>

          {/* Right: Circular Temple Seal */}
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              border: "2.5px double #b45309",
              backgroundColor: "#fffdf7",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(180, 83, 9, 0.12)",
              padding: "4px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "16px" }}>🕉️</div>
            <div style={{ fontSize: "8.5px", fontWeight: 800, color: "#92400e", lineHeight: 1.2, marginTop: "2px" }}>
              {t.templeSealTitle || "॥ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥"}
            </div>
            <div style={{ fontSize: "7.5px", fontWeight: 700, color: "#b45309", marginTop: "1px" }}>
              {t.templeSealLabel}
            </div>
          </div>
        </div>

        {/* Footer Pinned with marginTop: "auto" */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "6px",
            borderTop: "1.5px solid #fde68a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "10.5px",
            color: "#78350f"
          }}
        >
          <div style={{ fontWeight: 700 }}>{t.pageFooterBanner}</div>
          <div>Baggona Panchanga Astrology · Printed & Blessed on {new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
};

export default Kundli30DayQrCard;
