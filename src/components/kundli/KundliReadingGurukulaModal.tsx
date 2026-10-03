import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import type { KundliOutput } from "../../core/AstroTypes";
import { KundliGurukulaContent } from "./KundliGurukulaContent";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  kundli: KundliOutput;
  birthDate?: string;
  birthTime?: string;
  nativeName?: string;
  gender?: string;
}

export const KundliReadingGurukulaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  kundli,
  birthDate,
  birthTime,
  nativeName = "ಜಾತಕರು",
  gender
}) => {
  const { i18n } = useTranslation();
  const isKn = i18n.language.startsWith("kn");

  // Lock background body scroll while modal is open
  useEffect(() => {
    if (isOpen && typeof document !== "undefined") {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isKn ? "ಕುಂಡಲಿ ವಾಚನ ಗುರು" : "Kundli Reading Gurukula"}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-900/60 backdrop-blur-sm overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-6xl max-h-[92vh] sm:max-h-[95vh] rounded-3xl border-2 border-[#d4af37] bg-[#faf6ee] text-stone-900 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <KundliGurukulaContent
          kundli={kundli}
          birthDate={birthDate}
          birthTime={birthTime}
          nativeName={nativeName}
          gender={gender}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body
  );
};
