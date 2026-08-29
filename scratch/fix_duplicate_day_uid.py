filepath = "src/features/seva/icsCalendarGenerator.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("    const dayUid = `baggona-day-${ymdCompact}-${sanitizedDevoteeToken}@baggona.app`;\n    const masterSeriesUid", "    const masterSeriesUid")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Removed duplicate dayUid declaration in icsCalendarGenerator.ts successfully.")
