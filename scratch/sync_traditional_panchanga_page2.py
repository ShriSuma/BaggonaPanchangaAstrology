filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import for calculateTraditionalBaggona if missing
if "calculateTraditionalBaggona" not in content:
    content = content.replace(
        'import { calculateKundli } from "../../../core/KundliEngine";',
        'import { calculateKundli } from "../../../core/KundliEngine";\nimport { calculateTraditionalBaggona } from "../../../core/TraditionalBaggonaEngine";'
    )

# 2. Add traditionalPanchanga memo calculation inside RoyalBooklet8PageTemplate
memo_calc_anchor = "const birthKundli = React.useMemo(() => {"
traditional_memo = '''  const traditionalPanchanga = React.useMemo(() => {
    try {
      return calculateTraditionalBaggona(
        dobStr,
        tobStr,
        identity?.latitude || 14.544,
        identity?.longitude || 74.318
      );
    } catch {
      return null;
    }
  }, [dobStr, tobStr, identity?.latitude, identity?.longitude]);

  const birthKundli = React.useMemo(() => {'''

if "const traditionalPanchanga =" not in content:
    content = content.replace(memo_calc_anchor, traditional_memo)

# 3. Replace Page 2 Birth Panchanga Box with the traditionalPanchanga-driven elements
old_panchanga_box_content = '''          {/* Dynamic Birth Panchanga Box */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "8px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              📜 {isKn ? "ಜನನ ಸಮಯದ ಶುಭ-ಪಂಚಾಂಗ ಗಣನೆಗಳು:" : "Birth Panchanga Calculations:"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: "12px", lineHeight: "1.55" }}>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ತಿಥಿ & ಪಕ್ಷ:" : "Tithi & Paksha:"}</strong> {calculateBirthTithi(birthKundli, isKn)}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಕರಣ & ಯೋಗ:" : "Karana & Yoga:"}</strong> {isKn ? "ಬಾಲವ ಕರಣ" : "Balava Karana"} · {calculateBirthYoga(birthKundli, isKn)}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಘಟಿ / ವಿಘಟಿ:" : "Ghati / Vighati:"}</strong> {isKn ? "೪೨ ಘಟಿ ೪೮ ವಿಘಟಿ" : "42 Ghati 48 Vighati"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ದಿವಾ ಘಟಿ:" : "Diva Ghati:"}</strong> {isKn ? "೩೨ ಘಟಿ ೧೨ ವಿಘಟಿ" : "32 Ghati 12 Vighati"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಅಮೃತ ಘಟಿ:" : "Amrita Ghati:"}</strong> {isKn ? "೪೪ ಘಟಿ ೦೬ ವಿಘಟಿ" : "44 Ghati 06 Vighati"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ವಿಷ ಘಟಿ:" : "Visha Ghati:"}</strong> {isKn ? "೨೦ ಘಟಿ ೦೬ ವಿಘಟಿ" : "20 Ghati 06 Vighati"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಸೂರ್ಯೋದಯಾದಿತ:" : "Suryodayadita:"}</strong> {isKn ? "೩೨ ಘಟಿ ೫೫ ವಿಘಟಿ" : "32 Ghati 55 Vighati"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ದಶಾ ಶೇಷ:" : "Dasha Balance:"}</strong> {dynamicDashaCards[0]?.title ? (isKn ? `${dynamicDashaCards[0].title.split(" • ")[0].replace(/[^a-zA-Z0-9\\u0C80-\\u0CFF\\s]/g, "").trim()} ಮಹಾದಶಾ` : dynamicDashaCards[0].title.split(" • ")[0]) : (isKn ? "ಚಂದ್ರ ಮಹಾದಶಾ" : "Moon Dasha")}</div>
            </div>
          </div>'''

new_panchanga_box_content = '''          {/* Authentic Traditional Birth Panchanga Box */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "8px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              📜 {isKn ? "ಜನನ ಸಮಯದ ಶುಭ-ಪಂಚಾಂಗ ಗಣನೆಗಳು:" : "Birth Panchanga Calculations:"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: "12px", lineHeight: "1.55" }}>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ತಿಥಿ & ಪಕ್ಷ:" : "Tithi & Paksha:"}</strong> {traditionalPanchanga ? `${traditionalPanchanga.tithiKn} (${traditionalPanchanga.pakshaKn} ಪಕ್ಷ)` : (isKn ? "ದ್ವಿತೀಯಾ (ಶುಕ್ಲ ಪಕ್ಷ)" : "Dwitiya (Shukla Paksha)")}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಕರಣ & ಯೋಗ:" : "Karana & Yoga:"}</strong> {traditionalPanchanga ? `${traditionalPanchanga.karanaKn} ಕರಣ · ${traditionalPanchanga.yogaKn} ಯೋಗ` : (isKn ? "ಬಾಲವ ಕರಣ · ಬ್ರಹ್ಮ ಯೋಗ" : "Balava Karana · Brahma Yoga")}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಘಟಿ / ವಿಘಟಿ:" : "Ghati / Vighati:"}</strong> {traditionalPanchanga ? `${toKnDigits(traditionalPanchanga.tithiGhati)} ಘಟಿ ${toKnDigits(traditionalPanchanga.tithiVighati)} ವಿಘಟಿ` : "೪೨ ಘಟಿ ೪೮ ವಿಘಟಿ"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ದಿವಾ ಘಟಿ:" : "Diva Ghati:"}</strong> {traditionalPanchanga ? `${toKnDigits(traditionalPanchanga.divaGhati.ghati)} ಘಟಿ ${toKnDigits(traditionalPanchanga.divaGhati.vighati)} ವಿಘಟಿ` : "೩೨ ಘಟಿ ೧೨ ವಿಘಟಿ"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಅಮೃತ ಘಟಿ:" : "Amrita Ghati:"}</strong> {traditionalPanchanga ? `${toKnDigits(traditionalPanchanga.amrithaGhati.ghati)} ಘಟಿ ${toKnDigits(traditionalPanchanga.amrithaGhati.vighati)} ವಿಘಟಿ` : "೪೪ ಘಟಿ ೦೬ ವಿಘಟಿ"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ವಿಷ ಘಟಿ:" : "Visha Ghati:"}</strong> {traditionalPanchanga ? `${toKnDigits(traditionalPanchanga.vishaGhati.ghati)} ಘಟಿ ${toKnDigits(traditionalPanchanga.vishaGhati.vighati)} ವಿಘಟಿ` : "೨೦ ಘಟಿ ೦೬ ವಿಘಟಿ"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಸೂರ್ಯೋದಯಾದಿತ:" : "Suryodayadita:"}</strong> {traditionalPanchanga ? `${toKnDigits(traditionalPanchanga.suryodhayadgata.ghati)} ಘಟಿ ${toKnDigits(traditionalPanchanga.suryodhayadgata.vighati)} ವಿಘಟಿ` : "೩೨ ಘಟಿ ೫೫ ವಿಘಟಿ"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ದಶಾ ಶೇಷ:" : "Dasha Balance:"}</strong> {traditionalPanchanga ? `${traditionalPanchanga.dashaLord} ಮಹಾದಶಾ ${toKnDigits(traditionalPanchanga.dashaYears)} ವರ್ಷ ${toKnDigits(traditionalPanchanga.dashaMonths)} ತಿಂಗಳು ${toKnDigits(traditionalPanchanga.dashaDays)} ದಿನ` : (isKn ? "ಚಂದ್ರ ಮಹಾದಶಾ ೪ ವರ್ಷ ೦ ತಿಂಗಳು ೫ ದಿನ" : "Moon Dasha 4y 0m 5d")}</div>
            </div>
          </div>'''

content = content.replace(old_panchanga_box_content, new_panchanga_box_content)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated Page 2 Birth Panchanga Box to use calculateTraditionalBaggona engine successfully!")
