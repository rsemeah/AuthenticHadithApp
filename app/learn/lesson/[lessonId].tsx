import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";
import { Colors } from "../../../lib/colors";
import { useAuth } from "../../../lib/auth";
import HadithCard, { Hadith } from "../../../components/HadithCard";
import { HADITH_COLUMNS } from "../../../lib/queries";
import { awardXP, XP_VALUES, recordDailyActivity, checkAndAwardBadges } from "../../../lib/xp";

interface Lesson {
  id: string;
  title: string;
  summary: string | null;
  teaching_text: string | null;
  estimated_minutes: number | null;
}

export default function LessonDetailScreen() {
  const { lessonId, title } = useLocalSearchParams<{
    lessonId: string;
    title?: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [hadithList, setHadithList] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("not_started");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lessonId) fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    setLoading(true);

    // Fetch lesson
    const { data: lessonData } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (lessonData) setLesson(lessonData);

    // Fetch related hadith
    const { data: lessonHadith } = await supabase
      .from("lesson_hadith")
      .select(`sort_order, hadith(${HADITH_COLUMNS})`)
      .eq("lesson_id", lessonId)
      .order("sort_order");

    if (lessonHadith) {
      setHadithList(
        lessonHadith.map((lh: any) => lh.hadith).filter(Boolean)
      );
    }

    // Fetch progress
    if (user) {
      const { data: progress } = await supabase
        .from("user_lesson_progress")
        .select("status")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (progress) setStatus(progress.status);
    }

    setLoading(false);
  };

  const markComplete = async () => {
    if (!user) {
      Alert.alert(
        "Sign in required",
        "Create an account to track your progress.",
        [{ text: "OK" }]
      );
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("user_lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        status: "completed",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );

    if (!error) {
      setStatus("completed");
      // Award XP for lesson completion
      await awardXP(user.id, XP_VALUES.lesson_complete, "lesson_complete");
      await recordDailyActivity(user.id);
      await checkAndAwardBadges(user.id);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Lesson not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: title || lesson.title }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Teaching text */}
        {lesson.teaching_text && (
          <View style={styles.section}>
            <Text style={styles.teachingText}>{lesson.teaching_text}</Text>
          </View>
        )}

        {/* Related hadith */}
        {hadithList.length > 0 && (
          <View style={styles.hadithSection}>
            <Text style={styles.sectionTitle}>
              Related Hadith ({hadithList.length})
            </Text>
            {hadithList.map((h) => (
              <HadithCard key={h.id} hadith={h} />
            ))}
          </View>
        )}

        {/* Mark complete */}
        <View style={styles.completeSection}>
          {status === "completed" ? (
            <View style={styles.completedBanner}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.completedText}>Lesson completed</Text>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.completeBtn,
                { opacity: pressed ? 0.85 : 1 },
                saving && { opacity: 0.6 },
              ]}
              onPress={markComplete}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.completeBtnText}>Mark as Complete</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* Quiz button */}
        <View style={styles.quizSection}>
          <Pressable
            style={({ pressed }) => [
              styles.quizBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() =>
              router.push(
                `/quiz/${lessonId}?title=${encodeURIComponent(lesson.title)}`
              )
            }
          >
            <Ionicons name="help-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.quizBtnText}>Take the Quiz</Text>
            <Text style={styles.quizXP}>+{XP_VALUES.quiz_correct * 5} XP</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  section: {
    margin: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  teachingText: {
    fontSize: 16,
    lineHeight: 26,
    color: Colors.text,
  },
  hadithSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  completeSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  completeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary + "14",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + "40",
  },
  completedText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  quizSection: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  quizBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  quizBtnText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  quizXP: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: "700",
  },
});
