import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";

interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string | null;
  description: string | null;
  icon: string | null;
  display_order: number;
  hadith_count: number;
}

interface Tag {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string | null;
  usage_count: number;
  category_id: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  worship: "#059669",
  character: "#d97706",
  family: "#e11d48",
  "daily-life": "#0284c7",
  knowledge: "#7c3aed",
  community: "#2563eb",
  afterlife: "#475569",
};

export default function TopicsScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    const { data: tgs } = await supabase
      .from("tags")
      .select("*")
      .eq("is_active", true)
      .order("usage_count", { ascending: false });

    // Count enrichments per category
    const { data: catCounts } = await supabase
      .from("hadith_enrichment")
      .select("category_id")
      .eq("status", "published");

    const countMap = new Map<string, number>();
    for (const row of catCounts || []) {
      if (row.category_id) {
        countMap.set(row.category_id, (countMap.get(row.category_id) || 0) + 1);
      }
    }

    const enrichedCats: Category[] = (cats || []).map((c: any) => ({
      ...c,
      hadith_count: countMap.get(c.id) || 0,
    }));

    setCategories(enrichedCats);
    setTags(tgs || []);
    setLoading(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Browse by Topic",
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
          <Text style={styles.sectionTitle}>Categories</Text>

          {categories.map((cat) => {
            const color = CATEGORY_COLORS[cat.slug] || Colors.primary;
            return (
              <Pressable
                key={cat.id}
                style={({ pressed }) => [
                  styles.catCard,
                  {
                    borderColor: color + "40",
                    backgroundColor: color + "08",
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                onPress={() =>
                  router.push(
                    `/search?topic=${encodeURIComponent(cat.slug)}`
                  )
                }
              >
                <View style={styles.catRow}>
                  {cat.icon ? (
                    <Text style={styles.catEmoji}>{cat.icon}</Text>
                  ) : (
                    <View
                      style={[
                        styles.catIconCircle,
                        { backgroundColor: color + "15" },
                      ]}
                    >
                      <Ionicons
                        name="folder-outline"
                        size={20}
                        color={color}
                      />
                    </View>
                  )}
                  <View style={styles.catText}>
                    <Text style={[styles.catName, { color }]}>
                      {cat.name_en}
                    </Text>
                    {cat.name_ar && (
                      <Text style={styles.catNameAr}>{cat.name_ar}</Text>
                    )}
                    {cat.description && (
                      <Text style={styles.catDesc} numberOfLines={1}>
                        {cat.description}
                      </Text>
                    )}
                  </View>
                  <View style={styles.catCountCol}>
                    <Text style={[styles.catCount, { color }]}>
                      {cat.hadith_count}
                    </Text>
                    <Text style={styles.catCountLabel}>hadiths</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={color}
                  />
                </View>
              </Pressable>
            );
          })}

          {/* Popular Tags */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Popular Tags
          </Text>
          <View style={styles.tagWrap}>
            {tags
              .filter((t) => t.usage_count > 0)
              .slice(0, 20)
              .map((tag) => (
                <Pressable
                  key={tag.id}
                  style={styles.tagChip}
                  onPress={() =>
                    router.push(
                      `/search?tag=${encodeURIComponent(tag.slug)}`
                    )
                  }
                >
                  <Ionicons
                    name="pricetag-outline"
                    size={12}
                    color={Colors.accent}
                  />
                  <Text style={styles.tagChipText}>{tag.name_en}</Text>
                  <Text style={styles.tagChipCount}>
                    ({tag.usage_count})
                  </Text>
                </Pressable>
              ))}
          </View>

          {tags.filter((t) => t.usage_count > 0).length === 0 &&
            categories.length === 0 && (
              <View style={styles.emptyBox}>
                <Ionicons
                  name="book-outline"
                  size={32}
                  color={Colors.textSecondary + "60"}
                />
                <Text style={styles.emptyText}>
                  No enriched hadiths yet. Topics will appear as hadiths are
                  enriched and published.
                </Text>
              </View>
            )}
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  catCard: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  catEmoji: { fontSize: 24 },
  catIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  catText: { flex: 1 },
  catName: { fontSize: 14, fontWeight: "600" },
  catNameAr: {
    fontSize: 11,
    color: Colors.textSecondary,
    writingDirection: "rtl",
  },
  catDesc: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  catCountCol: { alignItems: "flex-end" },
  catCount: { fontSize: 18, fontWeight: "700" },
  catCountLabel: { fontSize: 10, color: Colors.textSecondary },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagChipText: { fontSize: 13, fontWeight: "500", color: Colors.text },
  tagChipCount: { fontSize: 11, color: Colors.textSecondary },
  emptyBox: {
    alignItems: "center",
    padding: 32,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
});
