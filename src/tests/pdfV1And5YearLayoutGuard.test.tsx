import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import { calculateKundli } from "../core/KundliEngine";
import { prepareBhavishyaV1Data, captureBhavishyaV1Pdf } from "../features/premiumPdf/bhavishyaV1Service";
import { prepare5YearPredictionData, captureFiveYearPredictionPdf } from "../features/fiveYearPrediction/fiveYearPredictionService";
import { PdfTemplate } from "../components/RamanBhavishya/PdfTemplate";
import { FiveYearPredictionPdfTemplate } from "../components/fiveYearPrediction/FiveYearPredictionPdfTemplate";
import type { KundliInput } from "../core/AstroTypes";
import type { KundliViewerSession } from "../stores/kundliViewerStore";

const mockedCanvasState = {
  tempBoxSnapshots: [] as Array<{
    position: string;
    left: string;
    top: string;
    width: string;
    boxSizing: string;
    overflowX: string;
  }>
};

vi.mock("html2canvas", () => ({
  default: vi.fn(async (el: HTMLElement) => {
    mockedCanvasState.tempBoxSnapshots.push({
      position: el.style.position,
      left: el.style.left,
      top: el.style.top,
      width: el.style.width,
      boxSizing: el.style.boxSizing,
      overflowX: el.style.overflowX
    });

    const canvas = document.createElement("canvas");
    canvas.width = 1800;
    canvas.height = 1200;
    canvas.toDataURL = () => "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
    return canvas;
  })
}));

const devoteeInput: KundliInput = {
  name: "Ramesh Sharma",
  gothra: "Kashyapa",
  birthDate: "1988-10-24",
  birthTime: "06:30",
  latitude: 14.5479,
  longitude: 74.3188,
  gender: "Male",
  pincode: "581326"
};

const calculatedKundli = calculateKundli(devoteeInput, { ayanamsaModel: "lahiri" });

const session = {
  input: devoteeInput,
  result: calculatedKundli,
  birthDateYmd: devoteeInput.birthDate,
  birthTimeHm: devoteeInput.birthTime,
  homePlaceName: "Gokarna, Karnataka",
  placeLabel: "Gokarna, Karnataka",
  dasha: [],
  dailyPrediction: ""
} as unknown as KundliViewerSession;

function collectForbiddenClasses(root: HTMLElement) {
  const responsiveMatches: string[] = [];
  const justifyMatches: string[] = [];
  const negMarginMatches: string[] = [];
  const skewMatches: string[] = [];
  const trackingMatches: string[] = [];

  root.querySelectorAll("*").forEach((el) => {
    const cls = typeof (el as HTMLElement).className === "string" ? (el as HTMLElement).className : "";
    if (!cls) return;
    const tokens = cls.split(/\s+/);
    for (const tok of tokens) {
      if (/^(sm|md|lg|xl|2xl):/.test(tok)) responsiveMatches.push(tok);
      if (tok === "text-justify") justifyMatches.push(tok);
      if (/^-mx-/.test(tok)) negMarginMatches.push(tok);
      if (/^-skew-/.test(tok)) skewMatches.push(tok);
      if (/^tracking-(widest|wider|wide)$/.test(tok)) trackingMatches.push(tok);
    }
  });

  return { responsiveMatches, justifyMatches, negMarginMatches, skewMatches, trackingMatches };
}

describe("Premium PDF V1 & Next 5 Years Continuous Scroll Layout Guard", () => {
  beforeEach(() => {
    mockedCanvasState.tempBoxSnapshots = [];
    Object.defineProperty(document, "fonts", {
      value: { ready: Promise.resolve() },
      configurable: true
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("enforces deterministic 900px fixed-layout CSS on Premium PDF V1 (zero responsive collapse, justify, -mx, skew, or wide tracking)", async () => {
    const payload = await prepareBhavishyaV1Data(session, "kn", "", {
      maritalStatus: "married",
      childrenStatus: "has_children"
    });

    const { container } = render(
      <PdfTemplate
        theme="sunrise"
        session={session}
        predictions={payload.predictions || []}
        translations={payload.translations}
        deepInsights={payload.deepInsights}
        premiumData={payload.premiumData}
        ageYears={payload.ageYears}
        lang="kn"
      />
    );

    const templateRoot = container.firstElementChild as HTMLElement;
    expect(templateRoot).not.toBeNull();
    expect(templateRoot.style.width).toBe("900px");
    expect(templateRoot.style.boxSizing).toBe("border-box");

    const sections = container.querySelectorAll(".pdf-section");
    expect(sections.length).toBeGreaterThanOrEqual(12);

    const violations = collectForbiddenClasses(templateRoot);
    expect(violations.responsiveMatches).toEqual([]);
    expect(violations.justifyMatches).toEqual([]);
    expect(violations.negMarginMatches).toEqual([]);
    expect(violations.skewMatches).toEqual([]);
    expect(violations.trackingMatches).toEqual([]);
  });

  it("enforces deterministic 900px fixed-layout CSS on Next 5 Years PDF (zero responsive collapse, justify, stray col-span-2, skew, or wide tracking)", async () => {
    const payload = await prepare5YearPredictionData(session, "kn");
    const { container } = render(<FiveYearPredictionPdfTemplate data={payload} />);

    const templateRoot = container.querySelector("#five-year-prediction-pdf-container") as HTMLElement;
    expect(templateRoot).not.toBeNull();
    expect(templateRoot.style.width).toBe("900px");
    expect(templateRoot.style.boxSizing).toBe("border-box");

    const sections = container.querySelectorAll(".pdf-section");
    expect(sections.length).toBeGreaterThanOrEqual(8);

    const violations = collectForbiddenClasses(templateRoot);
    expect(violations.responsiveMatches).toEqual([]);
    expect(violations.justifyMatches).toEqual([]);
    expect(violations.negMarginMatches).toEqual([]);
    expect(violations.skewMatches).toEqual([]);
    expect(violations.trackingMatches).toEqual([]);

    // Ensure zero stray col-span-2 elements exist outside a multi-column grid
    const strayColSpans: HTMLElement[] = [];
    templateRoot.querySelectorAll(".col-span-2").forEach((el) => {
      const parentCls = typeof el.parentElement?.className === "string" ? el.parentElement.className : "";
      if (!/grid-cols-/.test(parentCls)) {
        strayColSpans.push(el as HTMLElement);
      }
    });
    expect(strayColSpans).toEqual([]);
  });

  it("captures Premium PDF V1 in continuous scroll format with fixed left:0 top:0 host, hidden wrapper restore, and border-safe inset geometry", async () => {
    const payload = await prepareBhavishyaV1Data(session, "kn", "", {
      maritalStatus: "married",
      childrenStatus: "has_children"
    });

    const originalHostStyle = "position: fixed; left: 0px; top: 0px; width: 900px; opacity: 0; pointer-events: none; z-index: -1; overflow: hidden; height: 0px;";
    const { container } = render(
      <div style={{ position: "fixed", left: 0, top: 0, width: "900px", opacity: 0, pointerEvents: "none", zIndex: -1, overflow: "hidden", height: 0 }}>
        <PdfTemplate
          theme="sunrise"
          session={session}
          predictions={payload.predictions || []}
          translations={payload.translations}
          deepInsights={payload.deepInsights}
          premiumData={payload.premiumData}
          ageYears={payload.ageYears}
          lang="kn"
        />
      </div>
    );

    const hostParent = container.firstElementChild as HTMLElement;
    hostParent.setAttribute("style", originalHostStyle);
    const pdfRoot = hostParent.firstElementChild as HTMLElement;
    Object.defineProperty(pdfRoot, "scrollHeight", { value: 6500, configurable: true });
    Object.defineProperty(pdfRoot, "offsetHeight", { value: 6500, configurable: true });
    pdfRoot.querySelectorAll(".pdf-section").forEach((el) => {
      Object.defineProperty(el, "scrollHeight", { value: 450, configurable: true });
      (el as HTMLElement).getBoundingClientRect = () => ({
        width: 900,
        height: 450,
        top: 0,
        left: 0,
        bottom: 450,
        right: 900,
        x: 0,
        y: 0,
        toJSON: () => ({})
      });
    });

    const pdf = await captureBhavishyaV1Pdf(pdfRoot, "test_v1.pdf", false, { payload, lang: "kn" });

    expect(mockedCanvasState.tempBoxSnapshots.length).toBeGreaterThanOrEqual(8);
    for (const snap of mockedCanvasState.tempBoxSnapshots) {
      expect(snap.position).toBe("fixed");
      expect(snap.left).toBe("0px");
      expect(snap.top).toBe("0px");
      expect(snap.width).toBe("900px");
      expect(snap.boxSizing).toBe("border-box");
      expect(snap.overflowX).toBe("hidden");
    }

    // Restores hidden host styles after capture
    expect(hostParent.getAttribute("style")).toBe(originalHostStyle);

    // Continuous single-scroll format (NOT paginated 297mm A4 sheets!)
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    expect(pageWidth).toBeCloseTo(210, 1);
    expect(pageHeight).toBeGreaterThan(500);
  });

  it("captures Next 5 Years PDF in continuous scroll format with fixed left:0 top:0 host, hidden container restore, and border-safe inset geometry", async () => {
    const payload = await prepare5YearPredictionData(session, "kn");
    const originalHostStyle = "position: fixed; left: 0px; top: 0px; width: 900px; opacity: 0; pointer-events: none; z-index: -1; overflow: hidden; height: 0px;";

    const { container } = render(
      <div style={{ position: "fixed", left: 0, top: 0, width: "900px", opacity: 0, pointerEvents: "none", zIndex: -1, overflow: "hidden", height: 0 }}>
        <FiveYearPredictionPdfTemplate data={payload} />
      </div>
    );

    const hiddenHost = container.firstElementChild as HTMLElement;
    hiddenHost.setAttribute("style", originalHostStyle);

    const pdf = await captureFiveYearPredictionPdf(hiddenHost, "test_5y.pdf", false);

    expect(mockedCanvasState.tempBoxSnapshots.length).toBeGreaterThanOrEqual(8);
    for (const snap of mockedCanvasState.tempBoxSnapshots) {
      expect(snap.position).toBe("fixed");
      expect(snap.left).toBe("0px");
      expect(snap.top).toBe("0px");
      expect(snap.width).toBe("900px");
      expect(snap.boxSizing).toBe("border-box");
      expect(snap.overflowX).toBe("hidden");
    }

    // Restores hidden host styles after capture (covers DevoteePackageDownloadPage ref-on-host pattern)
    expect(hiddenHost.getAttribute("style")).toBe(originalHostStyle);

    // Continuous single-scroll format (NOT paginated 297mm A4 sheets!)
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    expect(pageWidth).toBeCloseTo(210, 1);
    expect(pageHeight).toBeGreaterThan(500);
  });

  it("ensures OmkarDeskPortalPage hosts bhavishyaV1Ref at 900px width and capture services contain zero -9999px offsets", () => {
    const omkarSrc = fs.readFileSync(path.resolve(process.cwd(), "src/pages/OmkarDeskPortalPage.tsx"), "utf8");
    expect(omkarSrc).toContain('ref={bhavishyaV1Ref} style={{ width: "900px"');
    expect(omkarSrc).not.toContain('ref={bhavishyaV1Ref} style={{ width: "794px"');

    const v1ServiceSrc = fs.readFileSync(path.resolve(process.cwd(), "src/features/premiumPdf/bhavishyaV1Service.ts"), "utf8");
    const fiveYServiceSrc = fs.readFileSync(path.resolve(process.cwd(), "src/features/fiveYearPrediction/fiveYearPredictionService.ts"), "utf8");
    expect(v1ServiceSrc).not.toContain('"-9999px"');
    expect(fiveYServiceSrc).not.toContain('"-9999px"');
    expect(v1ServiceSrc).toContain("const contentXMm = 7.5;");
    expect(fiveYServiceSrc).toContain("const contentXMm = 7.5;");
  });
});
