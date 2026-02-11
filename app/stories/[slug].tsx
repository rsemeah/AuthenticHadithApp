import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Colors } from "../../lib/colors";

interface StoryPart {
  id: string;
  sahabi_id: string;
  part_number: number;
  title: string;
  content: string;
  quran_refs: string[] | null;
  hadith_refs: string[] | null;
}

interface Sahabi {
  id: string;
  name_en: string;
  name_ar: string | null;
  title_en: string;
  theme_primary: string;
  total_parts: number;
}

export default function StoryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
  const [sahabi, setSahabi] = useState<Sahabi | null>(null);
  const [parts, setParts] = useState<StoryPart[]>([]);
  const [currentPart, setCurrentPart] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    loadStory();
  }, [slug]);

  const loadStory = async () => {
    const { data: sahabiData } = await supabase
      .from("sahaba")
      .select("id,name_en,name_ar,title_en,theme_primary,total_parts")
      .eq("slug", slug)
      .single();

    if (!sahabiData) {
      setLoading(false);
      return;
    }
    setSahabi(sahabiData);

    const { data: partsData } = await supabase
      .from("sahaba_stories")
      .select("*")
      .eq("sahabi_id", sahabiData.id)
      .order("part_number", { ascending: true });

    if (partsData) setParts(partsData);

    // Restore reading position
    if (user) {
      const { data: prog } = await supabase
        .from("sahaba_reading_progress")
        .select("current_part")
        .eq("user_id", user.id)
        .eq("sahabi_id", sahabiData.id)
        .maybeSingle();
      if (prog && prog.current_part > 0) {
        setCurrentPart(prog.current_part - 1);
      }
    }
    setLoading(false);
  };

  const markPartRead = async (partIndex: number) => {
    if (!user || !sahabi) return;
    const partNumber = partIndex + 1;
    await supabase.rpc("update_sahaba_progress", {
      p_user_id: user.id,
      p_sahabi_id: sahabi.id,
      p_part_number: partNumber,
    });
  };

  const goNext = () => {
    if (currentPart < parts.length - 1) {
      markPartRead(currentPart);
      setCurrentPart(currentPart + 1);
    }
  };

  const goPrev = () => {
    if (currentPart > 0) setCurrentPart(currentPart - 1);
  };

  const part = parts[currentPart];
  const themeColor = sahabi?.theme_primary || Colors.primary;

  return (
    <>
      <Stack.Screen
        options={{
          title: sahabi?.name_en || "Story",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !sahabi || parts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Story not available yet.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Part indicator */}
          <View style={styles.partHeader}>
            <Text style={[styles.partLabel, { color: themeColor }]}>
              Part {currentPart + 1} of {parts.length}
            </Text>
            <Text style={styles.partTitle}>{part?.title}</Text>
          </View>

          {/* Progress dots */}
          <View style={styles.dots}>
            {parts.map((_, i) => (
              <Pressable key={i} onPress={() => setCurrentPart(i)}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === currentPart ? themeColor : "#e0e0e0",
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>

          {/* Content */}
          <Text style={styles.content}>{part?.content}</Text>

          {/* References */}
          {part?.hadith_refs && part.hadith_refs.length > 0 && (
            <View style={styles.refSection}>
              <Text style={styles.refTitle}>Hadith References</Text>
              {part.hadith_refs.map((ref, i) => (
                <Text key={i} style={styles.refText}>
                  {ref}
                </Text>
              ))}
            </View>
          )}

          {part?.quran_refs && part.quran_refs.length > 0 && (
            <View style={styles.refSection}>
              <Text style={styles.refTitle}>Quran References</Text>
              {part.quran_refs.map((ref, i) => (
                <Text key={i} style={styles.refText}>
                  {ref}
                </Text>
              ))}
            </View>
          )}

          {/* Navigation */}
          <View style={styles.navRow}>
            <Pressable
              style={[styles.navBtn, currentPart === 0 && styles.navBtnDisabled]}
              onPress={goPrev}
              disabled={currentPart === 0}
            >
              <Ionicons name="chevron-back" size={18} color={currentPart === 0 ? "#ccc" : themeColor} />
              <Text style={[styles.navText, currentPart === 0 && { color: "#ccc" }]}>Previous</Text>
            </Pressable>

            <Pressable
              style={[
                styles.navBtn,
                currentPart === parts.length - 1 && styles.navBtnDisabled,
              ]}
              onPress={goNext}
              disabled={currentPart === parts.length - 1}
            >
              <Text
                style={[
                  styles.navText,
                  currentPart === parts.length - 1 && { color: "#ccc" },
                ]}
              >
                Next
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={currentPart === parts.length - 1 ? "#ccc" : themeColor}
              />
            </Pressable>
          </View>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
  partHeader: { marginBottom: 12 },
  partLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  partTitle: { fontSize: 20, fontWeight: "700", color: Colors.text },
  dots: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  content: {
    fontSize: 15,
    lineHeight: 26,
    color: Colors.text,
    marginBottom: 24,
  },
  refSection: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  refTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  refText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  navBtnDisabled: { opacity: 0.5 },
  navText: { fontSize: 14, fontWeight: "600", color: Colors.primary },
});
