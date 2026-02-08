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
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../../lib/colors";
import { useAuth } from "../../lib/auth";

export default function SignupScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !password) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await signUp(
      email.trim(),
      password,
      displayName.trim() || undefined
    );
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <Text style={styles.bismillah}>الحمد لله</Text>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We sent a verification link to {email}. Please verify your email to
            complete registration.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.replace("/auth/login")}
          >
            <Text style={styles.btnText}>Go to Login</Text>
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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.bismillah}>بِسْمِ اللَّهِ</Text>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Join the community of authentic hadith learners
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.form}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name (optional)"
            placeholderTextColor={Colors.textSecondary}
            value={displayName}
            onChangeText={setDisplayName}
            textContentType="name"
            editable={!loading}
          />

          <Text style={styles.label}>Email</Text>
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
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="At least 6 characters"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
            editable={!loading}
            onSubmitEditing={handleSignup}
          />

          <Pressable
            style={({ pressed }) => [
              styles.btn,
              { opacity: pressed ? 0.85 : 1 },
              loading && styles.btnDisabled,
            ]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            style={styles.link}
          >
            <Text style={styles.linkText}>Already have an account? Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  successContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  bismillah: {
    fontSize: 24,
    color: Colors.accent,
    textAlign: "center",
    marginBottom: 8,
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
    marginTop: 12,
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
    marginTop: 20,
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
