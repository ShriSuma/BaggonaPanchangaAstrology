filepath = "src/pages/PalmReadingPage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

if "PalmTimelineDiagram" not in content:
    content = content.replace(
        'import { PalmReadingPdfTemplate } from "../components/palmreading/PalmReadingPdfTemplate";',
        'import { PalmReadingPdfTemplate } from "../components/palmreading/PalmReadingPdfTemplate";\nimport { PalmTimelineDiagram } from "../components/palmreading/PalmTimelineDiagram";'
    )

timeline_ui = '''
          {/* Visual Life Event Timeline Diagram Component */}
          {activeResult && (
            <PalmTimelineDiagram
              personName={devoteeName}
              lang={selectedLang}
              handSide={activeResult.handSide}
            />
          )}
'''

if "Visual Life Event Timeline Diagram Component" not in content:
    content = content.replace('{/* AI Generative Chatbox Timeline & Priest Reading View */}', timeline_ui + '\n      {/* AI Generative Chatbox Timeline & Priest Reading View */}')

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Integrated PalmTimelineDiagram into PalmReadingPage.tsx.")
