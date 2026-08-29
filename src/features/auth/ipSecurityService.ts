import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../services/firebase";
import { notifyNewIpLoginDetected } from "../notifications/notificationService";

export interface DeviceInfo {
  ip: string;
  userAgent: string;
  browser: string;
  os: string;
  deviceType: string;
  timestamp: string;
}

/**
 * Parses user agent string into human-readable device and browser details
 */
export function getClientDeviceInfo(ip: string = "Unknown IP"): DeviceInfo {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "Node.js Environment";
  
  let browser = "Web Browser";
  if (ua.includes("Firefox")) browser = "Mozilla Firefox";
  else if (ua.includes("Edg")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome")) browser = "Google Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Apple Safari";

  let os = "Unknown OS";
  if (ua.includes("Windows")) os = "Windows PC";
  else if (ua.includes("Mac OS")) os = "macOS Apple";
  else if (ua.includes("Android")) os = "Android Mobile";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS Apple Device";
  else if (ua.includes("Linux")) os = "Linux";

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const deviceType = isMobile ? "📱 Mobile Phone" : "💻 Desktop / Laptop";

  return {
    ip,
    userAgent: ua,
    browser,
    os,
    deviceType,
    timestamp: new Date().toLocaleString("en-IN")
  };
}

/**
 * Fetches the client's current public IP address
 */
export async function fetchClientPublicIp(): Promise<string> {
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "test") {
    return "127.0.0.1";
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch("https://api.ipify.org?format=json", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.ip) return String(data.ip).trim();
    }
  } catch (err) {
    // Fallback: try alternate provider
    try {
      const altRes = await fetch("https://icanhazip.com");
      if (altRes.ok) {
        const text = await altRes.text();
        if (text) return text.trim();
      }
    } catch {
      // Ignored
    }
  }

  return "Unknown (Local/Private Network)";
}

/**
 * Verifies if the login is from a new IP address or device,
 * dispatches an urgent security notification if new, and updates known IPs.
 */
export async function checkAndAlertNewIpLogin(
  userId: string,
  username: string,
  role: string = "priest"
): Promise<{ isNewIp: boolean; clientIp: string }> {
  try {
    const clientIp = await fetchClientPublicIp();
    const deviceInfo = getClientDeviceInfo(clientIp);

    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);

    let knownIps: string[] = [];
    let isNewIp = false;

    if (userSnap.exists()) {
      const userData = userSnap.data();
      knownIps = Array.isArray(userData?.knownIps) ? userData.knownIps : [];

      if (!knownIps.includes(clientIp)) {
        isNewIp = true;
        knownIps.push(clientIp);

        // Update Firestore with the new known IP
        await updateDoc(userRef, {
          knownIps,
          lastKnownIp: clientIp,
          lastDevice: `${deviceInfo.os} • ${deviceInfo.browser}`,
          lastLoginAt: new Date().toISOString()
        });

        // DISPATCH COMPULSORY EMAIL ALERT TO spshreepandit@gmail.com
        void notifyNewIpLoginDetected({
          username,
          role,
          ip: clientIp,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          deviceType: deviceInfo.deviceType,
          timestamp: deviceInfo.timestamp
        });
      }
    }

    return { isNewIp, clientIp };
  } catch (err) {
    console.warn("[IP Security] Check error:", err);
    return { isNewIp: false, clientIp: "Unknown" };
  }
}
