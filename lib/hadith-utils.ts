/**
 * Hadith text parsing utilities.
 * Ported from v0-authentic-hadith for React Native.
 *
 * The english_translation field in the v0 DB may be:
 * - Plain text: "The Prophet said..."
 * - JSON string: '{"narrator":"Anas:","text":"The Prophet said..."}'
 *
 * The mobile DB uses `english_text` which is typically plain text,
 * but we keep these utilities for when both schemas coexist.
 */

export function parseEnglishTranslation(raw: string | null | undefined): {
  narrator: string;
  text: string;
} {
  if (!raw) return { narrator: "", text: "" };

  if (raw.startsWith("{") && raw.includes('"text"')) {
    try {
      const parsed = JSON.parse(raw);
      const narrator = (parsed.narrator || "")
        .replace(/^Narrated\s+/i, "")
        .replace(/:$/, "")
        .trim();
      const text = (parsed.text || "")
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .trim();
      return { narrator, text };
    } catch {
      // fall through
    }
  }

  const narratorMatch = raw.match(/^Narrated\s+([^:]+):\s*(.*)$/s);
  if (narratorMatch) {
    return {
      narrator: narratorMatch[1].trim(),
      text: narratorMatch[2].trim(),
    };
  }

  return { narrator: "", text: raw };
}

export function getCleanTranslation(raw: string | null | undefined): string {
  const { narrator, text } = parseEnglishTranslation(raw);
  if (narrator && text) return `Narrated ${narrator}: ${text}`;
  return text || raw || "";
}

/** Map collection slug → human-readable name */
const COLLECTION_NAMES: Record<string, string> = {
  "sahih-bukhari": "Sahih al-Bukhari",
  "sahih-muslim": "Sahih Muslim",
  "sunan-abu-dawud": "Sunan Abu Dawud",
  "jami-tirmidhi": "Jami at-Tirmidhi",
  "sunan-nasai": "Sunan an-Nasai",
  "sunan-ibn-majah": "Sunan Ibn Majah",
  "muwatta-malik": "Muwatta Malik",
  "musnad-ahmad": "Musnad Ahmad",
};

export function getCollectionDisplayName(slug: string): string {
  return COLLECTION_NAMES[slug] || slug;
}
