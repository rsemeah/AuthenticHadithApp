import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";
import { useAuth } from "../../lib/auth";

export default function RedeemScreen() {
  const { code: urlCode } = useLocalSearchParams<{ code?: string }>();
  const { user, refreshProfile } = useAuth();
  const [code, setCode] = useState(urlCode ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    days_added?: number;
    error?: string;
  } | null>(null);

  const handleRedeem = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    if (!user) {
      Alert.alert(
        "Sign in required",
        "Please sign in or create an account to redeem a code.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    setResult(null);

    const { data, error } = await supabase.rpc("redeem_promo_code", {
      p_code: trimmed,
    });

    setLoading(false);

    if (error) {
      setResult({ success: false, error: error.message });
    } else if (data) {
      setResult(data);
      if (data.success) {
        await refreshProfile();
      }
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Redeem Code" }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <Ionicons name="gift-outline" size={48} color={Colors.primary} />
          <Text style={styles.title}>Redeem a Code</Text>
          <Text style={styles.subtitle}>
            Enter a promo or referral code to unlock premium features.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter code"
            placeholderTextColor={Colors.textSecondary}
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            editable={!loading}
            onSubmitEditing={handleRedeem}
          />

          <Pressable
            style={({ pressed }) => [
              styles.btn,
              { opacity: pressed ? 0.85 : 1 },
              loading && { opacity: 0.6 },
            ]}
            onPress={handleRedeem}
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Redeem</Text>
            )}
          </Pressable>

          {result && !result.success && result.error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{result.error}</Text>
            </View>
          )}

          {result?.success && (
            <View style={styles.successBox}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.successText}>
                {result.days_added} days of premium added!
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 20,
    color: Colors.text,
    textAlign: "center",
    letterSpacing: 4,
    fontWeight: "700",
  },
  btn: {
    width: "100%",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  errorBox: {
    marginTop: 16,
    backgroundColor: "#fdecea",
    padding: 12,
    borderRadius: 8,
    width: "100%",
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    textAlign: "center",
  },
  successBox: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary + "14",
    padding: 14,
    borderRadius: 8,
    width: "100%",
    justifyContent: "center",
  },
  successText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
});
