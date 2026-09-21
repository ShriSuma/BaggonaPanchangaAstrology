import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import KundliPage from "../pages/KundliPage";
import { useAuthStore } from "../features/auth/authStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import { useAppStore } from "../stores/appStore";
import { db } from "../db/indexedDb";
import * as SunApi from "../core/sunriseSunsetApi";
import * as devoteeSearchService from "../services/devoteeSearchService";
import * as locationApi from "../services/locationApi";
import "../i18n";

describe("KundliPage - Devotee Database Search & Auto-Fill Integration", () => {
  let sunSpy: MockInstance;

  const mockDevotees: devoteeSearchService.DevoteeProfile[] = [
    {
      id: "kundli-101",
      name: "Ganesh Hegde",
      birthDate: "1988-11-20",
      birthTime: "08:15",
      latitude: 14.5479,
      longitude: 74.3188,
      placeName: "Gokarna (581326)",
      pincode: "581326",
      gothra: "Vasishtha",
      gender: "Male",
      rashi: "Meena",
      rashiSanskrit: "ಮೀನ",
      nakshatra: "Revati",
      nakshatraSanskrit: "ರೇವತಿ",
      pada: 3,
      source: "cloud",
      createdAt: "2026-09-21T08:00:00.000Z"
    }
  ];

  beforeEach(async () => {
    sunSpy = vi.spyOn(SunApi, "fetchSunriseSunsetUtc").mockResolvedValue({
      sunrise: new Date("2026-05-12T00:34:45+00:00"),
      sunset: new Date("2026-05-12T13:23:25+00:00")
    });
    await db.settings.clear();
    await db.kundlis.clear();
    useKundliViewerStore.getState().clearSession();
    useAppStore.setState({
      defaultLat: 14.5479,
      defaultLng: 74.3188,
      placeLabel: "Gokarna",
      pincode: "581326",
      language: "en"
    });

    vi.spyOn(devoteeSearchService, "fetchDevoteeDatabase").mockResolvedValue(mockDevotees);
    vi.spyOn(locationApi, "resolvePlaceFromPincode").mockResolvedValue({
      villageName: "Gokarna",
      districtCode: "UK",
      stateCode: "KA",
      lat: 14.5479,
      lng: 74.3188,
      pincode: "581326"
    });
    vi.spyOn(locationApi, "fetchVillagesByPincode").mockResolvedValue([
      {
        name: "Gokarna",
        districtCode: "UK",
        lat: 14.5479,
        lng: 74.3188,
        pincode: "581326"
      }
    ]);
  });

  afterEach(() => {
    cleanup();
    sunSpy?.mockRestore();
    vi.restoreAllMocks();
  });

  it("shows search devotee button when logged in as baggona / superadmin", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      currentUser: "baggona",
      role: "priest"
    });

    render(<KundliPage />);

    const searchBtn = screen.getByTitle(/ಡೇಟಾಬೇಸ್‌ನಿಂದ ಭಕ್ತರ ಹೆಸರು ಹುಡುಕಿ|Search Devotee from Database/i);
    expect(searchBtn).toBeDefined();
  });

  it("hides search devotee button when logged in as a normal devotee", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      currentUser: "normal_devotee",
      role: "devotee"
    });

    render(<KundliPage />);

    const searchBtn = screen.queryByTitle(/ಡೇಟಾಬೇಸ್‌ನಿಂದ ಭಕ್ತರ ಹೆಸರು ಹುಡುಕಿ|Search Devotee from Database/i);
    expect(searchBtn).toBeNull();
  });

  it("opens modal and auto-fills form upon clicking devotee card", async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      currentUser: "superadmin",
      role: "superadmin"
    });

    render(<KundliPage />);

    const searchBtn = screen.getByTitle(/ಡೇಟಾಬೇಸ್‌ನಿಂದ ಭಕ್ತರ ಹೆಸರು ಹುಡುಕಿ|Search Devotee from Database/i);
    fireEvent.click(searchBtn);

    // Modal should open and show Ganesh Hegde
    await waitFor(() => {
      expect(screen.getByText("Ganesh Hegde")).toBeDefined();
    });

    // Click Ganesh Hegde card
    const card = screen.getByText("Ganesh Hegde").closest("[role='button']");
    expect(card).not.toBeNull();
    fireEvent.click(card!);

    // Verify auto-fill populated the form name input
    await waitFor(() => {
      const nameInput = screen.getByTestId("kundli-name-input") as HTMLInputElement;
      expect(nameInput.value).toBe("Ganesh Hegde");
    });
  });
});
