import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add valPob to type definition in PAGE1_DICT interface
content = content.replace(
    'lblPob: string;\n  padaText: string;',
    'lblPob: string;\n  valPob: string;\n  padaText: string;'
)

# 2. Update kn entry in PAGE1_DICT
content = content.replace(
    'lblPob: "ಜನನ ಸ್ಥಳ",',
    'lblPob: "ಜ್ಯೋತಿಷ್ಯ ಗ್ರಂಥ ಸಿದ್ಧ ಕ್ಷೇತ್ರ",\n    valPob: "ಕಾರ್ ರಸ್ತೆ, ಗೋಕರ್ಣ, ಕುಮಟಾ, ಉತ್ತರ ಕನ್ನಡ, ಕರ್ನಾಟಕ",'
)

# 3. Update en entry in PAGE1_DICT
content = content.replace(
    'lblPob: "Place of Birth",',
    'lblPob: "Astrology Book Sacred Place",\n    valPob: "Car Street, Gokarna, Kumta, Uttara Kannada, Karnataka",'
)

# 4. Update hi entry in PAGE1_DICT
content = content.replace(
    'lblPob: "जन्म स्थान",',
    'lblPob: "ज्योतिष ग्रंथ सिद्ध क्षेत्र",\n    valPob: "कार स्ट्रीट, गोकर्ण, कुमटा, उत्तर कन्नड़, कर्नाटक",'
)

# 5. Update te entry in PAGE1_DICT
content = content.replace(
    'lblPob: "జనన స్థలం",',
    'lblPob: "జ్యోతిష్య గ్రంథ సిద్ధ క్షేత్రం",\n    valPob: "కార్ స్ట్రీట్, గోకర్ణ, కుమటా, ఉత్తర కన్నడ, కర్ణాటక",'
)

# 6. Update ta entry in PAGE1_DICT
content = content.replace(
    'lblPob: "பிறந்த இடம்",',
    'lblPob: "ஜோதிட நூல் புனித க்ஷேத்ரம்",\n    valPob: "கார் தெரு, கோகர்ணா, குமடா, உத்தர கன்னடா, கர்நாடகா",'
)

# 7. Update Card 7 JSX on Page 1 to use valPob and temple icon 🛕
old_card7_jsx = '''              {/* Card 7: Place of Birth */}
              <div style={{
                gridColumn: "span 2",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
              }}>
                <span style={{ fontSize: "17px" }}>📍</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblPob}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>{pobStr}</span>
                </div>
              </div>'''

new_card7_jsx = '''              {/* Card 7: Astrology Book Sacred Place */}
              <div style={{
                gridColumn: "span 2",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
              }}>
                <span style={{ fontSize: "17px" }}>🛕</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblPob}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).valPob}
                  </span>
                </div>
              </div>'''

content = content.replace(old_card7_jsx, new_card7_jsx)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated Page 1 Card 7 to Astrology Book Sacred Place and Car Street address successfully!")
