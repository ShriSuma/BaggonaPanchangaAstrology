const tryParseDate = (text) => {
    let dateObj = null;
    let timeStr = "";

    // Normalize text
    text = text.toLowerCase();

    // Months mapping (English + phonetic/Kannada hints)
    const enMonths = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const knMonths = ["ಜನ್", "ಫೆಬ್", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
    const longEn = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

    // 1. Try to find Year (19xx or 20xx)
    const yearMatch = text.match(/\b(19|20)\d{2}\b/);
    
    // 2. Try to find Day (1-31)
    // Note: in Kannada, words might be stuck to numbers, so \b might fail if we aren't careful, 
    // but typically day is isolated or followed by st/nd/rd/th
    const dayMatch = text.match(/\b(1st|2nd|3rd|\d{1,2}(th)?)\b/);

    // 3. Try to find Month
    let realMonth = -1;
    for (let i = 0; i < 12; i++) {
      if (
        text.includes(enMonths[i]) || 
        text.includes(knMonths[i]) || 
        text.includes(longEn[i])
      ) {
        // Double check it's not matching part of a word unexpectedly
        // For 'may' or 'ಮೇ', it's usually safe, but we'll accept it
        realMonth = i;
        break;
      }
    }

    if (yearMatch && dayMatch && realMonth !== -1) {
      const year = parseInt(yearMatch[0], 10);
      const dayNum = parseInt(dayMatch[0].replace(/\D/g, ''), 10);
      // Create noon UTC date to avoid timezone shift issues initially
      dateObj = new Date(year, realMonth, dayNum, 12, 0, 0, 0);
    }

    // 4. Try to find Time (HH:MM or HH AM/PM or HH MM am/pm)
    // Look for markers first
    let hr = 0; let mn = 0;
    let foundTime = false;
    let marker = "";

    // Pattern 1: marker first (ಬೆಳಿಗ್ಗೆ 9 25)
    const pat1 = /(ಬೆಳಿಗ್ಗೆ|ಮಧ್ಯಾಹ್ನ|ಸಂಜೆ|ರಾತ್ರಿ|am|pm)\s*(\d{1,2})(?:\s*:?\s*|\s+)(\d{2})?/i;
    // Pattern 2: time first (9 25 am)
    const pat2 = /\b(\d{1,2})(?:\s*:?\s*|\s+)(\d{2})?\s*(ಬೆಳಿಗ್ಗೆ|ಮಧ್ಯಾಹ್ನ|ಸಂಜೆ|ರಾತ್ರಿ|am|pm)/i;
    // Pattern 3: colon format (14:30)
    const pat3 = /\b(\d{1,2}):(\d{2})\b/i;

    let match = text.match(pat1);
    if (match) {
      marker = match[1];
      hr = parseInt(match[2], 10);
      mn = match[3] ? parseInt(match[3], 10) : 0;
      foundTime = true;
    } else {
      match = text.match(pat2);
      if (match) {
        hr = parseInt(match[1], 10);
        mn = match[2] ? parseInt(match[2], 10) : 0;
        marker = match[3];
        foundTime = true;
      } else {
        match = text.match(pat3);
        if (match) {
          hr = parseInt(match[1], 10);
          mn = parseInt(match[2], 10);
          foundTime = true;
        }
      }
    }

    if (foundTime) {
      const isPM = marker === "pm" || marker === "ಮಧ್ಯಾಹ್ನ" || marker === "ಸಂಜೆ" || marker === "ರಾತ್ರಿ";
      const isAM = marker === "am" || marker === "ಬೆಳಿಗ್ಗೆ";
      
      if (isPM && hr < 12) hr += 12;
      if (isAM && hr === 12) hr = 0;
      
      timeStr = `${hr.toString().padStart(2, '0')}:${mn.toString().padStart(2, '0')}`;
    }

    return { date: dateObj, time: timeStr };
  };

const text = "ಹೆಸರು ಪ್ರಮೋದ ಗೋತ್ರ ವಸಿಷ್ಠ ದಿನಾಂಕ 31 ಮೇ 1993 ಬೆಳಿಗ್ಗೆ 9 25ಕ್ಕೆ ಜನನ";
console.log(tryParseDate(text));
