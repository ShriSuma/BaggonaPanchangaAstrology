import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { PriestDoshaPrescriptionPage, PRIEST_DIRECTORY } from "../pages/PriestDoshaPrescriptionPage";
import { LivePrashnaOraclePage } from "../pages/LivePrashnaOraclePage";

describe("PriestDoshaPrescriptionPage & LivePrashnaOraclePage Standalone Tests", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("PriestDoshaPrescriptionPage (/dosha-desk)", () => {
    it("renders default priest as Shreeram Pandit with phone +91 99723 39362 and Gokarna heritage", () => {
      render(<PriestDoshaPrescriptionPage />);

      expect(screen.getByText(/Shreeram Pandit — Sri Kshetra Gokarna Mahabaleshwara/i)).toBeInTheDocument();
      expect(screen.getByText(/ಬಗ್ಗೋಣ ಪುರೋಹಿತ & ದೋಷ ನಿವಾರಣಾ ಡೆಸ್ಕ್/i)).toBeInTheDocument();
    });

    it("allows switching to custom partner priest and entering name and phone", () => {
      render(<PriestDoshaPrescriptionPage />);

      const priestSelect = screen.getByRole("combobox");
      fireEvent.change(priestSelect, { target: { value: "partner_1" } });

      const nameInput = screen.getByPlaceholderText(/ಸಹಯೋಗಿ ಪುರೋಹಿತರ ಹೆಸರು|Enter Partner Priest Name/i);
      const phoneInput = screen.getByPlaceholderText(/ಪುರೋಹಿತರ ವಾಟ್ಸಾಪ್|Priest WhatsApp/i);

      expect(nameInput).toBeInTheDocument();
      expect(phoneInput).toBeInTheDocument();

      fireEvent.change(nameInput, { target: { value: "Pandit Raghavendra Bhat" } });
      fireEvent.change(phoneInput, { target: { value: "919448123456" } });

      expect(nameInput).toHaveValue("Pandit Raghavendra Bhat");
      expect(phoneInput).toHaveValue("919448123456");
    });

    it("runs 100% mathematical dosha audit and outputs Pitru, Sarpa, Kuja, and Maandi findings with real-life symptoms", async () => {
      render(<PriestDoshaPrescriptionPage />);

      // Switch language to English for predictable string matching
      const enBtn = screen.getByRole("button", { name: "English" });
      fireEvent.click(enBtn);

      const nameInput = screen.getByPlaceholderText(/Devotee Full Name/i);
      const dobInput = screen.getByLabelText(/Date of Birth/i);
      const tobInput = screen.getByLabelText(/Time of Birth/i);
      const pobInput = screen.getByPlaceholderText(/Place of Birth/i);
      const submitBtn = screen.getByRole("button", { name: /Generate 100% Accurate Dosha & Symptom Report/i });

      fireEvent.change(nameInput, { target: { value: "Nagaraj Sharma" } });
      fireEvent.change(dobInput, { target: { value: "1990-08-20" } });
      fireEvent.change(tobInput, { target: { value: "07:30" } });
      fireEvent.change(pobInput, { target: { value: "Gokarna, Karnataka" } });

      fireEvent.click(submitBtn);

      // Verify findings appear
      await waitFor(() => {
        expect(screen.getByText(/Dosha Diagnostics & Shastriya Remedies: Nagaraj Sharma/i)).toBeInTheDocument();
      });

      // Check Pitru, Sarpa, Kuja, and Maandi findings
      expect(screen.getByRole("heading", { name: /Pitru Dosha/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /Sarpa Dosha/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /Kuja \(Manglik\) Dosha/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /Maandi \(Gulika\) 99% Last-Mile Knot/i })).toBeInTheDocument();

      // Check real-life symptoms are listed
      expect(screen.getAllByText(/What Is Happening in Real Life Because of This:/i).length).toBeGreaterThanOrEqual(1);

      // Verify WhatsApp button is present
      const waBtn = screen.getByRole("button", { name: /Send Prescription on WhatsApp/i });
      expect(waBtn).toBeInTheDocument();
    });

    it("formats WhatsApp link stamped with active priest name and phone number", async () => {
      const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);

      render(<PriestDoshaPrescriptionPage />);

      const nameInput = screen.getByPlaceholderText(/ಭಕ್ತರ ಪೂರ್ಣ ಹೆಸರು/i);
      const dobInput = screen.getByLabelText(/Date of Birth/i);
      const submitBtn = screen.getByRole("button", { name: /100% ನಿಖರ ದೋಷ & ನೈಜ ಲಕ್ಷಣಗಳ ವರದಿ ಪಡೆಯಿರಿ/i });

      fireEvent.change(nameInput, { target: { value: "Ramesh Hegde" } });
      fireEvent.change(dobInput, { target: { value: "1988-04-12" } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/ದೋಷ ರೋಗನಿರ್ಣಯ & ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರ: Ramesh Hegde/i)).toBeInTheDocument();
      });

      const waBtn = screen.getByRole("button", { name: /ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಪರಿಹಾರ ಚೀಟಿ ಕಳುಹಿಸಿ/i });
      fireEvent.click(waBtn);

      expect(windowOpenSpy).toHaveBeenCalled();
      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain("https://wa.me/");
      expect(calledUrl).toContain(encodeURIComponent("Shreeram Pandit"));
      expect(calledUrl).toContain(encodeURIComponent("919972339362"));

      windowOpenSpy.mockRestore();
    });
  });

  describe("LivePrashnaOraclePage (/prashna-oracle)", () => {
    it("renders Prashna categories, direct question input, and 1 to 108 number slider", () => {
      render(<LivePrashnaOraclePage />);

      expect(screen.getByText(/No Birth Time Needed • Live Horary Prashna Oracle|ಜನನ ಸಮಯ ಅಗತ್ಯವಿಲ್ಲ/i)).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByRole("slider")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /ಲೈವ್ ಪ್ರಶ್ನಾ ಫಲಿತಾಂಶ ಗಣನೆ ಮಾಡಿ|Calculate Live Prashna Verdict/i })).toBeInTheDocument();
    });

    it("calculates live horary verdict based on Arudha number and current Hora lord", async () => {
      render(<LivePrashnaOraclePage />);

      // Switch language to English
      const enBtn = screen.getByRole("button", { name: "English" });
      fireEvent.click(enBtn);

      const qInput = screen.getByPlaceholderText(/e.g., Will my promotion or new job offer close smoothly this quarter\?/i);
      fireEvent.change(qInput, { target: { value: "Will my business expansion succeed in Bangalore?" } });

      const slider = screen.getByRole("slider");
      fireEvent.change(slider, { target: { value: 45 } });

      const calcBtn = screen.getByRole("button", { name: /Calculate Live Prashna Verdict/i });
      fireEvent.click(calcBtn);

      // Verify verdict display
      await waitFor(() => {
        expect(screen.getByText(/Shastriya Horary Verdict/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Expected Timing Window/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Unlock Full Prashna Answer \+ Exact Remedy \(₹149\)/i })).toBeInTheDocument();
    });

    it("unlocks comprehensive Prashna breakdown, Shreeram Pandit's remedy, and WhatsApp button upon ₹149 payment confirmation", async () => {
      render(<LivePrashnaOraclePage />);

      const qInput = screen.getByPlaceholderText(/ಉದಾ:/i);
      fireEvent.change(qInput, { target: { value: "ವಿವಾಹ ಸಂಬಂಧ ಶೀಘ್ರದಲ್ಲಿ ಕೂಡಿಬರುವುದೇ?" } });

      const calcBtn = screen.getByRole("button", { name: /ಲೈವ್ ಪ್ರಶ್ನಾ ಫಲಿತಾಂಶ ಗಣನೆ ಮಾಡಿ/i });
      fireEvent.click(calcBtn);

      await waitFor(() => {
        expect(screen.getByText(/ಶಾಸ್ತ್ರೀಯ ಪ್ರಶ್ನಾ ಫಲಿತಾಂಶ/i)).toBeInTheDocument();
      });

      // Click Unlock Button
      const unlockBtn = screen.getByRole("button", { name: /ಸಂಪೂರ್ಣ ಪ್ರಶ್ನಾ ವಿವರ & ಪರಿಹಾರ ಅನ್‌ಲಾಕ್ ಮಾಡಿ \(₹149\)/i });
      fireEvent.click(unlockBtn);

      // Click Confirm Payment button
      const confirmPaidBtn = await screen.findByRole("button", { name: /✓ I Have Paid — Unlock Now/i });
      fireEvent.click(confirmPaidBtn);

      // Verify unlocked details appear
      await waitFor(() => {
        expect(screen.getByText(/ಸಂಪೂರ್ಣ ದೈವಿಕ ಪ್ರಶ್ನಾ ವಿಶ್ಲೇಷಣೆ & ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/ಪುರೋಹಿತ ಶ್ರೀರಾಮ್ ಪಂಡಿತರ ಅಧಿಕೃತ ಪರಿಹಾರ & ಸಂಕಲ್ಪ:/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /ಶ್ರೀರಾಮ್ ಪಂಡಿತರೊಂದಿಗೆ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಚರ್ಚಿಸಿ/i })).toBeInTheDocument();
    });
  });
});
