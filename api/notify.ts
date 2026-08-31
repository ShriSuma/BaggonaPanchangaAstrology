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
        // Keep as string
      }
    }
    body = body || {};
    const { to, subject, html, type, data } = body;

    const recipient = to || "spshreepandit@gmail.com";
    const resendApiKey = process.env.RESEND_API_KEY;
    const brevoApiKey = process.env.BREVO_API_KEY;

    console.log(`[API /api/notify] Sending email to ${recipient} | Subject: ${subject}`);

    // 1. If Resend API Key is available
    if (resendApiKey) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Baggona Panchanga <onboarding@resend.dev>",
          to: [recipient],
          subject: subject || "[Baggona Panchanga Alert]",
          html: html || "<p>Notification from Baggona Panchanga</p>"
        })
      });

      const resendData = await resendRes.json();
      if (!resendRes.ok) {
        console.warn("[API /api/notify] Resend API error:", resendData);
      } else {
        return sendResponse(res, 200, { success: true, provider: "resend", id: resendData.id });
      }
    }

    // 2. If Brevo API Key is available
    if (brevoApiKey) {
      const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: { name: "Baggona Panchanga", email: "spshreepandit@gmail.com" },
          to: [{ email: recipient }],
          subject: subject || "[Baggona Panchanga Alert]",
          htmlContent: html || "<p>Notification from Baggona Panchanga</p>"
        })
      });

      const brevoData = await brevoRes.json();
      if (brevoRes.ok) {
        return sendResponse(res, 200, { success: true, provider: "brevo", data: brevoData });
      }
    }

    // Fallback: Recorded and simulated
    console.log(`[API /api/notify] Recorded notification to ${recipient} (Simulated mode: set RESEND_API_KEY for live delivery)`);
    return sendResponse(res, 200, { success: true, simulated: true, recipient });

  } catch (err: any) {
    console.error("[API /api/notify] Error:", err);
    return sendResponse(res, 500, { error: err.message || "Internal server error" });
  }
}
