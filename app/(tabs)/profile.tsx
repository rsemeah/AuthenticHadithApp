import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../lib/colors";
import { shareInvite } from "../../lib/share";
import { useAuth } from "../../lib/auth";

export default function ProfileScreen() {
  const { user, profile, isPremium, signOut } = useAuth();
  const router = useRouter();

  const displayName = profile?.display_name || "Guest User";
  const email = profile?.email || user?.email;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.nameText}>{displayName}</Text>
        {email ? (
          <Text style={styles.subText}>{email}</Text>
        ) : (
          <Text style={styles.subText}>Not signed in</Text>
        )}
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>

      {/* Auth actions */}
      {!user ? (
        <View style={styles.authSection}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.primaryBtnText}>Sign In</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.outlineBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.push("/auth/signup")}
          >
            <Text style={styles.outlineBtnText}>Create Account</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.menuSection}>
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push("/redeem/my-code")}
          >
            <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
            <Text style={styles.menuLabel}>My Referral Code</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </Pressable>
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push("/redeem")}
          >
            <Ionicons name="gift-outline" size={20} color={Colors.primary} />
            <Text style={styles.menuLabel}>Redeem a Code</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </Pressable>
        </View>
      )}

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
        {isPremium && profile?.premium_until && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Premium Until</Text>
            <Text style={styles.infoValue}>
              {new Date(profile.premium_until).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {user && (
        <Pressable
          style={({ pressed }) => [
            styles.signOutBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => signOut()}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
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
  nameText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  subText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    backgroundColor: Colors.accent + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.accent,
  },
  authSection: {
    marginHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  outlineBtnText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  menuSection: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: "500",
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
  signOutBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.error,
  },
  signOutText: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: "600",
  },
});
