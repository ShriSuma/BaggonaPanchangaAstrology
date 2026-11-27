// Serverless API: /api/payment-webhook
// Baggona Panchanga Astrology • Cryptographically Verified Payment Webhook Engine
import crypto from "crypto";

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

export interface VerifiedWebhookOrder {
  status: "PAID";
  orderId: string;
  amountInr: number;
  packageType: string;
  utr: string;
  paymentId: string;
  verificationSource: string;
  webhookSignatureVerified: boolean;
  timestamp: string;
}

const webhookProcessedTxs = new Set<string>();
const webhookOrdersMap = new Map<string, VerifiedWebhookOrder>();

const CANONICAL_PACKAGE_PRICES: Record<string, number> = {
  express_149: 149,
  palm_150: 150,
  face_150: 150,
  prashna_200: 200,
  samudrika_combo_249: 249,
  family_250: 250,
  trinetra_all3_349: 349,
  standard_350: 350,
  remedy_450: 450
};

const PACKAGE_RATES: Record<number, number> = {
  50: 500,
  100: 1100,
  250: 3000,
  500: 6500,
  1000: 14000
};

export function registerServerVerifiedOrder(entry: VerifiedWebhookOrder): void {
  const normId = entry.orderId.trim().toUpperCase();
  webhookProcessedTxs.add(normId);
  if (entry.utr) webhookProcessedTxs.add(entry.utr.trim().toUpperCase());
  webhookOrdersMap.set(normId, entry);
}

export function getServerVerifiedOrder(orderId: string): VerifiedWebhookOrder | undefined {
  return webhookOrdersMap.get(orderId.trim().toUpperCase());
}

function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function inferPackageFromAmount(amountInr: number): string {
  if (amountInr >= 450) return "remedy_450";
  if (amountInr >= 350) return "standard_350";
  if (amountInr >= 349) return "trinetra_all3_349";
  if (amountInr >= 250) return "family_250";
  if (amountInr >= 249) return "samudrika_combo_249";
  if (amountInr >= 200) return "prashna_200";
  if (amountInr >= 150) return "palm_150";
  return "express_149";
}

function verifyWebhookRequestSignature(
  headers: Record<string, any>,
  rawBody: string
): { valid: boolean; source: string } {
  const lowerHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers || {})) {
    if (typeof v === "string") lowerHeaders[k.toLowerCase()] = v;
  }

  // 1. Razorpay HMAC-SHA256 verification
  const rzpSig = lowerHeaders["x-razorpay-signature"];
  const rzpSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (rzpSig && rzpSecret) {
    const expected = crypto.createHmac("sha256", rzpSecret).update(rawBody).digest("hex");
    if (timingSafeCompare(rzpSig, expected)) {
      return { valid: true, source: "RAZORPAY_WEBHOOK" };
    }
    return { valid: false, source: "RAZORPAY_INVALID_SIG" };
  }

  // 2. Cashfree HMAC-SHA256 (timestamp + rawBody base64) verification
  const cfSig = lowerHeaders["x-webhook-signature"];
  const cfTs = lowerHeaders["x-webhook-timestamp"] || "";
  const cfSecret = process.env.CASHFREE_WEBHOOK_SECRET;
  if (cfSig && cfSecret) {
    const expectedBase64 = crypto
      .createHmac("sha256", cfSecret)
      .update(`${cfTs}${rawBody}`)
      .digest("base64");
    if (timingSafeCompare(cfSig, expectedBase64)) {
      return { valid: true, source: "CASHFREE_WEBHOOK" };
    }
    return { valid: false, source: "CASHFREE_INVALID_SIG" };
  }

  // 3. PhonePe S2S X-VERIFY verification
  const phonePeVerify = lowerHeaders["x-verify"];
  const phonePeSalt = process.env.PHONEPE_SALT_KEY;
  if (phonePeVerify && phonePeSalt) {
    try {
      const parsed = JSON.parse(rawBody || "{}");
      if (parsed.response) {
        const [receivedHash, saltIndex] = phonePeVerify.split("###");
        const expectedHash = crypto
          .createHash("sha256")
          .update(`${parsed.response}${phonePeSalt}`)
          .digest("hex");
        if (receivedHash && saltIndex && timingSafeCompare(receivedHash, expectedHash)) {
          return { valid: true, source: "PHONEPE_WEBHOOK" };
        }
      }
    } catch {
      // Invalid PhonePe JSON payload
    }
    return { valid: false, source: "PHONEPE_INVALID_SIG" };
  }

  // 4. Internal Cashier / Signed Webhook Secret
  const internalSecret = lowerHeaders["x-baggona-webhook-secret"];
  const configuredInternal = process.env.PAYMENT_WEBHOOK_SECRET || process.env.CASHIER_APPROVAL_SECRET;
  if (internalSecret && configuredInternal && timingSafeCompare(internalSecret, configuredInternal)) {
    return { valid: true, source: "INTERNAL_SIGNED_WEBHOOK" };
  }

  return { valid: false, source: "UNVERIFIED_UNSIGNED" };
}

async function mirrorVerifiedOrderToFirestoreRest(order: VerifiedWebhookOrder, devoteeName?: string): Promise<void> {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  if (!projectId) return;

  try {
    const qs = apiKey ? `?updateMask.fieldPaths=status&updateMask.fieldPaths=amountInr&updateMask.fieldPaths=utr&updateMask.fieldPaths=paymentId&updateMask.fieldPaths=transactionId&updateMask.fieldPaths=verificationSource&updateMask.fieldPaths=verifiedAt&key=${encodeURIComponent(apiKey)}` : "?updateMask.fieldPaths=status&updateMask.fieldPaths=amountInr&updateMask.fieldPaths=utr&updateMask.fieldPaths=paymentId&updateMask.fieldPaths=transactionId&updateMask.fieldPaths=verificationSource&updateMask.fieldPaths=verifiedAt";
    const endpoint = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/hotel_table_orders/${encodeURIComponent(order.orderId)}${qs}`;
    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          status: { stringValue: "VERIFIED" },
          amountInr: { doubleValue: order.amountInr },
          utr: { stringValue: order.utr },
          paymentId: { stringValue: order.paymentId },
          transactionId: { stringValue: order.utr },
          verificationSource: { stringValue: order.verificationSource },
          verifiedAt: { stringValue: order.timestamp },
          ...(devoteeName ? { devoteeName: { stringValue: devoteeName } } : {})
        }
      })
    }).catch(() => {});
  } catch {
    // Non-blocking mirror
  }
}

async function notifyPaymentAdminEmail(order: VerifiedWebhookOrder, devoteeName: string): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const brevoApiKey = process.env.BREVO_API_KEY;
  const subject = `[Baggona Panchanga] ✅ Verified Webhook Payment: ₹${order.amountInr} (${order.orderId})`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 2px solid #16a34a; border-radius: 12px; background: #f0fdf4;">
      <h2 style="color: #166534;">✅ Cryptographically Verified Payment Received</h2>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Devotee:</strong> ${devoteeName || "Hotel Guest"}</p>
      <p><strong>Amount:</strong> ₹${order.amountInr}</p>
      <p><strong>Package:</strong> ${order.packageType}</p>
      <p><strong>Source:</strong> ${order.verificationSource}</p>
      <p><strong>UTR / Txn ID:</strong> <code>${order.utr}</code></p>
      <p><strong>Timestamp:</strong> ${order.timestamp}</p>
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

  // Healthcheck or verified order polling
  if (req.method === "GET") {
    try {
      const url = new URL(req.url || "", "http://localhost");
      const orderId = url.searchParams.get("orderId") || url.searchParams.get("order_id");
      const expectedAmount = parseFloat(url.searchParams.get("expectedAmount") || "350");
      if (orderId) {
        const normId = orderId.trim().toUpperCase();
        const orderData = webhookOrdersMap.get(normId);
        if (orderData && orderData.webhookSignatureVerified && orderData.amountInr >= expectedAmount) {
          return sendResponse(res, 200, {
            status: "PAID",
            orderId: orderData.orderId,
            amountInr: orderData.amountInr,
            packageType: orderData.packageType,
            paymentId: orderData.paymentId,
            utr: orderData.utr,
            verificationSource: orderData.verificationSource,
            webhookSignatureVerified: true,
            verified: true,
            engine: "Baggona Panchanga Cryptographic Payment Webhook Engine",
            timestamp: orderData.timestamp
          });
        }
        return sendResponse(res, 200, {
          status: "PENDING",
          orderId,
          verified: false,
          webhookSignatureVerified: false
        });
      }
    } catch {
      // Fall through to status metadata
    }
    return sendResponse(res, 200, {
      status: "active",
      engine: "Baggona Panchanga Cryptographic Payment Webhook Engine",
      gatewayCapabilities: {
        razorpayConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
        cashfreeConfigured: Boolean(process.env.CASHFREE_WEBHOOK_SECRET),
        phonePeConfigured: Boolean(process.env.PHONEPE_SALT_KEY),
        cashierCounterReady: true
      },
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== "POST") {
    return sendResponse(res, 405, { error: "Method not allowed. Use POST." });
  }

  try {
    let rawBody = "";
    let body: any = req.body;

    if (typeof req.rawBody === "string") {
      rawBody = req.rawBody;
    }

    if (!body || (typeof body === "object" && Object.keys(body).length === 0)) {
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk as Buffer);
        }
        if (chunks.length > 0) {
          rawBody = Buffer.concat(chunks).toString("utf8");
          body = JSON.parse(rawBody);
        }
      } catch {
        // Ignore stream parse failure
      }
    } else if (!rawBody) {
      rawBody = typeof body === "string" ? body : JSON.stringify(body);
    }

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        // Leave as-is
      }
    }
    body = body || {};

    // STRICT CRYPTOGRAPHIC SIGNATURE ENFORCEMENT — ZERO UNSIGNED SPOOFING ALLOWED
    const sigCheck = verifyWebhookRequestSignature(req.headers || {}, rawBody);
    if (!sigCheck.valid) {
      console.warn(`[API /api/payment-webhook] 🛑 Rejected unsigned/forged webhook (${sigCheck.source})`);
      return sendResponse(res, 401, {
        success: false,
        verified: false,
        error: "Unauthorized webhook request: missing or invalid cryptographic gateway signature.",
        reason: sigCheck.source
      });
    }

    let status = "failed";
    let amountInr = 0;
    let userId = "";
    let orderId = String(body.orderId || body.order_id || "").trim();
    let utr = "";
    let txId = "";
    let packageType = String(body.packageType || "").trim();
    let devoteeName = String(body.devoteeName || "Hotel Devotee").trim();

    if ((body.event === "payment.captured" || body.event === "order.paid") && body.payload?.payment?.entity) {
      const p = body.payload.payment.entity;
      amountInr = (p.amount || 0) / 100;
      orderId = orderId || String(p.notes?.orderId || p.notes?.order_id || p.order_id || "");
      packageType = packageType || String(p.notes?.packageType || "");
      devoteeName = String(p.notes?.devoteeName || devoteeName);
      userId = p.notes?.userId || "PUBLIC_DEVOTEE";
      utr = p.acquirer_data?.rrn || p.acquirer_data?.upi_transaction_id || p.id;
      txId = p.id;
      status = p.status === "captured" || body.event === "order.paid" ? "success" : "failed";
    } else if (body.type === "PAYMENT_SUCCESS_WEBHOOK" && body.data?.order) {
      amountInr = Number(body.data.order.order_amount || body.data.payment?.payment_amount || 0);
      orderId = orderId || String(body.data.order.order_id || "");
      packageType = packageType || String(body.data.order.order_tags?.packageType || "");
      devoteeName = String(body.data.customer_details?.customer_name || devoteeName);
      userId = body.data.customer_details?.customer_id || "PUBLIC_DEVOTEE";
      utr = body.data.payment?.bank_reference || body.data.payment?.cf_payment_id || "";
      txId = String(body.data.payment?.cf_payment_id || "");
      status = body.data.payment?.payment_status === "SUCCESS" ? "success" : "failed";
    } else if (body.code === "PAYMENT_SUCCESS" && body.data) {
      amountInr = (body.data.amount || 0) / 100;
      orderId = orderId || String(body.data.merchantTransactionId || "");
      userId = body.data.merchantUserId || "PUBLIC_DEVOTEE";
      utr = body.data.transactionId || body.data.providerReferenceId;
      txId = body.data.transactionId;
      status = "success";
    } else {
      amountInr = parseFloat(body.amountInr || body.amount || 0);
      userId = body.userId || body.devoteeId || "PUBLIC_DEVOTEE";
      utr = String(body.utr || body.transactionId || body.referenceId || "");
      txId = body.txId || body.paymentId || `wh_${Date.now()}`;
      status = String(body.status || "").toLowerCase();
    }

    if (status !== "success" && status !== "captured" && status !== "completed" && status !== "paid") {
      return sendResponse(res, 200, { received: true, ignored: true, reason: `Status is ${status}` });
    }

    if (isNaN(amountInr) || amountInr <= 0) {
      return sendResponse(res, 400, { error: "Invalid amount in webhook" });
    }

    const resolvedPackage = packageType || inferPackageFromAmount(amountInr);
    const minCanonical = CANONICAL_PACKAGE_PRICES[resolvedPackage] || 1;
    if (packageType && CANONICAL_PACKAGE_PRICES[packageType] && amountInr < minCanonical) {
      return sendResponse(res, 400, {
        error: `Underpaid webhook amount (₹${amountInr}) for package ${packageType} (requires ₹${minCanonical})`
      });
    }

    const cleanUtr = (utr || txId || `TX_${Date.now()}`).trim().replace(/[^a-zA-Z0-9_]/g, "");
    const upperUtr = cleanUtr.toUpperCase();
    if (webhookProcessedTxs.has(upperUtr)) {
      return sendResponse(res, 200, { received: true, alreadyProcessed: true });
    }

    if (orderId) {
      const verifiedEntry: VerifiedWebhookOrder = {
        status: "PAID",
        orderId,
        amountInr,
        packageType: resolvedPackage,
        utr: cleanUtr,
        paymentId: txId || `PAY_${orderId.toUpperCase()}`,
        verificationSource: sigCheck.source,
        webhookSignatureVerified: true,
        timestamp: new Date().toISOString()
      };
      registerServerVerifiedOrder(verifiedEntry);
      await mirrorVerifiedOrderToFirestoreRest(verifiedEntry, devoteeName);
      void notifyPaymentAdminEmail(verifiedEntry, devoteeName);
    }

    webhookProcessedTxs.add(upperUtr);
    const roundedAmount = Math.round(amountInr);
    const coinsCredited = PACKAGE_RATES[roundedAmount] || roundedAmount * 10;

    return sendResponse(res, 200, {
      success: true,
      received: true,
      verified: true,
      verificationSource: sigCheck.source,
      orderId,
      userId,
      amountInr,
      packageType: resolvedPackage,
      coinsCredited,
      utr: cleanUtr,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("[API /api/payment-webhook] Error:", err);
    return sendResponse(res, 500, { error: err.message || "Webhook processing error" });
  }
}
