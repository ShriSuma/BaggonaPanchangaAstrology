// Serverless API: /api/client-ip
// Returns caller's public IP address from proxy headers for Hotel Table QR free-preview anti-abuse guard.

export default function handler(req: any, res: any) {
  if (typeof res.setHeader === "function") {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store, max-age=0");
  }

  const forwardedHeader = req?.headers?.["x-forwarded-for"] || req?.headers?.["x-real-ip"] || "";
  const firstForwarded = String(forwardedHeader)
    .split(",")
    .map((s) => s.trim())
    .find(Boolean);
  const socketAddr = req?.socket?.remoteAddress || req?.connection?.remoteAddress || "";
  const rawIp = firstForwarded || String(socketAddr || "").trim();
  const cleanIp = rawIp.replace(/^::ffff:/, "") || "unknown";

  const payload = {
    ip: cleanIp,
    forwardedFor: firstForwarded || cleanIp,
    source: firstForwarded ? "x-forwarded-for" : socketAddr ? "socket" : "fallback"
  };

  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(200).json(payload);
    return;
  }
  res.statusCode = 200;
  res.end(JSON.stringify(payload));
}
