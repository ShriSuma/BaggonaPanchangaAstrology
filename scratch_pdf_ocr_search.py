import pypdf
import pytesseract
from PIL import Image
import io

reader = pypdf.PdfReader('/Users/shreesuma/Downloads/Baggona Panchanaga Details.pdf')
print('Total pages:', len(reader.pages))

keywords = ['visha', 'amritha', 'amrita', 'ghati', 'vighati', 'sankranti', 'karana', 'gatadina', 'gati', 'vigati']

for page_num in range(len(reader.pages)):
    page = reader.pages[page_num]
    
    # Extract images and OCR them
    text_content = []
    for count, image_file_object in enumerate(page.images):
        image_data = image_file_object.data
        img = Image.open(io.BytesIO(image_data))
        ocr_text = pytesseract.image_to_string(img)
        text_content.append(ocr_text)
        
    page_text = '\n'.join(text_content).lower()
    
    # Check if any keyword matches
    matches = [kw for kw in keywords if kw in page_text]
    if matches:
        print(f'=== Matches found on Page {page_num+1} (Keywords: {matches}) ===')
        # Print a portion of the text around the match
        lines = page_text.splitlines()
        for line in lines:
            if any(kw in line for kw in matches):
                print('  ', line)
