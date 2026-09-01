/**
 * Baggona Panchanga - 365-Day Luxury Animated Vedic Background Artwork Engine
 * (೩೬೫ ದಿನಗಳ ನಿತ್ಯ ಶುಭೋದಯ ದೈವಿಕ ಆನಿಮೇಟೆಡ್ ಕಲಾ ಎಂಜಿನ್)
 * 
 * Generates deterministic, vibrant, animated morning temple backgrounds
 * with rotating solar mandalas, glowing sunbeams, floating golden bokeh,
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

// 7 Weekday Vedic Deity Royal Vivid Radiant Palettes (Warm, vibrant, non-dull morning aesthetics)
const SACRED_DAY_PALETTES = [
  // 0: Sunday (Surya - Vibrant Royal Saffron Sunrise & Golden Amber)
  {
    themeName: "ಸೂರ್ಯ ತೇಜಸ್ಸು (Surya Tejas)",
    season: "ಉದಯ ಪ್ರಭೆ",
    gradientCss: "linear-gradient(180deg, #5C1D02 0%, #7C2D08 25%, #451503 65%, #240800 100%)",
    accentGold: "#FDE047",
    borderGold: "#F59E0B",
    glowAura: "radial-gradient(circle at 50% 10%, rgba(253, 224, 71, 0.45) 0%, rgba(245, 158, 11, 0.25) 35%, rgba(180, 83, 9, 0.1) 60%, transparent 80%)",
    deityIcon: "☀️"
  },
  // 1: Monday (Soma / Shiva - Mystic Gokarna Azure Twilight & Silver Dawn)
  {
    themeName: "ಶಿವ ಸಾನ್ನಿಧ್ಯ (Gokarna Shankara)",
    season: "ಪ್ರಶಾಂತ ಉದಯ",
    gradientCss: "linear-gradient(180deg, #0F2144 0%, #1A3668 25%, #102142 65%, #080F1E 100%)",
    accentGold: "#BAE6FD",
    borderGold: "#38BDF8",
    glowAura: "radial-gradient(circle at 50% 10%, rgba(186, 230, 253, 0.4) 0%, rgba(56, 189, 248, 0.22) 35%, rgba(14, 116, 144, 0.1) 60%, transparent 80%)",
    deityIcon: "🔱"
  },
  // 2: Tuesday (Mangala / Kartikeya - Sacred Radiant Kumkuma & Amber)
  {
    themeName: "ಮಂಗಳ ಪ್ರಭಾ (Karthikeya Kripa)",
    season: "ತೇಜೋಮಯ ಮುಂಜಾನೆ",
    gradientCss: "linear-gradient(180deg, #59081B 0%, #751228 25%, #420614 65%, #210108 100%)",
    accentGold: "#FECDD3",
    borderGold: "#FB7185",
    glowAura: "radial-gradient(circle at 50% 10%, rgba(254, 205, 211, 0.42) 0%, rgba(251, 113, 133, 0.24) 35%, rgba(190, 18, 60, 0.1) 60%, transparent 80%)",
    deityIcon: "🪔"
  },
  // 3: Wednesday (Budha / Vishnu - Vibrant Tulasi Emerald & Golden Sanjeevini)
  {
    themeName: "ತುಳಸಿ ಸಂಜೀವಿನಿ (Vishnu Anugraha)",
    season: "ಹರಿತ ಉದಯ",
    gradientCss: "linear-gradient(180deg, #053D2E 0%, #08523E 25%, #043326 65%, #021B14 100%)",
    accentGold: "#A7F3D0",
    borderGold: "#10B981",
    glowAura: "radial-gradient(circle at 50% 10%, rgba(167, 243, 208, 0.4) 0%, rgba(52, 211, 153, 0.22) 35%, rgba(5, 150, 105, 0.1) 60%, transparent 80%)",
    deityIcon: "🌿"
  },
  // 4: Thursday (Guru / Brihaspati - Sacred Royal Sandalwood Gold)
  {
    themeName: "ಗುರು ಕೃಪಾ (Brihaspati Sandalwood)",
    season: "ಪಾವನ ಮುಂಜಾನೆ",
    gradientCss: "linear-gradient(180deg, #572A00 0%, #783C00 25%, #422000 65%, #211000 100%)",
    accentGold: "#FEF08A",
    borderGold: "#EAB308",
    glowAura: "radial-gradient(circle at 50% 10%, rgba(254, 240, 138, 0.45) 0%, rgba(250, 204, 21, 0.25) 35%, rgba(161, 98, 7, 0.1) 60%, transparent 80%)",
    deityIcon: "📿"
  },
  // 5: Friday (Shukra / Mahalakshmi - Royal Lotus Rose & Auspicious Magenta)
  {
    themeName: "ಮಹಾಲಕ್ಷ್ಮಿ ಸನ್ನಿಧಿ (Mahalakshmi Lotus)",
    season: "ಮಂಗಳಕರ ಉದಯ",
    gradientCss: "linear-gradient(180deg, #5C0842 0%, #7A1258 25%, #450531 65%, #240119 100%)",
    accentGold: "#FBCFE8",
    borderGold: "#F472B6",
    glowAura: "radial-gradient(circle at 50% 10%, rgba(251, 207, 232, 0.42) 0%, rgba(244, 114, 182, 0.24) 35%, rgba(190, 24, 93, 0.1) 60%, transparent 80%)",
    deityIcon: "🪷"
  },
  // 6: Saturday (Shani / Hanuman - Deep Celestial Indigo & Amber Radiant Dawn)
  {
    themeName: "ಆಂಜನೇಯ ರಕ್ಷಾ (Hanuman Raksha)",
    season: "ಅಮೃತ ಮುಂಜಾನೆ",
    gradientCss: "linear-gradient(180deg, #1C1948 0%, #292468 25%, #18153E 65%, #0B0A1F 100%)",
    accentGold: "#FDE68A",
    borderGold: "#F59E0B",
    glowAura: "radial-gradient(circle at 50% 10%, rgba(253, 230, 138, 0.42) 0%, rgba(245, 158, 11, 0.24) 35%, rgba(180, 83, 9, 0.1) 60%, transparent 80%)",
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

  // Micro-variations for 365-day uniqueness
  const sunbeamAngle = (safeDay * 19) % 360;
  const haloOpacity = 0.28 + ((safeDay % 10) * 0.015);
  const gopuramOpacity = 0.20 + ((safeDay % 8) * 0.015);
  const bokehCount = 10 + (safeDay % 8);

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
 * Renders an inline, interactive, animated SVG atmospheric overlay
 */
export function renderDailyVedicSvgBackground(config: DailyBackgroundConfig): string {
  const { accentGold, motifs } = config;
  const { haloOpacity, gopuramOpacity, sunbeamAngle, bokehCount } = motifs;

  // 12 Radiant Golden Sunbeams
  const sunbeamLines = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30 + sunbeamAngle) * (Math.PI / 180);
    const x2 = 300 + Math.cos(angle) * 380;
    const y2 = 80 + Math.sin(angle) * 380;
    return `<line x1="300" y1="80" x2="${x2}" y2="${y2}" stroke="${accentGold}" stroke-width="2" stroke-dasharray="10 14" opacity="0.25"/>`;
  }).join("\n");

  // Floating Golden Bokeh Orbs
  const bokehCircles = Array.from({ length: bokehCount }).map((_, i) => {
    const cx = (i * 59 + 35) % 560 + 20;
    const cy = (i * 73 + 80) % 650 + 50;
    const r = 2.5 + (i % 4) * 1.5;
    const op = 0.25 + (i % 5) * 0.08;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${accentGold}" opacity="${op}"/>`;
  }).join("\n");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 780" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style="position: absolute; inset: 0; pointer-events: none; z-index: 0;">
      <defs>
        <!-- Vibrant Radiant Morning Glow -->
        <radialGradient id="morningGlow_${config.dayOfYear}" cx="50%" cy="10%" r="65%">
          <stop offset="0%" stop-color="${accentGold}" stop-opacity="0.55"/>
          <stop offset="30%" stop-color="${accentGold}" stop-opacity="0.25"/>
          <stop offset="65%" stop-color="${accentGold}" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>

        <!-- Golden Sparkle Gradient -->
        <radialGradient id="sparkleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="${accentGold}" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="${accentGold}" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- 1. Ambient Morning Sun Core & Aura -->
      <circle cx="300" cy="80" r="320" fill="url(#morningGlow_${config.dayOfYear})"/>
      <circle cx="300" cy="80" r="45" fill="${accentGold}" opacity="0.45"/>
      <circle cx="300" cy="80" r="28" fill="#FFFFFF" opacity="0.85"/>

      <!-- 2. Sacred Sunbeams -->
      <g>
        ${sunbeamLines}
      </g>

      <!-- 3. Rotating Sacred Mandala & Gayatri Concentric Rings -->
      <g transform="translate(300, 80)">
        <circle cx="0" cy="0" r="95" stroke="${accentGold}" stroke-width="1.8" stroke-dasharray="8 6" fill="none" opacity="${haloOpacity * 1.3}"/>
        <circle cx="0" cy="0" r="145" stroke="${accentGold}" stroke-width="1.2" stroke-dasharray="14 8 4 8" fill="none" opacity="${haloOpacity}"/>
        <circle cx="0" cy="0" r="195" stroke="${accentGold}" stroke-width="0.8" stroke-dasharray="4 6" fill="none" opacity="${haloOpacity * 0.7}"/>
      </g>

      <!-- 4. Floating Golden Sparkle Orbs -->
      <g>
        ${bokehCircles}
      </g>

      <!-- 5. Majestic Gokarna Temple Gopuram & Spires -->
      <g opacity="${gopuramOpacity}" fill="${accentGold}">
        <!-- Central Temple Spire -->
        <path d="M 292,570 L 300,510 L 308,570 L 325,615 L 275,615 Z"/>
        <path d="M 265,615 L 335,615 L 345,675 L 255,675 Z"/>
        <!-- Golden Kalasha Finial -->
        <circle cx="300" cy="502" r="5" fill="#FFFFFF"/>
        <line x1="300" y1="497" x2="300" y2="488" stroke="#FFFFFF" stroke-width="2.5"/>
        <!-- Flanking Holy Gopurams -->
        <path d="M 155,640 L 165,585 L 175,640 L 188,695 L 142,695 Z"/>
        <path d="M 425,640 L 435,585 L 445,640 L 458,695 L 412,695 Z"/>
      </g>

      <!-- 6. Royal Ornamental Corner Filigree -->
      <g stroke="${accentGold}" stroke-width="1.6" fill="none" opacity="0.65">
        <!-- Top Left -->
        <path d="M 16,36 L 36,16 L 65,16 M 16,36 L 16,65"/>
        <circle cx="28" cy="28" r="3" fill="${accentGold}"/>
        <!-- Top Right -->
        <path d="M 584,36 L 564,16 L 535,16 M 584,36 L 584,65"/>
        <circle cx="572" cy="28" r="3" fill="${accentGold}"/>
        <!-- Bottom Left -->
        <path d="M 16,744 L 36,764 L 65,764 M 16,744 L 16,715"/>
        <circle cx="28" cy="752" r="3" fill="${accentGold}"/>
        <!-- Bottom Right -->
        <path d="M 584,744 L 564,764 L 535,764 M 584,744 L 584,715"/>
        <circle cx="572" cy="752" r="3" fill="${accentGold}"/>
      </g>
    </svg>
  `;
}
