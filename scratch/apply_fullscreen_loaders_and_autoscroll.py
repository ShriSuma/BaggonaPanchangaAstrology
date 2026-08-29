# Update SankhyaShastraPage.tsx & PalmReadingPage.tsx with full-screen centered loaders and auto-scroll focus

# 1. PalmReadingPage.tsx
palm_path = "src/pages/PalmReadingPage.tsx"
with open(palm_path, "r", encoding="utf-8") as f:
    palm = f.read()

# Replace inline loader with fixed full-screen centered modal overlay
old_palm_loader = '''      {/* Animated Palm Scanner Loader during processing */}
      {isProcessing && (
        <div className="my-6 flex justify-center">
          <PalmScannerLoader isKn={isKn} />
        </div>
      )}'''

new_palm_loader = '''      {/* Full-Screen Centered Animated Palm Scanner Modal Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm">
            <PalmScannerLoader isKn={isKn} />
          </div>
        </div>
      )}'''

if old_palm_loader in palm:
    palm = palm.replace(old_palm_loader, new_palm_loader)

# Ensure auto-scroll focuses cleanly on response
palm = palm.replace(
    'useEffect(() => {\n    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });\n  }, [messages]);',
    'useEffect(() => {\n    if (messages.length > 0) {\n      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });\n    }\n  }, [messages]);'
)

with open(palm_path, "w", encoding="utf-8") as f:
    f.write(palm)

print("Updated PalmReadingPage.tsx with full-screen centered modal loader & smooth auto-scroll.")

# 2. SankhyaShastraPage.tsx
sankhya_path = "src/pages/SankhyaShastraPage.tsx"
with open(sankhya_path, "r", encoding="utf-8") as f:
    sankhya = f.read()

# Replace inline loader with fixed full-screen centered modal overlay
old_sankhya_loader = '''      {/* Animated Numerology Loader during processing */}
      {isProcessing && (
        <div className="my-6 flex justify-center">
          <SankhyaNumerologyLoader isKn={isKn} />
        </div>
      )}'''

new_sankhya_loader = '''      {/* Full-Screen Centered Animated Numerology Modal Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm">
            <SankhyaNumerologyLoader isKn={isKn} />
          </div>
        </div>
      )}'''

if old_sankhya_loader in sankhya:
    sankhya = sankhya.replace(old_sankhya_loader, new_sankhya_loader)

# Ensure auto-scroll focuses cleanly on response
sankhya = sankhya.replace(
    'useEffect(() => {\n    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });\n  }, [messages]);',
    'useEffect(() => {\n    if (messages.length > 0) {\n      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });\n    }\n  }, [messages]);'
)

with open(sankhya_path, "w", encoding="utf-8") as f:
    f.write(sankhya)

print("Updated SankhyaShastraPage.tsx with full-screen centered modal loader & smooth auto-scroll.")
