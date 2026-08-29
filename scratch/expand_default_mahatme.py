file_path_templates = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/components/seva/pdf/SevaPrintTemplates.tsx"

with open(file_path_templates, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the defaultMahatme generator with an exhaustive and authentic 5-language mapper for all Sevas
old_default_mahatme = """  // Fallback Mahatme generator for offline/error handling across all 5 languages
  const defaultMahatme = (() => {
    const isGanapati = sevaTitle.toLowerCase().includes("ganapati") || sevaTitle.includes("ಗಣಪತಿ") || sevaTitle.includes("गणपति") || sevaTitle.includes("గణపతి") || sevaTitle.includes("கணபதி");
    const isRudra = sevaTitle.toLowerCase().includes("rudra") || sevaTitle.includes("ರುದ್ರ") || sevaTitle.includes("रुद्र") || sevaTitle.includes("రుద్ర") || sevaTitle.includes("ருத்ர");
    const isMrityunjaya = sevaTitle.toLowerCase().includes("mrityunjaya") || sevaTitle.includes("ಮೃತ್ಯುಂಜಯ") || sevaTitle.includes("मृत्युंजय") || sevaTitle.includes("మృత్యుంజయ") || sevaTitle.includes("மிருத்யுஞ்ஜய");

    if (isGanapati) {
      return {
        whatIsPooja: pick({
          kn: "ಗಣಪತಿ ಹೋಮವು ಸಕಲ ವಿಘ್ನನಿವಾರಕನಾದ ಶ್ರೀ ಮಹಾಗಣಪತಿಯನ್ನು ಪ್ರಸನ್ನಗೊಳಿಸುವ ಶ್ರೇಷ್ಠ ವೈದಿಕ ಯಜ್ಞವಾಗಿದೆ. ಈ ಪವಿತ್ರ ಯಜ್ಞದಲ್ಲಿ ಮಂತ್ರಪೂರ್ವಕವಾಗಿ ಗರಿಕೆ, ತುಪ್ಪ, ಕೊಬ್ಬರಿ ಹಾಗೂ ಮೋದಕಗಳನ್ನು ಅರ್ಪಿಸಿ ಪೂಜಿಸಲಾಗುತ್ತದೆ.",
          hi: "गणपति होम समस्त विघ्नविनाशक श्री महागणपति को प्रसन्न करने वाला श्रेष्ठ वैदिक यज्ञ है। इसमें मंत्रोच्चार के साथ पावन आहुतियों द्वारा भगवान गणेश का पूजन किया जाता है।",
          te: "గణపతి హోమం సమస్త విఘ్నవినాశకుడైన శ్రీ మహాగణపతిని ప్రసన్నం చేసుకునే ఉత్తమ వైదిక యజ్ఞం. పవిత్ర ద్రవ్యాలను సమర్పించి పూజిస్తారు.",
          ta: "கணபதி ஹோமம் சகல விக்னங்களை போக்கும் ஸ்ரீ மகா கணபதியை திருப்திப்படுத்தும் வைதீக யாகமாகும்.",
          en: "Ganapati Homa is a sacred Vedic fire ritual performed to invoke Lord Ganesha, the remover of all obstacles."
        }, lang),
        whyDoPooja: pick({
          kn: "ಹೊಸ ಕೆಲಸಗಳ ಆರಂಭ, ಗೃಹಪ್ರವೇಶ, ವ್ಯಾಪಾರ-ಉದ್ಯೋಗದಲ್ಲಿ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಜಾತಕದಲ್ಲಿರುವ ಕೇತು ದೋಷ ಮತ್ತು ಅಡಚಣೆಗಳನ್ನು ನಿವಾರಿಸಲು ಈ ಹೋಮವನ್ನು ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "नवीन कार्यों के शुभारंभ, व्यापार में वृद्धि तथा कुण्डली में स्थित केतु दोष निवारण हेतु यह होम किया जाता है।",
          te: "నూతన కార్యారంభం, వ్యాపారాభివృద్ధి మరియు జాతకంలోని కేతు దోషాల నివారణకు ఈ హోమం చేయబడుతుంది.",
          ta: "புதிய தொடக்கம், வியாபார வளர்ச்சி மற்றும் கிரக தோஷ நிவர்த்திக்காக இந்த ஹோமம் செய்யப்படுகிறது.",
          en: "This Homa is performed before starting new ventures, expanding business, or removing Ketu afflictions and hurdles."
        }, lang),
        benefitsPooja: pick({
          kn: "ಈ ಪೂಜೆಯ ಪ್ರಭಾವದಿಂದ ಮನಸ್ಸಿನಲ್ಲಿ ಉತ್ಸಾಹ ಮೂಡಿ, ಸಕಲ ಕೆಲಸಗಳಲ್ಲಿ ಜಯ, ಧನ ಸಂಪತ್ತಿನ ವೃದ್ಧಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸುಖ-ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.",
          hi: "इस पूजन के प्रभाव से सकारात्मक ऊर्जा का संचार होता है, कार्यों में सफलता, धन-समृद्धि एवं पारिवारिक सुख-शांति मिलती है।",
          te: "ఈ పూజ వల్ల మనస్సులో ధనాత్మక శక్తి కలిగి, సమస్త కార్యాలలో విజయం మరియు కుటుంబ సౌఖ్యం కలుగుతుంది.",
          ta: "இந்த பூஜையால் மனதில் நேர்மறை ஆற்றல் பெருகி, சகல காரிய வெற்றி மற்றும் குடும்ப சௌக்கியம் கிடைக்கும்.",
          en: "Performing this Homa bestows sharp intellect, guarantees success in endeavors, and fills the home with harmony."
        }, lang)
      };
    }

    if (isRudra || isMrityunjaya) {
      return {
        whatIsPooja: pick({
          kn: "ರುದ್ರ ಅಭಿಷೇಕ ಹಾಗೂ ಮೃತ್ಯುಂಜಯ ಹೋಮವು ಸನಾತನ ಧರ್ಮದ ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ ಶಿವ ಆರಾಧನೆಯಾಗಿದೆ. ಮಹಾದೇವನ ಆತ್ಮಲಿಂಗ ಸ್ವರೂಪಕ್ಕೆ ಪಂಚಾಮೃತ ಅಭಿಷೇಕ ನೆರವೇರಿಸಿ, ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರದಿಂದ ಹೋಮ ಮಾಡಲಾಗುತ್ತದೆ.",
          hi: "रुद्र अभिषेक एवं महामृत्युंजय होम अत्यंत शक्तिशाली शिव आराधना है। भगवान शिव के आत्मलिंग स्वरूप पर पंचामृत अभिषेक कर महामृत्युंजय मन्त्र से होम किया जाता है।",
          te: "రుద్ర అభిషేకం మరియు మృత్యుంజయ హోమం అత్యంత శక్తివంతమైన శివ ఆరాధన. స్వామివారికి పంచామృతాలతో అభిషేకం మరియు మంత్ర హోమం నిర్వహిస్తారు.",
          ta: "ருத்ர அபிஷேகம் மற்றும் ருத்ர ஹோமம் மிகவும் சக்திவாய்ந்த சிவ ஆராதனையாகும். சிவலிங்கத்திற்கு பஞ்சாமிர்த அபிஷேகம் செய்யப்படுகிறது.",
          en: "Rudra Abhisheka & Maha Mrityunjaya Homa is a supreme Shiva ritual consecrated with Panchamrita and Vedic mantras."
        }, lang),
        whyDoPooja: pick({
          kn: "ದೀರ್ಘಕಾಲದ ಅನಾರೋಗ್ಯ, ಶನಿ-ರಾಹು ದೋಷಗಳ ತೀವ್ರತೆ ಹಾಗೂ ಮಾನಸಿಕ ಚಿಂತೆಗಳನ್ನು ನಿವಾರಿಸಿ ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಶಾಂತಿ ಪಡೆಯಲು ಈ ಸೇವೆಯನ್ನು ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "दीर्घकालिक व्याधियों, शनि-राहु दोषों तथा मानसिक संताप के निवारण एवं दीर्घायु तथा आंतरिक शांति हेतु यह सेवा की जाती है।",
          te: "దీర్ఘకాలిక అనారోగ్యం, శని-రాహు దోషాల నివారణ మరియు దీర్ఘాయువు, మానసిక ప్రశాంతత కోసం ఈ సేవ చేయబడుతుంది.",
          ta: "தீராத நோய்கள், சனி-ராகு தோஷ நிவர்த்தி மற்றும் நீண்ட ஆயுள் பெற இந்த பூஜை செய்யப்படுகிறது.",
          en: "This Seva is performed to overcome chronic illness, eliminate Rahu/Saturn afflictions, and grant longevity."
        }, lang),
        benefitsPooja: pick({
          kn: "ಈ ಸೇವೆಯಿಂದ ಸಕಲ ರೋಗ-ಬಾಧೆಗಳು ಶಮನವಾಗಿ, ದೈಹಿಕ ಕಾಂತಿ, ರಕ್ಷಣಾ ಕವಚ, ನಿರಂತರ ಆಯುರಾರೋಗ್ಯ ಹಾಗೂ ಸಕಲ ಪಾಪನಾಶದ ಫಲ ಲಭಿಸುತ್ತದೆ.",
          hi: "इस सेवा से समस्त रोगों का शमन होता है, शारीरिक कांति, सुरक्षा कवच, उत्तम स्वास्थ्य एवं पापों से मुक्ति मिलती है।",
          te: "ఈ సేవ వల్ల రోగాలు నివారణై, శారీరక ఆరోగ్యం, రక్షణ కవచం మరియు సకల పాపక్షయం కలుగుతుంది.",
          ta: "இந்த சேவையால் நோய்கள் நீங்கி, உடல் ஆரோக்கியம், தெய்வீக பாதுகாப்பு கவசம் கிடைக்கும்.",
          en: "Grants health protection shield, dissolves karmic debts, and fills the devotee with divine peace."
        }, lang)
      };
    }

    return {
      whatIsPooja: pick({
        kn: "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೆರವೇರಿಸಲಾದ ಈ ಪವಿತ್ರ ಸೇವೆಯು ಜನ್ಮ ನಕ್ಷತ್ರ ಹಾಗೂ ರಾಶಿ ಗ್ರಹಗಳ ಪ್ರಸನ್ನತೆಗೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವಾದ ದೈವಿಕ ಆರಾಧನೆಯಾಗಿದೆ.",
        hi: "गोकर्ण श्री महाबलेश्वर क्षेत्र में संपन्न यह पवित्र सेवा जन्म नक्षत्र एवं राशि ग्रहों की प्रसन्नता हेतु प्रभावकारी वैदिक आराधना है।",
        te: "గోకర్ణ శ్రీ మహాబలేశ్వర క్షేత్రంలో నిర్వహించిన ఈ పవిత్ర సేవ జన్మ నక్షత్రం మరియు రాశి గ్రహాల ప్రసన్నతకు శ్రేష్ఠమైన ఆరాధన.",
        ta: "கோகர்ண ஸ்ரீ மகாபலேஸ்வர க்ஷேத்திரத்தில் செய்யப்பட்ட இந்த பூஜை ஜன்ம நட்சத்திர மற்றும் ராசி கிரகங்களின் திருப்திக்காக செய்யப்பட்டது.",
        en: "Performed at holy Gokarna Mahabaleshwara Kshetra, this sacred Seva is an auspicious consecration tailored to your birth chart."
      }, lang),
      whyDoPooja: pick({
        kn: "ಜಾತಕದಲ್ಲಿರುವ ನವಗ್ರಹ ದೋಷಗಳ ಶಮನ, ಕೌಟುಂಬಿಕ ಅಭ್ಯುದಯ, ವ್ಯಾಪಾರ-ಉದ್ಯೋಗದಲ್ಲಿ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಮಾನಸಿಕ ನೆಮ್ಮದಿಗಾಗಿ ಈ ಸೇವೆಯನ್ನು ಸಲ್ಲಿಸಲಾಗುತ್ತದೆ.",
        hi: "कुण्डली में स्थित नवग्रह दोषों के शमन, पारिवारिक उन्नति, व्यापार में वृद्धि तथा मानसिक शांति हेतु यह सेवा अर्पित की जाती है।",
        te: "జాతకంలోని నవగ్రహ దోషాల నివారణ, కుటుంబ అభ్యుదయం, ఉద్యోగ వ్యాపారాలలో ప్రగతి కోసం ఈ సేవ సమర్పించబడుతుంది.",
        ta: "ஜாதக கிரக தோஷ நிவர்த்தி, குடும்ப வளர்ச்சி, தொழில் முன்னேற்றம் மற்றும் மன அமைதிக்காக இந்த சேவை செய்யப்படுகிறது.",
        en: "Designed to neutralize planetary imbalances, enhance career growth, foster domestic peace, and clear obstacles."
      }, lang),
      benefitsPooja: pick({
        kn: "ಈ ಸೇವೆಯ ಫಲವಾಗಿ ನಿರಂತರ ಕೌಟುಂಬಿಕ ಭಾಗ್ಯೋದಯ, ಧನ-ಧಾನ್ಯ ಸಮೃದ್ಧಿ, ಸಮಾಜದಲ್ಲಿ ಗೌರವ ಹಾಗೂ ಮನಃಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.",
        hi: "इस सेवा के फलस्वरुप निरंतर पारिवारिक भाग्योदय, धन-धान्य समृद्धि, समाज में सम्मान एवं शांति प्राप्त होती है।",
        te: "ఈ సేవ వల్ల నిరంతర కుటుంబ భాగ్యోదయం, ధన ధాన్య సమృద్ధి మరియు సమాజంలో గౌరవ ప్రతిష్ఠలు కలుగుతాయి.",
        ta: "இந்த சேவையின் பலனாக குடும்ப பாக்கியம், தன தானிய பெருக்கம், சமூக மதிப்பு மற்றும் சாந்தி கிடைக்கும்.",
        en: "Bestows enduring family prosperity, continuous financial stability, elevated social respect, and divine grace."
      }, lang)
    };
  })();"""

new_default_mahatme = """  // Fallback Mahatme generator for offline/error handling across all 5 languages
  const defaultMahatme = (() => {
    const sLower = sevaTitle.toLowerCase();
    const isGanapati = sLower.includes("ganapati") || sevaTitle.includes("ಗಣಪತಿ") || sevaTitle.includes("गणपति") || sevaTitle.includes("గణపతి") || sevaTitle.includes("கணபதி");
    const isChandi = sLower.includes("chandi") || sevaTitle.includes("ಚಂಡಿ") || sevaTitle.includes("चंडी") || sevaTitle.includes("చండీ") || sevaTitle.includes("சண்டி");
    const isNavagraha = sLower.includes("navagraha") || sevaTitle.includes("ನವಗ್ರಹ") || sevaTitle.includes("नवग्रह") || sevaTitle.includes("నవగ్రహ") || sevaTitle.includes("நவகிரக");
    const isKuja = sLower.includes("kuja") || sLower.includes("mangal") || sevaTitle.includes("ಕುಜ") || sevaTitle.includes("कुज") || sevaTitle.includes("మంగళ") || sevaTitle.includes("செவ்வாய்");
    const isShani = sLower.includes("shani") || sevaTitle.includes("ಶನಿ") || sevaTitle.includes("शनि") || sevaTitle.includes("శని") || sevaTitle.includes("சனி");
    const isRahuKetuOrSarpa = sLower.includes("rahu") || sLower.includes("sarpa") || sevaTitle.includes("ರಾಹು") || sevaTitle.includes("ಸರ್ಪ") || sevaTitle.includes("कालसर्प") || sevaTitle.includes("సర్ప");
    const isSudarshana = sLower.includes("sudarshana") || sLower.includes("narasimha") || sevaTitle.includes("ಸುದರ್ಶನ") || sevaTitle.includes("सुदर्शन") || sevaTitle.includes("సుదర్శన") || sevaTitle.includes("சுதர்சன");
    const isDhanvantari = sLower.includes("dhanvantari") || sevaTitle.includes("ಧನ್ವಂತರಿ") || sevaTitle.includes("धन्वंतरि") || sevaTitle.includes("ధన్వంతరి") || sevaTitle.includes("தன்வந்திரி");
    const isPitru = sLower.includes("pitru") || sLower.includes("pinda") || sLower.includes("bali") || sLower.includes("tripindi") || sevaTitle.includes("ಪಿತೃ") || sevaTitle.includes("ಪಿಂಡ") || sevaTitle.includes("पितृ") || sevaTitle.includes("పిండ");
    const isVastu = sLower.includes("vastu") || sevaTitle.includes("ವಾಸ್ತು") || sevaTitle.includes("वास्तु") || sevaTitle.includes("వాస్తు") || sevaTitle.includes("வாஸ்து");
    const isLakshmi = sLower.includes("lakshmi") || sLower.includes("sukta") || sevaTitle.includes("ಲಕ್ಷ್ಮೀ") || sevaTitle.includes("महालक्ष्मी") || sevaTitle.includes("లక్ష్మీ") || sevaTitle.includes("லக்ஷ்மி");
    const isSantana = sLower.includes("santana") || sevaTitle.includes("ಸಂತಾನ") || sevaTitle.includes("संतान") || sevaTitle.includes("సంతాన") || sevaTitle.includes("சந்தான");
    const isMarriage = sLower.includes("swayamvara") || sLower.includes("vivaha") || sevaTitle.includes("ಸ್ವಯಂವರ") || sevaTitle.includes("स्वयंवर") || sevaTitle.includes("వివాహ") || sevaTitle.includes("சுயம்வர");
    const isSatyanarayana = sLower.includes("satyanarayana") || sevaTitle.includes("ಸತ್ಯನಾರಾಯಣ") || sevaTitle.includes("सत्यनारायण") || sevaTitle.includes("సత్యనారాయణ") || sevaTitle.includes("சத்தியநாராயண");
    const isAyushya = sLower.includes("ayushya") || sevaTitle.includes("ಆಯುಷ್ಯ") || sevaTitle.includes("आयुष्य") || sevaTitle.includes("ఆయుష్య") || sevaTitle.includes("ஆயுஷ்ய");
    const isRudra = sLower.includes("rudra") || sevaTitle.includes("ರುದ್ರ") || sevaTitle.includes("रुद्र") || sevaTitle.includes("రుద్ర") || sevaTitle.includes("ருத்ர");
    const isMrityunjaya = sLower.includes("mrityunjaya") || sevaTitle.includes("ಮೃತ್ಯುಂಜಯ") || sevaTitle.includes("मृत्युंजय") || sevaTitle.includes("మృత్యుంజయ") || sevaTitle.includes("மிருத்யுஞ்ஜய");

    if (isGanapati) {
      return {
        whatIsPooja: pick({
          kn: "ಗಣಪತಿ ಹೋಮವು ಸಕಲ ವಿಘ್ನನಿವಾರಕನಾದ ಶ್ರೀ ಮಹಾಗಣಪತಿಯನ್ನು ಪ್ರಸನ್ನಗೊಳಿಸುವ ಶ್ರೇಷ್ಠ ವೈದಿಕ ಯಜ್ಞವಾಗಿದೆ. ಈ ಪವಿತ್ರ ಯಜ್ಞದಲ್ಲಿ ಮಂತ್ರಪೂರ್ವಕವಾಗಿ ಗರಿಕೆ, ತುಪ್ಪ, ಕೊಬ್ಬರಿ ಹಾಗೂ ಮೋದಕಗಳನ್ನು ಅರ್ಪಿಸಿ ಪೂಜಿಸಲಾಗುತ್ತದೆ.",
          hi: "गणपति होम समस्त विघ्नविनाशक श्री महागणपति को प्रसन्न करने वाला श्रेष्ठ वैदिक यज्ञ है। इसमें मंत्रोच्चार के साथ पावन आहुतियों द्वारा भगवान गणेश का पूजन किया जाता है।",
          te: "గణపతి హోమం సమస్త విఘ్నవినాశకుడైన శ్రీ మహాగణపతిని ప్రసన్నం చేసుకునే ఉత్తమ వైదిక యజ్ఞం. పవిత్ర ద్రవ్యాలను సమర్పించి పూజిస్తారు.",
          ta: "கணபதி ஹோமம் சகல விக்னங்களை போக்கும் ஸ்ரீ மகா கணபதியை திருப்திப்படுத்தும் வைதீக யாகமாகும்.",
          en: "Ganapati Homa is a sacred Vedic fire ritual performed to invoke Lord Ganesha, the remover of all obstacles."
        }, lang),
        whyDoPooja: pick({
          kn: "ಹೊಸ ಕೆಲಸಗಳ ಆರಂಭ, ಗೃಹಪ್ರವೇಶ, ವ್ಯಾಪಾರ-ಉದ್ಯೋಗದಲ್ಲಿ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಜಾತಕದಲ್ಲಿರುವ ಕೇತು ದೋಷ ಮತ್ತು ಅಡಚಣೆಗಳನ್ನು ನಿವಾರಿಸಲು ಈ ಹೋಮವನ್ನು ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "नवीन कार्यों के शुभारंभ, व्यापार में वृद्धि तथा कुण्डली में स्थित केतु दोष निवारण हेतु यह होम किया जाता है।",
          te: "నూతన కార్యారంభం, వ్యాపారాభివృద్ధి మరియు జాతకంలోని కేతు దోషాల నివారణకు ఈ హోమం చేయబడుతుంది.",
          ta: "புதிய தொடக்கம், வியாபார வளர்ச்சி மற்றும் கிரக தோஷ நிவர்த்திக்காக இந்த ஹோமம் செய்யப்படுகிறது.",
          en: "This Homa is performed before starting new ventures, expanding business, or removing Ketu afflictions and hurdles."
        }, lang),
        benefitsPooja: pick({
          kn: "ಈ ಪೂಜೆಯ ಪ್ರಭಾವದಿಂದ ಮನಸ್ಸಿನಲ್ಲಿ ಉತ್ಸಾಹ ಮೂಡಿ, ಸಕಲ ಕೆಲಸಗಳಲ್ಲಿ ಜಯ, ಧನ ಸಂಪತ್ತಿನ ವೃದ್ಧಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸುಖ-ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.",
          hi: "इस पूजन के प्रभाव से सकारात्मक ऊर्जा का संचार होता है, कार्यों में सफलता, धन-समृद्धि एवं पारिवारिक सुख-शांति मिलती है।",
          te: "ఈ పూజ వల్ల మనస్సులో ధనాత్మక శక్తి కలిగి, సమస్త కార్యాలలో విజయం మరియు కుటుంబ సౌఖ్యం కలుగుతుంది.",
          ta: "இந்த பூஜையால் மனதில் நேர்மறை ஆற்றல் பெருகி, சகல காரிய வெற்றி மற்றும் குடும்ப சௌக்கியம் கிடைக்கும்.",
          en: "Performing this Homa bestows sharp intellect, guarantees success in endeavors, and fills the home with harmony."
        }, lang)
      };
    }

    if (isChandi) {
      return {
        whatIsPooja: pick({
          kn: "ಚಂಡಿ ಹೋಮವು ದುರ್ಗಾ ಸಪ್ತಶತಿ ಮಂತ್ರಗಳಿಂದ ಜಗನ್ಮಾತೆ ಮಹಾಕಾಳಿ, ಮಹಾಲಕ್ಷ್ಮೀ, ಮಹಾಸರಸ್ವತಿಯರನ್ನು ಆರಾಧಿಸುವ ಪರಮ ಶಕ್ತಿಶಾಲಿ ಯಜ್ಞವಾಗಿದೆ.",
          hi: "चंडी होम दुर्गा सप्तशती के पावन मंत्रों द्वारा जगदम्बा की आराधना का अत्यंत तेजस्वी एवं फलदायी महायज्ञ है।",
          te: "చండీ హోమం దుర్గా సప్తశతీ మంత్రాలతో జగన్మాతను ఆరాధించే అత్యంత శక్తివంతమైన వైదిక మహాయజ్ఞం.",
          ta: "சண்டி ஹோமம் துர்கா சப்தசதி மந்திரங்களால் அம்பிகையை ஆராதிக்கும் மிக உன்னதமான சக்தி வாய்ந்த யாகமாகும்.",
          en: "Chandi Homa is an exalted Vedic fire sacrifice invoking the Divine Mother through the 700 sacred Durga Saptashati verses."
        }, lang),
        whyDoPooja: pick({
          kn: "ಶತ್ರು ಬಾಧೆ, ದೃಷ್ಟಿ ದೋಷ, ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳ ನಿವಾರಣೆ ಹಾಗೂ ವ್ಯಾಪಾರ-ವ್ಯವಹಾರದಲ್ಲಿ ಎದುರಾಗುವ ಸಂಕಷ್ಟಗಳನ್ನು ಬೇರುಸಹಿತ ನಿವಾರಿಸಲು ಮಾಡಲಾಗುತ್ತದೆ.",
          hi: "शत्रु बाधा, नजर दोष, नकारात्मक ऊर्जा के शमन तथा व्यापार एवं जीवन में आने वाली गंभीर बाधाओं के निवारण हेतु किया जाता है।",
          te: "శత్రు బాధలు, దిష్టి దోషాలు, ప్రతికూల శక్తుల నివారణ మరియు వ్యాపారంలో ఎదురయ్యే సంకటాల పరిహారం కోసం చేస్తారు.",
          ta: "சத்ரு பயம், கண் திருஷ்டி, எதிர்மறை சக்திகள் மற்றும் வாழ்வில் ஏற்படும் தடைகளை வேரறுக்க செய்யப்படுகிறது.",
          en: "Performed to destroy fear, overcome hidden opposition, clear psychic afflictions, and ensure total household protection."
        }, lang),
        benefitsPooja: pick({
          kn: "ಅಭೇದ್ಯ ದೈವಿಕ ರಕ್ಷಣಾ ಕವಚ, ಶತ್ರುಗಳ ಮೇಲೆ ವಿಜಯ, ಅಖಂಡ ಕೀರ್ತಿ, ಯಶಸ್ಸು ಹಾಗೂ ಕುಟುಂಬಕ್ಕೆ ಸಕಲ ಶುಭ-ಮಂಗಳಗಳು ಲಭಿಸುತ್ತವೆ.",
          hi: "अभेद्य दैवीय रक्षा कवच, सर्व कार्यों में विजय, अखंड कीर्ति तथा परिवार में ऐश्वर्य व सुख-शांति की प्राप्ति होती है।",
          te: "దివ్య రక్షణ కవచం, కార్యవిజయం, అఖండ కీర్తి మరియు కుటుంబంలో సుఖసంతోషాలు చేకూరుతాయి.",
          ta: "தெய்வீக பாதுகாப்பு கவசம், காரிய வெற்றி, புகழ் மற்றும் குடும்பத்தில் சுபிட்சம் உண்டாகும்.",
          en: "Bestows an impenetrable protective aura, supreme victory in legal/business challenges, and enduring joy."
        }, lang)
      };
    }

    if (isNavagraha) {
      return {
        whatIsPooja: pick({
          kn: "ನವಗ್ರಹ ಶಾಂತಿ ಹೋಮವು ಸೂರ್ಯಾದಿ ಒಂಬತ್ತು ಗ್ರಹಗಳ ಮಂತ್ರಾಹುತಿಗಳ ಮೂಲಕ ಗ್ರಹ ದೋಷಗಳನ್ನು ಶಮನಗೊಳಿಸುವ ಸಮಗ್ರ ಶಾಂತಿ ಕರ್ಮವಾಗಿದೆ.",
          hi: "नवग्रह शांति होम सूर्यादि नवग्रहों के वैदिक मंत्रों द्वारा ग्रह दोषों का शमन करने वाला सर्वकल्याणकारी विधान है।",
          te: "నవగ్రహ శాంతి హోమం సూర్యాది తొమ్మిది గ్రహాల మంత్రాలతో గ్రహ దోషాలను శమింపజేసే సమగ్ర శాంతి పూజ.",
          ta: "நவகிரக சாந்தி ஹோமம் சூரியன் உள்ளிட்ட ஒன்பது கிரகங்களின் தோஷங்களை நீக்கும் முழுமையான பரிகார யாகமாகும்.",
          en: "Navagraha Shanti Homa harmonizes all nine planetary energies through dedicated Vedic oblations and mantras."
        }, lang),
        whyDoPooja: pick({
          kn: "ಜಾತಕದಲ್ಲಿ ಗ್ರಹಗಳು ನೀಚ, ಅಸ್ತಂಗತ ಅಥವಾ ಪಾಪಗ್ರಹಗಳ ಯುತಿಯಲ್ಲಿದ್ದಾಗ ಉಂಟಾಗುವ ದೈಹಿಕ, ಮಾನಸಿಕ ಹಾಗೂ ಆರ್ಥಿಕ ತೊಂದರೆಗಳ ನಿವಾರಣೆಗೆ ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "कुंडली में ग्रहों के प्रतिकूल प्रभाव, दशा-अंतर्दशा के संकट तथा जीवन में बार-बार आने वाली रुकावटों के निवारण हेतु किया जाता है।",
          te: "జాతకంలో గ్రహాల అశుభ స్థితి, దశా కాలపు ఆటంకాలు మరియు నిరంతర ఆటంకాలను తొలగించడానికి నిర్వహిస్తారు.",
          ta: "ஜாதகத்தில் கிரகங்களின் பலவீன நிலை மற்றும் தசா-புக்தி கால தடைகளை நீக்க செய்யப்படுகிறது.",
          en: "Designed to neutralize planetary debilities, appease transit afflictions, and bring smooth balance to life."
        }, lang),
        benefitsPooja: pick({
          kn: "ಗ್ರಹ ಪೀಡೆಗಳು ಶಾಂತವಾಗಿ, ಆಯುರಾರೋಗ್ಯ, ವ್ಯಾಪಾರಾಭಿವೃದ್ಧಿ, ಕುಟುಂಬ ಸೌಖ್ಯ ಹಾಗೂ ನಿರಂತರ ಯಶಸ್ಸು ಲಭಿಸುತ್ತದೆ.",
          hi: "ग्रह शांति से उत्तम स्वास्थ्य, व्यापार में प्रगति, पारिवारिक सुख तथा निरंतर सफलता प्राप्त होती है।",
          te: "గ్రహ పీడలు తొలగి ఆయురారోగ్యాలు, వ్యాపారవృద్ధి, కుటుంబ సౌఖ్యం మరియు విజయం సిద్ధిస్తాయి.",
          ta: "கிரக தோஷங்கள் நீங்கி நல்வாழ்வு, தொழில் முன்னேற்றம் மற்றும் குடும்பத்தில் அமைதி பெருகும்.",
          en: "Paves the path for steady fortune, domestic tranquility, robust health, and harmonious planetary alignment."
        }, lang)
      };
    }

    if (isSudarshana) {
      return {
        whatIsPooja: pick({
          kn: "ಶ್ರೀ ಸುದರ್ಶನ ನರಸಿಂಹ ಹೋಮವು ಭಗವಾನ್ ವಿಷ್ಣುವಿನ ಪರಮ ಆಯುಧವಾದ ಸುದರ್ಶನ ಚಕ್ರ ಹಾಗೂ ಶ್ರೀ ನರಸಿಂಹ ದೇವರ ರಕ್ಷಣಾತ್ಮಕ ಮಹಾಯಜ್ಞವಾಗಿದೆ.",
          hi: "श्री सुदर्शन नृसिंह होम भगवान विष्णु के सुदर्शन चक्र एवं नृसिंह देव की आराधना का महा शक्तिशाली रक्षा यज्ञ है।",
          te: "శ్రీ సుదర్శన నరసింహ హోమం విష్ణుమూర్తి సుదర్శన చక్రం మరియు నరసింహ స్వామి వారి దివ్య రక్షా యజ్ఞం.",
          ta: "ஸ்ரீ சுதர்சன நரசிம்ம ஹோமம் மகாவிஷ்ணுவின் சுதர்சன சக்கரத்தையும் நரசிம்மரையும் போற்றும் மகா ரக்ஷா யாகமாகும்.",
          en: "Sri Sudarshana Narasimha Homa invokes the blazing cosmic discus and Lord Narasimha for supreme protection."
        }, lang),
        whyDoPooja: pick({
          kn: "ದುಷ್ಟ ಶಕ್ತಿಗಳ ಬಾಧೆ, ನಿರಂತರ ಆರ್ಥಿಕ-ಮಾನಸಿಕ ಸಂಕಷ್ಟ, ದೃಷ್ಟಿ ದೋಷ ಹಾಗೂ ಶತ್ರುಗಳ ಉಪಟಳ ನಿವಾರಣೆಗೆ ಈ ಹೋಮ ಮಾಡಲಾಗುತ್ತದೆ.",
          hi: "शत्रु बाधा, नजर दोष, नकारात्मक ऊर्जा तथा व्यापार व स्वास्थ्य में अचानक आने वाली विपत्तियों के निवारण हेतु किया जाता है।",
          te: "శత్రు బాధలు, దిష్టి దోషాలు, ఆకస్మిక ఆపదలు మరియు వ్యాపార అవరోధాల నివారణ కోసం ఈ హోమం చేస్తారు.",
          ta: "சத்ரு பயம், கண் திருஷ்டி, எதிர்மறை தாக்கங்கள் மற்றும் எதிர்பாராத தடைகளை அழிக்க செய்யப்படுகிறது.",
          en: "Crucial for annihilating hidden malice, neutralizing psychic distress, and overturning chronic adversity."
        }, lang),
        benefitsPooja: pick({
          kn: "ದೈವಿಕ ಅಭಯ ಕವಚ, ಸಮಸ್ತ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿಜಯ, ಭಯ ನಿವಾರಣೆ ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ಅಖಂಡ ಶಾಂತಿ-ಸಮೃದ್ಧಿ ನೆಲೆಸುತ್ತದೆ.",
          hi: "दैवीय सुरक्षा चक्र की प्राप्ति, समस्त कार्यों में निर्बाध विजय तथा जीवन में साहस व समृद्धि का संचार होता है।",
          te: "దివ్య రక్షణ, సమస్త కార్యవిజయం, భయ విముక్తి మరియు కుటుంబంలో సమృద్ధి లభిస్తాయి.",
          ta: "தெய்வீக கவசம், காரிய வெற்றி, பயமின்மை மற்றும் இல்லத்தில் சுபிட்சம் உண்டாகும்.",
          en: "Endows the devotee with invincible confidence, clears obstacles, and radiates divine peace throughout the home."
        }, lang)
      };
    }

    if (isDhanvantari || isAyushya) {
      return {
        whatIsPooja: pick({
          kn: "ಶ್ರೀ ಧನ್ವಂತರಿ ಹಾಗೂ ಆಯುಷ್ಯ ಹೋಮವು ದೇವವೈದ್ಯ ಧನ್ವಂತರಿ ಸ್ವಾಮಿ ಹಾಗೂ ಆಯುರ್ದೇವತೆಗಳನ್ನು ಆರಾಧಿಸಿ ಅಮೃತ ಆಯುರಾರೋಗ್ಯ ಪಡೆಯುವ ವೈದಿಕ ಯಜ್ಞವಾಗಿದೆ.",
          hi: "श्री धन्वंतरि एवं आयुष्य होम देववैद्य धन्वंतरि एवं आयु देवताओं की आराधना द्वारा उत्तम स्वास्थ्य और दीर्घायु प्रदान करने वाला पावन यज्ञ है।",
          te: "శ్రీ ధన్వంతరి మరియు ఆయుష్య హోమం ఆయుర్వేద అధిపతి ధన్వంతరి స్వామి మరియు ఆయుర్దేవతల ఆరాధనతో కూడిన దివ్య యజ్ఞం.",
          ta: "ஸ்ரீ தன்வந்திரி மற்றும் ஆயுஷ்ய ஹோமம் தேவாதி தேவன் தன்வந்திரி மற்றும் ஆயுள் தேவதைகளை வழிபடும் ஆரோக்கிய யாகமாகும்.",
          en: "Sri Dhanvantari & Ayushya Homa invokes the Divine Physician for holistic healing, vitality, and longevity."
        }, lang),
        whyDoPooja: pick({
          kn: "ದೀರ್ಘಕಾಲದ ಕಾಯಿಲೆಗಳು, ಶಾರೀರಿಕ ದೌರ್ಬಲ್ಯ, ಮಾನಸಿಕ ಬಳಲಿಕೆ ಹಾಗೂ ಆಯುಷ್ಯದ ಮೇಲಿನ ಗ್ರಹದೋಷಗಳನ್ನು ಶಮನಗೊಳಿಸಲು ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "दीर्घकालिक व्याधियों, शारीरिक दुर्बलता, मानसिक तनाव तथा स्वास्थ्य पर विपरीत ग्रहों के प्रभाव को दूर करने हेतु किया जाता है।",
          te: "దీర్ಘకాలిక అనారోగ్యాలు, శారీరక బలహీనత మరియు ఆయుష్షుపై ఉన్న గ్రహ దోషాల నివారణకు చేస్తారు.",
          ta: "தீராத வியாதிகள், உடல் சோர்வு மற்றும் ஆயுள் மீதான கிரக தோஷங்களை நீக்க செய்யப்படுகிறது.",
          en: "Performed to cure persistent physical ailments, boost immunity, and remove life-threatening planetary afflictions."
        }, lang),
        benefitsPooja: pick({
          kn: "ಔಷಧಿಗಳು ಶೀಘ್ರ ಫಲಕಾರಿಯಾಗಿ, ರೋಗ ಮುಕ್ತ ದೀರ್ಘಾಯುಷ್ಯ, ದೈಹಿಕ ಕಾಂತಿ ಹಾಗೂ ಚೈತನ್ಯಭರಿತ ಜೀವನ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
          hi: "औषधियां शीघ्र असर करती हैं, रोगों से मुक्ति, दीर्घायु तथा नव चेतना व आरोग्य प्राप्त होता है।",
          te: "మందులు చక్కగా పనిచేసి వ్యాధి విముక్తి, దీర్ఘాయువు మరియు నవ చైతన్యం కలుగుతాయి.",
          ta: "சிகிச்சைகள் பலனளித்து பூரண குணம், நீண்ட ஆயுள் மற்றும் தேக ஆரோக்கியம் கிட்டும்.",
          en: "Grants radiant vitality, swift recovery from illness, longevity, and peaceful energetic well-being."
        }, lang)
      };
    }

    if (isLakshmi || isSatyanarayana) {
      return {
        whatIsPooja: pick({
          kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ಹಾಗೂ ಸತ್ಯನಾರಾಯಣ ಪೂಜೆಯು ಅಷ್ಟೈಶ್ವರ್ಯದಾಯಿನಿ ಮಹಾಲಕ್ಷ್ಮೀ ಹಾಗೂ ಜಗತ್ಪಾಲಕ ಶ್ರೀಮನ್ನಾರಾಯಣನ ಅನುಗ್ರಹ ಪಡೆಯುವ ಪರಮ ಮಂಗಳಕರ ಆರಾಧನೆಯಾಗಿದೆ.",
          hi: "श्री महालक्ष्मी एवं सत्यनारायण पूजन अष्टलक्ष्मी एवं भगवान लक्ष्मीनारायण की कृपा से सुख-समृद्धि एवं सौभाग्य प्रदान करने वाला पावन अनुष्ठान है।",
          te: "శ్రీ మహాలక్ష్మీ మరియు సత్యనారాయణ పూజ అష్టైశ్వర్య ప్రదాత్రి లక్ష్మీదేవి మరియు శ్రీమన్నారాయణుని అనుగ్రహం కొరకు చేసే మంగళకర పూజ.",
          ta: "ஸ்ரீ மகாலக்ஷ்மி மற்றும் சத்தியநாராயண பூஜை அஷ்டலக்ஷ்மி மற்றும் நாராயணரின் அருளால் செல்வ வளம் தரும் மங்கள பூஜையாகும்.",
          en: "Sri Mahalakshmi & Satyanarayana Puja is an auspicious adoration invoking Goddess Lakshmi and Lord Narayana for wealth and joy."
        }, lang),
        whyDoPooja: pick({
          kn: "ವ್ಯಾಪಾರ-ಉದ್ಯೋಗದಲ್ಲಿ ನಷ್ಟ, ಸಾಲದ ಬಾಧೆ, ಆರ್ಥಿಕ ಮುಗ್ಗಟ್ಟು ನಿವಾರಿಸಿ ನಿರಂತರ ಧನಾಗಮನ ಹಾಗೂ ಗೃಹ ಸೌಖ್ಯಕ್ಕಾಗಿ ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "व्यापार में हानि, ऋण बाधा, आर्थिक तंगी को दूर कर निरंतर धन आगमन एवं पारिवारिक सुख-शांति हेतु संपन्न किया जाता है।",
          te: "వ్యాపార నష్టాలు, రుణ బాధలు తొలగించి నిరంతర ధనాగమనం మరియు కుటుంబ సౌభాగ్యం కొరకు నిర్వహిస్తారు.",
          ta: "தொழில் நஷ்டம், கடன் தொல்லை நீங்கி தன வரவு பெருகவும் குடும்ப அமைதிக்காகவும் செய்யப்படுகிறது.",
          en: "Undertaken to dissolve financial blockages, eliminate debts, and establish an unbroken stream of prosperity."
        }, lang),
        benefitsPooja: pick({
          kn: "ಅಷ್ಟಲಕ್ಷ್ಮಿಯರ ಕೃಪೆ, ವ್ಯಾಪಾರಾಭಿವೃದ್ಧಿ, ಧನ-ಧಾನ್ಯ ಸಮೃದ್ಧಿ, ಸಮಾಜದಲ್ಲಿ ಸನ್ಮಾನ ಹಾಗೂ ಶಾಂತಿಯುತ ಕೌಟುಂಬಿಕ ಜೀವನ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
          hi: "अष्टलक्ष्मी कृपा, व्यवसाय में भारी उन्नति, धन-धान्य समृद्धि तथा जीवन में अपार सुख और सम्मान प्राप्त होता है।",
          te: "అష్టలక్ష్మి అనుగ్రహం, వ్యాపారవృద్ధి, సంపద పెరుగుదల మరియు కుటుంబంలో శాంతి వెల్లివిరుస్తుంది.",
          ta: "அஷ்டலக்ஷ்மி கடாட்சம், வியாபார அபிவிருத்தி, தன லாபம் மற்றும் குடும்பத்தில் மகிழ்ச்சி உண்டாகும்.",
          en: "Bestows abundant wealth, business expansion, elimination of debt, elevated social standing, and domestic bliss."
        }, lang)
      };
    }

    if (isPitru) {
      return {
        whatIsPooja: pick({
          kn: "ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ನಾರಾಯಣ ಬಲಿ ಸೇವೆಯು ಅಗಲಿದ ಪೂರ್ವಜರಿಗೆ ಮುಕ್ತಿ ನೀಡಿ ಪಿತೃದೇವತೆಗಳ ಪ್ರಸನ್ನ ಆಶೀರ್ವಾದ ಪಡೆಯುವ ಶ್ರೇಷ್ಠ ವೈದಿಕ ಸಂಸ್ಕಾರವಾಗಿದೆ.",
          hi: "पितृ तर्पण एवं नारायण बलि सेवा पूर्वजों को सद्गति प्रदान करने तथा पितरों का दिव्य आशीर्वाद पाने का श्रेष्ठ वैदिक संस्कार है।",
          te: "పితృ తర్పణం మరియు నారాయణ బలి సేవ పితృదేవతలకు సద్గతిని చేకూర్చి వారి ఆశీస్సులు పొందే ఉత్తమ వైదిక సంస్కారం.",
          ta: "பித்ரு தர்பணம் மற்றும் நாராயண பலி முன்னோர்களுக்கு முக்தி அளித்து அவர்களின் ஆசியை பெறும் வைதீக சடங்காகும்.",
          en: "Pitru Tarpanam & Narayana Bali is a sacred ancestral offering ensuring peace for departed souls and invoking lineage blessings."
        }, lang),
        whyDoPooja: pick({
          kn: "ಪಿತೃ ದೋಷ, ಸಂತಾನ ವಿಳಂಬ, ಕೌಟುಂಬಿಕ ಅಶಾಂತಿ ಹಾಗೂ ಪೂರ್ವಜರ ಋಣದಿಂದ ಮುಕ್ತಿ ಹೊಂದಲು ಈ ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "पितृ दोष, संतान बाधा, पारिवारिक अशांति तथा पूर्वजों के ऋणों से मुक्ति पाने हेतु यह सेवा की जाती है।",
          te: "పితృ దోషం, సంతాన లేమి, కుటుంబ అశాంతి మరియు పూర్వీకుల ఋణం తీర్చుకోవడానికి నిర్వహిస్తారు.",
          ta: "பித்ரு தோஷம், சந்தான தாமதம், குடும்ப அமைதியின்மை நீங்க இந்த பரிகார பூஜை செய்யப்படுகிறது.",
          en: "Essential for removing ancestral curses, resolving delays in progeny and marriage, and restoring family harmony."
        }, lang),
        benefitsPooja: pick({
          kn: "ಏಳು ತಲೆಮಾರಿನ ಪಿತೃಗಳಿಗೆ ಮುಕ್ತಿ ದೊರೆತು, ಸಂತತಿ ವೃದ್ಧಿ, ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ಸಮಸ್ತ ಕಾರ್ಯಗಳಲ್ಲಿ ಸಿದ್ಧಿ ಲಭಿಸುತ್ತದೆ.",
          hi: "सात पीढ़ियों के पितरों को मुक्ति मिलती है, वंश वृद्धि, पारिवारिक सुख और कार्यों में सफलता प्राप्त होती है।",
          te: "ఏడు తరాల పితృదేవతలకు ముక్తి కలిగి, వంశాభివృద్ధి, కుటుంబ ప్రశాంతత చేకూరుతాయి.",
          ta: "7 தலைமுறை முன்னோர்களுக்கு முக்தி கிட்டும், வம்ச சுபிட்சம் மற்றும் சகல காரிய சித்தி உண்டாகும்.",
          en: "Guarantees liberation for 7 generations of ancestors, prospers descendants, and opens stalled family avenues."
        }, lang)
      };
    }

    if (isRudra || isMrityunjaya) {
      return {
        whatIsPooja: pick({
          kn: "ರುದ್ರ ಅಭಿಷೇಕ ಹಾಗೂ ಮೃತ್ಯುಂಜಯ ಹೋಮವು ಸನಾತನ ಧರ್ಮದ ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ ಶಿವ ಆರಾಧನೆಯಾಗಿದೆ. ಮಹಾದೇವನ ಆತ್ಮಲಿಂಗ ಸ್ವರೂಪಕ್ಕೆ ಪಂಚಾಮೃತ ಅಭಿಷೇಕ ನೆರವೇರಿಸಿ, ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರದಿಂದ ಹೋಮ ಮಾಡಲಾಗುತ್ತದೆ.",
          hi: "रुद्र अभिषेक एवं महामृत्युंजय होम अत्यंत शक्तिशाली शिव आराधना है। भगवान शिव के आत्मलिंग स्वरूप पर पंचामृत अभिषेक कर महामृत्युंजय मन्त्र से होम किया जाता है।",
          te: "రుద్ర అభిషేకం మరియు మృత్యుంజయ హోమం అత్యంత శక్తివంతమైన శివ ఆరాధన. స్వామివారికి పంచామృతాలతో అభిషేకం మరియు మంత్ర హోమం నిర్వహిస్తారు.",
          ta: "ருத்ர அபிஷேகம் மற்றும் ருத்ர ஹோமம் மிகவும் சக்திவாய்ந்த சிவ ஆராதனையாகும். சிவலிங்கத்திற்கு பஞ்சாமிர்த அபிஷேகம் செய்யப்படுகிறது.",
          en: "Rudra Abhisheka & Maha Mrityunjaya Homa is a supreme Shiva ritual consecrated with Panchamrita and Vedic mantras."
        }, lang),
        whyDoPooja: pick({
          kn: "ದೀರ್ಘಕಾಲದ ಅನಾರೋಗ್ಯ, ಶನಿ-ರಾಹು ದೋಷಗಳ ತೀವ್ರತೆ ಹಾಗೂ ಮಾನಸಿಕ ಚಿಂತೆಗಳನ್ನು ನಿವಾರಿಸಿ ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಶಾಂತಿ ಪಡೆಯಲು ಈ ಸೇವೆಯನ್ನು ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "दीर्घकालिक व्याधियों, शनि-राहु दोषों तथा मानसिक संताप के निवारण एवं दीर्घायु तथा आंतरिक शांति हेतु यह सेवा की जाती है।",
          te: "దీర్ఘకాలిక అనారోగ్యం, శని-రాహు దోషాల నివారణ మరియు దీర్ఘాయువు, మానసిక ప్రశాంతత కోసం ఈ సేవ చేయబడుతుంది.",
          ta: "தீராத நோய்கள், சனி-ராகு தோஷ நிவர்த்தி மற்றும் நீண்ட ஆயுள் பெற இந்த பூஜை செய்யப்படுகிறது.",
          en: "This Seva is performed to overcome chronic illness, eliminate Rahu/Saturn afflictions, and grant longevity."
        }, lang),
        benefitsPooja: pick({
          kn: "ಈ ಸೇವೆಯಿಂದ ಸಕಲ ರೋಗ-ಬಾಧೆಗಳು ಶಮನವಾಗಿ, ದೈಹಿಕ ಕಾಂತಿ, ರಕ್ಷಣಾ ಕವಚ, ನಿರಂತರ ಆಯುರಾರೋಗ್ಯ ಹಾಗೂ ಸಕಲ ಪಾಪನಾಶದ ಫಲ ಲಭಿಸುತ್ತದೆ.",
          hi: "इस सेवा से समस्त रोगों का शमन होता है, शारीरिक कांति, सुरक्षा कवच, उत्तम स्वास्थ्य एवं पापों से मुक्ति मिलती है।",
          te: "ఈ సేవ వల్ల రోగాలు నివారణై, శారీరక ఆరోగ్యం, రక్షణ కవచం మరియు సకల పాపక్షయం కలుగుతుంది.",
          ta: "இந்த சேவையால் நோய்கள் நீங்கி, உடல் ஆரோக்கியம், தெய்வீக பாதுகாப்பு கவசம் கிடைக்கும்.",
          en: "Grants health protection shield, dissolves karmic debts, and fills the devotee with divine peace."
        }, lang)
      };
    }

    return {
      whatIsPooja: pick({
        kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನೆರವೇರಿಸಲಾದ ಈ ಪವಿತ್ರ ಸೇವೆಯು ಜನ್ಮ ನಕ್ಷತ್ರ ಹಾಗೂ ರಾಶಿ ಗ್ರಹಗಳ ಪ್ರಸನ್ನತೆಗೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವಾದ ದೈವಿಕ ಆರಾಧನೆಯಾಗಿದೆ.",
        hi: "श्री महाबलेश्वर सन्निधि में संपन्न यह पवित्र सेवा जन्म नक्षत्र एवं राशि ग्रहों की प्रसन्नता हेतु प्रभावकारी वैदिक आराधना है।",
        te: "శ్రీ మహాబలేశ్వర సన్నిధిలో నిర్వహించిన ఈ పవిత్ర సేవ జన్మ నక్షత్రం మరియు రాశి గ్రహాల ప్రసన్నతకు శ్రేష్ఠమైన ఆరాధన.",
        ta: "ஸ்ரீ மகாபலேஸ்வர சந்நிதியில் செய்யப்பட்ட இந்த பூஜை ஜன்ம நட்சத்திர மற்றும் ராசி கிரகங்களின் திருப்திக்காக செய்யப்பட்டது.",
        en: "Performed at the holy Mahabaleshwara Sanctum, this sacred Seva is an auspicious consecration tailored to your birth chart."
      }, lang),
      whyDoPooja: pick({
        kn: "ಜಾತಕದಲ್ಲಿರುವ ನವಗ್ರಹ ದೋಷಗಳ ಶಮನ, ಕೌಟುಂಬಿಕ ಅಭ್ಯುದಯ, ವ್ಯಾಪಾರ-ಉದ್ಯೋಗದಲ್ಲಿ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಮಾನಸಿಕ ನೆಮ್ಮದಿಗಾಗಿ ಈ ಸೇವೆಯನ್ನು ಸಲ್ಲಿಸಲಾಗುತ್ತದೆ.",
        hi: "कुण्डली में स्थित नवग्रह दोषों के शमन, पारिवारिक उन्नति, व्यापार में वृद्धि तथा मानसिक शांति हेतु यह सेवा अर्पित की जाती है।",
        te: "జాతకంలోని నవగ్రహ దోషాల నివారణ, కుటుంబ అభ్యుదయం, ఉద్యోగ వ్యాపారాలలో ప్రగతి కోసం ఈ సేవ సమర్పించబడుతుంది.",
        ta: "ஜாதக கிரக தோஷ நிவர்த்தி, குடும்ப வளர்ச்சி, தொழில் முன்னேற்றம் மற்றும் மன அமைதிக்காக இந்த சேவை செய்யப்படுகிறது.",
        en: "Designed to neutralize planetary imbalances, enhance career growth, foster domestic peace, and clear obstacles."
      }, lang),
      benefitsPooja: pick({
        kn: "ಈ ಸೇವೆಯ ಫಲವಾಗಿ ನಿರಂತರ ಕೌಟುಂಬಿಕ ಭಾಗ್ಯೋದಯ, ಧನ-ಧಾನ್ಯ ಸಮೃದ್ಧಿ, ಸಮಾಜದಲ್ಲಿ ಗೌರವ ಹಾಗೂ ಮನಃಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.",
        hi: "इस सेवा के फलस्वरुप निरंतर पारिवारिक भाग्योदय, धन-धान्य समृद्धि, समाज में सम्मान एवं शांति प्राप्त होती है।",
        te: "ఈ సేవ వల్ల నిరంతర కుటుంబ భాగ్యోదయం, ధన ధాన్య సమృద్ధి మరియు సమాజంలో గౌరవ ప్రతిష్ఠలు కలుగుతాయి.",
        ta: "இந்த சேவையின் பலனாக குடும்ப பாக்கியம், தன தானிய பெருக்கம், சமூக மதிப்பு மற்றும் சாந்தி கிடைக்கும்.",
        en: "Bestows enduring family prosperity, continuous financial stability, elevated social respect, and divine grace."
      }, lang)
    };
  })();"""

content = content.replace(old_default_mahatme, new_default_mahatme)

with open(file_path_templates, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated SevaPrintTemplates.tsx defaultMahatme successfully!")
