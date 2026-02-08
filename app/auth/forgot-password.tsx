import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../../lib/colors";
import { useAuth } from "../../lib/auth";

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error: err } = await resetPassword(email.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.title}>Email Sent</Text>
          <Text style={styles.subtitle}>
            If an account exists for {email}, you will receive a password reset
            link shortly.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.replace("/auth/login")}
          >
            <Text style={styles.btnText}>Back to Login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.center}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a reset link.
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            editable={!loading}
            onSubmitEditing={handleReset}
          />

          <Pressable
            style={({ pressed }) => [
              styles.btn,
              { opacity: pressed ? 0.85 : 1 },
              loading && styles.btnDisabled,
            ]}
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Send Reset Link</Text>
            )}
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.link}>
            <Text style={styles.linkText}>Back to Login</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  error: {
    color: Colors.error,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
    backgroundColor: "#fdecea",
    padding: 10,
    borderRadius: 8,
  },
  form: {
    gap: 4,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  btn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  link: {
    alignItems: "center",
    paddingVertical: 12,
  },
  linkText: {
    color: Colors.primaryLight,
    fontSize: 14,
    fontWeight: "600",
  },
});
