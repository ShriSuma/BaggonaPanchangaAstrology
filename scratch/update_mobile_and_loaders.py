import re

# Update SankhyaShastraPage.tsx
sankhya_file = "src/pages/SankhyaShastraPage.tsx"
with open(sankhya_file, "r", encoding="utf-8") as f:
    content = f.read()

# Add import if not present
if "SankhyaNumerologyLoader" not in content:
    content = content.replace(
        'import { SankhyaShastraPdfTemplate } from "../components/sankhyashastra/SankhyaShastraPdfTemplate";',
        'import { SankhyaShastraPdfTemplate } from "../components/sankhyashastra/SankhyaShastraPdfTemplate";\nimport { SankhyaNumerologyLoader } from "../components/sankhyashastra/SankhyaNumerologyLoader";'
    )

# Inject loader component inside form or main layout when isProcessing is true
loader_snippet = '''
      {/* Animated Numerology Loader during processing */}
      {isProcessing && (
        <div className="my-6 flex justify-center">
          <SankhyaNumerologyLoader isKn={isKn} />
        </div>
      )}
'''

if "{isProcessing && (" not in content:
    content = content.replace(
        '{/* AI Generative Chatbox Timeline & Priest Reading View */}',
        loader_snippet + '\n      {/* AI Generative Chatbox Timeline & Priest Reading View */}'
    )

with open(sankhya_file, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated SankhyaShastraPage.tsx with SankhyaNumerologyLoader.")

# Update PalmReadingPage.tsx
palm_file = "src/pages/PalmReadingPage.tsx"
with open(palm_file, "r", encoding="utf-8") as f:
    palm_content = f.read()

# Add import if not present
if "PalmScannerLoader" not in palm_content:
    palm_content = palm_content.replace(
        'import { PalmReadingPdfTemplate } from "../components/palmreading/PalmReadingPdfTemplate";',
        'import { PalmReadingPdfTemplate } from "../components/palmreading/PalmReadingPdfTemplate";\nimport { PalmScannerLoader } from "../components/palmreading/PalmScannerLoader";'
    )

# Inject loader component inside main layout when isProcessing is true
palm_loader_snippet = '''
      {/* Animated Palm Scanner Loader during processing */}
      {isProcessing && (
        <div className="my-6 flex justify-center">
          <PalmScannerLoader isKn={isKn} />
        </div>
      )}
'''

if "{isProcessing && (" not in palm_content:
    palm_content = palm_content.replace(
        '{/* AI Generative Chatbox Timeline & Priest Reading View */}',
        palm_loader_snippet + '\n      {/* AI Generative Chatbox Timeline & Priest Reading View */}'
    )

with open(palm_file, "w", encoding="utf-8") as f:
    f.write(palm_content)

print("Updated PalmReadingPage.tsx with PalmScannerLoader.")
