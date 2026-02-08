import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";
import { useAuth } from "../../lib/auth";

interface Lesson {
  id: string;
  title: string;
  summary: string | null;
  estimated_minutes: number | null;
  sort_order: number;
}

interface LessonWithStatus extends Lesson {
  status: "not_started" | "in_progress" | "completed";
}

export default function PathLessonsScreen() {
  const { pathId, title } = useLocalSearchParams<{
    pathId: string;
    title?: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<LessonWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathId) fetchLessons();
  }, [pathId]);

  const fetchLessons = async () => {
    setLoading(true);

    // Get lessons for this path via join table
    const { data: pathLessons } = await supabase
      .from("path_lessons")
      .select("lesson_id, sort_order, lessons(*)")
      .eq("path_id", pathId)
      .order("sort_order");

    if (!pathLessons) {
      setLoading(false);
      return;
    }

    const flat: Lesson[] = pathLessons.map((pl: any) => ({
      ...pl.lessons,
      sort_order: pl.sort_order,
    }));

    if (user) {
      const lessonIds = flat.map((l) => l.id);
      const { data: progress } = await supabase
        .from("user_lesson_progress")
        .select("lesson_id, status")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

      const progressMap: Record<string, string> = {};
      (progress ?? []).forEach((p) => {
        progressMap[p.lesson_id] = p.status;
      });

      setLessons(
        flat.map((l) => ({
          ...l,
          status: (progressMap[l.id] as any) || "not_started",
        }))
      );
    } else {
      setLessons(flat.map((l) => ({ ...l, status: "not_started" })));
    }

    setLoading(false);
  };

  const statusIcon = (status: string) => {
    if (status === "completed")
      return (
        <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
      );
    if (status === "in_progress")
      return (
        <Ionicons
          name="ellipse-outline"
          size={22}
          color={Colors.accent}
        />
      );
    return <Ionicons name="ellipse-outline" size={22} color={Colors.border} />;
  };

  const renderLesson = ({
    item,
    index,
  }: {
    item: LessonWithStatus;
    index: number;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.lessonCard,
        { opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() =>
        router.push(
          `/learn/lesson/${item.id}?title=${encodeURIComponent(item.title)}&pathId=${pathId}`
        )
      }
    >
      <View style={styles.lessonNumber}>
        <Text style={styles.lessonNumText}>{index + 1}</Text>
      </View>
      <View style={styles.lessonBody}>
        <Text style={styles.lessonTitle}>{item.title}</Text>
        {item.summary && (
          <Text style={styles.lessonSummary} numberOfLines={2}>
            {item.summary}
          </Text>
        )}
        {item.estimated_minutes && (
          <Text style={styles.duration}>
            {item.estimated_minutes} min read
          </Text>
        )}
      </View>
      {statusIcon(item.status)}
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: title || "Lessons" }} />
      <FlatList
        style={styles.container}
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={renderLesson}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              No lessons added to this path yet.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <Text style={styles.sectionLabel}>
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
          </Text>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lessonNumText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  lessonBody: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  lessonSummary: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  duration: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
