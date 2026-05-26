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
    expect(res.tithiVighati).toBe(49);

    expect(res.weekday).toBe("Chandra Vaasare");
    expect(res.weekdayKn).toBe("ಚಂದ್ರ ವಾಸರೇ");

    expect(res.sunNakshatra).toBe("Rohini");
    expect(res.sunNakshatraKn).toBe("ರೋಹಿಣಿ");
    expect(res.sunNakshatraGhati).toBe(26);
    expect(res.sunNakshatraVighati).toBe(10);

    expect(res.moonNakshatra).toBe("Hasta");
    expect(res.moonNakshatraKn).toBe("ಹಸ್ತಾ");
    expect(res.moonNakshatraGhati).toBe(30);
    expect(res.moonNakshatraVighati).toBe(35);

    expect(res.yoga).toBe("Siddhi");
    expect(res.yogaKn).toBe("ಸಿದ್ಧಿ");
    expect(res.yogaGhati).toBe(5);
    expect(res.yogaVighati).toBe(56);

    expect(res.karana).toBe("Vanija");
    expect(res.karanaKn).toBe("ವಣಿಜ");
    expect(res.karanaGhati).toBe(26);
    expect(res.karanaVighati).toBe(0);

    expect(res.vishaGhati.ghati).toBe(49);
    expect(res.vishaGhati.vighati).toBe(9);

    expect(res.amrithaGhati.ghati).toBe(16);
    expect(res.amrithaGhati.vighati).toBe(42);

    expect(res.divaGhati.ghati).toBe(32);
    expect(res.divaGhati.vighati).toBe(0);

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
    expect(res.suryodhayadgata.vighati).toBe(17);
    
    expect(res.sunrise).toBe("06:06");
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
    expect(res.tithiVighati).toBe(37);

    expect(res.weekday).toBe("Shukra Vaasare");
    expect(res.weekdayKn).toBe("ಶುಕ್ರ ವಾಸರೇ");

    expect(res.sunNakshatra).toBe("Swati");
    expect(res.sunNakshatraKn).toBe("ಸ್ವಾತಿ");
    expect(res.sunNakshatraGhati).toBe(0);
    expect(res.sunNakshatraVighati).toBe(45);

    expect(res.moonNakshatra).toBe("Tishya");
    expect(res.moonNakshatraKn).toBe("ತಿಷ್ಯ");
    expect(res.moonNakshatraGhati).toBe(1);
    expect(res.moonNakshatraVighati).toBe(59);

    expect(res.yoga).toBe("Sadhya");
    expect(res.yogaKn).toBe("ಸಾಧ್ಯ");
    expect(res.yogaGhati).toBe(1);
    expect(res.yogaVighati).toBe(7);

    expect(res.karana).toBe("Taitila");
    expect(res.karanaKn).toBe("ತೈತಿಲ");
    expect(res.karanaGhati).toBe(13);
    expect(res.karanaVighati).toBe(54);

    expect(res.vishaGhati.ghati).toBe(41);
    expect(res.vishaGhati.vighati).toBe(33);

    expect(res.amrithaGhati.ghati).toBe(15);
    expect(res.amrithaGhati.vighati).toBe(25);

    expect(res.divaGhati.ghati).toBe(28);
    expect(res.divaGhati.vighati).toBe(57);

    expect(res.sankrantiSign).toBe("Tula");
    expect(res.sankrantiSignKn).toBe("ತುಲಾ");
    expect(res.sankrantiGataDina).toBe(7);

    expect(res.paramaGhati.ghati).toBe(66);
    expect(res.paramaGhati.vighati).toBe(44);

    expect(res.ashayaGhati.ghati).toBe(34);
    expect(res.ashayaGhati.vighati).toBe(20);

    expect(res.ghatadina.ghati).toBe(32);
    expect(res.ghatadina.vighati).toBe(24);

    expect(res.suryodhayadgata.ghati).toBe(34);
    expect(res.suryodhayadgata.vighati).toBe(23);
    
    expect(res.sunrise).toBe("06:27");
    expect(res.sunset).toBe("18:10");

    expect(res.dashaLord).toBe("Mercury");
    expect(res.dashaYears).toBe(8);
    expect(res.dashaMonths).toBe(0);
    expect(res.dashaDays).toBe(15);
  });
});
