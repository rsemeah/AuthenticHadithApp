import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../lib/colors";

export interface Hadith {
  id: number;
  collection_name: string;
  book_number: number | null;
  hadith_number: number | null;
  text_ar: string;
  text_en: string;
  grade: string | null;
}

interface Props {
  hadith: Hadith;
  showFull?: boolean;
}

function gradeColor(grade: string | null): string {
  if (!grade) return Colors.textSecondary;
  const g = grade.toLowerCase();
  if (g.includes("sahih")) return "#2e7d32";
  if (g.includes("hasan")) return "#f9a825";
  if (g.includes("daif") || g.includes("da'if")) return "#d32f2f";
  return Colors.textSecondary;
}

export default function HadithCard({ hadith, showFull = false }: Props) {
  const router = useRouter();

  const content = (
    <View style={styles.card}>
      <View style={styles.meta}>
        <Text style={styles.collection}>{hadith.collection_name}</Text>
        {hadith.hadith_number != null && (
          <Text style={styles.number}>#{hadith.hadith_number}</Text>
        )}
        {hadith.grade && (
          <Text style={[styles.grade, { color: gradeColor(hadith.grade) }]}>
            {hadith.grade}
          </Text>
        )}
      </View>

      <Text
        style={styles.arabic}
        numberOfLines={showFull ? undefined : 4}
      >
        {hadith.text_ar}
      </Text>

      <Text
        style={styles.english}
        numberOfLines={showFull ? undefined : 4}
      >
        {hadith.text_en}
      </Text>

      {hadith.book_number != null && (
        <Text style={styles.bookInfo}>Book {hadith.book_number}</Text>
      )}
    </View>
  );

  if (showFull) return content;

  return (
    <Pressable
      onPress={() => router.push(`/hadith/${hadith.id}`)}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  collection: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  number: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  grade: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  arabic: {
    fontSize: 18,
    lineHeight: 32,
    color: Colors.textArabic,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 12,
    fontFamily: undefined, // uses system Arabic font
  },
  english: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text,
    marginBottom: 8,
  },
  bookInfo: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
