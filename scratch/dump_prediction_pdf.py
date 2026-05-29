import pypdf
import pytesseract
from PIL import Image
import io
import sys
import os

pdf_path = '/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/AboutPanchanga/BaggonaPanchangaPardiction.pdf'
output_path = '/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/scratch/BaggonaPanchangaPardiction_dump.txt'

os.makedirs(os.path.dirname(output_path), exist_ok=True)

if not os.path.exists(pdf_path):
    print(f"Error: PDF path not found at {pdf_path}")
    sys.exit(1)

reader = pypdf.PdfReader(pdf_path)
print('Total pages:', len(reader.pages))

with open(output_path, 'w', encoding='utf-8') as f:
    for page_num in range(len(reader.pages)):
        f.write(f'\n\n=== PAGE {page_num+1} ===\n')
        page = reader.pages[page_num]
        
        # Try digital text extraction
        text = page.extract_text()
        if text and text.strip():
            f.write(text)
            print(f'Page {page_num+1}: Extracted digital text.')
            continue
            
        # Try OCR
        ocr_texts = []
        for img_idx, img_obj in enumerate(page.images):
            try:
                img_data = img_obj.data
                img = Image.open(io.BytesIO(img_data))
                ocr_text = pytesseract.image_to_string(img)
                ocr_texts.append(ocr_text)
            except Exception as e:
                ocr_texts.append(f'[Error OCRing image {img_idx+1}: {e}]')
        
        if ocr_texts:
            f.write('\n'.join(ocr_texts))
            print(f'Page {page_num+1}: Extracted OCR text.')
        else:
            f.write('[No text or images found]')
            print(f'Page {page_num+1}: No content.')

print("Finished dumping PDF to", output_path)
