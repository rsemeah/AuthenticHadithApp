/**
 * Daily Hadith — deterministic "hadith of the day" based on current date.
 * Ported from v0 /api/daily-hadith. Runs client-side via Supabase JS.
 */

import { supabase } from "./supabase";
import { Hadith } from "../components/HadithCard";

function dateSeed(): number {
  const now = new Date();
  const dateString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function getDailyHadith(): Promise<Hadith | null> {
  // Count sahih-graded hadiths
  const { count } = await supabase
    .from("hadith")
    .select("id", { count: "exact", head: true })
    .ilike("grading", "%sahih%");

  if (!count || count === 0) return null;

  const offset = dateSeed() % count;

  const { data } = await supabase
    .from("hadith")
    .select(
      "id,book,chapter,arabic_text,english_text,grading,collection_name,reference,narrator,hadith_number,book_number"
    )
    .ilike("grading", "%sahih%")
    .range(offset, offset)
    .single();

  return data ?? null;
}

/** Rotating daily small-action prompts from the Sunnah */
export const DAILY_ACTIONS = [
  {
    text: 'Smile at someone today. The Prophet (peace be upon him) said: "Your smiling in the face of your brother is charity."',
    ref: "Jami at-Tirmidhi 1956",
  },
  {
    text: 'Say "Bismillah" before eating. The Prophet (peace be upon him) said: "When any of you eats, let him mention the name of Allah."',
    ref: "Sahih Muslim 2017",
  },
  {
    text: 'Remove something harmful from the path. The Prophet (peace be upon him) said: "Removing harmful things from the road is an act of charity."',
    ref: "Sahih Muslim 1009",
  },
  {
    text: "Greet someone you don't know with Salam. The Prophet (peace be upon him) was asked: \"What is the best Islam?\" He said: \"Feeding others and greeting those you know and those you do not know.\"",
    ref: "Sahih al-Bukhari 12",
  },
  {
    text: 'Make du\'a for someone in their absence. The Prophet (peace be upon him) said: "The supplication of a Muslim for his brother in his absence will certainly be answered."',
    ref: "Sahih Muslim 2733",
  },
  {
    text: 'Give water to someone thirsty. The Prophet (peace be upon him) said: "The best charity is giving water to drink."',
    ref: "Musnad Ahmad 6657",
  },
  {
    text: 'Be patient with a difficulty today. The Prophet (peace be upon him) said: "No fatigue, nor disease, nor anxiety... afflicts a Muslim, even if it were the prick of a thorn, but Allah expiates some of his sins for that."',
    ref: "Sahih al-Bukhari 5641",
  },
  {
    text: 'Forgive someone who wronged you. The Prophet (peace be upon him) said: "Be merciful to others and you will receive mercy."',
    ref: "Musnad Ahmad 7001",
  },
  {
    text: 'Visit or call someone who is sick. The Prophet (peace be upon him) said: "When a Muslim visits a sick Muslim in the morning, seventy thousand angels send blessings upon him until evening."',
    ref: "Jami at-Tirmidhi 969",
  },
  {
    text: 'Share a meal with your neighbor. The Prophet (peace be upon him) said: "He is not a believer whose stomach is filled while the neighbour to his side goes hungry."',
    ref: "Al-Adab Al-Mufrad 112",
  },
];

export function getDailyAction(): { text: string; ref: string } {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_ACTIONS[dayOfYear % DAILY_ACTIONS.length];
}
