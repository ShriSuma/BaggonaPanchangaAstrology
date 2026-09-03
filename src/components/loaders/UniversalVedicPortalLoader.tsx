import React from "react";
import { KundliChakraLoader } from "./KundliChakraLoader";
import { SankhyaNumerologyLoader } from "../sankhyashastra/SankhyaNumerologyLoader";
import { DiksuchiCompassLoader } from "./DiksuchiCompassLoader";
import { HindinaJanmaKarmicLoader } from "./HindinaJanmaKarmicLoader";
import { VahanaMuhurthaLoader } from "./VahanaMuhurthaLoader";
import { BhavishyaMasterLoader } from "./BhavishyaMasterLoader";

export type VedicLoaderType =
  | "kundli"
  | "sankhya"
  | "diksuchi"
  | "purva_janma"
  | "vahana"
  | "bhavishya";

export type UniversalVedicPortalLoaderProps = {
  isOpen: boolean;
  type: VedicLoaderType;
  isKn?: boolean;
  title?: string;
  message?: string;
};

export const UniversalVedicPortalLoader: React.FC<UniversalVedicPortalLoaderProps> = ({
  isOpen,
  type,
  isKn = true,
  title,
  message
}) => {
  if (!isOpen) return null;

  switch (type) {
    case "kundli":
      return <KundliChakraLoader isKn={isKn} title={title} message={message} />;
    case "sankhya":
      return <SankhyaNumerologyLoader isKn={isKn} message={message} />;
    case "diksuchi":
      return <DiksuchiCompassLoader isKn={isKn} title={title} message={message} />;
    case "purva_janma":
      return <HindinaJanmaKarmicLoader isKn={isKn} title={title} message={message} />;
    case "vahana":
      return <VahanaMuhurthaLoader isKn={isKn} title={title} message={message} />;
    case "bhavishya":
    default:
      return <BhavishyaMasterLoader isKn={isKn} title={title} message={message} />;
  }
};
