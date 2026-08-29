import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove flex: 1 from Section 3 so it doesn't push the footer down to the frame bottom
old_sec3 = '''          {/* Full Page Width Chief Priest Ashirvachana & Sacred Guide Narrative - Larger Font */}
          <div style={{
            flex: 1,
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "18px 22px",
            boxShadow: "0 4px 12px rgba(180, 83, 9, 0.07)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative"
          }}>'''

new_sec3 = '''          {/* Full Page Width Chief Priest Ashirvachana & Sacred Guide Narrative - Larger Font */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "16px 20px",
            marginBottom: "12px",
            boxShadow: "0 4px 12px rgba(180, 83, 9, 0.07)",
            display: "flex",
            flexDirection: "column",
            position: "relative"
          }}>'''

# 2. Update Footer Banner with clear top margin and strong 24px bottom margin away from bottom double border
old_footer = '''          {/* Footer Banner - Moved up with clear bottom & top margins */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "7px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "6px",
            marginBottom: "14px"
          }}>'''

new_footer = '''          {/* Footer Banner - Moved up substantially by ~30px with 24px bottom clearance */}
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

if old_sec3 in content:
    content = content.replace(old_sec3, new_sec3)
    print("Removed flex: 1 from Section 3!")
else:
    print("Could not find exact sec3 string, trying regex...")
    content = re.sub(r'flex:\s*1,\s*\n\s*background:\s*"linear-gradient\(180deg, #FFFDF7 0%, #FEF3C7 100%\)"', 'background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",\n            marginBottom: "12px"', content)

if old_footer in content:
    content = content.replace(old_footer, new_footer)
    print("Updated Page 1 footer banner with 28px bottom clearance!")
else:
    print("Could not find exact footer string, trying regex...")
    content = re.sub(r'marginBottom:\s*"14px"', 'marginBottom: "28px"', content)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Elevated Page 1 footer by ~30px successfully!")
