import React, { useEffect, useState, useRef } from "react";
import Card from "../ui/Card";
import {
  PHALA_JYOTISHYA_EPISODES,
  getPodcastEpisode,
  type PhalaJyotishyaEpisode,
  type PodcastDialogueTurn
} from "../../features/podcast/phalaJyotishyaPodcastData";
import {
  podcastAudioEngine,
  type PodcastAudioState
} from "../../features/podcast/podcastAudioEngine";

interface PhalaJyotishyaPodcastHubProps {
  onBackToGames?: () => void;
}

export const PhalaJyotishyaPodcastHub: React.FC<PhalaJyotishyaPodcastHubProps> = ({
  onBackToGames
}) => {
  const [selectedHouse, setSelectedHouse] = useState<number>(1);
  const [audioState, setAudioState] = useState<PodcastAudioState>(podcastAudioEngine.getState());
  const [activeTab, setActiveTab] = useState<"player" | "rules" | "allEpisodes">("player");
  const [copyNotice, setCopyNotice] = useState<boolean>(false);

  const activeEpisode = getPodcastEpisode(selectedHouse);
  const dialogueContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = podcastAudioEngine.subscribe((st) => {
      setAudioState(st);
    });
    return () => {
      unsub();
      podcastAudioEngine.stop();
    };
  }, []);

  // When selected house changes, load it into engine
  const handleSelectEpisode = (houseNum: number, autoPlay: boolean = false) => {
    setSelectedHouse(houseNum);
    const ep = getPodcastEpisode(houseNum);
    podcastAudioEngine.loadEpisode(ep, autoPlay);
  };

  // Auto-scroll transcript to active spoken line
  useEffect(() => {
    if (audioState.playbackState === "playing" && dialogueContainerRef.current) {
      const activeEl = document.getElementById(`dialogue-line-${audioState.currentLineIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [audioState.currentLineIndex, audioState.playbackState]);

  const handleDownloadTranscriptNotes = () => {
    const ep = activeEpisode;
    let content = `॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಗುರುಕುಲ ॥\n`;
    content += `ಫಲಜ್ಯೋತಿಷ್ಯ ಧ್ವನಿ ಸಂವಾದ ಪೋಡ್‌ಕ್ಯಾಸ್ಟ್ - ${ep.houseNameKn}\n`;
    content += `--------------------------------------------------\n`;
    content += `ಕಾರಕತ್ವಗಳು: ${ep.primaryKarakatwasKn.join(", ")}\n`;
    content += `ಕಾರಕ ಗ್ರಹ: ${ep.karakaPlanetKn} | ನೈಸರ್ಗಿಕ ರಾಶಿ: ${ep.naturalZodiacSignKn}\n`;
    content += `ಕ್ಯಾಪ್ಟನ್ ಸ್ಥಿತಿ: ${ep.captainStatusKn}\n`;
    content += `ಗುಲಾಮ/ಬಲಹೀನ ಸ್ಥಿತಿ: ${ep.slaveStatusKn}\n\n`;
    content += `ಸಂವಾದ ಸ್ಕ್ರಿಪ್ಟ್ (Dialogue Transcript):\n`;
    content += `==================================================\n`;

    ep.dialogue.forEach((d) => {
      content += `[${d.speakerNameKn}]:\n${d.textKn}\n\n`;
    });

    content += `\nಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಸುವರ್ಣ ಫಲ ಸೂತ್ರಗಳು:\n`;
    ep.ramanGoldenRulesKn.forEach((r, idx) => {
      content += `${idx + 1}. ${r}\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Baggona_Podcast_House_${ep.houseNumber}_${ep.sanskritName.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2500);
  };

  const isPlaying = audioState.playbackState === "playing";
  const isHostSpeaking = audioState.activeSpeaker === "host_female";
  const isScholarSpeaking = audioState.activeSpeaker === "scholar_male";

  return (
    <div className="space-y-6">
      {/* Master Podcast Studio Header */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-[#2D1407] via-[#1C0A00] to-[#2D1407] text-amber-50 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Top Gold Trim */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-950 border-2 border-amber-400/80 shadow-inner flex items-center justify-center text-3xl sm:text-4xl select-none shrink-0 relative">
              🎙️
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
                </span>
              )}
            </div>
            <div>
              <div className="text-[10px] font-extrabold tracking-widest text-amber-300 uppercase flex items-center gap-1.5 flex-wrap">
                <span>॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಫಲಜ್ಯೋತಿಷ್ಯ ಧ್ವನಿ ಸಂವಾದ ॥</span>
                <span className="bg-amber-900/80 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                  Kannada Audio Podcast
                </span>
              </div>
              <h1 className="font-serif text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 mt-0.5">
                ೧೨ ಮನೆಗಳ ಫಲಜ್ಯೋತಿಷ್ಯ ರಹಸ್ಯ ಸಂವಾದ (12 Houses Podcast)
              </h1>
              <p className="text-xs text-amber-100/80 font-medium mt-1 max-w-2xl leading-relaxed">
                ವಿದುಷಿ ಶ್ರುತಿ ಮತ್ತು ಜ್ಯೋತಿಷಿ ವಿದ್ವಾನ್ ಕೌಶಿಕ್ ಅವರ ನೇರ ಸಂವಾದದಲ್ಲಿ ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳು, ಕ್ಯಾಪ್ಟನ್ vs ಗುಲಾಮ ತತ್ವ ಹಾಗೂ ಪ್ರತಿಯೊಂದು ಮನೆಯ ನಿಖರ ಫಲ ನಿರ್ಣಯ.
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2 self-end lg:self-center shrink-0 flex-wrap">
            {onBackToGames && (
              <button
                type="button"
                onClick={onBackToGames}
                className="px-3.5 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-400/40 font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <span>🎮</span>
                <span>ಗೇಮ್ಸ್ ಮಂಡಲ</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadTranscriptNotes}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>{copyNotice ? "ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!" : "ಟಿಪ್ಪಣಿ ಡೌನ್‌ಲೋಡ್"}</span>
            </button>
          </div>
        </div>

        {/* Live Active Speakers Bar */}
        <div className="mt-4 pt-3.5 border-t border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Host Speaker Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                isHostSpeaking
                  ? "bg-amber-500/30 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105"
                  : "bg-black/30 border-amber-500/20 opacity-70"
              }`}
            >
              <span className="text-base">👩‍🏫</span>
              <div>
                <span className="text-[10px] text-amber-300 block font-semibold leading-tight">ನಿರೂಪಕಿ (Host)</span>
                <span className="font-extrabold text-amber-100 text-[11px]">ವಿದುಷಿ ಶ್ರುತಿ</span>
              </div>
              {isHostSpeaking && <span className="text-xs animate-bounce">🗣️</span>}
            </div>

            {/* Scholar Speaker Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                isScholarSpeaking
                  ? "bg-yellow-500/30 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.5)] scale-105"
                  : "bg-black/30 border-amber-500/20 opacity-70"
              }`}
            >
              <span className="text-base">👨‍🎓</span>
              <div>
                <span className="text-[10px] text-amber-300 block font-semibold leading-tight">ಜ್ಯೋತಿಷಿ (Scholar)</span>
                <span className="font-extrabold text-amber-100 text-[11px]">ವಿದ್ವಾನ್ ಕೌಶಿಕ್</span>
              </div>
              {isScholarSpeaking && <span className="text-xs animate-bounce">🎙️</span>}
            </div>
          </div>

          {/* Ambient Music & Speed Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => podcastAudioEngine.toggleAmbientMusic()}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition ${
                audioState.ambientAudioEnabled
                  ? "bg-emerald-900/60 border-emerald-400 text-emerald-200"
                  : "bg-black/40 border-amber-500/30 text-amber-300 hover:bg-black/60"
              }`}
            >
              {audioState.ambientAudioEnabled ? "🕉️ ತಾನ್ಪುರ ಆನ್" : "🕉️ ತಾನ್ಪುರ ಹಿನ್ನೆಲೆ"}
            </button>

            {/* Speed Selector */}
            <div className="flex items-center bg-black/50 border border-amber-500/40 rounded-xl p-0.5 text-[11px]">
              {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => podcastAudioEngine.setSpeed(spd)}
                  className={`px-2 py-0.5 rounded-lg font-bold transition ${
                    audioState.playbackSpeed === spd
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "text-amber-300 hover:text-white"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* House Selector 12 Horizontal Grid / Pills */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {PHALA_JYOTISHYA_EPISODES.map((ep) => {
            const isSelected = selectedHouse === ep.houseNumber;
            const isThisPlaying = isPlaying && audioState.currentEpisodeNumber === ep.houseNumber;

            return (
              <button
                key={ep.houseNumber}
                type="button"
                onClick={() => handleSelectEpisode(ep.houseNumber, true)}
                className={`px-3.5 py-2.5 rounded-2xl border-2 font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 shadow-lg scale-105"
                    : "bg-[#FEFCF4] border-amber-200 hover:border-amber-400 text-slate-800 hover:bg-amber-50"
                }`}
              >
                <span className="text-base">{ep.icon}</span>
                <div className="text-left">
                  <div className="font-black text-[11px] leading-tight">
                    {ep.houseNumber}ನೇ ಮನೆ
                  </div>
                  <div className="text-[10px] opacity-85 truncate max-w-[90px]">
                    {ep.sanskritName.split(" ")[0]}
                  </div>
                </div>
                {isThisPlaying && <span className="text-xs animate-spin">⚡</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio View: Active Episode Player + Synchronized Dialogue Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Episode Card & Master Controls (5 Columns) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="border-2 border-amber-300 bg-[#FFFDF7] p-5 rounded-3xl shadow-md space-y-4">
            {/* Episode Title & Icon */}
            <div className="flex items-start justify-between gap-3 border-b border-amber-200 pb-3">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-[11px] font-black text-amber-900 mb-1.5">
                  ಭಾವ {activeEpisode.houseNumber} • {activeEpisode.sanskritName}
                </span>
                <h2 className="text-lg font-black text-amber-950 leading-tight">
                  {activeEpisode.houseNameKn}
                </h2>
                <p className="text-xs text-amber-800 font-semibold mt-1">
                  {activeEpisode.taglineKn}
                </p>
              </div>
              <div className="text-4xl p-2.5 rounded-2xl bg-amber-100 border border-amber-300 shrink-0">
                {activeEpisode.icon}
              </div>
            </div>

            {/* Karakatwa Badges */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                ಮುಖ್ಯ ಕಾರಕತ್ವಗಳು (House Significations):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeEpisode.primaryKarakatwasKn.map((k, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 text-xs font-bold shadow-xs"
                  >
                    ✨ {k}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Planetary Attributes Table */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
              <div>
                <span className="text-slate-500 text-[10px] block font-bold">ಕಾರಕ ಗ್ರಹ:</span>
                <span className="font-extrabold text-amber-950">{activeEpisode.karakaPlanetKn}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-bold">ನೈಸರ್ಗಿಕ ರಾಶಿ & ಒಡೆಯ:</span>
                <span className="font-extrabold text-amber-950">{activeEpisode.naturalZodiacSignKn} ({activeEpisode.naturalLordKn})</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-bold">ಉಚ್ಚ ಗ್ರಹ:</span>
                <span className="font-extrabold text-emerald-800">{activeEpisode.exaltedPlanetKn}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-bold">ನೀಚ ಗ್ರಹ:</span>
                <span className="font-extrabold text-red-800">{activeEpisode.debilitatedPlanetKn}</span>
              </div>
            </div>

            {/* Big Audio Player Controls */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 text-amber-50 shadow-inner space-y-3">
              {/* Progress Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-amber-300 font-mono font-bold">
                  <span>ಸಂವಾದ ಸಾಲು {audioState.currentLineIndex + 1} of {activeEpisode.dialogue.length}</span>
                  <span>{Math.round(((audioState.currentLineIndex + 1) / activeEpisode.dialogue.length) * 100)}%</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-amber-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300"
                    style={{
                      width: `${((audioState.currentLineIndex + 1) / activeEpisode.dialogue.length) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Main Playback Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-1">
                {/* Previous Line */}
                <button
                  type="button"
                  onClick={() => podcastAudioEngine.previousLine()}
                  className="p-2.5 rounded-full bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-500/30 transition text-sm cursor-pointer"
                  title="ಹಿಂದಿನ ಸಂವಾದ"
                >
                  ⏮️
                </button>

                {/* Master Play / Pause */}
                {isPlaying ? (
                  <button
                    type="button"
                    onClick={() => podcastAudioEngine.pause()}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-sm shadow-lg flex items-center gap-2 cursor-pointer scale-105 active:scale-95 transition"
                  >
                    <span>⏸️</span>
                    <span>ವಿರಾಮ (Pause)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => podcastAudioEngine.play()}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-lg flex items-center gap-2 cursor-pointer scale-105 active:scale-95 transition animate-pulse"
                  >
                    <span>▶️</span>
                    <span>ಪಾಡ್‌ಕ್ಯಾಸ್ಟ್ ಆಲಿಸಿ (Play)</span>
                  </button>
                )}

                {/* Next Line */}
                <button
                  type="button"
                  onClick={() => podcastAudioEngine.nextLine()}
                  className="p-2.5 rounded-full bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-500/30 transition text-sm cursor-pointer"
                  title="ಮುಂದಿನ ಸಂವಾದ"
                >
                  ⏭️
                </button>

                {/* Stop */}
                <button
                  type="button"
                  onClick={() => podcastAudioEngine.stop()}
                  className="p-2.5 rounded-full bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-500/30 transition text-sm cursor-pointer"
                  title="ನಿಲ್ಲಿಸಿ (Stop)"
                >
                  ⏹️
                </button>
              </div>
            </div>

            {/* Captain vs Slave Card */}
            <div className="space-y-2.5 pt-2 border-t border-amber-200">
              <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <span>👑</span>
                <span>ಕ್ಯಾಪ್ಟನ್ (ರಾಜ) vs ಗುಲಾಮ (ಬಲಹೀನ) ತತ್ವ:</span>
              </h4>

              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs space-y-1">
                <div className="font-black text-emerald-950 flex items-center gap-1">
                  <span>🏆</span>
                  <span>ರಾಜ / ಕ್ಯಾಪ್ಟನ್ ಯೋಗ:</span>
                </div>
                <p className="text-[11px] text-emerald-900 font-medium leading-relaxed">
                  {activeEpisode.captainStatusKn}
                </p>
              </div>

              <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs space-y-1">
                <div className="font-black text-red-950 flex items-center gap-1">
                  <span>⛓️</span>
                  <span>ಗುಲಾಮ / ಬಲಹೀನ ಸ್ಥಿತಿ:</span>
                </div>
                <p className="text-[11px] text-red-900 font-medium leading-relaxed">
                  {activeEpisode.slaveStatusKn}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Interactive Live Synchronized Transcript (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-2 border-amber-300 bg-[#FFFDF7] p-5 rounded-3xl shadow-md space-y-4 flex flex-col h-full min-h-[540px]">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <div>
                  <h3 className="text-base font-black text-amber-950">
                    ಲೈವ್ ಸಂವಾದ ಸ್ಕ್ರಿಪ್ಟ್ (Synchronized Dialogue)
                  </h3>
                  <span className="text-[11px] text-amber-800 font-semibold">
                    ಯಾವುದೇ ಸಾಲಿನ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಅಲ್ಲಿಂದಲೇ ನೇರವಾಗಿ ಧ್ವನಿ ಆಲಿಸಬಹುದು.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-[10px] font-bold text-amber-950">
                  {activeEpisode.dialogue.length} ಸಂವಾದಗಳು
                </span>
              </div>
            </div>

            {/* Scrollable Dialogue Script View */}
            <div
              ref={dialogueContainerRef}
              className="space-y-3.5 overflow-y-auto max-h-[500px] p-2 pr-3 custom-scrollbar rounded-2xl bg-[#FEFCF4] border border-amber-200 shadow-inner flex-1"
            >
              {activeEpisode.dialogue.map((turn, idx) => {
                const isCurrentLine = audioState.currentLineIndex === idx && audioState.playbackState !== "stopped";
                const isHost = turn.speaker === "host_female";

                return (
                  <div
                    id={`dialogue-line-${idx}`}
                    key={turn.id}
                    onClick={() => podcastAudioEngine.playLine(idx)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isCurrentLine
                        ? "bg-amber-100/90 border-amber-500 shadow-md scale-[1.01]"
                        : isHost
                        ? "bg-white border-amber-200/80 hover:border-amber-400 hover:bg-amber-50/50"
                        : "bg-[#FFF9EE] border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{turn.avatar}</span>
                        <span className="font-extrabold text-xs text-amber-950">
                          {turn.speakerNameKn}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isHost ? "bg-purple-100 text-purple-900 border border-purple-300" : "bg-amber-100 text-amber-950 border border-amber-300"
                        }`}>
                          {isHost ? "ಪ್ರಶ್ನೆ / ಸನ್ನಿವೇಶ" : "ಶಾಸ್ತ್ರೀಯ ನಿರ್ಣಯ"}
                        </span>
                      </div>

                      {turn.emphasisTopic && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                          #{turn.emphasisTopic}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-900 leading-relaxed pl-1">
                      {turn.textKn}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Dr. B.V. Raman Golden Rules Footer Drawer */}
            <div className="p-3.5 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border border-amber-300 rounded-2xl space-y-2 shrink-0">
              <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <span>⭐</span>
                <span>ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಸುವರ್ಣ ಫಲ ನಿರ್ಣಯ ಸೂತ್ರಗಳು:</span>
              </h4>
              <ul className="space-y-1 text-[11px] text-amber-950 font-semibold list-disc list-inside">
                {activeEpisode.ramanGoldenRulesKn.map((rule, rIdx) => (
                  <li key={rIdx} className="leading-snug">{rule}</li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
