export interface AuthenticBaggonaMuhurtha {
  date: string; // DD-MM-YYYY
  masa: string;
  paksha: "Shukla" | "Krishna";
  tithi: number;
  vara: string;
  nakshatra: string;
  lagna: string;
  time: string;
  category: ("choula" | "upanayana" | "housewarming" | "marriage" | "devapratishtha")[];
}

export const BaggonaAuthenticData: AuthenticBaggonaMuhurtha[] = [
  // Choula Muhurthas
  { date: "27-03-2026", masa: "Chaitra", paksha: "Shukla", tithi: 9, vara: "Shukra", nakshatra: "Punarvasu", lagna: "Vrishabha", time: "10-10 AM", category: ["choula", "upanayana", "devapratishtha"] },
  { date: "12-04-2026", masa: "Chaitra", paksha: "Krishna", tithi: 10, vara: "Ravi", nakshatra: "Shravana", lagna: "Mithuna", time: "11-57 AM", category: ["choula"] },
  { date: "20-04-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 3, vara: "Chandra", nakshatra: "Rohini", lagna: "Mithuna", time: "11-26 AM", category: ["choula", "upanayana", "housewarming", "marriage", "devapratishtha"] },
  { date: "23-04-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 7, vara: "Guru", nakshatra: "Punarvasu", lagna: "Mithuna", time: "11-18 AM", category: ["choula", "upanayana", "devapratishtha"] },
  { date: "24-04-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 8, vara: "Shukra", nakshatra: "Pushya", lagna: "Mithuna", time: "11-14 AM", category: ["choula"] },
  { date: "29-04-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 12, vara: "Budha", nakshatra: "Hasta", lagna: "Mithuna", time: "10-52 AM", category: ["choula", "upanayana", "marriage", "devapratishtha"] },
  { date: "30-04-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 14, vara: "Guru", nakshatra: "Chitra", lagna: "Mithuna", time: "10-48 AM", category: ["choula", "housewarming", "marriage", "devapratishtha"] },
  { date: "10-05-2026", masa: "Vaishakha", paksha: "Krishna", tithi: 9, vara: "Ravi", nakshatra: "Dhanishta", lagna: "Mithuna", time: "10-07 AM", category: ["choula"] },
  { date: "14-05-2026", masa: "Vaishakha", paksha: "Krishna", tithi: 13, vara: "Guru", nakshatra: "Revati", lagna: "Mithuna", time: "09-53 AM", category: ["choula", "upanayana", "housewarming", "marriage"] },
  { date: "11-03-2027", masa: "Phalguna", paksha: "Shukla", tithi: 3, vara: "Guru", nakshatra: "Revati", lagna: "Vrishabha", time: "11-15 AM", category: ["choula", "upanayana", "marriage", "devapratishtha"] },
  { date: "24-03-2027", masa: "Phalguna", paksha: "Krishna", tithi: 2, vara: "Budha", nakshatra: "Chitra", lagna: "Vrishabha", time: "10-23 AM", category: ["choula", "upanayana", "housewarming", "marriage", "devapratishtha"] },
  { date: "25-03-2027", masa: "Phalguna", paksha: "Krishna", tithi: 3, vara: "Guru", nakshatra: "Swati", lagna: "Vrishabha", time: "10-19 AM", category: ["choula", "marriage", "devapratishtha"] },

  // Upanayana (Rigvedi + Yajurvedi grouped)
  { date: "29-03-2026", masa: "Chaitra", paksha: "Shukla", tithi: 11, vara: "Ravi", nakshatra: "Ashlesha", lagna: "Vrishabha", time: "10-03 AM", category: ["upanayana"] },
  { date: "12-04-2026", masa: "Chaitra", paksha: "Krishna", tithi: 10, vara: "Ravi", nakshatra: "Shravana", lagna: "Vrishabha", time: "09-07 AM", category: ["upanayana", "devapratishtha"] },
  { date: "13-04-2026", masa: "Chaitra", paksha: "Krishna", tithi: 11, vara: "Chandra", nakshatra: "Dhanishta", lagna: "Vrishabha", time: "08-59 AM", category: ["upanayana", "devapratishtha"] },
  { date: "13-04-2026", masa: "Chaitra", paksha: "Krishna", tithi: 11, vara: "Chandra", nakshatra: "Dhanishta", lagna: "Mithuna", time: "11-54 AM", category: ["upanayana", "devapratishtha"] },
  { date: "06-05-2026", masa: "Vaishakha", paksha: "Krishna", tithi: 4, vara: "Budha", nakshatra: "Mula", lagna: "Mithuna", time: "10-24 AM", category: ["upanayana", "devapratishtha"] },
  { date: "06-05-2026", masa: "Vaishakha", paksha: "Krishna", tithi: 4, vara: "Budha", nakshatra: "Mula", lagna: "Karka", time: "11-19 AM", category: ["upanayana", "marriage", "devapratishtha"] },
  { date: "11-05-2026", masa: "Vaishakha", paksha: "Krishna", tithi: 9, vara: "Chandra", nakshatra: "Shatabhisha", lagna: "Mithuna", time: "10-05 AM", category: ["upanayana", "devapratishtha"] },
  { date: "13-05-2026", masa: "Vaishakha", paksha: "Krishna", tithi: 11, vara: "Budha", nakshatra: "Uttara Bhadrapada", lagna: "Mithuna", time: "09-57 AM", category: ["upanayana", "housewarming", "marriage", "devapratishtha"] },
  { date: "25-02-2027", masa: "Magha", paksha: "Krishna", tithi: 5, vara: "Guru", nakshatra: "Swati", lagna: "Vrishabha", time: "12-10 PM", category: ["upanayana", "marriage", "devapratishtha"] },
  { date: "19-03-2027", masa: "Phalguna", paksha: "Shukla", tithi: 12, vara: "Shukra", nakshatra: "Ashlesha", lagna: "Vrishabha", time: "10-44 AM", category: ["upanayana"] },
  { date: "25-03-2026", masa: "Chaitra", paksha: "Shukla", tithi: 7, vara: "Budha", nakshatra: "Mrigashira", lagna: "Vrishabha", time: "10-18 AM", category: ["upanayana", "housewarming", "devapratishtha"] },
  { date: "06-04-2026", masa: "Chaitra", paksha: "Krishna", tithi: 4, vara: "Chandra", nakshatra: "Anuradha", lagna: "Vrishabha", time: "09-37 AM", category: ["upanayana", "housewarming", "devapratishtha"] },
  { date: "06-04-2026", masa: "Chaitra", paksha: "Krishna", tithi: 4, vara: "Chandra", nakshatra: "Anuradha", lagna: "Mithuna", time: "12-22 PM", category: ["upanayana", "housewarming", "devapratishtha"] },
  
  { date: "20-04-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 3, vara: "Chandra", nakshatra: "Rohini", lagna: "Karka", time: "12-23 PM", category: ["upanayana", "marriage", "devapratishtha"] },
  { date: "23-04-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 7, vara: "Guru", nakshatra: "Punarvasu", lagna: "Karka", time: "12-15 PM", category: ["upanayana", "devapratishtha"] },
  { date: "29-04-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 12, vara: "Budha", nakshatra: "Hasta", lagna: "Karka", time: "11-48 AM", category: ["upanayana", "marriage", "devapratishtha"] },
  { date: "03-05-2026", masa: "Vaishakha", paksha: "Krishna", tithi: 2, vara: "Ravi", nakshatra: "Anuradha", lagna: "Mithuna", time: "10-36 AM", category: ["upanayana", "marriage", "devapratishtha"] },
  { date: "03-05-2026", masa: "Vaishakha", paksha: "Krishna", tithi: 2, vara: "Ravi", nakshatra: "Anuradha", lagna: "Karka", time: "11-12 AM", category: ["upanayana", "marriage", "devapratishtha"] },
  { date: "14-05-2026", masa: "Vaishakha", paksha: "Krishna", tithi: 13, vara: "Guru", nakshatra: "Revati", lagna: "Karka", time: "10-48 AM", category: ["upanayana", "marriage"] },
  { date: "14-03-2027", masa: "Phalguna", paksha: "Shukla", tithi: 6, vara: "Ravi", nakshatra: "Rohini", lagna: "Vrishabha", time: "11-03 AM", category: ["upanayana", "marriage"] },

  // Navagraha / Housewarming Specifics
  { date: "25-11-2026", masa: "Kartika", paksha: "Krishna", tithi: 1, vara: "Budha", nakshatra: "Rohini", lagna: "Dhanu", time: "09-39 AM", category: ["housewarming", "marriage"] },
  { date: "25-11-2026", masa: "Kartika", paksha: "Krishna", tithi: 1, vara: "Budha", nakshatra: "Mrigashira", lagna: "Mithuna", time: "09-07 PM", category: ["housewarming", "marriage"] }, // Ratri
  { date: "26-11-2026", masa: "Kartika", paksha: "Krishna", tithi: 2, vara: "Guru", nakshatra: "Mrigashira", lagna: "Dhanu", time: "09-35 AM", category: ["housewarming", "marriage"] },
  { date: "02-12-2026", masa: "Kartika", paksha: "Krishna", tithi: 9, vara: "Budha", nakshatra: "Uttara", lagna: "Dhanu", time: "09-12 AM", category: ["housewarming", "marriage"] },
  { date: "02-12-2026", masa: "Kartika", paksha: "Krishna", tithi: 9, vara: "Budha", nakshatra: "Uttara", lagna: "Mithuna", time: "08-40 PM", category: ["housewarming", "marriage"] },
  { date: "03-12-2026", masa: "Kartika", paksha: "Krishna", tithi: 10, vara: "Guru", nakshatra: "Uttara", lagna: "Dhanu", time: "09-08 AM", category: ["housewarming", "marriage"] },
  { date: "04-12-2026", masa: "Kartika", paksha: "Krishna", tithi: 11, vara: "Shukra", nakshatra: "Chitra", lagna: "Mithuna", time: "08-32 PM", category: ["housewarming", "marriage"] },

  // Vivaha Specifics
  { date: "26-04-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 10, vara: "Ravi", nakshatra: "Magha", lagna: "Mithuna", time: "11-03 AM", category: ["marriage"] },
  { date: "26-04-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 10, vara: "Ravi", nakshatra: "Magha", lagna: "Karka", time: "12-01 PM", category: ["marriage"] },
  { date: "30-04-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 14, vara: "Guru", nakshatra: "Chitra", lagna: "Karka", time: "11-44 AM", category: ["marriage", "devapratishtha"] },
  { date: "30-04-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 14, vara: "Guru", nakshatra: "Chitra", lagna: "Abhijit", time: "12-29 PM", category: ["marriage"] },
  { date: "01-05-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 15, vara: "Shukra", nakshatra: "Swati", lagna: "Mithuna", time: "10-44 AM", category: ["marriage", "devapratishtha"] },
  { date: "01-05-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 15, vara: "Shukra", nakshatra: "Swati", lagna: "Karka", time: "11-40 AM", category: ["marriage", "devapratishtha"] },
  { date: "01-05-2026", masa: "Vaishakha", paksha: "Shukla", tithi: 15, vara: "Shukra", nakshatra: "Swati", lagna: "Abhijit", time: "12-29 PM", category: ["marriage"] },
  { date: "14-05-2026", masa: "Vaishakha", paksha: "Krishna", tithi: 13, vara: "Guru", nakshatra: "Revati", lagna: "Abhijit", time: "12-28 PM", category: ["marriage"] },
  { date: "30-11-2026", masa: "Kartika", paksha: "Krishna", tithi: 6, vara: "Chandra", nakshatra: "Magha", lagna: "Mithuna", time: "08-48 PM", category: ["marriage"] },
  { date: "03-12-2026", masa: "Kartika", paksha: "Krishna", tithi: 10, vara: "Guru", nakshatra: "Hasta", lagna: "Mithuna", time: "08-36 PM", category: ["marriage"] },
  { date: "04-12-2026", masa: "Kartika", paksha: "Krishna", tithi: 11, vara: "Shukra", nakshatra: "Hasta", lagna: "Dhanu", time: "09-04 AM", category: ["marriage"] },
  { date: "06-12-2026", masa: "Kartika", paksha: "Krishna", tithi: 13, vara: "Ravi", nakshatra: "Swati", lagna: "Dhanu", time: "08-56 AM", category: ["marriage"] },
  { date: "10-12-2026", masa: "Margashira", paksha: "Shukla", tithi: 1, vara: "Guru", nakshatra: "Mula", lagna: "Mithuna", time: "08-08 PM", category: ["marriage"] },
  { date: "14-12-2026", masa: "Margashira", paksha: "Shukla", tithi: 5, vara: "Chandra", nakshatra: "Dhanishta", lagna: "Dhanu", time: "08-24 AM", category: ["marriage"] },
  { date: "17-12-2026", masa: "Margashira", paksha: "Shukla", tithi: 8, vara: "Guru", nakshatra: "Uttara Bhadrapada", lagna: "Karka", time: "08-37 PM", category: ["marriage"] },
  { date: "18-12-2026", masa: "Margashira", paksha: "Shukla", tithi: 9, vara: "Shukra", nakshatra: "Revati", lagna: "Karka", time: "08-33 PM", category: ["marriage"] },
  { date: "19-12-2026", masa: "Margashira", paksha: "Shukla", tithi: 10, vara: "Shani", nakshatra: "Ashwini", lagna: "Karka", time: "08-29 PM", category: ["marriage"] },
  { date: "23-12-2026", masa: "Margashira", paksha: "Shukla", tithi: 14, vara: "Budha", nakshatra: "Mrigashira", lagna: "Karka", time: "08-13 PM", category: ["marriage"] },
  { date: "30-12-2026", masa: "Margashira", paksha: "Krishna", tithi: 6, vara: "Budha", nakshatra: "Hasta", lagna: "Karka", time: "07-46 PM", category: ["marriage"] },
  { date: "31-12-2026", masa: "Margashira", paksha: "Krishna", tithi: 7, vara: "Guru", nakshatra: "Chitra", lagna: "Karka", time: "07-42 PM", category: ["marriage"] },
  { date: "01-01-2027", masa: "Margashira", paksha: "Krishna", tithi: 8, vara: "Shukra", nakshatra: "Swati", lagna: "Karka", time: "07-38 PM", category: ["marriage"] },
  { date: "25-02-2027", masa: "Magha", paksha: "Krishna", tithi: 5, vara: "Guru", nakshatra: "Swati", lagna: "Abhijit", time: "12-44 PM", category: ["marriage"] },
  { date: "28-02-2027", masa: "Magha", paksha: "Krishna", tithi: 8, vara: "Ravi", nakshatra: "Anuradha", lagna: "Abhijit", time: "12-46 PM", category: ["marriage"] },
  { date: "11-03-2027", masa: "Phalguna", paksha: "Shukla", tithi: 3, vara: "Guru", nakshatra: "Ashwini", lagna: "Abhijit", time: "12-42 PM", category: ["marriage"] },
  { date: "14-03-2027", masa: "Phalguna", paksha: "Shukla", tithi: 6, vara: "Ravi", nakshatra: "Rohini", lagna: "Abhijit", time: "12-41 PM", category: ["marriage"] },
  { date: "25-03-2027", masa: "Phalguna", paksha: "Krishna", tithi: 3, vara: "Guru", nakshatra: "Swati", lagna: "Abhijit", time: "12-38 PM", category: ["marriage"] },
  { date: "29-03-2027", masa: "Phalguna", paksha: "Krishna", tithi: 6, vara: "Chandra", nakshatra: "Mula", lagna: "Abhijit", time: "12-37 PM", category: ["marriage"] },

  // Upanayana 2027-2028 Next Year entries
  { date: "11-04-2027", masa: "Chaitra", paksha: "Shukla", tithi: 5, vara: "Ravi", nakshatra: "Rohini", lagna: "Vrishabha", time: "09-12 AM", category: ["upanayana"] },
  { date: "11-04-2027", masa: "Chaitra", paksha: "Shukla", tithi: 5, vara: "Ravi", nakshatra: "Rohini", lagna: "Mithuna", time: "12-03 PM", category: ["upanayana"] },
  { date: "15-04-2027", masa: "Chaitra", paksha: "Shukla", tithi: 9, vara: "Guru", nakshatra: "Ashlesha", lagna: "Vrishabha", time: "11-48 AM", category: ["upanayana"] },
  { date: "12-04-2027", masa: "Chaitra", paksha: "Shukla", tithi: 6, vara: "Chandra", nakshatra: "Mrigashira", lagna: "Vrishabha", time: "09-08 AM", category: ["upanayana"] },
  { date: "23-04-2027", masa: "Chaitra", paksha: "Krishna", tithi: 2, vara: "Shukra", nakshatra: "Anuradha", lagna: "Karka", time: "12-13 PM", category: ["upanayana", "marriage"] },
  { date: "28-04-2027", masa: "Chaitra", paksha: "Krishna", tithi: 7, vara: "Budha", nakshatra: "Uttara Ashadha", lagna: "Vrishabha", time: "08-06 AM", category: ["upanayana", "marriage"] },
  { date: "29-04-2027", masa: "Chaitra", paksha: "Krishna", tithi: 8, vara: "Guru", nakshatra: "Shravana", lagna: "Vrishabha", time: "08-02 AM", category: ["marriage"] },
  { date: "29-04-2027", masa: "Chaitra", paksha: "Krishna", tithi: 8, vara: "Guru", nakshatra: "Shravana", lagna: "Abhijit", time: "12-29 PM", category: ["marriage"] },
  { date: "30-04-2027", masa: "Chaitra", paksha: "Krishna", tithi: 9, vara: "Shukra", nakshatra: "Dhanishta", lagna: "Mithuna", time: "10-48 AM", category: ["upanayana", "marriage"] },
  { date: "30-04-2027", masa: "Chaitra", paksha: "Krishna", tithi: 9, vara: "Shukra", nakshatra: "Dhanishta", lagna: "Abhijit", time: "12-29 PM", category: ["marriage"] },
  { date: "02-05-2027", masa: "Chaitra", paksha: "Krishna", tithi: 11, vara: "Ravi", nakshatra: "Purva Bhadrapada", lagna: "Mithuna", time: "10-40 AM", category: ["upanayana"] },
  { date: "03-05-2027", masa: "Chaitra", paksha: "Krishna", tithi: 12, vara: "Chandra", nakshatra: "Uttara Bhadrapada", lagna: "Mithuna", time: "10-36 AM", category: ["upanayana", "marriage"] },
  { date: "03-05-2027", masa: "Chaitra", paksha: "Krishna", tithi: 12, vara: "Chandra", nakshatra: "Uttara Bhadrapada", lagna: "Karka", time: "11-32 AM", category: ["upanayana", "marriage"] },
  { date: "03-05-2027", masa: "Chaitra", paksha: "Krishna", tithi: 12, vara: "Chandra", nakshatra: "Uttara Bhadrapada", lagna: "Abhijit", time: "12-29 PM", category: ["marriage"] },
  { date: "09-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 2, vara: "Ravi", nakshatra: "Mrigashira", lagna: "Mithuna", time: "10-12 AM", category: ["upanayana"] },
  { date: "09-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 2, vara: "Ravi", nakshatra: "Mrigashira", lagna: "Karka", time: "11-10 AM", category: ["upanayana", "marriage"] },
  { date: "09-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 2, vara: "Ravi", nakshatra: "Mrigashira", lagna: "Abhijit", time: "12-29 PM", category: ["marriage"] },
  { date: "10-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 4, vara: "Chandra", nakshatra: "Ardra", lagna: "Mithuna", time: "10-08 AM", category: ["upanayana"] },
  { date: "10-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 4, vara: "Chandra", nakshatra: "Ardra", lagna: "Karka", time: "11-06 AM", category: ["upanayana"] },
  { date: "12-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 5, vara: "Budha", nakshatra: "Pushya", lagna: "Mithuna", time: "10-01 AM", category: ["upanayana"] },
  { date: "12-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 5, vara: "Budha", nakshatra: "Pushya", lagna: "Karka", time: "11-02 AM", category: ["upanayana"] },
  { date: "14-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 8, vara: "Shukra", nakshatra: "Magha", lagna: "Mithuna", time: "09-54 AM", category: ["marriage"] },
  { date: "14-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 8, vara: "Shukra", nakshatra: "Magha", lagna: "Karka", time: "10-50 AM", category: ["marriage"] },
  { date: "14-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 8, vara: "Shukra", nakshatra: "Magha", lagna: "Abhijit", time: "12-28 PM", category: ["marriage"] },
  { date: "16-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 10, vara: "Ravi", nakshatra: "Uttara", lagna: "Mithuna", time: "09-46 AM", category: ["upanayana", "marriage"] },
  { date: "16-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 10, vara: "Ravi", nakshatra: "Uttara", lagna: "Karka", time: "10-43 AM", category: ["upanayana", "marriage"] },
  { date: "16-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 10, vara: "Ravi", nakshatra: "Uttara", lagna: "Abhijit", time: "12-29 PM", category: ["marriage"] },
  { date: "17-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 11, vara: "Chandra", nakshatra: "Hasta", lagna: "Mithuna", time: "09-41 AM", category: ["upanayana", "marriage"] },
  { date: "17-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 11, vara: "Chandra", nakshatra: "Hasta", lagna: "Karka", time: "10-38 AM", category: ["upanayana", "marriage"] },
  { date: "19-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 13, vara: "Budha", nakshatra: "Swati", lagna: "Mithuna", time: "09-33 AM", category: ["marriage"] },
  { date: "19-05-2027", masa: "Vaishakha", paksha: "Shukla", tithi: 13, vara: "Budha", nakshatra: "Swati", lagna: "Karka", time: "10-30 AM", category: ["marriage"] },
  { date: "21-05-2027", masa: "Vaishakha", paksha: "Krishna", tithi: 1, vara: "Shukra", nakshatra: "Anuradha", lagna: "Mithuna", time: "09-26 AM", category: ["marriage"] },
  { date: "21-05-2027", masa: "Vaishakha", paksha: "Krishna", tithi: 1, vara: "Shukra", nakshatra: "Anuradha", lagna: "Karka", time: "10-22 AM", category: ["marriage"] },
  { date: "23-05-2027", masa: "Vaishakha", paksha: "Krishna", tithi: 3, vara: "Ravi", nakshatra: "Mula", lagna: "Karka", time: "10-14 AM", category: ["marriage"] },
  { date: "30-05-2027", masa: "Vaishakha", paksha: "Krishna", tithi: 9, vara: "Ravi", nakshatra: "Purva Bhadrapada", lagna: "Karka", time: "09-47 AM", category: ["upanayana"] },
  
  // Extra Vivaha from next year start
  { date: "16-04-2027", masa: "Chaitra", paksha: "Shukla", tithi: 10, vara: "Shukra", nakshatra: "Magha", lagna: "Mithuna", time: "11-44 AM", category: ["marriage"] },
  { date: "19-04-2027", masa: "Chaitra", paksha: "Shukla", tithi: 13, vara: "Chandra", nakshatra: "Hasta", lagna: "Mithuna", time: "11-31 AM", category: ["marriage"] }
];
