/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

// Purge obsolete caches on activation
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== "bpa-static-assets" && key !== "bpa-app-shell") {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

registerRoute(
  ({ request, url }) =>
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font" ||
    url.pathname.endsWith(".json"),
  new StaleWhileRevalidate({
    cacheName: "bpa-static-assets"
  })
);

// Crucial fix: NetworkFirst for navigation ensures users always fetch fresh HTML/chunks when online
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "bpa-app-shell",
    networkTimeoutSeconds: 3
  })
);

type ScheduleMessage = {
  type: "SCHEDULE_DAILY_PANCHANG" | "SCHEDULE_RAHU_KAAL" | "CANCEL_ALL";
  scheduledTime?: string;
  payload?: { title?: string; body?: string };
  notificationType?: "dailyPanchang" | "rahuKaal";
};

const scheduled = new Map<string, number>();

const showNotification = async (title: string, body: string, tag: string, data: Record<string, unknown>) => {
  await self.registration.showNotification(title, {
    body,
    tag,
    data
  });
};

self.addEventListener("message", (event: ExtendableMessageEvent) => {
  const message = event.data as ScheduleMessage;
  if (!message || !message.type) return;

  if (message.type === "CANCEL_ALL") {
    for (const timeoutId of scheduled.values()) {
      clearTimeout(timeoutId);
    }
    scheduled.clear();
    return;
  }

  if (!message.scheduledTime) return;
  const runAt = new Date(message.scheduledTime).getTime();
  const delay = Math.max(0, runAt - Date.now());
  const key = `${message.type}-${message.scheduledTime}`;

  if (scheduled.has(key)) return;

  const timeoutId = setTimeout(() => {
    void showNotification(
      message.payload?.title ?? "Baggona Panchanga Astrology",
      message.payload?.body ?? "Astrology update available",
      message.type,
      { route: "/" }
    );
    scheduled.delete(key);
  }, delay) as unknown as number;

  scheduled.set(key, timeoutId);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/"));
});
