import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";
import { HADITH_COLUMNS } from "../../lib/queries";
import HadithCard, { Hadith } from "../../components/HadithCard";

export default function CollectionDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const collectionName = decodeURIComponent(name ?? "");

  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!collectionName) return;
    fetchCollection();
  }, [collectionName]);

  const fetchCollection = async () => {
    setLoading(true);

    // Get total count
    const { count } = await supabase
      .from("hadith")
      .select("id", { count: "exact", head: true })
      .eq("collection_name", collectionName);

    setTotal(count ?? 0);

    // Fetch first page
    const { data } = await supabase
      .from("hadith")
      .select(HADITH_COLUMNS)
      .eq("collection_name", collectionName)
      .order("hadith_number", { ascending: true })
      .limit(50);

    setHadiths(data ?? []);
    setLoading(false);
  };

  const loadMore = async () => {
    if (hadiths.length >= total) return;

    const { data } = await supabase
      .from("hadith")
      .select(HADITH_COLUMNS)
      .eq("collection_name", collectionName)
      .order("hadith_number", { ascending: true })
      .range(hadiths.length, hadiths.length + 49);

    if (data && data.length > 0) {
      setHadiths((prev) => [...prev, ...data]);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: collectionName || "Collection",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading collection...</Text>
        </View>
      ) : (
        <FlatList
          style={styles.container}
          data={hadiths}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <Text style={styles.countText}>
              {total.toLocaleString()} hadith in this collection
            </Text>
          }
          renderItem={({ item }) => <HadithCard hadith={item} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                No hadith found in this collection.
              </Text>
            </View>
          }
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  countText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
