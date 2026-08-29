filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

s_p6_marker = "  // ─── DYNAMIC PAGE 6 DATA (8-Month Roadmap - 240 Days) ───"
e_p6_marker = "  return ("

s_p6_idx = content.find(s_p6_marker)
e_p6_idx = content.find(e_p6_marker)

print(f"s_p6_idx: {s_p6_idx}, e_p6_idx: {e_p6_idx}")

new_p6_code = '''  // ─── DYNAMIC PAGE 6 DATA (8-Month Roadmap - 240 Days) ───
  const page6Data = React.useMemo(() => {
    if (!birthKundli) return [];
    const isKn = code === "kn";

    const monthsKn = ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
    const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const knOrdinals = [
      "ಒಂದನೇ ತಿಂಗಳು",
      "ಎರಡನೇ ತಿಂಗಳು",
      "ಮೂರನೇ ತಿಂಗಳು",
      "ನಾಲ್ಕನೇ ತಿಂಗಳು",
      "ಐದನೇ ತಿಂಗಳು",
      "ಆರನೇ ತಿಂಗಳು",
      "ಏಳನೇ ತಿಂಗಳು",
      "ಎಂಟನೇ ತಿಂಗಳು"
    ];

    const now = new Date();
    const curMonthIdx = now.getMonth();
    const curYear = now.getFullYear();

    const themesKn = [
      {
        badge: "💼 ವೃತ್ತಿ ಪ್ರಗತಿ",
        f1: "ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿಯ ಪ್ರಭಾವದಿಂದ ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೂತನ ಉನ್ನತ ಹುದ್ದೆಯ ಅವಕಾಶ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ಸಂಸ್ಥೆಯಲ್ಲಿ ನಿಮ್ಮ ದಕ್ಷತೆಗೆ ಹಿರಿಯ ಅಧಿಕಾರಿಗಳಿಂದ ಪೂರ್ಣ ಮಾನ್ಯತೆ ದೊರೆತು ಗೌರವ ವೃದ್ಧಿಸಲಿದೆ.",
        f2: "ವೃತ್ತಿಪರ ನಾಯಕತ್ವಕ್ಕೆ ಪೂರ್ಣ ಬೆಂಬಲ ಲಭ್ಯವಾಗಿ ಆರ್ಥಿಕ ಶ್ರೇಯಸ್ಸು ಉಂಟಾಗಲಿದೆ.",
        f3: "ಅಧಿಕ ಕೆಲಸದ ಒತ್ತಡದಿಂದ ವಿಶ್ರಾಂತಿಯ ಕೊರತೆ ಎದುರಾಗಬಹುದು; ಆರೋಗ್ಯ ಗಮನಿಸಿ.",
        f4: "ಸೂರ್ಯೋದಯಕ್ಕೆ ಅರ್ಘ್ಯ ನೀಡಿ, ಶ್ರೀ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಾಡಿ."
      },
      {
        badge: "💰 ಧನ ಸಮೃದ್ಧಿ",
        f1: "ದ್ವಿತೀಯ ಧನ ಭಾವ ಬಲದಿಂದ ೨೦%+ ಆರ್ಥಿಕ ಲಾಭ ಹಾಗೂ ನೂತನ ಹೂಡಿಕೆಗಳು ಪೂರ್ಣ ಫಲಪ್ರದವಾಗಲಿವೆ. ಬಾಕಿ ಉಳಿದಿದ್ದ ಹಳೆಯ ಧನ ಸಂಗ್ರಹಣೆಯಲ್ಲಿ ಸಫಲತೆ ದೊರೆತು ಕುಟುಂಬದಲ್ಲಿ ನೆಮ್ಮದಿ ಮೂಡಲಿದೆ.",
        f2: "ಹಣಕಾಸಿನ ಹರಿವು ಸುಗಮವಾಗಿ ಆರ್ಥಿಕ ಭದ್ರತೆ ಪೂರ್ಣ ವೃದ್ಧಿಯಾಗಲಿದೆ.",
        f3: "ಅನಗತ್ಯ ಖರ್ಚುಗಳ ಮೇಲೆ ನಿಗ್ರಹ ಅಗತ್ಯ; ಹಣಕಾಸಿನ ಶಿಸ್ತು ಕಾಪಾಡಿ.",
        f4: "ಶುಕ್ರವಾರ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜೆ ಮಾಡಿ, ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಿಸಿ."
      },
      {
        badge: "🏠 ಕುಟುಂಬ ಸೌಖ್ಯ",
        f1: "ಗೃಹದಲ್ಲಿ ಮಂಗಳ ಕಾರ್ಯಗಳ ಶುಭ ಯೋಜನೆ ಹಾಗೂ ಬಂಧುಮಿತ್ರರ ನಿಕಟ ಸಮಾಗಮ ಯೋಗ ಸಿದ್ಧಿಸಲಿದೆ. ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಪರಸ್ಪರ ನಂಬಿಕೆ ಹಾಗೂ ಅಖಂಡ ಸಾಂಸಾರಿಕ ಆನಂದ ನೆಲೆಸಲಿದೆ.",
        f2: "ಕುಟುಂಬದ ಎಲ್ಲಾ ಸದಸ್ಯರ ಸಹಕಾರ ಸಿಕ್ಕು ನೆಮ್ಮದಿಯ ವಾತಾವರಣ ಸೃಷ್ಟಿಯಾಗಲಿದೆ.",
        f3: "ಸಣ್ಣ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳನ್ನು ಪ್ರೀತಿ ಹಾಗೂ ತಾಳ್ಮೆಯಿಂದ ಬಗೆಹರಿಸಿ.",
        f4: "ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಕುಟುಂಬ ಸಮೇತ ತೀರ್ಥ ದರ್ಶನ ಮಾಡಿ."
      },
      {
        badge: "🎓 ಬೌದ್ಧಿಕ ಸಿದ್ಧಿ",
        f1: "ಚತುರ್ಥ ಸ್ಥಾನದ ಬಲದಿಂದ ಭೂಮಿ, ಗೃಹ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಅಂತಿಮ ಯಶಸ್ಸು ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ನೂತನ ವಾಹನ ಅಥವಾ ಮೌಲ್ಯಯುತ ಗೃಹೋಪಕರಣಗಳ ಖರೀದಿ ಯೋಗ ಸಿದ್ಧಿಸಲಿದೆ.",
        f2: "ಸ್ಥಿರಾಸ್ತಿಯ ಮೌಲ್ಯ ಹೆಚ್ಚಿ ಕುಟುಂಬದಲ್ಲಿ ಆನಂದ ಉಂಟಾಗಲಿದೆ.",
        f3: "ಆಸ್ತಿ ನೋಂದಣಿ ಪತ್ರಗಳನ್ನು ಕೂಲಂಕಷವಾಗಿ ಪರಿಶೀಲಿಸಿ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಿ.",
        f4: "ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ, ಬಡವರಿಗೆ ಅನ್ನದಾನ ಮಾಡಿ."
      },
      {
        badge: "👑 ರಾಜಯೋಗ ಬಲ",
        f1: "ಶನಿ-ಬುಧ ಭುಕ್ತಿ ಸಂಧಿಯ ಕಾಲ; ಹೊಸ ಯೋಜನೆಗಳಿಗೆ ಸೂಕ್ತ ಪೂರ್ವ ತಯಾರಿ ಹಾಗೂ ವಿವೇಕ ಅಗತ್ಯ. ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತಪ್ಪಿಸಿ ತಾಳ್ಮೆಯಿಂದ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿ.",
        f2: "ಉದ್ಯೋಗ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸ್ಥಿರತೆ ಕಾಯ್ದುಕೊಳ್ಳಲು ಸಂಯಮ ಅತ್ಯಗತ್ಯ.",
        f3: "ಮಾನಸಿಕ ಚಾಂಚಲ್ಯ ಹಾಗೂ ಸಣ್ಣ ವೈಚಾರಿಕ್ ಗೊಂದಲ ಎದುರಾಗಬಹುದು.",
        f4: "ಬುಧವಾರ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ, ಹಸಿರು ಬೇಳೆ ದಾನ ಮಾಡಿ."
      },
      {
        badge: "🛡️ ಆರೋಗ್ಯ ರಕ್ಷಣೆ",
        f1: "ಬುಧ ಅಂತರ್ದಶೆಯ ಪೂರ್ಣ ಶುಭಾರಂಭದಿಂದ ಬೌದ್ಧಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ವಾಗ್ಬಲ ವೃದ್ಧಿಯಾಗಲಿದೆ. ನೂತನ ಉದ್ಯೋಗ ಪ್ರಮೋಷನ್, ಸಂಬಳ ಏರಿಕೆ ಹಾಗೂ ವ್ಯಾಪಾರ ಶ್ರೇಯಸ್ಸು ದೊರೆಯಲಿದೆ.",
        f2: "ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಯಕ್ಕೆ ಪೂರ್ಣ ಮಾನ್ಯತೆ ದೊರೆಯಲಿದೆ.",
        f3: "ಅತಿಯಾದ ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಸಣ್ಣ ಸಣ್ಣ ತಪ್ಪುಗಳು ಸಂಭವಿಸದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.",
        f4: "ನಿತ್ಯ ಪ್ರಾಣಾಯಾಮ ಹಾಗೂ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ."
      },
      {
        badge: "🕊️ ದೈವಿಕ ಶಾಂತಿ",
        f1: "ಪಂಚಮ ಭಾವ ಬಲದಿಂದ ವಿದ್ಯಾ ಕ್ಷೇತ್ರ, ನೂತನ ಕೌಶಲ್ಯ ಕಲಿಕೆ ಹಾಗೂ ಸಂಶೋಧನೆಗಳಲ್ಲಿ ಅತ್ಯುನ್ನತ ಸಿದ್ಧಿ. ದೈವಿಕ ಚಿಂತನೆ ಹಾಗೂ ಆಂತರಿಕ ಪ್ರಶಾಂತತೆ ಅಪಾರವಾಗಿ ವೃದ್ಧಿಯಾಗಲಿದೆ.",
        f2: "ಮಾನಸಿಕ ನಿಖರತೆ ಹೆಚ್ಚಿ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳು ಯಶಸ್ವಿಯಾಗಲಿವೆ.",
        f3: "ಸಮಯ ವ್ಯರ್ಥ ಮಾಡುವ ಕೆಲಸಗಳಿಂದ ದೂರವಿರಿ.",
        f4: "ಶ್ರೀ ಸರಸ್ವತಿ ಸ್ತೋತ್ರ ಪಠಿಸಿ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪುಸ್ತಕ ದಾನ ಮಾಡಿ."
      },
      {
        badge: "🌟 ಸರ್ವ ಸಿದ್ಧಿ",
        f1: "ಷಷ್ಠ ಸ್ಥಾನ ಶಮನ ಬಲದಿಂದ ಶತ್ರು ಭಯ ನಿವಾರಣೆ, ಸಾಲ ಬಾಧೆಗಳ ಶಮನ ಹಾಗೂ ಕಾನೂನು ವಿಷಯಗಳಲ್ಲಿ ಯಶಸ್ಸು. ಸಕಲ ಕಾಯಕ ಪ್ರಯತ್ನಗಳಲ್ಲೂ ದೈವಿಕ ರಕ್ಷಣೆ ಸದಾ ದೊರೆಯಲಿದೆ.",
        f2: "ಬಾಕಿ ಉಳಿದಿದ್ದ ಸಾಲಗಳ ಮರುಪಾವತಿ ಸುಲಭವಾಗಿ ಸಾಧ್ಯವಾಗಲಿದೆ.",
        f3: "ಆರೋಗ್ಯದಲ್ಲಿ ಸಣ್ಣ ಹವಾಮಾನ ಏರುಪೇರುಗಳನ್ನು ಗಮನಿಸಿ.",
        f4: "ಪ್ರತಿ ಮಂಗಳವಾರ ಶ್ರೀ ದುರ್ಗಾ ಚಾಲೀಸಾ ಪಠಿಸಿ ಹಾಗೂ ದೀಪಾರಾಧನೆ ಮಾಡಿ."
      }
    ];

    const themesEn = [
      {
        badge: "💼 Career Advancement",
        f1: "Influenced by Jupiter and the Lagna Lord, new high-level professional opportunities open up. Executive leadership will recognize and honor your dedication.",
        f2: "Professional support enhances financial status and monetary stability.",
        f3: "High workload may cause fatigue; prioritize rest.",
        f4: "Offer Arghya to Sun God and perform Surya Namaskar."
      },
      {
        badge: "💰 Wealth Growth",
        f1: "Strong 2nd house alignment brings 20%+ financial growth and profitable investments. Pending dues will be successfully recovered.",
        f2: "Smooth cash flow consolidates overall economic security.",
        f3: "Control unnecessary expenditure; maintain financial discipline.",
        f4: "Perform Sri Lakshmi Puja on Fridays and recite Kanakadhara Stotram."
      },
      {
        badge: "🏠 Family Joy",
        f1: "Auspicious family functions and gatherings with relatives will take place. Domestic life will be filled with mutual trust and harmony.",
        f2: "Support from all family members creates a peaceful environment.",
        f3: "Resolve minor differences with patience and affection.",
        f4: "Pray to Kuladevata and visit sacred pilgrimage sites."
      },
      {
        badge: "🎓 Wisdom & Success",
        f1: "Fourth house strength favors real estate, land, and vehicle purchases. High-value domestic appliances or property deals will be finalized.",
        f2: "Property values increase, bringing joy to family.",
        f3: "Thoroughly inspect property registration documents.",
        f4: "Recite Sri Hanuman Chalisa on Saturdays and offer food to the needy."
      },
      {
        badge: "👑 Raja Yoga Power",
        f1: "Saturn-Mercury Bhukti Sandhi period requires careful planning for new initiatives. Avoid impulsive financial decisions.",
        f2: "Patience and restraint are essential for career stability.",
        f3: "Minor mental restlessness or dilemma may arise.",
        f4: "Recite Sri Vishnu Sahasranamam on Wednesdays."
      },
      {
        badge: "🛡️ Health & Protection",
        f1: "Onset of Mercury Antardasha enhances intellectual sharpness and communication skills. Promotions and business growth are highly indicated.",
        f2: "Your work receives full appreciation in your organization.",
        f3: "Avoid overconfidence to prevent minor errors.",
        f4: "Practice daily Pranayama and pray to Lord Subrahmanya."
      },
      {
        badge: "🕊️ Divine Peace",
        f1: "Fifth house strength grants high achievement in education, new skill learning, and analytical endeavors. Inner spiritual clarity increases.",
        f2: "Mental clarity leads to successful decision making.",
        f3: "Avoid unproductive tasks and time wastage.",
        f4: "Recite Sri Saraswati Stotram and donate books to students."
      },
      {
        badge: "🌟 Total Victory",
        f1: "Sixth house balancing neutralizes obstacles, resolves debts, and brings favorable outcomes in legal matters. Divine grace protects all efforts.",
        f2: "Repayment of pending loans will be accomplished.",
        f3: "Take care of minor health shifts due to weather.",
        f4: "Recite Sri Durga Chalisa on Tuesdays."
      }
    ];

    return Array.from({ length: 8 }, (_, i) => {
      const mIdx = (curMonthIdx + i) % 12;
      const yr = curYear + Math.floor((curMonthIdx + i) / 12);
      const mName = isKn ? monthsKn[mIdx] : monthsEn[mIdx];
      const mTitle = isKn ? `${knOrdinals[i]} (${mName} ${toKnDigits(yr)})` : `Month ${i + 1} (${mName} ${yr})`;
      const theme = isKn ? themesKn[i % 8] : themesEn[i % 8];

      return {
        mTitle,
        badge: theme.badge,
        f1: theme.f1,
        f2: theme.f2,
        f3: theme.f3,
        f4: theme.f4
      };
    });
  }, [birthKundli, code]);

'''

if s_p6_idx != -1 and e_p6_idx != -1:
    content = content[:s_p6_idx] + new_p6_code + content[e_p6_idx:]
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated Page 6 ordinals and 2-line Phalaphala successfully.")
