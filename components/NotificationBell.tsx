/**
 * NotificationBell — Header icon with unread badge count.
 */
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../lib/colors";

interface Props {
  unreadCount: number;
  color?: string;
}

export default function NotificationBell({ unreadCount, color = "#fff" }: Props) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/notifications")}
      hitSlop={8}
      style={styles.container}
    >
      <Ionicons
        name={unreadCount > 0 ? "notifications" : "notifications-outline"}
        size={22}
        color={color}
      />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: 2,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
});
