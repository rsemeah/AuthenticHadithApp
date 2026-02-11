import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Colors } from "../../lib/colors";

const TOTAL_STEPS = 3;

const COLLECTIONS = [
  { slug: "sahih-bukhari", name: "Sahih al-Bukhari" },
  { slug: "sahih-muslim", name: "Sahih Muslim" },
  { slug: "sunan-abu-dawud", name: "Sunan Abu Dawud" },
  { slug: "jami-tirmidhi", name: "Jami at-Tirmidhi" },
  { slug: "sunan-nasai", name: "Sunan an-Nasai" },
  { slug: "sunan-ibn-majah", name: "Sunan Ibn Majah" },
  { slug: "muwatta-malik", name: "Muwatta Malik" },
  { slug: "musnad-ahmad", name: "Musnad Ahmad" },
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const SCHOOLS = ["Hanafi", "Maliki", "Shafi'i", "Hanbali", "No preference"];

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 data
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");

  // Step 2 data
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [level, setLevel] = useState("Intermediate");

  // Step 3 data
  const [safetyAgreed, setSafetyAgreed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const canProceed = () => {
    switch (step) {
      case 1:
        return name.trim().length >= 2;
      case 2:
        return true;
      case 3:
        return safetyAgreed && termsAgreed;
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Update profile
      await supabase
        .from("profiles")
        .update({
          display_name: name.trim(),
        })
        .eq("id", user.id);

      // Insert or update preferences
      const prefsPayload = {
        user_id: user.id,
        language: "english",
        collections_of_interest: selectedCollections,
        learning_level: level.toLowerCase(),
        onboarded: true,
      };

      const { data: existing } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("user_preferences")
          .update(prefsPayload)
          .eq("user_id", user.id);
      } else {
        await supabase.from("user_preferences").insert(prefsPayload);
      }

      await refreshProfile();
      router.replace("/(tabs)");
    } catch {
      // Continue anyway
      router.replace("/(tabs)");
    }
    setLoading(false);
  };

  const toggleCollection = (slug: string) => {
    setSelectedCollections((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          headerLeft: () =>
            step > 1 ? (
              <Pressable onPress={() => setStep(step - 1)}>
                <Ionicons name="arrow-back" size={24} color={Colors.text} />
              </Pressable>
            ) : null,
          headerRight: () =>
            step === 1 ? (
              <Pressable onPress={() => router.replace("/(tabs)")}>
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
            ) : null,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress */}
        <View style={styles.progressRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i < step && { backgroundColor: Colors.accent },
              ]}
            />
          ))}
        </View>

        {/* Step 1: Profile */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Welcome to Authentic Hadith</Text>
            <Text style={styles.stepSub}>
              Let's set up your profile in a few quick steps.
            </Text>

            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="words"
            />

            <Text style={[styles.label, { marginTop: 20 }]}>
              School of Thought (optional)
            </Text>
            <View style={styles.optionsWrap}>
              {SCHOOLS.map((s) => (
                <Pressable
                  key={s}
                  style={[
                    styles.optionChip,
                    school === s && styles.optionChipActive,
                  ]}
                  onPress={() => setSchool(s)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      school === s && styles.optionChipTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Your Preferences</Text>
            <Text style={styles.stepSub}>
              Select collections you're interested in and your learning level.
            </Text>

            <Text style={styles.label}>Collections of Interest</Text>
            <View style={styles.optionsWrap}>
              {COLLECTIONS.map((c) => (
                <Pressable
                  key={c.slug}
                  style={[
                    styles.optionChip,
                    selectedCollections.includes(c.slug) &&
                      styles.optionChipActive,
                  ]}
                  onPress={() => toggleCollection(c.slug)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      selectedCollections.includes(c.slug) &&
                        styles.optionChipTextActive,
                    ]}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>
              Learning Level
            </Text>
            <View style={styles.optionsWrap}>
              {LEVELS.map((l) => (
                <Pressable
                  key={l}
                  style={[
                    styles.optionChip,
                    level === l && styles.optionChipActive,
                  ]}
                  onPress={() => setLevel(l)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      level === l && styles.optionChipTextActive,
                    ]}
                  >
                    {l}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Safety Agreement */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Almost Done</Text>
            <Text style={styles.stepSub}>
              Please review and agree to the following before we begin.
            </Text>

            <View style={styles.agreementCard}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
              <Text style={styles.agreementTitle}>Content Safety</Text>
              <Text style={styles.agreementDesc}>
                This app presents hadith content for educational purposes only.
                Always consult qualified scholars for religious rulings and
                interpretations.
              </Text>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                I understand this app is for educational purposes
              </Text>
              <Switch
                value={safetyAgreed}
                onValueChange={setSafetyAgreed}
                trackColor={{ true: Colors.primary }}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                I agree to the terms of service
              </Text>
              <Switch
                value={termsAgreed}
                onValueChange={setTermsAgreed}
                trackColor={{ true: Colors.primary }}
              />
            </View>
          </View>
        )}

        {/* Navigation */}
        <View style={styles.navRow}>
          {step < TOTAL_STEPS ? (
            <Pressable
              style={[styles.nextBtn, !canProceed() && { opacity: 0.4 }]}
              onPress={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.nextBtn,
                { backgroundColor: Colors.primary },
                (!canProceed() || loading) && { opacity: 0.4 },
              ]}
              onPress={handleComplete}
              disabled={!canProceed() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.nextBtnText}>Complete</Text>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 24, paddingBottom: 48 },
  skipText: { fontSize: 14, color: Colors.textSecondary },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
  },
  stepSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
  },
  optionChipActive: {
    backgroundColor: Colors.accent + "20",
    borderColor: Colors.accent,
  },
  optionChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  optionChipTextActive: {
    color: Colors.accent,
    fontWeight: "600",
  },
  agreementCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  agreementTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 10,
    marginBottom: 6,
  },
  agreementDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  switchLabel: { flex: 1, fontSize: 14, color: Colors.text, marginRight: 12 },
  navRow: { marginTop: 32, alignItems: "flex-end" },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  nextBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
});
