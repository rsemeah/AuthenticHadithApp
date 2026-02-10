import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";
import { useAuth } from "../../lib/auth";
import { QUICK_TOPICS } from "../../lib/topics";

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  icon: string;
  lesson_count: number;
  sort_order: number;
}

interface PathWithProgress extends LearningPath {
  completed: number;
}

const difficultyColor: Record<string, string> = {
  beginner: "#2e7d32",
  intermediate: "#f9a825",
  advanced: "#e65100",
  scholar: "#6a1b9a",
};

export default function LearnScreen() {
  const router = useRouter();
  const { user, isPremium } = useAuth();
  const [paths, setPaths] = useState<PathWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaths();
  }, []);

  const fetchPaths = async () => {
    setLoading(true);
    const { data: pathData } = await supabase
      .from("learning_paths")
      .select("*")
      .order("sort_order");

    if (!pathData) {
      setLoading(false);
      return;
    }

    if (user) {
      const { data: progress } = await supabase
        .from("user_lesson_progress")
        .select("lesson_id, status")
        .eq("user_id", user.id)
        .eq("status", "completed");

      const completedLessonIds = new Set(
        (progress ?? []).map((p) => p.lesson_id)
      );

      // For each path, count how many of its lessons are completed
      const withProgress: PathWithProgress[] = [];
      for (const path of pathData) {
        const { data: pathLessons } = await supabase
          .from("path_lessons")
          .select("lesson_id")
          .eq("path_id", path.id);

        const completed = (pathLessons ?? []).filter((pl) =>
          completedLessonIds.has(pl.lesson_id)
        ).length;

        withProgress.push({ ...path, completed });
      }
      setPaths(withProgress);
    } else {
      setPaths(pathData.map((p) => ({ ...p, completed: 0 })));
    }

    setLoading(false);
  };

  const renderPath = ({ item }: { item: PathWithProgress }) => {
    const progress =
      item.lesson_count > 0 ? item.completed / item.lesson_count : 0;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() =>
          router.push(`/learn/${item.id}?title=${encodeURIComponent(item.title)}`)
        }
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: difficultyColor[item.difficulty] + "18" },
            ]}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color={difficultyColor[item.difficulty]}
            />
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.badgeRow}>
              <Text
                style={[
                  styles.diffBadge,
                  { color: difficultyColor[item.difficulty] },
                ]}
              >
                {item.difficulty.charAt(0).toUpperCase() +
                  item.difficulty.slice(1)}
              </Text>
              <Text style={styles.lessonCount}>
                {item.lesson_count} lessons
              </Text>
            </View>
          </View>
        </View>

        {item.description && (
          <Text style={styles.desc} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Progress bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(progress * 100)}%`,
                  backgroundColor: difficultyColor[item.difficulty],
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {item.completed}/{item.lesson_count}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Paths</Text>
        <Text style={styles.headerSub}>
          Structured journeys through authentic hadith
        </Text>
      </View>
      {!isPremium && (
        <Pressable
          style={styles.premiumBanner}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <View>
            <Text style={styles.premiumBannerTitle}>
              Upgrade to Premium for unlimited lesson access
            </Text>
            <Text style={styles.premiumBannerSub}>
              Free users: 3 lessons per day
            </Text>
          </View>
        </Pressable>
      )}

      {/* Quick Topic Search */}
      <View style={styles.topicsSection}>
        <Text style={styles.topicsSectionTitle}>Look up a topic</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicsScroll}
        >
          {QUICK_TOPICS.map((t) => (
            <Pressable
              key={t.query}
              style={({ pressed }) => [
                styles.topicChip,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() =>
                router.push(
                  `/(tabs)/search?q=${encodeURIComponent(t.query)}&label=${encodeURIComponent(t.label)}`
                )
              }
            >
              <Ionicons
                name={t.icon as any}
                size={16}
                color={Colors.primary}
              />
              <Text style={styles.topicChipText}>{t.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={paths}
        keyExtractor={(item) => item.id}
        renderItem={renderPath}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.pathsSectionTitle}>Learning Paths</Text>
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              No learning paths available yet. Check back soon!
            </Text>
          </View>
        }
      />
    </View>
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
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cardMeta: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  diffBadge: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  lessonCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "right",
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  topicsSection: {
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  topicsSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  topicsScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
  },
  topicChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.background,
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
  pathsSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  premiumBanner: {
    backgroundColor: Colors.accent,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  premiumBannerTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  premiumBannerSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
  },
});
