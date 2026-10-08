import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { GuidedPoojaDevoteeView } from "../components/pooja/GuidedPoojaDevoteeView";
import { GuidedPoojaConfigurator } from "../components/pooja/GuidedPoojaConfigurator";

afterEach(() => {
  cleanup();
});

// Mock audio narrator
vi.mock("../features/pooja/guidedPoojaAudioNarrator", () => ({
  speakGuidedPoojaStep: vi.fn().mockResolvedValue(() => {}),
  stopGuidedPoojaAudio: vi.fn(),
  pauseGuidedPoojaAudio: vi.fn(),
  resumeGuidedPoojaAudio: vi.fn().mockResolvedValue(undefined),
  isGuidedPoojaAudioPaused: vi.fn().mockReturnValue(false),
  seekGuidedPoojaAudio: vi.fn(),
  playTempleBellChime: vi.fn()
}));

describe("Guided Pooja UI Aesthetics & Mobile View Validation (Cream & Gold Royal Altar)", () => {
  it("renders with Royal Cream background and Gold borders (zero dark/black theme)", () => {
    const { container } = render(
      <GuidedPoojaDevoteeView
        poojaKeys={["sandhyavandana", "morning_pooja"]}
        devoteeName="ಪ್ರಮೋದ್"
        priestName="ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
      />
    );

    // Verify root container has cream background class
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("bg-[#FFFDF7]");
    expect(root.className).not.toContain("bg-slate-950");
    expect(root.className).not.toContain("bg-black");

    // Verify priest and devotee names are displayed
    expect(screen.getAllByText(/ಶ್ರೀರಾಮ್ ಪಂಡಿತ್/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ಪ್ರಮೋದ್/).length).toBeGreaterThanOrEqual(1);
  });

  it("dynamically creates exactly 3 tabs when 3 poojas are provided", () => {
    render(
      <GuidedPoojaDevoteeView
        poojaKeys={["sandhyavandana", "morning_pooja", "shiva_pooja"]}
      />
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(screen.getAllByText(/ತ್ರಿಕಾಲ ಸಂಧ್ಯಾವಂದನಾ/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ಪ್ರಾತಃಕಾಲ ನಿತ್ಯ ದೇವತಾ/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ಶ್ರೀ ಶಿವ ಪೂಜಾ/).length).toBeGreaterThanOrEqual(1);
  });

  it("dynamically creates all 5 tabs when all 5 poojas are selected", () => {
    render(
      <GuidedPoojaDevoteeView
        poojaKeys={[
          "sandhyavandana",
          "morning_pooja",
          "evening_pooja",
          "ganapati_pooja",
          "shiva_pooja"
        ]}
      />
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(5);
  });

  it("verifies background priest instructions are hidden by default and toggleable on click", () => {
    render(
      <GuidedPoojaDevoteeView
        poojaKeys={["sandhyavandana"]}
      />
    );

    // Background notes should not be visible initially
    expect(screen.queryByText(/ಬ್ರಾಹ್ಮತೀರ್ಥದಿಂದ/)).not.toBeInTheDocument();

    // Find and click the toggle button
    const toggleBtn = screen.getByText(/ಪುರೋಹಿತರ ಪ್ರಕ್ರಿಯೆ & ವಿಧಿ ಟಿಪ್ಪಣಿ/);
    expect(toggleBtn).toBeInTheDocument();
    fireEvent.click(toggleBtn);

    // Notes now revealed
    expect(screen.getByText(/ಬ್ರಾಹ್ಮತೀರ್ಥದಿಂದ/)).toBeInTheDocument();
  });

  it("allows interactive bead tapping on steps with Japa targets", () => {
    render(
      <GuidedPoojaDevoteeView
        poojaKeys={["shiva_pooja"]}
      />
    );

    // Jump to Step 4 (108 Japa)
    const step4Btn = screen.getByText("ಹಂತ 4");
    fireEvent.click(step4Btn);

    // Check japa counter rendered
    expect(screen.getByText(/ಜಪ ಸಂಖ್ಯೆ ಗುರಿ: 108 ಬಾರಿ/i)).toBeInTheDocument();
    expect(screen.getByText("0 / 108")).toBeInTheDocument();

    // Click increment bead
    const incBtn = screen.getByText(/ಜಪ ಎಣಿಕೆ \(\+೧\)/);
    fireEvent.click(incBtn);
    expect(screen.getByText("1 / 108")).toBeInTheDocument();
  });

  it("switches to Sacred Vratas tab, displays Vrata Mahatmya, and opens Samagri checklist", () => {
    render(
      <GuidedPoojaDevoteeView
        poojaKeys={["sandhyavandana"]}
        vrataKeys={["kalyana_mangalagauri_vrata"]}
        initialCategory="vratas"
        sankalpaKey="vivaha"
        devoteeName="ಸುಮಾ"
        gotra="ಕಾಶ್ಯಪ"
      />
    );

    // Verify Vrata tab active
    expect(screen.getAllByText(/ಶ್ರೀ ಕಲ್ಯಾಣ ಮಂಗಳಗೌರೀ & ಸ್ವಯಂವರ ಪಾರ್ವತೀ ವ್ರತ/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/ವಿವಾಹ ಪ್ರಾಪ್ತಿ ಮಹಾವ್ರತ/)).toBeInTheDocument();

    // Verify Vrata Mahatmya & Purpose section
    expect(screen.getByText(/ವ್ರತ ಮಹಾತ್ಮೆ & ಉದ್ದೇಶ/)).toBeInTheDocument();
    expect(screen.getByText(/೩೨\+ ವರ್ಷ ವಯಸ್ಸಿನವರಲ್ಲೂ/)).toBeInTheDocument();
    expect(screen.getByText(/ಫಲಶ್ರುತಿ/)).toBeInTheDocument();

    // Verify Personalized Sankalpa card
    expect(screen.getByText(/ವೈದಿಕ ವೈಯಕ್ತಿಕ ಸಂಕಲ್ಪ/)).toBeInTheDocument();
    expect(screen.getAllByText(/ವಿವಾಹ ಪ್ರಾಪ್ತಿ/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/🔊 ಸಂಕಲ್ಪ ಪಠಣ/)).toBeInTheDocument();

    // Verify Samagri checklist
    expect(screen.getByText(/ವಸ್ತು & ಸಾಮಗ್ರಿಗಳ ಪಟ್ಟಿ/)).toBeInTheDocument();
    const samagriToggle = screen.getByText(/ಪರಿಶೀಲಿಸಿ ▼/);
    fireEvent.click(samagriToggle);

    // Items revealed
    expect(screen.getByText(/ಮಂಗಳಗೌರಿ ವಿಗ್ರಹ ಅಥವಾ ಅರಿಶಿನದ ಗೌರಿ/)).toBeInTheDocument();
    expect(screen.getByText(/೧೬ ಎಳೆಯ ರಕ್ಷಾಸೂತ್ರ/)).toBeInTheDocument();
  });

  it("allows priest to configure poojas and vratas, view dynamic link, and apply config", () => {
    const handleApply = vi.fn();
    render(
      <GuidedPoojaConfigurator
        initialConfig={{
          poojaKeys: ["sandhyavandana", "evening_pooja"],
          vrataKeys: ["kalyana_mangalagauri_vrata"],
          sankalpaKey: "vivaha",
          devoteeName: "ಸುಮಾ"
        }}
        onApplyConfig={handleApply}
      />
    );

    expect(screen.getByText(/ಪೂಜಾ & ವ್ರತ ಸಂಯೋಜನೆ/)).toBeInTheDocument();
    expect(screen.getByText(/ವೈಯಕ್ತಿಕ ಸಂಕಲ್ಪದ ಉದ್ದೇಶ/)).toBeInTheDocument();

    // Click apply to launch devotee sanctuary
    const launchBtn = screen.getByText(/ಪೂಜೆ ಆರಂಭಿಸಿ/);
    fireEvent.click(launchBtn);

    expect(handleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        poojaKeys: ["sandhyavandana", "evening_pooja"],
        vrataKeys: ["kalyana_mangalagauri_vrata"],
        sankalpaKey: "vivaha",
        devoteeName: "ಸುಮಾ"
      })
    );
  });
});
