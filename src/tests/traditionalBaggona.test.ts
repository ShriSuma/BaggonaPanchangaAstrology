import { describe, expect, it } from "vitest";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";

describe("TraditionalBaggonaEngine calculations for Gokarna test case", () => {
  it("matches handwritten Panchanga details exactly for Pramod (31-May-1993 09:25 AM)", () => {
    const res = calculateTraditionalBaggona("1993-05-31", "09:25", 14.5479, 74.3187, "lahiri");

    expect(res.shakaYear).toBe(1915);
    expect(res.samvatsara).toBe("Shrimukha");
    expect(res.samvatsaraKn).toBe("ಶ್ರೀಮುಖ");
    expect(res.masa).toBe("Jyeshtha");
    expect(res.masaKn).toBe("ಜ್ಯೇಷ್ಠ");
    expect(res.paksha).toBe("Shukla");
    expect(res.pakshaKn).toBe("ಶುಕ್ಲ");
    
    expect(res.tithi).toBe("Ekadashi");
    expect(res.tithiKn).toBe("ಏಕಾದಶಿ");
    expect(res.tithiGhati).toBe(52);
    expect(res.tithiVighati).toBe(46);

    expect(res.weekday).toBe("Chandra Vaasare");
    expect(res.weekdayKn).toBe("ಚಂದ್ರ ವಾಸರೇ");

    expect(res.sunNakshatra).toBe("Rohini");
    expect(res.sunNakshatraKn).toBe("ರೋಹಿಣಿ");
    expect(res.sunNakshatraGhati).toBe(471);
    expect(res.sunNakshatraVighati).toBe(9);

    expect(res.moonNakshatra).toBe("Hasta");
    expect(res.moonNakshatraKn).toBe("ಹಸ್ತಾ");
    expect(res.moonNakshatraGhati).toBe(30);
    expect(res.moonNakshatraVighati).toBe(34);

    expect(res.yoga).toBe("Vyatipata");
    expect(res.yogaKn).toBe("ವ್ಯತೀಪಾತ");
    expect(res.yogaGhati).toBe(58);
    expect(res.yogaVighati).toBe(3);

    expect(res.karana).toBe("Vanija");
    expect(res.karanaKn).toBe("ವಣಿಜ");
    expect(res.karanaGhati).toBe(25);
    expect(res.karanaVighati).toBe(58);

    expect(res.vishaGhati.ghati).toBe(54);
    expect(res.vishaGhati.vighati).toBe(25);

    expect(res.amrithaGhati.ghati).toBe(16);
    expect(res.amrithaGhati.vighati).toBe(39);

    expect(res.divaGhati.ghati).toBe(32);
    expect(res.divaGhati.vighati).toBe(3);

    expect(res.sankrantiSign).toBe("Vrishabha");
    expect(res.sankrantiSignKn).toBe("ವೃಷಭ");
    expect(res.sankrantiGataDina).toBe(17);

    expect(res.paramaGhati.ghati).toBe(55);
    expect(res.paramaGhati.vighati).toBe(36);

    expect(res.ashayaGhati.ghati).toBe(22);
    expect(res.ashayaGhati.vighati).toBe(19);

    expect(res.ghatadina.ghati).toBe(33);
    expect(res.ghatadina.vighati).toBe(17);

    expect(res.suryodhayadgata.ghati).toBe(8);
    expect(res.suryodhayadgata.vighati).toBe(14);
    
    expect(res.sunrise).toBe("06:07");
    expect(res.sunset).toBe("18:56");
  });

  it("matches handwritten Panchanga details exactly for Vidyashree (24-Oct-1997 08:15 PM)", () => {
    const res = calculateTraditionalBaggona("1997-10-24", "20:15", 14.5479, 74.3187, "lahiri");

    expect(res.shakaYear).toBe(1919);
    expect(res.samvatsara).toBe("Eeshvara");
    expect(res.samvatsaraKn).toBe("ಈಶ್ವರ");
    expect(res.masa).toBe("Ashwija");
    expect(res.masaKn).toBe("ಆಶ್ವೀಜ");
    expect(res.paksha).toBe("Krishna");
    expect(res.pakshaKn).toBe("ಕೃಷ್ಣ");
    
    expect(res.tithi).toBe("Navami");
    expect(res.tithiKn).toBe("ನವಮಿ");
    expect(res.tithiGhati).toBe(46);
    expect(res.tithiVighati).toBe(34);

    expect(res.weekday).toBe("Bhrigu Vaasare");
    expect(res.weekdayKn).toBe("ಭೃಗು ವಾಸರೇ");

    expect(res.sunNakshatra).toBe("Swati");
    expect(res.sunNakshatraKn).toBe("ಸ್ವಾತಿ");
    expect(res.sunNakshatraGhati).toBe(790);
    expect(res.sunNakshatraVighati).toBe(34);

    expect(res.moonNakshatra).toBe("Ashlesha");
    expect(res.moonNakshatraKn).toBe("ಆಶ್ಲೇಷಾ");
    expect(res.moonNakshatraGhati).toBe(68);
    expect(res.moonNakshatraVighati).toBe(44);

    expect(res.yoga).toBe("Shubha");
    expect(res.yogaKn).toBe("ಶುಭ");
    expect(res.yogaGhati).toBe(62);
    expect(res.yogaVighati).toBe(41);

    expect(res.karana).toBe("Garaja");
    expect(res.karanaKn).toBe("ಗರಜ");
    expect(res.karanaGhati).toBe(46);
    expect(res.karanaVighati).toBe(34);

    expect(res.vishaGhati.ghati).toBe(37);
    expect(res.vishaGhati.vighati).toBe(35);

    expect(res.amrithaGhati.ghati).toBe(64);
    expect(res.amrithaGhati.vighati).toBe(17);

    expect(res.divaGhati.ghati).toBe(29);
    expect(res.divaGhati.vighati).toBe(0);

    expect(res.sankrantiSign).toBe("Tula");
    expect(res.sankrantiSignKn).toBe("ತುಲಾ");
    expect(res.sankrantiGataDina).toBe(7);

    expect(res.paramaGhati.ghati).toBe(66);
    expect(res.paramaGhati.vighati).toBe(45);

    expect(res.ashayaGhati.ghati).toBe(34);
    expect(res.ashayaGhati.vighati).toBe(21);

    expect(res.ghatadina.ghati).toBe(32);
    expect(res.ghatadina.vighati).toBe(23);

    expect(res.suryodhayadgata.ghati).toBe(34);
    expect(res.suryodhayadgata.vighati).toBe(22);
    
    expect(res.sunrise).toBe("06:29");
    expect(res.sunset).toBe("18:06");

    expect(res.dashaLord).toBe("Mercury");
    expect(res.dashaYears).toBe(8);
    expect(res.dashaMonths).toBe(8);
    expect(res.dashaDays).toBe(17);
  });
});
