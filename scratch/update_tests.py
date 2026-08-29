file_path_test = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/tests/sevaPdfQrCodeAndLayout.test.tsx"

with open(file_path_test, "r", encoding="utf-8") as f:
    content = f.read()

# Add SevaPoojaMahatmePrint import if needed, and priest directory imports
if "SevaPoojaMahatmePrint" not in content:
    content = content.replace("SevaRemediesAnnualPrint\n} from", "SevaRemediesAnnualPrint,\n  SevaPoojaMahatmePrint\n} from")

if "getPriestProfile" not in content:
    content = content.replace('import { SEVA_CATALOG } from "../data/gokarnaSevas";', 'import { SEVA_CATALOG } from "../data/gokarnaSevas";\nimport { getPriestProfile, getAllPriests } from "../features/seva/sevaPriestDirectory";')

new_tests = """
  it("ensures Venkataramana Pandit exists in priest directory with authentic title and official seal", () => {
    const allPriests = getAllPriests();
    const venkat = allPriests.find((p) => p.id === "venkataramana-pandit");
    expect(venkat).toBeDefined();
    expect(venkat?.name.kn).toBe("ವೆಂಕಟರಮಣ ಪಂಡಿತ್");
    expect(venkat?.name.en).toBe("Venkataramana Pandit");
    expect(venkat?.sealSymbol).toBe("🕉️");
    expect(venkat?.sealColor).toBe("#D4AF37");

    const profile = getPriestProfile("venkataramana-pandit");
    expect(profile.name.kn).toBe("ವೆಂಕಟರಮಣ ಪಂಡಿತ್");
    expect(profile.title.kn).toContain("ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ವೈದಿಕ ಅರ್ಚಕರು");
  });

  it("ensures Page 5 (SevaPoojaMahatmePrint) renders 3 top sections accurately with Venkataramana Pandit and expanded Poojas", () => {
    const sudarshanaSeva = {
      seva: SEVA_CATALOG.sudarshanahoma,
      score: 0,
      reasons: []
    };

    const { unmount } = render(
      <SevaPoojaMahatmePrint
        lang="kn"
        identity={mockIdentity}
        panditName="ವೆಂಕಟರಮಣ ಪಂಡಿತ್"
        primarySeva={sudarshanaSeva as any}
      />
    );

    expect(screen.getByText(/ಶ್ರೀ ಸುದರ್ಶನ ನರಸಿಂಹ ಹೋಮ/i)).toBeInTheDocument();
    expect(screen.getByText(/೧\. ಪೂಜಾ ಮಹಾ ಸಂಕಲ್ಪ/i)).toBeInTheDocument();
    expect(screen.getByText(/೨\. ಪೂಜೆಯ ಕಾರಣ/i)).toBeInTheDocument();
    expect(screen.getByText(/೩\. ದಿವ್ಯ ಫಲಶ್ರುತಿ/i)).toBeInTheDocument();
    expect(screen.getByText(/ವೆಂಕಟರಮಣ ಪಂಡಿತ್/i)).toBeInTheDocument();
    expect(screen.getByText(/೫ \/ ೫|5 \/ 5/)).toBeInTheDocument();
    unmount();

    // Test with Custom Pooja and passed MahatmeData
    render(
      <SevaPoojaMahatmePrint
        lang="en"
        identity={mockIdentity}
        panditName="Venkataramana Pandit"
        primarySeva={{
          seva: {
            id: "custom_pooja" as any,
            icon: "🪔",
            name: { en: "Sri Maha Sudarshana & Lakshmi Kubera Yaga", kn: "ಶ್ರೀ ಮಹಾ ಸುದರ್ಶನ" },
            purpose: { en: "Custom invocation" },
            benefit: { en: "Complete victory and wealth" },
            where: { en: "Sacred Altar" },
            when: { en: "Auspicious Muhurtha" },
            duration: { en: "2 Hours" },
            shloka: { sanskrit: "Om Namo", meaningKn: "", meaningEn: "" }
          },
          score: 0,
          reasons: []
        } as any}
        mahatmeData={{
          whatIsPooja: "A high-frequency cosmic invocation of Sri Sudarshana Chakra and Lakshmi Kubera.",
          whyDoPooja: "To permanently remove severe financial encumbrances and negative eyes.",
          benefitsPooja: "Brings inexhaustible wealth, peace of mind, and invincible divine protection."
        }}
      />
    );

    expect(screen.getByText(/Sri Maha Sudarshana & Lakshmi Kubera Yaga/i)).toBeInTheDocument();
    expect(screen.getByText(/A high-frequency cosmic invocation/i)).toBeInTheDocument();
    expect(screen.getByText(/To permanently remove severe financial encumbrances/i)).toBeInTheDocument();
    expect(screen.getByText(/Brings inexhaustible wealth, peace of mind/i)).toBeInTheDocument();
    expect(screen.getByText(/Venkataramana Pandit/i)).toBeInTheDocument();
  });
});
"""

# Replace the last `});` with new tests
last_index = content.rfind("});")
if last_index != -1:
    content = content[:last_index] + new_tests

with open(file_path_test, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated sevaPdfQrCodeAndLayout.test.tsx successfully!")
