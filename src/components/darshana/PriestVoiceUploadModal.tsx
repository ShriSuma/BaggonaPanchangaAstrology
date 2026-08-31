import React, { useState, useEffect, useRef } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import {
  savePriestAudioRecording,
  getPriestAudioRecording,
  removePriestAudioRecording,
  type PriestAudioKey,
  type CustomPriestAudioItem
} from "../../features/audio/priestVoiceManager";

export interface PriestVoiceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: SevaLang;
  priestName?: string;
}

const STEP_LABELS: Record<PriestAudioKey, { titleKn: string; titleEn: string; mantra: string }> = {
  step_1: {
    titleKn: "ಹಂತ ೧: ಘಂಟಾನಾದ & ದೇವತಾಹ್ವಾನ ಮಂತ್ರ",
    titleEn: "Step 1: Temple Bell & Invocation Mantra",
    mantra: "ಓಂ ಆಗಮಾರ್ಥಂ ತು ದೇವಾನಾಂ ಗಮನಾರ್ಥಂ ತು ರಾಕ್ಷಸಾಮ್..."
  },
  step_2: {
    titleKn: "ಹಂತ ೨: ದೀಪಜ್ಯೋತಿ & ಮಂಗಳಾಕ್ಷತೆ ಸಮರ್ಪಣೆ",
    titleEn: "Step 2: Deepa Jyothi & Mantrakshata Offering",
    mantra: "ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ ದೀಪಜ್ಯೋತಿರ್ಜನಾರ್ದನಃ..."
  },
  step_3: {
    titleKn: "ಹಂತ ೩: ದೈನಂದಿನ ಮಹಾಸಂಕಲ್ಪ",
    titleEn: "Step 3: Sacred Devotee Sankalpa",
    mantra: "ಅದ್ಯ ಪೂರ್ವೋಕ್ತ ಏವಂ ಗುಣ ವಿಶೇಷಣ..."
  },
  step_4: {
    titleKn: "ಹಂತ ೪: ಮುಖ್ಯ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ",
    titleEn: "Step 4: Chief Priest Benediction & Ashirvada",
    mantra: "ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ..."
  },
  deity_mantra: {
    titleKn: "ದೈನಂದಿನ ದೇವತಾ ಜಪ ಮಂತ್ರ",
    titleEn: "Daily Deity Chanting Mantra",
    mantra: "ಓಂ ನಮಃ ಶಿವಾಯ / ॐ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಮಸೇ ನಮಃ"
  }
};

export const PriestVoiceUploadModal: React.FC<PriestVoiceUploadModalProps> = ({
  isOpen,
  onClose,
  lang = "kn",
  priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
}) => {
  const [recordings, setRecordings] = useState<Record<PriestAudioKey, CustomPriestAudioItem | null>>({
    step_1: null,
    step_2: null,
    step_3: null,
    step_4: null,
    deity_mantra: null
  });

  const [activePlayingKey, setActivePlayingKey] = useState<PriestAudioKey | null>(null);
  const [isRecordingLive, setIsRecordingLive] = useState<PriestAudioKey | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAllRecordings();
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      setActivePlayingKey(null);
    }
  }, [isOpen]);

  const loadAllRecordings = () => {
    setRecordings({
      step_1: getPriestAudioRecording("step_1"),
      step_2: getPriestAudioRecording("step_2"),
      step_3: getPriestAudioRecording("step_3"),
      step_4: getPriestAudioRecording("step_4"),
      deity_mantra: getPriestAudioRecording("deity_mantra")
    });
  };

  const handleFileUpload = async (key: PriestAudioKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await savePriestAudioRecording(key, file);
      loadAllRecordings();
    } catch (err) {
      alert("Failed to save audio file. Please try a smaller .mp3 or .wav file.");
    }
  };

  const handleStartLiveRecord = async (key: PriestAudioKey) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], `${key}_live_recording.webm`, { type: "audio/webm" });
        await savePriestAudioRecording(key, file);
        loadAllRecordings();
        setIsRecordingLive(null);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setIsRecordingLive(key);
    } catch {
      alert("Microphone access is required to record live audio.");
    }
  };

  const handleStopLiveRecord = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleTogglePlay = (key: PriestAudioKey, dataUrl: string) => {
    if (activePlayingKey === key) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      setActivePlayingKey(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const audio = new Audio(dataUrl);
    audioPlayerRef.current = audio;
    setActivePlayingKey(key);
    audio.onended = () => {
      setActivePlayingKey(null);
      audioPlayerRef.current = null;
    };
    audio.onerror = () => {
      setActivePlayingKey(null);
      audioPlayerRef.current = null;
    };
    audio.play().catch(() => setActivePlayingKey(null));
  };

  const handleDelete = (key: PriestAudioKey) => {
    removePriestAudioRecording(key);
    loadAllRecordings();
  };

  if (!isOpen) return null;

  const keys: PriestAudioKey[] = ["step_1", "step_2", "step_3", "step_4", "deity_mantra"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#1C0A00] border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-amber-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/40 pb-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xl shadow-xs">
              🎙️
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#FDE68A]">
                ಅರ್ಚಕರ ನೈಜ ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ & ಅಪ್‌ಲೋಡ್
              </h2>
              <p className="text-xs text-amber-300 font-medium">
                Chief Priest ({priestName}) Authentic Voice & Audio Vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-amber-900/50 hover:bg-amber-800 text-amber-200 border border-amber-400 text-xs font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Informational Guidance */}
        <div className="p-3.5 bg-amber-950/60 rounded-2xl border border-amber-500/30 text-xs leading-relaxed text-amber-200 space-y-1">
          <div className="font-bold text-[#FDE68A] flex items-center gap-1.5">
            <span>ℹ️</span>
            <span>ಧ್ವನಿ ಅಪ್‌ಲೋಡ್ ವಿಧಾನ (How to Add Voice Recordings):</span>
          </div>
          <p className="pl-4 border-l border-amber-400/50 text-[11px] text-amber-100">
            ಅರ್ಚಕರು ತಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ರೆಕಾರ್ಡ್ ಮಾಡಿದ ಆಡಿಯೋ (.mp3, .wav, .m4a) ಫೈಲ್‌ಗಳನ್ನು ನೇರವಾಗಿ ಕೆಳಗೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು ಅಥವಾ 🎙️ ಲೈವ್ ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ಸನ್ನಿಧಾನದಲ್ಲೇ ರೆಕಾರ್ಡ್ ಮಾಡಬಹುದು. ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಧ್ವನಿಯೇ ಭಕ್ತರಿಗೆ ಪೂಜೆ ಸಮಯದಲ್ಲಿ ಮೊಳಗುತ್ತದೆ.
          </p>
        </div>

        {/* Step-by-Step Recording List */}
        <div className="space-y-3">
          {keys.map((key) => {
            const item = recordings[key];
            const meta = STEP_LABELS[key];
            const isPlaying = activePlayingKey === key;
            const isRec = isRecordingLive === key;

            return (
              <div
                key={key}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2A1205] to-[#1F0D04] border border-amber-500/30 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black text-[#FDE68A]">
                      {meta.titleKn}
                    </h3>
                    <p className="text-[10px] text-amber-300 font-mono italic">
                      "{meta.mantra}"
                    </p>
                  </div>

                  {item ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 border border-emerald-400 text-emerald-300">
                      ✓ ಆಡಿಯೋ ಸಿದ್ಧವಾಗಿದೆ
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-600/50 text-amber-400">
                      AI Male Priest Voice (Fallback)
                    </span>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* File Upload Button */}
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-amber-800/80 hover:bg-amber-700 text-white text-[11px] font-bold border border-amber-400 shadow-xs transition-all flex items-center gap-1.5">
                    <span>📁</span>
                    <span>ಫೈಲ್ ಅಪ್‌ಲೋಡ್ (.mp3, .wav)</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileUpload(key, e)}
                      className="hidden"
                    />
                  </label>

                  {/* Live Record Button */}
                  {isRec ? (
                    <button
                      type="button"
                      onClick={handleStopLiveRecord}
                      className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-[11px] font-black animate-pulse border border-red-400 shadow-xs flex items-center gap-1.5"
                    >
                      <span>⏹️</span>
                      <span>ರೆಕಾರ್ಡಿಂಗ್ ಮುಕ್ತಾಯಗೊಳಿಸಿ</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartLiveRecord(key)}
                      className="px-3 py-1.5 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-[11px] font-bold border border-amber-500/50 shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <span>🎙️</span>
                      <span>ಲೈವ್ ರೆಕಾರ್ಡ್</span>
                    </button>
                  )}

                  {/* Play/Pause Button if uploaded */}
                  {item && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleTogglePlay(key, item.dataUrl)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black border shadow-xs transition-all flex items-center gap-1.5 ${
                          isPlaying
                            ? "bg-emerald-600 text-white border-emerald-400"
                            : "bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border-emerald-500/50"
                        }`}
                      >
                        <span>{isPlaying ? "⏸️" : "▶️"}</span>
                        <span>{isPlaying ? "ವಿರಾಮ" : "ಕೇಳಿ (Play)"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(key)}
                        className="px-2.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-[11px] font-bold border border-red-500/40 transition-all"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-amber-500/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 border border-amber-400 shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            ✓ ಪೂರ್ಣಗೊಂಡಿದೆ (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
