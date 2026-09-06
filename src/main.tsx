import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";
import "./i18n";
import { initDatabase } from "./db/indexedDb";
// Auto-recover if dynamic chunk hashes changed after deployment
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    console.warn("[PWA] Dynamic chunk fetch failed after deployment, auto-reloading shell...", event);
    window.location.reload();
  });
}

registerSW({ immediate: true });

const renderApp = () => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

void initDatabase()
  .catch(() => {
    localStorage.setItem("jk-db-reset", "true");
  })
  .finally(() => {
    renderApp();
  });
