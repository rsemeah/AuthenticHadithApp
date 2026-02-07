import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";
import { HADITH_COLUMNS } from "../../lib/queries";
import HadithCard, { Hadith } from "../../components/HadithCard";

export default function SearchScreen() {
  const params = useLocalSearchParams<{ collection?: string }>();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState<string | null>(
    params.collection ?? null
  );

  const performSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed && !collectionFilter) return;

    setLoading(true);
    setSearched(true);
    try {
      let q = supabase.from("hadith").select(HADITH_COLUMNS);

      if (collectionFilter) {
        q = q.eq("collection_name", collectionFilter);
      }

      if (trimmed) {
        // Use full-text search on tsv column, fall back to ilike for Arabic
        q = q.or(`english_text.ilike.%${trimmed}%,arabic_text.ilike.%${trimmed}%`);
      }

      const { data, error } = await q.limit(50);

      if (error) throw error;
      setResults(data ?? []);
    } catch (e: any) {
      console.error("Search error:", e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, collectionFilter]);

  const clearFilter = () => {
    setCollectionFilter(null);
    setResults([]);
    setSearched(false);
  };

  return (
    <View style={styles.container}>
      {collectionFilter && (
        <View style={styles.filterBar}>
          <Text style={styles.filterText}>
            Filtering: {collectionFilter}
          </Text>
          <Pressable onPress={clearFilter}>
            <Ionicons name="close-circle" size={20} color={Colors.error} />
          </Pressable>
        </View>
      )}

      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={20}
          color={Colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Search hadith in English or Arabic..."
          placeholderTextColor={Colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={performSearch}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={() => { setQuery(""); setResults([]); setSearched(false); }}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <Pressable style={styles.searchBtn} onPress={performSearch}>
        <Text style={styles.searchBtnText}>Search</Text>
      </Pressable>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {!loading && searched && results.length === 0 && (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyText}>No hadith found for that query.</Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <HadithCard hadith={item} />}
          contentContainerStyle={styles.listContent}
        />
      )}

      {!searched && !loading && (
        <View style={styles.center}>
          <Ionicons name="book-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyText}>
            Search across {collectionFilter ? collectionFilter : "all collections"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.accent + "22",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primaryDark,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    margin: 16,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: Colors.text,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  searchBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 32,
  },
});
