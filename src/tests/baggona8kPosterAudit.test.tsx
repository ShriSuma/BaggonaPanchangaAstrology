import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Baggona8kPromoPoster } from "../components/poster/Baggona8kPromoPoster";

describe("Baggona 8K Cashier Desk Poster & Table Tent Standee Audit", () => {
  it("1. Renders Cashier Desk Poster with exact A4 900x1273px dimensions and luxury gold border", () => {
    const { container } = render(<Baggona8kPromoPoster initialMode="cashier_poster" />);

    const poster = container.querySelector("#baggona-cashier-8k-poster") as HTMLElement;
    expect(poster).toBeTruthy();
    expect(poster.style.width).toBe("900px");
    expect(poster.style.height).toBe("1273px");
    expect(poster.style.overflow).toBe("hidden");
  });

  it("2. Features 140+ Years of Sacred Vedic Heritage in both Kannada and English", () => {
    const { container } = render(<Baggona8kPromoPoster initialMode="cashier_poster" />);
    const text = container.textContent || "";

    expect(text).toContain("೧೪೦+ ವರ್ಷಗಳ ಪವಿತ್ರ ಪರಾಶರೀ ಸಿದ್ಧಾಂತ ಜ್ಯೋತಿಷ್ಯ ಪರಂಪರೆ");
    expect(text).toContain("140+ YEARS OF SACRED VEDIC HERITAGE");
    expect(text).toContain("ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ");
  });

  it("3. Displays accurate pricing: Offer 1 ₹330 (was ₹500), Offer 2 ₹430 (was ₹700) with ZERO mention of November", () => {
    const { container } = render(<Baggona8kPromoPoster initialMode="cashier_poster" />);
    const text = container.textContent || "";

    // Offer 1: Standard ₹330 (was ₹500)
    expect(text).toContain("₹330");
    expect(text).toContain("₹500");
    expect(text).toContain("SAVE ₹170!");

    // Offer 2: Complete Package with Remedy ₹430 (was ₹700)
    expect(text).toContain("₹430");
    expect(text).toContain("₹700");
    expect(text).toContain("SAVE ₹270!");

    // Strictly NO mention of "November" or "ನವೆಂಬರ್"
    expect(text.toLowerCase()).not.toContain("november");
    expect(text).not.toContain("ನವೆಂಬರ್");
  });

  it("4. Details South Indian Janana Kundali with Lagna and Maandi/Gulika placements", () => {
    const { container } = render(<Baggona8kPromoPoster initialMode="cashier_poster" />);
    const text = container.textContent || "";

    expect(text).toContain("ದಕ್ಷಿಣ ಭಾರತೀಯ ಶೈಲಿಯ ಜನ್ಮ ಕುಂಡಲಿ");
    expect(text).toContain("South Indian Janana Kundali");
    expect(text).toContain("ಮಾಂದಿ & ಗುಳಿಕ");
    expect(text).toContain("Maandi / Gulika");
    expect(text).toContain("Lagna");
  });

  it("5. Outlines all 10 exhaustive chapters of Premium Bhavishya V1 (40+ pages)", () => {
    const { container } = render(<Baggona8kPromoPoster initialMode="cashier_poster" />);
    const text = container.textContent || "";

    expect(text).toContain("೪೦+ ಪುಟಗಳ ಸಮಗ್ರ ೧೦ ಅಧ್ಯಾಯಗಳು");
    expect(text).toContain("40+ PAGES · 10 CHAPTERS");

    // Check key chapters
    expect(text).toContain("ಜಾತಕ ದರ್ಪಣ");
    expect(text).toContain("ಧನ-ಧಾನ್ಯ, ಕುಟುಂಬ");
    expect(text).toContain("ವಿದ್ಯಾಭ್ಯಾಸ, ಬುದ್ಧಿ");
    expect(text).toContain("ಆರೋಗ್ಯ, ಋಣ ನಿವಾರಣೆ");
    expect(text).toContain("ವಿವಾಹ, ಕಳತ್ರ ಭಾಗ್ಯ");
    expect(text).toContain("ಆಯುಷ್ಯ, ಗಂಡಾಂತರ");
    expect(text).toContain("ಭಾಗ್ಯೋದಯ, ಧರ್ಮ");
    expect(text).toContain("ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ");
    expect(text).toContain("ಲಾಭ, ಐಶ್ವರ್ಯ");
    expect(text).toContain("೧೨೦ ವರ್ಷಗಳ ವಿಂಶೋತ್ತರೀ ಮಹಾದಶಾ-ಭುಕ್ತಿ");
  });

  it("6. Describes Daivika Parihara (Remedy) details for ₹430 package", () => {
    const { container } = render(<Baggona8kPromoPoster initialMode="cashier_poster" />);
    const text = container.textContent || "";

    expect(text).toContain("ದೈವಿಕ ಪರಿಹಾರ & ದೋಷ ಮುಕ್ತಿ ವರದಿ");
    expect(text).toContain("Daivika Parihara Dossier");
    expect(text).toContain("ಕಾಲಸರ್ಪ");
    expect(text).toContain("ಪಿತೃ ದೋಷ");
    expect(text).toContain("೪೫-ದಿನಗಳ ಮಂಡಲ ವ್ರತ ಸಾಧನೆ");
    expect(text).toContain("Mandala Sadhana");
    expect(text).toContain("ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್");
  });

  it("7. Emphasizes 5-Minute Delivery via WhatsApp/Email ZIP and Cashier Desk booking", () => {
    const { container } = render(<Baggona8kPromoPoster initialMode="cashier_poster" />);
    const text = container.textContent || "";

    expect(text).toContain("ಕೇವಲ ೫ ನಿಮಿಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ!");
    expect(text).toContain("Delivered within 5 Minutes!");
    expect(text).toContain("ZIP ಕಡತದಲ್ಲಿ");
    expect(text).toContain("WhatsApp");
    expect(text).toContain("Email");
    expect(text).toContain("ದಯವಿಟ್ಟು ಕ್ಯಾಷಿಯರ್ ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ");
    expect(text).toContain("FOR BOOKING & DETAILS, PLEASE CONTACT THE CASHIER DESK");
  });

  it("8. Renders Table Tent Bi-Fold Standee mode with center fold guide and dual diner sides", () => {
    const { container } = render(<Baggona8kPromoPoster initialMode="table_tent" />);

    const tent = container.querySelector("#baggona-table-tent-8k-poster") as HTMLElement;
    expect(tent).toBeTruthy();
    expect(tent.style.width).toBe("900px");
    expect(tent.style.height).toBe("1273px");

    const text = tent.textContent || "";
    expect(text).toContain("FOLD HERE FOR TABLE TENT STANDEE");
    expect(text).toContain("ಮಡಚುವ ಗೆರೆ");
    expect(text).toContain("₹330");
    expect(text).toContain("₹430");
  });
});
