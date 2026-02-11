/**
 * Bookmark / Saved-hadith helpers.
 * Uses a `saved_hadiths` table: { id, user_id, hadith_id, note, folder, created_at }.
 */

import { supabase } from "./supabase";

export const FOLDERS = [
  { id: "all", label: "All Saved" },
  { id: "default", label: "General" },
  { id: "favorites", label: "Favorites" },
  { id: "study", label: "Study Later" },
  { id: "share", label: "To Share" },
] as const;

export async function isHadithSaved(
  userId: string,
  hadithId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("saved_hadiths")
    .select("id")
    .eq("user_id", userId)
    .eq("hadith_id", hadithId)
    .maybeSingle();
  return !!data;
}

export async function toggleSaveHadith(
  userId: string,
  hadithId: string
): Promise<boolean> {
  const saved = await isHadithSaved(userId, hadithId);
  if (saved) {
    await supabase
      .from("saved_hadiths")
      .delete()
      .eq("user_id", userId)
      .eq("hadith_id", hadithId);
    return false;
  }
  await supabase
    .from("saved_hadiths")
    .insert({ user_id: userId, hadith_id: hadithId });
  return true;
}

export async function updateNote(savedId: string, note: string | null) {
  await supabase
    .from("saved_hadiths")
    .update({ note })
    .eq("id", savedId);
}

export async function moveToFolder(savedId: string, folder: string) {
  await supabase
    .from("saved_hadiths")
    .update({ folder })
    .eq("id", savedId);
}

export async function removeSaved(savedId: string) {
  await supabase.from("saved_hadiths").delete().eq("id", savedId);
}
