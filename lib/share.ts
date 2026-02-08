import { Share, Platform } from "react-native";
import { Hadith } from "../components/HadithCard";

/**
 * Format a hadith for plain-text sharing.
 */
export function formatHadithShareText(hadith: Hadith): string {
  const parts: string[] = [];

  // Arabic text first
  if (hadith.arabic_text) {
    parts.push(hadith.arabic_text);
    parts.push(""); // blank line
  }

  // English translation
  if (hadith.english_text) {
    parts.push(hadith.english_text);
    parts.push(""); // blank line
  }

  // Source line
  const source: string[] = [];
  if (hadith.collection_name) source.push(hadith.collection_name);
  if (hadith.reference) source.push(hadith.reference);
  if (hadith.grading) source.push(hadith.grading);
  if (source.length > 0) {
    parts.push(`— ${source.join(" | ")}`);
  }

  // Narrator
  if (hadith.narrator) {
    parts.push(`Narrator: ${hadith.narrator}`);
  }

  // Attribution
  parts.push("");
  parts.push("Shared via Authentic Hadith app");

  // Deep link
  parts.push(`authentichadith://hadith/${hadith.id}`);

  return parts.join("\n");
}

/**
 * Share a hadith using the native share sheet.
 */
export async function shareHadith(hadith: Hadith): Promise<void> {
  const message = formatHadithShareText(hadith);

  const title = hadith.collection_name
    ? `Hadith from ${hadith.collection_name}`
    : "Authentic Hadith";

  try {
    await Share.share(
      Platform.OS === "ios"
        ? { message }
        : { title, message },
      { dialogTitle: title }
    );
  } catch {
    // User cancelled or share failed silently
  }
}

/**
 * Share an invite link to the app.
 */
export async function shareInvite(): Promise<void> {
  const message = [
    "Come learn authentic hadith with me!",
    "",
    "Explore 36,000+ verified narrations from the Prophet Muhammad (peace be upon him) across 8 major collections.",
    "",
    "Shared via Authentic Hadith app",
  ].join("\n");

  try {
    await Share.share(
      Platform.OS === "ios"
        ? { message }
        : { title: "Authentic Hadith", message },
      { dialogTitle: "Invite to Authentic Hadith" }
    );
  } catch {
    // User cancelled
  }
}

export type SharePlatform =
  | "whatsapp"
  | "imessage"
  | "instagram"
  | "copy"
  | "system";
export type ShareFormat = "square" | "story";
