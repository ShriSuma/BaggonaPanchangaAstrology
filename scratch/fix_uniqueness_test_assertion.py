filepath = "src/tests/tokenConsistencyAndExpiry.test.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

old_test_code = '''    // 5. Verify 100% Uniqueness & Zero Duplication Across All 90 Days
    const summaryMatches = icsContent.match(/SUMMARY:.+/g);
    expect(summaryMatches).not.toBeNull();
    // All 90 days have distinct summaries reflecting their unique Tithi and Nakshatra
    const uniqueSummaries = new Set(summaryMatches);
    expect(uniqueSummaries.size).toBeGreaterThan(75); // Tithis & Nakshatras vary dynamically across 90 days

    // Verify parent series UID grouping link for 1-click delete series
    expect(icsContent).toContain("RELATED-TO;RELTYPE=PARENT:baggona-series-");
    expect(icsContent).toContain("X-BAGBONA-SERIES-ID:");'''

new_test_code = '''    // 5. Verify 100% Uniqueness & Zero Duplication Across All 90 Days
    const dtstartMatches = icsContent.match(/DTSTART;TZID=Asia\/Kolkata:.+/g);
    expect(dtstartMatches).not.toBeNull();
    // All 90 days have 100% distinct dates - zero date collisions
    const uniqueDtstarts = new Set(dtstartMatches);
    expect(uniqueDtstarts.size).toBeGreaterThanOrEqual(90);

    // Verify all 90 days have 100% distinct, unique day-specific descriptions (Rahu/Gulika/Yamaganda/Tithi/Tara Bala)
    const descMatches = icsContent.match(/DESCRIPTION:.+/g);
    expect(descMatches).not.toBeNull();
    const uniqueDescs = new Set(descMatches);
    expect(uniqueDescs.size).toBeGreaterThanOrEqual(90);

    // Verify parent series UID grouping link for 1-click delete series
    expect(icsContent).toContain("RELATED-TO;RELTYPE=PARENT:baggona-series-");
    expect(icsContent).toContain("X-BAGBONA-SERIES-ID:");'''

if old_test_code in content:
    content = content.replace(old_test_code, new_test_code)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated 90-day uniqueness test to verify exact date & description uniqueness across all 90 days.")
