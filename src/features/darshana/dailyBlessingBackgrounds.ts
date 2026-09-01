/**
 * Baggona Panchanga - 365-Day Luxury Animated Vedic Background Artwork Engine
 * (೩೬೫ ದಿನಗಳ ನಿತ್ಯ ಶುಭೋದಯ ದೈವಿಕ ಆನಿಮೇಟೆಡ್ ಕಲಾ ಎಂಜಿನ್)
 * 
 * Combines ultra-high-definition photorealistic spiritual temple artworks with
 * rotating solar mandalas, glowing sunbeams, floating golden bokeh, and royal
 * Vedic jewel palettes designed for high-resolution WhatsApp poster sharing.
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
  posterImageUrl: string;
  motifs: {
    gopuramOpacity: number;
    haloOpacity: number;
    bokehCount: number;
    sunbeamAngle: number;
  };
}

// 7 Weekday Vedic Deity Royal Vivid Radiant Palettes with Photorealistic Masterpiece Artworks
const SACRED_DAY_PALETTES = [
  // 0: Sunday (Surya - Vibrant Royal Saffron Sunrise & Golden Amber over Gokarna)
  {
    themeName: "ಸೂರ್ಯ ತೇಜಸ್ಸು (Surya Tejas)",
    season: "ಉದಯ ಪ್ರಭೆ",
    gradientCss: "linear-gradient(180deg, rgba(92, 29, 2, 0.15) 0%, rgba(124, 45, 8, 0.30) 40%, rgba(36, 8, 0, 0.55) 100%)",
    accentGold: "#FDE047",
    borderGold: "#F59E0B",
    glowAura: "radial-gradient(circle at 50% 10%, rgba(253, 224, 71, 0.2) 0%, transparent 60%)",
    deityIcon: "☀️",
    posterImage: "/daily_posters/poster_0_surya.jpg"
  },
  // 1: Monday (Soma / Shiva - Mystic Gokarna Mahabaleshwara Twilight & Silver Dawn)
  {
    themeName: "ಶಿವ ಸಾನ್ನಿಧ್ಯ (Gokarna Shankara)",
    season: "ಪ್ರಶಾಂತ ಉದಯ",
    gradientCss: "linear-gradient(180deg, rgba(15, 33, 68, 0.15) 0%, rgba(26, 54, 104, 0.30) 40%, rgba(8, 15, 30, 0.55) 100%)",
    accentGold: "#BAE6FD",
    borderGold: "#38BDF8",
    glowAura: "radial-gradient(circle at 50% 10%, rgba(186, 230, 253, 0.2) 0%, transparent 60%)",
    deityIcon: "🔱",
    posterImage: "/daily_posters/poster_1_shiva.jpg"
  },
  // 2: Tuesday (Mangala / Kartikeya - Sacred Radiant Kumkuma & Golden Temple Dawn)
  {
    themeName: "ಮಂಗಳ ಪ್ರಭಾ (Karthikeya Kripa)",
    season: "ತೇಜೋಮಯ ಮುಂಜಾನೆ",
    gradientCss: "linear-gradient(180deg, rgba(89, 8, 27, 0.15) 0%, rgba(117, 18, 40, 0.30) 40%, rgba(33, 1, 8, 0.55) 100%)",
    accentGold: "#FECDD3",
    borderGold: "#FB7185",
    glowAura: "radial-gradient(circle at 50% 10%, rgba(254, 205, 211, 0.2) 0%, transparent 60%)",
    deityIcon: "🪔",
    posterImage: "/daily_posters/poster_2_karthikeya.jpg"
  },
  // 3: Wednesday (Budha / Vishnu - Vibrant Tulasi Emerald & Ancient Forest Temple)
  {
    themeName: "ತುಳಸಿ ಸಂಜೀವಿನಿ (Vishnu Anugraha)",
    season: "ಹರಿತ ಉದಯ",
    gradientCss: "linear-gradient(180deg, rgba(5, 61, 46, 0.15) 0%, rgba(8, 82, 62, 0.30) 40%, rgba(2, 27, 20, 0.55) 100%)",
    accentGold: "#A7F3D0",
    borderGold: "#10B981",
    glowAura: "radial-gradient(circle at 50% 10%, rgba(167, 243, 208, 0.2) 0%, transparent 60%)",
    deityIcon: "🌿",
    posterImage: "/daily_posters/poster_3_vishnu.jpg"
  },
  // 4: Thursday (Guru / Brihaspati - Sacred Royal Sandalwood Gold Temple Gopuram)
  {
    themeName: "ಗುರು ಕೃಪಾ (Brihaspati Sandalwood)",
    season: "ಪಾವನ ಮುಂಜಾನೆ",
    gradientCss: "linear-gradient(180deg, rgba(87, 42, 0, 0.15) 0%, rgba(120, 60, 0, 0.30) 40%, rgba(33, 16, 0, 0.55) 100%)",
    accentGold: "#FEF08A",
    borderGold: "#EAB308",
    glowAura: "radial-gradient(circle at 50% 10%, rgba(254, 240, 138, 0.2) 0%, transparent 60%)",
    deityIcon: "📿",
    posterImage: "/daily_posters/poster_4_guru.jpg"
  },
  // 5: Friday (Shukra / Mahalakshmi - Sacred Pink Lotus Kalyani Lake & Floating Diyas)
  {
    themeName: "ಮಹಾಲಕ್ಷ್ಮಿ ಸನ್ನಿಧಿ (Mahalakshmi Lotus)",
    season: "ಮಂಗಳಕರ ಉದಯ",
    gradientCss: "linear-gradient(180deg, rgba(92, 8, 66, 0.15) 0%, rgba(122, 18, 88, 0.30) 40%, rgba(36, 1, 25, 0.55) 100%)",
    accentGold: "#FBCFE8",
    borderGold: "#F472B6",
    glowAura: "radial-gradient(circle at 50% 10%, rgba(251, 207, 232, 0.2) 0%, transparent 60%)",
    deityIcon: "🪷",
    posterImage: "/daily_posters/poster_5_mahalakshmi.jpg"
  },
  // 6: Saturday (Shani / Hanuman - Deep Celestial Hilltop Temple Golden Dawn)
  {
    themeName: "ಆಂಜನೇಯ ರಕ್ಷಾ (Hanuman Raksha)",
    season: "ಅಮೃತ ಮುಂಜಾನೆ",
    gradientCss: "linear-gradient(180deg, rgba(28, 25, 72, 0.15) 0%, rgba(41, 36, 104, 0.30) 40%, rgba(11, 10, 31, 0.55) 100%)",
    accentGold: "#FDE68A",
    borderGold: "#F59E0B",
    glowAura: "radial-gradient(circle at 50% 10%, rgba(253, 230, 138, 0.2) 0%, transparent 60%)",
    deityIcon: "🕉️",
    posterImage: "/daily_posters/poster_6_hanuman.jpg"
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
  const haloOpacity = 0.25 + ((safeDay % 10) * 0.01);
  const gopuramOpacity = 0.20 + ((safeDay % 8) * 0.01);
  const bokehCount = 8 + (safeDay % 6);

  return {
    dayOfYear: safeDay,
    seasonName: palette.season,
    themeName: palette.themeName,
    gradientCss: palette.gradientCss,
    accentGold: palette.accentGold,
    borderGold: palette.borderGold,
    glowAura: palette.glowAura,
    deityIcon: palette.deityIcon,
    posterImageUrl: palette.posterImage,
    motifs: {
      gopuramOpacity,
      haloOpacity,
      bokehCount,
      sunbeamAngle
    }
  };
}

/**
 * Renders an inline, interactive, animated SVG atmospheric overlay with sacred geometries
 * Lightweight and transparent so that the photographic artwork shines through 100% clearly.
 */
export function renderDailyVedicSvgBackground(config: DailyBackgroundConfig): string {
  const { accentGold, motifs } = config;
  const { haloOpacity, sunbeamAngle, bokehCount } = motifs;

  // Delicate Radiant Golden Sunbeams
  const sunbeamLines = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i * 45 + sunbeamAngle) * (Math.PI / 180);
    const x2 = 300 + Math.cos(angle) * 360;
    const y2 = 80 + Math.sin(angle) * 360;
    return `<line x1="300" y1="80" x2="${x2}" y2="${y2}" stroke="${accentGold}" stroke-width="1.5" stroke-dasharray="8 12" opacity="0.18"/>`;
  }).join("\n");

  // Floating Golden Sparkle Orbs
  const bokehCircles = Array.from({ length: bokehCount }).map((_, i) => {
    const cx = (i * 67 + 35) % 560 + 20;
    const cy = (i * 83 + 80) % 650 + 50;
    const r = 2 + (i % 3) * 1.2;
    const op = 0.20 + (i % 4) * 0.06;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${accentGold}" opacity="${op}"/>`;
  }).join("\n");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 780" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style="position: absolute; inset: 0; pointer-events: none; z-index: 1;">
      <defs>
        <radialGradient id="sunGlow_${config.dayOfYear}" cx="50%" cy="10%" r="50%">
          <stop offset="0%" stop-color="${accentGold}" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="${accentGold}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="300" cy="80" r="280" fill="url(#sunGlow_${config.dayOfYear})"/>
      <!-- 1. Sacred Sunbeams -->
      <g>
        ${sunbeamLines}
      </g>

      <!-- 2. Rotating Sacred Mandala Concentric Rings -->
      <g transform="translate(300, 80)">
        <circle cx="0" cy="0" r="95" stroke="${accentGold}" stroke-width="1.2" stroke-dasharray="6 6" fill="none" opacity="${haloOpacity * 0.8}"/>
        <circle cx="0" cy="0" r="145" stroke="${accentGold}" stroke-width="1.0" stroke-dasharray="10 8" fill="none" opacity="${haloOpacity * 0.6}"/>
      </g>

      <!-- 3. Floating Golden Sparkle Orbs -->
      <g>
        ${bokehCircles}
      </g>

      <!-- 4. Royal Ornamental Corner Filigree -->
      <g stroke="${accentGold}" stroke-width="1.5" fill="none" opacity="0.65">
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
