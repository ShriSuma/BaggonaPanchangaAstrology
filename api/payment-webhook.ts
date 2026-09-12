// Serverless API: /api/payment-webhook
// Baggona Panchanga Astrology • Payment Webhook Listener for Gateways & Automated UPI Collectors

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

const webhookProcessedTxs = new Set<string>();

const PACKAGE_RATES: Record<number, number> = {
  50: 500,
  100: 1100,
  250: 3000,
  500: 6500,
  1000: 14000
};

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

  // Allow GET for webhook healthcheck
  if (req.method === "GET") {
    return sendResponse(res, 200, {
      status: "active",
      engine: "Baggona Panchanga Instant Payment Webhook Engine",
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== "POST") {
    return sendResponse(res, 405, { error: "Method not allowed. Use POST." });
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
          const raw = Buffer.concat(chunks).toString("utf8");
          body = JSON.parse(raw);
        }
      } catch (e) {
        // Stream might be closed or empty
      }
    }
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // Keep string
      }
    }
    body = body || {};

    // Normalize webhook payload across common Indian payment gateways:
    // Razorpay: { event: "payment.captured", payload: { payment: { entity: { id, amount, notes, acquirer_data } } } }
    // PhonePe: { response: base64 } or { code: "PAYMENT_SUCCESS", data: { transactionId, amount } }
    // Cashfree: { type: "PAYMENT_SUCCESS_WEBHOOK", data: { order: { order_amount }, payment: { payment_status } } }
    // Generic/Custom: { userId, amount, utr, status }

    let status = "success";
    let amountInr = 0;
    let userId = "";
    let utr = "";
    let txId = "";

    if (body.event === "payment.captured" && body.payload?.payment?.entity) {
      const p = body.payload.payment.entity;
      amountInr = (p.amount || 0) / 100;
      userId = p.notes?.userId || "PUBLIC_DEVOTEE";
      utr = p.acquirer_data?.rrn || p.acquirer_data?.upi_transaction_id || p.id;
      txId = p.id;
      status = p.status === "captured" ? "success" : "failed";
    } else if (body.code === "PAYMENT_SUCCESS" && body.data) {
      amountInr = (body.data.amount || 0) / 100;
      userId = body.data.merchantUserId || body.data.merchantTransactionId?.split("_")?.[1] || "PUBLIC_DEVOTEE";
      utr = body.data.transactionId || body.data.providerReferenceId;
      txId = body.data.transactionId;
      status = "success";
    } else {
      // Direct / Generic webhook payload
      amountInr = parseFloat(body.amountInr || body.amount || 0);
      userId = body.userId || body.devoteeId || "PUBLIC_DEVOTEE";
      utr = String(body.utr || body.transactionId || body.referenceId || "");
      txId = body.txId || `wh_${Date.now()}`;
      status = String(body.status || "success").toLowerCase();
    }

    if (status !== "success" && status !== "captured" && status !== "completed") {
      console.log(`[API /api/payment-webhook] Payment status non-success (${status}), ignoring.`);
      return sendResponse(res, 200, { received: true, ignored: true, reason: `Status is ${status}` });
    }

    if (amountInr <= 0) {
      return sendResponse(res, 400, { error: "Invalid amount in webhook" });
    }

    const cleanUtr = (utr || txId || `TX_${Date.now()}`).trim().replace(/[^a-zA-Z0-9]/g, "");
    if (webhookProcessedTxs.has(cleanUtr.toUpperCase())) {
      console.log(`[API /api/payment-webhook] Webhook UTR duplicate (${cleanUtr}), skipping.`);
      return sendResponse(res, 200, { received: true, alreadyProcessed: true });
    }

    webhookProcessedTxs.add(cleanUtr.toUpperCase());

    const roundedAmount = Math.round(amountInr);
    const coinsCredited = PACKAGE_RATES[roundedAmount] || (roundedAmount * 10);

    console.log(`[API /api/payment-webhook] ⚡ Webhook Success: ₹${amountInr} -> ${coinsCredited} coins for ${userId} (UTR: ${cleanUtr})`);

    return sendResponse(res, 200, {
      success: true,
      received: true,
      userId,
      amountInr,
      coinsCredited,
      utr: cleanUtr,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error("[API /api/payment-webhook] Error:", err);
    return sendResponse(res, 500, { error: err.message || "Webhook processing error" });
  }
}
