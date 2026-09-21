import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { DevoteeDatabaseSearchModal } from "../components/kundli/DevoteeDatabaseSearchModal";
import type { DevoteeProfile } from "../services/devoteeSearchService";
import * as devoteeSearchService from "../services/devoteeSearchService";

describe("DevoteeDatabaseSearchModal", () => {
  const mockDevotees: DevoteeProfile[] = [
    {
      id: "dev-1",
      name: "Ramesh Bhat",
      birthDate: "1985-04-12",
      birthTime: "10:30",
      latitude: 14.5479,
      longitude: 74.3188,
      placeName: "Gokarna",
      pincode: "581326",
      gothra: "Vasishtha",
      gender: "Male",
      rashi: "Tula",
      rashiSanskrit: "ತುಲಾ",
      nakshatra: "Swati",
      nakshatraSanskrit: "ಸ್ವಾತಿ",
      source: "local",
      createdAt: "2026-09-20T10:00:00.000Z"
    },
    {
      id: "dev-2",
      name: "ಪ್ರಮೋದ್ ಕೊಡ್ಗಿ",
      birthDate: "1990-08-15",
      birthTime: "06:45",
      latitude: 14.52,
      longitude: 74.35,
      placeName: "Baggona",
      pincode: "581326",
      gothra: "Kashyapa",
      gender: "Male",
      rashi: "Kanya",
      rashiSanskrit: "ಕನ್ಯಾ",
      nakshatra: "Hasta",
      nakshatraSanskrit: "ಹಸ್ತ",
      source: "cloud",
      createdAt: "2026-09-21T09:00:00.000Z"
    }
  ];

  beforeEach(() => {
    vi.spyOn(devoteeSearchService, "fetchDevoteeDatabase").mockResolvedValue(mockDevotees);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders when open and displays devotee cards", async () => {
    const onSelectMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <DevoteeDatabaseSearchModal
        isOpen={true}
        onClose={onCloseMock}
        onSelect={onSelectMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Ramesh Bhat")).toBeDefined();
      expect(screen.getByText("ಪ್ರಮೋದ್ ಕೊಡ್ಗಿ")).toBeDefined();
    });
  });

  it("filters devotee cards live as user types", async () => {
    const onSelectMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <DevoteeDatabaseSearchModal
        isOpen={true}
        onClose={onCloseMock}
        onSelect={onSelectMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Ramesh Bhat")).toBeDefined();
      expect(screen.getByText("ಪ್ರಮೋದ್ ಕೊಡ್ಗಿ")).toBeDefined();
    });

    const searchInput = screen.getByRole("textbox");
    fireEvent.change(searchInput, { target: { value: "ಪ್ರಮೋದ್" } });

    await waitFor(() => {
      expect(screen.getByText("ಪ್ರಮೋದ್ ಕೊಡ್ಗಿ")).toBeDefined();
      expect(screen.queryByText("Ramesh Bhat")).toBeNull();
    });
  });

  it("calls onSelect when a devotee card is clicked", async () => {
    const onSelectMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <DevoteeDatabaseSearchModal
        isOpen={true}
        onClose={onCloseMock}
        onSelect={onSelectMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Ramesh Bhat")).toBeDefined();
    });

    const rameshCard = screen.getByText("Ramesh Bhat").closest("[role='button']");
    expect(rameshCard).not.toBeNull();
    fireEvent.click(rameshCard!);

    expect(onSelectMock).toHaveBeenCalledTimes(1);
    expect(onSelectMock).toHaveBeenCalledWith(mockDevotees[0]);
  });
});
