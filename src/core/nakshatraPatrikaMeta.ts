/**
 * Traditional Yoni / Gana / Nadi labels by moon nakshatra index (0 = Ashwini … 26 = Revati).
 * Used for print-style patrike; many regional variants exist.
 */

export type PatrikaNakMeta = {
  yoniKn: string;
  yoniEn: string;
  ganaKn: string;
  ganaEn: string;
  nadiKn: string;
  nadiEn: string;
};

/** One row per nakshatra index 0–26 */
export const PATRIKA_NAKSHATRA_META: PatrikaNakMeta[] = [
  { yoniKn: "ಅಶ್ವ", yoniEn: "Horse", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಆದಿ", nadiEn: "Adi" },
  { yoniKn: "ಗಜ", yoniEn: "Elephant", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
  { yoniKn: "ಮೇಷ", yoniEn: "Goat", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
  { yoniKn: "ಸರ್ಪ", yoniEn: "Serpent", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
  { yoniKn: "ಸರ್ಪ", yoniEn: "Serpent", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
  { yoniKn: "ಶ್ವಾನ", yoniEn: "Dog", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಆದಿ", nadiEn: "Adi" },
  { yoniKn: "ಮಾರ್ಜಾಲ", yoniEn: "Cat", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಆದಿ", nadiEn: "Adi" },
  { yoniKn: "ಮೇಷ", yoniEn: "Goat", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
  { yoniKn: "ಮಾರ್ಜಾಲ", yoniEn: "Cat", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
  { yoniKn: "ಮೂಷಕ", yoniEn: "Rat", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಆದಿ", nadiEn: "Adi" },
  { yoniKn: "ಮೂಷಕ", yoniEn: "Rat", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
  { yoniKn: "ಗೌ", yoniEn: "Cow", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
  { yoniKn: "ಮಹಿಷ", yoniEn: "Buffalo", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಆದಿ", nadiEn: "Adi" },
  { yoniKn: "ವ್ಯಾಘ್ರ", yoniEn: "Tiger", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
  { yoniKn: "ಮಹಿಷ", yoniEn: "Buffalo", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
  { yoniKn: "ವ್ಯಾಘ್ರ", yoniEn: "Tiger", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
  { yoniKn: "ಹರಿಣ", yoniEn: "Deer", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
  { yoniKn: "ಹರಿಣ", yoniEn: "Deer", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಆದಿ", nadiEn: "Adi" },
  { yoniKn: "ಶ್ವಾನ", yoniEn: "Dog", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಆದಿ", nadiEn: "Adi" },
  { yoniKn: "ವಾನರ", yoniEn: "Monkey", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
  { yoniKn: "ನಕುಲ", yoniEn: "Mongoose", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
  { yoniKn: "ವಾನರ", yoniEn: "Monkey", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
  { yoniKn: "ಸಿಂಹ", yoniEn: "Lion", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
  { yoniKn: "ಅಶ್ವ", yoniEn: "Horse", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಆದಿ", nadiEn: "Adi" },
  { yoniKn: "ಸಿಂಹ", yoniEn: "Lion", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಆದಿ", nadiEn: "Adi" },
  { yoniKn: "ಗೌ", yoniEn: "Cow", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
  { yoniKn: "ಗಜ", yoniEn: "Elephant", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" }
];

export const patrikaMetaForNakshatraIndex = (index: number): PatrikaNakMeta => {
  const i = ((index % 27) + 27) % 27;
  return PATRIKA_NAKSHATRA_META[i]!;
};

export const GANA_L5: Record<string, Record<string, string>> = {
  Deva: { kn: "ದೇವ", hi: "देव", te: "దేవ", ta: "தேவ", en: "Deva" },
  Manushya: { kn: "ಮಾನವ", hi: "मानव", te: "మానవ", ta: "மானிட", en: "Manushya" },
  Rakshasa: { kn: "ರಾಕ್ಷಸ", hi: "राक्षस", te: "రాక్షస", ta: "ராட்சச", en: "Rakshasa" }
};

export const NADI_L5: Record<string, Record<string, string>> = {
  Adi: { kn: "ಆದಿ", hi: "आदि", te: "ఆది", ta: "ஆதி", en: "Adi" },
  Madhya: { kn: "ಮಧ್ಯ", hi: "मध्य", te: "మధ్య", ta: "மத்ய", en: "Madhya" },
  Antya: { kn: "ಅಂತ್ಯ", hi: "अन्त्य", te: "అంత్య", ta: "அந்திய", en: "Antya" }
};

export const YONI_L5: Record<string, Record<string, string>> = {
  Horse: { kn: "ಅಶ್ವ", hi: "अश्व", te: "అశ్వ", ta: "அசுவம்", en: "Horse" },
  Elephant: { kn: "ಗಜ", hi: "गज", te: "గజ", ta: "யானை", en: "Elephant" },
  Goat: { kn: "ಮೇಷ", hi: "मेष", te: "మేష", ta: "ஆடு", en: "Goat" },
  Serpent: { kn: "ಸರ್ಪ", hi: "सर्प", te: "సర్ప", ta: "பாம்பு", en: "Serpent" },
  Dog: { kn: "ಶ್ವಾನ", hi: "श्वान", te: "శ్వాన", ta: "நாய்", en: "Dog" },
  Cat: { kn: "ಮಾರ್ಜಾಲ", hi: "मार्जार", te: "మార్జాల", ta: "பூனை", en: "Cat" },
  Rat: { kn: "ಮೂಷಕ", hi: "मूषक", te: "మూషక", ta: "எலி", en: "Rat" },
  Cow: { kn: "ಗೌ", hi: "गौ", te: "గోవు", ta: "பசு", en: "Cow" },
  Buffalo: { kn: "ಮಹಿಷ", hi: "महिष", te: "మహిష", ta: "எருமை", en: "Buffalo" },
  Tiger: { kn: "ವ್ಯಾಘ್ರ", hi: "व्याघ्र", te: "ವ್ಯಾಘ್ರ", ta: "புலி", en: "Tiger" },
  Deer: { kn: "ಹರಿಣ", hi: "हरिण", te: "హరిణ", ta: "மான்", en: "Deer" },
  Monkey: { kn: "ವಾನರ", hi: "वानर", te: "వానర", ta: "குரங்கு", en: "Monkey" },
  Mongoose: { kn: "ನಕುಲ", hi: "नकुल", te: "నకులం", ta: "கீரி", en: "Mongoose" },
  Lion: { kn: "ಸಿಂಹ", hi: "सिंह", te: "సింహం", ta: "சிங்கம்", en: "Lion" }
};

