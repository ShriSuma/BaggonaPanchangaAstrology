export type NameCorrectionSuggestion = {
  originalName: string;
  suggestedSpelling: string;
  originalCompound: number;
  originalRoot: number;
  suggestedCompound: number;
  suggestedRoot: number;
  vibrationQuality: Record<string, string>;
  luckImpact: Record<string, string>;
};

// Chaldean Numerology Letter Values
const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8
};

/** Calculate single digital root */
function getSingleDigitRoot(num: number): number {
  while (num > 9) {
    num = num.toString().split("").reduce((acc, curr) => acc + parseInt(curr, 10), 0);
  }
  return num;
}

/** Calculate Chaldean compound and root numbers for a string */
export function calculateChaldeanNameNumber(name: string): { compound: number; root: number } {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  let compound = 0;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    compound += CHALDEAN_MAP[char] || 0;
  }

  return { compound, root: getSingleDigitRoot(compound) };
}

/** Generate Numerological Name Corrections for Luck & Prosperity */
export function generateNumerologicalNameCorrections(
  currentName: string,
  birthDate?: string
): NameCorrectionSuggestion[] {
  const orig = calculateChaldeanNameNumber(currentName);
  const cleanOrigName = currentName.trim();

  // Lucky target roots in Chaldean numerology: 1 (Sun), 3 (Jupiter), 5 (Mercury), 6 (Venus)
  const luckyRoots = [1, 3, 5, 6];

  const suggestions: NameCorrectionSuggestion[] = [];

  // Candidate modifications (e.g. adding A, E, I, S, R, H)
  const mods = ["A", "E", "I", "S", "R", "H", "EE", "AA"];

  for (const mod of mods) {
    const candidateName = `${cleanOrigName}${mod}`;
    const candidateScore = calculateChaldeanNameNumber(candidateName);

    if (luckyRoots.includes(candidateScore.root) && candidateScore.root !== orig.root) {
      let qualityKn = "ಅತ್ಯುನ್ನತ ಸೂರ್ಯ-ಬುಧ-ಶುಕ್ರ ಲಕ್ಷ್ಮೀ ಯೋಗ";
      let impactKn = "ವೃತ್ತಿಯಲ್ಲಿ ಶೀಘ್ರ ಯಶಸ್ಸು, ಧನ ವೃದ್ಧಿ ಹಾಗೂ ಅದೃಷ್ಟ ತೇಜಸ್ಸು.";

      if (candidateScore.root === 1) {
        qualityKn = "☀️ ಸೂರ್ಯ ಬಲ - ರಾಜಯೋಗ ಹಾಗೂ ನೇತೃತ್ವ ಬಲ";
        impactKn = "ಆಡಳಿತಾತ್ಮಕ ಹುದ್ದೆ, ಗೌರವ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಶ್ರೇಷ್ಠ ಪ್ರತಿಷ್ಠೆ.";
      } else if (candidateScore.root === 3) {
        qualityKn = "⚡ ಗುರು ಬಲ - ಧನ ವೃದ್ಧಿ ಹಾಗೂ ಜ್ಞಾನ ಸಿದ್ಧಿ";
        impactKn = "ವಿದ್ಯಾಭ್ಯಾಸ, ಉದ್ಯೋಗ ಹಾಗೂ ಆರ್ಥಿಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿರಂತರ ಏಳಿಗೆ.";
      } else if (candidateScore.root === 5) {
        qualityKn = "🚀 ಬುಧ ಯೋಗ - ವ್ಯಾಪಾರ ಹಾಗೂ ಬುದ್ಧಿ ಕೌಶಲ್ಯ";
        impactKn = "ವ್ಯವಹಾರಿಕ ಜಯ, ಸೃಜನಶೀಲತೆ ಹಾಗೂ ಅನಿರೀಕ್ಷಿತ ಧನಲಾಭ.";
      } else if (candidateScore.root === 6) {
        qualityKn = "🌟 ಶುಕ್ರ ಲಕ್ಷ್ಮೀ ಯೋಗ - ಸೌಭಾಗ್ಯ ಹಾಗೂ ವಾಹನ ಯೋಗ";
        impactKn = "ದಾಂಪತ್ಯ ಸುಖ, ಐಶ್ವರ್ಯ ಹಾಗೂ ವಾಹನ-ಗೃಹ ಸೌಭಾಗ್ಯ.";
      }

      suggestions.push({
        originalName: cleanOrigName,
        suggestedSpelling: candidateName,
        originalCompound: orig.compound,
        originalRoot: orig.root,
        suggestedCompound: candidateScore.compound,
        suggestedRoot: candidateScore.root,
        vibrationQuality: { kn: qualityKn, en: `Lucky Root ${candidateScore.root} Energy` },
        luckImpact: { kn: impactKn, en: "Brings career success, wealth attraction, and prosperity." }
      });

      if (suggestions.length >= 3) break;
    }
  }

  // Fallback suggestion if none matched
  if (suggestions.length === 0) {
    suggestions.push({
      originalName: cleanOrigName,
      suggestedSpelling: `${cleanOrigName}A`,
      originalCompound: orig.compound,
      originalRoot: orig.root,
      suggestedCompound: orig.compound + 1,
      suggestedRoot: getSingleDigitRoot(orig.compound + 1),
      vibrationQuality: { kn: "✨ ಲಕ್ಷ್ಮೀ ಕೃಪಾ ಯೋಗ", en: "Auspicious Lakshmi Blessing" },
      luckImpact: { kn: "ಹೆಸರಿನ ತರಂಗಾಂತರ ಸರಿಪಡಿಸಿ ಅದೃಷ್ಟ ವೃದ್ಧಿಸುತ್ತದೆ.", en: "Corrects vibration for enhanced prosperity." }
    });
  }

  return suggestions;
}
