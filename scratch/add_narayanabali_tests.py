file_test = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/tests/sevaPdfQrCodeAndLayout.test.tsx"
with open(file_test, "r", encoding="utf-8") as f:
    content = f.read()

new_tests = """
  it("ensures Page 5 renders distinct Vedic details for Narayana Bali, Narayana Bali & Tripindi, and Narayana Bali & Pretoddhara", () => {
    // 1. Standalone Narayana Bali
    const { unmount: unmount1 } = render(
      <SevaPoojaMahatmePrint
        lang="kn"
        identity={mockIdentity}
        panditName="ವೆಂಕಟರಮಣ ಪಂಡಿತ್"
        primarySeva={{
          seva: SEVA_CATALOG.narayanabali,
          score: 0,
          reasons: []
        } as any}
      />
    );
    expect(screen.getAllByText(/ನಾರಾಯಣ ಬಲಿ/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/ವಿಷ್ಣುಲೋಕ ಪ್ರಾಪ್ತಿಯನ್ನು ಕರುಣಿಸುವ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಏಳು ತಲೆಮಾರಿನ ಪಿತೃಗಳಿಗೆ ಮುಕ್ತಿ ಲಭಿಸಿ/i)).toBeInTheDocument();
    unmount1();

    // 2. Narayana Bali & Tripindi Shraddha
    const { unmount: unmount2 } = render(
      <SevaPoojaMahatmePrint
        lang="kn"
        identity={mockIdentity}
        panditName="ವೆಂಕಟರಮಣ ಪಂಡಿತ್"
        primarySeva={{
          seva: SEVA_CATALOG.narayanabali_tripindi,
          score: 0,
          reasons: []
        } as any}
      />
    );
    expect(screen.getAllByText(/ನಾರಾಯಣ ಬಲಿ ಹಾಗೂ ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/ಸಾತ್ವಿಕ, ರಾಜಸಿಕ ಹಾಗೂ ತಾಮಸಿಕ ಮೂರು ವಿಧದ ಪೂರ್ವಜರಿಗೆ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಮೂರು ತಲೆಮಾರಿನ ಪಿತೃಗಳಿಗೆ ಪರಿಪೂರ್ಣ ಮುಕ್ತಿ ದೊರೆತು/i)).toBeInTheDocument();
    unmount2();

    // 3. Narayana Bali & Pretoddhara Shanti
    const { unmount: unmount3 } = render(
      <SevaPoojaMahatmePrint
        lang="kn"
        identity={mockIdentity}
        panditName="ವೆಂಕಟರಮಣ ಪಂಡಿತ್"
        primarySeva={{
          seva: SEVA_CATALOG.narayanabali_pretoddhara,
          score: 0,
          reasons: []
        } as any}
      />
    );
    expect(screen.getAllByText(/ನಾರಾಯಣ ಬಲಿ ಹಾಗೂ ಪ್ರೇತೋದ್ಧಾರ/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/ಅಕಾಲ ಮರಣ, ಅಪಮೃತ್ಯು ಅಥವಾ ಅತೃಪ್ತಿಯಿಂದ ಸಂಕಷ್ಟಕ್ಕೀಡಾದ ಆತ್ಮಗಳ ಮುಕ್ತಿಗಾಗಿ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಅತೃಪ್ತ ಆತ್ಮಗಳಿಗೆ ಪ್ರೇತತ್ವದಿಂದ ಮುಕ್ತಿ ಹಾಗೂ ಮೋಕ್ಷ ಪ್ರಾಪ್ತಿಯಾಗಿ/i)).toBeInTheDocument();
    unmount3();
  });
});
"""

last_index = content.rfind("});")
if last_index != -1:
    content = content[:last_index] + new_tests

with open(file_test, "w", encoding="utf-8") as f:
    f.write(content)

print("Appended Narayana Bali tests to sevaPdfQrCodeAndLayout.test.tsx!")
