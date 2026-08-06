import type { AyanamsaModel } from "./AstroTypes";
import { lahiriAyanamsaDegrees } from "./LahiriAyanamsa";
import { trueChitrapakshaAyanamsaDegrees } from "./DrikGanitaAyanamsa";

const jdUt = (d: Date): number => d.getTime() / 86400000 + 2440587.5;

export const ayanamsaForModel = (date: Date, model: AyanamsaModel): number => {
  if (model === "vakya") {
    // Vakya approximates traditional Surya Siddhanta, which is typically ~3.63 degrees behind Lahiri
    return lahiriAyanamsaDegrees(jdUt(date)) + 3.63;
  }
  return model === "lahiri" ? lahiriAyanamsaDegrees(jdUt(date)) : trueChitrapakshaAyanamsaDegrees(date);
};
