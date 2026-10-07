import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import BaggonaAstrologyQAPage from "../pages/BaggonaAstrologyQAPage";
import { useAppStore } from "../stores/appStore";

// Mock the Gemini Engine so it deterministically returns mock responses
vi.mock("../core/GeminiEngine", () => ({
  askGemini: vi.fn().mockImplementation(async (title, prompt, key, lang) => {
    return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಮೂಲಾ ನಕ್ಷತ್ರ ೧ನೇ ಪಾದವು ಧನು ರಾಶಿಯ ಗಂಡಾಂತ ಸಂಧಿಯಲ್ಲಿದ್ದು ಕೇತು ಗ್ರಹದ ಅಧಿಪತ್ಯದಲ್ಲಿದೆ. ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಇದು ಯಾವುದೇ ಶಾಶ್ವತ ಅಪಾಯವಲ್ಲ.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಜನನದ ೨೭ನೇ ದಿನದಂದು ಅಥವಾ ಮುಂದಿನ ಶುಕ್ಲ ಪಕ್ಷದ ಶುಭ ದಿನದಂದು ಮೂಲಾ ಶಾಂತಿ ಮುಹೂರ್ತ ನಿಗದಿಪಡಿಸಬೇಕು.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ೨೭ ಕಲಶ ಜಲ ಸ್ನಾನ ಮತ್ತು ಮೂಲಾ ನಕ್ಷತ್ರ ಶಾಂತಿ ಹೋಮ.
೨. ತಂದೆಯು ಕಂಚಿನ ತುಪ್ಪದ ಪಾತ್ರೆಯಲ್ಲಿ ಮಗುವಿನ ಮುಖದ ಪ್ರತಿಬಿಂಬ ನೋಡುವುದು.
೩. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಗೋ-ಸೇವೆ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಶಾಂತಿ ನಂತರ ಮಗು ಅಸಾಧಾರಣ ಪ್ರತಿಭಾವಂತ ನಾಯಕನಾಗುತ್ತಾನೆ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
  })
}));

describe("BaggonaAstrologyQAPage UI Component", () => {
  beforeEach(() => {
    cleanup();
    useAppStore.setState({ language: "kn" });
  });

  it("renders page header, suggestion pills, and query input", () => {
    render(<BaggonaAstrologyQAPage />);

    expect(screen.getAllByText(/ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ/i)[0]).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ನಿಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ/i)).toBeInTheDocument();
  });

  it("clicking a suggestion pill immediately triggers consultation and displays response", async () => {
    render(<BaggonaAstrologyQAPage />);

    // Click the Mula nakshatra pill
    const mulaPill = screen.getByText(/ಮೂಲಾ ೧ನೇ ಪಾದ ಶಾಂತಿ/i);
    fireEvent.click(mulaPill);

    await waitFor(() => {
      expect(screen.getByText(/ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ/i)).toBeInTheDocument();
  });

  it("submits question via textarea and renders 4 structured response cards with priest blessing", async () => {
    render(<BaggonaAstrologyQAPage />);

    const textarea = screen.getByPlaceholderText(/ನಿಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ/i);
    fireEvent.change(textarea, {
      target: { value: "ನನ್ನ ಸ್ನೇಹಿತನ ಮಗ ಮೂಲ ನಕ್ಷತ್ರ 1ನೇ ಪಾದ, ಪರಿಹಾರವೇನು?" }
    });

    const submitBtn = screen.getByText(/ಪ್ರಶ್ನೆ ಕೇಳಿ/i);
    fireEvent.click(submitBtn);

    // Wait for the response sections to render
    await waitFor(() => {
      expect(screen.getByText(/ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ/i)).toBeInTheDocument();
    expect(screen.getByText(/ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ಶ್ರೀರಾಮ್ ಪಂಡಿತ್/i).length).toBeGreaterThan(0);
  });
});
