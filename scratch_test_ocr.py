import os
import pytesseract
from PIL import Image

# Set tesseract path if needed, e.g. for Homebrew on Apple Silicon:
# pytesseract.pytesseract.tesseract_cmd = '/opt/homebrew/bin/tesseract'

download_dir = '/Users/shreesuma/Downloads/drive-download-20260527T052030Z-3-001'

# List files
files = sorted([f for f in os.listdir(download_dir) if f.lower().endswith('.jpg')])

for f in files:
    path = os.path.join(download_dir, f)
    print(f'=== OCR for {f} ===')
    try:
        text = pytesseract.image_to_string(Image.open(path))
        print(text)
    except Exception as e:
        print('Error:', e)
