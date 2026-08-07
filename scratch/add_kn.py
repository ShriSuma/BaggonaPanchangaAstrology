import json

file_path = 'src/i18n/locales/kn.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

if "ramanbhavishya" not in data:
    data["ramanbhavishya"] = {}

data["ramanbhavishya"]["ashirvada"] = "ಜ್ಯೋತಿಷಿಯ ಆಶೀರ್ವಾದ"
data["ramanbhavishya"]["loadingInitial"] = "ಬ್ರಹ್ಮಾಂಡದ ಶಕ್ತಿಗಳನ್ನು ಮಾರ್ಗದರ್ಶನವನ್ನಾಗಿ ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ..."
data["ramanbhavishya"]["loadingDeep"] = "ಗ್ರಹಗತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಎಲ್ಲಾ ಜೀವನದ ಹಂತಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..."
data["ramanbhavishya"]["generatingPdf"] = "ನಿಮ್ಮ ಪತ್ರಿಕಾ PDF ಅನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ..."
data["ramanbhavishya"]["generatingPdfSub"] = "ಇದು ಸ್ವಲ್ಪ ಸಮಯ ತೆಗೆದುಕೊಳ್ಳಬಹುದು"

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

file_path = 'src/i18n/locales/en.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

data["ramanbhavishya"]["ashirvada"] = "Astrologer's Blessing"
data["ramanbhavishya"]["loadingInitial"] = "Translating cosmic energies into guidance..."
data["ramanbhavishya"]["loadingDeep"] = "Consulting the stars and analyzing all life stages in one go..."
data["ramanbhavishya"]["generatingPdf"] = "Crafting your Patrika PDF..."
data["ramanbhavishya"]["generatingPdfSub"] = "This may take a few moments"

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

