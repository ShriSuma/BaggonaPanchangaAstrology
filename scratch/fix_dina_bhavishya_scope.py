filepath = "src/pages/DailyDarshanaPage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace wrong variable names in Tab 5 view
content = content.replace("isKn", 'lang === "kn"')
content = content.replace("displayName", "devoteeDisplayName")
content = content.replace("rashiIdx", "moonRashiIdx")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed variable names in Dina Bhavishya Tab 5 view successfully!")
