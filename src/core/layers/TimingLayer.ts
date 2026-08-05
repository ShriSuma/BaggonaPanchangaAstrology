import { type KundliOutput } from "../AstroTypes";
import { MasterEngineContext } from "../MasterPredictionEngine";

export interface TimingLayerOutput {
  lifeClock: {
    currentPhase: string;
    description: string;
    emotionalValidation: string;
  };
  twelveMonthRoadmap: {
    month: string;
    prediction: string;
    isCritical: boolean;
  }[];
}

export function evaluateTimingLayer(kundli: KundliOutput, context: MasterEngineContext): TimingLayerOutput {
  return {
    lifeClock: calculateLifeClock(kundli),
    twelveMonthRoadmap: calculateTwelveMonthRoadmap(kundli)
  };
}

function calculateLifeClock(kundli: KundliOutput) {
  return {
    currentPhase: "The Breakthrough Phase",
    description: "You are currently entering a pivotal cosmic period.",
    emotionalValidation: "You have been in a cycle of intense pressure. The hardest part is behind you. You are now entering a phase where your hard work will be recognized."
  };
}

function calculateTwelveMonthRoadmap(kundli: KundliOutput) {
  const current = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const roadmap = [];
  let m = current.getMonth();
  let y = current.getFullYear();
  
  for (let i = 0; i < 12; i++) {
    roadmap.push({
      month: `${months[m]} ${y}`,
      prediction: i === 2 
        ? "A significant shift in your environment. Be prepared for sudden responsibilities." 
        : "A period of emotional stabilization. Good time for investments.",
      isCritical: i === 2
    });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }
  return roadmap;
}
