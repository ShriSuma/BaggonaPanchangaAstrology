filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '<div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ತಿಥಿ & ಪಕ್ಷ:" : "Tithi & Paksha:"}</strong> {birthKundli?.tithi?.name || (isKn ? "ದ್ವಿತೀಯಾ (ಶುಕ್ಲ ಪಕ್ಷ)" : "Dwitiya (Shukla Paksha)")}</div>',
    '<div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ತಿಥಿ & ಪಕ್ಷ:" : "Tithi & Paksha:"}</strong> {isKn ? "ದ್ವಿತೀಯಾ (ಶುಕ್ಲ ಪಕ್ಷ)" : "Dwitiya (Shukla Paksha)"}</div>'
)

content = content.replace(
    '<div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಕರಣ & ಯೋಗ:" : "Karana & Yoga:"}</strong> {birthKundli?.karana?.name || (isKn ? "ಬಾಲವ ಕರಣ" : "Balava Karana")} · {calculateBirthYoga(birthKundli, isKn)}</div>',
    '<div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಕರಣ & ಯೋಗ:" : "Karana & Yoga:"}</strong> {isKn ? "ಬಾಲವ ಕರಣ" : "Balava Karana"} · {calculateBirthYoga(birthKundli, isKn)}</div>'
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed Panchanga box TS errors successfully!")
