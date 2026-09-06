import states from "../data/india-states.json";
import districts from "../data/india-districts.json";
import villages from "../data/india-villages.json";
import { PINCODE_FALLBACK, staticVillagesByPincode } from "../data/pincodeFallback";
import { cacheGeocode, getGeocode } from "../db/indexedDb";

export type State = {
  code: string;
  name: string;
};

export type District = {
  code: string;
  stateCode: string;
  name: string;
};

export type Village = {
  name: string;
  districtCode: string;
  /** Present when resolved from pincode or derived from district. */
  stateCode?: string;
  lat: number;
  lng: number;
  pincode: string;
};

const REQUEST_TIMEOUT_MS = 8000;
const NOMINATIM_TIMEOUT_MS = 6000;
let lastNominatimCallMs = 0;

const withTimeout = async <T>(promise: Promise<T>, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Request timed out"));
    }, timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchStates = async (): Promise<State[]> => {
  return states as State[];
};

export const fetchDistricts = async (stateCode: string): Promise<District[]> => {
  return (districts as District[]).filter((district) => district.stateCode === stateCode);
};

const normTokens = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

const tokenOverlapScore = (a: string, b: string): number => {
  const A = new Set(normTokens(a));
  const B = new Set(normTokens(b));
  let score = 0;
  for (const x of A) {
    if (B.has(x)) score += 1;
  }
  return score;
};

const STATE_ALIASES: Record<string, string> = {
  tamilnadu: "TN",
  "tamil nadu": "TN",
  orissa: "OR",
  odisha: "OR",
  uttaranchal: "UT",
  uttarakhand: "UT",
  pondicherry: "PY",
  puducherry: "PY",
  "jammu & kashmir": "JK",
  "jammu and kashmir": "JK",
  "andaman & nicobar": "AN",
  "andaman & nicobar islands": "AN",
  "andaman and nicobar islands": "AN",
  "dadra & nagar haveli": "DN",
  "daman & diu": "DN",
  "dadra and nagar haveli and daman and diu": "DN",
  telengana: "TG",
  telangana: "TG",
  delhi: "DL",
  "new delhi": "DL",
  "nct of delhi": "DL",
  karnataka: "KA",
  maharashtra: "MH",
  kerala: "KL",
  "andhra pradesh": "AP",
  gujarat: "GJ",
  rajasthan: "RJ",
  "madhya pradesh": "MP",
  "west bengal": "WB",
  bengal: "WB",
  "uttar pradesh": "UP",
  bihar: "BR",
  punjab: "PB",
  haryana: "HR",
  assam: "AS",
  jharkhand: "JH",
  chhattisgarh: "CT",
  chattisgarh: "CT",
  goa: "GA",
  "himachal pradesh": "HP",
  tripura: "TR",
  manipur: "MN",
  meghalaya: "ML",
  nagaland: "NL",
  mizoram: "MZ",
  sikkim: "SK",
  "arunachal pradesh": "AR",
  chandigarh: "CH",
  ladakh: "LA",
  lakshadweep: "LD"
};

export const stateCodeFromPostalName = (postalStateName: string): string | undefined => {
  if (!postalStateName) return undefined;
  const raw = postalStateName.trim().toLowerCase();
  
  // Direct alias lookup
  if (STATE_ALIASES[raw]) return STATE_ALIASES[raw];

  // Check for ISO code pattern like "IN-TN"
  const isoMatch = postalStateName.trim().toUpperCase().match(/^IN-([A-Z]{2})$/);
  if (isoMatch) return isoMatch[1];

  for (const s of states as State[]) {
    if (s.name.toLowerCase() === raw || s.code.toLowerCase() === raw) return s.code;
  }
  return undefined;
};

/** Map India Post district label to our district list or create deterministic code for a state. */
export const findDistrictCodeForPostal = (stateCode: string, postalDistrict: string): string => {
  const dists = (districts as District[]).filter((d) => d.stateCode === stateCode);
  const pd = (postalDistrict || "").trim();
  const pdLower = pd.toLowerCase();

  if (stateCode === "KA" && (pdLower.includes("bangalore") || pdLower.includes("bengaluru"))) {
    const blr = dists.find((d) => d.code === "KA-BLR");
    if (blr) return blr.code;
  }
  if (
    stateCode === "KA" &&
    (pdLower.includes("uttara") || pdLower.includes("karwar") || pdLower.includes("kumta") || pdLower.includes("honnavar") || pdLower.includes("sirsi"))
  ) {
    const ukn = dists.find((d) => d.code === "KA-UKN");
    if (ukn) return ukn.code;
  }
  if (stateCode === "MH" && (pdLower.includes("mumbai") || pdLower.includes("thane") || pdLower.includes("navi mumbai"))) {
    const m = dists.find((d) => d.code === "MH-MUM" || d.name.toLowerCase().includes("mumbai"));
    if (m) return m.code;
  }

  let best = "";
  let bestScore = 0;
  for (const d of dists) {
    if (d.name.toLowerCase() === pdLower) return d.code;
    const score = tokenOverlapScore(pd, d.name);
    if (score > bestScore) {
      bestScore = score;
      best = d.code;
    }
  }
  if (best && bestScore > 0) return best;

  // If district name is available, generate deterministic code e.g. "TN-TIR" for Tiruvallur
  if (pd.length >= 3) {
    const cleanSlug = pd.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
    if (cleanSlug.length >= 3) {
      return `${stateCode}-${cleanSlug}`;
    }
  }

  return dists[0]?.code || `${stateCode}-DST`;
};

type PostalPincodeResponse = {
  Status: string;
  PostOffice?: Array<{
    Name: string;
    Pincode: string;
    District?: string;
    State?: string;
    Latitude?: string;
    Longitude?: string;
    BranchType?: string;
    Block?: string;
    Circle?: string;
    Division?: string;
    Region?: string;
    Country?: string;
  }>;
};

/** Bundled villages + offline PIN catalog for a 6-digit PIN. */
export const bundledVillagesByPincode = (pincode: string): Village[] => {
  const fromJson = (villages as Village[]).filter((v) => v.pincode === pincode);
  const fromFallback = staticVillagesByPincode(pincode);
  const merged = new Map<string, Village>();
  for (const v of [...fromJson, ...fromFallback]) {
    merged.set(`${v.name}|${v.pincode}`, v);
  }
  return [...merged.values()];
};

/** When pincode is valid, returns post offices with state/district aligned to local catalog (or null). */
export const fetchVillagesByPincode = async (pincode: string): Promise<Village[] | null> => {
  if (!/^\d{6}$/.test(pincode)) return null;

  const bundled = bundledVillagesByPincode(pincode);
  if (bundled.length) return bundled;

  // Offline fast-path: immediately return local bundled or null without attempting network
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return bundled.length ? bundled : null;
  }

  try {
    const response = await withTimeout(fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`));
    if (!response.ok) throw new Error("Postal API request failed");
    const payload = (await response.json()) as PostalPincodeResponse[];
    const first = payload[0];
    if (first?.Status !== "Success" || !first.PostOffice?.length) {
      return bundled.length ? bundled : null;
    }

    // Prioritize post offices: Sub Post Office / Head Post Office / Block hub first
    const sortedPOs = [...first.PostOffice].sort((a, b) => {
      const aHub =
        a.BranchType === "Head Post Office"
          ? 3
          : a.BranchType === "Sub Post Office"
          ? 2
          : a.Block && a.Name.toLowerCase() === a.Block.toLowerCase()
          ? 1
          : 0;
      const bHub =
        b.BranchType === "Head Post Office"
          ? 3
          : b.BranchType === "Sub Post Office"
          ? 2
          : b.Block && b.Name.toLowerCase() === b.Block.toLowerCase()
          ? 1
          : 0;
      return bHub - aHub;
    });

    const out: Village[] = [];
    const seen = new Set<string>();

    for (const po of sortedPOs) {
      const stateName = po.State?.trim();
      if (!stateName) continue;
      const stateCode = stateCodeFromPostalName(stateName);
      if (!stateCode) continue;
      const districtLabel = po.District?.trim() || "";
      const districtCode = findDistrictCodeForPostal(stateCode, districtLabel);
      const lat = Number(po.Latitude);
      const lng = Number(po.Longitude);
      const apiLat = Number.isFinite(lat) && lat !== 0 ? lat : 0;
      const apiLng = Number.isFinite(lng) && lng !== 0 ? lng : 0;
      const fb = bundled.find((b) => b.name.toLowerCase() === po.Name.toLowerCase()) ?? bundled[0];
      const centroid = getPostalRegionCentroid(po.Pincode || pincode);
      const entryLat = apiLat || fb?.lat || centroid.lat;
      const entryLng = apiLng || fb?.lng || centroid.lng;

      // Handle common spelling alias Barugur -> Bargur
      if (/^barugur$/i.test(po.Name.trim()) && !seen.has("Bargur")) {
        seen.add("Bargur");
        out.push({
          name: "Bargur",
          districtCode,
          stateCode,
          lat: entryLat,
          lng: entryLng,
          pincode: po.Pincode || pincode
        });
      }

      if (!seen.has(po.Name)) {
        seen.add(po.Name);
        out.push({
          name: po.Name,
          districtCode,
          stateCode,
          lat: entryLat,
          lng: entryLng,
          pincode: po.Pincode || pincode
        });
      }
    }
    return out.length ? out : bundled.length ? bundled : null;
  } catch {
    return bundled.length ? bundled : null;
  }
};

export const fetchVillages = async (districtCode: string, pincode?: string): Promise<Village[]> => {
  const stateFromDistrict = districtCode.split("-")[0] ?? "";
  const withState = (list: Village[]): Village[] =>
    list.map((v) => ({ ...v, stateCode: v.stateCode ?? stateFromDistrict }));

  const staticFallback = withState(
    (villages as Village[]).filter(
      (village) => village.districtCode === districtCode && (!pincode || village.pincode === pincode)
    )
  );

  if (pincode && /^\d{6}$/.test(pincode)) {
    const pinList = await fetchVillagesByPincode(pincode);
    if (pinList?.length) {
      const matched = pinList.filter((v) => v.districtCode === districtCode);
      const list = matched.length ? matched : pinList;
      return list.map((v) => {
        if (v.lat && v.lng) return v;
        const fb = staticFallback.find((s) => s.pincode === v.pincode && s.name === v.name) ?? staticFallback[0];
        return fb ? { ...v, lat: fb.lat, lng: fb.lng } : v;
      });
    }
  }

  if (!pincode) {
    return staticFallback;
  }

  try {
    const response = await withTimeout(fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`));
    if (!response.ok) {
      throw new Error("Postal API request failed");
    }

    const payload = (await response.json()) as PostalPincodeResponse[];
    const first = payload[0];
    if (first?.Status !== "Success" || !first.PostOffice?.length) {
      throw new Error("Postal API returned no records");
    }

    return first.PostOffice.map((postOffice) => ({
      name: postOffice.Name,
      districtCode,
      stateCode: stateFromDistrict,
      lat: Number(postOffice.Latitude) || staticFallback[0]?.lat || 19.076,
      lng: Number(postOffice.Longitude) || staticFallback[0]?.lng || 72.8777,
      pincode: postOffice.Pincode
    }));
  } catch {
    return staticFallback;
  }
};

export type ResolvedPinPlace = {
  villageName: string;
  districtCode: string;
  stateCode: string;
  lat: number;
  lng: number;
  pincode: string;
};

export type PostalCentroid = {
  lat: number;
  lng: number;
  stateCode: string;
  regionName: string;
};

const PIN_PREFIX_CENTROIDS: Record<string, PostalCentroid> = {
  // Northern Region
  "11": { lat: 28.6139, lng: 77.2090, stateCode: "DL", regionName: "Delhi" },
  "12": { lat: 28.4595, lng: 77.0266, stateCode: "HR", regionName: "Gurugram / South Haryana" },
  "13": { lat: 30.1290, lng: 77.2674, stateCode: "HR", regionName: "Ambala / North Haryana" },
  "14": { lat: 30.9010, lng: 75.8573, stateCode: "PB", regionName: "Ludhiana / Central Punjab" },
  "15": { lat: 30.2110, lng: 74.9455, stateCode: "PB", regionName: "Bathinda / South Punjab" },
  "16": { lat: 30.7333, lng: 76.7794, stateCode: "CH", regionName: "Chandigarh" },
  "17": { lat: 31.1048, lng: 77.1734, stateCode: "HP", regionName: "Shimla / Himachal Pradesh" },
  "18": { lat: 32.7266, lng: 74.8570, stateCode: "JK", regionName: "Jammu" },
  "19": { lat: 34.0837, lng: 74.7973, stateCode: "JK", regionName: "Srinagar / Kashmir" },

  // Uttar Pradesh & Uttarakhand
  "20": { lat: 27.8974, lng: 78.0880, stateCode: "UP", regionName: "Aligarh / Western UP" },
  "21": { lat: 25.4358, lng: 81.8463, stateCode: "UP", regionName: "Prayagraj / Central UP" },
  "22": { lat: 26.8467, lng: 80.9462, stateCode: "UP", regionName: "Lucknow / Awadh" },
  "23": { lat: 25.1337, lng: 82.5644, stateCode: "UP", regionName: "Mirzapur / Eastern UP" },
  "24": { lat: 28.8386, lng: 78.7733, stateCode: "UP", regionName: "Moradabad / Bareilly" },
  "25": { lat: 28.9845, lng: 77.7064, stateCode: "UP", regionName: "Meerut / NCR East" },
  "26": { lat: 27.9135, lng: 79.9288, stateCode: "UP", regionName: "Shahjahanpur / Terai" },
  "27": { lat: 26.7606, lng: 83.3732, stateCode: "UP", regionName: "Gorakhpur / Purvanchal" },
  "28": { lat: 27.1767, lng: 78.0081, stateCode: "UP", regionName: "Agra / Jhansi" },

  // Rajasthan
  "30": { lat: 26.9124, lng: 75.7873, stateCode: "RJ", regionName: "Jaipur / Central Rajasthan" },
  "31": { lat: 24.5854, lng: 73.7125, stateCode: "RJ", regionName: "Udaipur / Mewar" },
  "32": { lat: 25.2138, lng: 75.8648, stateCode: "RJ", regionName: "Kota / Hadoti" },
  "33": { lat: 28.0229, lng: 73.3119, stateCode: "RJ", regionName: "Bikaner / North Rajasthan" },
  "34": { lat: 26.2389, lng: 73.0243, stateCode: "RJ", regionName: "Jodhpur / Marwar" },
  "35": { lat: 26.9124, lng: 70.9000, stateCode: "RJ", regionName: "Jaisalmer / West Rajasthan" },

  // Gujarat
  "36": { lat: 22.3039, lng: 70.8022, stateCode: "GJ", regionName: "Rajkot / Saurashtra" },
  "37": { lat: 23.2420, lng: 69.6669, stateCode: "GJ", regionName: "Bhuj / Kutch" },
  "38": { lat: 23.0225, lng: 72.5714, stateCode: "GJ", regionName: "Ahmedabad / North Gujarat" },
  "39": { lat: 21.1702, lng: 72.8311, stateCode: "GJ", regionName: "Surat / South Gujarat" },

  // Maharashtra & Goa
  "40": { lat: 18.9916, lng: 72.8540, stateCode: "MH", regionName: "Mumbai / Konkan / Goa" },
  "41": { lat: 18.5204, lng: 73.8567, stateCode: "MH", regionName: "Pune / Western Maharashtra" },
  "42": { lat: 20.0000, lng: 73.7800, stateCode: "MH", regionName: "Nashik / Khandesh" },
  "43": { lat: 19.8762, lng: 75.3433, stateCode: "MH", regionName: "Chhatrapati Sambhajinagar" },
  "44": { lat: 21.1458, lng: 79.0882, stateCode: "MH", regionName: "Nagpur / Vidarbha" },

  // Madhya Pradesh & Chhattisgarh
  "45": { lat: 22.7196, lng: 75.8577, stateCode: "MP", regionName: "Indore / Malwa" },
  "46": { lat: 23.2599, lng: 77.4126, stateCode: "MP", regionName: "Bhopal / Central MP" },
  "47": { lat: 26.2183, lng: 78.1828, stateCode: "MP", regionName: "Gwalior / Chambal" },
  "48": { lat: 23.1815, lng: 79.9864, stateCode: "MP", regionName: "Jabalpur / Mahakoshal" },
  "49": { lat: 21.2514, lng: 81.6296, stateCode: "CT", regionName: "Raipur / Chhattisgarh" },

  // Andhra Pradesh & Telangana
  "50": { lat: 17.3850, lng: 78.4867, stateCode: "TG", regionName: "Hyderabad / Telangana" },
  "51": { lat: 14.4673, lng: 78.8242, stateCode: "AP", regionName: "Kadapa / Rayalaseema" },
  "52": { lat: 16.5062, lng: 80.6480, stateCode: "AP", regionName: "Vijayawada / Coastal Andhra" },
  "53": { lat: 17.6868, lng: 83.2185, stateCode: "AP", regionName: "Visakhapatnam / North Coastal AP" },

  // Karnataka
  "56": { lat: 12.9716, lng: 77.5946, stateCode: "KA", regionName: "Bengaluru / South Karnataka" },
  "57": { lat: 13.3409, lng: 74.7421, stateCode: "KA", regionName: "Coastal / Central Karnataka" },
  "58": { lat: 14.5479, lng: 74.3188, stateCode: "KA", regionName: "Gokarna / Uttara Kannada" },
  "59": { lat: 15.8497, lng: 74.4977, stateCode: "KA", regionName: "Belagavi / North Karnataka" },

  // Tamil Nadu & Kerala
  "60": { lat: 13.0827, lng: 80.2707, stateCode: "TN", regionName: "Chennai / Tiruvallur / Kanchipuram" },
  "61": { lat: 10.7905, lng: 78.7047, stateCode: "TN", regionName: "Tiruchirappalli / Thanjavur" },
  "62": { lat: 9.9252, lng: 78.1198, stateCode: "TN", regionName: "Madurai / South Tamil Nadu" },
  "63": { lat: 12.9165, lng: 79.1325, stateCode: "TN", regionName: "Vellore / North Tamil Nadu" },
  "64": { lat: 11.0168, lng: 76.9558, stateCode: "TN", regionName: "Coimbatore / Kongu Nadu" },
  "67": { lat: 11.2588, lng: 75.7804, stateCode: "KL", regionName: "Kozhikode / Malabar" },
  "68": { lat: 9.9312, lng: 76.2673, stateCode: "KL", regionName: "Kochi / Central Kerala" },
  "69": { lat: 8.5241, lng: 76.9366, stateCode: "KL", regionName: "Thiruvananthapuram / South Kerala" },

  // Eastern & North Eastern
  "70": { lat: 22.5726, lng: 88.3639, stateCode: "WB", regionName: "Kolkata / South Bengal" },
  "71": { lat: 23.5204, lng: 87.3119, stateCode: "WB", regionName: "Durgapur / Bardhaman" },
  "72": { lat: 22.4257, lng: 87.3199, stateCode: "WB", regionName: "Midnapore / South West Bengal" },
  "73": { lat: 26.7271, lng: 88.3953, stateCode: "WB", regionName: "Siliguri / North Bengal" },
  "74": { lat: 24.0954, lng: 88.2562, stateCode: "WB", regionName: "Murshidabad / Nadia" },
  "75": { lat: 20.2961, lng: 85.8245, stateCode: "OR", regionName: "Bhubaneswar / Coastal Odisha" },
  "76": { lat: 19.3149, lng: 84.7941, stateCode: "OR", regionName: "Berhampur / South Odisha" },
  "77": { lat: 21.4669, lng: 83.9812, stateCode: "OR", regionName: "Sambalpur / West Odisha" },
  "78": { lat: 26.1445, lng: 91.7362, stateCode: "AS", regionName: "Guwahati / Assam" },
  "79": { lat: 25.5788, lng: 91.8933, stateCode: "ML", regionName: "Shillong / North East India" },

  // Bihar & Jharkhand
  "80": { lat: 25.5941, lng: 85.1376, stateCode: "BR", regionName: "Patna / Central Bihar" },
  "81": { lat: 25.2425, lng: 86.9842, stateCode: "BR", regionName: "Bhagalpur / East Bihar" },
  "82": { lat: 24.7914, lng: 85.0002, stateCode: "BR", regionName: "Gaya / South Bihar" },
  "83": { lat: 23.3441, lng: 85.3096, stateCode: "JH", regionName: "Ranchi / South Jharkhand" },
  "84": { lat: 26.1209, lng: 85.3647, stateCode: "BR", regionName: "Muzaffarpur / North Bihar" },
  "85": { lat: 25.7711, lng: 87.4704, stateCode: "BR", regionName: "Purnia / Seemanchal" }
};

export const getPostalRegionCentroid = (
  pincode: string
): PostalCentroid => {
  const clean = (pincode || "").trim();
  const prefix = clean.slice(0, 2);
  if (PIN_PREFIX_CENTROIDS[prefix]) {
    return PIN_PREFIX_CENTROIDS[prefix];
  }
  const p1 = clean.slice(0, 1);
  if (p1 === "5") return { lat: 15.3173, lng: 75.7139, stateCode: "KA", regionName: "Karnataka" };
  if (p1 === "6") return { lat: 11.1271, lng: 78.6569, stateCode: "TN", regionName: "Tamil Nadu" };
  if (p1 === "4") return { lat: 19.7515, lng: 75.7139, stateCode: "MH", regionName: "Maharashtra" };
  if (p1 === "1" || p1 === "2") return { lat: 28.6139, lng: 77.2090, stateCode: "DL", regionName: "North India" };
  if (p1 === "7") return { lat: 22.5726, lng: 88.3639, stateCode: "WB", regionName: "East India" };
  if (p1 === "8") return { lat: 25.5941, lng: 85.1376, stateCode: "BR", regionName: "Bihar / Jharkhand" };
  if (p1 === "3") return { lat: 26.9124, lng: 75.7873, stateCode: "RJ", regionName: "West India" };
  return { lat: 21.1458, lng: 79.0882, stateCode: "MH", regionName: "India" };
};

/** Formats clean, recognizable Google Maps style location name (Town/Taluk, District). */
export const formatGoogleStylePlaceName = (primary?: string, district?: string, state?: string): string => {
  let p = (primary || "").trim();
  // Strip administrative suffixes like "Tahsil", "Taluk", "Mandal", "M.Corp."
  p = p.replace(/\s*\([^)]*\)/g, "").trim();
  p = p.replace(/\s+(Tahsil|Tehsil|Taluk|Taluka|Mandal|Block|M\.Corp\.|Municipal Corporation)$/i, "").trim();

  let d = (district || "").replace(/\s+(District|Dist|City District)$/i, "").trim();
  const s = (state || "").trim();

  if (!p && !d) return s || "India";
  if (!p) return d;
  if (!d) return p;

  const pLow = p.toLowerCase();
  const dLow = d.toLowerCase();

  // If identical
  if (pLow === dLow) return p;

  // If district is just town + "Urban" / "Rural" / "Central" / "North" / "South"
  const dBase = dLow.replace(/\s+(urban|rural|central|north|south|east|west|metropolitan)$/i, "").trim();
  if (dBase === pLow) return p;

  const pBase = pLow.replace(/\s+(urban|rural|central|north|south|east|west|metropolitan)$/i, "").trim();
  if (pBase === dLow) return d;

  // If district contains primary (or vice-versa) as a distinct word
  if (dLow.includes(pLow) && dLow.length - pLow.length < 8) return p;
  if (pLow.includes(dLow) && pLow.length - dLow.length < 8) return p;

  return `${p}, ${d}`;
};

/** Resolve Indian PIN to coordinates and Google-style place name using Nominatim & India Post synergy. */
export const resolvePlaceFromPincode = async (pincode: string): Promise<ResolvedPinPlace | null> => {
  if (!/^[1-9]\d{5}$/.test(pincode)) return null;

  // 1. Instant check from bundled catalog (offline fast-path for key locations like Gokarna 581326)
  const bundled = bundledVillagesByPincode(pincode);
  const fb = bundled[0];
  if (fb?.lat && fb?.lng) {
    return {
      villageName: fb.name,
      districtCode: fb.districtCode,
      stateCode: fb.stateCode || fb.districtCode.split("-")[0] || "KA",
      lat: fb.lat,
      lng: fb.lng,
      pincode
    };
  }

  // 2. Check IndexedDB geocode cache for quick repeat lookups
  const cached = await getGeocode(`pin:${pincode}`);

  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

  if (!isOffline) {
    try {
      // 3. Dual-source network resolution: Nominatim structured postal search + India Post API in parallel
      const nomPromise = withTimeout(
        fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pincode)}&country=India&format=json&limit=1&addressdetails=1`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "BaggonaPanchangaAstrologyPWA/1.0 (offline-first astrology; contact: local-app)"
            }
          }
        ).then(async (r) => (r.ok ? ((await r.json()) as any[]) : null)),
        NOMINATIM_TIMEOUT_MS
      ).catch(() => null);

      const postPromise = withTimeout(
        fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`).then(async (r) =>
          r.ok ? ((await r.json()) as PostalPincodeResponse[]) : null
        ),
        REQUEST_TIMEOUT_MS
      ).catch(() => null);

      const [nomRes, postRes] = await Promise.all([nomPromise, postPromise]);

      const nomRecord = Array.isArray(nomRes) && nomRes.length ? nomRes[0] : null;
      const postOffices =
        Array.isArray(postRes) && postRes[0]?.Status === "Success" && postRes[0].PostOffice
          ? postRes[0].PostOffice
          : [];

      // Identify primary post office (Sub Post Office or Head Post Office is the postal hub)
      const mainPo =
        postOffices.find((o) => o.BranchType === "Head Post Office") ||
        postOffices.find((o) => o.BranchType === "Sub Post Office") ||
        postOffices[0];

      // Locality / Town candidates
      const nomCounty = nomRecord?.address?.county;
      const nomCity =
        nomRecord?.address?.city ||
        nomRecord?.address?.town ||
        nomRecord?.address?.village ||
        nomRecord?.address?.suburb ||
        nomRecord?.address?.municipality;
      const postTown = mainPo?.Name;
      const postBlock = mainPo?.Block;

      let rawPrimary = nomCounty || nomCity || postBlock || postTown || "";
      if (/^barugur$/i.test(rawPrimary.trim())) {
        rawPrimary = "Bargur";
      }
      const rawDistrict = mainPo?.District || nomRecord?.address?.state_district || "";
      const rawState = mainPo?.State || nomRecord?.address?.state || "";

      const stateCode =
        stateCodeFromPostalName(rawState) ||
        getPostalRegionCentroid(pincode).stateCode ||
        "KA";
      const districtCode = findDistrictCodeForPostal(stateCode, rawDistrict);

      // Coordinates
      let lat = Number(nomRecord?.lat) || 0;
      let lng = Number(nomRecord?.lon) || 0;

      if (!lat || !lng) {
        if (cached?.lat && cached?.lng) {
          lat = cached.lat;
          lng = cached.lng;
        } else if (rawPrimary || rawDistrict) {
          // Fallback geocode via text search
          try {
            const query = `${rawPrimary || rawDistrict}, ${rawDistrict || rawState}, India`;
            const coords = await withTimeout(getCoordinates(query), NOMINATIM_TIMEOUT_MS);
            if (coords && coords.lat && coords.lng) {
              lat = coords.lat;
              lng = coords.lng;
            }
          } catch {
            // will fall back to centroid
          }
        }
      }

      if (!lat || !lng) {
        const centroid = getPostalRegionCentroid(pincode);
        lat = centroid.lat;
        lng = centroid.lng;
      }

      const villageName = formatGoogleStylePlaceName(rawPrimary, rawDistrict, rawState);

      // Cache for offline repeat access
      await cacheGeocode(`pin:${pincode}`, lat, lng);
      await cacheGeocode(villageName.toLowerCase(), lat, lng);

      return {
        villageName,
        districtCode,
        stateCode,
        lat,
        lng,
        pincode
      };
    } catch {
      // If network calls fail, proceed to centroid fallback
    }
  }

  // 4. Offline / Failure fallback to cached or accurate regional centroid
  const centroid = getPostalRegionCentroid(pincode);
  const lat = cached?.lat || centroid.lat || 14.5479;
  const lng = cached?.lng || centroid.lng || 74.3188;
  const stateCode = centroid.stateCode || "KA";
  const districtCode = `${stateCode}-DST`;
  const villageName = centroid.regionName ? `${centroid.regionName}` : `Pincode ${pincode}`;

  return {
    villageName,
    districtCode,
    stateCode,
    lat,
    lng,
    pincode
  };
};

/**
 * Universal resolver for Indian Pincodes OR City / Place names.
 * Never resets to (0,0) or throws uncaught exceptions.
 */
export const resolvePlaceOrPincode = async (
  query: string
): Promise<{ placeName: string; lat: number; lng: number; pincode?: string }> => {
  const q = (query || "").trim();
  if (!q) {
    return { placeName: "Gokarna, Karnataka", lat: 14.5479, lng: 74.3188, pincode: "581326" };
  }

  // 1. If 6-digit PIN
  if (/^[1-9]\d{5}$/.test(q)) {
    const res = await resolvePlaceFromPincode(q);
    if (res && res.lat && res.lng) {
      return {
        placeName: `${res.villageName} (${res.pincode})`,
        lat: res.lat,
        lng: res.lng,
        pincode: res.pincode
      };
    }
    const centroid = getPostalRegionCentroid(q);
    return {
      placeName: `${centroid.regionName || "PIN " + q} (${q})`,
      lat: centroid.lat || 14.5479,
      lng: centroid.lng || 74.3188,
      pincode: q
    };
  }

  // 2. If City / Town name
  try {
    const coords = await getCoordinates(q);
    if (coords && coords.lat && coords.lng) {
      return {
        placeName: q,
        lat: coords.lat,
        lng: coords.lng
      };
    }
  } catch (err) {
    console.warn("Geocoding lookup fallback for:", q, err);
  }

  return { placeName: q || "Gokarna, Karnataka", lat: 14.5479, lng: 74.3188, pincode: "581326" };
};

export const getCoordinates = async (placeName: string): Promise<{ lat: number; lng: number }> => {
  const normalized = placeName.trim().toLowerCase();
  const cached = await getGeocode(normalized);
  if (cached) {
    return cached;
  }

  // Fast-path for bundled catalog places (e.g. Gokarna, Bargur, Sirsi)
  const staticMatch = PINCODE_FALLBACK.find(
    (v) => v.name.toLowerCase() === normalized
  );
  if (staticMatch) {
    return { lat: staticMatch.lat, lng: staticMatch.lng };
  }

  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
  if (isOffline) {
    return { lat: 14.5479, lng: 74.3188 };
  }

  // Check if query is or contains a 6-digit Indian PIN code
  const pinMatch = placeName.match(/\b([1-9]\d{5})\b/);
  if (pinMatch) {
    const pin = pinMatch[1];
    const pinCached = await getGeocode(`pin:${pin}`);
    if (pinCached) return pinCached;
  }

  const now = Date.now();
  const elapsed = now - lastNominatimCallMs;
  if (elapsed < 1000) {
    await sleep(1000 - elapsed);
  }
  lastNominatimCallMs = Date.now();

  try {
    // If a 6-digit pincode is present, try structured postal search first
    if (pinMatch) {
      try {
        const pinUrl = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pinMatch[1])}&country=India&format=json&limit=1`;
        const pinResp = await withTimeout(
          fetch(pinUrl, {
            headers: {
              Accept: "application/json",
              "User-Agent": "BaggonaPanchangaAstrologyPWA/1.0 (offline-first astrology; contact: local-app)"
            }
          }),
          NOMINATIM_TIMEOUT_MS
        );
        if (pinResp.ok) {
          const pinRecords = (await pinResp.json()) as Array<{ lat: string; lon: string }>;
          if (pinRecords.length && Number(pinRecords[0].lat) && Number(pinRecords[0].lon)) {
            const lat = Number(pinRecords[0].lat);
            const lng = Number(pinRecords[0].lon);
            await cacheGeocode(normalized, lat, lng);
            await cacheGeocode(`pin:${pinMatch[1]}`, lat, lng);
            return { lat, lng };
          }
        }
      } catch {
        // Fallback to unstructured query below
      }
    }

    // Nominatim usage policy: max 1 req/s; identify app via User-Agent
    const cleanPlace = placeName.replace(/,\s*india$/i, "").trim();
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanPlace)},India&format=json&limit=1`;
    const response = await withTimeout(
      fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "BaggonaPanchangaAstrologyPWA/1.0 (offline-first astrology; contact: local-app)"
        }
      }),
      NOMINATIM_TIMEOUT_MS
    );
    if (!response.ok) {
      throw new Error("Unable to fetch coordinates right now");
    }
    const records = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!records.length) {
      throw new Error("Location not found");
    }
    const lat = Number(records[0].lat);
    const lng = Number(records[0].lon);
    await cacheGeocode(normalized, lat, lng);
    return { lat, lng };
  } catch {
    if (pinMatch) {
      const centroid = getPostalRegionCentroid(pinMatch[1]);
      return { lat: centroid.lat, lng: centroid.lng };
    }
    return { lat: 14.5479, lng: 74.3188 };
  }
};

