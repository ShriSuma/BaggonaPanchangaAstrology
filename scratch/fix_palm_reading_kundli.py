with open('src/pages/PalmReadingPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_func = '''  const handleCalculateKundliAndAttach = () => {
    if (!birthDatePicker) {
      alert(isKn ? "ದಯವಿಟ್ಟು ಜನನ ದಿನಾಂಕ ಆಯ್ಕೆ ಮಾಡಿ" : "Please select birth date");
      return;
    }
    const y = birthDatePicker.getFullYear();
    const m = String(birthDatePicker.getMonth() + 1).padStart(2, "0");
    const d = String(birthDatePicker.getDate()).padStart(2, "0");
    const dobStr = `${y}-${m}-${d}`;

    const [hrsStr, minsStr] = birthTimeHm.split(":");
    const hrs = parseInt(hrsStr || "12", 10);
    const mins = parseInt(minsStr || "0", 10);
    const birthTimeDecimal = hrs + mins / 60;

    const lat = selectedLoc.lat || defaultLat;
    const lng = selectedLoc.lng || defaultLng;

    const kundli = calculateKundliWithPlaceSun({
      name: devoteeName || "Devotee",
      gender: "male",
      birthDate: dobStr,
      birthTime: birthTimeDecimal,
      lat,
      lng,
      pincode: selectedLoc.pincode,
      ayanamsaModel
    });

    const traditional = calculateTraditionalBaggona(
      dobStr,
      birthTimeDecimal,
      lat,
      lng,
      selectedLoc.pincode,
      ayanamsaModel
    );

    const lagnaPlanet = kundli.planets.find((p: PlanetPosition) => p.name === "Lagna");
    const lagnaAmsha = lagnaPlanet ? formatRashiAmsha(lagnaPlanet.longitude, selectedLang) : "ಮೇಷ";
    const rashiAmsha = formatRashiAmsha(kundli.moonLongitude, selectedLang);
    const nakshatraName = kundli.panchanga.nakshatra;
    const maandiRashi = formatRashiAmsha(kundli.upagrahas.maandi.longitude, selectedLang);
    const dashaLord = traditional.currentDasha?.lord || "ಬುಧ";

    const attached: PalmReadingResult["kundliData"] = {
      lagna: lagnaAmsha,
      rashi: rashiAmsha,
      nakshatra: nakshatraName,
      maandi: maandiRashi,
      dasha: dashaLord,
      gotra: gotraInput,
      dob: dobStr,
      tob: birthTimeHm,
      kundliOutput: kundli
    };

    setGeneratedKundliData(attached);
    setShowKundliModal(false);
  };'''

new_func = '''  const handleCalculateKundliAndAttach = async () => {
    if (!birthDatePicker) {
      alert(isKn ? "ದಯವಿಟ್ಟು ಜನನ ದಿನಾಂಕ ಆಯ್ಕೆ ಮಾಡಿ" : "Please select birth date");
      return;
    }
    const y = birthDatePicker.getFullYear();
    const m = String(birthDatePicker.getMonth() + 1).padStart(2, "0");
    const d = String(birthDatePicker.getDate()).padStart(2, "0");
    const dobStr = `${y}-${m}-${d}`;

    const lat = selectedLoc.lat || defaultLat;
    const lng = selectedLoc.lng || defaultLng;

    const kundli = await calculateKundliWithPlaceSun({
      name: devoteeName || "Devotee",
      gender: "Male",
      birthDate: dobStr,
      birthTime: birthTimeHm,
      lat,
      lng,
      pincode: selectedLoc.pincode,
      ayanamsaModel
    });

    const traditional = calculateTraditionalBaggona(
      dobStr,
      birthTimeHm,
      lat,
      lng,
      selectedLoc.pincode,
      ayanamsaModel
    );

    const lagnaAmsha = formatRashiAmsha(kundli.ascendant, selectedLang);
    const rashiAmsha = String(kundli.moonSign || "ಮೇಷ");
    const nakshatraName = isKn ? traditional.moonNakshatraKn : traditional.moonNakshatra;
    const maandiRashi = String(kundli.maandi?.rashi || "ಧನಸ್ಸು");
    const dashaLord = "ಬುಧ";

    const attached: PalmReadingResult["kundliData"] = {
      lagna: lagnaAmsha,
      rashi: rashiAmsha,
      nakshatra: nakshatraName,
      maandi: maandiRashi,
      dasha: dashaLord,
      gotra: gotraInput,
      dob: dobStr,
      tob: birthTimeHm,
      kundliOutput: kundli
    };

    setGeneratedKundliData(attached);
    setShowKundliModal(false);
  };'''

old_loc = '''<LocationSelector selected={selectedLoc} onSelect={setSelectedLoc} />'''
new_loc = '''<LocationSelector onChange={(loc) => setSelectedLoc(loc)} />'''

if old_func in content and old_loc in content:
    content = content.replace(old_func, new_func, 1)
    content = content.replace(old_loc, new_loc, 1)
    with open('src/pages/PalmReadingPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("MATCH FAILED")
