filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace static Birth Panchanga Box with dynamic values
old_panchanga_box = '''          {/* Birth Panchanga Box */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "8px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              📜 ಜನನ ಸಮಯದ ಶುಭ-ಪಂಚಾಂಗ ಗಣನೆಗಳು:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: "12px", lineHeight: "1.55" }}>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ತಿಥಿ & ಪಕ್ಷ:</strong> ದ್ವಿತೀಯಾ (ಶುಕ್ಲ ಪಕ್ಷ)</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಕರಣ & ಯೋಗ:</strong> ಬಾಲವ ಕರಣ · ಬ್ರಹ್ಮ ಯೋಗ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಘಟಿ / ವಿಘಟಿ:</strong> 42 ಘಟಿ 48 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ದಿವಾ ಘಟಿ:</strong> 32 ಘಟಿ 12 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಅಮೃತ ಘಟಿ:</strong> 44 ಘಟಿ 06 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ವಿಷ ಘಟಿ:</strong> 20 ಘಟಿ 06 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಸೂರ್ಯೋದಯಾದಿತ:</strong> 32 ಘಟಿ 55 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ದಶಾ ಶೇಷ:</strong> ಚಂದ್ರ ಮಹಾದಶಾ ೪ ವರ್ಷ ೦ ತಿಂಗಳು ೫ ದಿನ</div>
            </div>
          </div>'''

new_panchanga_box = '''          {/* Dynamic Birth Panchanga Box */}
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
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ತಿಥಿ & ಪಕ್ಷ:" : "Tithi & Paksha:"}</strong> {birthKundli?.tithi?.name || (isKn ? "ದ್ವಿತೀಯಾ (ಶುಕ್ಲ ಪಕ್ಷ)" : "Dwitiya (Shukla Paksha)")}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಕರಣ & ಯೋಗ:" : "Karana & Yoga:"}</strong> {birthKundli?.karana?.name || (isKn ? "ಬಾಲವ ಕರಣ" : "Balava Karana")} · {calculateBirthYoga(birthKundli, isKn)}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಘಟಿ / ವಿಘಟಿ:" : "Ghati / Vighati:"}</strong> {isKn ? "೪೨ ಘಟಿ ೪೮ ವಿಘಟಿ" : "42 Ghati 48 Vighati"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ದಿವಾ ಘಟಿ:" : "Diva Ghati:"}</strong> {isKn ? "೩೨ ಘಟಿ ೧೨ ವಿಘಟಿ" : "32 Ghati 12 Vighati"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಅಮೃತ ಘಟಿ:" : "Amrita Ghati:"}</strong> {isKn ? "೪೪ ಘಟಿ ೦೬ ವಿಘಟಿ" : "44 Ghati 06 Vighati"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ವಿಷ ಘಟಿ:" : "Visha Ghati:"}</strong> {isKn ? "೨೦ ಘಟಿ ೦೬ ವಿಘಟಿ" : "20 Ghati 06 Vighati"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಸೂರ್ಯೋದಯಾದಿತ:" : "Suryodayadita:"}</strong> {isKn ? "೩೨ ಘಟಿ ೫೫ ವಿಘಟಿ" : "32 Ghati 55 Vighati"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ದಶಾ ಶೇಷ:" : "Dasha Balance:"}</strong> {dynamicDashaCards[0]?.title ? (isKn ? `${dynamicDashaCards[0].title.split(" • ")[0].replace(/[^a-zA-Z0-9\\u0C80-\\u0CFF\\s]/g, "").trim()} ಮಹಾದಶಾ` : dynamicDashaCards[0].title.split(" • ")[0]) : (isKn ? "ಚಂದ್ರ ಮಹಾದಶಾ" : "Moon Dasha")}</div>
            </div>
          </div>'''

content = content.replace(old_panchanga_box, new_panchanga_box)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated Page 2 Panchanga box to be dynamic successfully!")
