import re

file_path = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/components/seva/pdf/SevaPrintTemplates.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Check import
if "getNakshatraMantraInfo" not in content:
    content = content.replace(
        "  formatPanditName,\n  pick,",
        "  formatPanditName,\n  getNakshatraMantraInfo,\n  pick,"
    )

# 2. Update SevaAnugrahaGuidancePrint component
old_block_start = """export const SevaAnugrahaGuidancePrint = ({
  lang,
  identity,
  panditName,
  rhythm
}: {
  lang: string;
  identity: Identity;
  panditName?: string;
  rhythm?: RhythmResult;
}): JSX.Element => {
  const safePanditName = formatPanditName(panditName, lang);"""

new_block_start = """export const SevaAnugrahaGuidancePrint = ({
  lang,
  identity,
  panditName,
  rhythm
}: {
  lang: string;
  identity: Identity;
  panditName?: string;
  rhythm?: RhythmResult;
}): JSX.Element => {
  const safePanditName = formatPanditName(panditName, lang);

  const nakInfo = getNakshatraMantraInfo(identity?.nakshatraIndex ?? rhythm?.janmaNakshatraIndex);
  const nakNameStr = pick(nakInfo.name, lang);
  const deityNameStr = pick(nakInfo.deity, lang);
  const mantraStr = pick(nakInfo.mantra, lang);
  const japaCountStr = pick(nakInfo.japaCount, lang);
  const benefitStr = pick(nakInfo.benefit, lang);"""

content = content.replace(old_block_start, new_block_start)

# Update the 4th item in RULES_LIST
old_rules_item_4 = """    {
      title: { kn: "📿 ಜನ್ಮ ನಕ್ಷತ್ರ ಮಂತ್ರ ಜಪ", hi: "📿 जन्म नक्षत्र मंत्र जप", te: "📿 జన్మ నక్షత్ర మంత్ర జపం", ta: "📿 ஜன்ம நட்சத்திர மந்திர ஜபம்", en: "📿 Nakshatra Beeja Discipline" },
      desc: {
        kn: "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ಅಧಿಪತಿ ಮಂತ್ರವನ್ನು ಪ್ರತಿದಿನ ೧೦೮ ಬಾರಿ ನಿಷ್ಠೆಯಿಂದ ಜಪಿಸುವುದು ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಯಶಸ್ಸು, ಆತ್ಮವಿಶ್ವಾಸ ಹಾಗೂ ನಿರಂತರ ಅಭಿವೃದ್ಧಿಯನ್ನು ತರುತ್ತದೆ.",
        hi: "अपने जन्म नक्षत्र के स्वामी मंत्र का प्रतिदिन १०८ बार निष्ठापूर्वक जाप करें। यह कार्यक्षेत्र में सफलता, आत्मविश्वास और निरंतर उन्नति प्रदान करता है।",
        te: "మీ జన్మ నక్షత్రాధిపతి మంత్రాన్ని ప్రతిరోజూ 108 సార్లు జపించండి. ఇది ఉద్యోగ వ్యాపారాలలో విజయం మరియు ఆత్మవిశ్వాసాన్ని ఇస్తుంది.",
        ta: "உங்கள் ஜன்ம நட்சத்திர அதிபதியின் மந்திரத்தை தினமும் 108 முறை ஜபித்து வரவும். இது தொழில், வியாபாரத்தில் வெற்றி தரும்.",
        en: "Chanting your birth star's ruling planet mantra 108 times daily activates inner confidence, professional growth, and protection."
      }
    }"""

new_rules_item_4 = """    {
      isMantraCard: true,
      title: {
        kn: "📿 ಜನ್ಮ ನಕ್ಷತ್ರ ಮಂತ್ರ ಜಪ",
        hi: "📿 जन्म नक्षत्र मंत्र जप",
        te: "📿 జన్ಮ నಕ್ಷత్ర మంత్ర జపం",
        ta: "📿 ஜன்ம நட்சத்திர மந்திர ஜபம்",
        en: "📿 Nakshatra Mantra Japa"
      },
      desc: nakInfo.benefit
    }"""

content = content.replace(
    "const RULES_LIST: { title: L5; desc: L5 }[] =",
    "const RULES_LIST: { title: L5; desc: L5; isMantraCard?: boolean }[] ="
)
content = content.replace(old_rules_item_4, new_rules_item_4)

# Update the rendering of RULES_LIST
old_render_block = """            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {RULES_LIST.map((rule, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1.5px solid ${GOLD_LIGHT}`,
                    borderRadius: 9,
                    backgroundColor: PANEL,
                    padding: "10px 14px",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 3, lineHeight: 1.4 }}>
                    {pick(rule.title, lang)}
                  </div>
                  <div style={{ fontSize: 10.5, color: INK_SOFT, lineHeight: 1.6 }}>
                    {pick(rule.desc, lang)}
                  </div>
                </div>
              ))}
            </div>"""

new_render_block = """            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {RULES_LIST.map((rule, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1.5px solid ${rule.isMantraCard ? GOLD : GOLD_LIGHT}`,
                    borderRadius: 9,
                    backgroundColor: PANEL,
                    padding: "9px 12px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  {rule.isMantraCard ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: INK, lineHeight: 1.3 }}>
                          {pick(rule.title, lang)}
                        </div>
                        <span style={{ fontSize: 9.5, color: GOLD, fontWeight: 700, backgroundColor: "#FFFFFF", padding: "1px 6px", borderRadius: 4, border: `1px solid ${GOLD_LIGHT}` }}>
                          ★ {nakNameStr}
                        </span>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: `1.5px solid ${GOLD}`,
                          borderRadius: 6,
                          padding: "4px 6px",
                          margin: "2px 0 3px",
                          textAlign: "center",
                          boxShadow: "0 1px 3px rgba(184, 134, 11, 0.08)"
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, letterSpacing: 0.5, lineHeight: 1.3 }}>
                          {mantraStr}
                        </div>
                        <div style={{ fontSize: 9, color: INK_SOFT, fontWeight: 600, marginTop: 1 }}>
                          {deityNameStr} · {japaCountStr}
                        </div>
                      </div>
                      <div style={{ fontSize: 9.5, color: INK_SOFT, lineHeight: 1.45 }}>
                        {benefitStr}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: INK, marginBottom: 3, lineHeight: 1.3 }}>
                        {pick(rule.title, lang)}
                      </div>
                      <div style={{ fontSize: 10, color: INK_SOFT, lineHeight: 1.55 }}>
                        {pick(rule.desc, lang)}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>"""

content = content.replace(old_render_block, new_render_block)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated SevaPrintTemplates.tsx successfully!")
