import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Update Footer Banner margin to shift up cleanly
old_footer = '''          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginBottom: "2px"
          }}>'''

new_footer = '''          {/* Footer Banner - Moved up with clear bottom & top margins */}
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

if old_footer in content:
    content = content.replace(old_footer, new_footer)
    print("Page 1 footer banner shifted up successfully!")
else:
    print("Could not find exact footer string, using regex...")
    content = re.sub(
        r'marginBottom:\s*"2px"',
        'marginTop: "6px",\n            marginBottom: "14px"',
        content
    )
    print("Updated via regex!")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
