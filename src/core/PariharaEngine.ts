import { PlanetName, type KundliOutput } from "./AstroTypes";

export interface Parihara {
  doshaName: string;
  afflictedGraha: string;
  description: string;
  poojaName: string;
  whereToDo: string;
  whenToDo: string;
}

/**
 * Mathematically evaluates the Kundli to find specific Doshas (afflictions)
 * and assigns specific classical pariharas (remedies) with actionable details.
 */
export function getPariharas(kundli: KundliOutput, maritalStatus?: string): Parihara[] {
  const pariharas: Parihara[] = [];
  const planets = kundli.planets;
  const isMarried = maritalStatus === "married";
  
  // 1. Manglik Dosha (Kuja Dosha)
  const mars = planets.find(p => p.name === PlanetName.Mars);
  if (mars && [1, 2, 4, 7, 8, 12].includes(mars.house)) {
    pariharas.push({
      doshaName: "Manglik Dosha (Kuja Dosha)",
      afflictedGraha: PlanetName.Mars,
      description: isMarried
        ? `Mars is placed in your ${mars.house} house. In married life, this placement brings intense dynamism and passion; practicing patience, mutual respect, and avoiding temperamental arguments ensures enduring domestic peace.`
        : `Mars is placed in your ${mars.house} house. In classical astrology, this Kuja (Manglik) placement advises patience, thoughtful alliance selection, and emotional composure before marriage.`,
      poojaName: isMarried ? "Mangala Gowri Pooja / Sri Subramanya Shanti" : "Mangala Gowri Pooja / Subramanya Homa",
      whereToDo: "Kukke Subramanya Temple (Karnataka) or Gokarna Mahabaleshwara Kshetra.",
      whenToDo: isMarried
        ? "On a Tuesday during Shukla Paksha or on Sashti tithi for marital harmony and prosperity."
        : "On a Tuesday during Shukla Paksha (waxing moon) or on Sashti tithi."
    });
  }

  // 2. Saturn Afflictions (Sade Sati or Dusthana Saturn)
  const saturn = planets.find(p => p.name === PlanetName.Saturn);
  if (saturn && [6, 8, 12].includes(saturn.house)) {
    pariharas.push({
      doshaName: "Shani Dosha (Saturn Affliction)",
      afflictedGraha: PlanetName.Saturn,
      description: `Saturn is positioned in a challenging house (${saturn.house}), which can cause sudden delays in career and life milestones.`,
      poojaName: "Navagraha Shanti / Shani Tailabhishekam",
      whereToDo: "Thirunallar Saniswaran Temple or any local Navagraha shrine.",
      whenToDo: "On a Saturday evening during the Saturn Hora."
    });
  }

  // 3. Rahu/Ketu Dosha (Kala Sarpa or general affliction)
  const rahu = planets.find(p => p.name === PlanetName.Rahu);
  const ketu = planets.find(p => p.name === PlanetName.Ketu);
  if (rahu && ketu && (rahu.house === 1 || rahu.house === 7 || rahu.house === 8)) {
    pariharas.push({
      doshaName: "Rahu/Ketu Dosha",
      afflictedGraha: "Rahu & Ketu",
      description: `The nodal axis is heavily influencing your chart (House ${rahu.house}/${ketu.house}), which can create illusions, confusion, and sudden reversals in fortune.`,
      poojaName: "Sarpasamskara / Kala Sarpa Shanti",
      whereToDo: "Kalahasti Temple (Andhra Pradesh) or Ghati Subramanya.",
      whenToDo: "During Rahu Kalam on a Tuesday or on Panchami Tithi."
    });
  }

  // 4. Jupiter Debilitated or Afflicted (Guru Chandal Dosha)
  const jupiter = planets.find(p => p.name === PlanetName.Jupiter);
  const rahuOrKetuConjunctJupiter = planets.some(p => (p.name === PlanetName.Rahu || p.name === PlanetName.Ketu) && p.house === jupiter?.house);
  
  if (jupiter && (jupiter.isDebilitated || rahuOrKetuConjunctJupiter)) {
    pariharas.push({
      doshaName: "Guru Chandal / Weak Jupiter",
      afflictedGraha: PlanetName.Jupiter,
      description: "Jupiter, the planet of wisdom and expansion, is weakened or afflicted in your chart, which can cause lack of clarity, financial stagnation, or delays in progeny.",
      poojaName: "Dakshinamurthy Pooja / Guru Shanti",
      whereToDo: "Any Shiva temple facing South (Dakshinamurthy shrine) or Sringeri Sharada Peetham.",
      whenToDo: "On a Thursday morning."
    });
  }

  // If no major doshas found, provide a general uplifting one based on Lagna Lord
  if (pariharas.length === 0) {
    const lagnaLord = kundli.planets[0].name; // Simplifying to Sun for now, usually it's the Lagna Lord
    pariharas.push({
      doshaName: "General Planetary Alignment",
      afflictedGraha: lagnaLord,
      description: "Your chart is relatively balanced without severe classical Doshas. However, strengthening your core life-force energy is always recommended.",
      poojaName: "Navagraha Homa",
      whereToDo: "At your home or local temple.",
      whenToDo: "On your birth star (Janma Nakshatra) day once a year."
    });
  }

  return pariharas;
}
