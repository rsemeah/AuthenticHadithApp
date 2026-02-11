import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Share,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";

interface SunnahPractice {
  id: string;
  title: string;
  description: string;
  hadith_ref: string;
  collection: string;
}

interface SunnahCategory {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  description: string;
  iconName: string;
  color: string;
  practices: SunnahPractice[];
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  Moon: "moon-outline",
  HandHeart: "heart-outline",
  Home: "home-outline",
  Users: "people-outline",
  Utensils: "restaurant-outline",
  Clock: "time-outline",
};

const HARDCODED_CATEGORIES: SunnahCategory[] = [
  {
    id: "salah",
    slug: "salah",
    title: "Sunnah of Salah",
    titleAr: "سنن الصلاة",
    description:
      "Voluntary prayers, adhkar before and after salah, and prophetic etiquettes of worship",
    iconName: "Moon",
    color: Colors.primary,
    practices: [
      {
        id: "rawatib",
        title: "The Rawatib (Regular Sunnah Prayers)",
        description:
          "12 rak'ahs daily: 2 before Fajr, 4 before Dhuhr, 2 after Dhuhr, 2 after Maghrib, 2 after Isha",
        hadith_ref: "Hadith 1761",
        collection: "Jami at-Tirmidhi",
      },
      {
        id: "duha",
        title: "Salat al-Duha (Forenoon Prayer)",
        description:
          "The Prophet would pray between 2-8 rak'ahs after sunrise",
        hadith_ref: "Book 8, Hadith 669",
        collection: "Sahih Muslim",
      },
      {
        id: "witr",
        title: "Witr Prayer",
        description:
          "An odd-numbered prayer performed after Isha, the last prayer of the night",
        hadith_ref: "Book 14, Hadith 1",
        collection: "Sunan Abu Dawud",
      },
    ],
  },
  {
    id: "character",
    slug: "character",
    title: "Sunnah of Character",
    titleAr: "سنن الأخلاق",
    description:
      "The prophetic way of dealing with people: kindness, patience, honesty, and mercy",
    iconName: "HandHeart",
    color: "#c9a84c",
    practices: [
      {
        id: "smile",
        title: "Smiling",
        description:
          "Your smiling in the face of your brother is charity",
        hadith_ref: "Hadith 1956",
        collection: "Jami at-Tirmidhi",
      },
      {
        id: "greet",
        title: "Spreading Salam",
        description:
          "Spread peace, feed the hungry, pray at night while people sleep, and you will enter Paradise",
        hadith_ref: "Hadith 1334",
        collection: "Sunan Ibn Majah",
      },
      {
        id: "patience",
        title: "Patience in Difficulty",
        description:
          "How wonderful is the affair of the believer, for all of it is good",
        hadith_ref: "Book 55, Hadith 82",
        collection: "Sahih Muslim",
      },
    ],
  },
  {
    id: "home",
    slug: "home",
    title: "Sunnah at Home",
    titleAr: "سنن المنزل",
    description:
      "Prophetic practices for the household: entering, eating, sleeping, and family life",
    iconName: "Home",
    color: "#3b82f6",
    practices: [
      {
        id: "enter",
        title: "Entering the Home",
        description:
          "Say salam when entering, mention Allah's name, and eat",
        hadith_ref: "Book 36, Hadith 28",
        collection: "Sahih Muslim",
      },
      {
        id: "sleep",
        title: "Sleeping Etiquette",
        description:
          "Sleep on your right side, recite Ayat al-Kursi and the last three surahs",
        hadith_ref: "Book 75, Hadith 7",
        collection: "Sahih Bukhari",
      },
    ],
  },
  {
    id: "people",
    slug: "people",
    title: "Sunnah with People",
    titleAr: "سنن المعاملات",
    description:
      "How the Prophet interacted with neighbors, guests, the elderly, and children",
    iconName: "Users",
    color: "#7c3aed",
    practices: [
      {
        id: "neighbor",
        title: "Rights of the Neighbor",
        description:
          "Jibril kept advising me about the neighbor until I thought he would inherit from me",
        hadith_ref: "Book 45, Hadith 28",
        collection: "Sahih Bukhari",
      },
      {
        id: "guest",
        title: "Honoring the Guest",
        description:
          "Whoever believes in Allah and the Last Day, let him honor his guest",
        hadith_ref: "Book 79, Hadith 6019",
        collection: "Sahih Bukhari",
      },
    ],
  },
  {
    id: "food",
    slug: "food",
    title: "Sunnah of Eating",
    titleAr: "سنن الطعام",
    description:
      "Prophetic etiquettes of food: bismillah, eating with the right hand, and gratitude",
    iconName: "Utensils",
    color: "#059669",
    practices: [
      {
        id: "bismillah",
        title: "Saying Bismillah",
        description:
          "Mention Allah's name, eat with your right hand, and eat what is nearest to you",
        hadith_ref: "Book 70, Hadith 5376",
        collection: "Sahih Bukhari",
      },
      {
        id: "moderation",
        title: "Moderation in Eating",
        description:
          "A third for food, a third for drink, and a third for air",
        hadith_ref: "Hadith 2380",
        collection: "Jami at-Tirmidhi",
      },
    ],
  },
  {
    id: "daily",
    slug: "daily",
    title: "Daily Sunnah",
    titleAr: "أذكار اليوم",
    description:
      "Morning and evening adhkar, remembrances throughout the day",
    iconName: "Clock",
    color: "#d97706",
    practices: [
      {
        id: "morning",
        title: "Morning Adhkar",
        description:
          "Supplications to recite between Fajr and sunrise for protection and blessings",
        hadith_ref: "Book 49",
        collection: "Jami at-Tirmidhi",
      },
      {
        id: "evening",
        title: "Evening Adhkar",
        description:
          "Supplications to recite between Asr and Maghrib",
        hadith_ref: "Book 49",
        collection: "Jami at-Tirmidhi",
      },
      {
        id: "istighfar",
        title: "Seeking Forgiveness",
        description:
          "The Prophet would seek forgiveness more than 70 times a day",
        hadith_ref: "Book 80, Hadith 6307",
        collection: "Sahih Bukhari",
      },
    ],
  },
];

export default function SunnahScreen() {
  const [categories, setCategories] =
    useState<SunnahCategory[]>(HARDCODED_CATEGORIES);
  const [expanded, setExpanded] = useState<string | null>("salah");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromDB();
  }, []);

  const loadFromDB = async () => {
    const { data: cats } = await supabase
      .from("sunnah_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!cats || cats.length === 0) {
      setLoading(false);
      return;
    }

    const { data: practices } = await supabase
      .from("sunnah_practices")
      .select("*")
      .order("sort_order", { ascending: true });

    const dbCategories: SunnahCategory[] = cats.map((cat: any) => ({
      id: cat.slug,
      slug: cat.slug,
      title: cat.title,
      titleAr: cat.title_ar,
      description: cat.description,
      iconName: cat.icon || "Moon",
      color: cat.color || Colors.primary,
      practices: (practices || [])
        .filter((p: any) => p.category_id === cat.id)
        .map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          hadith_ref: p.hadith_ref,
          collection: p.collection,
        })),
    }));

    setCategories(dbCategories);
    setLoading(false);
  };

  const sharePractice = async (
    practice: SunnahPractice,
    catTitle: string
  ) => {
    const text = `${practice.title}\n\n"${practice.description}"\n\n-- ${practice.collection}, ${practice.hadith_ref}\n\nFrom the ${catTitle} collection on Authentic Hadith`;
    await Share.share({ message: text });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Sunnah",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Intro */}
          <View style={styles.introCard}>
            <Ionicons name="heart" size={20} color={Colors.accent} />
            <Text style={styles.introText}>
              Beyond the academic study of hadith, the{" "}
              <Text style={{ fontWeight: "700" }}>Sunnah</Text> is the living
              tradition -- the daily acts, habits, and character of the Prophet
              (peace be upon him) that we can embody today.
            </Text>
          </View>

          {/* Categories */}
          {categories.map((cat) => {
            const isExpanded = expanded === cat.id;
            const iconName = ICON_MAP[cat.iconName] || "ellipse-outline";

            return (
              <View key={cat.id} style={styles.catCard}>
                <Pressable
                  style={styles.catHeader}
                  onPress={() =>
                    setExpanded(isExpanded ? null : cat.id)
                  }
                >
                  <View
                    style={[
                      styles.catIcon,
                      { backgroundColor: cat.color + "15" },
                    ]}
                  >
                    <Ionicons
                      name={iconName}
                      size={20}
                      color={cat.color}
                    />
                  </View>
                  <View style={styles.catTextCol}>
                    <View style={styles.catTitleRow}>
                      <Text style={styles.catTitle}>{cat.title}</Text>
                      <Text style={styles.catTitleAr}>{cat.titleAr}</Text>
                    </View>
                    <Text style={styles.catDesc} numberOfLines={1}>
                      {cat.description}
                    </Text>
                  </View>
                  <View style={styles.catCountBadge}>
                    <Text style={styles.catCountText}>
                      {cat.practices.length}
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-down" : "chevron-forward"}
                    size={16}
                    color={Colors.textSecondary}
                  />
                </Pressable>

                {isExpanded &&
                  cat.practices.map((p) => (
                    <View key={p.id} style={styles.practiceItem}>
                      <View style={styles.practiceHead}>
                        <Text style={styles.practiceTitle}>{p.title}</Text>
                        <Pressable
                          onPress={() => sharePractice(p, cat.title)}
                          hitSlop={8}
                        >
                          <Ionicons
                            name="share-outline"
                            size={16}
                            color={Colors.accent}
                          />
                        </Pressable>
                      </View>
                      <Text style={styles.practiceDesc}>{p.description}</Text>
                      <View style={styles.practiceRef}>
                        <Ionicons
                          name="book-outline"
                          size={11}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.practiceRefText}>
                          {p.collection} - {p.hadith_ref}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            );
          })}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  introCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  introText: { flex: 1, fontSize: 13, color: Colors.text, lineHeight: 20 },
  catCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  catTextCol: { flex: 1 },
  catTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  catTitle: { fontSize: 14, fontWeight: "600", color: Colors.text },
  catTitleAr: {
    fontSize: 12,
    color: Colors.textSecondary + "90",
    writingDirection: "rtl",
  },
  catDesc: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  catCountBadge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  catCountText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  practiceItem: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    padding: 14,
  },
  practiceHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  practiceTitle: { fontSize: 14, fontWeight: "600", color: Colors.text },
  practiceDesc: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 6,
  },
  practiceRef: { flexDirection: "row", alignItems: "center", gap: 4 },
  practiceRefText: { fontSize: 10, color: Colors.textSecondary },
});
