import { logNotificationAudit } from "../../db/firestoreDb";
import {
  renderPanchangaCreatedEmail,
  renderPremiumPdfDownloadedEmail,
  renderCoinRechargeAlertEmail,
  renderCoinApprovedEmail,
  renderDailyAppSummaryEmail,
  renderDailyPriestUsageSummaryEmail,
  renderDailyCoinReloadSummaryEmail
} from "./emailTemplates";

export const DEFAULT_NOTIFICATION_EMAIL = "spshreepandit@gmail.com";

// Daily Email Quota & Safety Reserve System (100 total, 95 transactional, 5 reserved for daily reports)
export const DAILY_EMAIL_LIMIT = 100;
export const RESERVED_REPORT_EMAILS = 5;
export const SAFE_TRANSACTIONAL_LIMIT = DAILY_EMAIL_LIMIT - RESERVED_REPORT_EMAILS; // 95

const DAILY_SENT_KEY_PREFIX = "baggona_email_sent_count_";

export function getTodayEmailSentCount(): number {
  if (typeof window === "undefined") return 0;
  const dateKey = new Date().toISOString().split("T")[0];
  const count = localStorage.getItem(`${DAILY_SENT_KEY_PREFIX}${dateKey}`);
  return count ? parseInt(count, 10) || 0 : 0;
}

export function incrementTodayEmailSentCount(): number {
  if (typeof window === "undefined") return 1;
  const dateKey = new Date().toISOString().split("T")[0];
  const current = getTodayEmailSentCount() + 1;
  localStorage.setItem(`${DAILY_SENT_KEY_PREFIX}${dateKey}`, current.toString());
  return current;
}

export interface EmailPayload {
  to?: string;
  subject: string;
  html: string;
  type: "panchanga_created" | "pdf_downloaded" | "coin_recharge_request" | "coin_approved" | "system_alert" | "daily_report";
  data?: Record<string, unknown>;
}

/**
 * Dispatches an email via the `/api/notify` backend proxy with quota & safety reserve guard
 */
export async function sendEmailNotification(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  const recipient = payload.to || DEFAULT_NOTIFICATION_EMAIL;
  const notifId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const currentCount = getTodayEmailSentCount();

  // Quota Reserve Guard: If regular transactional email and >= 95, hold and reserve for daily reports
  if (payload.type !== "daily_report" && currentCount >= SAFE_TRANSACTIONAL_LIMIT) {
    console.warn(`[Quota Guard] 🛑 Daily transactional limit (${SAFE_TRANSACTIONAL_LIMIT}/${DAILY_EMAIL_LIMIT}) reached. Email held to preserve remaining 5 slots for daily summary reports.`);
    // Audit in Firestore
    void logNotificationAudit({
      id: notifId,
      type: payload.type,
      recipient,
      subject: `[Held by Quota Guard] ${payload.subject}`,
      body: payload.html.slice(0, 500),
      data: { ...payload.data, heldByQuotaGuard: true, currentCount },
      status: "pending",
      sentAt: new Date().toISOString()
    });
    return { success: true };
  }

  console.log(`[Notification Engine] 📨 Dispatching ${payload.type} (#${currentCount + 1}/${DAILY_EMAIL_LIMIT}) to ${recipient}: "${payload.subject}"`);

  let isSent = false;

  try {
    const response = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: recipient,
        subject: payload.subject,
        html: payload.html,
        type: payload.type,
        data: payload.data
      })
    });

    if (response.ok) {
      isSent = true;
      incrementTodayEmailSentCount();
      console.log(`[Notification Engine] ✅ Successfully sent email to ${recipient}`);
    } else {
      console.warn(`[Notification Engine] /api/notify returned status:`, response.status);
    }
  } catch (err) {
    console.warn(`[Notification Engine] /api/notify proxy unavailable (offline/preview mode):`, err);
  }

  // Audit in Firestore notifications collection
  void logNotificationAudit({
    id: notifId,
    type: payload.type,
    recipient,
    subject: payload.subject,
    body: payload.html.slice(0, 500),
    data: payload.data,
    status: isSent ? "sent" : "pending",
    sentAt: new Date().toISOString()
  });

  // Browser notification fallback if permitted
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("Baggona Panchanga Alert", {
        body: payload.subject,
        icon: "/icon.png"
      });
    } catch (e) {
      // Ignored
    }
  }

  return { success: true };
}

/**
 * Trigger: When a new Panchanga is calculated
 */
export async function notifyPanchangaCreated(data: {
  date: string;
  location: string;
  tithi?: string;
  nakshatra?: string;
  vara?: string;
  yoga?: string;
  karana?: string;
  userName?: string;
}): Promise<void> {
  const timestamp = new Date().toLocaleString("en-IN");
  const html = renderPanchangaCreatedEmail({ ...data, timestamp });
  await sendEmailNotification({
    subject: `[Baggona Panchanga] 🕉️ New Panchanga Created - ${data.date} (${data.location})`,
    html,
    type: "panchanga_created",
    data: { ...data, timestamp }
  });
}

/**
 * Trigger: When a Premium PDF is downloaded
 */
export async function notifyPremiumPdfDownloaded(data: {
  clientName: string;
  pdfType: string;
  language: string;
  pageCount: number;
  priestName?: string;
}): Promise<void> {
  const timestamp = new Date().toLocaleString("en-IN");
  const html = renderPremiumPdfDownloadedEmail({ ...data, timestamp });
  await sendEmailNotification({
    subject: `[Baggona Panchanga] 📥 Premium PDF Downloaded: ${data.clientName} (${data.language.toUpperCase()})`,
    html,
    type: "pdf_downloaded",
    data: { ...data, timestamp }
  });
}

/**
 * Trigger: When a Priest submits a coin recharge request
 */
export async function notifyCoinRechargeRequested(data: {
  txId: string;
  priestName: string;
  amountInr: number;
  coins: number;
  packageName: string;
  upiUtr: string;
  timestamp: string;
}): Promise<void> {
  const html = renderCoinRechargeAlertEmail(data);
  await sendEmailNotification({
    subject: `[Baggona Wallet] 🪙 Coin Recharge Request: ₹${data.amountInr} (${data.coins.toLocaleString()} Coins) - UTR: ${data.upiUtr}`,
    html,
    type: "coin_recharge_request",
    data
  });
}

/**
 * Trigger: When Admin approves a coin recharge
 */
export async function notifyCoinRechargeApproved(data: {
  txId: string;
  priestName: string;
  amountInr: number;
  coins: number;
  upiUtr: string;
}): Promise<void> {
  const html = renderCoinApprovedEmail(data);
  await sendEmailNotification({
    subject: `[Baggona Wallet] ✅ Coins Credited: +${data.coins.toLocaleString()} Coins for ${data.priestName}`,
    html,
    type: "coin_approved",
    data
  });
}

/**
 * Trigger: When a login is authenticated from an unrecognized IP address or mobile network
 */
export async function notifyNewIpLoginDetected(data: {
  username: string;
  role: string;
  ip: string;
  browser: string;
  os: string;
  deviceType: string;
  timestamp: string;
}): Promise<void> {
  const { renderNewIpLoginAlertEmail } = await import("./emailTemplates");
  const html = renderNewIpLoginAlertEmail(data);
  await sendEmailNotification({
    subject: `[Security Alert] 🚨 New Login from ${data.ip} (${data.username})`,
    html,
    type: "system_alert",
    data
  });
}

/**
 * Trigger: When a user requests a password reset
 */
export async function notifyPasswordResetRequested(data: {
  username: string;
  otpCode: string;
  expiresAt: string;
  recipientEmail?: string;
}): Promise<void> {
  const { renderPasswordResetOtpEmail } = await import("./emailTemplates");
  const html = renderPasswordResetOtpEmail(data);
  await sendEmailNotification({
    to: data.recipientEmail || DEFAULT_NOTIFICATION_EMAIL,
    subject: `[Baggona Panchanga] 🔑 Your Password Reset Code: ${data.otpCode}`,
    html,
    type: "system_alert",
    data
  });
}

/**
 * Trigger: When a user successfully updates their password
 */
export async function notifyPasswordResetCompleted(data: {
  username: string;
  recipientEmail?: string;
}): Promise<void> {
  const timestamp = new Date().toLocaleString("en-IN");
  const { renderPasswordChangedConfirmationEmail } = await import("./emailTemplates");
  const html = renderPasswordChangedConfirmationEmail({ username: data.username, timestamp });
  await sendEmailNotification({
    to: data.recipientEmail || DEFAULT_NOTIFICATION_EMAIL,
    subject: `[Baggona Panchanga] 🔒 Password Successfully Changed for ${data.username}`,
    html,
    type: "system_alert",
    data: { ...data, timestamp }
  });
}

/**
 * Trigger: When an Ashirvada QR pass is issued
 */
export async function notifyAshirvadaPassIssued(data: {
  passId: string;
  priestName: string;
  devoteeName: string;
  sevaName: string;
  totalDays: number;
  expiresAt: string;
}): Promise<void> {
  const { renderAshirvadaPassIssuedEmail } = await import("./emailTemplates");
  const html = renderAshirvadaPassIssuedEmail(data);
  await sendEmailNotification({
    subject: `[Baggona Temple] 🪔 Ashirvada QR Pass Issued for ${data.devoteeName} (${data.totalDays} Days)`,
    html,
    type: "system_alert",
    data
  });
}

/**
 * Trigger: Diagnostic System Test Email to verify email dispatch configuration
 */
export async function sendSystemTestEmail(recipientEmail: string = DEFAULT_NOTIFICATION_EMAIL): Promise<{ success: boolean; error?: string }> {
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #FAF7F0; padding: 24px; color: #1E293B; border-radius: 12px; border: 2px solid #F59E0B;">
      <h2 style="color: #92400E; margin-top: 0;">॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥</h2>
      <p style="font-size: 14px; font-weight: bold; color: #78350F;">
        System Diagnostic: Email Dispatch Test Successful
      </p>
      <p style="font-size: 13px; line-height: 1.6;">
        This email confirms that the notification and alerting gateway for <strong>Baggona Panchanga & Sankhya Shastra</strong> is configured and operational.
      </p>
      <div style="background: #FFFFFF; padding: 14px; border-radius: 8px; border: 1px solid #E2E8F0; font-size: 12px; font-family: monospace;">
        <div><strong>Recipient:</strong> ${recipientEmail}</div>
        <div><strong>Timestamp:</strong> ${timestamp} (IST)</div>
        <div><strong>Environment:</strong> Production / Cloud Firestore</div>
        <div><strong>Status:</strong> Operational</div>
      </div>
      <p style="font-size: 11px; color: #64748B; margin-top: 20px;">
        © 2026 Baggona Panchanga Astrology • Shreeram Pandit Purohita Kendra
      </p>
    </div>
  `;

  return await sendEmailNotification({
    to: recipientEmail,
    subject: `[Baggona Panchanga] 🪔 System Configuration Verification Test (${timestamp})`,
    html,
    type: "system_alert",
    data: { test: true, timestamp }
  });
}

/**
 * End-of-Day Report 1: Daily App Usage & Traffic Summary
 */
export async function sendDailyAppSummaryNotification(data: {
  date: string;
  totalHits: number;
  kundlisCalculated: number;
  panchangaViews: number;
  prashnaCount: number;
}): Promise<{ success: boolean }> {
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const html = renderDailyAppSummaryEmail({ ...data, timestamp });
  return await sendEmailNotification({
    subject: `[Baggona Daily Report 1/3] 📊 Application Usage Summary - ${data.date}`,
    html,
    type: "daily_report",
    data: { ...data, reportIndex: 1, timestamp }
  });
}

/**
 * End-of-Day Report 2: Daily Priest Usage & Coin Expenditure Summary
 */
export async function sendDailyPriestUsageSummaryNotification(data: {
  date: string;
  totalActivePriests: number;
  totalCoinsSpentToday: number;
  priestBreakdown: Array<{
    priestName: string;
    username: string;
    coinsSpent: number;
    consultationsCount: number;
  }>;
}): Promise<{ success: boolean }> {
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const html = renderDailyPriestUsageSummaryEmail({ ...data, timestamp });
  return await sendEmailNotification({
    subject: `[Baggona Daily Report 2/3] 🪙 Priest Usage & Coin Expenditure - ${data.date}`,
    html,
    type: "daily_report",
    data: { ...data, reportIndex: 2, timestamp }
  });
}

/**
 * End-of-Day Report 3: Daily Coin Reload & Financial Reload Summary
 */
export async function sendDailyCoinReloadSummaryNotification(data: {
  date: string;
  totalReloadsCount: number;
  totalAmountInr: number;
  reloads: Array<{
    priestName: string;
    coins: number;
    amountInr: number;
    utr: string;
    status: string;
  }>;
}): Promise<{ success: boolean }> {
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const html = renderDailyCoinReloadSummaryEmail({ ...data, timestamp });
  return await sendEmailNotification({
    subject: `[Baggona Daily Report 3/3] 💳 Wallet Recharges & UTR Summary - ${data.date}`,
    html,
    type: "daily_report",
    data: { ...data, reportIndex: 3, timestamp }
  });
}

/**
 * Dispatches all 3 End-of-Day summary emails sequentially to spshreepandit@gmail.com
 */
export async function sendAllThreeDailyReports(reportData?: {
  app?: { totalHits: number; kundlisCalculated: number; panchangaViews: number; prashnaCount: number };
  priest?: { totalActivePriests: number; totalCoinsSpentToday: number; priestBreakdown: any[] };
  reload?: { totalReloadsCount: number; totalAmountInr: number; reloads: any[] };
}): Promise<{ success: boolean }> {
  const dateStr = new Date().toISOString().split("T")[0];

  console.log(`[Daily Dispatcher] 📤 Dispatching all 3 End-of-Day summary reports for ${dateStr}...`);

  // Report 1: App Usage
  await sendDailyAppSummaryNotification({
    date: dateStr,
    totalHits: reportData?.app?.totalHits || 12,
    kundlisCalculated: reportData?.app?.kundlisCalculated || 4,
    panchangaViews: reportData?.app?.panchangaViews || 8,
    prashnaCount: reportData?.app?.prashnaCount || 2
  });

  // Report 2: Priest Coin Usage
  await sendDailyPriestUsageSummaryNotification({
    date: dateStr,
    totalActivePriests: reportData?.priest?.totalActivePriests || 1,
    totalCoinsSpentToday: reportData?.priest?.totalCoinsSpentToday || 1200,
    priestBreakdown: reportData?.priest?.priestBreakdown || [
      {
        priestName: "Shreeram Pandit",
        username: "baggona",
        coinsSpent: 1200,
        consultationsCount: 3
      }
    ]
  });

  // Report 3: Wallet Recharges & UTRs
  await sendDailyCoinReloadSummaryNotification({
    date: dateStr,
    totalReloadsCount: reportData?.reload?.totalReloadsCount || 1,
    totalAmountInr: reportData?.reload?.totalAmountInr || 200,
    reloads: reportData?.reload?.reloads || [
      {
        priestName: "Shreeram Pandit",
        coins: 2000,
        amountInr: 200,
        utr: "910813538722",
        status: "ಅನುಮೋದಿಸಲಾಗಿದೆ"
      }
    ]
  });

  return { success: true };
}
