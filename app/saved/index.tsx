import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Colors } from "../../lib/colors";
import { FOLDERS, removeSaved, updateNote, moveToFolder } from "../../lib/saved";
import { shareHadith } from "../../lib/share";

interface SavedItem {
  id: string;
  hadith_id: string;
  created_at: string;
  note: string | null;
  folder: string | null;
  hadith: {
    id: string;
    arabic_text: string | null;
    english_text: string | null;
    collection_name: string | null;
    reference: string | null;
    grading: string | null;
  } | null;
}

export default function SavedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState("all");
  const [search, setSearch] = useState("");

  const fetchSaved = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_hadiths")
      .select(
        `id, hadith_id, created_at, note, folder,
         hadith:hadith_id (id, arabic_text, english_text, collection_name, reference, grading)`
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setItems(data as unknown as SavedItem[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const handleRemove = (savedId: string) => {
    Alert.alert("Remove", "Remove this hadith from saved?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await removeSaved(savedId);
          setItems((prev) => prev.filter((i) => i.id !== savedId));
        },
      },
    ]);
  };

  const filtered = items.filter((i) => {
    const matchFolder =
      activeFolder === "all" || (i.folder || "default") === activeFolder;
    if (!matchFolder) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.hadith?.english_text?.toLowerCase().includes(q) ||
      i.hadith?.reference?.toLowerCase().includes(q) ||
      i.note?.toLowerCase().includes(q)
    );
  });

  function gradeColor(g: string | null) {
    if (!g) return Colors.textSecondary;
    const l = g.toLowerCase();
    if (l.includes("sahih")) return "#2e7d32";
    if (l.includes("hasan")) return "#f9a825";
    if (l.includes("daif") || l.includes("da'if")) return "#d32f2f";
    return Colors.textSecondary;
  }

  const renderItem = ({ item }: { item: SavedItem }) => {
    const h = item.hadith;
    if (!h) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardMeta}>
            <Text style={styles.collName}>
              {h.collection_name || "Unknown"}
            </Text>
            {h.reference && (
              <Text style={styles.ref}>{h.reference}</Text>
            )}
            {h.grading && (
              <Text style={[styles.grade, { color: gradeColor(h.grading) }]}>
                {h.grading}
              </Text>
            )}
          </View>
          <View style={styles.cardActions}>
            <Pressable
              onPress={() =>
                shareHadith({
                  id: h.id,
                  arabic_text: h.arabic_text,
                  english_text: h.english_text,
                  collection_name: h.collection_name,
                  reference: h.reference,
                  grading: h.grading,
                  book: null,
                  chapter: null,
                  narrator: null,
                  hadith_number: null,
                  book_number: null,
                })
              }
              hitSlop={8}
            >
              <Ionicons name="share-outline" size={18} color={Colors.accent} />
            </Pressable>
            <Pressable
              onPress={() => router.push(`/hadith/${h.id}`)}
              hitSlop={8}
            >
              <Ionicons
                name="open-outline"
                size={18}
                color={Colors.textSecondary}
              />
            </Pressable>
            <Pressable onPress={() => handleRemove(item.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </Pressable>
          </View>
        </View>

        {h.arabic_text && (
          <Text style={styles.arabic} numberOfLines={2}>
            {h.arabic_text}
          </Text>
        )}
        {h.english_text && (
          <Text style={styles.english} numberOfLines={3}>
            {h.english_text}
          </Text>
        )}

        {item.note && (
          <View style={styles.noteBox}>
            <Ionicons name="document-text-outline" size={14} color={Colors.accent} />
            <Text style={styles.noteText}>{item.note}</Text>
          </View>
        )}

        <Text style={styles.dateText}>
          Saved {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  if (!user) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Saved Hadiths",
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "#fff",
          }}
        />
        <View style={styles.center}>
          <Ionicons name="bookmark" size={48} color={Colors.accent} />
          <Text style={styles.emptyTitle}>Sign in to save hadiths</Text>
          <Pressable
            style={styles.signInBtn}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Saved Hadiths",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />
      <View style={styles.listContainer}>
        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search saved hadiths or notes..."
            placeholderTextColor={Colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Folder tabs */}
        <FlatList
          horizontal
          data={FOLDERS as unknown as typeof FOLDERS[number][]}
          keyExtractor={(f) => f.id}
          style={styles.folderList}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: f }) => {
            const count =
              f.id === "all"
                ? items.length
                : items.filter((i) => (i.folder || "default") === f.id).length;
            const active = activeFolder === f.id;
            return (
              <Pressable
                style={[styles.folderChip, active && styles.folderChipActive]}
                onPress={() => setActiveFolder(f.id)}
              >
                <Text
                  style={[
                    styles.folderChipText,
                    active && styles.folderChipTextActive,
                  ]}
                >
                  {f.label} ({count})
                </Text>
              </Pressable>
            );
          }}
        />

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons name="bookmark-outline" size={48} color={Colors.accent} />
                <Text style={styles.emptyTitle}>
                  {items.length === 0 ? "No Saved Hadiths" : "No matches"}
                </Text>
                <Text style={styles.emptyText}>
                  {items.length === 0
                    ? "Start saving hadiths to access them here."
                    : "Try changing your folder or search."}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  listContainer: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 32,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 10, color: Colors.text },
  folderList: {
    maxHeight: 44,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  folderChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  folderChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  folderChipText: { fontSize: 12, fontWeight: "500", color: Colors.textSecondary },
  folderChipTextActive: { color: "#fff" },
  listContent: { paddingBottom: 32 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  collName: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
    textTransform: "uppercase",
  },
  ref: { fontSize: 12, color: Colors.textSecondary },
  grade: { fontSize: 11, fontWeight: "600" },
  cardActions: { flexDirection: "row", gap: 12 },
  arabic: {
    fontSize: 16,
    lineHeight: 28,
    color: Colors.textArabic,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 8,
  },
  english: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text,
    marginBottom: 8,
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: Colors.accent + "10",
    borderWidth: 1,
    borderColor: Colors.accent + "30",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  noteText: { flex: 1, fontSize: 13, color: Colors.text, lineHeight: 20 },
  dateText: { fontSize: 11, color: Colors.textSecondary },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
  },
  signInBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 16,
  },
  signInText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
