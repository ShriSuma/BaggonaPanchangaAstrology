import os

files_to_update = [
    'src/features/facereading/faceReadingEngine.ts',
    'src/features/facereading/faceValidator.ts',
    'src/features/palmreading/palmReadingEngine.ts',
    'src/features/palmreading/palmValidator.ts'
]

for fpath in files_to_update:
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace('model: "gemini-2.5-flash"', 'model: "gemini-3.5-flash-lite"')
        content = content.replace('model: "gemini-2.5-flash-lite"', 'model: "gemini-3.5-flash-lite"')
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {fpath}")
