import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update renderSouthIndianGrid to remove degree numbers completely from planet cells
old_planet_render = '{pl.name} {!isD9 ? toKnDigits(pl.deg) : ""}'
new_planet_render = '{pl.name}'

if old_planet_render in content:
    content = content.replace(old_planet_render, new_planet_render)
    print("Removed degree numbers from D1/D9 chart cells successfully!")

# 2. Add dynamic Tithi calculation from Sun and Moon longitudes for Panchanga Box
panchanga_calc_code = '''
const calculateBirthTithi = (kundli: any, isKn: boolean): string => {
  if (!kundli || !kundli.planets) return isKn ? "ದ್ವಿತೀಯಾ (ಶುಕ್ಲ ಪಕ್ಷ)" : "Dwitiya (Shukla Paksha)";
  const sun = kundli.planets.find((p: any) => p.name === "Sun" || p.planet === "Sun")?.longitude ?? 0;
  const moon = kundli.planets.find((p: any) => p.name === "Moon" || p.planet === "Moon")?.longitude ?? 0;
  const diff = (moon - sun + 360) % 360;
  const tithiIdx = Math.floor(diff / 12) % 30;
  const isShukla = tithiIdx < 15;
  const tithiNum = (tithiIdx % 15);
  
  const TITHIS_KN = ["ಪ್ರಥಮಾ", "ದ್ವಿತೀಯಾ", "ತೃತೀಯಾ", "ಚತುರ್ಥಿ", "ಪಂಚಮೀ", "ಷಷ್ಠೀ", "ಸಪ್ತಮೀ", "ಅಷ್ಟಮೀ", "ನವಮೀ", "ದಶಮೀ", "ಏಕಾದಶೀ", "ದ್ವಾದಶೀ", "ತ್ರಯೋದಶೀ", "ಚತುರ್ದಶೀ", isShukla ? "ಪೂರ್ಣಿಮಾ" : "ಅಮಾವಾಸ್ಯಾ"];
  const TITHIS_EN = ["Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", isShukla ? "Purnima" : "Amavasya"];
  
  const tName = isKn ? TITHIS_KN[tithiNum] : TITHIS_EN[tithiNum];
  const pName = isKn ? (isShukla ? "ಶುಕ್ಲ ಪಕ್ಷ" : "ಕೃಷ್ಣ ಪಕ್ಷ") : (isShukla ? "Shukla Paksha" : "Krishna Paksha");
  
  return `${tName} (${pName})`;
};
'''

if "const calculateBirthTithi" not in content:
    content = content.replace("const calculateBirthYoga =", panchanga_calc_code + "\nconst calculateBirthYoga =")

# 3. Update Page 2 Panchanga Box to use calculateBirthTithi(birthKundli, isKn)
old_tithi_box = '<div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ತಿಥಿ & ಪಕ್ಷ:" : "Tithi & Paksha:"}</strong> {isKn ? "ದ್ವಿತೀಯಾ (ಶುಕ್ಲ ಪಕ್ಷ)" : "Dwitiya (Shukla Paksha)"}</div>'
new_tithi_box = '<div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ತಿಥಿ & ಪಕ್ಷ:" : "Tithi & Paksha:"}</strong> {calculateBirthTithi(birthKundli, isKn)}</div>'

content = content.replace(old_tithi_box, new_tithi_box)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied dynamic Tithi calculation and removed chart degree numbers successfully.")
