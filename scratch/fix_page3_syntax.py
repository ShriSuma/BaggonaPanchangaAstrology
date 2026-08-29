filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

bad_closing = '''            ))}
          </div>
        </div>
      </div>

          {/* Footer Banner */}'''

good_closing = '''            ))}
          </div>

          {/* Footer Banner */}'''

if bad_closing in content:
    content = content.replace(bad_closing, good_closing)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed Page 3 syntax closing tags successfully.")
