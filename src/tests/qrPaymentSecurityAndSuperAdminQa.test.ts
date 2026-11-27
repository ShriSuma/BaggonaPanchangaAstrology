import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import crypto from "crypto";
import { useAuthStore, isStrictSuperAdmin } from "../features/auth/authStore";
import SuperAdminQrQaPage from "../pages/SuperAdminQrQaPage";
import AntarangadaSatyaPage from "../pages/AntarangadaSatyaPage";
import {
  saveHotelOrderInitiated,
  getHotelOrder,
  verifyHotelOrderPayment,
  approveHotelOrderByCashier,
  submitHotelPaymentClaim
} from "../db/firestoreDb";
import {
  verifyHotelPaymentInstant,
  submitHotelPaymentClaimClient,
  verifyHotelPaymentUtr
} from "../features/hotelSecret/antarangaService";
import {
  checkHotelFreePreviewQuota,
  markHotelFreePreviewConsumed,
  clearTestHotelQuotaMemory
} from "../features/hotelSecret/hotelFreeQuotaGuard";
import webhookHandler from "../../api/payment-webhook";
import cashierApproveHandler from "../../api/cashier-approve";

describe("Zero-Hack Payment Security, Strict Super Admin QA & Email Enforcement", () => {
  beforeEach(() => {
    cleanup();
    clearTestHotelQuotaMemory();
    useAuthStore.getState().logout();
    if (typeof window !== "undefined") {
      window.localStorage.clear();
      window.sessionStorage.clear();
    }
  });

  describe("1. Strict Super Admin Only Access Control", () => {
    it("allows ONLY ShriSuma / $hriSuma / superadmin and explicitly blocks baggona priest & omkar desk", () => {
      expect(isStrictSuperAdmin("superadmin", "ShriSuma")).toBe(true);
      expect(isStrictSuperAdmin("superadmin", "$hriSuma")).toBe(true);
      expect(isStrictSuperAdmin("superadmin", "superadmin")).toBe(true);

      // Explicitly blocked roles / usernames
      expect(isStrictSuperAdmin("priest", "baggona")).toBe(false);
      expect(isStrictSuperAdmin("superadmin", "baggona")).toBe(false);
      expect(isStrictSuperAdmin("priest", "omkar")).toBe(false);
      expect(isStrictSuperAdmin("superadmin", "omkar")).toBe(false);
      expect(isStrictSuperAdmin("priest", null)).toBe(false);
      expect(isStrictSuperAdmin(undefined, undefined)).toBe(false);
    });

    it("locks SuperAdminQrQaPage UI for unauthenticated, priest (baggona), and omkar users, unlocking ONLY for Super Admin", () => {
      // 1. Unauthenticated public visitor
      render(React.createElement(SuperAdminQrQaPage));
      expect(screen.getByText(/STRICT SUPER ADMIN ONLY/i)).toBeInTheDocument();
      expect(screen.queryByText(/Compute All Previews/i)).toBeNull();
      cleanup();

      // 2. Priest user (baggona)
      useAuthStore.setState({ isAuthenticated: true, currentUser: "baggona", role: "priest" });
      render(React.createElement(SuperAdminQrQaPage));
      expect(screen.getByText(/STRICT SUPER ADMIN ONLY/i)).toBeInTheDocument();
      expect(screen.queryByText(/Compute All Previews/i)).toBeNull();
      cleanup();

      // 3. Omkar desk user
      useAuthStore.setState({ isAuthenticated: true, currentUser: "omkar", role: "priest" });
      render(React.createElement(SuperAdminQrQaPage));
      expect(screen.getByText(/STRICT SUPER ADMIN ONLY/i)).toBeInTheDocument();
      expect(screen.queryByText(/Compute All Previews/i)).toBeNull();
      cleanup();

      // 4. Verified Super Admin (ShriSuma)
      useAuthStore.setState({ isAuthenticated: true, currentUser: "ShriSuma", role: "superadmin" });
      render(React.createElement(SuperAdminQrQaPage));
      expect(screen.getByText(/Client QR Redirect QA, Pre-Release Report Tester/i)).toBeInTheDocument();
      expect(screen.getByText(/Compute All Previews/i)).toBeInTheDocument();
      expect(screen.getByText(/Live Table Cash & UPI Order Approval Desk/i)).toBeInTheDocument();
      cleanup();
    });
  });

  describe("2. Zero Free-Unlock Loopholes (Anti-Tamper, Anti-LocalStorage, Anti-Downgrade)", () => {
    it("rejects forged localStorage hotel_order overrides and enforces database state", async () => {
      const orderId = "PP_FORGE_TEST_1";
      await saveHotelOrderInitiated({
        id: orderId,
        orderId,
        tableNumber: "4",
        hotelName: "Pandit Palette",
        devoteeName: "Spoof Attacker",
        amountInr: 350,
        packageType: "standard_350",
        status: "INITIATED",
        selectedLang: "en",
        createdAt: new Date().toISOString()
      });

      // Attacker attempts localStorage tampering in browser DevTools
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          `hotel_order_${orderId}`,
          JSON.stringify({
            id: orderId,
            orderId,
            status: "VERIFIED",
            amountInr: 999,
            packageType: "remedy_450"
          })
        );
      }

      const dbOrder = await getHotelOrder(orderId);
      expect(dbOrder?.status).toBe("INITIATED");

      const check = await verifyHotelOrderPayment(orderId, 350, "standard_350");
      expect(check.verified).toBe(false);
    });

    it("rejects package tier tampering (paying ₹150 Palm cannot unlock ₹350 Kundali or ₹450 Remedy)", async () => {
      const orderId = "PP_PALM_ONLY_150";
      await saveHotelOrderInitiated({
        id: orderId,
        orderId,
        tableNumber: "2",
        hotelName: "Pandit Palette",
        devoteeName: "Ramesh",
        amountInr: 150,
        packageType: "palm_150",
        status: "INITIATED",
        selectedLang: "kn",
        createdAt: new Date().toISOString()
      });

      await approveHotelOrderByCashier({
        orderId,
        approvedBy: "ShriSuma",
        verificationSource: "CASH_AT_COUNTER",
        amountInr: 150
      });

      const palmOk = await verifyHotelOrderPayment(orderId, 150, "palm_150");
      expect(palmOk.verified).toBe(true);

      const remedyTamper = await verifyHotelOrderPayment(orderId, 150, "remedy_450");
      expect(remedyTamper.verified).toBe(false);

      const stdTamper = await verifyHotelOrderPayment(orderId, 150, "standard_350");
      expect(stdTamper.verified).toBe(false);
    });

    it("prevents unauthenticated verifyHotelPaymentInstant & self-approving UTR or Cash claims", async () => {
      const orderId = "PP_CASH_FLOW_1";
      await saveHotelOrderInitiated({
        id: orderId,
        orderId,
        tableNumber: "3",
        hotelName: "Pandit Palette",
        devoteeName: "Suresh",
        amountInr: 350,
        packageType: "standard_350",
        status: "INITIATED",
        selectedLang: "en",
        createdAt: new Date().toISOString()
      });

      const instantHack = await verifyHotelPaymentInstant(orderId, "Suresh", 350, "en", "standard_350");
      expect(instantHack.success).toBe(false);

      const cashClaim = await submitHotelPaymentClaimClient({
        orderId,
        tableNumber: "3",
        hotelName: "Pandit Palette",
        devoteeName: "Suresh",
        amountInr: 350,
        packageType: "standard_350",
        lang: "en",
        claimedMethod: "cash_counter"
      });
      expect(cashClaim.pendingVerification).toBe(true);
      expect(cashClaim.status).toBe("PENDING_CASHIER");

      // Must remain locked before Cashier approves!
      const beforeCashier = await verifyHotelOrderPayment(orderId, 350, "standard_350");
      expect(beforeCashier.verified).toBe(false);

      // Cashier approves cash received -> immediately unlocks!
      await approveHotelOrderByCashier({
        orderId,
        approvedBy: "ShriSuma",
        verificationSource: "CASH_AT_COUNTER",
        amountInr: 350
      });
      const afterCashier = await verifyHotelOrderPayment(orderId, 350, "standard_350");
      expect(afterCashier.verified).toBe(true);
    });

    it("enforces exhausted familyPreviewCreditsRemaining=0 cannot bypass free preview quota", async () => {
      await markHotelFreePreviewConsumed({
        ip: "203.0.113.88",
        deviceId: "dev_fam_check",
        serviceUsed: "kundli",
        hotelName: "Pandit Palette",
        tableNumber: "5",
        guestName: "Anil"
      });

      const zeroCreditsCheck = await checkHotelFreePreviewQuota({
        isPaymentVerified: false,
        isPaidFamilyUpsell: true,
        familyPreviewCreditsRemaining: 0,
        overrideIp: "203.0.113.88",
        overrideDeviceId: "dev_fam_check"
      });
      expect(zeroCreditsCheck.allowed).toBe(false);

      const oneCreditCheck = await checkHotelFreePreviewQuota({
        isPaymentVerified: false,
        isPaidFamilyUpsell: true,
        familyPreviewCreditsRemaining: 1,
        overrideIp: "203.0.113.88",
        overrideDeviceId: "dev_fam_check"
      });
      expect(oneCreditCheck.allowed).toBe(true);
    });

    it("rejects unsigned webhook POST spoofing (401) and accepts valid HMAC-SHA256 Razorpay webhooks", async () => {
      const makeRes = () => {
        const resState = { status: 0, data: null as any };
        const resObj: any = {
          status: (code: number) => {
            resState.status = code;
            return resObj;
          },
          json: (d: any) => {
            resState.data = d;
            return resObj;
          },
          setHeader: () => {},
          end: () => {}
        };
        return { resState, resObj };
      };

      // 1. Unsigned forged webhook MUST be rejected with 401
      const forged = makeRes();
      await webhookHandler(
        {
          method: "POST",
          headers: {},
          body: { orderId: "PP_FAKE_WH_1", status: "SUCCESS", amountInr: 450 }
        },
        forged.resObj
      );
      expect(forged.resState.status).toBe(401);
      expect(forged.resState.data.verified).toBe(false);

      // 2. Signed Razorpay webhook with valid HMAC-SHA256 MUST pass & mark order PAID
      const origSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      process.env.RAZORPAY_WEBHOOK_SECRET = "test_rzp_secret_2026";
      try {
        const payloadObj = {
          event: "payment.captured",
          payload: {
            payment: {
              entity: {
                id: "pay_RzpValid123",
                amount: 35000,
                status: "captured",
                notes: { orderId: "PP_SIGNED_RZP_350", packageType: "standard_350", devoteeName: "Kavya" },
                acquirer_data: { rrn: "612398765432" }
              }
            }
          }
        };
        const rawBody = JSON.stringify(payloadObj);
        const signature = crypto
          .createHmac("sha256", "test_rzp_secret_2026")
          .update(rawBody)
          .digest("hex");

        const validPost = makeRes();
        await webhookHandler(
          {
            method: "POST",
            headers: { "x-razorpay-signature": signature },
            rawBody,
            body: payloadObj
          },
          validPost.resObj
        );
        expect(validPost.resState.status).toBe(200);
        expect(validPost.resState.data.verified).toBe(true);
        expect(validPost.resState.data.verificationSource).toBe("RAZORPAY_WEBHOOK");

        // 3. Cashier approval endpoint rejects non-admin callers (403)
        const nonAdminCashier = makeRes();
        await cashierApproveHandler(
          {
            method: "POST",
            headers: {},
            body: { orderId: "PP_C_1", amountInr: 350, approvedBy: "random_guest" }
          },
          nonAdminCashier.resObj
        );
        expect(nonAdminCashier.resState.status).toBe(403);
      } finally {
        if (origSecret === undefined) delete process.env.RAZORPAY_WEBHOOK_SECRET;
        else process.env.RAZORPAY_WEBHOOK_SECRET = origSecret;
      }
    });
  });

  describe("3. Client QR Redirect Params & Pre-selected Mode/Language Rendering", () => {
    it("reads ?table=...&hotel=...&lang=en&mode=hasta_samudrika from scanned URL cleanly", () => {
      const origSearch = window.location.search;
      window.history.replaceState({}, "", "/antaranga?table=7&hotel=Pandit%20Palette&lang=en&mode=hasta_samudrika");
      try {
        render(React.createElement(AntarangadaSatyaPage));
        expect(screen.getByText(/Pandit Palette/i)).toBeInTheDocument();
        expect(screen.getByText(/Table 7/i)).toBeInTheDocument();
        expect(screen.getByText(/Select Your Preferred Language/i)).toBeInTheDocument();
      } finally {
        window.history.replaceState({}, "", `/antaranga${origSearch}`);
        cleanup();
      }
    });
  });
});
