import React from "react";
import { Baggona8kPromoPoster } from "../components/poster/Baggona8kPromoPoster";
import { useAppStore } from "../stores/appStore";

export default function BaggonaPosterPage(): JSX.Element {
  const setAppPage = useAppStore((s) => s.setPage);

  return (
    <div className="w-full min-h-screen bg-slate-950">
      <Baggona8kPromoPoster onClose={() => setAppPage("omkar_desk")} />
    </div>
  );
}
