filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "{/* ─────────────────────────────────────────────────────────────\n          PAGE 4:"
end_marker = "{/* ─────────────────────────────────────────────────────────────\n          PAGE 7: ROYAL 90-DAY CALENDAR SYNC"

s_idx = content.find(start_marker)
e_idx = content.find(end_marker)

print(f"s_idx: {s_idx}, e_idx: {e_idx}")

if s_idx != -1 and e_idx != -1:
    with open("scratch/restored_pages_456_block.txt", "r", encoding="utf-8") as f_block:
        block_content = f_block.read()
    
    new_content = content[:s_idx] + block_content + "\n\n      " + content[e_idx:]
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Replaced Pages 4, 5, 6 with exact restored block successfully.")
