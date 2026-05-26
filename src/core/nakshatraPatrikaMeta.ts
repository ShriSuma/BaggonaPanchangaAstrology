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
