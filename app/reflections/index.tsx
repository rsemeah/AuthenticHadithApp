import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Colors } from "../../lib/colors";

interface Reflection {
  id: string;
  content: string;
  hadith_ref: string | null;
  tag: string | null;
  created_at: string;
}

const TAG_OPTIONS = [
  { value: "gratitude", label: "Gratitude", color: Colors.primary },
  { value: "patience", label: "Patience", color: Colors.accent },
  { value: "tawakkul", label: "Tawakkul", color: "#3b82f6" },
  { value: "repentance", label: "Repentance", color: "#7c3aed" },
  { value: "hope", label: "Hope", color: "#059669" },
  { value: "general", label: "General", color: Colors.textSecondary },
];

export default function ReflectionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState("general");
  const [newRef, setNewRef] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadReflections();
  }, [user]);

  const loadReflections = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("reflections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) setReflections(data);
    } catch {
      // table may not exist yet
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!newContent.trim() || !user) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("reflections")
        .insert({
          user_id: user.id,
          content: newContent.trim(),
          tag: newTag,
          hadith_ref: newRef.trim() || null,
        })
        .select()
        .single();

      if (!error && data) {
        setReflections([data, ...reflections]);
        setNewContent("");
        setNewRef("");
        setNewTag("general");
        setShowCompose(false);
      }
    } catch {
      Alert.alert("Error", "Could not save your reflection.");
    }
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Delete this reflection?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase.from("reflections").delete().eq("id", id);
          setReflections((prev) => prev.filter((r) => r.id !== id));
        },
      },
    ]);
  };

  const handleShare = async (r: Reflection) => {
    const tagLabel =
      TAG_OPTIONS.find((t) => t.value === r.tag)?.label || "";
    const text = `${r.content}${r.hadith_ref ? `\n\nRef: ${r.hadith_ref}` : ""}${tagLabel ? `\n\n#${tagLabel}` : ""}\n\nWritten on Authentic Hadith`;
    await Share.share({ message: text });
  };

  if (!user) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Reflections",
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "#fff",
          }}
        />
        <View style={styles.center}>
          <Ionicons name="pencil" size={48} color={Colors.accent} />
          <Text style={styles.emptyTitle}>Sign in to write reflections</Text>
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const renderItem = ({ item }: { item: Reflection }) => {
    const tagInfo =
      TAG_OPTIONS.find((t) => t.value === item.tag) || TAG_OPTIONS[5];
    return (
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <View style={styles.cardMetaRow}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={Colors.textSecondary}
            />
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
            <View
              style={[styles.tagBadge, { backgroundColor: tagInfo.color + "20" }]}
            >
              <View
                style={[styles.tagDot, { backgroundColor: tagInfo.color }]}
              />
              <Text style={[styles.tagLabel, { color: tagInfo.color }]}>
                {tagInfo.label}
              </Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <Pressable onPress={() => handleShare(item)} hitSlop={8}>
              <Ionicons name="share-outline" size={16} color={Colors.accent} />
            </Pressable>
            <Pressable onPress={() => handleDelete(item.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={16} color={Colors.error} />
            </Pressable>
          </View>
        </View>
        <Text style={styles.reflectionContent}>{item.content}</Text>
        {item.hadith_ref && (
          <View style={styles.refRow}>
            <Ionicons
              name="book-outline"
              size={11}
              color={Colors.textSecondary}
            />
            <Text style={styles.refText}>{item.hadith_ref}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Reflections",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
          headerRight: () => (
            <Pressable
              onPress={() => setShowCompose(true)}
              style={styles.headerBtn}
            >
              <Ionicons name="add-circle" size={28} color="#fff" />
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Compose panel */}
        {showCompose && (
          <View style={styles.compose}>
            <Text style={styles.composeTitle}>New Reflection</Text>
            <TextInput
              style={styles.composeInput}
              placeholder="What is on your mind? Reflect on a hadith, an ayah, or a moment..."
              placeholderTextColor={Colors.textSecondary}
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TextInput
              style={styles.composeRefInput}
              placeholder="Hadith or Ayah reference (optional)"
              placeholderTextColor={Colors.textSecondary}
              value={newRef}
              onChangeText={setNewRef}
            />
            <View style={styles.tagRow}>
              {TAG_OPTIONS.map((t) => (
                <Pressable
                  key={t.value}
                  style={[
                    styles.tagOption,
                    newTag === t.value && {
                      backgroundColor: t.color + "20",
                      borderColor: t.color,
                    },
                  ]}
                  onPress={() => setNewTag(t.value)}
                >
                  <Text
                    style={[
                      styles.tagOptionText,
                      newTag === t.value && { color: t.color },
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.composeBtns}>
              <Pressable
                style={[
                  styles.saveBtn,
                  (!newContent.trim() || saving) && { opacity: 0.5 },
                ]}
                onPress={handleSave}
                disabled={!newContent.trim() || saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? "Saving..." : "Save Reflection"}
                </Text>
              </Pressable>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => {
                  setShowCompose(false);
                  setNewContent("");
                  setNewRef("");
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            style={styles.list}
            data={reflections}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !showCompose ? (
                <View style={styles.center}>
                  <Ionicons name="pencil" size={40} color={Colors.accent} />
                  <Text style={styles.emptyTitle}>Your Sacred Space</Text>
                  <Text style={styles.emptyText}>
                    Use this journal to reflect on hadiths, ayahs, or moments
                    in your spiritual journey. Everything here is private.
                  </Text>
                  <Pressable
                    style={styles.writeBtn}
                    onPress={() => setShowCompose(true)}
                  >
                    <Text style={styles.writeBtnText}>
                      Write Your First Reflection
                    </Text>
                  </Pressable>
                </View>
              ) : null
            }
          />
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  list: { flex: 1 },
  listContent: { paddingBottom: 32 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  headerBtn: { marginRight: 8 },
  compose: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    padding: 16,
  },
  composeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 10,
  },
  composeInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 100,
    marginBottom: 8,
  },
  composeRefInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: Colors.text,
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tagOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagOptionText: { fontSize: 11, fontWeight: "500", color: Colors.textSecondary },
  composeBtns: { flexDirection: "row", gap: 10 },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  saveBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  cancelBtn: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: "500" },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { fontSize: 12, color: Colors.textSecondary },
  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagLabel: { fontSize: 10, fontWeight: "600" },
  cardActions: { flexDirection: "row", gap: 12 },
  reflectionContent: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text,
  },
  refRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  refText: { fontSize: 11, color: Colors.textSecondary },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 300,
  },
  writeBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  writeBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  signInBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 16,
  },
  signInText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
