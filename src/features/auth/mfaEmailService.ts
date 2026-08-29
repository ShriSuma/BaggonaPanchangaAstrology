import { renderMfaOtpEmail } from "../notifications/emailTemplates";
import { sendEmailNotification } from "../notifications/notificationService";

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

/**
 * Dispatches the 6-digit MFA OTP email to spshreepandit@gmail.com with 3-minute validity
 */
export async function sendMfaOtpEmail(
  otpCode: string,
  username: string = "devotee",
  recipientEmail: string = HARDCODED_MFA_EMAIL
): Promise<MfaDispatchResult> {
  const sentAtDate = new Date();
  const expiresAtDate = new Date(sentAtDate.getTime() + 3 * 60 * 1000); // Strictly 3 minutes validity

  const sentAt = sentAtDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const expiresAt = expiresAtDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const subject = `[Baggona Panchanga] 🔒 Your 6-Digit Verification Code: ${otpCode}`;

  const html = renderMfaOtpEmail({
    username,
    otpCode,
    expiresAt,
    recipientEmail,
    timestamp: sentAt
  });

  console.log(`[MFA EMAIL DISPATCH] 📨 Sending 3-minute security OTP to: ${recipientEmail} for user: ${username}`);

  // Dispatch actual email notification
  void sendEmailNotification({
    to: recipientEmail,
    subject,
    html,
    type: "system_alert",
    data: {
      username,
      action: "mfa_login_otp",
      expiresAt
    }
  });

  return {
    success: true,
    email: recipientEmail,
    maskedEmail: maskEmail(recipientEmail),
    sentAt,
    expiresAt,
    otpCode
  };
}
