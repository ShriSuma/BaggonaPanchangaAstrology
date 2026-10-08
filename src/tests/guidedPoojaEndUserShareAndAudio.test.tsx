import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import {
  generateGuidedPoojaShareUrl,
  parseGuidedPoojaFromUrl
} from "../features/pooja/guidedPoojaUrlService";
import { GuidedPoojaDevoteeView } from "../components/pooja/GuidedPoojaDevoteeView";

describe("Guided Pooja End-User Share URL & Single Tab Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("generates share URL with only 1 Vrata and no default poojas", () => {
    const url = generateGuidedPoojaShareUrl({
      poojaKeys: [],
      vrataKeys: ["kalyana_mangalagauri_vrata"],
      activeCategory: "vratas",
      devoteeName: "ಸುಮಾ",
      devoteePhone: "9876543210",
      devoteeEmail: "devotee@example.com"
    });

    expect(url).toContain("vratas=kalyana_mangalagauri_vrata");
    expect(url).not.toContain("poojas=");
    expect(url).toContain("tab=vratas");
    expect(url).toContain("name=%E0%B2%B8%E0%B3%81%E0%B2%AE%E0%B2%BE");
    expect(url).toContain("phone=9876543210");
    expect(url).toContain("email=devotee%40example.com");
  });

  it("parses single Vrata URL correctly into poojaKeys: [] and vrataKeys: ['kalyana_mangalagauri_vrata']", () => {
    const testUrl = "https://baggona.com/guided-pooja?vratas=kalyana_mangalagauri_vrata&phone=9876543210&email=devotee@example.com";
    const config = parseGuidedPoojaFromUrl(testUrl);

    expect(config.poojaKeys).toEqual([]);
    expect(config.vrataKeys).toEqual(["kalyana_mangalagauri_vrata"]);
    expect(config.activeCategory).toBe("vratas");
    expect(config.devoteePhone).toBe("9876543210");
    expect(config.devoteeEmail).toBe("devotee@example.com");
  });

  it("renders only 1 tab when only 1 Vrata is provided, hiding category switcher", () => {
    render(
      <GuidedPoojaDevoteeView
        poojaKeys={[]}
        vrataKeys={["kalyana_mangalagauri_vrata"]}
        initialCategory="vratas"
        devoteeName="ಸುಮಾ"
        devoteePhone="9876543210"
        devoteeEmail="devotee@example.com"
      />
    );

    // The dual category toggle (ನಿತ್ಯ ಪೂಜೆಗಳು | ಪುಣ್ಯ ವ್ರತಗಳು) must NOT appear
    expect(screen.queryByText(/ನಿತ್ಯ ಪೂಜಾ ವಿಧಿ/)).toBeNull();

    // The single Vrata title should be present
    expect(screen.getAllByText(/ಮಂಗಳಗೌರೀ/).length).toBeGreaterThan(0);
  });

  it("prompts first-time devotee for contact info when not provided in URL or localStorage", async () => {
    render(
      <GuidedPoojaDevoteeView
        poojaKeys={[]}
        vrataKeys={["kalyana_mangalagauri_vrata"]}
        initialCategory="vratas"
      />
    );

    // After 700ms, the DevoteeContactCaptureModal should open
    await waitFor(
      () => {
        expect(screen.getByText(/ಬಗ್ಗೋಣ ದೇವಸ್ಥಾನ ಭಕ್ತರ ನೋಂದಣಿ/)).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it("does NOT prompt devotee for contact info if phone and email are provided in URL", async () => {
    render(
      <GuidedPoojaDevoteeView
        poojaKeys={[]}
        vrataKeys={["kalyana_mangalagauri_vrata"]}
        initialCategory="vratas"
        devoteePhone="9876543210"
        devoteeEmail="devotee@example.com"
      />
    );

    // Wait 900ms to ensure modal did not trigger
    await new Promise((r) => setTimeout(r, 900));
    expect(screen.queryByText(/ಬಗ್ಗೋಣ ದೇವಸ್ಥಾನ ಭಕ್ತರ ನೋಂದಣಿ/)).toBeNull();
  });
});
