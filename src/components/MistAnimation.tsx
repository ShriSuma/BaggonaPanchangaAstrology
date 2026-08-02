import { useEffect, useRef } from "react";

type MistAnimationProps = {
  isActive: boolean;
  onAnimationEnd?: () => void;
};

export default function MistAnimation({ isActive, onAnimationEnd }: MistAnimationProps): JSX.Element | null {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isActive) {
      if (!audioRef.current) {
        audioRef.current = new Audio("/magic-chime.mp3"); // Ensure this file exists or fail gracefully
      }
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {
        // Autoplay may be blocked, fail silently
      });
      
      const timer = setTimeout(() => {
        if (onAnimationEnd) onAnimationEnd();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isActive, onAnimationEnd]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm transition-opacity duration-1000 animate-in fade-in" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay animate-pulse" />
      
      {/* Fog elements */}
      <div className="absolute -inset-[100%] animate-[spin_20s_linear_infinite] opacity-50 mix-blend-screen"
        style={{
          background: "radial-gradient(circle at center, rgba(167, 139, 250, 0.4) 0%, transparent 60%)",
          filter: "blur(60px)"
        }}
      />
      <div className="absolute -inset-[50%] animate-[spin_15s_linear_infinite_reverse] opacity-60 mix-blend-screen"
        style={{
          background: "radial-gradient(circle at center, rgba(192, 132, 252, 0.3) 0%, transparent 70%)",
          filter: "blur(40px)"
        }}
      />
      
      <div className="relative z-10 text-6xl animate-bounce">✨</div>
    </div>
  );
}
