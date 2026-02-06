import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";

interface Collection {
  name: string;
  count: number;
}

export default function CollectionsScreen() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch distinct collection names with counts using RPC or manual grouping
      const { data, error: fetchError } = await supabase
        .from("hadith")
        .select("collection_name");

      if (fetchError) throw fetchError;

      // Group and count client-side
      const counts: Record<string, number> = {};
      (data ?? []).forEach((row: { collection_name: string }) => {
        counts[row.collection_name] = (counts[row.collection_name] || 0) + 1;
      });

      const sorted = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setCollections(sorted);
    } catch (e: any) {
      setError(e.message || "Failed to load collections.");
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (collectionName: string) => {
    router.push(`/search?collection=${encodeURIComponent(collectionName)}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading collections...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={fetchCollections}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={collections}
      keyExtractor={(item) => item.name}
      numColumns={2}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [
            styles.card,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => handlePress(item.name)}
        >
          <Ionicons name="book" size={28} color={Colors.primary} />
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.cardCount}>
            {item.count.toLocaleString()} hadith
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 12,
  },
  row: {
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: Colors.error,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    margin: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 120,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    marginTop: 8,
  },
  cardCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
