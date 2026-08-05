import { PlanetName } from "./AstroTypes";

export interface Shloka {
  sanskrit: string;
  transliteration: string;
  meaning: string;
}

const SHLOKAS: Record<string, Shloka[]> = {
  [PlanetName.Sun]: [
    {
      sanskrit: "जपाकुसुम संकाशं काश्यपेयं महाद्युतिम् ।\nतमोऽरिं सर्वपापघ्नं प्रणतोऽस्मि दिवाकरम् ॥",
      transliteration: "Japaa Kusuma Sankaasham Kaashyapeyam Mahaa-Dyutim |\nTamorim Sarva-Paapaghnam Pranato-Smi Divaakaram ||",
      meaning: "I bow down to the Sun, the creator of the day, who is as red as the hibiscus flower, who is the descendant of sage Kashyapa, who removes darkness and destroys all sins."
    }
  ],
  [PlanetName.Moon]: [
    {
      sanskrit: "दधिशंखतुषाराभं क्षीरोदार्णव संभवम् ।\nनमामि शशिनं सोमं शंभोर्मुकुट भूषणम् ॥",
      transliteration: "Dadhi-Shankha-Tushaaraabham Ksheero-Daarnava Sambhavam |\nNamaami Shashinam Somam Shambhor-Mukuta Bhooshanam ||",
      meaning: "I bow to the Moon God, who has the hue of curd, conch, and snow, who rose from the Milky Ocean, and who adorns the crown of Lord Shiva."
    }
  ],
  [PlanetName.Mars]: [
    {
      sanskrit: "धरणीगर्भ संभूतं विद्युत्कान्ति समप्रभम् ।\nकुमारं शक्तिहस्तं तं मंगलं प्रणमाम्यहम् ॥",
      transliteration: "Dharanee-Garbha Sambhootam Vidyut-Kaanti Sama-Prabham |\nKumaaram Shakti-Hastam Tam Mangalam Pranamaamy-Aham ||",
      meaning: "I bow to Mars, the auspicious one, born of the earth, shining with the brilliance of lightning, the youthful wielder of the spear."
    }
  ],
  [PlanetName.Mercury]: [
    {
      sanskrit: "प्रियंगुकलिकाश्यामं रूपेणाप्रतिमं बुधम् ।\nसौम्यं सौम्यगुणोपेतं तं बुधं प्रणमाम्यहम् ॥",
      transliteration: "Priyangukalikaa-Shyaamam Roopenaa-Pratimam Budham |\nSaumyam Saumya-Gunopetam Tam Budham Pranamaamy-Aham ||",
      meaning: "I bow to Mercury, whose complexion is like the dark Priyangu flower, of unparalleled beauty, gentle and endowed with gentle qualities."
    }
  ],
  [PlanetName.Jupiter]: [
    {
      sanskrit: "देवानां च ऋषीणां च गुरुं कांचन सन्निभम् ।\nबुद्धिभूतं त्रिलोकेशं तं नमामि बृहस्पतिम् ॥",
      transliteration: "Devaanaam Cha Risheenaam Cha Gurum Kaanchan Sannibham |\nBuddhi-Bhootam Tri-Lokesham Tam Namaami Brihaspatim ||",
      meaning: "I bow to Jupiter, the preceptor of gods and sages, resplendent like gold, the embodiment of wisdom, and the lord of the three worlds."
    }
  ],
  [PlanetName.Venus]: [
    {
      sanskrit: "हिमकुन्द मृणालाभं दैत्यानां परमं गुरुम् ।\nसर्वशास्त्र प्रवक्तारं भार्गवं प्रणमाम्यहम् ॥",
      transliteration: "Hima-Kunda Mrinaalaabham Daityaanaam Paramam Gurum |\nSarva-Shaastra Pravaktaaram Bhaargavam Pranamaamy-Aham ||",
      meaning: "I bow to Venus, who shines like snow, jasmine, and lotus stems, the supreme preceptor of the demons, the expounder of all sciences."
    }
  ],
  [PlanetName.Saturn]: [
    {
      sanskrit: "नीलांजन समाभासं रविपुत्रं यमाग्रजम् ।\nछायामार्तंड संभूतं तं नमामि शनैश्चरम् ॥",
      transliteration: "Neelaanjana Samaabhaasam Ravi-Putram Yamaagrajam |\nChaayaa-Maartanda Sambhootam Tam Namaami Shanaishcharam ||",
      meaning: "I bow to Saturn, who possesses the brilliance of blue collyrium, the son of the Sun, the elder brother of Yama, born of Chhaya and Surya."
    }
  ],
  [PlanetName.Rahu]: [
    {
      sanskrit: "अर्धकायं महावीर्यं चन्द्रादित्य विमर्दनम् ।\nसिंहिकागर्भसंभूतं तं राहुं प्रणमाम्यहम् ॥",
      transliteration: "Ardha-Kaayam Mahaa-Veeryam Chandraaditya Vimardanam |\nSimhikaa-Garbha-Sambhootam Tam Raahum Pranamaamy-Aham ||",
      meaning: "I bow to Rahu, having half a body, endowed with great power, the subduer of the Sun and Moon, born of the womb of Simhika."
    }
  ],
  [PlanetName.Ketu]: [
    {
      sanskrit: "पलाशपुष्पसंकाशं तारकाग्रह मस्तकम् ।\nरौद्रं रौद्रत्मकं घोरं तं केतुं प्रणमाम्यहम् ॥",
      transliteration: "Palaasha-Pushpa-Sankaasham Taarakaa-Graha Mastakam |\nRaudram Raudratmakam Ghoram Tam Ketum Pranamaamy-Aham ||",
      meaning: "I bow to Ketu, who resembles the Palasha flower, who is the head of stars and planets, fierce, terrifying, and fearsome."
    }
  ]
};

const AASHIRVADAS = [
  {
    sanskrit: "स्वस्ति प्रजाभ्यः परिपालयन्ताम् । न्याय्येन मार्गेण महीं महीशाः ॥\nगोब्राह्मणेभ्यः शुभमस्तु नित्यं । लोकाः समस्ताः सुखिनो भवन्तु ॥",
    meaning: "May there be well-being for all people. May the rulers protect the earth following the path of righteousness. May cows and Brahmins always be prosperous. May all beings in all worlds be happy."
  },
  {
    sanskrit: "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ।\nसर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥",
    meaning: "May all be prosperous and happy. May all be free from illness. May all see what is spiritually uplifting. May no one suffer."
  },
  {
    sanskrit: "आयुर्बलं यशो वर्चः प्रजाः पशुवसूनि च ।\nब्रह्म प्रज्ञां च मेधां च त्वं नो धेहि वनस्पते ॥",
    meaning: "Oh Lord, bestow upon us long life, strength, fame, radiance, progeny, cattle, wealth, spiritual knowledge, wisdom, and intelligence."
  }
];

export function getRandomShlokaForGraha(graha: string): Shloka {
  const list = SHLOKAS[graha] || SHLOKAS[PlanetName.Jupiter]; // Default to Jupiter if unknown
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

export function getRandomAashirvada() {
  const randomIndex = Math.floor(Math.random() * AASHIRVADAS.length);
  return AASHIRVADAS[randomIndex];
}
