import { useState, useCallback, useEffect } from "react";
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
import { expandQuery, buildTsQuery } from "../../lib/topics";

export default function SearchScreen() {
  const params = useLocalSearchParams<{
    collection?: string;
    q?: string;
    label?: string;
  }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [results, setResults] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState<string | null>(
    params.collection ?? null
  );

  // Auto-search when arriving from Learn topic chips
  useEffect(() => {
    if (params.q) {
      setQuery(params.q);
      performSmartSearch(params.q);
    }
  }, [params.q]);

  const performSmartSearch = async (searchQuery?: string) => {
    const trimmed = (searchQuery ?? query).trim();
    if (!trimmed && !collectionFilter) return;

    setLoading(true);
    setSearched(true);
    try {
      let data: Hadith[] | null = null;

      if (trimmed) {
        // Smart search: expand query with synonyms, then try tsv first
        const expanded = expandQuery(trimmed);
        const tsQuery = buildTsQuery(expanded);

        // Try full-text search first
        if (tsQuery) {
          let q = supabase
            .from("hadith")
            .select(HADITH_COLUMNS)
            .textSearch("tsv", tsQuery, { type: "plain" });

          if (collectionFilter) {
            q = q.eq("collection_name", collectionFilter);
          }

          const { data: tsvData } = await q.limit(50);
          if (tsvData && tsvData.length > 0) {
            data = tsvData;
          }
        }

        // Fallback: ilike with expanded terms
        if (!data || data.length === 0) {
          const topTerms = expanded.slice(0, 4);
          for (const term of topTerms) {
            if (term.length < 3) continue;
            let q = supabase
              .from("hadith")
              .select(HADITH_COLUMNS)
              .or(
                `english_text.ilike.%${term}%,arabic_text.ilike.%${term}%`
              );

            if (collectionFilter) {
              q = q.eq("collection_name", collectionFilter);
            }

            const { data: iLikeData } = await q.limit(50);
            if (iLikeData && iLikeData.length > 0) {
              data = iLikeData;
              break;
            }
          }
        }

        // Final fallback: original query
        if (!data || data.length === 0) {
          let q = supabase
            .from("hadith")
            .select(HADITH_COLUMNS)
            .or(
              `english_text.ilike.%${trimmed}%,arabic_text.ilike.%${trimmed}%`
            );

          if (collectionFilter) {
            q = q.eq("collection_name", collectionFilter);
          }

          const { data: fallbackData } = await q.limit(50);
          data = fallbackData;
        }
      } else {
        // Collection-only browse
        let q = supabase.from("hadith").select(HADITH_COLUMNS);
        if (collectionFilter) {
          q = q.eq("collection_name", collectionFilter);
        }
        const { data: browseData } = await q.limit(50);
        data = browseData;
      }

      setResults(data ?? []);
    } catch (e: any) {
      console.error("Search error:", e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

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
          placeholder="Search hadith — try 'washing', 'patience', 'wives'..."
          placeholderTextColor={Colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => performSmartSearch()}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery("");
              setResults([]);
              setSearched(false);
            }}
          >
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <Pressable
        style={styles.searchBtn}
        onPress={() => performSmartSearch()}
      >
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
          <Text style={styles.emptyText}>
            No hadith found. Try different words — e.g. "prayer" instead of
            "salah", or "eating" instead of "food".
          </Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <>
          <Text style={styles.resultCount}>
            {results.length} result{results.length !== 1 ? "s" : ""}
          </Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <HadithCard hadith={item} />}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}

      {!searched && !loading && (
        <View style={styles.center}>
          <Ionicons name="book-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyText}>
            Search across{" "}
            {collectionFilter ? collectionFilter : "all collections"}
          </Text>
          <Text style={styles.hintText}>
            Smart search understands related terms — "washing" also finds wudu,
            ablution, purification
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
    paddingHorizontal: 24,
  },
  emptyText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  hintText: {
    marginTop: 8,
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 18,
  },
  resultCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  listContent: {
    paddingBottom: 32,
  },
});
