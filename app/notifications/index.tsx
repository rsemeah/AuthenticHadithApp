import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../lib/colors";
import { useAuth } from "../../lib/auth";
import { fetchNotifications } from "../../lib/notifications";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  status: string;
  template_slug: string | null;
  created_at: string;
}

const ICON_MAP: Record<string, string> = {
  daily_hadith: "book-outline",
  streak_milestone: "flame-outline",
  streak_at_risk: "alert-outline",
  badge_earned: "ribbon-outline",
  tier_up: "trending-up-outline",
  lesson_complete: "checkmark-circle-outline",
  quiz_perfect: "trophy-outline",
  path_complete: "flag-outline",
  referral_redeemed: "people-outline",
  inactive_reminder: "time-outline",
  promo_expiring: "card-outline",
  new_lesson: "add-circle-outline",
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) load();
    else setLoading(false);
  }, [user]);

  const load = async () => {
    setLoading(true);
    const data = await fetchNotifications(user!.id);
    setNotifications(data);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    const data = await fetchNotifications(user.id);
    setNotifications(data);
    setRefreshing(false);
  }, [user]);

  const getIcon = (slug: string | null) =>
    ICON_MAP[slug ?? ""] ?? "notifications-outline";

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isRead = !!(item.data as any)?.read;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.item,
          !isRead && styles.itemUnread,
          { opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isRead ? Colors.border + "40" : Colors.primary + "14" },
          ]}
        >
          <Ionicons
            name={getIcon(item.template_slug) as any}
            size={20}
            color={isRead ? Colors.textSecondary : Colors.primary}
          />
        </View>
        <View style={styles.itemBody}>
          <Text
            style={[styles.itemTitle, !isRead && styles.itemTitleUnread]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.itemText} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.itemTime}>{getTimeAgo(item.created_at)}</Text>
        </View>
      </Pressable>
    );
  };

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ title: "Notifications" }} />
        <View style={styles.center}>
          <Ionicons name="notifications-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyText}>Sign in to see your notifications.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Notifications",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/settings/notifications")}
              hitSlop={8}
            >
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </Pressable>
          ),
        }}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          style={styles.container}
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="notifications-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyText}>No notifications yet.</Text>
              <Text style={styles.emptyHint}>
                Complete lessons, take quizzes, and maintain your streak to earn
                notifications.
              </Text>
            </View>
          }
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: Colors.background,
  },
  list: { padding: 12, paddingBottom: 32 },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  itemUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  itemBody: { flex: 1 },
  itemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
  },
  itemTitleUnread: {
    fontWeight: "700",
  },
  itemText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  itemTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 32,
  },
});
