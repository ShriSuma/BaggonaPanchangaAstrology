/**
 * Baggona Panchanga - 365-Day Luxury Vedic Background Artwork Engine
 * (೩೬೫ ದಿನಗಳ ನಿತ್ಯ ಶುಭೋದಯ ದೈವಿಕ ಹಿನ್ನೆಲೆ ಕಲಾ ಎಂಜಿನ್)
 * 
 * Generates deterministic, breathtaking, high-vibe morning temple backgrounds
 * with soft golden dawn rays, sacred Gokarna temple arches, floating bokeh dust,
 * and royal Vedic jewel palettes designed for high-resolution WhatsApp sharing.
 */

export interface DailyBackgroundConfig {
  dayOfYear: number;
  seasonName: string;
  themeName: string;
  gradientCss: string;
  accentGold: string;
  borderGold: string;
  glowAura: string;
  deityIcon: string;
  motifs: {
    gopuramOpacity: number;
    haloOpacity: number;
    bokehCount: number;
    sunbeamAngle: number;
  };
}

// 7 Weekday Vedic Deity Royal Color Systems
const SACRED_DAY_PALETTES = [
  // 0: Sunday (Surya - Royal Saffron Gold Dawn)
  {
    themeName: "ಸೂರ್ಯ ತೇಜಸ್ಸು (Surya Tejas)",
    season: "ಉದಯ ಪ್ರಭೆ",
    gradientCss: "linear-gradient(180deg, #381200 0%, #4D1A00 30%, #2A0C00 70%, #150500 100%)",
    accentGold: "#FBBF24",
    borderGold: "#F59E0B",
    glowAura: "radial-gradient(circle at 50% 12%, rgba(251, 191, 36, 0.28) 0%, rgba(217, 119, 6, 0.12) 45%, transparent 75%)",
    deityIcon: "☀️"
  },
  // 1: Monday (Soma / Shiva - Gokarna Chandramouleshwara Twilight)
  {
    themeName: "ಶಿವ ಸಾನ್ನಿಧ್ಯ (Gokarna Shankara)",
    season: "ಪ್ರಶಾಂತ ಉದಯ",
    gradientCss: "linear-gradient(180deg, #0A1428 0%, #142240 30%, #0D162C 70%, #050814 100%)",
    accentGold: "#7DD3FC",
    borderGold: "#38BDF8",
    glowAura: "radial-gradient(circle at 50% 12%, rgba(56, 189, 248, 0.24) 0%, rgba(14, 116, 144, 0.12) 45%, transparent 75%)",
    deityIcon: "🔱"
  },
  // 2: Tuesday (Mangala / Kartikeya - Sacred Kumkuma & Amber Dawn)
  {
    themeName: "ಮಂಗಳ ಪ್ರಭಾ (Karthikeya Kripa)",
    season: "ತೇಜೋಮಯ ಮುಂಜಾನೆ",
    gradientCss: "linear-gradient(180deg, #3A0512 0%, #4C0B1B 30%, #28030B 70%, #140105 100%)",
    accentGold: "#FDA4AF",
    borderGold: "#FB7185",
    glowAura: "radial-gradient(circle at 50% 12%, rgba(251, 113, 133, 0.25) 0%, rgba(190, 18, 60, 0.12) 45%, transparent 75%)",
    deityIcon: "🪔"
  },
  // 3: Wednesday (Budha / Vishnu - Tulasi & Emerald Sanjeevini)
  {
    themeName: "ತುಳಸಿ ಸಂಜೀವಿನಿ (Vishnu Anugraha)",
    season: "ಹರಿತ ಉದಯ",
    gradientCss: "linear-gradient(180deg, #02261C 0%, #043628 30%, #022017 70%, #01100C 100%)",
    accentGold: "#6EE7B7",
    borderGold: "#10B981",
    glowAura: "radial-gradient(circle at 50% 12%, rgba(52, 211, 153, 0.24) 0%, rgba(5, 150, 105, 0.12) 45%, transparent 75%)",
    deityIcon: "🌿"
  },
  // 4: Thursday (Guru / Brihaspati - Sacred Sandalwood & Turmeric)
  {
    themeName: "ಗುರು ಕೃಪಾ (Brihaspati Sandalwood)",
    season: "ಪಾವನ ಮುಂಜಾನೆ",
    gradientCss: "linear-gradient(180deg, #351A00 0%, #472400 30%, #291400 70%, #140900 100%)",
    accentGold: "#FDE047",
    borderGold: "#EAB308",
    glowAura: "radial-gradient(circle at 50% 12%, rgba(250, 204, 21, 0.28) 0%, rgba(161, 98, 7, 0.12) 45%, transparent 75%)",
    deityIcon: "📿"
  },
  // 5: Friday (Shukra / Mahalakshmi - Royal Lotus & Sannidhi Gold)
  {
    themeName: "ಮಹಾಲಕ್ಷ್ಮಿ ಸನ್ನಿಧಿ (Mahalakshmi Lotus)",
    season: "ಮಂಗಳಕರ ಉದಯ",
    gradientCss: "linear-gradient(180deg, #380226 0%, #4D0637 30%, #29011C 70%, #14000D 100%)",
    accentGold: "#F472B6",
    borderGold: "#EC4899",
    glowAura: "radial-gradient(circle at 50% 12%, rgba(244, 114, 182, 0.25) 0%, rgba(190, 24, 93, 0.12) 45%, transparent 75%)",
    deityIcon: "🪷"
  },
  // 6: Saturday (Shani / Hanuman - Deep Celestial Amber)
  {
    themeName: "ಆಂಜನೇಯ ರಕ್ಷಾ (Hanuman Raksha)",
    season: "ಅಮೃತ ಮುಂಜಾನೆ",
    gradientCss: "linear-gradient(180deg, #13112E 0%, #1E1B45 30%, #110E28 70%, #070614 100%)",
    accentGold: "#FCD34D",
    borderGold: "#F59E0B",
    glowAura: "radial-gradient(circle at 50% 12%, rgba(245, 158, 11, 0.26) 0%, rgba(180, 83, 9, 0.12) 45%, transparent 75%)",
    deityIcon: "🕉️"
  }
];

/**
 * Computes deterministic background configuration for any day of year (1-366)
 */
export function getDailyBackgroundConfig(dayOfYear: number): DailyBackgroundConfig {
  const safeDay = Math.max(1, Math.min(366, dayOfYear));
  const weekdayIndex = (safeDay - 1) % 7;
  const palette = SACRED_DAY_PALETTES[weekdayIndex];

  // Subtle daily micro-variations for 365-day uniqueness
  const sunbeamAngle = (safeDay * 19) % 360;
  const haloOpacity = 0.15 + ((safeDay % 10) * 0.01);
  const gopuramOpacity = 0.10 + ((safeDay % 8) * 0.01);
  const bokehCount = 6 + (safeDay % 7);

  return {
    dayOfYear: safeDay,
    seasonName: palette.season,
    themeName: palette.themeName,
    gradientCss: palette.gradientCss,
    accentGold: palette.accentGold,
    borderGold: palette.borderGold,
    glowAura: palette.glowAura,
    deityIcon: palette.deityIcon,
    motifs: {
      gopuramOpacity,
      haloOpacity,
      bokehCount,
      sunbeamAngle
    }
  };
}

/**
 * Renders an inline, elegant SVG atmospheric overlay with sacred temple arches and golden rays
 */
export function renderDailyVedicSvgBackground(config: DailyBackgroundConfig): string {
  const { accentGold, motifs } = config;
  const { haloOpacity, gopuramOpacity, sunbeamAngle } = motifs;

  // Soft radiant sunbeam lines
  const sunbeamLines = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i * 45 + sunbeamAngle) * (Math.PI / 180);
    const x2 = 300 + Math.cos(angle) * 320;
    const y2 = 80 + Math.sin(angle) * 320;
    return `<line x1="300" y1="80" x2="${x2}" y2="${y2}" stroke="${accentGold}" stroke-width="1.5" stroke-dasharray="8 12" opacity="0.12"/>`;
  }).join("\n");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 780" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style="position: absolute; inset: 0; pointer-events: none; z-index: 0;">
      <defs>
        <!-- Soft Radial Morning Glow -->
        <radialGradient id="morningGlow_${config.dayOfYear}" cx="50%" cy="10%" r="60%">
          <stop offset="0%" stop-color="${accentGold}" stop-opacity="0.28"/>
          <stop offset="40%" stop-color="${accentGold}" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>

        <!-- Temple Spire Pattern -->
        <pattern id="sacredCornerPattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1.5" fill="${accentGold}" opacity="0.15"/>
        </pattern>
      </defs>

      <!-- 1. Ambient Top Morning Sunlight Disk Glow -->
      <circle cx="300" cy="80" r="280" fill="url(#morningGlow_${config.dayOfYear})"/>

      <!-- 2. Sacred Sunbeams -->
      <g>
        ${sunbeamLines}
      </g>

      <!-- 3. Elegant Sacred Mandala Rings around the Morning Sun -->
      <g transform="translate(300, 80)">
        <circle cx="0" cy="0" r="120" stroke="${accentGold}" stroke-width="1" stroke-dasharray="6 6" fill="none" opacity="${haloOpacity}"/>
        <circle cx="0" cy="0" r="160" stroke="${accentGold}" stroke-width="0.8" stroke-dasharray="12 8 4 8" fill="none" opacity="${haloOpacity * 0.75}"/>
      </g>

      <!-- 4. Subtle Gokarna Sacred Temple Gopuram Silhouette in Bottom Background -->
      <g opacity="${gopuramOpacity}" fill="${accentGold}">
        <!-- Central Temple Spire -->
        <path d="M 295,580 L 300,530 L 305,580 L 320,620 L 280,620 Z"/>
        <path d="M 270,620 L 330,620 L 340,680 L 260,680 Z"/>
        <!-- Kalasha Finial -->
        <circle cx="300" cy="522" r="4"/>
        <line x1="300" y1="518" x2="300" y2="510" stroke="${accentGold}" stroke-width="2"/>
        <!-- Flanking Gopurams -->
        <path d="M 160,650 L 170,600 L 180,650 L 190,700 L 150,700 Z"/>
        <path d="M 420,650 L 430,600 L 440,650 L 450,700 L 410,700 Z"/>
      </g>

      <!-- 5. Ornamental Corner Flourishes -->
      <g stroke="${accentGold}" stroke-width="1.2" fill="none" opacity="0.4">
        <!-- Top Left -->
        <path d="M 20,40 L 40,20 L 60,20 M 20,40 L 20,60"/>
        <!-- Top Right -->
        <path d="M 580,40 L 560,20 L 540,20 M 580,40 L 580,60"/>
        <!-- Bottom Left -->
        <path d="M 20,740 L 40,760 L 60,760 M 20,740 L 20,720"/>
        <!-- Bottom Right -->
        <path d="M 580,740 L 560,760 L 540,760 M 580,740 L 580,720"/>
      </g>
    </svg>
  `;
}
