import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Share,
  ScrollView,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";
import { useAuth } from "../../lib/auth";

export default function MyCodeScreen() {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ redeemed: 0, max: 5 });

  useEffect(() => {
    if (user) fetchOrCreateCode();
    else setLoading(false);
  }, [user]);

  const fetchOrCreateCode = async () => {
    setLoading(true);

    // Check for existing referral code
    const { data: existing } = await supabase
      .from("promo_codes")
      .select("code, redeemed_count, max_redemptions")
      .eq("created_by_user_id", user!.id)
      .eq("type", "referral")
      .maybeSingle();

    if (existing) {
      setCode(existing.code);
      setStats({
        redeemed: existing.redeemed_count,
        max: existing.max_redemptions,
      });
    } else {
      // Generate new referral code
      const newCode = generateCode();
      const { error } = await supabase.from("promo_codes").insert({
        code: newCode,
        type: "referral",
        duration_days: 7,
        max_redemptions: 5,
        created_by_user_id: user!.id,
      });

      if (!error) {
        setCode(newCode);
        setStats({ redeemed: 0, max: 5 });
      }
    }

    setLoading(false);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "AH-";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleShare = async () => {
    if (!code) return;
    const deepLink = `authentichadith://redeem?code=${code}`;
    try {
      await Share.share({
        message: [
          "I've been learning authentic hadith — come join me!",
          "",
          `Use code ${code} for 7 free days of premium.`,
          "",
          deepLink,
        ].join("\n"),
      });
    } catch {
      // cancelled
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ title: "My Referral Code" }} />
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            Sign in to get your personal referral code.
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "My Referral Code" }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>Your Referral Code</Text>
        <Text style={styles.subheading}>
          Share this with friends and family. They get 7 days of premium free
          when they sign up with your code.
        </Text>

        {/* QR Code */}
        {code && (
          <View style={styles.qrContainer}>
            <QRCode
              value={`authentichadith://redeem?code=${code}`}
              size={180}
              color={Colors.primaryDark}
              backgroundColor={Colors.surface}
            />
          </View>
        )}

        {/* Code text */}
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{code}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{stats.redeemed}</Text>
            <Text style={styles.statLabel}>Redeemed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>
              {stats.max - stats.redeemed}
            </Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>

        {/* Share button */}
        <Pressable
          style={({ pressed }) => [
            styles.shareBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={styles.shareBtnText}>Share Code</Text>
        </Pressable>

        <Text style={styles.footer}>
          Sharing knowledge is sadaqah jariyah.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  qrContainer: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  codeBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 20,
  },
  codeText: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 3,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 24,
    gap: 24,
  },
  stat: {
    alignItems: "center",
  },
  statNum: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    marginBottom: 16,
  },
  shareBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
