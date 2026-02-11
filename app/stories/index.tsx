import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Colors } from "../../lib/colors";

interface Sahabi {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string | null;
  title_en: string;
  title_ar: string | null;
  icon: string;
  color_theme: string;
  theme_primary: string;
  theme_secondary: string | null;
  notable_for: string[];
  total_parts: number;
  estimated_read_time_minutes: number | null;
  display_order: number;
}

interface Progress {
  sahabi_id: string;
  current_part: number;
  parts_completed: number[];
  is_completed: boolean;
  is_bookmarked: boolean;
}

export default function StoriesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [companions, setCompanions] = useState<Sahabi[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: sahabaData } = await supabase
      .from("sahaba")
      .select("*")
      .order("display_order", { ascending: true });

    if (sahabaData) setCompanions(sahabaData);

    if (user) {
      const { data: prog } = await supabase
        .from("sahaba_reading_progress")
        .select("*")
        .eq("user_id", user.id);

      if (prog) {
        const map: Record<string, Progress> = {};
        for (const p of prog) {
          map[p.sahabi_id] = {
            sahabi_id: p.sahabi_id,
            current_part: p.current_part,
            parts_completed: p.parts_completed || [],
            is_completed: p.is_completed,
            is_bookmarked: p.is_bookmarked,
          };
        }
        setProgressMap(map);
      }
    }
    setLoading(false);
  };

  const renderCompanion = ({ item }: { item: Sahabi }) => {
    const prog = progressMap[item.id];
    const partsRead = prog?.parts_completed?.length || 0;
    const pct =
      item.total_parts > 0 ? (partsRead / item.total_parts) * 100 : 0;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => router.push(`/stories/${item.slug}`)}
      >
        {partsRead > 0 && !prog?.is_completed && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${pct}%`,
                  backgroundColor: item.theme_primary || Colors.primary,
                },
              ]}
            />
          </View>
        )}

        <View style={styles.cardBody}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: (item.theme_primary || Colors.primary) + "20" },
            ]}
          >
            <Ionicons
              name="person"
              size={24}
              color={item.theme_primary || Colors.primary}
            />
          </View>

          <View style={styles.cardText}>
            <View style={styles.nameRow}>
              <Text style={styles.nameEn} numberOfLines={1}>
                {item.name_en}
              </Text>
              {prog?.is_completed && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.primary}
                />
              )}
              {prog?.is_bookmarked && (
                <Ionicons name="bookmark" size={14} color={Colors.accent} />
              )}
            </View>
            <Text
              style={[
                styles.title,
                { color: item.theme_primary || Colors.primaryLight },
              ]}
              numberOfLines={1}
            >
              {item.title_en}
            </Text>
            <View style={styles.metaRow}>
              <Ionicons
                name="book-outline"
                size={12}
                color={Colors.textSecondary}
              />
              <Text style={styles.metaText}>{item.total_parts} parts</Text>
              {item.estimated_read_time_minutes && (
                <>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.metaText}>
                    {item.estimated_read_time_minutes} min
                  </Text>
                </>
              )}
              {partsRead > 0 && !prog?.is_completed && (
                <Text
                  style={[
                    styles.metaText,
                    { color: item.theme_primary || Colors.primary, fontWeight: "600" },
                  ]}
                >
                  {partsRead}/{item.total_parts} read
                </Text>
              )}
            </View>
            {item.notable_for?.length > 0 && (
              <View style={styles.tagRow}>
                {item.notable_for.slice(0, 2).map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.textSecondary}
          />
        </View>

        {item.name_ar && (
          <Text style={styles.nameAr}>{item.name_ar}</Text>
        )}
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Stories of the Companions",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={companions}
          keyExtractor={(item) => item.id}
          renderItem={renderCompanion}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View style={styles.intro}>
              <Text style={styles.introText}>
                The Companions (Sahaba) were the people who lived alongside the
                Prophet Muhammad (peace be upon him). Read their stories with
                authentic references from the Quran and Hadith.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                No stories available yet. Check back soon!
              </Text>
            </View>
          }
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 32 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 24,
  },
  intro: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  introText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBar: {
    height: 3,
    backgroundColor: "#f3f4f6",
  },
  progressFill: { height: 3 },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  nameEn: { fontSize: 14, fontWeight: "600", color: Colors.text },
  title: { fontSize: 12, fontWeight: "500", marginTop: 2 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  metaText: { fontSize: 11, color: Colors.textSecondary, marginRight: 8 },
  tagRow: { flexDirection: "row", gap: 4, marginTop: 6, flexWrap: "wrap" },
  tag: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, color: Colors.textSecondary },
  nameAr: {
    fontSize: 13,
    color: Colors.textSecondary + "60",
    textAlign: "right",
    paddingHorizontal: 14,
    paddingBottom: 10,
    writingDirection: "rtl",
  },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: "center" },
});
