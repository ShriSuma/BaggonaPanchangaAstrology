filepath = "src/features/seva/icsCalendarGenerator.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("days.forEach((day) => {", "days.forEach((day, idx) => {")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed days.forEach to include idx parameter successfully!")
