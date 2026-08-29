import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add lblYoga to PAGE1_DICT interface and all 5 language dictionaries
content = content.replace(
    'lblGotra: string;',
    'lblGotra: string;\n  lblYoga: string;'
)

content = content.replace(
    'lblGotra: "ಗೋತ್ರ",',
    'lblGotra: "ಗೋತ್ರ",\n    lblYoga: "ಜನ್ಮ ಯೋಗ",'
)
content = content.replace(
    'lblGotra: "Gotra",',
    'lblGotra: "Gotra",\n    lblYoga: "Janma Yoga",'
)
content = content.replace(
    'lblGotra: "गोत्र",',
    'lblGotra: "गोत्र",\n    lblYoga: "जन्म योग",'
)
content = content.replace(
    'lblGotra: "గోత్రం",',
    'lblGotra: "గోత్రం",\n    lblYoga: "జన్మ యోగం",'
)
content = content.replace(
    'lblGotra: "கோத்திரம்",',
    'lblGotra: "கோத்திரம்",\n    lblYoga: "ஜென்ம யோகம்",'
)

# 2. Define calculateBirthYoga helper before RoyalBooklet8PageTemplate component
yoga_helper = '''const calculateBirthYoga = (kundli: KundliOutput | null, isKn: boolean): string => {
  if (!kundli || !kundli.planets) return isKn ? "ಸಿದ್ಧ" : "Siddha";
  const sun = kundli.planets.find(p => p.planet === "Sun")?.longitude ?? 0;
  const moon = kundli.planets.find(p => p.planet === "Moon")?.longitude ?? 0;
  const sum = (sun + moon) % 360;
  const yogaIdx = Math.floor(sum / (360 / 27)) % 27;
  
  const YOGAS_KN = [
    "ವಿಷ್ಕಂಭ", "ಪ್ರೀತಿ", "ಆಯುಷ್ಮಾನ್", "ಸೌಭಾಗ್ಯ", "ಶೋಭನ", "ಅತಿಗಂಡ", "ಸುಕರ್ಮ", "ಧೃತಿ", "ಶೂಲ", "ಗಂಡ", 
    "ವೃದ್ಧಿ", "ಧ್ರುವ", "ವ್ಯಾಘಾತ", "ಹರ್ಷಣ", "ವಜ್ರ", "ಸಿದ್ಧಿ", "ವ್ಯತೀಪಾತ", "ವರಿಯಾನ್", "ಪರಿಘ", "ಶಿವ", 
    "ಸಿದ್ಧ", "ಸಾಧ್ಯ", "ಶುಭ", "ಶುಕ್ಲ", "ಬ್ರಹ್ಮ", "ಐಂದ್ರ", "ವೈಧೃತಿ"
  ];
  const YOGAS_EN = [
    "Vishkambha", "Preeti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Aindra", "Vaidriti"
  ];
  
  return isKn ? (YOGAS_KN[yogaIdx] || "ಸಿದ್ಧ") : (YOGAS_EN[yogaIdx] || "Siddha");
};

const toKnDigits ='''

content = content.replace('const toKnDigits =', yoga_helper)

# 3. Update Card 4 in Page 1: Gotra (if present) OR Birth Yoga fallback (if Gotra is missing)
old_card4_block = '''              {/* Card 4: Gotra (Only rendered if devotee provided a valid Gotra) */}
              {hasGotra && (
                <div style={{
                  background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                  border: "1.5px solid #D97706",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
                }}>
                  <span style={{ fontSize: "17px" }}>🔱</span>
                  <div>
                    <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                      {(PAGE1_DICT[code] || PAGE1_DICT.en).lblGotra}:
                    </strong>
                    <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>{finalGotra}</span>
                  </div>
                </div>
              )}'''

new_card4_block = '''              {/* Card 4: Gotra (if available) OR Birth Yoga fallback (if Gotra is missing) */}
              <div style={{
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
              }}>
                <span style={{ fontSize: "17px" }}>{hasGotra ? "🔱" : "✨"}</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {hasGotra 
                      ? (PAGE1_DICT[code] || PAGE1_DICT.en).lblGotra 
                      : (PAGE1_DICT[code] || PAGE1_DICT.en).lblYoga}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>
                    {hasGotra ? finalGotra : calculateBirthYoga(birthKundli, isKn)}
                  </span>
                </div>
              </div>'''

if old_card4_block in content:
    content = content.replace(old_card4_block, new_card4_block)

# Permanently keep Card 7 (Place of Birth) gridColumn: "span 2"
content = content.replace(
    'gridColumn: hasGotra ? "span 2" : "span 1",',
    'gridColumn: "span 2",'
)

# 4. Page 3 Dasha card text adjustments:
# Duration Bar Box: Revert margin to original marginTop: "2px", marginBottom: "8px", padding: "4px 10px"
content = re.sub(
    r'marginTop:\s*"6px",\s*\n\s*marginBottom:\s*"6px",\s*\n\s*background:\s*"linear-gradient\(180deg, #FFFDF7 0%, #FEF3C7 100%\)",\s*\n\s*border:\s*"1px solid #FCD34D",\s*\n\s*padding:\s*"2px 10px 3px 10px"',
    r'marginTop: "2px",\n                marginBottom: "8px",\n                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",\n                border: "1px solid #FCD34D",\n                padding: "4px 10px"',
    content
)

# Lift duration bar text inside duration bar: transform translateY(-3px)
content = re.sub(
    r'<span>(🗓️ அவಧಿ:[^<]+)</span>',
    r'<span style={{ transform: "translateY(-3px)", display: "inline-block" }}>\1</span>',
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Yoga fallback added to Page 1 and Page 3 text lift updated successfully!")
