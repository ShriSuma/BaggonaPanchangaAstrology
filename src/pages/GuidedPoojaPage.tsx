import React, { useState, useEffect } from "react";
import {
  parseGuidedPoojaFromUrl,
  type GuidedPoojaConfig
} from "../features/pooja/guidedPoojaUrlService";
import { GuidedPoojaDevoteeView } from "../components/pooja/GuidedPoojaDevoteeView";
import { GuidedPoojaConfigurator } from "../components/pooja/GuidedPoojaConfigurator";
import ErrorBoundary from "../components/ErrorBoundary";

export const GuidedPoojaPage: React.FC = () => {
  const [config, setConfig] = useState<GuidedPoojaConfig>(() => {
    return parseGuidedPoojaFromUrl();
  });

  // Mode: "devotee" (sacred sanctuary view) or "configurator" (link generator & editor)
  const [mode, setMode] = useState<"devotee" | "configurator">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "config" || params.get("mode") === "admin") {
        return "configurator";
      }
      // If explicit poojas/vratas were provided in the URL, go straight to devotee view
      if (
        params.has("poojas") ||
        params.has("vratas") ||
        params.has("pToken") ||
        params.has("poojaToken")
      ) {
        return "devotee";
      }
    }
    // Default to devotee view with all poojas and vratas ready
    return "devotee";
  });

  // Re-sync if URL popstate occurs
  useEffect(() => {
    const handleLocationChange = () => {
      const parsed = parseGuidedPoojaFromUrl();
      setConfig(parsed);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const handleApplyConfig = (newConfig: GuidedPoojaConfig) => {
    setConfig(newConfig);
    setMode("devotee");

    // Update browser URL silently without reloading
    if (typeof window !== "undefined" && window.history) {
      const params = new URLSearchParams(window.location.search);
      if (newConfig.poojaKeys && newConfig.poojaKeys.length > 0) {
        params.set("poojas", newConfig.poojaKeys.join(","));
      } else {
        params.delete("poojas");
      }
      if (newConfig.vrataKeys && newConfig.vrataKeys.length > 0) {
        params.set("vratas", newConfig.vrataKeys.join(","));
      } else {
        params.delete("vratas");
      }
      if (newConfig.activeCategory && newConfig.activeCategory !== "poojas") {
        params.set("tab", newConfig.activeCategory);
      }
      if (newConfig.sankalpaKey && newConfig.sankalpaKey !== "kutumba") {
        params.set("sankalpa", newConfig.sankalpaKey);
      }
      if (newConfig.sankalpaKey === "custom" && newConfig.customGoal) {
        params.set("goal", newConfig.customGoal);
      }
      if (newConfig.devoteeName && newConfig.devoteeName !== "ಭಕ್ತರು") {
        params.set("name", newConfig.devoteeName);
      }
      if (newConfig.devoteePhone && newConfig.devoteePhone.trim()) {
        params.set("phone", newConfig.devoteePhone.trim());
      } else {
        params.delete("phone");
      }
      if (newConfig.devoteeEmail && newConfig.devoteeEmail.trim()) {
        params.set("email", newConfig.devoteeEmail.trim());
      } else {
        params.delete("email");
      }
      if (newConfig.gotra && newConfig.gotra !== "ಕಾಶ್ಯಪ") {
        params.set("gotra", newConfig.gotra);
      }
      if (newConfig.lang && newConfig.lang !== "kn") {
        params.set("lang", newConfig.lang);
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({ ...newConfig }, "", newUrl);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FFFDF7] text-amber-950">
        {mode === "configurator" ? (
          <div className="py-4 px-2">
            <GuidedPoojaConfigurator
              initialConfig={config}
              onApplyConfig={handleApplyConfig}
              onCancel={() => setMode("devotee")}
            />
          </div>
        ) : (
          <GuidedPoojaDevoteeView
            poojaKeys={config.poojaKeys}
            vrataKeys={config.vrataKeys}
            initialCategory={config.activeCategory}
            sankalpaKey={config.sankalpaKey}
            customGoal={config.customGoal}
            devoteeName={config.devoteeName}
            devoteePhone={config.devoteePhone}
            devoteeEmail={config.devoteeEmail}
            gotra={config.gotra}
            lang={config.lang}
            priestName={config.priestName}
            onOpenConfigurator={() => setMode("configurator")}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default GuidedPoojaPage;
