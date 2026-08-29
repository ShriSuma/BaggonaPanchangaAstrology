import subprocess

# Run git show e496b8c:src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx
cmd = "git show e496b8c:src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"
out = subprocess.check_output(cmd, shell=True).decode("utf-8")

# Find PAGE 4 start and PAGE 7 start
p4_start = out.find("{/* ─────────────────────────────────────────────────────────────\n          PAGE 4:")
p7_start = out.find("{/* ─────────────────────────────────────────────────────────────\n          PAGE 7:")

print(f"p4_start: {p4_start}, p7_start: {p7_start}")

if p4_start != -1 and p7_start != -1:
    p456_block = out[p4_start:p7_start]
    with open("scratch/exact_e496b8c_pages456.tsx", "w", encoding="utf-8") as f:
        f.write(p456_block)
    print("Saved exact e496b8c Pages 4, 5, 6 to scratch/exact_e496b8c_pages456.tsx")
