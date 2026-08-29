filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Extract dashaCardsData definition
dashacards_start = "  const dashaCardsData = React.useMemo(() => {"
dashacards_end = "  }, [birthKundli, dobStr, code]);"

d_start_idx = content.find(dashacards_start)
d_end_idx = content.find(dashacards_end, d_start_idx) + len(dashacards_end)

if d_start_idx != -1 and d_end_idx != -1:
    dashacards_code = content[d_start_idx:d_end_idx]
    # Remove it from current location
    content_without_dashacards = content[:d_start_idx] + content[d_end_idx:]
    
    # Insert it right before "  // ─── DYNAMIC PAGE 4 DATA"
    target_anchor = "  // ─── DYNAMIC PAGE 4 DATA"
    t_idx = content_without_dashacards.find(target_anchor)
    if t_idx != -1:
        new_content = content_without_dashacards[:t_idx] + dashacards_code + "\n\n" + content_without_dashacards[t_idx:]
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Placed dashaCardsData before page4Data & page5Data successfully.")
    else:
        print("Target anchor not found.")
else:
    print("dashaCardsData block not found.")
