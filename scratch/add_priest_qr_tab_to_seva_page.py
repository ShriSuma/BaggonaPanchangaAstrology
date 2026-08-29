filepath = "src/pages/SevaPage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
import_line = 'import RoyalBookletTab from "../components/seva/RoyalBookletTab";\nimport PriestQrGeneratorTab from "../components/seva/PriestQrGeneratorTab";'
content = content.replace('import RoyalBookletTab from "../components/seva/RoyalBookletTab";', import_line)

# 2. Update type SevaTab
old_type = 'type SevaTab = "seva" | "calendar" | "prasada" | "royal";'
new_type = 'type SevaTab = "seva" | "calendar" | "prasada" | "royal" | "priestQr";'
content = content.replace(old_type, new_type)

# 3. Add tab item in tabs array
old_tabs_end = '''      label: pick({
        kn: "👑 ೮ ಪುಟಗಳ ರಾಯಲ್ ಗ್ರಂಥ (₹1,200)",
        hi: "👑 8-पृष्ठ रॉयल ग्रंथ (₹1,200)",
        te: "👑 8-పేజీల రాయల్ ಗ್ರంథం (₹1,200)",
        ta: "👑 8-பக்க ராயல் நூல் (₹1,200)",
        en: "👑 8-Page Royal Booklet (₹1,200)"
      }, lang)
    }
  ];'''

new_tabs_end = '''      label: pick({
        kn: "👑 ೮ ಪುಟಗಳ ರಾಯಲ್ ಗ್ರಂಥ (₹1,200)",
        hi: "👑 8-पृष्ठ रॉयल ग्रंथ (₹1,200)",
        te: "👑 8-పేజీల రాయల్ ಗ್ರంథం (₹1,200)",
        ta: "👑 8-பக்க ராயல் நூல் (₹1,200)",
        en: "👑 8-Page Royal Booklet (₹1,200)"
      }, lang)
    },
    {
      id: "priestQr",
      label: pick({
        kn: "📱 ಪೂಜಾರಿ QR ಜನರೇಟರ್",
        hi: "📱 पुजारी QR जनरेटर",
        te: "📱 పూజారి QR జనరేటర్",
        ta: "📱 பூசாரி QR ஜெனரேட்டர்",
        en: "📱 Priest QR Generator"
      }, lang)
    }
  ];'''

content = content.replace(old_tabs_end, new_tabs_end)

# 4. Add tab render block
old_tab_render = '''      {tab === "royal" && (
        <Card>
          <RoyalBookletTab
            rhythm={rhythm}
            identity={identity}
            lang={lang}
          />
        </Card>
      )}'''

new_tab_render = '''      {tab === "royal" && (
        <Card>
          <RoyalBookletTab
            rhythm={rhythm}
            identity={identity}
            lang={lang}
          />
        </Card>
      )}

      {tab === "priestQr" && (
        <Card>
          <PriestQrGeneratorTab identity={identity} lang={lang} />
        </Card>
      )}'''

content = content.replace(old_tab_render, new_tab_render)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated SevaPage.tsx with Priest QR Generator tab.")
