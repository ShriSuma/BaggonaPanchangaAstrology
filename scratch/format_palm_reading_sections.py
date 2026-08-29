filepath = "src/pages/PalmReadingPage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Make sure loader isn't wrapped in extra inner div
content = content.replace(
    '''      {/* Full-Screen Centered Animated Palm Scanner Modal Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm">
            <PalmScannerLoader isKn={isKn} />
          </div>
        </div>
      )}''',
    '''      {/* Full-Screen Centered Animated Palm Scanner Modal Overlay */}
      {isProcessing && <PalmScannerLoader isKn={isKn} />}'''
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated PalmReadingPage.tsx for direct full-screen PalmScannerLoader.")
