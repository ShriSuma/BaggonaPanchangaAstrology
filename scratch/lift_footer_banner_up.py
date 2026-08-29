import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

old_footer_style = '''          {/* Footer Banner - Moved up substantially by ~30px with 24px bottom clearance */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "8px 14px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "8px",
            marginBottom: "28px"
          }}>'''

new_footer_style = '''          {/* Footer Banner - Explicitly shifted UPWARDS by 22px inside double border frame */}
          <div style={{
            position: "relative",
            top: "-22px",
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "8px 14px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "0px",
            marginBottom: "0px"
          }}>'''

if old_footer_style in content:
    content = content.replace(old_footer_style, new_footer_style)
    print("Page 1 footer shifted UP by 22px successfully!")
else:
    print("Could not find exact string, applying regex replace...")
    content = re.sub(
        r'marginBottom:\s*"28px"',
        'position: "relative",\n            top: "-22px",\n            marginBottom: "0px"',
        content
    )
    print("Replaced via regex!")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
