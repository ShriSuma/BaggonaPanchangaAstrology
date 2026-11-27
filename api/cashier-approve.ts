// Serverless API: /api/cashier-approve
// Server-authenticated Counter Cash / Verified UPI Order Unlock endpoint
import crypto from "crypto";
import { registerServerVerifiedOrder } from "./payment-webhook";

function sendResponse(res: any, status: number, data: any) {
  if (res.writableEnded || res.finished) return;
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(status).json(data);
    return;
  }
  res.statusCode = status;
  if (typeof res.setHeader === "function") {
    res.setHeader("Content-Type", "application/json");
  }
  res.end(JSON.stringify(data));
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    if (typeof res.status === "function" && typeof res.end === "function") {
      res.status(204).end();
    } else {
      res.statusCode = 204;
      res.end();
    }
    return;
  }

  if (req.method !== "POST") {
    return sendResponse(res, 405, { error: "Method not allowed" });
  }

  try {
    let body = req.body;
    if (!body || (typeof body === "object" && Object.keys(body).length === 0)) {
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk as Buffer);
        }
        if (chunks.length > 0) {
          body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        }
      } catch {
        // Ignore parse error
      }
    }
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        // Keep
      }
    }
    body = body || {};

    const {
      orderId,
      amountInr,
      packageType = "standard_350",
      paymentMode = "CASH_AT_COUNTER",
      utrOrReceipt,
      approvedBy,
      devoteeName = "Hotel Guest",
      cashierSecret
    } = body;

    // Require strict SuperAdmin / Cashier server secret when configured in production
    const expectedSecret = process.env.CASHIER_APPROVAL_SECRET || process.env.PAYMENT_WEBHOOK_SECRET;
    const providedSecret = String(
      cashierSecret || req.headers?.["x-cashier-secret"] || ""
    ).trim();

    if (expectedSecret && (!providedSecret || !safeEqual(providedSecret, expectedSecret))) {
      return sendResponse(res, 401, {
        success: false,
        error: "Unauthorized Cashier approval attempt. Invalid or missing Cashier secret."
      });
    }

    const cleanApprovedBy = String(approvedBy || "").trim();
    const isAllowedAdmin = ["shrisuma", "$hrisuma", "superadmin", "cashier_desk", "omkar"].includes(
      cleanApprovedBy.toLowerCase()
    );
    if (!cleanApprovedBy || (!isAllowedAdmin && !expectedSecret)) {
      return sendResponse(res, 403, {
        success: false,
        error: "Forbidden: Cashier / Super Admin identity required."
      });
    }

    const cleanOrderId = String(orderId || "").trim();
    const numAmt = Number(amountInr);
    if (!cleanOrderId || isNaN(numAmt) || numAmt <= 0) {
      return sendResponse(res, 400, { success: false, error: "Invalid orderId or amountInr" });
    }

    const receiptRef = String(utrOrReceipt || `CASH_${Date.now()}`).trim();
    const nowIso = new Date().toISOString();

    registerServerVerifiedOrder({
      status: "PAID",
      orderId: cleanOrderId,
      amountInr: numAmt,
      packageType,
      utr: receiptRef,
      paymentId: `COUNTER_${cleanOrderId}`,
      verificationSource: paymentMode === "CASH_AT_COUNTER" ? "CASH_AT_COUNTER" : "CASHIER_DESK",
      webhookSignatureVerified: true,
      timestamp: nowIso
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const subject = `[Baggona Panchanga] 💵 Cashier Confirmed ₹${numAmt} (${paymentMode}) - ${devoteeName} [${cleanOrderId}]`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 2px solid #d97706; border-radius: 12px; background: #fffbeb;">
        <h2 style="color: #78350f;">💵 Counter Payment Confirmed & Unlocked</h2>
        <p><strong>Order Code:</strong> ${cleanOrderId}</p>
        <p><strong>Devotee:</strong> ${devoteeName}</p>
        <p><strong>Package:</strong> ${packageType} (₹${numAmt})</p>
        <p><strong>Mode:</strong> ${paymentMode}</p>
        <p><strong>Receipt / UTR:</strong> <code>${receiptRef}</code></p>
        <p><strong>Approved By:</strong> ${cleanApprovedBy}</p>
        <p><strong>Time:</strong> ${nowIso}</p>
      </div>
    `;

    if (resendApiKey) {
      void fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Baggona Panchanga <onboarding@resend.dev>",
          to: ["spshreepandit@gmail.com"],
          subject,
          html
        })
      }).catch(() => {});
    } else if (brevoApiKey) {
      void fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevoApiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: { name: "Baggona Panchanga", email: "spshreepandit@gmail.com" },
          to: [{ email: "spshreepandit@gmail.com" }],
          subject,
          htmlContent: html
        })
      }).catch(() => {});
    }

    return sendResponse(res, 200, {
      success: true,
      verified: true,
      orderId: cleanOrderId,
      amountInr: numAmt,
      verificationSource: paymentMode === "CASH_AT_COUNTER" ? "CASH_AT_COUNTER" : "CASHIER_DESK",
      receiptRef,
      timestamp: nowIso
    });
  } catch (err: any) {
    return sendResponse(res, 500, { success: false, error: err?.message || "Cashier approval error" });
  }
}
