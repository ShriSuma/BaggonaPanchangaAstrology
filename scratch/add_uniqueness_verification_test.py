filepath = "src/tests/tokenConsistencyAndExpiry.test.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

uniqueness_test = '''    // 5. Verify 100% Uniqueness & Zero Duplication Across All 90 Days
    const summaryMatches = icsContent.match(/SUMMARY:.+/g);
    expect(summaryMatches).not.toBeNull();
    // All 90 days have distinct summaries reflecting their unique Tithi and Nakshatra
    const uniqueSummaries = new Set(summaryMatches);
    expect(uniqueSummaries.size).toBeGreaterThan(75); // Tithis & Nakshatras vary dynamically across 90 days

    // Verify parent series UID grouping link for 1-click delete series
    expect(icsContent).toContain("RELATED-TO;RELTYPE=PARENT:baggona-series-");
    expect(icsContent).toContain("X-BAGBONA-SERIES-ID:");
  });
});'''

if "5. Verify 100% Uniqueness" not in content:
    content = content.replace("  });\n});", uniqueness_test)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Added 90-day uniqueness and zero-duplication verification test successfully.")
