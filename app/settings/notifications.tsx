import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../lib/colors";
import { useAuth } from "../../lib/auth";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../../lib/notifications";

interface Prefs {
  daily_hadith: boolean;
  daily_hadith_time: string;
  learning_reminders: boolean;
  streak_alerts: boolean;
  social_notifications: boolean;
  email_reminders: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
}

const TIME_OPTIONS = [
  { label: "After Fajr (6:00 AM)", value: "06:00" },
  { label: "Morning (8:00 AM)", value: "08:00" },
  { label: "Midday (12:00 PM)", value: "12:00" },
  { label: "After Asr (4:00 PM)", value: "16:00" },
  { label: "After Maghrib (7:00 PM)", value: "19:00" },
  { label: "After Isha (9:00 PM)", value: "21:00" },
];

export default function NotificationSettingsScreen() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadPrefs();
    else setLoading(false);
  }, [user]);

  const loadPrefs = async () => {
    const data = await getNotificationPreferences(user!.id);
    if (data) setPrefs(data as any);
    setLoading(false);
  };

  const toggle = async (key: keyof Prefs, value: boolean) => {
    if (!user || !prefs) return;
    setPrefs({ ...prefs, [key]: value });
    setSaving(true);
    await updateNotificationPreferences(user.id, { [key]: value });
    setSaving(false);
  };

  const setTime = async (time: string) => {
    if (!user || !prefs) return;
    setPrefs({ ...prefs, daily_hadith_time: time });
    setSaving(true);
    await updateNotificationPreferences(user.id, { daily_hadith_time: time });
    setSaving(false);
  };

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ title: "Notification Settings" }} />
        <View style={styles.center}>
          <Text style={styles.emptyText}>Sign in to manage notifications.</Text>
        </View>
      </>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Notification Settings" }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {saving && (
          <View style={styles.savingBanner}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        )}

        {/* Daily Hadith */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Hadith</Text>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Ionicons name="book-outline" size={20} color={Colors.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Daily Hadith Reminder</Text>
                <Text style={styles.rowDesc}>
                  Receive a hadith every day at your preferred time
                </Text>
              </View>
            </View>
            <Switch
              value={prefs?.daily_hadith ?? true}
              onValueChange={(v) => toggle("daily_hadith", v)}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>

          {prefs?.daily_hadith && (
            <View style={styles.timeSelector}>
              <Text style={styles.timeLabel}>Preferred Time</Text>
              <View style={styles.timeOptions}>
                {TIME_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.timeChip,
                      prefs.daily_hadith_time === opt.value && styles.timeChipActive,
                    ]}
                    onPress={() => setTime(opt.value)}
                  >
                    <Text
                      style={[
                        styles.timeChipText,
                        prefs.daily_hadith_time === opt.value &&
                          styles.timeChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Learning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning</Text>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Ionicons name="school-outline" size={20} color={Colors.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Learning Reminders</Text>
                <Text style={styles.rowDesc}>
                  Nudges when you haven't completed a lesson in 3 days
                </Text>
              </View>
            </View>
            <Switch
              value={prefs?.learning_reminders ?? true}
              onValueChange={(v) => toggle("learning_reminders", v)}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Ionicons name="flame-outline" size={20} color={Colors.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Streak & Badge Alerts</Text>
                <Text style={styles.rowDesc}>
                  Streak milestones, badges earned, and tier promotions
                </Text>
              </View>
            </View>
            <Switch
              value={prefs?.streak_alerts ?? true}
              onValueChange={(v) => toggle("streak_alerts", v)}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Social */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social</Text>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Ionicons name="people-outline" size={20} color={Colors.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Social Notifications</Text>
                <Text style={styles.rowDesc}>
                  When someone joins using your referral code
                </Text>
              </View>
            </View>
            <Switch
              value={prefs?.social_notifications ?? true}
              onValueChange={(v) => toggle("social_notifications", v)}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email</Text>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Ionicons name="mail-outline" size={20} color={Colors.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Email Reminders</Text>
                <Text style={styles.rowDesc}>
                  Inactivity reminders, weekly digests, and account updates
                </Text>
              </View>
            </View>
            <Switch
              value={prefs?.email_reminders ?? true}
              onValueChange={(v) => toggle("email_reminders", v)}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Ionicons name="moon-outline" size={20} color={Colors.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Enable Quiet Hours</Text>
                <Text style={styles.rowDesc}>
                  No push notifications between 10 PM and 6 AM
                </Text>
              </View>
            </View>
            <Switch
              value={prefs?.quiet_hours_enabled ?? false}
              onValueChange={(v) => toggle("quiet_hours_enabled", v)}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
  savingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
    backgroundColor: Colors.primary + "10",
  },
  savingText: { fontSize: 13, color: Colors.primary, fontWeight: "600" },

  section: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
    marginRight: 12,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: "600", color: Colors.text },
  rowDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },

  timeSelector: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  timeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeChipText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500",
  },
  timeChipTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
});
