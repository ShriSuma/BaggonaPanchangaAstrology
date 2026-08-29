filepath = "src/features/seva/icsCalendarGenerator.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Restore UID:baggona-day-${ymdCompact}-${sanitizedDevoteeToken}@baggona.app while keeping RELATED-TO parent series link for bulk series deletion
old_event_lines = '''    const masterSeriesUid = `baggona-series-${sanitizedDevoteeToken}@baggona.app`;
    const eventLines: string[] = [
      "BEGIN:VEVENT",
      `UID:${masterSeriesUid}`,
      `RECURRENCE-ID;TZID=Asia/Kolkata:${dtStart}`,
      `SEQUENCE:${idx}`,
      `X-BAGBONA-SERIES-ID:${sanitizedDevoteeToken}`,'''

new_event_lines = '''    const dayUid = `baggona-day-${ymdCompact}-${sanitizedDevoteeToken}@baggona.app`;
    const masterSeriesUid = `baggona-series-${sanitizedDevoteeToken}@baggona.app`;
    const eventLines: string[] = [
      "BEGIN:VEVENT",
      `UID:${dayUid}`,
      `RELATED-TO;RELTYPE=PARENT:${masterSeriesUid}`,
      `X-BAGBONA-SERIES-ID:${sanitizedDevoteeToken}`,
      `SEQUENCE:${idx}`,'''

if old_event_lines in content:
    content = content.replace(old_event_lines, new_event_lines)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Restored distinct day UID contract with parent series link in icsCalendarGenerator.ts")
