/**
 * Quiz Engine — auto-generates questions from hadith metadata.
 *
 * Question types:
 * 1. "Which collection is this hadith from?"
 * 2. "Who narrated this hadith?"
 * 3. "What is the grading of this hadith?"
 * 4. "Complete the hadith: 'The Prophet said...'"
 * 5. "Which book does this hadith belong to?"
 */
import { supabase } from "./supabase";
import { HADITH_COLUMNS } from "./queries";
import { awardXP, XP_VALUES, checkAndAwardBadges } from "./xp";

export interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: string;
  correctAnswer: string;
  options: string[]; // 4 options, shuffled
  hadithPreview?: string;
}

export interface QuizResult {
  score: number;
  total: number;
  isPerfect: boolean;
  xpEarned: number;
  answers: { questionId: string; selected: string; correct: boolean }[];
}

/**
 * Generate a quiz for a lesson by pulling hadith and creating questions.
 * Returns 5 questions from the lesson's linked hadith.
 */
export async function generateQuiz(lessonId: string): Promise<QuizQuestion[]> {
  // Get hadith linked to this lesson
  const { data: lessonHadith } = await supabase
    .from("lesson_hadith")
    .select(`hadith_id, hadith:hadith_id(${HADITH_COLUMNS})`)
    .eq("lesson_id", lessonId)
    .order("sort_order")
    .limit(5);

  if (!lessonHadith || lessonHadith.length === 0) return [];

  const hadithList = lessonHadith
    .map((lh: any) => lh.hadith)
    .filter(Boolean);

  if (hadithList.length === 0) return [];

  // Get distractor data: random hadith from same collection for realistic wrong answers
  const collections = [...new Set(hadithList.map((h: any) => h.collection_name))];
  const { data: distractors } = await supabase
    .from("hadith")
    .select("collection_name, narrator, grading, book, english_text")
    .in("collection_name", collections)
    .limit(30);

  const distractorPool = distractors ?? [];

  const questions: QuizQuestion[] = [];

  for (const hadith of hadithList) {
    const qType = pickQuestionType(hadith, questions);
    const q = buildQuestion(hadith, qType, distractorPool);
    if (q) questions.push(q);
    if (questions.length >= 5) break;
  }

  // If we have fewer than 5, generate more from existing hadith with different types
  if (questions.length < 5 && hadithList.length > 0) {
    const types = ["collection", "narrator", "grading", "completion", "book"];
    for (const h of hadithList) {
      for (const t of types) {
        if (questions.length >= 5) break;
        if (questions.some((q) => q.id === `${h.id}-${t}`)) continue;
        const q = buildQuestion(h, t, distractorPool);
        if (q) questions.push(q);
      }
      if (questions.length >= 5) break;
    }
  }

  return questions.slice(0, 5);
}

function pickQuestionType(hadith: any, existing: QuizQuestion[]): string {
  const types = ["collection", "narrator", "grading", "completion", "book"];
  const usedTypes = existing.map((q) => q.questionType);

  // Prefer types we haven't used yet
  for (const t of types) {
    if (!usedTypes.includes(t) && hasDataForType(hadith, t)) return t;
  }

  // Fallback to any valid type
  for (const t of types) {
    if (hasDataForType(hadith, t)) return t;
  }

  return "collection";
}

function hasDataForType(hadith: any, type: string): boolean {
  switch (type) {
    case "collection": return !!hadith.collection_name;
    case "narrator": return !!hadith.narrator;
    case "grading": return !!hadith.grading;
    case "completion": return !!hadith.english_text && hadith.english_text.length > 40;
    case "book": return !!hadith.book;
    default: return false;
  }
}

function buildQuestion(
  hadith: any,
  type: string,
  distractors: any[]
): QuizQuestion | null {
  const preview = hadith.english_text
    ? hadith.english_text.slice(0, 120) + (hadith.english_text.length > 120 ? "..." : "")
    : "";

  switch (type) {
    case "collection": {
      const correct = hadith.collection_name;
      if (!correct) return null;
      const wrongs = getDistractorValues(distractors, "collection_name", correct, 3);
      if (wrongs.length < 3) return null;
      return {
        id: `${hadith.id}-collection`,
        questionType: "collection",
        questionText: "Which collection is this hadith from?",
        correctAnswer: correct,
        options: shuffle([correct, ...wrongs]),
        hadithPreview: preview,
      };
    }

    case "narrator": {
      const correct = hadith.narrator;
      if (!correct) return null;
      const wrongs = getDistractorValues(distractors, "narrator", correct, 3);
      if (wrongs.length < 3) {
        // Use common narrator names as fallback
        const fallbacks = [
          "Abu Hurairah", "Aisha", "Anas ibn Malik", "Abdullah ibn Umar",
          "Abdullah ibn Abbas", "Jabir ibn Abdullah", "Abu Sa'id al-Khudri",
          "Umar ibn al-Khattab", "Ali ibn Abi Talib", "Abdullah ibn Mas'ud",
        ].filter((n) => n !== correct);
        wrongs.push(...fallbacks.slice(0, 3 - wrongs.length));
      }
      return {
        id: `${hadith.id}-narrator`,
        questionType: "narrator",
        questionText: "Who narrated this hadith?",
        correctAnswer: correct,
        options: shuffle([correct, ...wrongs.slice(0, 3)]),
        hadithPreview: preview,
      };
    }

    case "grading": {
      const correct = hadith.grading;
      if (!correct) return null;
      const allGrades = ["Sahih", "Hasan", "Da'if", "Mawdu"];
      const wrongs = allGrades.filter(
        (g) => g.toLowerCase() !== correct.toLowerCase()
      ).slice(0, 3);
      return {
        id: `${hadith.id}-grading`,
        questionType: "grading",
        questionText: "What is the grading of this hadith?",
        correctAnswer: correct,
        options: shuffle([correct, ...wrongs]),
        hadithPreview: preview,
      };
    }

    case "completion": {
      const text = hadith.english_text;
      if (!text || text.length < 40) return null;

      // Split at roughly the midpoint at a word boundary
      const words = text.split(/\s+/);
      const midpoint = Math.floor(words.length / 2);
      const beginning = words.slice(0, midpoint).join(" ") + "...";
      const correct = "..." + words.slice(midpoint).join(" ");
      const correctShort = correct.slice(0, 80) + (correct.length > 80 ? "..." : "");

      // Generate wrong completions from other hadith
      const wrongTexts = distractors
        .filter((d) => d.english_text && d.english_text !== text)
        .slice(0, 3)
        .map((d) => {
          const dWords = d.english_text.split(/\s+/);
          const dMid = Math.floor(dWords.length / 2);
          const ending = "..." + dWords.slice(dMid).join(" ");
          return ending.slice(0, 80) + (ending.length > 80 ? "..." : "");
        });

      if (wrongTexts.length < 3) return null;

      return {
        id: `${hadith.id}-completion`,
        questionType: "completion",
        questionText: `Complete the hadith: "${beginning}"`,
        correctAnswer: correctShort,
        options: shuffle([correctShort, ...wrongTexts]),
        hadithPreview: undefined, // The question itself contains the preview
      };
    }

    case "book": {
      const correct = hadith.book;
      if (!correct) return null;
      const wrongs = getDistractorValues(distractors, "book", correct, 3);
      if (wrongs.length < 3) return null;
      return {
        id: `${hadith.id}-book`,
        questionType: "book",
        questionText: "Which book does this hadith belong to?",
        correctAnswer: correct,
        options: shuffle([correct, ...wrongs]),
        hadithPreview: preview,
      };
    }

    default:
      return null;
  }
}

function getDistractorValues(
  pool: any[],
  field: string,
  correct: string,
  count: number
): string[] {
  const unique = [...new Set(
    pool
      .map((d) => d[field])
      .filter((v): v is string => !!v && v !== correct)
  )];
  return shuffle(unique).slice(0, count);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Submit quiz answers, calculate score, award XP.
 */
export async function submitQuiz(
  userId: string,
  lessonId: string,
  answers: { questionId: string; selected: string; correct: boolean }[]
): Promise<QuizResult> {
  const score = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const isPerfect = score === total;

  // Calculate XP
  let xpEarned = score * XP_VALUES.quiz_correct; // +10 per correct
  if (isPerfect) xpEarned += XP_VALUES.quiz_perfect_bonus; // +50 bonus

  // Record the attempt
  await supabase.from("quiz_attempts").insert({
    user_id: userId,
    lesson_id: lessonId,
    score,
    total_questions: total,
    is_perfect: isPerfect,
    xp_earned: xpEarned,
    answers,
  });

  // Award XP
  const action = isPerfect ? "quiz_perfect" : "quiz_complete";
  await awardXP(userId, xpEarned, action);

  // Check for new badges
  await checkAndAwardBadges(userId);

  return { score, total, isPerfect, xpEarned, answers };
}
