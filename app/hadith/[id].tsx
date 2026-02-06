import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";
import { HADITH_COLUMNS } from "../../lib/queries";
import HadithCard, { Hadith } from "../../components/HadithCard";

export default function HadithDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchHadith();
  }, [id]);

  const fetchHadith = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("hadith")
        .select(HADITH_COLUMNS)
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      setHadith(data);
    } catch (e: any) {
      setError(e.message || "Failed to load hadith.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={fetchHadith}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!hadith) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Hadith not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <HadithCard hadith={hadith} showFull />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
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
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
