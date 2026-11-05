/**
 * Baggona Panchanga Astrology - Offline International Cities & Postal Codes Database
 * Comprehensive offline catalog covering 100+ top global metropolitan cities,
 * NRI hubs, and diaspora centers across North America, Europe, Middle East,
 * Asia-Pacific, Africa, and Australia.
 *
 * Guarantees high-precision geocoding and determinism for international devotee charts.
 */

export interface InternationalCityEntry {
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  postalCode?: string;
  aliases?: string[];
}

export const OFFLINE_INTERNATIONAL_CITIES: InternationalCityEntry[] = [
  // ==========================================
  // 1. UNITED STATES (US)
  // ==========================================
  { name: "New York", country: "United States", countryCode: "US", lat: 40.7128, lng: -74.0060, postalCode: "10001", aliases: ["nyc", "new york city", "manhattan", "brooklyn", "queens"] },
  { name: "Los Angeles", country: "United States", countryCode: "US", lat: 34.0522, lng: -118.2437, postalCode: "90001", aliases: ["la", "hollywood", "long beach"] },
  { name: "Chicago", country: "United States", countryCode: "US", lat: 41.8781, lng: -87.6298, postalCode: "60601", aliases: ["windy city"] },
  { name: "Houston", country: "United States", countryCode: "US", lat: 29.7604, lng: -95.3698, postalCode: "77001" },
  { name: "San Francisco", country: "United States", countryCode: "US", lat: 37.7749, lng: -122.4194, postalCode: "94102", aliases: ["sf", "bay area", "frisco"] },
  { name: "San Jose", country: "United States", countryCode: "US", lat: 37.3382, lng: -121.8863, postalCode: "95113", aliases: ["silicon valley"] },
  { name: "Seattle", country: "United States", countryCode: "US", lat: 47.6062, lng: -122.3321, postalCode: "98101", aliases: ["bellevue", "redmond"] },
  { name: "Boston", country: "United States", countryCode: "US", lat: 42.3601, lng: -71.0589, postalCode: "02108", aliases: ["cambridge ma"] },
  { name: "Dallas", country: "United States", countryCode: "US", lat: 32.7767, lng: -96.7970, postalCode: "75201", aliases: ["dallas-fort worth", "dfw", "plano", "frisco tx", "irving"] },
  { name: "Austin", country: "United States", countryCode: "US", lat: 30.2672, lng: -97.7431, postalCode: "78701" },
  { name: "Atlanta", country: "United States", countryCode: "US", lat: 33.7490, lng: -84.3880, postalCode: "30301", aliases: ["alpharetta"] },
  { name: "Miami", country: "United States", countryCode: "US", lat: 25.7617, lng: -80.1918, postalCode: "33101" },
  { name: "Washington DC", country: "United States", countryCode: "US", lat: 38.9072, lng: -77.0369, postalCode: "20001", aliases: ["washington", "dc", "district of columbia"] },
  { name: "Philadelphia", country: "United States", countryCode: "US", lat: 39.9526, lng: -75.1652, postalCode: "19102", aliases: ["philly"] },
  { name: "Phoenix", country: "United States", countryCode: "US", lat: 33.4484, lng: -112.0740, postalCode: "85001", aliases: ["scottsdale", "tempe", "chandler"] },
  { name: "San Diego", country: "United States", countryCode: "US", lat: 32.7157, lng: -117.1611, postalCode: "92101" },
  { name: "Denver", country: "United States", countryCode: "US", lat: 39.7392, lng: -104.9903, postalCode: "80202" },
  { name: "Detroit", country: "United States", countryCode: "US", lat: 42.3314, lng: -83.0458, postalCode: "48201", aliases: ["troy mi"] },
  { name: "Minneapolis", country: "United States", countryCode: "US", lat: 44.9778, lng: -93.2650, postalCode: "55401", aliases: ["twin cities", "saint paul"] },
  { name: "Jersey City", country: "United States", countryCode: "US", lat: 40.7178, lng: -74.0431, postalCode: "07302", aliases: ["edison nj", "newark nj", "central jersey"] },
  { name: "Fremont", country: "United States", countryCode: "US", lat: 37.5485, lng: -121.9886, postalCode: "94538", aliases: ["sunnyvale", "santa clara", "cupertino"] },
  { name: "Portland", country: "United States", countryCode: "US", lat: 45.5152, lng: -122.6784, postalCode: "97201" },
  { name: "Charlotte", country: "United States", countryCode: "US", lat: 35.2271, lng: -80.8431, postalCode: "28202" },
  { name: "Raleigh", country: "United States", countryCode: "US", lat: 35.7796, lng: -78.6382, postalCode: "27601", aliases: ["rtp", "cary nc", "durham nc"] },

  // ==========================================
  // 2. UNITED KINGDOM (UK)
  // ==========================================
  { name: "London", country: "United Kingdom", countryCode: "GB", lat: 51.5074, lng: -0.1278, postalCode: "SW1A 1AA", aliases: ["greater london", "city of london", "wembley", "croydon", "harrow", "hounslow"] },
  { name: "Birmingham", country: "United Kingdom", countryCode: "GB", lat: 52.4862, lng: -1.8904, postalCode: "B1 1AA" },
  { name: "Manchester", country: "United Kingdom", countryCode: "GB", lat: 53.4808, lng: -2.2426, postalCode: "M1 1AA", aliases: ["greater manchester"] },
  { name: "Glasgow", country: "United Kingdom", countryCode: "GB", lat: 55.8642, lng: -4.2518, postalCode: "G1 1AA" },
  { name: "Edinburgh", country: "United Kingdom", countryCode: "GB", lat: 55.9533, lng: -3.1883, postalCode: "EH1 1AA" },
  { name: "Leeds", country: "United Kingdom", countryCode: "GB", lat: 53.8008, lng: -1.5491, postalCode: "LS1 1AA" },
  { name: "Liverpool", country: "United Kingdom", countryCode: "GB", lat: 53.4084, lng: -2.9916, postalCode: "L1 1AA" },
  { name: "Leicester", country: "United Kingdom", countryCode: "GB", lat: 52.6369, lng: -1.1398, postalCode: "LE1 1AA" },
  { name: "Bristol", country: "United Kingdom", countryCode: "GB", lat: 51.4545, lng: -2.5879, postalCode: "BS1 1AA" },
  { name: "Newcastle", country: "United Kingdom", countryCode: "GB", lat: 54.9783, lng: -1.6178, postalCode: "NE1 1AA", aliases: ["newcastle upon tyne"] },
  { name: "Cardiff", country: "United Kingdom", countryCode: "GB", lat: 51.4816, lng: -3.1791, postalCode: "CF10 1AA" },
  { name: "Belfast", country: "United Kingdom", countryCode: "GB", lat: 54.5973, lng: -5.9301, postalCode: "BT1 1AA" },

  // ==========================================
  // 3. UNITED ARAB EMIRATES & MIDDLE EAST (UAE/GCC)
  // ==========================================
  { name: "Dubai", country: "United Arab Emirates", countryCode: "AE", lat: 25.2048, lng: 55.2708, aliases: ["bur dubai", "deira", "downtown dubai", "marina dubai"] },
  { name: "Abu Dhabi", country: "United Arab Emirates", countryCode: "AE", lat: 24.4539, lng: 54.3773, aliases: ["abu dhabi city", "al ain"] },
  { name: "Sharjah", country: "United Arab Emirates", countryCode: "AE", lat: 25.3463, lng: 55.4209 },
  { name: "Ajman", country: "United Arab Emirates", countryCode: "AE", lat: 25.4052, lng: 55.5136 },
  { name: "Ras Al Khaimah", country: "United Arab Emirates", countryCode: "AE", lat: 25.7895, lng: 55.9432, aliases: ["rak"] },
  { name: "Doha", country: "Qatar", countryCode: "QA", lat: 25.2854, lng: 51.5310 },
  { name: "Riyadh", country: "Saudi Arabia", countryCode: "SA", lat: 24.7136, lng: 46.6753 },
  { name: "Jeddah", country: "Saudi Arabia", countryCode: "SA", lat: 21.4858, lng: 39.1925 },
  { name: "Dammam", country: "Saudi Arabia", countryCode: "SA", lat: 26.4207, lng: 50.0888, aliases: ["al khobar", "dhahran"] },
  { name: "Kuwait City", country: "Kuwait", countryCode: "KW", lat: 29.3759, lng: 47.9774, aliases: ["kuwait"] },
  { name: "Muscat", country: "Oman", countryCode: "OM", lat: 23.5880, lng: 58.3829 },
  { name: "Manama", country: "Bahrain", countryCode: "BH", lat: 26.2285, lng: 50.5860, aliases: ["bahrain"] },

  // ==========================================
  // 4. CANADA (CA)
  // ==========================================
  { name: "Toronto", country: "Canada", countryCode: "CA", lat: 43.6532, lng: -79.3832, postalCode: "M5H 2N2", aliases: ["gta", "mississauga", "brampton", "scarborough", "markham"] },
  { name: "Vancouver", country: "Canada", countryCode: "CA", lat: 49.2827, lng: -123.1207, postalCode: "V6B 1A1", aliases: ["surrey bc", "burnaby", "richmond bc"] },
  { name: "Montreal", country: "Canada", countryCode: "CA", lat: 45.5017, lng: -73.5673, postalCode: "H2Y 1C6" },
  { name: "Calgary", country: "Canada", countryCode: "CA", lat: 51.0447, lng: -114.0719, postalCode: "T2P 1J9" },
  { name: "Ottawa", country: "Canada", countryCode: "CA", lat: 45.4215, lng: -75.6972, postalCode: "K1P 1J1" },
  { name: "Edmonton", country: "Canada", countryCode: "CA", lat: 53.5461, lng: -113.4938, postalCode: "T5J 0N3" },
  { name: "Winnipeg", country: "Canada", countryCode: "CA", lat: 49.8951, lng: -97.1384, postalCode: "R3C 0A1" },

  // ==========================================
  // 5. EUROPE (EU)
  // ==========================================
  { name: "Paris", country: "France", countryCode: "FR", lat: 48.8566, lng: 2.3522, postalCode: "75001", aliases: ["ile-de-france"] },
  { name: "Amsterdam", country: "Netherlands", countryCode: "NL", lat: 52.3676, lng: 4.9041, postalCode: "1012", aliases: ["amstelveen", "holland"] },
  { name: "Rotterdam", country: "Netherlands", countryCode: "NL", lat: 51.9244, lng: 4.4777, postalCode: "3011" },
  { name: "The Hague", country: "Netherlands", countryCode: "NL", lat: 52.0705, lng: 4.3007, postalCode: "2511", aliases: ["den haag"] },
  { name: "Zurich", country: "Switzerland", countryCode: "CH", lat: 47.3769, lng: 8.5417, postalCode: "8001", aliases: ["zürich"] },
  { name: "Geneva", country: "Switzerland", countryCode: "CH", lat: 46.2044, lng: 6.1432, postalCode: "1201", aliases: ["genève"] },
  { name: "Basel", country: "Switzerland", countryCode: "CH", lat: 47.5596, lng: 7.5886, postalCode: "4001" },
  { name: "Bern", country: "Switzerland", countryCode: "CH", lat: 46.9480, lng: 7.4474, postalCode: "3011" },
  { name: "Dublin", country: "Ireland", countryCode: "IE", lat: 53.3498, lng: -6.2603, postalCode: "D01", aliases: ["baile atha cliath"] },
  { name: "Rome", country: "Italy", countryCode: "IT", lat: 41.9028, lng: 12.4964, postalCode: "00185", aliases: ["roma"] },
  { name: "Milan", country: "Italy", countryCode: "IT", lat: 45.4642, lng: 9.1900, postalCode: "20121", aliases: ["milano"] },
  { name: "Madrid", country: "Spain", countryCode: "ES", lat: 40.4168, lng: -3.7038, postalCode: "28001" },
  { name: "Barcelona", country: "Spain", countryCode: "ES", lat: 41.3879, lng: 2.1699, postalCode: "08001", aliases: ["catalonia"] },
  { name: "Vienna", country: "Austria", countryCode: "AT", lat: 48.2082, lng: 16.3738, postalCode: "1010", aliases: ["wien"] },
  { name: "Brussels", country: "Belgium", countryCode: "BE", lat: 50.8503, lng: 4.3517, postalCode: "1000", aliases: ["bruxelles"] },
  { name: "Stockholm", country: "Sweden", countryCode: "SE", lat: 59.3293, lng: 18.0686, postalCode: "111 20" },
  { name: "Oslo", country: "Norway", countryCode: "NO", lat: 59.9139, lng: 10.7522, postalCode: "0150" },
  { name: "Copenhagen", country: "Denmark", countryCode: "DK", lat: 55.6761, lng: 12.5683, postalCode: "1050", aliases: ["københavn"] },
  { name: "Helsinki", country: "Finland", countryCode: "FI", lat: 60.1699, lng: 24.9384, postalCode: "00100" },
  { name: "Warsaw", country: "Poland", countryCode: "PL", lat: 52.2297, lng: 21.0122, postalCode: "00-001", aliases: ["warszawa"] },
  { name: "Prague", country: "Czech Republic", countryCode: "CZ", lat: 50.0755, lng: 14.4378, postalCode: "110 00", aliases: ["praha"] },
  { name: "Budapest", country: "Hungary", countryCode: "HU", lat: 47.4979, lng: 19.0402, postalCode: "1011" },
  { name: "Athens", country: "Greece", countryCode: "GR", lat: 37.9838, lng: 23.7275, postalCode: "104 31", aliases: ["athina"] },
  { name: "Lisbon", country: "Portugal", countryCode: "PT", lat: 38.7223, lng: -9.1393, postalCode: "1100-001", aliases: ["lisboa"] },

  // ==========================================
  // 6. ASIA-PACIFIC & OCEANIA (APAC)
  // ==========================================
  { name: "Singapore", country: "Singapore", countryCode: "SG", lat: 1.3521, lng: 103.8198, postalCode: "018989", aliases: ["lion city", "jurong", "little india sg"] },
  { name: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", lat: 3.1390, lng: 101.6869, postalCode: "50000", aliases: ["kl", "petaling jaya", "brickfields"] },
  { name: "Penang", country: "Malaysia", countryCode: "MY", lat: 5.4164, lng: 100.3327, postalCode: "10000", aliases: ["george town"] },
  { name: "Bangkok", country: "Thailand", countryCode: "TH", lat: 13.7563, lng: 100.5018, postalCode: "10200", aliases: ["krung thep"] },
  { name: "Tokyo", country: "Japan", countryCode: "JP", lat: 35.6762, lng: 139.6503, postalCode: "100-0001", aliases: ["shinjuku", "shibuya", "chiyoda"] },
  { name: "Osaka", country: "Japan", countryCode: "JP", lat: 34.6937, lng: 135.5023, postalCode: "530-0001" },
  { name: "Seoul", country: "South Korea", countryCode: "KR", lat: 37.5665, lng: 126.9780, postalCode: "04524", aliases: ["gangnam"] },
  { name: "Hong Kong", country: "Hong Kong", countryCode: "HK", lat: 22.3193, lng: 114.1694, aliases: ["hk", "kowloon"] },
  { name: "Taipei", country: "Taiwan", countryCode: "TW", lat: 25.0330, lng: 121.5654, postalCode: "100" },
  { name: "Jakarta", country: "Indonesia", countryCode: "ID", lat: -6.2088, lng: 106.8456, postalCode: "10110" },
  { name: "Bali", country: "Indonesia", countryCode: "ID", lat: -8.4095, lng: 115.1889, postalCode: "80111", aliases: ["denpasar", "ubud"] },
  { name: "Manila", country: "Philippines", countryCode: "PH", lat: 14.5995, lng: 120.9842, postalCode: "1000", aliases: ["metro manila", "makati"] },
  { name: "Sydney", country: "Australia", countryCode: "AU", lat: -33.8688, lng: 151.2093, postalCode: "2000", aliases: ["nsw", "parramatta", "strathfield", "blacktown"] },
  { name: "Melbourne", country: "Australia", countryCode: "AU", lat: -37.8136, lng: 144.9631, postalCode: "3000", aliases: ["victoria au", "dandenong", "tarneit"] },
  { name: "Brisbane", country: "Australia", countryCode: "AU", lat: -27.4698, lng: 153.0251, postalCode: "4000", aliases: ["queensland au"] },
  { name: "Perth", country: "Australia", countryCode: "AU", lat: -31.9505, lng: 115.8605, postalCode: "6000", aliases: ["western australia"] },
  { name: "Adelaide", country: "Australia", countryCode: "AU", lat: -34.9285, lng: 138.6007, postalCode: "5000" },
  { name: "Canberra", country: "Australia", countryCode: "AU", lat: -35.2809, lng: 149.1300, postalCode: "2601", aliases: ["act australia"] },
  { name: "Auckland", country: "New Zealand", countryCode: "NZ", lat: -36.8485, lng: 174.7633, postalCode: "1010", aliases: ["manukau"] },
  { name: "Wellington", country: "New Zealand", countryCode: "NZ", lat: -41.2865, lng: 174.7762, postalCode: "6011" },
  { name: "Christchurch", country: "New Zealand", countryCode: "NZ", lat: -43.5321, lng: 172.6362, postalCode: "8011" },

  // ==========================================
  // 7. AFRICA & OTHERS
  // ==========================================
  { name: "Johannesburg", country: "South Africa", countryCode: "ZA", lat: -26.2041, lng: 28.0473, postalCode: "2001", aliases: ["joburg", "sandton"] },
  { name: "Cape Town", country: "South Africa", countryCode: "ZA", lat: -33.9249, lng: 18.4241, postalCode: "8001" },
  { name: "Durban", country: "South Africa", countryCode: "ZA", lat: -29.8587, lng: 31.0218, postalCode: "4001" },
  { name: "Nairobi", country: "Kenya", countryCode: "KE", lat: -1.2921, lng: 36.8219, aliases: ["parklands nairobi"] },
  { name: "Port Louis", country: "Mauritius", countryCode: "MU", lat: -20.1609, lng: 57.5012, aliases: ["mauritius"] },
  { name: "Cairo", country: "Egypt", countryCode: "EG", lat: 30.0444, lng: 31.2357, postalCode: "11511" },
  { name: "Istanbul", country: "Turkey", countryCode: "TR", lat: 41.0082, lng: 28.9784, postalCode: "34000", aliases: ["constantinople"] },
  { name: "Colombo", country: "Sri Lanka", countryCode: "LK", lat: 6.9271, lng: 79.8612, postalCode: "00100" },
  { name: "Kathmandu", country: "Nepal", countryCode: "NP", lat: 27.7172, lng: 85.3240, postalCode: "44600", aliases: ["pashupatinath"] }
];

const INTL_CITY_MAP = new Map<string, InternationalCityEntry>();
const INTL_POSTAL_MAP = new Map<string, InternationalCityEntry>();

for (const city of OFFLINE_INTERNATIONAL_CITIES) {
  const normName = city.name.trim().toLowerCase();
  INTL_CITY_MAP.set(normName, city);

  if (city.postalCode) {
    INTL_POSTAL_MAP.set(city.postalCode.toLowerCase().replace(/\s+/g, ""), city);
  }

  if (city.aliases) {
    for (const a of city.aliases) {
      INTL_CITY_MAP.set(a.trim().toLowerCase(), city);
    }
  }
}

/**
 * Searches the offline International cities & postal codes database.
 */
export function findOfflineInternationalCity(query: string): InternationalCityEntry | undefined {
  if (!query) return undefined;
  const clean = query.trim().toLowerCase();
  const cleanNoSpaces = clean.replace(/\s+/g, "");

  // 1. Check postal code
  if (INTL_POSTAL_MAP.has(cleanNoSpaces)) {
    return INTL_POSTAL_MAP.get(cleanNoSpaces);
  }

  // 2. Direct exact name or alias lookup
  if (INTL_CITY_MAP.has(clean)) {
    return INTL_CITY_MAP.get(clean);
  }

  // 3. Strip country qualifiers like ", usa", ", united kingdom", ", uk", ", uae", ", canada", ", australia", etc.
  const stripped = clean
    .replace(/,\s*(usa|united states|uk|united kingdom|great britain|canada|australia|uae|united arab emirates|singapore|germany|france|netherlands|switzerland|ireland|new zealand|south africa|japan|malaysia)$/i, "")
    .replace(/\s+(city|metro|area|greater)$/i, "")
    .trim();

  if (INTL_CITY_MAP.has(stripped)) {
    return INTL_CITY_MAP.get(stripped);
  }

  // 4. Substring / token matching
  for (const [key, entry] of INTL_CITY_MAP.entries()) {
    if (stripped.length >= 4 && (stripped === key || stripped.startsWith(key + " ") || stripped.endsWith(" " + key))) {
      return entry;
    }
    if (key.length >= 5 && (key.startsWith(stripped + " ") || key.endsWith(" " + stripped))) {
      return entry;
    }
  }

  return undefined;
}

