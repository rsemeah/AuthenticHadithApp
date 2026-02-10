/**
 * Expo Push Notifications — registration, permissions, foreground handling.
 */
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";

// Configure how notifications appear when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request push notification permissions and register the Expo push token.
 * Returns the token string or null if permissions denied.
 */
export async function registerForPushNotifications(
  userId: string
): Promise<string | null> {
  // Check existing permissions
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request if not already granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  // Get the Expo push token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: undefined, // Uses the projectId from app.json automatically
  });

  const token = tokenData.data;

  // Store in Supabase
  await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      token,
      platform: Platform.OS as "ios" | "android" | "web",
      device_name: `${Platform.OS} ${Platform.Version}`,
      is_active: true,
    },
    { onConflict: "user_id,token" }
  );

  // Android needs a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });

    await Notifications.setNotificationChannelAsync("daily-hadith", {
      name: "Daily Hadith",
      importance: Notifications.AndroidImportance.HIGH,
      description: "Your daily hadith reminder",
    });

    await Notifications.setNotificationChannelAsync("achievements", {
      name: "Achievements",
      importance: Notifications.AndroidImportance.DEFAULT,
      description: "Streak milestones, badges, and tier promotions",
    });
  }

  return token;
}

/**
 * Remove a push token (on sign out).
 */
export async function unregisterPushToken(userId: string): Promise<void> {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    await supabase
      .from("push_tokens")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("token", tokenData.data);
  } catch {
    // Token may not exist
  }
}

/**
 * Get the current badge count for unread notifications.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("notification_queue")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "sent")
    .is("data->read", null);

  return count ?? 0;
}

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  await supabase
    .from("notification_queue")
    .update({ data: { read: true } })
    .eq("id", notificationId);
}

/**
 * Fetch user's notifications for the inbox.
 */
export async function fetchNotifications(userId: string, limit = 50) {
  const { data } = await supabase
    .from("notification_queue")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["sent", "pending"])
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

/**
 * Fetch or create notification preferences for a user.
 */
export async function getNotificationPreferences(userId: string) {
  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (data) return data;

  // Create default preferences
  const { data: created } = await supabase
    .from("notification_preferences")
    .insert({ user_id: userId })
    .select()
    .single();

  return created;
}

/**
 * Update notification preferences.
 */
export async function updateNotificationPreferences(
  userId: string,
  updates: Record<string, unknown>
) {
  const { data } = await supabase
    .from("notification_preferences")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()
    .single();

  return data;
}
