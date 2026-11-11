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

  it("renders live Baggona Panchanga and Prashna clock dashboard banner", () => {
    render(<BaggonaAstrologyQAPage />);

    expect(screen.getByText(/ಇಂದಿನ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ & ಲೈವ್ ಪ್ರಶ್ನ ಮುಹೂರ್ತ ಗಡಿಯಾರ/i)).toBeInTheDocument();
    expect(screen.getByText(/ತಿಥಿ \(Tithi\)/i)).toBeInTheDocument();
    expect(screen.getByText(/ನಕ್ಷತ್ರ \(Star\)/i)).toBeInTheDocument();
    expect(screen.getByText(/ಪ್ರಸ್ತುತ ಹೋರಾ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಚೋಘಡಿಯಾ/i)).toBeInTheDocument();
  });

  it("renders Avakahada Chakra resolution card for 'Hiranya Aksha' name inquiry", async () => {
    render(<BaggonaAstrologyQAPage />);

    const textarea = screen.getByPlaceholderText(/ನಿಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ/i);
    fireEvent.change(textarea, {
      target: { value: "Hiranya Aksha whose name it is, which nakshatra and pada?" }
    });

    const submitBtn = screen.getByText(/ಪ್ರಶ್ನೆ ಕೇಳಿ/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/ಬೃಹತ್ ಪರಾಶರ ಅವಕಹಡಾ ಚಕ್ರ/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getAllByText(/ಪುನರ್ವಸು/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/೪ನೇ ಪಾದ/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ಕರ್ಕಾಟಕ/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/ಅದಿತಿ ದೇವಿ/i)).toBeInTheDocument();
  });

  it("renders Marana & Shraddha Tithi determination card when question includes death date", async () => {
    render(<BaggonaAstrologyQAPage />);

    const textarea = screen.getByPlaceholderText(/ನಿಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ/i);
    fireEvent.change(textarea, {
      target: { value: "ತೀರಿಕೊಂಡ ದಿನಾಂಕ 2023-04-12, ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಪ್ರಕಾರ 2026ರ ಪ್ರತ್ಯಾಬ್ದಿಕ ಶ್ರಾದ್ಧ ಯಾವಾಗ?" }
    });

    const submitBtn = screen.getByText(/ಪ್ರಶ್ನೆ ಕೇಳಿ/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/ಬಗ್ಗೋಣ ಮರಣೋತ್ತರ & ಪ್ರತ್ಯಾಬ್ದಿಕ ಶ್ರಾದ್ಧ ತಿಥಿ ನಿರ್ಣಯ/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/ಧರ್ಮಸಿಂಧು & ನಿರ್ಣಯಸಿಂಧು ಅಪರಾಹ್ನ ವ್ಯಾಪ್ತಿ ಸಿದ್ಧಾಂತ/i)).toBeInTheDocument();
    expect(screen.getAllByText(/2023-04-12/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/ಶ್ರಾದ್ಧ ಅಪರಾಹ್ನ ಕಾಲ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಮುಕ್ತಿ ಸೇವೆಗಳು:/i)).toBeInTheDocument();
  });

  it("renders Hotel Surrender & Rina Vimochana Card when question asks about business closure", async () => {
    render(<BaggonaAstrologyQAPage />);

    const textarea = screen.getByPlaceholderText(/ನಿಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ/i);
    fireEvent.change(textarea, {
      target: { value: "ಹೊಟೇಲ್ ಗುತ್ತಿಗೆ ಒಪ್ಪಿಸಲು ಅಥವಾ ವ್ಯಾಪಾರ ಸಮಾಪ್ತಿ ಮಾಡಲು ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಪ್ರಕಾರ ಮುಹೂರ್ತ ಯಾವುದು?" }
    });

    const submitBtn = screen.getByText(/ಪ್ರಶ್ನೆ ಕೇಳಿ/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/ಬಗ್ಗೋಣ ಋಣ ಮುಕ್ತಿ & ವ್ಯಾಪಾರ\/ಹೊಟೇಲ್ ಒಪ್ಪಿಸುವ ಮುಹೂರ್ತ/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/ಮಂಗಳವಾರ ಭೌಮೇ ಋಣವಿಮೋಚನಮ್ & ಚರ ಲಗ್ನ ಸಿದ್ಧಾಂತ/i)).toBeInTheDocument();
    expect(screen.getByText(/ವರ್ಜ್ಯ ನಿಯಮಗಳು:/i)).toBeInTheDocument();
    expect(screen.getByText(/ಋಣಮೋಚಕ ಮಂತ್ರ:/i)).toBeInTheDocument();
  });

  it("renders Festival & Vrata Card when question asks about Ganesha Chaturthi", async () => {
    render(<BaggonaAstrologyQAPage />);

    const textarea = screen.getByPlaceholderText(/ನಿಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ/i);
    fireEvent.change(textarea, {
      target: { value: "ವರಸಿದ್ಧಿ ವಿನಾಯಕ ವ್ರತ ಗಣೇಶ ಚತುರ್ಥಿ ಯಾವಾಗ ಬರುತ್ತದೆ ಮತ್ತು ಪೂಜಾ ಮುಹೂರ್ತ ತಿಳಿಸಿ" }
    });

    const submitBtn = screen.getByText(/ಪ್ರಶ್ನೆ ಕೇಳಿ/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/ಗಣೇಶ ಚತುರ್ಥಿ/i).length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    expect(screen.getByText(/ಶುಭ ಪೂಜಾ ಮುಹೂರ್ತ/i)).toBeInTheDocument();
    expect(screen.getByText(/ವ್ರತ ಮಹತ್ವ/i)).toBeInTheDocument();
    expect(screen.getByText(/ವ್ರತ ವಿಧಿ & ಸಂಕಲ್ಪ:/i)).toBeInTheDocument();
  });

  it("renders Personal Horoscope Card with health, ayush, namakarana, and dosha tabs when birth details with pincode are provided", async () => {
    render(<BaggonaAstrologyQAPage />);

    const textarea = screen.getByPlaceholderText(/ನಿಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ/i);
    fireEvent.change(textarea, {
      target: { value: "ಹೆಸರು ವಿನಾಯಕ, ಹುಟ್ಟಿದ ದಿನಾಂಕ 1990-05-15, ಸಮಯ 10:30 AM, ಗೋಕರ್ಣ 581326. ನನ್ನ ಆರೋಗ್ಯ, ೬ನೇ ಭಾವ ಮತ್ತು ದೈವಿಕ ಪರಿಹಾರ ತಿಳಿಸಿ." }
    });

    const submitBtn = screen.getByText(/ಪ್ರಶ್ನೆ ಕೇಳಿ/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/ಬಗ್ಗೋಣ ವೈಯಕ್ತಿಕ ಜನ್ಮಕುಂಡಲಿ, ಆರೋಗ್ಯ & ಆಯುಷ್ಯ ನಿರ್ಣಯ/i)).toBeInTheDocument();
    }, { timeout: 3500 });

    expect(screen.getAllByText(/ವಿನಾಯಕ/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/581326/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/ತ್ರಿದೋಷ ವಿಶ್ಲೇಷಣೆ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಶಾಸ್ತ್ರೋಕ್ತ ಧನ್ವಂತರಿ & ಆಯುಷ್ಯ ಪರಿಹಾರ ಹೋಮಗಳು:/i)).toBeInTheDocument();

    // Test switching to Ayush tab
    const ayushTabBtns = screen.getAllByRole("button", { name: /ಆಯುಷ್ಯ ನಿರ್ಣಯ/i });
    fireEvent.click(ayushTabBtns[ayushTabBtns.length - 1]);
    expect(screen.getByText(/ಪರಾಶರಿ ಆಯುರ್ದಾಯ ವರ್ಗ/i)).toBeInTheDocument();
    expect(screen.getByText(/ದೈವಿಕ ಸಂರಕ್ಷಕ ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಜೀವಿನಿ ಮಂತ್ರ/i)).toBeInTheDocument();

    // Test switching to Namakarana tab
    const namakaranaTabBtns = screen.getAllByRole("button", { name: /ನಾಮಕರಣ/i });
    fireEvent.click(namakaranaTabBtns[namakaranaTabBtns.length - 1]);
    expect(screen.getByText(/ಜನ್ಮ ನಕ್ಷತ್ರ ಪಾದದ ಪ್ರಧಾನ ನಾಮಾಕ್ಷರ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಶಾಸ್ತ್ರೋಕ್ತ ಶುಭ ಶಿಶು ನಾಮಾವಳಿ/i)).toBeInTheDocument();

    // Test switching to Doshas tab
    const doshasTabBtns = screen.getAllByRole("button", { name: /ದೋಷಗಳು/i });
    fireEvent.click(doshasTabBtns[doshasTabBtns.length - 1]);
    expect(screen.getByText(/ಪರಾಶರಿ ಸರ್ವ ದೋಷ ಪರೀಕ್ಷೆ:/i)).toBeInTheDocument();
  });
});
