/**
 * Topic map and synonym engine for intelligent hadith search.
 *
 * When a user searches "eating with right hand", this engine expands it to
 * also search for "food", "meal", "etiquette", "sunnah", "manners" etc.
 *
 * Categories are drawn from Islamic jurisprudence (fiqh) and common user queries.
 */

/** Map of topic keywords → related search terms for query expansion */
export const TOPIC_MAP: Record<string, string[]> = {
  // --- Worship & Prayer ---
  prayer: ["salah", "salat", "pray", "prayer", "prostration", "sujud", "ruku", "bowing", "wudu", "ablution", "congregation", "imam", "masjid", "mosque", "adhan", "call to prayer", "qiblah"],
  fasting: ["fast", "fasting", "sawm", "siyam", "ramadan", "iftar", "suhur", "suhoor", "break fast"],
  hajj: ["hajj", "pilgrimage", "umrah", "kaaba", "tawaf", "mina", "arafat", "ihram", "sacrifice"],
  zakat: ["zakat", "zakah", "charity", "sadaqah", "alms", "poor", "needy", "wealth", "tithe"],
  dhikr: ["dhikr", "remembrance", "glorify", "praise", "subhan", "alhamdulillah", "allahu akbar", "tasbih", "supplication", "dua"],

  // --- Purification & Cleanliness ---
  washing: ["wash", "washing", "wudu", "ablution", "ghusl", "bath", "purification", "tahara", "clean", "water", "impurity", "najasah"],
  ablution: ["wudu", "ablution", "wash", "purification", "tayammum", "dry ablution"],

  // --- Food & Eating ---
  eating: ["eat", "eating", "food", "meal", "right hand", "drink", "drinking", "meat", "halal", "haram", "bismillah", "manners", "etiquette", "table"],
  drinking: ["drink", "drinking", "water", "milk", "wine", "alcohol", "intoxicant", "vessel", "cup"],

  // --- Family & Marriage ---
  marriage: ["marriage", "marry", "wife", "wives", "husband", "nikah", "dowry", "mahr", "divorce", "talaq", "wedding", "spouse"],
  wives: ["wife", "wives", "women", "woman", "spouse", "marriage", "husband", "family", "household", "rights of wife", "obedience", "kindness"],
  children: ["child", "children", "son", "daughter", "orphan", "upbringing", "education", "parent", "father", "mother"],
  parents: ["parent", "parents", "mother", "father", "obedience", "kindness", "birr", "dutiful"],
  family: ["family", "kin", "relative", "ties of kinship", "silat al-rahim", "household"],

  // --- Character & Ethics ---
  honesty: ["honest", "honesty", "truthful", "truth", "lying", "liar", "trust", "trustworthy", "amana"],
  patience: ["patience", "patient", "sabr", "endurance", "perseverance", "trials", "affliction", "calamity"],
  kindness: ["kind", "kindness", "gentle", "mercy", "compassion", "good character", "akhlaq", "ihsan"],
  anger: ["anger", "angry", "wrath", "temper", "calm", "self-control", "forbearance"],
  forgiveness: ["forgive", "forgiveness", "pardon", "mercy", "repentance", "tawbah"],
  backbiting: ["backbiting", "gossip", "slander", "gheebah", "nameemah", "tale-bearing", "tongue", "speech"],
  envy: ["envy", "jealousy", "hasad", "covet"],
  humility: ["humble", "humility", "arrogance", "pride", "kibr", "modesty"],
  gratitude: ["grateful", "gratitude", "thankful", "shukr", "blessing", "ni'mah"],

  // --- Knowledge & Learning ---
  knowledge: ["knowledge", "learn", "learning", "scholar", "teacher", "student", "ilm", "wisdom", "understanding", "book", "quran", "recite"],
  quran: ["quran", "recite", "recitation", "surah", "verse", "ayah", "revelation", "book of allah"],

  // --- Daily Life ---
  sleep: ["sleep", "sleeping", "bed", "night", "dream", "waking", "morning", "evening"],
  travel: ["travel", "journey", "traveler", "riding", "mount", "road", "companion"],
  clothing: ["clothing", "dress", "garment", "silk", "gold", "adornment", "modesty", "hijab", "covering"],
  greeting: ["greeting", "salam", "salaam", "peace", "handshake", "visit", "hospitality", "guest"],
  neighbors: ["neighbor", "neighbours", "neighborhood", "rights"],

  // --- Commerce & Trade ---
  trade: ["trade", "business", "sale", "buying", "selling", "merchant", "market", "riba", "interest", "usury", "debt", "loan"],

  // --- Governance & Justice ---
  justice: ["justice", "judge", "ruling", "court", "witness", "testimony", "oath", "fairness", "oppression", "tyranny"],
  leadership: ["leader", "leadership", "imam", "ruler", "authority", "obedience", "khalifah"],

  // --- Afterlife ---
  paradise: ["paradise", "jannah", "heaven", "garden", "hereafter", "reward", "akhirah"],
  hell: ["hell", "jahannam", "fire", "punishment", "torment", "hereafter"],
  death: ["death", "die", "dying", "grave", "burial", "funeral", "janazah", "shroud"],
  judgment: ["judgment", "day of judgment", "qiyamah", "resurrection", "reckoning", "scales", "bridge", "sirat"],

  // --- Jihad & Struggle ---
  jihad: ["jihad", "struggle", "striving", "battle", "fight", "warfare", "self-defense", "martyr", "shahid"],

  // --- Sunnah & Prophetic Practice ---
  sunnah: ["sunnah", "prophet", "messenger", "muhammad", "practice", "example", "hadith", "way", "tradition"],
  dua: ["dua", "supplication", "prayer", "invocation", "ask allah", "beseech", "request"],
  intention: ["intention", "niyyah", "sincerity", "ikhlas", "actions", "deeds"],
  repentance: ["repent", "repentance", "tawbah", "forgiveness", "sin", "disobedience", "return to allah"],

  // --- Specific Rulings ---
  inheritance: ["inheritance", "heir", "estate", "wealth", "division", "share", "will", "wasiyyah"],
  oaths: ["oath", "vow", "swear", "promise", "covenant", "pledge"],
  animals: ["animal", "dog", "cat", "horse", "camel", "sheep", "slaughter", "sacrifice", "hunting"],
};

/**
 * Given a user query, expand it into a set of search terms using the topic map.
 * Returns an array of unique terms to search for.
 */
export function expandQuery(query: string): string[] {
  const lower = query.toLowerCase().trim();
  const words = lower.split(/\s+/);
  const expanded = new Set<string>(words);

  // Add the full query itself
  expanded.add(lower);

  // Check each topic for matches
  for (const [topic, synonyms] of Object.entries(TOPIC_MAP)) {
    // Check if query matches topic name or any synonym
    const allTerms = [topic, ...synonyms];
    const matches = allTerms.some(
      (term) => lower.includes(term) || term.includes(lower)
    );

    if (matches) {
      // Add all related terms from this topic
      for (const syn of synonyms) {
        expanded.add(syn);
      }
      expanded.add(topic);
    }
  }

  // Also check individual words against topics
  for (const word of words) {
    if (word.length < 3) continue;
    for (const [topic, synonyms] of Object.entries(TOPIC_MAP)) {
      const allTerms = [topic, ...synonyms];
      if (allTerms.some((term) => term.includes(word) || word.includes(term))) {
        for (const syn of synonyms) {
          expanded.add(syn);
        }
        expanded.add(topic);
      }
    }
  }

  return [...expanded];
}

/**
 * Build a Supabase full-text search query string from expanded terms.
 * Uses OR logic so any matching term returns results.
 */
export function buildTsQuery(terms: string[]): string {
  return terms
    .filter((t) => t.length >= 3)
    .slice(0, 15) // limit to prevent overly broad queries
    .map((t) => t.replace(/[^a-zA-Z0-9\s]/g, "").trim())
    .filter(Boolean)
    .join(" | ");
}

/**
 * Detect the likely topic category for a user's question.
 * Used to provide context in the assistant's response.
 */
export function detectTopic(query: string): string | null {
  const lower = query.toLowerCase();
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const [topic, synonyms] of Object.entries(TOPIC_MAP)) {
    let score = 0;
    const allTerms = [topic, ...synonyms];

    for (const term of allTerms) {
      if (lower.includes(term)) {
        score += term.length; // longer matches score higher
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = topic;
    }
  }

  return bestScore >= 3 ? bestMatch : null;
}

/** Curated quick-search topics for the Learn screen */
export const QUICK_TOPICS = [
  { label: "Prayer", icon: "moon-outline", query: "prayer" },
  { label: "Fasting", icon: "restaurant-outline", query: "fasting" },
  { label: "Marriage", icon: "heart-outline", query: "marriage" },
  { label: "Parents", icon: "people-outline", query: "parents" },
  { label: "Honesty", icon: "shield-checkmark-outline", query: "honesty" },
  { label: "Patience", icon: "leaf-outline", query: "patience" },
  { label: "Knowledge", icon: "book-outline", query: "knowledge" },
  { label: "Kindness", icon: "hand-left-outline", query: "kindness" },
  { label: "Eating", icon: "nutrition-outline", query: "eating" },
  { label: "Washing", icon: "water-outline", query: "washing" },
  { label: "Charity", icon: "gift-outline", query: "zakat" },
  { label: "Death", icon: "skull-outline", query: "death" },
  { label: "Sleep", icon: "bed-outline", query: "sleep" },
  { label: "Trade", icon: "cash-outline", query: "trade" },
  { label: "Anger", icon: "flame-outline", query: "anger" },
  { label: "Children", icon: "happy-outline", query: "children" },
  { label: "Greeting", icon: "chatbox-outline", query: "greeting" },
  { label: "Clothing", icon: "shirt-outline", query: "clothing" },
  { label: "Repentance", icon: "refresh-outline", query: "repentance" },
  { label: "Paradise", icon: "sunny-outline", query: "paradise" },
] as const;
