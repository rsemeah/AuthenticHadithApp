import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../lib/colors";
import { shareInvite } from "../../lib/share";

export default function ProfileScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.guestText}>Guest User</Text>
        <Text style={styles.subText}>
          Authentication will be available in a future version.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          Authentic Hadith is a mobile app for exploring verified narrations of
          the Prophet Muhammad (peace be upon him). All hadith are sourced from
          established collections and include grading information.
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.inviteBtn,
          { opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={shareInvite}
      >
        <Ionicons name="people-outline" size={20} color="#fff" />
        <Text style={styles.inviteBtnText}>Invite Friends</Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hadith Database</Text>
          <Text style={styles.infoValue}>~36,246 narrations</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Languages</Text>
          <Text style={styles.infoValue}>Arabic, English</Text>
        </View>
      </View>
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
  avatarContainer: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  guestText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  subText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  inviteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  inviteBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
