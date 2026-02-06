import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";
import { HADITH_COLUMNS } from "../../lib/queries";
import HadithCard, { Hadith } from "../../components/HadithCard";

export default function HomeScreen() {
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomHadith = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get total count, then fetch a random one
      const { count } = await supabase
        .from("hadith")
        .select("id", { count: "exact", head: true });

      if (!count || count === 0) {
        setError("No hadith found in the database.");
        return;
      }

      const randomOffset = Math.floor(Math.random() * count);
      const { data, error: fetchError } = await supabase
        .from("hadith")
        .select(HADITH_COLUMNS)
        .range(randomOffset, randomOffset)
        .single();

      if (fetchError) throw fetchError;
      setHadith(data);
    } catch (e: any) {
      setError(e.message || "Failed to fetch hadith.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomHadith();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text>
        <Text style={styles.title}>Authentic Hadith</Text>
        <Text style={styles.subtitle}>
          Verified narrations from the Prophet Muhammad (peace be upon him)
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Hadith of the Moment</Text>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading hadith...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={fetchRandomHadith}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && hadith && <HadithCard hadith={hadith} />}

      {!loading && !error && (
        <Pressable style={styles.refreshBtn} onPress={fetchRandomHadith}>
          <Text style={styles.refreshText}>Show Another</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: "center",
  },
  bismillah: {
    fontSize: 22,
    color: Colors.accent,
    marginBottom: 8,
    fontWeight: "500",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 20,
    marginBottom: 4,
    marginHorizontal: 16,
  },
  center: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  errorBox: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fdecea",
    borderRadius: 8,
    alignItems: "center",
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: Colors.error,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  refreshBtn: {
    alignSelf: "center",
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
