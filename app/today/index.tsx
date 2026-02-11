import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Share,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../lib/colors";
import { useAuth } from "../../lib/auth";
import { getDailyHadith, getDailyAction } from "../../lib/daily-hadith";
import { toggleSaveHadith, isHadithSaved } from "../../lib/saved";
import { Hadith } from "../../components/HadithCard";
import { shareHadith } from "../../lib/share";

export default function TodayScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDaily();
  }, []);

  const loadDaily = async () => {
    const h = await getDailyHadith();
    setHadith(h);
    if (h && user) {
      const s = await isHadithSaved(user.id, h.id);
      setSaved(s);
    }
    setLoading(false);
  };

  const handleToggleSave = async () => {
    if (!user || !hadith) return;
    const nowSaved = await toggleSaveHadith(user.id, hadith.id);
    setSaved(nowSaved);
  };

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const action = getDailyAction();

  function gradeColor(g: string | null) {
    if (!g) return Colors.textSecondary;
    const l = g.toLowerCase();
    if (l.includes("sahih")) return "#2e7d32";
    if (l.includes("hasan")) return "#f9a825";
    return "#d32f2f";
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Today",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.dateRow}>
            <Ionicons name="sunny" size={22} color={Colors.accent} />
            <Text style={styles.dateLabel}>{todayDate}</Text>
          </View>

          {/* Hadith of the Day */}
          {hadith && (
            <View style={styles.card}>
              <View style={styles.sparkRow}>
                <Ionicons name="sparkles" size={14} color={Colors.accent} />
                <Text style={styles.sparkLabel}>HADITH OF THE DAY</Text>
              </View>

              {hadith.arabic_text && (
                <Text style={styles.arabic}>{hadith.arabic_text}</Text>
              )}
              {hadith.english_text && (
                <Text style={styles.english}>{hadith.english_text}</Text>
              )}

              <View style={styles.metaRow}>
                {hadith.grading && (
                  <View
                    style={[
                      styles.gradeBadge,
                      { backgroundColor: gradeColor(hadith.grading) + "15" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.gradeText,
                        { color: gradeColor(hadith.grading) },
                      ]}
                    >
                      {hadith.grading}
                    </Text>
                  </View>
                )}
                <Text style={styles.metaText}>
                  {hadith.collection_name}
                  {hadith.reference ? ` - ${hadith.reference}` : ""}
                </Text>
              </View>

              {hadith.narrator && (
                <Text style={styles.narrator}>
                  Narrated by {hadith.narrator}
                </Text>
              )}

              {/* Actions */}
              <View style={styles.actionRow}>
                <Pressable
                  style={[
                    styles.actionBtn,
                    saved && { backgroundColor: Colors.accent + "15" },
                  ]}
                  onPress={handleToggleSave}
                >
                  <Ionicons
                    name={saved ? "bookmark" : "bookmark-outline"}
                    size={16}
                    color={saved ? Colors.accent : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.actionText,
                      saved && { color: Colors.accent },
                    ]}
                  >
                    {saved ? "Saved" : "Save"}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.actionBtn}
                  onPress={() => hadith && shareHadith(hadith)}
                >
                  <Ionicons
                    name="share-outline"
                    size={16}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.actionText}>Share</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionBtn, { marginLeft: "auto" }]}
                  onPress={() => router.push(`/hadith/${hadith.id}`)}
                >
                  <Text style={styles.actionText}>Read more</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={Colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>
          )}

          {/* Reflection Prompt */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Reflection</Text>
            <Text style={styles.sectionDesc}>
              How does today's hadith relate to a challenge you are currently
              facing? Take a moment to reflect.
            </Text>
            <Pressable onPress={() => router.push("/reflections")}>
              <Text style={styles.linkText}>
                Write a reflection{" "}
                <Ionicons
                  name="chevron-forward"
                  size={12}
                  color={Colors.accent}
                />
              </Text>
            </Pressable>
          </View>

          {/* Small Action */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Today's Small Action</Text>
            <Text style={styles.sectionDesc}>{action.text}</Text>
            <Text style={styles.actionRef}>{action.ref}</Text>
          </View>

          {/* Quick Links */}
          <View style={styles.quickLinks}>
            <Pressable
              style={styles.quickLink}
              onPress={() => router.push("/sunnah")}
            >
              <Ionicons
                name="book-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.qlTitle}>Daily Sunnah</Text>
              <Text style={styles.qlSub}>Lived practice</Text>
            </Pressable>
            <Pressable
              style={styles.quickLink}
              onPress={() => router.push("/stories")}
            >
              <Ionicons name="people" size={20} color={Colors.accent} />
              <Text style={styles.qlTitle}>Stories</Text>
              <Text style={styles.qlSub}>The Companions</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  dateLabel: { fontSize: 14, color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  sparkRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  sparkLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: Colors.accent,
  },
  arabic: {
    fontSize: 18,
    lineHeight: 32,
    color: Colors.textArabic,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 12,
  },
  english: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  gradeBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  gradeText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  metaText: { fontSize: 12, color: Colors.textSecondary },
  narrator: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: "italic",
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: { fontSize: 12, fontWeight: "500", color: Colors.textSecondary },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: Colors.text, marginBottom: 6 },
  sectionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  linkText: { fontSize: 12, fontWeight: "600", color: Colors.accent },
  actionRef: {
    fontSize: 10,
    color: Colors.textSecondary + "80",
    fontStyle: "italic",
    marginTop: 4,
  },
  quickLinks: { flexDirection: "row", gap: 12 },
  quickLink: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  qlTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, marginTop: 8 },
  qlSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
});
