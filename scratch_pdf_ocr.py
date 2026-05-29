import pypdf
import pytesseract
from PIL import Image
import io

reader = pypdf.PdfReader('/Users/shreesuma/Downloads/Baggona Panchanaga Details.pdf')
print('Total pages:', len(reader.pages))

# Let's run OCR on the first 10 pages and search for text
for page_num in range(min(10, len(reader.pages))):
    page = reader.pages[page_num]
    print(f'=== Page {page_num+1} ===')
    
    # Try to extract text first (in case some pages have text)
    text = page.extract_text()
    if text and text.strip():
        print('[Text Extracted]:')
        print(text[:500])
        continue
        
    # If no text, try to extract images and OCR them
    images_found = 0
    for count, image_file_object in enumerate(page.images):
        images_found += 1
        image_data = image_file_object.data
        img = Image.open(io.BytesIO(image_data))
        ocr_text = pytesseract.image_to_string(img)
        print(f'[OCR Image {count+1}]:')
        print(ocr_text[:500])
        
    if images_found == 0:
        print('No text and no images found on this page.')
