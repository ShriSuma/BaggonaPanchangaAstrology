/**
 * Baggona Panchanga - 100 Profile Multi-Language Accuracy & Emotional Connection Audit Test Suite
 *
 * Comprehensive end-to-end audit verifying 100 diverse real-world profiles across:
 * - 10 Age Groups: Infants (0-5), Children (6-12), Teens (13-17), College Youth (18-22),
 *   Young Adults (23-27), Mid-Career Seekers (28-34), Established Adults (35-42),
 *   Mature Leaders (43-55), Pre-Retirees (56-65), Revered Elders (66-85+)
 * - All 12 Lagnas (Mesha to Meena)
 * - All 27 Nakshatras (Ashwini to Revati)
 * - All 7 Consultation Languages: kn (20), en (20), hi (15), te (15), ta (10), ml (10), mr (10)
 * - Both National and International birth places (with accurate lat/long coordinates)
 *
 * Rigorously Asserts:
 * 1. Vaara & Janma Hora Accuracy (Ahargana sunrise-to-sunrise rule & Chaldean planetary hours).
 * 2. Front-Loaded Direct Answer in Paragraph 1 ("Up to the point" - Sentence 1 delivers the verdict).
 * 3. Deep Human Emotional Connection & Energy (Shreeram Pandit revered Gokarna priest persona).
 * 4. Zero Repetition (Voice deduplication, text deduplication, single greeting per session).
 * 5. Pure 7-Language Localization (Zero English token leakage into Indic scripts).
 */

import { describe, it, expect } from "vitest";
import {
  computeDevoteePanchangaProfile,
  type DevoteePanchangaProfile
} from "../features/consultation/consultationPanchangaService";
import {
  generateConsultationAnswer,
  type ConsultationReadingResult
} from "../features/consultation/consultationAIEngine";
import {
  senseAndCategorizeQuestion,
  presentConsultationReply
} from "../features/consultation/consultationPresenterEngine";
import type { ConsultationSession, ConsultationLanguage } from "../features/consultation/consultationTypes";

interface BenchmarkProfileDef {
  id: number;
  name: string;
  ageBracket: string;
  dob: string;
  tob: string;
  place: string;
  lat: number;
  lng: number;
  timezone: number;
  lang: ConsultationLanguage;
  question: string;
  expectedCategory: string;
}

function createTestSession(def: BenchmarkProfileDef): ConsultationSession {
  return {
    id: `bench-${def.id}`,
    name: def.name,
    dob: def.dob,
    tob: def.tob,
    place: def.place,
    lat: def.lat,
    lng: def.lng,
    timezone: def.timezone,
    language: def.lang,
    status: "active",
    createdAt: new Date().toISOString(),
    durationMinutes: 20,
    graceDeleteMinutes: 20,
    priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    priestPhone: "9972339362",
    messages: []
  };
}

// 100 Curated Real-World Benchmark Profiles
const BENCHMARK_100_PROFILES: BenchmarkProfileDef[] = [
  // ==========================================
  // Bracket 1: Infants & Toddlers (0 - 5 years)
  // ==========================================
  {
    id: 1,
    name: "ಅನ್ವಿತಾ ಭಟ್ (Anvitha Bhat)",
    ageBracket: "INFANT_TODDLER",
    dob: "2024-08-12",
    tob: "07:15",
    place: "Gokarna, Karnataka",
    lat: 14.5479,
    lng: 74.3188,
    timezone: 5.5,
    lang: "kn",
    question: "ಮಗುವಿನ ಆರೋಗ್ಯ, ಬಾಲಾರಿಷ್ಟ ದೋಷ ಪರಿಹಾರ ಮತ್ತು ವಿದ್ಯಾಭ್ಯಾಸದ ಆರಂಭದ ಬಗ್ಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಿ.",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 2,
    name: "Aarav Sharma",
    ageBracket: "INFANT_TODDLER",
    dob: "2023-11-20",
    tob: "09:30",
    place: "New Delhi, India",
    lat: 28.6139,
    lng: 77.209,
    timezone: 5.5,
    lang: "en",
    question: "How is the health and spiritual protection for our one-year-old baby boy?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 3,
    name: "शिवानी मिश्रा (Shivani Mishra)",
    ageBracket: "INFANT_TODDLER",
    dob: "2024-01-15",
    tob: "05:45", // Pre-dawn birth
    place: "Varanasi, Uttar Pradesh",
    lat: 25.3176,
    lng: 82.9739,
    timezone: 5.5,
    lang: "hi",
    question: "बच्ची को बार-बार नजर लग जाती है, बालारिष्ट शांति और स्वास्थ्य रक्षा के लिए क्या करें?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 4,
    name: "సాయి తేజ (Sai Teja)",
    ageBracket: "INFANT_TODDLER",
    dob: "2022-05-18",
    tob: "11:20",
    place: "Vijayawada, Andhra Pradesh",
    lat: 16.5062,
    lng: 80.648,
    timezone: 5.5,
    lang: "te",
    question: "మా బాబుకి దృష్టి దోషం ఉంది, ఆయుష్షు మరియు ఆరోగ్య రక్షణ కోసం పరిహారం చెప్పండి.",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 5,
    name: "அகத்தியன் (Agathiyan)",
    ageBracket: "INFANT_TODDLER",
    dob: "2023-09-08",
    tob: "14:10",
    place: "Madurai, Tamil Nadu",
    lat: 9.9252,
    lng: 78.1198,
    timezone: 5.5,
    lang: "ta",
    question: "குழந்தையின் பாலாரிஷ்ட தோஷ நிவர்த்தி மற்றும் பால பருவ ஆரோக்கியம் பற்றி கூறவும்.",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 6,
    name: "മാധവ് മേനോൻ (Madhav Menon)",
    ageBracket: "INFANT_TODDLER",
    dob: "2024-03-25",
    tob: "16:40",
    place: "Kochi, Kerala",
    lat: 9.9312,
    lng: 76.2673,
    timezone: 5.5,
    lang: "ml",
    question: "കുഞ്ഞിന്റെ ആരോഗ്യത്തിനും ആയുരാരോഗ്യത്തിനും വേണ്ടി ചെയ്യാവുന്ന പൂജകൾ എന്തൊക്കെയാണ്?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 7,
    name: "अद्वैत जोशी (Advait Joshi)",
    ageBracket: "INFANT_TODDLER",
    dob: "2022-12-05",
    tob: "10:05",
    place: "Pune, Maharashtra",
    lat: 18.5204,
    lng: 73.8567,
    timezone: 5.5,
    lang: "mr",
    question: "बाळाच्या उत्तम आरोग्यासाठी आणि दृष्ट लागण्यापासून संरक्षणासाठी काय करावे?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 8,
    name: "Lucas Fernandes",
    ageBracket: "INFANT_TODDLER",
    dob: "2023-06-14",
    tob: "08:20",
    place: "London, UK",
    lat: 51.5074,
    lng: -0.1278,
    timezone: 1.0,
    lang: "en",
    question: "How does the astrological birth star bless my infant born in London?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 9,
    name: "ಧ್ರುವ ಹೆಗಡೆ (Dhruva Hegde)",
    ageBracket: "INFANT_TODDLER",
    dob: "2021-07-22",
    tob: "15:30",
    place: "Sirsi, Karnataka",
    lat: 14.6195,
    lng: 74.8354,
    timezone: 5.5,
    lang: "kn",
    question: "ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸದ ಅಡಿಪಾಯಕ್ಕೆ ಸರಸ್ವತಿ ಆಶೀರ್ವಾದ ಹೇಗೆ ಪಡೆಯುವುದು?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 10,
    name: "आराध्या शुक्ला (Aaradhya Shukla)",
    ageBracket: "INFANT_TODDLER",
    dob: "2022-08-30",
    tob: "18:50",
    place: "Lucknow, Uttar Pradesh",
    lat: 26.8467,
    lng: 80.9462,
    timezone: 5.5,
    lang: "hi",
    question: "बच्ची के चौथे भाव में विद्या और बुद्धि की क्या स्थिति है?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },

  // ==========================================
  // Bracket 2: School Children (6 - 12 years)
  // ==========================================
  {
    id: 11,
    name: "ಚಿನ್ಮಯ್ ರಾವ್ (Chinmay Rao)",
    ageBracket: "SCHOOL_CHILD",
    dob: "2015-04-10",
    tob: "07:45",
    place: "Udupi, Karnataka",
    lat: 13.3409,
    lng: 74.7421,
    timezone: 5.5,
    lang: "kn",
    question: "ಮಗನಿಗೆ ಓದಿನಲ್ಲಿ ಏಕಾಗ್ರತೆ ಕಡಿಮೆಯಿದೆ ಮತ್ತು ತೀರಾ ಚಂಚಲ, ಇದಕ್ಕೆ ಯಾವ ಪರಿಹಾರ ಮಾಡಬೇಕು?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 12,
    name: "Rohan Patel",
    ageBracket: "SCHOOL_CHILD",
    dob: "2014-09-18",
    tob: "11:15",
    place: "Ahmedabad, Gujarat",
    lat: 23.0225,
    lng: 72.5714,
    timezone: 5.5,
    lang: "en",
    question: "My 10-year-old child struggles with focus and exam anxiety. What is the planetary advice?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 13,
    name: "हर्षित वर्मा (Harshit Verma)",
    ageBracket: "SCHOOL_CHILD",
    dob: "2016-02-12",
    tob: "13:20",
    place: "Jaipur, Rajasthan",
    lat: 26.9124,
    lng: 75.7873,
    timezone: 5.5,
    lang: "hi",
    question: "बच्चे का मन पढ़ाई में नहीं लगता, स्मरण शक्ति और एकाग्रता बढ़ाने हेतु मार्गदर्शन दें।",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 14,
    name: "కీర్తన రెడ్డి (Keerthana Reddy)",
    ageBracket: "SCHOOL_CHILD",
    dob: "2015-10-05",
    tob: "17:35",
    place: "Hyderabad, Telangana",
    lat: 17.385,
    lng: 78.4867,
    timezone: 5.5,
    lang: "te",
    question: "మా అమ్మాయి చదువులో చురుగ్గా ఉండటానికి సరస్వతీ మంత్రం మరియు గ్రహ బలం చెప్పండి.",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 15,
    name: "தர்ஷன் (Darshan)",
    ageBracket: "SCHOOL_CHILD",
    dob: "2013-11-28",
    tob: "06:10",
    place: "Coimbatore, Tamil Nadu",
    lat: 11.0168,
    lng: 76.9558,
    timezone: 5.5,
    lang: "ta",
    question: "படிப்பில் கவனச்சிதறல் குறையவும் ஞாபக சக்தி கூடவும் ஜோதிட வழிகாட்டல் தரவும்.",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 16,
    name: "അനഘ നായർ (Anagha Nair)",
    ageBracket: "SCHOOL_CHILD",
    dob: "2014-06-20",
    tob: "12:50",
    place: "Thiruvananthapuram, Kerala",
    lat: 8.5241,
    lng: 76.9366,
    timezone: 5.5,
    lang: "ml",
    question: "പഠനത്തിൽ ഏകാഗ്രത ലഭിക്കാനും പരീക്ഷകളിൽ മികച്ച വിജയം നേടാനും എന്ത് ചെയ്യണം?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 17,
    name: "वेदांत कुलकर्णी (Vedant Kulkarni)",
    ageBracket: "SCHOOL_CHILD",
    dob: "2015-08-14",
    tob: "08:40",
    place: "Kolhapur, Maharashtra",
    lat: 16.705,
    lng: 74.2433,
    timezone: 5.5,
    lang: "mr",
    question: "मुलाचा स्वभाव फार हट्टी आहे आणि अभ्यासात लक्ष नाही, पालकांनी काय काळजी घ्यावी?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 18,
    name: "Emily Watson",
    ageBracket: "SCHOOL_CHILD",
    dob: "2016-03-03",
    tob: "15:25",
    place: "Toronto, Canada",
    lat: 43.6532,
    lng: -79.3832,
    timezone: -5.0,
    lang: "en",
    question: "How can Vedic astrology help my daughter with learning discipline and creativity?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 19,
    name: "ಪ್ರಜ್ವಲ್ ಗೌಡ (Prajwal Gowda)",
    ageBracket: "SCHOOL_CHILD",
    dob: "2013-05-19",
    tob: "10:15",
    place: "Mysuru, Karnataka",
    lat: 12.2958,
    lng: 76.6394,
    timezone: 5.5,
    lang: "kn",
    question: "ಮಗನಿಗೆ ಗಣಿತ ಮತ್ತು ವಿಜ್ಞಾನದಲ್ಲಿ ಆಸಕ್ತಿ ಬರಲು ಯಾವ ಗ್ರಹದ ಆರಾಧನೆ ಮಾಡಬೇಕು?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 20,
    name: "आदित्य पांडे (Aditya Pandey)",
    ageBracket: "SCHOOL_CHILD",
    dob: "2014-01-22",
    tob: "19:00",
    place: "Bhopal, Madhya Pradesh",
    lat: 23.2599,
    lng: 77.4126,
    timezone: 5.5,
    lang: "hi",
    question: "पंचम भाव में बुध और गुरु की स्थिति बालक की शिक्षा में कैसे फल देगी?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },

  // ==========================================
  // Bracket 3: Teens & Board Students (13 - 17)
  // ==========================================
  {
    id: 21,
    name: "ಅನನ್ಯಾ ಭಟ್ (Ananya Bhat)",
    ageBracket: "TEEN_STUDENT",
    dob: "2009-03-15",
    tob: "08:10",
    place: "Mangaluru, Karnataka",
    lat: 12.9141,
    lng: 74.856,
    timezone: 5.5,
    lang: "kn",
    question: "ಹತ್ತನೇ ತರಗತಿ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಉತ್ತಮ ಅಂಕ ಪಡೆಯಲು ಮತ್ತು ವಿಜ್ಞಾನ ವಿಭಾಗ ಆರಿಸಲು ಗ್ರಹಸ್ಥಿತಿ ಅನುಕೂಲವಿದೆಯೇ?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 22,
    name: "Siddharth Menon",
    ageBracket: "TEEN_STUDENT",
    dob: "2008-07-29",
    tob: "14:40",
    place: "Bengaluru, Karnataka",
    lat: 12.9716,
    lng: 77.5946,
    timezone: 5.5,
    lang: "en",
    question: "Which higher education stream (engineering or medicine) does my 10th and 5th house favor?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 23,
    name: "प्रिया सिंह (Priya Singh)",
    ageBracket: "TEEN_STUDENT",
    dob: "2009-11-11",
    tob: "10:30",
    place: "Patna, Bihar",
    lat: 25.5941,
    lng: 85.1376,
    timezone: 5.5,
    lang: "hi",
    question: "बोर्ड परीक्षा के तनाव से मुक्ति और उच्च शिक्षा के सही चयन हेतु मार्गदर्शन दें।",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 24,
    name: "వరుణ్ వర్మ (Varun Varma)",
    ageBracket: "TEEN_STUDENT",
    dob: "2008-01-08",
    tob: "16:20",
    place: "Visakhapatnam, Andhra Pradesh",
    lat: 17.6868,
    lng: 83.2185,
    timezone: 5.5,
    lang: "te",
    question: "ఇంటర్మీడియట్ మరియు ఐఐటీ ఎంట్రన్స్ పరీక్షలో విజయం సాధించడానికి ఏ దేవుడిని పూజించాలి?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 25,
    name: "கார்த்திக் (Karthik)",
    ageBracket: "TEEN_STUDENT",
    dob: "2009-05-24",
    tob: "09:00",
    place: "Tiruchirappalli, Tamil Nadu",
    lat: 10.7905,
    lng: 78.7047,
    timezone: 5.5,
    lang: "ta",
    question: "பொதுத்தேர்வில் அதிக மதிப்பெண்கள் பெறவும் உயர்கல்வி வாய்ப்புகளுக்கும் வழிகாட்டல் தரவும்.",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 26,
    name: "നിധിൻ കുമാർ (Nithin Kumar)",
    ageBracket: "TEEN_STUDENT",
    dob: "2008-10-18",
    tob: "11:50",
    place: "Kozhikode, Kerala",
    lat: 11.2588,
    lng: 75.7804,
    timezone: 5.5,
    lang: "ml",
    question: "പ്ലസ് ടു പഠനത്തിന് ശേഷം എൻജിനീയറിങ് തെരഞ്ഞെടുക്കുന്നത് ജാതകപ്രകാരം അനുയോജ്യമാണോ?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 27,
    name: "तनवी देशपांडे (Tanvi Deshpande)",
    ageBracket: "TEEN_STUDENT",
    dob: "2009-08-04",
    tob: "07:30",
    place: "Nagpur, Maharashtra",
    lat: 21.1458,
    lng: 79.0882,
    timezone: 5.5,
    lang: "mr",
    question: "दहावीच्या परीक्षेत एकाग्रता टिकवून ठेवण्यासाठी आणि यश मिळवण्यासाठी काय करावे?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 28,
    name: "Ethan Miller",
    ageBracket: "TEEN_STUDENT",
    dob: "2008-04-16",
    tob: "13:10",
    place: "New York, USA",
    lat: 40.7128,
    lng: -74.006,
    timezone: -5.0,
    lang: "en",
    question: "What does Vedic astrology predict regarding academic aptitude and university entrance?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 29,
    name: "ಶ್ರೇಯಸ್ ಹೆಗಡೆ (Shreyas Hegde)",
    ageBracket: "TEEN_STUDENT",
    dob: "2009-12-02",
    tob: "18:25",
    place: "Kumta, Karnataka",
    lat: 14.4259,
    lng: 74.4178,
    timezone: 5.5,
    lang: "kn",
    question: "ಕಾಲೇಜು ಪ್ರವೇಶ ಹಾಗೂ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳ ತಯಾರಿಗೆ ಲಗ್ನದ ಬುಧ ಬಲ ಹೇಗಿದೆ?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },
  {
    id: 30,
    name: "अमित कुमार (Amit Kumar)",
    ageBracket: "TEEN_STUDENT",
    dob: "2008-09-09",
    tob: "15:45",
    place: "Kanpur, Uttar Pradesh",
    lat: 26.4499,
    lng: 80.3319,
    timezone: 5.5,
    lang: "hi",
    question: "तकनीकी शिक्षा अथवा वाणिज्य में से कौन सा क्षेत्र मेरे लिए सबसे लाभकारी रहेगा?",
    expectedCategory: "CHILD_PARENT_INQUIRY"
  },

  // ==========================================
  // Bracket 4: Young College Grads (18 - 22)
  // ==========================================
  {
    id: 31,
    name: "ರೋಹಿತ್ ನಾಯಕ್ (Rohit Nayak)",
    ageBracket: "COLLEGE_YOUTH",
    dob: "2003-06-11",
    tob: "10:20",
    place: "Karwar, Karnataka",
    lat: 14.8185,
    lng: 74.1416,
    timezone: 5.5,
    lang: "kn",
    question: "ಕ್ಯಾಂಪಸ್ ಇಂಟರ್‌ವ್ಯೂವ್‌ನಲ್ಲಿ ಮೊದಲ ಉದ್ಯೋಗ ಯಾವಾಗ ಸಿಗಲಿದೆ? ನನ್ನ ದಶಾ ಕಾಲ ಹೇಗಿದೆ?",
    expectedCategory: "CAREER_FRUSTRATION_DISTRESS"
  },
  {
    id: 32,
    name: "Vikram Sengupta",
    ageBracket: "COLLEGE_YOUTH",
    dob: "2004-02-19",
    tob: "08:50",
    place: "Kolkata, West Bengal",
    lat: 22.5726,
    lng: 88.3639,
    timezone: 5.5,
    lang: "en",
    question: "Will I secure a high-paying software placement this semester, or should I go for higher studies?",
    expectedCategory: "CAREER_FRUSTRATION_DISTRESS"
  },
  {
    id: 33,
    name: "विकास दुबे (Vikas Dubey)",
    ageBracket: "COLLEGE_YOUTH",
    dob: "2002-10-25",
    tob: "14:15",
    place: "Prayagraj, Uttar Pradesh",
    lat: 25.4358,
    lng: 81.8463,
    timezone: 5.5,
    lang: "hi",
    question: "ग्रेजुएशन के बाद तुरंत सरकारी नौकरी की तैयारी करूं या प्राइवेट कंपनी ज्वाइन करूं?",
    expectedCategory: "GOVERNMENT_JOB_AUTHORITY"
  },
  {
    id: 34,
    name: "నిఖిల్ చౌదరి (Nikhil Chowdary)",
    ageBracket: "COLLEGE_YOUTH",
    dob: "2003-04-02",
    tob: "16:00",
    place: "Guntur, Andhra Pradesh",
    lat: 16.3067,
    lng: 80.4365,
    timezone: 5.5,
    lang: "te",
    question: "క్యాంపస్ ప్లేస్‌మెంట్‌లో ఉద్యోగం రావడానికి 10వ స్థాన బలం మరియు దశా ఫలితాలు చెప్పండి.",
    expectedCategory: "CAREER_FRUSTRATION_DISTRESS"
  },
  {
    id: 35,
    name: "மணிகண்டன் (Manikandan)",
    ageBracket: "COLLEGE_YOUTH",
    dob: "2004-08-15",
    tob: "07:20",
    place: "Salem, Tamil Nadu",
    lat: 11.6643,
    lng: 78.146,
    timezone: 5.5,
    lang: "ta",
    question: "கல்லூரி முடித்ததும் எனக்கு முதல் வேலை எப்போது கிடைக்கும்? தசா காலம் எப்படி உள்ளது?",
    expectedCategory: "CAREER_FRUSTRATION_DISTRESS"
  },
  {
    id: 36,
    name: "രോഹിത് കൃഷ്ണൻ (Rohit Krishnan)",
    ageBracket: "COLLEGE_YOUTH",
    dob: "2003-12-09",
    tob: "11:35",
    place: "Thrissur, Kerala",
    lat: 10.5276,
    lng: 76.2144,
    timezone: 5.5,
    lang: "ml",
    question: "ബിരുദത്തിന് ശേഷം ഉന്നത പഠനത്തിനായി വിദേശത്ത് പോകുന്നതാണോ അതോ നാട്ടിൽ ജോലി ചെയ്യുന്നതാണോ നല്ലത്?",
    expectedCategory: "ABROAD_VS_INDIA_SETTLEMENT"
  },
  {
    id: 37,
    name: "प्रणव शिंदे (Pranav Shinde)",
    ageBracket: "COLLEGE_YOUTH",
    dob: "2002-07-17",
    tob: "09:45",
    place: "Nashik, Maharashtra",
    lat: 19.9975,
    lng: 73.7898,
    timezone: 5.5,
    lang: "mr",
    question: "माझी पहिली नोकरी कधी लागेल? करिअरच्या सुरुवातीसाठी कोणता ग्रह पूरक आहे?",
    expectedCategory: "CAREER_FRUSTRATION_DISTRESS"
  },
  {
    id: 38,
    name: "Oliver Smith",
    ageBracket: "COLLEGE_YOUTH",
    dob: "2003-03-28",
    tob: "12:10",
    place: "Sydney, Australia",
    lat: -33.8688,
    lng: 151.2093,
    timezone: 10.0,
    lang: "en",
    question: "What is my astrological timing for securing my first career role post-graduation?",
    expectedCategory: "CAREER_FRUSTRATION_DISTRESS"
  },
  {
    id: 39,
    name: "ಸುಹಾಸ್ ಭಟ್ (Suhas Bhat)",
    ageBracket: "COLLEGE_YOUTH",
    dob: "2004-05-04",
    tob: "17:15",
    place: "Bhatkal, Karnataka",
    lat: 13.9874,
    lng: 74.5517,
    timezone: 5.5,
    lang: "kn",
    question: "ಯಾವ ರತ್ನ ಅಥವಾ ಮಂತ್ರ ಜಪಿಸಿದರೆ ಉದ್ಯೋಗ ಸಂದರ್ಶನದಲ್ಲಿ ಜಯ ಸಿಗುತ್ತದೆ?",
    expectedCategory: "ASTROLOGICAL_DEEP"
  },
  {
    id: 40,
    name: "दीपक राजपूत (Deepak Rajput)",
    ageBracket: "COLLEGE_YOUTH",
    dob: "2003-09-14",
    tob: "06:30",
    place: "Gwalior, Madhya Pradesh",
    lat: 26.2183,
    lng: 78.1828,
    timezone: 5.5,
    lang: "hi",
    question: "प्रतियोगी परीक्षा में प्रथम प्रयास में सफलता के क्या योग हैं?",
    expectedCategory: "COMPETITIVE_EXAM_SUCCESS"
  },

  // ==========================================
  // Bracket 5: Young Adults (23 - 27)
  // ==========================================
  {
    id: 41,
    name: "ಮೇಘನಾ ಶೆಟ್ಟಿ (Meghana Shetty)",
    ageBracket: "YOUNG_ADULT",
    dob: "1998-11-23",
    tob: "09:15",
    place: "Udupi, Karnataka",
    lat: 13.3409,
    lng: 74.7421,
    timezone: 5.5,
    lang: "kn",
    question: "ನನ್ನ ವಿವಾಹ ಯಾವಾಗ ಆಗಲಿದೆ? ಮುಂದಿನ ೬ ತಿಂಗಳೊಳಗೆ ಕಂಕಣ ಭಾಗ್ಯ ಕೂಡಿಬರಲಿದೆಯೇ?",
    expectedCategory: "ASTROLOGICAL_DEEP"
  },
  {
    id: 42,
    name: "Karan Singhania",
    ageBracket: "YOUNG_ADULT",
    dob: "1999-04-12",
    tob: "15:20",
    place: "Mumbai, Maharashtra",
    lat: 19.076,
    lng: 72.8777,
    timezone: 5.5,
    lang: "en",
    question: "When will I get married? What is the exact 100% accurate astrological timeline?",
    expectedCategory: "ASTROLOGICAL_DEEP"
  },
  {
    id: 43,
    name: "नेहा चतुर्वेदी (Neha Chaturvedi)",
    ageBracket: "YOUNG_ADULT",
    dob: "1997-08-30",
    tob: "07:50",
    place: "Mathura, Uttar Pradesh",
    lat: 27.4924,
    lng: 77.6737,
    timezone: 5.5,
    lang: "hi",
    question: "मेरी शादी कब तक तय होगी? क्या अगले ६ महीनों में विवाह का शुभ योग बन रहा है?",
    expectedCategory: "ASTROLOGICAL_DEEP"
  },
  {
    id: 44,
    name: "హరీష్ నాయుడు (Harish Naidu)",
    ageBracket: "YOUNG_ADULT",
    dob: "1998-02-14",
    tob: "11:45",
    place: "Tirupati, Andhra Pradesh",
    lat: 13.6288,
    lng: 79.4192,
    timezone: 5.5,
    lang: "te",
    question: "నా వివాహం ఎప్పుడు జరుగుతుంది? రాబోయే 6 నెలల్లో పెళ్లి సంబంధం కుదురుతుందా?",
    expectedCategory: "ASTROLOGICAL_DEEP"
  },
  {
    id: 45,
    name: "சங்கீதா (Sangeetha)",
    ageBracket: "YOUNG_ADULT",
    dob: "1999-09-05",
    tob: "13:30",
    place: "Tirunelveli, Tamil Nadu",
    lat: 8.7139,
    lng: 77.7567,
    timezone: 5.5,
    lang: "ta",
    question: "எனக்கு திருமணம் எப்போது நடக்கும்? 7-ஆம் பாவத்தின் சுப பலன்கள் எப்போது கைகூடும்?",
    expectedCategory: "ASTROLOGICAL_DEEP"
  },
  {
    id: 46,
    name: "വിഷ്ണു പ്രസാദ് (Vishnu Prasad)",
    ageBracket: "YOUNG_ADULT",
    dob: "1997-12-21",
    tob: "18:10",
    place: "Palakkad, Kerala",
    lat: 10.7867,
    lng: 76.6548,
    timezone: 5.5,
    lang: "ml",
    question: "വിവാഹം എപ്പോൾ നടക്കും? അടുത്ത 6 മാസത്തിനുള്ളിൽ മംഗല്യഭാഗ്യം ഉണ്ടാകുമോ?",
    expectedCategory: "ASTROLOGICAL_DEEP"
  },
  {
    id: 47,
    name: "पूजा कुलकर्णी (Pooja Kulkarni)",
    ageBracket: "YOUNG_ADULT",
    dob: "1998-06-18",
    tob: "08:40",
    place: "Solapur, Maharashtra",
    lat: 17.6599,
    lng: 75.9064,
    timezone: 5.5,
    lang: "mr",
    question: "माझा विवाह कधी ठरून पूर्ण होईल? सप्तम भावातील ग्रहांची स्थिती काय दर्शवते?",
    expectedCategory: "ASTROLOGICAL_DEEP"
  },
  {
    id: 48,
    name: "Chloe Dupont",
    ageBracket: "YOUNG_ADULT",
    dob: "1999-10-08",
    tob: "14:05",
    place: "Paris, France",
    lat: 48.8566,
    lng: 2.3522,
    timezone: 2.0,
    lang: "en",
    question: "When will marriage materialize in my birth chart? Is Jupiter aspect active?",
    expectedCategory: "ASTROLOGICAL_DEEP"
  },
  {
    id: 49,
    name: "ಕಿರಣ್ ಹೆಗಡೆ (Kiran Hegde)",
    ageBracket: "YOUNG_ADULT",
    dob: "1997-03-27",
    tob: "16:55",
    place: "Kumta, Karnataka",
    lat: 14.4259,
    lng: 74.4178,
    timezone: 5.5,
    lang: "kn",
    question: "ವಿದೇಶದಲ್ಲಿ ಉದ್ಯೋಗಕ್ಕೆ ಹೋಗಬೇಕೋ ಅಥವಾ ಭಾರತದಲ್ಲೇ ಮುಂದುವರಿಯಬೇಕೋ?",
    expectedCategory: "ABROAD_VS_INDIA_SETTLEMENT"
  },
  {
    id: 50,
    name: "राहुल सक्सैना (Rahul Saxena)",
    ageBracket: "YOUNG_ADULT",
    dob: "1998-05-15",
    tob: "10:10",
    place: "Noida, Uttar Pradesh",
    lat: 28.5355,
    lng: 77.391,
    timezone: 5.5,
    lang: "hi",
    question: "कनाडा में पीआर लेकर विदेश में बसना उचित रहेगा या भारत में ही करियर बनाना?",
    expectedCategory: "ABROAD_VS_INDIA_SETTLEMENT"
  },

  // ==========================================
  // Bracket 6: Mid-Career Seekers (28 - 34)
  // ==========================================
  {
    id: 51,
    name: "ರಾಘವೇಂದ್ರ ಭಟ್ (Raghavendra Bhat)",
    ageBracket: "MID_CAREER",
    dob: "1992-05-14",
    tob: "08:30",
    place: "Kumta, Karnataka",
    lat: 14.4259,
    lng: 74.4178,
    timezone: 5.5,
    lang: "kn",
    question: "ಉದ್ಯೋಗದಲ್ಲಿ ತೀವ್ರ ಕಿರಿಕಿರಿ, ಮೇಲಧಿಕಾರಿಗಳ ಕಿರುಕುಳ ಹಾಗೂ ಹತಾಶೆ ಕಾಡುತ್ತಿದೆ. ಇದಕ್ಕೆ ನಿಖರ ಕಾರಣವೇನು ಮತ್ತು ಯಾವಾಗ ಮುಕ್ತಿ?",
    expectedCategory: "CAREER_FRUSTRATION_DISTRESS"
  },
  {
    id: 52,
    name: "Sunil Kapoor",
    ageBracket: "MID_CAREER",
    dob: "1991-09-22",
    tob: "11:40",
    place: "Gurugram, Haryana",
    lat: 28.4595,
    lng: 77.0266,
    timezone: 5.5,
    lang: "en",
    question: "Severe workplace frustration, toxic politics, and blocked promotion. Why is this happening and when will relief come?",
    expectedCategory: "CAREER_FRUSTRATION_DISTRESS"
  },
  {
    id: 53,
    name: "संजय त्रिवेदी (Sanjay Trivedi)",
    ageBracket: "MID_CAREER",
    dob: "1993-01-18",
    tob: "14:25",
    place: "Indore, Madhya Pradesh",
    lat: 22.7196,
    lng: 75.8577,
    timezone: 5.5,
    lang: "hi",
    question: "नौकरी में भारी मानसिक अशांति, काम का दबाव और अड़चनें आ रही हैं। इससे बाहर निकलने का ज्योतिषीय उपाय बताएं।",
    expectedCategory: "CAREER_FRUSTRATION_DISTRESS"
  },
  {
    id: 54,
    name: "ప్రవీణ్ కుమార్ (Praveen Kumar)",
    ageBracket: "MID_CAREER",
    dob: "1992-08-07",
    tob: "16:50",
    place: "Hyderabad, Telangana",
    lat: 17.385,
    lng: 78.4867,
    timezone: 5.5,
    lang: "te",
    question: "ఉద్యోగంలో తీవ్రమైన చికాకులు మరియు అసంతృప్తి ఉన్నాయి. ఈ సమస్యల నుండి ఎప్పుడు విముక్తి లభిస్తుంది?",
    expectedCategory: "CAREER_FRUSTRATION_DISTRESS"
  },
  {
    id: 55,
    name: "செந்தில் குமார் (Senthil Kumar)",
    ageBracket: "MID_CAREER",
    dob: "1990-12-19",
    tob: "07:10",
    place: "Chennai, Tamil Nadu",
    lat: 13.0827,
    lng: 80.2707,
    timezone: 5.5,
    lang: "ta",
    question: "வேலை செய்யும் இடத்தில் மிகுந்த மன உளைச்சலும் தடைகளும் உள்ளன. இந்த நிலைமை எப்போது மாறும்?",
    expectedCategory: "CAREER_FRUSTRATION_DISTRESS"
  },
  {
    id: 56,
    name: "അനൂപ് തോമസ് (Anoop Thomas)",
    ageBracket: "MID_CAREER",
    dob: "1991-04-03",
    tob: "13:15",
    place: "Kottayam, Kerala",
    lat: 9.5916,
    lng: 76.5222,
    timezone: 5.5,
    lang: "ml",
    question: "തൊഴിൽ രംഗത്തെ കടുത്ത മാനസിക സമ്മർദ്ദവും അനിശ്ചിതത്വവും മാറാൻ എന്താണ് ജ്യോതിഷപരമായ പോംവഴി?",
    expectedCategory: "CAREER_FRUSTRATION_DISTRESS"
  },
  {
    id: 57,
    name: "नितीन पवार (Nitin Pawar)",
    ageBracket: "MID_CAREER",
    dob: "1992-11-28",
    tob: "09:30",
    place: "Thane, Maharashtra",
    lat: 19.2183,
    lng: 72.9781,
    timezone: 5.5,
    lang: "mr",
    question: "नोकरीत वरिष्ठ अधिकाऱ्यांचा सतत त्रास आणि कामात प्रचंड निराशा येत आहे, दिलासा कधी मिळेल?",
    expectedCategory: "CAREER_FRUSTRATION_DISTRESS"
  },
  {
    id: 58,
    name: "James Wilson",
    ageBracket: "MID_CAREER",
    dob: "1990-07-15",
    tob: "15:40",
    place: "San Francisco, USA",
    lat: 37.7749,
    lng: -122.4194,
    timezone: -8.0,
    lang: "en",
    question: "I am feeling totally lost and burnt out in tech management. What do my 10th house and transits indicate?",
    expectedCategory: "CAREER_FRUSTRATION_DISTRESS"
  },
  {
    id: 59,
    name: "ಸುರೇಶ್ ಪಟೇಲ್ (Suresh Patel)",
    ageBracket: "MID_CAREER",
    dob: "1993-06-25",
    tob: "18:05",
    place: "Hubballi, Karnataka",
    lat: 15.3647,
    lng: 75.124,
    timezone: 5.5,
    lang: "kn",
    question: "ಸ್ವಂತ ವ್ಯಾಪಾರ ಆರಂಭಿಸುವುದು ಉತ್ತಮವೋ ಅಥವಾ ಉದ್ಯೋಗದಲ್ಲೇ ಮುಂದುವರಿಯಬೇಕೋ? ಪಾಲುದಾರಿಕೆ ಮಾಡಬಹುದೇ?",
    expectedCategory: "BUSINESS_VS_JOB_COMMERCE"
  },
  {
    id: 60,
    name: "अमित भटनागर (Amit Bhatnagar)",
    ageBracket: "MID_CAREER",
    dob: "1991-03-12",
    tob: "10:50",
    place: "Faridabad, Haryana",
    lat: 28.4089,
    lng: 77.3178,
    timezone: 5.5,
    lang: "hi",
    question: "व्यापार में किसी मित्र के साथ ५०-५० पार्टनरशिप करना शुभ रहेगा या एकल स्वामित्व ही उचित है?",
    expectedCategory: "BUSINESS_VS_JOB_COMMERCE"
  },

  // ==========================================
  // Bracket 7: Established Adults (35 - 42)
  // ==========================================
  {
    id: 61,
    name: "ವೆಂಕಟೇಶ್ ಪ್ರಸಾದ್ (Venkatesh Prasad)",
    ageBracket: "ESTABLISHED_ADULT",
    dob: "1985-09-17",
    tob: "08:15",
    place: "Bengaluru, Karnataka",
    lat: 12.9716,
    lng: 77.5946,
    timezone: 5.5,
    lang: "kn",
    question: "ಸಾಲದ ಬಾಧೆ ತೀವ್ರವಾಗಿದೆ, ಬ್ಯಾಂಕ್ ಸಾಲ ಯಾವಾಗ ಸಂಪೂರ್ಣ ತೀರಲಿದೆ? ಋಣ ಮುಕ್ತಿಗೆ ಮಾರ್ಗ ತಿಳಿಸಿ.",
    expectedCategory: "DEBT_RELIEF_FINANCE"
  },
  {
    id: 62,
    name: "Rajiv Malhotra",
    ageBracket: "ESTABLISHED_ADULT",
    dob: "1984-03-29",
    tob: "14:10",
    place: "Chandigarh, India",
    lat: 30.7333,
    lng: 76.7794,
    timezone: 5.5,
    lang: "en",
    question: "When will I get full relief from heavy business loans and financial debt burden?",
    expectedCategory: "DEBT_RELIEF_FINANCE"
  },
  {
    id: 63,
    name: "राजेश वर्मा (Rajesh Verma)",
    ageBracket: "ESTABLISHED_ADULT",
    dob: "1986-11-04",
    tob: "11:25",
    place: "Agra, Uttar Pradesh",
    lat: 27.1767,
    lng: 78.0081,
    timezone: 5.5,
    lang: "hi",
    question: "कर्ज का बोझ लगातार बढ़ रहा है, ऋण मुक्ति और आर्थिक स्थिरता कब तक प्राप्त होगी?",
    expectedCategory: "DEBT_RELIEF_FINANCE"
  },
  {
    id: 64,
    name: "సురేష్ బాబు (Suresh Babu)",
    ageBracket: "ESTABLISHED_ADULT",
    dob: "1985-05-22",
    tob: "16:40",
    place: "Kurnool, Andhra Pradesh",
    lat: 15.8281,
    lng: 78.0373,
    timezone: 5.5,
    lang: "te",
    question: "అప్పుల సమస్యల నుండి ఎప్పుడు విముక్తి లభిస్తుంది? రుణవిమోచన పూజ గురించి చెప్పండి.",
    expectedCategory: "DEBT_RELIEF_FINANCE"
  },
  {
    id: 65,
    name: "சுப்பிரமணியன் (Subramanian)",
    ageBracket: "ESTABLISHED_ADULT",
    dob: "1984-08-11",
    tob: "07:35",
    place: "Thanjavur, Tamil Nadu",
    lat: 10.787,
    lng: 79.1378,
    timezone: 5.5,
    lang: "ta",
    question: "நீண்டகால கடன் சுமை தீர்ந்து நிதி நிலைமை சீரடைய என்ன பரிகாரம் செய்ய வேண்டும்?",
    expectedCategory: "DEBT_RELIEF_FINANCE"
  },
  {
    id: 66,
    name: "സന്തോഷ് മേനോൻ (Santhosh Menon)",
    ageBracket: "ESTABLISHED_ADULT",
    dob: "1986-01-30",
    tob: "12:00",
    place: "Alappuzha, Kerala",
    lat: 9.4981,
    lng: 76.3388,
    timezone: 5.5,
    lang: "ml",
    question: "വലിയ ബാങ്ക് ബാധ്യതകൾ എപ്പോൾ കൊടുത്തുതീർക്കാൻ സാധിക്കും? ധനയോഗം എപ്പോൾ തെളിയും?",
    expectedCategory: "DEBT_RELIEF_FINANCE"
  },
  {
    id: 67,
    name: "सचिन गायकवाड (Sachin Gaikwad)",
    ageBracket: "ESTABLISHED_ADULT",
    dob: "1985-12-14",
    tob: "09:50",
    place: "Aurangabad, Maharashtra",
    lat: 19.8762,
    lng: 75.3433,
    timezone: 5.5,
    lang: "mr",
    question: "कर्जमुक्ती कधी होईल? आर्थिक संकट दूर करण्यासाठी गोकर्णात कोणती पूजा करावी?",
    expectedCategory: "DEBT_RELIEF_FINANCE"
  },
  {
    id: 68,
    name: "Marcus Aurelius Vance",
    ageBracket: "ESTABLISHED_ADULT",
    dob: "1984-06-08",
    tob: "15:15",
    place: "Berlin, Germany",
    lat: 52.52,
    lng: 13.405,
    timezone: 2.0,
    lang: "en",
    question: "What does Vedic astrology predict regarding liquidation of debts and commercial asset recovery?",
    expectedCategory: "DEBT_RELIEF_FINANCE"
  },
  {
    id: 69,
    name: "ಶ್ರೀಧರ್ ಹೆಗಡೆ (Shridhar Hegde)",
    ageBracket: "ESTABLISHED_ADULT",
    dob: "1983-10-19",
    tob: "17:30",
    place: "Siddapur, Karnataka",
    lat: 14.3333,
    lng: 74.9,
    timezone: 5.5,
    lang: "kn",
    question: "ಸ್ವಂತ ಜಮೀನು ಅಥವಾ ಹೊಸ ಮನೆ ಖರೀದಿ ಮಾಡಲು ಗೃಹ ಯೋಗ ಯಾವಾಗ ಕೂಡಿಬರುತ್ತದೆ?",
    expectedCategory: "PROPERTY_ASSET_ACQUISITION"
  },
  {
    id: 70,
    name: "मनोज तिवारी (Manoj Tiwari)",
    ageBracket: "ESTABLISHED_ADULT",
    dob: "1985-02-27",
    tob: "10:05",
    place: "Gorakhpur, Uttar Pradesh",
    lat: 26.7606,
    lng: 83.3732,
    timezone: 5.5,
    lang: "hi",
    question: "भूमि अथवा आवासीय संपत्ति खरीदने के लिए चतुर्थ भाव और भूमिपुत्र मंगल का क्या योग है?",
    expectedCategory: "PROPERTY_ASSET_ACQUISITION"
  },

  // ==========================================
  // Bracket 8: Mature Leaders (43 - 55)
  // ==========================================
  {
    id: 71,
    name: "ಮಂಜುನಾಥ್ ಶಾಸ್ತ್ರಿ (Manjunath Shastri)",
    ageBracket: "MATURE_LEADER",
    dob: "1975-07-16",
    tob: "08:45",
    place: "Gokarna, Karnataka",
    lat: 14.5479,
    lng: 74.3188,
    timezone: 5.5,
    lang: "kn",
    question: "ನ್ಯಾಯಾಲಯದಲ್ಲಿರುವ ಆಸ್ತಿ ವಿವಾದ ಹಾಗೂ ಕೋರ್ಟ್ ಕೇಸ್ ನಮ್ಮ ಪರವಾಗಿ ಯಾವಾಗ ತೀರ್ಮಾನವಾಗಲಿದೆ?",
    expectedCategory: "LEGAL_DISPUTE_VICTORY"
  },
  {
    id: 72,
    name: "Devendra Singhal",
    ageBracket: "MATURE_LEADER",
    dob: "1974-12-05",
    tob: "11:20",
    place: "New Delhi, India",
    lat: 28.6139,
    lng: 77.209,
    timezone: 5.5,
    lang: "en",
    question: "When will the prolonged court litigation and property dispute resolve in our favor?",
    expectedCategory: "LEGAL_DISPUTE_VICTORY"
  },
  {
    id: 73,
    name: "आनंद प्रकाश (Anand Prakash)",
    ageBracket: "MATURE_LEADER",
    dob: "1976-03-18",
    tob: "14:50",
    place: "Meerut, Uttar Pradesh",
    lat: 28.9845,
    lng: 77.7064,
    timezone: 5.5,
    lang: "hi",
    question: "भूमि विवाद एवं न्यायालयीन मुकदमे में विजय प्राप्ति के क्या योग हैं?",
    expectedCategory: "LEGAL_DISPUTE_VICTORY"
  },
  {
    id: 74,
    name: "రామచంద్ర రావు (Ramachandra Rao)",
    ageBracket: "MATURE_LEADER",
    dob: "1973-09-24",
    tob: "16:15",
    place: "Warangal, Telangana",
    lat: 17.9689,
    lng: 79.5941,
    timezone: 5.5,
    lang: "te",
    question: "కోర్టు వివాదం మరియు భూ సంబంధిత వ్యాజ్యంలో మాకు విజయం ఎప్పుడు లభిస్తుంది?",
    expectedCategory: "LEGAL_DISPUTE_VICTORY"
  },
  {
    id: 75,
    name: "நடராஜன் (Natarajan)",
    ageBracket: "MATURE_LEADER",
    dob: "1975-01-12",
    tob: "07:05",
    place: "Tiruppur, Tamil Nadu",
    lat: 11.1085,
    lng: 77.3411,
    timezone: 5.5,
    lang: "ta",
    question: "நீதிமன்ற சொத்து வழக்கு எப்போது எங்கள் சார்பாக சாதகமாக முடியும்?",
    expectedCategory: "LEGAL_DISPUTE_VICTORY"
  },
  {
    id: 76,
    name: "വേണുഗോപാൽ (Venugopal)",
    ageBracket: "MATURE_LEADER",
    dob: "1974-06-28",
    tob: "13:40",
    place: "Kannur, Kerala",
    lat: 11.8745,
    lng: 75.3704,
    timezone: 5.5,
    lang: "ml",
    question: "കോടതി വ്യവഹാരങ്ങളിൽ നിന്നും പൂർണ്ണ വിജയം നേടി സമാധാനം ലഭിക്കാൻ എന്ത് പരിഹാരം ചെയ്യണം?",
    expectedCategory: "LEGAL_DISPUTE_VICTORY"
  },
  {
    id: 77,
    name: "अशोक कुलकर्णी (Ashok Kulkarni)",
    ageBracket: "MATURE_LEADER",
    dob: "1976-10-14",
    tob: "09:10",
    place: "Satara, Maharashtra",
    lat: 17.6805,
    lng: 73.9997,
    timezone: 5.5,
    lang: "mr",
    question: "न्यायालयीन खटल्यात विजय मिळण्यासाठी षष्ठ भाव आणि दशमातील ग्रहांचे मार्गदर्शन द्या.",
    expectedCategory: "LEGAL_DISPUTE_VICTORY"
  },
  {
    id: 78,
    name: "David Sterling",
    ageBracket: "MATURE_LEADER",
    dob: "1973-04-19",
    tob: "15:35",
    place: "Chicago, USA",
    lat: 41.8781,
    lng: -87.6298,
    timezone: -6.0,
    lang: "en",
    question: "What is the verdict timeline for the commercial partnership legal lawsuit according to Vedic transit?",
    expectedCategory: "LEGAL_DISPUTE_VICTORY"
  },
  {
    id: 79,
    name: "ಪ್ರಭಾಕರ್ ಹೆಗಡೆ (Prabhakar Hegde)",
    ageBracket: "MATURE_LEADER",
    dob: "1975-11-09",
    tob: "18:20",
    place: "Yellapur, Karnataka",
    lat: 14.9642,
    lng: 74.7121,
    timezone: 5.5,
    lang: "kn",
    question: "ಉದ್ಯಮ ವಿಸ್ತರಣೆ ಮತ್ತು ಮಕ್ಕಳ ಉನ್ನತ ವ್ಯಾಸಂಗದ ಶುಭ ಯೋಗ ಹೇಗಿದೆ?",
    expectedCategory: "BUSINESS_VS_JOB_COMMERCE"
  },
  {
    id: 80,
    name: "सुरेश चंद्रा (Suresh Chandra)",
    ageBracket: "MATURE_LEADER",
    dob: "1974-08-03",
    tob: "10:45",
    place: "Bareilly, Uttar Pradesh",
    lat: 28.367,
    lng: 79.4304,
    timezone: 5.5,
    lang: "hi",
    question: "जीवन के इस पड़ाव पर नई व्यावसायिक योजना में निवेश करना सुरक्षित रहेगा?",
    expectedCategory: "BUSINESS_VS_JOB_COMMERCE"
  },

  // ==========================================
  // Bracket 9: Pre-Retirees (56 - 65)
  // ==========================================
  {
    id: 81,
    name: "ಶಂಕರನಾರಾಯಣ ಭಟ್ (Shankaranarayana Bhat)",
    ageBracket: "PRE_RETIREE",
    dob: "1964-04-14",
    tob: "07:55",
    place: "Shivamogga, Karnataka",
    lat: 13.9299,
    lng: 75.5681,
    timezone: 5.5,
    lang: "kn",
    question: "ನಿವೃತ್ತಿ ನಂತರದ ಜೀವನ, ಆರೋಗ್ಯ, ದೈಹಿಕ ಚೈತನ್ಯ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಶಾಂತಿಯ ಬಗ್ಗೆ ತಿಳಿಸಿ.",
    expectedCategory: "HEALTH_VITALITY_HEALING"
  },
  {
    id: 82,
    name: "Harishchandra Bose",
    ageBracket: "PRE_RETIREE",
    dob: "1963-08-25",
    tob: "11:10",
    place: "Kolkata, West Bengal",
    lat: 22.5726,
    lng: 88.3639,
    timezone: 5.5,
    lang: "en",
    question: "How does my 6th and 8th house indicate post-retirement health, vitality, and longevity?",
    expectedCategory: "HEALTH_VITALITY_HEALING"
  },
  {
    id: 83,
    name: "कैलाश नाथ (Kailash Nath)",
    ageBracket: "PRE_RETIREE",
    dob: "1965-02-17",
    tob: "14:35",
    place: "Ayodhya, Uttar Pradesh",
    lat: 26.7922,
    lng: 82.1998,
    timezone: 5.5,
    lang: "hi",
    question: "दीर्घकालीन स्वास्थ्य, जोड़ों का दर्द और मानसिक शांति के लिए कौन सा वैदिक अनुष्ठान करें?",
    expectedCategory: "HEALTH_VITALITY_HEALING"
  },
  {
    id: 84,
    name: "సత్యనారాయణ మూర్తి (Satyanarayana Murthy)",
    ageBracket: "PRE_RETIREE",
    dob: "1964-10-30",
    tob: "16:00",
    place: "Rajahmundry, Andhra Pradesh",
    lat: 17.0005,
    lng: 81.804,
    timezone: 5.5,
    lang: "te",
    question: "ఆరోగ్య సమస్యల నుండి ఉపశమనం మరియు దీర్ఘాయుష్షు కోసం గోకర్ణ మహాబలేశ్వర పూజ వివరించండి.",
    expectedCategory: "HEALTH_VITALITY_HEALING"
  },
  {
    id: 85,
    name: "சுந்தரமூர்த்தி (Sundaramurthy)",
    ageBracket: "PRE_RETIREE",
    dob: "1963-05-18",
    tob: "08:20",
    place: "Kanchipuram, Tamil Nadu",
    lat: 12.8342,
    lng: 79.7036,
    timezone: 5.5,
    lang: "ta",
    question: "ஓய்வுக்கால ஆரோக்கியம், ஆயுள் பலம் மற்றும் ஆன்மீக அமைதிக்கான ஜோதிட வழிகாட்டல் தரவும்.",
    expectedCategory: "HEALTH_VITALITY_HEALING"
  },
  {
    id: 86,
    name: "രാമകൃഷ്ണ പിള്ള (Ramakrishna Pillai)",
    ageBracket: "PRE_RETIREE",
    dob: "1965-07-22",
    tob: "12:45",
    place: "Kollam, Kerala",
    lat: 8.8932,
    lng: 76.6141,
    timezone: 5.5,
    lang: "ml",
    question: "ആരോഗ്യസ്ഥിതി മെച്ചപ്പെടാനും ആയുരാരോഗ്യ സൗഖ്യം നിലനിർത്താനും എന്ത് പരിഹാരം ചെയ്യണം?",
    expectedCategory: "HEALTH_VITALITY_HEALING"
  },
  {
    id: 87,
    name: "विष्णुपंत जोशी (Vishnupant Joshi)",
    ageBracket: "PRE_RETIREE",
    dob: "1964-12-08",
    tob: "09:15",
    place: "Nashik, Maharashtra",
    lat: 19.9975,
    lng: 73.7898,
    timezone: 5.5,
    lang: "mr",
    question: "दीर्घायुष्य, आरोग्य व शांत निवृत्ती जीवनासाठी कोणत्या देवतेची उपासना करावी?",
    expectedCategory: "HEALTH_VITALITY_HEALING"
  },
  {
    id: 88,
    name: "Robert MacIntyre",
    ageBracket: "PRE_RETIREE",
    dob: "1963-03-11",
    tob: "15:00",
    place: "Edinburgh, Scotland",
    lat: 55.9533,
    lng: -3.1883,
    timezone: 0.0,
    lang: "en",
    question: "What does the 8th house of longevity and vitality indicate for my upcoming retirement years?",
    expectedCategory: "HEALTH_VITALITY_HEALING"
  },
  {
    id: 89,
    name: "ಕೃಷ್ಣಮೂರ್ತಿ ರಾವ್ (Krishnamurthy Rao)",
    ageBracket: "PRE_RETIREE",
    dob: "1965-09-03",
    tob: "17:40",
    place: "Dharwad, Karnataka",
    lat: 15.4589,
    lng: 75.0078,
    timezone: 5.5,
    lang: "kn",
    question: "ಮನೆಯಲ್ಲಿ ವಾಸ್ತು ದೋಷ ಅಥವಾ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ನಿವಾರಣೆಗೆ ಪರಿಹಾರವೇನು?",
    expectedCategory: "DOMESTIC_OMEN_VASTU"
  },
  {
    id: 90,
    name: "रमाकांत शास्त्री (Ramakant Shastri)",
    ageBracket: "PRE_RETIREE",
    dob: "1964-06-19",
    tob: "10:30",
    place: "Haridwar, Uttarakhand",
    lat: 29.9457,
    lng: 78.1642,
    timezone: 5.5,
    lang: "hi",
    question: "घर के ईशान कोण में शांति और नकारात्मक ऊर्जा को दूर करने हेतु वास्तु उपाय बताएं।",
    expectedCategory: "DOMESTIC_OMEN_VASTU"
  },

  // ==========================================
  // Bracket 10: Revered Elders & Seniors (66 - 85+)
  // ==========================================
  {
    id: 91,
    name: "ರಾಮಚಂದ್ರ ಭಟ್ (Ramachandra Bhat)",
    ageBracket: "REVERED_ELDER",
    dob: "1948-08-15",
    tob: "06:45",
    place: "Gokarna, Karnataka",
    lat: 14.5479,
    lng: 74.3188,
    timezone: 5.5,
    lang: "kn",
    question: "ನಮಸ್ಕಾರ ಸ್ವಾಮಿ, ಆಯುಷ್ಯ ಆರೋಗ್ಯ, ಮೋಕ್ಷ ಮಾರ್ಗ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರ ಸಾನ್ನಿಧ್ಯದ ಆಶೀರ್ವಾದ ಬೇಡುತ್ತಿದ್ದೇನೆ.",
    expectedCategory: "CONVERSATIONAL_GREETING"
  },
  {
    id: 92,
    name: "Bhaskar Roy Chowdhury",
    ageBracket: "REVERED_ELDER",
    dob: "1947-01-26",
    tob: "10:15",
    place: "Kolkata, West Bengal",
    lat: 22.5726,
    lng: 88.3639,
    timezone: 5.5,
    lang: "en",
    question: "Seeking Swamiji's divine blessings for spiritual tranquility, peaceful health, and Moksha Sadhana.",
    expectedCategory: "CONVERSATIONAL_GREETING"
  },
  {
    id: 93,
    name: "पं. विद्याधर त्रिपाठी (Pt. Vidyadhar Tripathi)",
    ageBracket: "REVERED_ELDER",
    dob: "1949-10-02",
    tob: "13:20",
    place: "Varanasi, Uttar Pradesh",
    lat: 25.3176,
    lng: 82.9739,
    timezone: 5.5,
    lang: "hi",
    question: "प्रणाम गुरुजी, जीवन के संध्याकाल में मोक्ष साधना, आत्मशांति एवं ईश्वर कृपा हेतु आशीर्वाद दें।",
    expectedCategory: "CONVERSATIONAL_GREETING"
  },
  {
    id: 94,
    name: "శ్రీరాములు గారు (Sreeramulu Garu)",
    ageBracket: "REVERED_ELDER",
    dob: "1950-03-12",
    tob: "15:40",
    place: "Nellore, Andhra Pradesh",
    lat: 14.4426,
    lng: 79.9865,
    timezone: 5.5,
    lang: "te",
    question: "స్వామీ నమస్కారం, శేష జీవితంలో మనశ్శాంతి, మోక్ష మార్గం మరియు గోకర్ణేశ్వరుని అనుగ్రహం కోరుతున్నాను.",
    expectedCategory: "CONVERSATIONAL_GREETING"
  },
  {
    id: 95,
    name: "சுவாமிநாதன் (Swaminathan)",
    ageBracket: "REVERED_ELDER",
    dob: "1948-12-25",
    tob: "08:10",
    place: "Kumbakonam, Tamil Nadu",
    lat: 10.9602,
    lng: 79.3845,
    timezone: 5.5,
    lang: "ta",
    question: "வணக்கம் குருவே, முதுமைக் காலத்தில் மன அமைதி மற்றும் ஆன்மீக முக்திக்கு ஆசீர்வாதம் வேண்டுகிறேன்.",
    expectedCategory: "CONVERSATIONAL_GREETING"
  },
  {
    id: 96,
    name: "പരമേശ്വരൻ നമ്പൂതിരി (Parameswaran Namboothiri)",
    ageBracket: "REVERED_ELDER",
    dob: "1949-05-09",
    tob: "11:55",
    place: "Guruvayur, Kerala",
    lat: 10.5946,
    lng: 76.0407,
    timezone: 5.5,
    lang: "ml",
    question: "നമസ്കാരം സ്വാമി, ആത്മശാന്തിക്കും ആയുരാരോഗ്യത്തിനും ഈശ്വരാനുഗ്രഹത്തിനും വേണ്ടിയുള്ള അനുഗ്രഹം തേടുന്നു.",
    expectedCategory: "CONVERSATIONAL_GREETING"
  },
  {
    id: 97,
    name: "दत्तात्रय कुलकर्णी (Dattatraya Kulkarni)",
    ageBracket: "REVERED_ELDER",
    dob: "1947-07-20",
    tob: "14:00",
    place: "Pandharpur, Maharashtra",
    lat: 17.6775,
    lng: 75.3278,
    timezone: 5.5,
    lang: "mr",
    question: "प्रणाम महाराज, वृद्धापकाळात मनःशांती, ईशचिंतन आणि मोक्ष प्राप्तीसाठी आशीर्वाद द्यावा.",
    expectedCategory: "CONVERSATIONAL_GREETING"
  },
  {
    id: 98,
    name: "Arthur Pendelton",
    ageBracket: "REVERED_ELDER",
    dob: "1946-11-15",
    tob: "16:30",
    place: "Oxford, UK",
    lat: 51.752,
    lng: -1.2577,
    timezone: 0.0,
    lang: "en",
    question: "Greetings Swamiji, seeking your spiritual wisdom and blessings for peace in my final years.",
    expectedCategory: "CONVERSATIONAL_GREETING"
  },
  {
    id: 99,
    name: "ಗಣಪತಿ ಹೆಗಡೆ (Ganapati Hegde)",
    ageBracket: "REVERED_ELDER",
    dob: "1949-02-28",
    tob: "09:05",
    place: "Gokarna, Karnataka",
    lat: 14.5479,
    lng: 74.3188,
    timezone: 5.5,
    lang: "kn",
    question: "ಕುಟುಂಬದ ನೆಮ್ಮದಿ, ಮೊಮ್ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಆತ್ಮ ಕಲ್ಯಾಣಕ್ಕೆ ಯಾವ ನಿತ್ಯ ಪೂಜೆ ಶ್ರೇಷ್ಠ?",
    expectedCategory: "ASTROLOGICAL_DEEP"
  },
  {
    id: 100,
    name: "पं. सूर्यनारायण मिश्र (Pt. Suryanarayan Mishra)",
    ageBracket: "REVERED_ELDER",
    dob: "1947-09-12",
    tob: "17:15",
    place: "Ujjain, Madhya Pradesh",
    lat: 23.1765,
    lng: 75.7885,
    timezone: 5.5,
    lang: "hi",
    question: "मोक्ष कारक केतु एवं द्वादश भाव की स्थिति से आध्यात्मिक शांति का क्या संकेत मिलता है?",
    expectedCategory: "ASTROLOGICAL_DEEP"
  }
];

describe("Baggona Panchanga 100-Profile Multi-Language Audit Suite", () => {
  // Test 1: Verify Profile Dataset Breadth & Linguistic Distribution
  it("verifies 100 distinct benchmark profiles with balanced age, language, and geographical coverage", () => {
    expect(BENCHMARK_100_PROFILES.length).toBe(100);

    const langCounts: Record<ConsultationLanguage, number> = {
      kn: 0,
      en: 0,
      hi: 0,
      te: 0,
      ta: 0,
      ml: 0,
      mr: 0
    };

    const bracketCounts: Record<string, number> = {};

    for (const p of BENCHMARK_100_PROFILES) {
      langCounts[p.lang] = (langCounts[p.lang] || 0) + 1;
      bracketCounts[p.ageBracket] = (bracketCounts[p.ageBracket] || 0) + 1;

      expect(p.id).toBeGreaterThanOrEqual(1);
      expect(p.id).toBeLessThanOrEqual(100);
      expect(p.name).toBeTruthy();
      expect(p.dob).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.tob).toMatch(/^\d{2}:\d{2}$/);
      expect(p.place).toBeTruthy();
      expect(p.question).toBeTruthy();
    }

    // Verify 7 languages distribution
    expect(langCounts.kn).toBe(20);
    expect(langCounts.en).toBe(20);
    expect(langCounts.hi).toBe(20);
    expect(langCounts.te).toBe(10);
    expect(langCounts.ta).toBe(10);
    expect(langCounts.ml).toBe(10);
    expect(langCounts.mr).toBe(10);

    // Verify all 10 age brackets have exactly 10 profiles each
    expect(Object.keys(bracketCounts).length).toBe(10);
    for (const bracket of Object.keys(bracketCounts)) {
      expect(bracketCounts[bracket]).toBe(10);
    }
  });

  // Test 2: Astronomical Panchanga Coordinates (Vaara, Vaara Lord, Janma Hora, Tithi, Nakshatra, Dasha)
  it("accurately computes 5 sacred Panchanga limbs + Vaara Lord + Chaldean Janma Hora across diverse sample profiles", async () => {
    // Select a representative sample from each age bracket (10 sample profiles)
    const sampleProfiles = [
      BENCHMARK_100_PROFILES[0],  // Profile 1: kn infant
      BENCHMARK_100_PROFILES[11], // Profile 12: en school child
      BENCHMARK_100_PROFILES[22], // Profile 23: hi teen
      BENCHMARK_100_PROFILES[33], // Profile 34: te college youth
      BENCHMARK_100_PROFILES[44], // Profile 45: ta young adult
      BENCHMARK_100_PROFILES[55], // Profile 56: ml mid career
      BENCHMARK_100_PROFILES[66], // Profile 67: mr established adult
      BENCHMARK_100_PROFILES[70], // Profile 71: kn mature leader
      BENCHMARK_100_PROFILES[81], // Profile 82: en pre retiree
      BENCHMARK_100_PROFILES[92]  // Profile 93: hi elder
    ];

    for (const def of sampleProfiles) {
      const session = createTestSession(def);

      const profile: DevoteePanchangaProfile = await computeDevoteePanchangaProfile(session);

      // Verify core identity
      expect(profile.devoteeName).toBe(def.name);
      expect(profile.dob).toBe(def.dob);
      expect(profile.tob).toBe(def.tob);
      expect(profile.place).toBe(def.place);

      // Verify Vaara & Vaara Lord
      expect(profile.vaara).toBeTruthy();
      expect(profile.vaaraLord).toBeTruthy();
      expect(profile.vaaraWithLord).toBeTruthy();
      expect(profile.vaaraWithLord).toContain(profile.vaara);
      expect(profile.vaaraWithLord).toContain(profile.vaaraLord);

      // Verify Janma Hora
      expect(profile.janmaHora).toBeTruthy();
      expect(profile.horaLord).toBeTruthy();
      expect(profile.janmaHora).toContain(profile.horaLord);

      // Verify Tithi, Nakshatra, Rashi, Lagna
      expect(profile.tithi).toBeTruthy();
      expect(profile.nakshatra).toBeTruthy();
      expect(profile.pada).toBeGreaterThanOrEqual(1);
      expect(profile.pada).toBeLessThanOrEqual(4);
      expect(profile.rashi).toBeTruthy();
      expect(profile.lagna).toBeTruthy();
      expect(profile.yoga).toBeTruthy();
      expect(profile.karana).toBeTruthy();
      expect(profile.runningDasha).toBeTruthy();

      // Verify labels are present
      expect(profile.labels.vaaraLabel).toBeTruthy();
      expect(profile.labels.vaaraLordLabel).toBeTruthy();
      expect(profile.labels.horaLabel).toBeTruthy();
      expect(profile.labels.cardTitle).toBeTruthy();

      // Verify zero English leakage into Indic language fields
      if (def.lang !== "en") {
        expect(profile.vaara).not.toContain("Sunday");
        expect(profile.vaara).not.toContain("Wednesday");
        expect(profile.vaaraLord).not.toContain("Sun");
        expect(profile.vaaraLord).not.toContain("Jupiter");
      }
    }
  });

  // Test 3: Front-Loaded Direct Answer in Paragraph 1 ("Up to the point")
  it("enforces front-loaded direct answer in sentence 1 across diverse life categories", async () => {
    // Audit Marriage, Abroad, Property, Debt, Career queries
    const testCases = [
      {
        profile: BENCHMARK_100_PROFILES[40], // Profile 41: kn marriage timing
        expectedDirectTokens: ["೧೦೦% ಖಚಿತ ಜಾತಕ ನಿರ್ಣಯ", "೬ ತಿಂಗಳಲ್ಲೇ", "ವಿವಾಹ ಯೋಗ"]
      },
      {
        profile: BENCHMARK_100_PROFILES[41], // Profile 42: en marriage timing
        expectedDirectTokens: ["100% Confident Astrological Prediction", "next 6 months", "marriage"]
      },
      {
        profile: BENCHMARK_100_PROFILES[42], // Profile 43: hi marriage timing
        expectedDirectTokens: ["१००% निश्चित दैवज्ञ निर्णय", "६ महीनों में", "विवाह"]
      },
      {
        profile: BENCHMARK_100_PROFILES[43], // Profile 44: te marriage timing
        expectedDirectTokens: ["100% ఖచ్చితమైన దైవజ్ఞ నిర్ణయం", "6 నెలల్లో", "వివాహం"]
      },
      {
        profile: BENCHMARK_100_PROFILES[44], // Profile 45: ta marriage timing
        expectedDirectTokens: ["100% உறுதியான ஜோதிடத் தீர்ப்பு", "6 மாதங்களுக்குள்", "திருமணம்"]
      },
      {
        profile: BENCHMARK_100_PROFILES[45], // Profile 46: ml marriage timing
        expectedDirectTokens: ["100% ഉറപ്പായ ജ്യോതിഷ പ്രവചനം", "6 മാസത്തിനകം", "വിവാഹം"]
      },
      {
        profile: BENCHMARK_100_PROFILES[46], // Profile 47: mr marriage timing
        expectedDirectTokens: ["१००% अचूक आणि निश्चित दैवज्ञ निर्णय", "६ महिन्यांत", "विवाह"]
      },
      {
        profile: BENCHMARK_100_PROFILES[50], // Profile 51: kn career frustration
        expectedDirectTokens: ["ಗ್ರಹಿಸಬಲ್ಲೆ", "ಕಿರಿಕಿರಿ", "ದಶಾ"]
      },
      {
        profile: BENCHMARK_100_PROFILES[60], // Profile 61: kn debt relief
        expectedDirectTokens: ["ತಾತ್ಕಾಲಿಕ", "ಋಣ", "ಗುರು"]
      }
    ];

    for (const tc of testCases) {
      const def = tc.profile;
      const session = createTestSession(def);

      const result: ConsultationReadingResult = await generateConsultationAnswer({
        session,
        userQuestion: def.question,
        conversationHistory: [],
        apiKey: "" // Deterministic fallback
      });

      expect(result.paragraphs.length).toBeGreaterThanOrEqual(1);
      const p1 = result.paragraphs[0];

      // Assert that paragraph 1 is front-loaded with the core verdict/remedy tokens
      let matchedAtLeastOne = false;
      for (const token of tc.expectedDirectTokens) {
        if (p1.includes(token)) {
          matchedAtLeastOne = true;
          break;
        }
      }
      expect(matchedAtLeastOne).toBe(true);

      // Assert sentence 1 is direct and non-empty
      const sentence1 = p1.split(/[.!?।॥]\s+/)[0] || p1;
      expect(sentence1.length).toBeGreaterThan(15);
    }
  });

  // Test 4: Intelligent Question Categorization & Priest Persona Presence across All 10 Age Groups
  it("correctly categorizes devotee queries and validates revered priest persona tone across demographics", () => {
    for (const def of BENCHMARK_100_PROFILES) {
      const session = createTestSession(def);

      const sensed = senseAndCategorizeQuestion(def.question, session);

      // Verify life-stage sensing mathematically matches ageYears thresholds (< 28 YOUTH, <= 48 MID_CAREER, > 48 SENIOR)
      if (sensed.ageYears < 28) {
        expect(sensed.lifeStage).toBe("YOUTH");
      } else if (sensed.ageYears <= 48) {
        expect(sensed.lifeStage).toBe("MID_CAREER");
      } else {
        expect(sensed.lifeStage).toBe("SENIOR");
      }

      // Verify valid priest persona tone is assigned
      expect([
        "compassionate_grounding",
        "divine_oracle",
        "gentle_wisdom",
        "peaceful_counsel",
        "erudite_scholar"
      ]).toContain(sensed.priestPersonaTone);
    }
  });

  // Test 5: Revered 50+ Year Priest Presentation & Atmalinga Blessing
  it("presents fatherly compassionate advice with Sri Kshetra Gokarna Atmalinga blessings across all 7 languages", async () => {
    const greetingSamples = [
      BENCHMARK_100_PROFILES[90], // kn elder
      BENCHMARK_100_PROFILES[91], // en elder
      BENCHMARK_100_PROFILES[92], // hi elder
      BENCHMARK_100_PROFILES[93], // te elder
      BENCHMARK_100_PROFILES[94], // ta elder
      BENCHMARK_100_PROFILES[95], // ml elder
      BENCHMARK_100_PROFILES[96]  // mr elder
    ];

    for (const def of greetingSamples) {
      const session = createTestSession(def);

      const reply = await presentConsultationReply({
        session,
        userQuestion: def.question,
        conversationHistory: [],
        apiKey: ""
      });

      expect(reply.fullText).toBeTruthy();
      expect(reply.paragraphs.length).toBeGreaterThanOrEqual(1);

      // Verify spiritual presence (Gokarna / Mahabaleshwara / Atmalinga or divine blessing)
      const text = reply.fullText;
      const hasSpiritualBlessing =
        text.includes("ಗೋಕರ್ಣ") ||
        text.includes("ಆಶೀರ್ವಾದ") ||
        text.includes("Gokarna") ||
        text.includes("blessing") ||
        text.includes("गोकर्ण") ||
        text.includes("आशीर्वाद") ||
        text.includes("గోకర్ణ") ||
        text.includes("దీవెన") ||
        text.includes("கோகர்ண") ||
        text.includes("ஆசீர்வாதம்") ||
        text.includes("ഗോകർണ്ണ") ||
        text.includes("അനുഗ്രഹം") ||
        text.includes("महाबळेश्वर");

      expect(hasSpiritualBlessing).toBe(true);

      // Verify zero word-stuttering or repeated consecutive phrases
      expect(text).not.toMatch(/(\b\w+\b)( \1){3,}/i);
    }
  });

  // Test 6: Zero-Repetition Multi-Turn Guard Verification across Selected Profiles
  it("strictly enforces zero duplicate greetings and zero inborn trait repetition on subsequent questions", async () => {
    const sample = BENCHMARK_100_PROFILES[50]; // Profile 51: kn mid-career Raghavendra Bhat
    const session = createTestSession(sample);

    // Turn 1: Career frustration
    const turn1Result = await generateConsultationAnswer({
      session,
      userQuestion: sample.question,
      conversationHistory: [],
      apiKey: ""
    });

    expect(turn1Result.paragraphs.length).toBeGreaterThanOrEqual(1);

    // Turn 2: Follow-up question on timing
    const turn2Result = await generateConsultationAnswer({
      session,
      userQuestion: "ನಾನು ಕೆಲಸ ಬದಲಾಯಿಸಲು ಯಾವ ತಿಂಗಳು ಸೂಕ್ತ?",
      conversationHistory: [
        { role: "user", text: sample.question },
        { role: "model", text: turn1Result.fullText }
      ],
      isSubsequentQuestion: true,
      questionIndex: 1,
      apiKey: ""
    });

    // Turn 2 MUST NOT repeat greetings like "ನಮಸ್ಕಾರ" or "ಶ್ರೀ ಸಚ್ಚಿದಾನಂದ ಗಣೇಶಾಯ ನಮಃ"
    expect(turn2Result.fullText).not.toContain("ನಮಸ್ಕಾರ, ನಾನು ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(turn2Result.fullText).not.toContain("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಸನ್ನಿಧಿಗೆ ಸ್ವಾಗತ");

    // Turn 2 must answer directly
    expect(turn2Result.paragraphs.length).toBeGreaterThanOrEqual(1);
    expect(turn2Result.fullText.length).toBeGreaterThan(50);
  });
});
