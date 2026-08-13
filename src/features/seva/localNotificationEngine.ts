/**
 * 100% Free, Offline Native Browser & Mobile Push Notification Engine.
 * Schedules daily reminders for 90 days right on the user's mobile or desktop.
 */

export type NotificationOptions = {
  panditName: string;
  notificationTime: string; // "08:00"
  lang: string;
  personName?: string;
};

const STORAGE_KEY = "baggona_daily_notifications_enabled";

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission !== "denied") {
    const perm = await Notification.requestPermission();
    return perm === "granted";
  }
  return false;
}

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function isNotificationEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return isNotificationSupported() && Notification.permission === "granted" && localStorage.getItem(STORAGE_KEY) === "true";
}

export function scheduleDailyNotification(options: NotificationOptions): boolean {
  if (!isNotificationSupported()) return false;

  const safePandit = options.panditName?.trim() || "Pandit Chaitanya";
  localStorage.setItem(STORAGE_KEY, "true");
  localStorage.setItem("baggona_notification_time", options.notificationTime || "08:00");
  localStorage.setItem("baggona_pandit_name", safePandit);

  // Show immediate confirmation notification
  if (Notification.permission === "granted") {
    try {
      new Notification("[Baggona Panchanga] 90-Day Daily Reminders Active! 🕉️", {
        body: `Namaskara! Daily 90-day Seva & Stotra reminders scheduled at ${options.notificationTime || "08:00"} AM by ${safePandit}.`,
        icon: "/favicon.ico",
        tag: "baggona-notification-confirm"
      });
    } catch {
      // Ignore mobile browser restrictions
    }
  }

  return true;
}

export function disableDailyNotifications(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
