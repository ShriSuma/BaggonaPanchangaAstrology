import { getDailyHitsCount } from "../../db/indexedDb";
import { sendAllThreeDailyReports, DEFAULT_NOTIFICATION_EMAIL } from "../notifications/notificationService";

export const REPORT_EMAIL_RECIPIENT = DEFAULT_NOTIFICATION_EMAIL;

/**
 * Calculates milliseconds remaining until 23:00 IST (11:00 PM IST).
 */
export function getMsUntil11PMIST(): number {
  const now = new Date();

  // Convert current time to IST components (UTC + 5:30)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const utcNowMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const istNow = new Date(utcNowMs + istOffsetMs);

  const istTarget = new Date(istNow);
  istTarget.setHours(23, 0, 0, 0);

  if (istNow.getTime() >= istTarget.getTime()) {
    // If it's already past 23:00 IST today, schedule for 23:00 IST tomorrow
    istTarget.setDate(istTarget.getDate() + 1);
  }

  return istTarget.getTime() - istNow.getTime();
}

/**
 * Generates and dispatches the 3 daily summary report emails to spshreepandit@gmail.com
 */
export async function sendDailyReportEmail(): Promise<{
  success: boolean;
  date: string;
  count: number;
  email: string;
}> {
  const dateStr = new Date().toISOString().split("T")[0];
  const count = await getDailyHitsCount(dateStr);

  console.log(`[Daily Report] Dispatching 3 End-of-Day summary reports to ${REPORT_EMAIL_RECIPIENT}. Hits today: ${count}`);

  await sendAllThreeDailyReports({
    app: {
      totalHits: count || 1,
      kundlisCalculated: count || 1,
      panchangaViews: (count || 1) * 3,
      prashnaCount: Math.max(1, Math.floor(count / 2))
    }
  });

  return {
    success: true,
    date: dateStr,
    count,
    email: REPORT_EMAIL_RECIPIENT
  };
}

let schedulerTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Initializes daily 11:00 PM IST scheduler timer.
 */
export function initDailyReportScheduler(): void {
  if (schedulerTimer) {
    clearTimeout(schedulerTimer);
  }

  const msRemaining = getMsUntil11PMIST();
  const hoursLeft = (msRemaining / (1000 * 60 * 60)).toFixed(2);
  console.log(`[Daily Scheduler] Initialized. Next report in ${hoursLeft} hours (at 11:00 PM IST).`);

  schedulerTimer = setTimeout(async () => {
    await sendDailyReportEmail();
    // Recursively reschedule for next day
    initDailyReportScheduler();
  }, msRemaining);
}
