import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";
import { HADITH_COLUMNS } from "../../lib/queries";
import HadithCard, { Hadith } from "../../components/HadithCard";
import { useAuth } from "../../lib/auth";

export default function HomeScreen() {
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isPremium } = useAuth();
  const router = useRouter();

  const fetchRandomHadith = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
  }, []);

  useEffect(() => {
    fetchRandomHadith();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={fetchRandomHadith}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text>
        <Text style={styles.title}>Authentic Hadith</Text>
        <Text style={styles.subtitle}>
          Verified narrations from the Prophet Muhammad (peace be upon him)
        </Text>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={14} color="#fff" />
            <Text style={styles.premiumText}>Premium Active</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Pressable
          style={({ pressed }) => [styles.actionCard, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Ionicons name="search" size={28} color={Colors.primary} />
          <Text style={styles.actionText}>Search</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionCard, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.push("/(tabs)/collections")}
        >
          <Ionicons name="library" size={28} color={Colors.primary} />
          <Text style={styles.actionText}>Collections</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionCard, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.push("/(tabs)/learn")}
        >
          <Ionicons name="school" size={28} color={Colors.primary} />
          <Text style={styles.actionText}>Learn</Text>
          {!isPremium && <Text style={styles.limitBadge}>3/day</Text>}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionCard, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.push("/(tabs)/assistant")}
        >
          <Ionicons name="sparkles" size={28} color={Colors.primary} />
          <Text style={styles.actionText}>Assistant</Text>
          {!isPremium && <Text style={styles.limitBadge}>5/day</Text>}
        </Pressable>
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
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  premiumText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 16,
    paddingBottom: 8,
  },
  actionCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 6,
  },
  limitBadge: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 12,
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
