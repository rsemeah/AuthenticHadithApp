import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";
import { HADITH_COLUMNS } from "../../lib/queries";
import { Hadith } from "../../components/HadithCard";
import { expandQuery, buildTsQuery, detectTopic, QUICK_TOPICS } from "../../lib/topics";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: Hadith[];
  topic?: string | null;
}

const REFUSAL =
  "No authenticated hadith found in this library for that query. Try rephrasing — for example, ask about a specific topic like prayer, fasting, marriage, patience, or eating.";

/**
 * TruthSerum v2 — Smart retrieval-first assistant.
 *
 * Search strategy (cascading):
 * 1. Full-text search using tsv column with expanded query terms
 * 2. Fallback: ilike search with synonym-expanded terms
 * 3. Fallback: ilike with original query
 *
 * Never calls an external LLM. All responses are deterministic and template-based.
 * Every response is grounded in actual hadith from the database.
 */
export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Assalamu Alaikum! I'm TruthSerum — your hadith research assistant. Ask me about any topic and I'll search across 36,000+ authenticated narrations.\n\nTry asking about prayer, eating etiquette, patience, marriage, or any Islamic topic.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTopics, setShowTopics] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const searchHadith = async (query: string): Promise<Hadith[]> => {
    // Step 1: Expand query using topic map
    const expanded = expandQuery(query);
    const tsQuery = buildTsQuery(expanded);

    // Step 2: Try full-text search with tsv column first
    if (tsQuery) {
      const { data: tsvData } = await supabase
        .from("hadith")
        .select(HADITH_COLUMNS)
        .textSearch("tsv", tsQuery, { type: "plain" })
        .limit(8);

      if (tsvData && tsvData.length > 0) return tsvData;
    }

    // Step 3: Fallback — ilike with top expanded terms
    const topTerms = expanded.slice(0, 6);
    for (const term of topTerms) {
      if (term.length < 3) continue;
      const { data } = await supabase
        .from("hadith")
        .select(HADITH_COLUMNS)
        .or(`english_text.ilike.%${term}%,arabic_text.ilike.%${term}%`)
        .limit(8);

      if (data && data.length > 0) return data;
    }

    // Step 4: Final fallback — original query ilike
    const { data: fallback } = await supabase
      .from("hadith")
      .select(HADITH_COLUMNS)
      .or(
        `english_text.ilike.%${query}%,arabic_text.ilike.%${query}%`
      )
      .limit(8);

    return fallback ?? [];
  };

  const buildResponse = (query: string, results: Hadith[]): Message => {
    const topic = detectTopic(query);
    const topicLabel = topic
      ? topic.charAt(0).toUpperCase() + topic.slice(1)
      : null;

    if (results.length === 0) {
      return {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: REFUSAL,
        topic,
      };
    }

    // Deduplicate by id
    const seen = new Set<string>();
    const unique = results.filter((h) => {
      if (seen.has(h.id)) return false;
      seen.add(h.id);
      return true;
    });

    // Collect collection names
    const collections = [
      ...new Set(
        unique.map((h) => h.collection_name || "Unknown")
      ),
    ];

    // Build contextual response
    let responseText: string;

    if (topicLabel) {
      responseText = `On the topic of **${topicLabel}**, I found ${unique.length} relevant hadith across ${collections.join(", ")}.`;

      // Add a brief contextual note based on the topic
      const contextNote = getTopicContext(topic!);
      if (contextNote) {
        responseText += `\n\n${contextNote}`;
      }
    } else {
      responseText = `I found ${unique.length} relevant hadith in ${collections.join(", ")}:`;
    }

    return {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      text: responseText,
      sources: unique.slice(0, 5),
      topic,
    };
  };

  const handleSend = async (overrideQuery?: string) => {
    const trimmed = (overrideQuery ?? input).trim();
    if (!trimmed || loading) return;

    if (!overrideQuery) {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
    }
    setShowTopics(false);
    setLoading(true);

    try {
      const results = await searchHadith(trimmed);
      const response = buildResponse(trimmed, results);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: "Sorry, I encountered an error searching the hadith library. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicTap = (topicQuery: string, label: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: label,
    };
    setMessages((prev) => [...prev, userMsg]);
    handleSend(topicQuery);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarRow}>
            <Ionicons name="sparkles" size={16} color={Colors.primary} />
            <Text style={styles.avatarLabel}>TruthSerum</Text>
            {item.topic && (
              <View style={styles.topicBadge}>
                <Text style={styles.topicBadgeText}>{item.topic}</Text>
              </View>
            )}
          </View>
        )}
        <Text style={[styles.messageText, isUser && styles.userText]}>
          {item.text}
        </Text>

        {item.sources && item.sources.length > 0 && (
          <View style={styles.sourcesList}>
            {item.sources.map((h) => (
              <Pressable
                key={h.id}
                style={styles.sourceCard}
                onPress={() => router.push(`/hadith/${h.id}`)}
              >
                <View style={styles.sourceHeader}>
                  <Text style={styles.sourceCollection}>
                    {h.collection_name || "Unknown"}
                  </Text>
                  {h.reference && (
                    <Text style={styles.sourceNumber}>{h.reference}</Text>
                  )}
                  {h.grading && (
                    <Text style={styles.sourceGrade}>{h.grading}</Text>
                  )}
                </View>
                <Text style={styles.sourcePreview} numberOfLines={3}>
                  {h.english_text}
                </Text>
                <Text style={styles.openLink}>Open →</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListFooterComponent={
          showTopics ? (
            <View style={styles.topicsSection}>
              <Text style={styles.topicsTitle}>Popular topics</Text>
              <View style={styles.topicsGrid}>
                {QUICK_TOPICS.slice(0, 12).map((t) => (
                  <Pressable
                    key={t.query}
                    style={({ pressed }) => [
                      styles.topicChip,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => handleTopicTap(t.query, t.label)}
                  >
                    <Ionicons
                      name={t.icon as any}
                      size={16}
                      color={Colors.primary}
                    />
                    <Text style={styles.topicChipText}>{t.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      {loading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.typingText}>
            Searching across 36,000+ hadith...
          </Text>
        </View>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask about eating, prayer, washing, patience..."
          placeholderTextColor={Colors.textSecondary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
          editable={!loading}
          multiline
        />
        <Pressable
          style={[
            styles.sendBtn,
            (!input.trim() || loading) && styles.sendBtnDisabled,
          ]}
          onPress={() => handleSend()}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

/** Brief topic context notes — adds a teaching dimension to responses */
function getTopicContext(topic: string): string | null {
  const contexts: Record<string, string> = {
    prayer:
      "Prayer (salah) is the second pillar of Islam and was emphasized by the Prophet ﷺ as the first matter one will be questioned about on the Day of Judgment.",
    fasting:
      "Fasting (sawm) is the fourth pillar of Islam. The Prophet ﷺ said fasting is a shield and teaches self-discipline.",
    eating:
      "The Prophet ﷺ gave detailed guidance on eating — including eating with the right hand, saying Bismillah, and not overeating.",
    washing:
      "Purification (tahara) is half of faith according to the Prophet ﷺ. Wudu, ghusl, and cleanliness are foundations of worship.",
    marriage:
      "Marriage is described as completing half of one's faith. The Prophet ﷺ gave extensive guidance on the rights and responsibilities of spouses.",
    wives:
      "The Prophet ﷺ emphasized treating wives with kindness: \"The best of you are those who are best to their wives.\"",
    patience:
      "Patience (sabr) is mentioned extensively in the Quran and Sunnah. The Prophet ﷺ said patience is a light and comes at the first strike of calamity.",
    kindness:
      "The Prophet ﷺ said: \"Allah is gentle and loves gentleness in all things.\" Good character is among the heaviest deeds on the scale.",
    knowledge:
      "Seeking knowledge is an obligation upon every Muslim. The Prophet ﷺ said: \"Whoever follows a path seeking knowledge, Allah will make easy for them the path to Paradise.\"",
    honesty:
      "Truthfulness leads to righteousness and righteousness leads to Paradise. The Prophet ﷺ was known as As-Sadiq Al-Amin (The Truthful, The Trustworthy).",
    parents:
      "Honoring parents is among the greatest deeds in Islam, second only to prayer at its proper time.",
    children:
      "The Prophet ﷺ was gentle with children, kissed them, and said: \"He who does not show mercy will not be shown mercy.\"",
    anger:
      "The Prophet ﷺ said: \"The strong person is not the one who can overpower others, but the one who controls themselves when angry.\"",
    repentance:
      "Allah's mercy encompasses all things. The Prophet ﷺ said: \"Allah is more pleased with the repentance of His servant than any of you would be if you found your lost camel.\"",
    death:
      "The Prophet ﷺ encouraged remembering death frequently as it diminishes attachment to worldly life.",
    paradise:
      "Paradise has what no eye has seen, no ear has heard, and no human heart has imagined.",
    zakat:
      "Zakat purifies wealth and is the third pillar of Islam. The Prophet ﷺ warned severely against withholding it.",
    greeting:
      "The Prophet ﷺ said: \"Spread the greeting of peace (salam), feed the hungry, and pray at night — you will enter Paradise in peace.\"",
    sleep:
      "The Prophet ﷺ had specific practices for sleeping — lying on the right side, reciting certain supplications, and sleeping early after Isha.",
  };
  return contexts[topic] ?? null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    maxWidth: "85%",
  },
  userBubble: {
    backgroundColor: Colors.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.surface,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  avatarLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  topicBadge: {
    backgroundColor: Colors.primary + "14",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  topicBadgeText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  userText: {
    color: "#fff",
  },
  sourcesList: {
    marginTop: 10,
    gap: 8,
  },
  sourceCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sourceHeader: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginBottom: 4,
  },
  sourceCollection: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
    textTransform: "uppercase",
  },
  sourceNumber: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  sourceGrade: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  sourcePreview: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  openLink: {
    fontSize: 12,
    color: Colors.primaryLight,
    fontWeight: "600",
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  typingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: Colors.text,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  topicsSection: {
    marginTop: 8,
    paddingHorizontal: 2,
  },
  topicsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  topicsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  topicChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  topicChipText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500",
  },
});
