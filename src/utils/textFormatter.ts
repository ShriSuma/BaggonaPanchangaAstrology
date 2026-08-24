/**
 * Utility to sanitize and format AI generated narratives cleanly.
 * Removes raw markdown syntax (*, **, ###, [], {}) and formats clean paragraphs.
 */
export function sanitizeAIText(text: string): string {
  if (!text) return "";

  return text
    // Remove markdown bold / italic symbols like **, *, __, _
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/__/g, "")
    .replace(/_/g, "")
    // Remove markdown headers like ###, ##, #
    .replace(/^#+\s*/gm, "")
    // Remove raw brackets [ ] and braces { }
    .replace(/\[\s*/g, "")
    .replace(/\s*\]/g, "")
    .replace(/\{\s*/g, "")
    .replace(/\s*\}/g, "")
    // Clean multiple blank lines into standard double linebreaks
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
