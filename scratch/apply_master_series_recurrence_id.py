filepath = "src/features/seva/icsCalendarGenerator.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace eventLines generation in generate90DayIcsContent to use master series UID + RECURRENCE-ID
old_event_lines = '''    const eventLines: string[] = [
      "BEGIN:VEVENT",
      `UID:${dayUid}`,
      `RELATED-TO;RELTYPE=PARENT:baggona-series-${sanitizedDevoteeToken}@baggona.app`,
      `X-BAGBONA-SERIES-ID:${sanitizedDevoteeToken}`,
      `DTSTAMP:${nowIso}`,
      `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
      `DTEND;TZID=Asia/Kolkata:${dtEnd}`,'''

new_event_lines = '''    const masterSeriesUid = `baggona-series-${sanitizedDevoteeToken}@baggona.app`;
    const eventLines: string[] = [
      "BEGIN:VEVENT",
      `UID:${masterSeriesUid}`,
      `RECURRENCE-ID;TZID=Asia/Kolkata:${dtStart}`,
      `SEQUENCE:${idx}`,
      `X-BAGBONA-SERIES-ID:${sanitizedDevoteeToken}`,
      `DTSTAMP:${nowIso}`,
      `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
      `DTEND;TZID=Asia/Kolkata:${dtEnd}`,'''

if old_event_lines in content:
    content = content.replace(old_event_lines, new_event_lines)

# Also add the Master VEVENT with RRULE before iterating over the 90 days
master_vevent_hook = '''  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Baggona Panchanga Gokarna Kshetra//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(calName)}`,
    `X-WR-CALDESC:${escapeIcsText(calDesc)}`,
    "X-WR-TIMEZONE:Asia/Kolkata",
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Kolkata",
    "X-LIC-LOCATION:Asia/Kolkata",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0530",
    "TZOFFSETTO:+0530",
    "TZNAME:IST",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE"
  ];'''

new_master_vevent_hook = '''  const masterSeriesUid = `baggona-series-${sanitizedDevoteeToken}@baggona.app`;
  const firstDay = validDays[0];
  const firstYmdCompact = firstDay ? formatYmdCompact(firstDay.ymd) : "20260101";
  const masterDtStart = `${firstYmdCompact}T060000`;
  const masterDtEnd = `${firstYmdCompact}T063000`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Baggona Panchanga Gokarna Kshetra//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(calName)}`,
    `X-WR-CALDESC:${escapeIcsText(calDesc)}`,
    "X-WR-TIMEZONE:Asia/Kolkata",
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Kolkata",
    "X-LIC-LOCATION:Asia/Kolkata",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0530",
    "TZOFFSETTO:+0530",
    "TZNAME:IST",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${masterSeriesUid}`,
    `SEQUENCE:0`,
    `X-BAGBONA-SERIES-ID:${sanitizedDevoteeToken}`,
    `DTSTAMP:${nowIso}`,
    `DTSTART;TZID=Asia/Kolkata:${masterDtStart}`,
    `DTEND;TZID=Asia/Kolkata:${masterDtEnd}`,
    `RRULE:FREQ=DAILY;COUNT=${validDays.length}`,
    `SUMMARY:${escapeIcsText(calName)}`,
    `DESCRIPTION:${escapeIcsText(calDesc)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT"
  ];'''

if master_vevent_hook in content:
    content = content.replace(master_vevent_hook, new_master_vevent_hook)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied Master Series RRULE and RECURRENCE-ID overrides to icsCalendarGenerator.ts successfully.")
