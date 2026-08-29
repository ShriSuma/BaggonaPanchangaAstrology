filepath = "src/pages/PalmReadingPage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add states for sidePhoto and backPhoto
old_photo_states = '  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);'
new_photo_states = '''  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null); // Front Palm
  const [sideImageDataUrl, setSideImageDataUrl] = useState<string | null>(null); // Side Palm
  const [backImageDataUrl, setBackImageDataUrl] = useState<string | null>(null); // Back Hand'''

content = content.replace(old_photo_states, new_photo_states)

# Replace file upload handler with multi-slot handlers
multi_upload_handlers = '''
  const handleFileUploadForSlot = (file: File, slot: "front" | "side" | "back") => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        if (slot === "front") setImageDataUrl(reader.result);
        if (slot === "side") setSideImageDataUrl(reader.result);
        if (slot === "back") setBackImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };
'''

content = content.replace('  const handleFileUpload = (file: File) => {', multi_upload_handlers + '\n  const handleFileUpload = (file: File) => {')

# Update handleSubmitPalmReading to pass side & back images to executePalmReading
old_exec_call = '      const res = await executePalmReading(imageDataUrl, handSide, devoteeName || "Devotee", selectedLang, activeKey, generatedKundliData);'
new_exec_call = '      const res = await executePalmReading(imageDataUrl, handSide, devoteeName || "Devotee", selectedLang, activeKey, generatedKundliData, sideImageDataUrl || undefined, backImageDataUrl || undefined);'

content = content.replace(old_exec_call, new_exec_call)

# Build 3-Step Gaming-Style Photo Upload UI
old_upload_zone_ui = '''        {/* Multimodal Palm Photo Capture & Upload Guidelines Card */}'''

new_3step_upload_ui = '''        {/* 3-Step Multimodal Guided Photo Capture Pipeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-amber-300/80 pb-2">
            <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
              <span>📸</span>
              <span>{isKn ? "೩೬೦° ಪರಿಪೂರ್ಣ ಹಸ್ತ ವಿಶ್ಲೇಷಣೆಗೆ ೩ ಹಂತದ ಫೋಟೋ ಸಂಗ್ರಹ (3 Mandatory Photo Slots)" : "3-Step Multimodal Palm Photo Upload (Mandatory)"}</span>
            </h4>
            <div className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
              {imageDataUrl && sideImageDataUrl && backImageDataUrl ? "🟢 All 3 Photos Ready" : "🟡 Photos Pending"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Slot 1: Front Palm */}
            <div className={`rounded-2xl p-4 border-2 transition space-y-3 ${imageDataUrl ? "border-emerald-500 bg-emerald-50/50 shadow-md" : "border-amber-300 bg-amber-50/50"}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-950">✋ ೧. ಮುಂಭಾಗದ ಹಸ್ತ (Front)</span>
                {imageDataUrl ? (
                  <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">🟢 Ready</span>
                ) : (
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">Required</span>
                )}
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
                {isKn ? "ಆಯುರ್, ಬುದ್ಧಿ, ಹೃದಯ ಹಾಗೂ ಶನಿ ರೇಖೆಗಳು ಸ್ಪಷ್ಟವಾಗಿ ಕಾಣುವಂತೆ ಮುಂಭಾಗದ ಹಸ್ತ ಹಿಡಿಯಿರಿ." : "Hold palm flat under bright light for major lines."}
              </p>
              {imageDataUrl ? (
                <div className="relative group">
                  <img src={imageDataUrl} alt="Front Palm" className="w-full h-32 object-cover rounded-xl border border-emerald-500 shadow-sm" />
                  <button type="button" onClick={() => setImageDataUrl(null)} className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer rounded-xl border border-amber-400 bg-white hover:bg-amber-100 text-center py-2 text-xs font-bold text-amber-950 shadow-sm">
                    📁 Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUploadForSlot(e.target.files[0], "front")} />
                  </label>
                </div>
              )}
            </div>

            {/* Slot 2: Side View */}
            <div className={`rounded-2xl p-4 border-2 transition space-y-3 ${sideImageDataUrl ? "border-emerald-500 bg-emerald-50/50 shadow-md" : "border-amber-300 bg-amber-50/50"}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-950">📐 ೨. ಪಾರ್ಶ್ವ ಹಸ್ತ (Side)</span>
                {sideImageDataUrl ? (
                  <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">🟢 Ready</span>
                ) : (
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">Required</span>
                )}
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
                {isKn ? "ಬುಧ ಪರ್ವತದ ಪಕ್ಕದ ವಿವಾಹ ಹಾಗೂ ಸಂತಾನ ರೇಖೆಗಳು ಕಾಣಲು ಹಸ್ತದ ಪಾರ್ಶ್ವ ಫೋಟೋ ಹಿಡಿಯಿರಿ." : "Side view captures marriage and children lines near Mercury mount."}
              </p>
              {sideImageDataUrl ? (
                <div className="relative group">
                  <img src={sideImageDataUrl} alt="Side Palm" className="w-full h-32 object-cover rounded-xl border border-emerald-500 shadow-sm" />
                  <button type="button" onClick={() => setSideImageDataUrl(null)} className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer rounded-xl border border-amber-400 bg-white hover:bg-amber-100 text-center py-2 text-xs font-bold text-amber-950 shadow-sm">
                    📁 Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUploadForSlot(e.target.files[0], "side")} />
                  </label>
                </div>
              )}
            </div>

            {/* Slot 3: Back Hand */}
            <div className={`rounded-2xl p-4 border-2 transition space-y-3 ${backImageDataUrl ? "border-emerald-500 bg-emerald-50/50 shadow-md" : "border-amber-300 bg-amber-50/50"}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-950">💅 ೩. ಹಸ್ತದ ಹಿಂಭಾಗ (Back)</span>
                {backImageDataUrl ? (
                  <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">🟢 Ready</span>
                ) : (
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">Required</span>
                )}
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
                {isKn ? "ಬೆರಳುಗಳ ಆಕಾರ ಹಾಗೂ ನಖಗಳಿಂದ ಜಾತಕರ ಮಾನಸಿಕ ಸ್ವಭಾವ ಪರೀಕ್ಷಿಸಲು ಹಿಂಭಾಗದ ಫೋಟೋ ಹಿಡಿಯಿರಿ." : "Back of hand captures finger shape & nails for temperament."}
              </p>
              {backImageDataUrl ? (
                <div className="relative group">
                  <img src={backImageDataUrl} alt="Back Hand" className="w-full h-32 object-cover rounded-xl border border-emerald-500 shadow-sm" />
                  <button type="button" onClick={() => setBackImageDataUrl(null)} className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer rounded-xl border border-amber-400 bg-white hover:bg-amber-100 text-center py-2 text-xs font-bold text-amber-950 shadow-sm">
                    📁 Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUploadForSlot(e.target.files[0], "back")} />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
'''

content = content.replace(old_upload_zone_ui, new_3step_upload_ui)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Upgraded PalmReadingPage.tsx with 3-Step Gaming-Style Photo Upload Pipeline.")
