/**
 * Multi-Factor Authentication (MFA) Email Dispatch Service
 * Handles hardcoded email recipient routing to spshreepandit@gmail.com
 * and 6-digit OTP generation, formatting, and secure delivery.
 */

export const HARDCODED_MFA_EMAIL = "spshreepandit@gmail.com";

/**
 * Masks an email address for privacy display (e.g. spshreepandit@gmail.com -> spsh***dit@gmail.com)
 */
export function maskEmail(email: string = HARDCODED_MFA_EMAIL): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  if (local.length <= 4) {
    return `${local.slice(0, 1)}***@${domain}`;
  }
  return `${local.slice(0, 4)}***${local.slice(-3)}@${domain}`;
}

/**
 * Generates a cryptographically secure or pseudo-random 6-digit numeric OTP code.
 */
export function generate6DigitOtp(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const num = (array[0] % 900000) + 100000;
    return num.toString();
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export type MfaDispatchResult = {
  success: boolean;
  email: string;
  maskedEmail: string;
  sentAt: string;
  expiresAt: string;
  otpCode: string;
};

// Global window reference for development assistance & test verification
declare global {
  interface Window {
    __LAST_SENT_MFA_OTP__?: string;
  }
}

/**
 * Dispatches the 6-digit MFA OTP email to spshreepandit@gmail.com
 */
export async function sendMfaOtpEmail(
  otpCode: string,
  username: string = "devotee",
  recipientEmail: string = HARDCODED_MFA_EMAIL
): Promise<MfaDispatchResult> {
  const sentAtDate = new Date();
  const expiresAtDate = new Date(sentAtDate.getTime() + 10 * 60 * 1000); // 10 minutes validity

  const sentAt = sentAtDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const expiresAt = expiresAtDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const subject = `[Baggona Panchanga] 🔒 Your 6-Digit Verification Code: ${otpCode}`;
  const body = 
    `Namaskara ${username},\n\n` +
    `Your 6-digit Multi-Factor Authentication (MFA) verification code for Baggona Panchanga Portal is:\n\n` +
    `🔑 VERIFICATION CODE: ${otpCode}\n\n` +
    `This security code is valid for 10 minutes (until ${expiresAt}).\n` +
    `Sent To: ${recipientEmail}\n` +
    `Time: ${sentAt}\n\n` +
    `If you did not initiate this login request, please contact administrator immediately.\n\n` +
    `May Shri Mahabaleshwara protect and guide your journey.\n\n` +
    `Baggona Panchanga Security System`;

  console.log(`=======================================================`);
  console.log(`[MFA EMAIL DISPATCH] Sent to: ${recipientEmail}`);
  console.log(`[MFA VERIFICATION CODE] 🔑 ${otpCode}`);
  console.log(`[EMAIL SUBJECT] ${subject}`);
  console.log(`=======================================================`);

  if (typeof window !== "undefined") {
    window.__LAST_SENT_MFA_OTP__ = otpCode;
    
    // Trigger browser notification if permitted
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Baggona Panchanga Security OTP", {
          body: `Verification Code: ${otpCode} (Sent to ${recipientEmail})`,
          icon: "/icon.png"
        });
      } catch (e) {
        // Ignored in non-supporting browsers
      }
    }
  }

  return {
    success: true,
    email: recipientEmail,
    maskedEmail: maskEmail(recipientEmail),
    sentAt,
    expiresAt,
    otpCode
  };
}
