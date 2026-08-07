import { calculateKundliWithPlaceSun } from "../src/core/KundliEngine";

const text = "ಹೆಸರು ಪ್ರಮೋದ ಗೋತ್ರ ವಸಿಷ್ಠ ದಿನಾಂಕ 31 ಮೇ 1993 ಬೆಳಿಗ್ಗೆ 9 25ಕ್ಕೆ ಜನನ";

// Copy tryParseDate logic
const tryParseDate = (text: string) => {
    const knMonths = ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
    const enMonths = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "jan", "feb", "mar", "apr", "aug", "sep", "sept", "oct", "nov", "dec"];
    
    let realMonth = -1;
    for (let i = 0; i < knMonths.length; i++) {
      if (text.toLowerCase().includes(knMonths[i])) { realMonth = i; break; }
    }
    if (realMonth === -1) {
      for (let i = 0; i < enMonths.length; i++) {
        if (text.toLowerCase().includes(enMonths[i])) {
          realMonth = new Date(Date.parse(enMonths[i] +" 1, 2012")).getMonth();
          break;
        }
      }
    }

    let dateObj: Date | null = null;
    let timeStr = "";

    if (realMonth !== -1) {
      const yearMatch = text.match(/\b(19|20)\d{2}\b/);
      const dayMatch = text.match(/\b(1st|2nd|3rd|\d{1,2}(th)?)\b/);
      
      if (yearMatch && dayMatch) {
        const dayNum = parseInt(dayMatch[0].replace(/\D/g, ''), 10);
        const yearNum = parseInt(yearMatch[0], 10);
        if (dayNum >= 1 && dayNum <= 31) {
          dateObj = new Date(yearNum, realMonth, dayNum, 12, 0, 0, 0);
        }
      }
    }

    const pat1 = /(ಬೆಳಿಗ್ಗೆ|ಮಧ್ಯಾಹ್ನ|ಸಂಜೆ|ರಾತ್ರಿ|am|pm)\s*(\d{1,2})(?:\s*:?\s*|\s+)(\d{2})?/i;
    const pat2 = /\b(\d{1,2})(?:\s*:?\s*|\s+)(\d{2})?\s*(ಬೆಳಿಗ್ಗೆ|ಮಧ್ಯಾಹ್ನ|ಸಂಜೆ|ರಾತ್ರಿ|am|pm)/i;
    const pat3 = /\b(\d{1,2}):(\d{2})\b/i;

    let match = text.match(pat1);
    let hr = 0, mn = 0, marker = "";
    if (match) {
        marker = match[1].toLowerCase();
        hr = parseInt(match[2], 10);
        mn = match[3] ? parseInt(match[3], 10) : 0;
    } else {
        match = text.match(pat2);
        if (match) {
            hr = parseInt(match[1], 10);
            mn = match[2] ? parseInt(match[2], 10) : 0;
            marker = match[3].toLowerCase();
        } else {
            match = text.match(pat3);
            if (match) {
                hr = parseInt(match[1], 10);
                mn = parseInt(match[2], 10);
            }
        }
    }

    if (match) {
      const isPM = marker === "pm" || marker === "ಮಧ್ಯಾಹ್ನ" || marker === "ಸಂಜೆ" || marker === "ರಾತ್ರಿ";
      const isAM = marker === "am" || marker === "ಬೆಳಿಗ್ಗೆ";
      
      if (isPM && hr < 12) hr += 12;
      if (isAM && hr === 12) hr = 0;
      
      timeStr = `${hr.toString().padStart(2, '0')}:${mn.toString().padStart(2, '0')}`;
    }

    return { date: dateObj, time: timeStr };
};

const extracted = tryParseDate(text);
console.log("EXTRACTED:", extracted);

if (extracted.date && extracted.time) {
  const ymd = `${extracted.date.getFullYear()}-${(extracted.date.getMonth()+1).toString().padStart(2, '0')}-${extracted.date.getDate().toString().padStart(2, '0')}`;
  const inputPayload = {
    name: "User",
    birthDate: ymd,
    birthTime: extracted.time,
    latitude: 12.9716, // Default
    longitude: 77.5946,
  };
  console.log("PAYLOAD:", inputPayload);
  calculateKundliWithPlaceSun(inputPayload, { ayanamsaModel: "lahiri", nodeType: "true" })
    .then(() => console.log("SUCCESS"))
    .catch(e => console.error("ERROR IN PROMISE:", e));
}

