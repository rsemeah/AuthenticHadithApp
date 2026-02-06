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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";
import { HADITH_COLUMNS } from "../../lib/queries";
import { Hadith } from "../../components/HadithCard";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: Hadith[];
}

const REFUSAL =
  "No authenticated hadith found in this library for that query.";

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Assalamu Alaikum! I can help you find authentic hadith. Ask me about any topic and I will search the library for relevant narrations.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Search Supabase for relevant hadith
      const { data, error } = await supabase
        .from("hadith")
        .select(HADITH_COLUMNS)
        .or(`english_text.ilike.%${trimmed}%,arabic_text.ilike.%${trimmed}%`)
        .limit(5);

      if (error) throw error;

      let assistantMsg: Message;

      if (!data || data.length === 0) {
        assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: REFUSAL,
        };
      } else {
        // Collect unique collection names
        const books = [...new Set(data.map((h) => h.book || h.collection_name || "Unknown"))];
        const summary = `I found ${data.length} relevant hadith in ${books.join(", ")}. Here are the results:`;

        assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: summary,
          sources: data,
        };
      }

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
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
                    {h.book || h.collection_name || "Unknown"}
                  </Text>
                  {h.reference && (
                    <Text style={styles.sourceNumber}>{h.reference}</Text>
                  )}
                  {h.grading && (
                    <Text style={styles.sourceGrade}>{h.grading}</Text>
                  )}
                </View>
                <Text style={styles.sourcePreview} numberOfLines={2}>
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
      />

      {loading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.typingText}>Searching hadith library...</Text>
        </View>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask about a hadith topic..."
          placeholderTextColor={Colors.textSecondary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!loading}
          multiline
        />
        <Pressable
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
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
});
