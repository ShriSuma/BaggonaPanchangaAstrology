filepath1 = "src/services/translationService.ts"

with open(filepath1, "r", encoding="utf-8") as f:
    content1 = f.read()

# Replace throw new TranslationError in callTranslateApi with silent fallback to original texts
old_throw_code = '''  if (!res.ok) {
    throw new TranslationError(raw || res.statusText, res.status);
  }'''

new_throw_code = '''  if (!res.ok) {
    console.warn(`Translation API rate limited or offline (${res.status}): ${raw || res.statusText} — using local fallback.`);
    return texts; // Silent fallback to original texts to prevent HTTP 429 popups
  }'''

if old_throw_code in content1:
    content1 = content1.replace(old_throw_code, new_throw_code)

old_parse_err = '''  } catch {
    throw new TranslationError("Translation API returned invalid JSON", res.status);
  }
  const translations = (parsed as { translations?: unknown }).translations;
  if (!Array.isArray(translations) || translations.length !== texts.length) {
    throw new TranslationError("Translation API response shape mismatch", res.status);
  }'''

new_parse_err = '''  } catch {
    console.warn("Translation API returned invalid JSON — using local fallback.");
    return texts;
  }
  const translations = (parsed as { translations?: unknown }).translations;
  if (!Array.isArray(translations) || translations.length !== texts.length) {
    console.warn("Translation API response shape mismatch — using local fallback.");
    return texts;
  }'''

if old_parse_err in content1:
    content1 = content1.replace(old_parse_err, new_parse_err)

with open(filepath1, "w", encoding="utf-8") as f:
    f.write(content1)

print("Updated translationService.ts with graceful 429 fallback successfully.")
