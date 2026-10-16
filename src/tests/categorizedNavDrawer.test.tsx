import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import CategorizedNavDrawer from "../components/navigation/CategorizedNavDrawer";
import { T_DRAWER_NAV, getNavLabel, type SupportedNavLang } from "../i18n/navigationLocale";
import { useAppStore } from "../stores/appStore";

describe("CategorizedNavDrawer Suite", () => {
  beforeEach(() => {
    cleanup();
    useAppStore.setState({
      currentPage: "home",
      language: "kn"
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("1. 5-Language Locale Integrity > guarantees all category titles exist across kn, en, hi, te, ta", () => {
    const requiredCategories = [
      "cat_panchanga_calendar",
      "cat_kundli_predictions",
      "cat_seva_pooja",
      "cat_mystic_shastra",
      "cat_admin_system",
      "searchPlaceholder",
      "expandAll",
      "collapseAll",
      "activePage",
      "noResults",
      "clearSearch"
    ];

    const langs: SupportedNavLang[] = ["kn", "en", "hi", "te", "ta"];

    for (const key of requiredCategories) {
      expect(T_DRAWER_NAV[key]).toBeDefined();
      for (const lang of langs) {
        const text = getNavLabel(key, lang);
        expect(text).toBeDefined();
        expect(text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("2. Rendering & Structure > renders distinct category headers when open", () => {
    const onClose = vi.fn();
    render(
      <CategorizedNavDrawer
        isOpen={true}
        onClose={onClose}
        role="superadmin"
        isMasterOrSuperAdmin={true}
        language="kn"
        currentUser="baggona"
        hasPanchanga={true}
        hasSankhya={true}
        hasDiksuchi={true}
        hasPurvaJanma={true}
        hasPublicKundli={true}
      />
    );

    // Verify category headings in Kannada
    expect(screen.getByText(/ಪಂಚಾಂಗ & ದಿನದರ್ಶನ/)).toBeDefined();
    expect(screen.getByText(/ಜನ್ಮ ಕುಂಡಲಿ & ಭವಿಷ್ಯ ವಾಚನ/)).toBeDefined();
    expect(screen.getByText(/ವೈದಿಕ ಸೇವೆ, ಪೂಜೆ & ಪರಿಹಾರ/)).toBeDefined();
    expect(screen.getByText(/ರಹಸ್ಯ ಶಾಸ್ತ್ರಗಳು & ಸಂಶೋಧನೆ/)).toBeDefined();
    expect(screen.getByText(/ಆಡಳಿತ & ಖಾತೆ ನಿರ್ವಹಣೆ/)).toBeDefined();
  });

  it("3. Accordion & Expand All / Collapse All > toggles category visibility smoothly", () => {
    const onClose = vi.fn();
    render(
      <CategorizedNavDrawer
        isOpen={true}
        onClose={onClose}
        role="superadmin"
        isMasterOrSuperAdmin={true}
        language="en"
        currentUser="superadmin"
        hasPanchanga={true}
        hasSankhya={true}
        hasDiksuchi={true}
        hasPurvaJanma={true}
        hasPublicKundli={true}
      />
    );

    // Click "Expand All"
    const expandAllBtn = screen.getByText("Expand All");
    fireEvent.click(expandAllBtn);

    // All categories should now have their items visible
    expect(screen.getByText("Auspicious Muhurthas")).toBeDefined();
    expect(screen.getByText("Devotee Astrology & Remedy Package")).toBeDefined();
    expect(screen.getByText("Numerology")).toBeDefined();
    expect(screen.getByText("Super Admin Control Center")).toBeDefined();

    // Click "Collapse All"
    const collapseAllBtn = screen.getByText("Collapse All");
    fireEvent.click(collapseAllBtn);

    // Subitems should be collapsed (not in DOM)
    expect(screen.queryByText("Auspicious Muhurthas")).toBeNull();
    expect(screen.queryByText("Numerology")).toBeNull();
  });

  it("4. Real-time Search Filtering > instantly filters options and expands matching categories", () => {
    const onClose = vi.fn();
    render(
      <CategorizedNavDrawer
        isOpen={true}
        onClose={onClose}
        role="superadmin"
        isMasterOrSuperAdmin={true}
        language="kn"
        currentUser="baggona"
        hasPanchanga={true}
        hasSankhya={true}
        hasDiksuchi={true}
        hasPurvaJanma={true}
        hasPublicKundli={true}
      />
    );

    const searchInput = screen.getByPlaceholderText(/ಮೆನುವಿನಲ್ಲಿ ಹುಡುಕಿ/);

    // Type "ಪೂಜೆ" or "pooja" to find pooja related items
    fireEvent.change(searchInput, { target: { value: "ಪೂಜಾ" } });

    // Matching items should be visible
    expect(screen.getByText(/ಪೂಜಾ ಯೋಜನೆ/)).toBeDefined();
    expect(screen.getByText(/ಪೂಜಾ ವಿಧಿ/)).toBeDefined();

    // Non-matching items like Numerology should be filtered out
    expect(screen.queryByText("ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ")).toBeNull();
  });

  it("5. Navigation Action > sets currentPage in appStore and triggers onClose when clicked", () => {
    const onClose = vi.fn();
    render(
      <CategorizedNavDrawer
        isOpen={true}
        onClose={onClose}
        role="superadmin"
        isMasterOrSuperAdmin={true}
        language="en"
        currentUser="baggona"
        hasPanchanga={true}
        hasSankhya={true}
        hasDiksuchi={true}
        hasPurvaJanma={true}
        hasPublicKundli={true}
      />
    );

    // Expand all to access any item
    fireEvent.click(screen.getByText("Expand All"));

    const calendarBtn = screen.getByText("Calendar (Baggona Panchanga)");
    fireEvent.click(calendarBtn);

    expect(useAppStore.getState().currentPage).toBe("calendar");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
