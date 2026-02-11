import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../lib/colors";
import { AuthProvider } from "../lib/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="hadith/[id]"
          options={{ title: "Hadith Detail" }}
        />
        <Stack.Screen
          name="auth/login"
          options={{ title: "Sign In", presentation: "modal" }}
        />
        <Stack.Screen
          name="auth/signup"
          options={{ title: "Create Account", presentation: "modal" }}
        />
        <Stack.Screen
          name="auth/forgot-password"
          options={{ title: "Reset Password", presentation: "modal" }}
        />
        <Stack.Screen
          name="learn/[pathId]"
          options={{ title: "Lessons" }}
        />
        <Stack.Screen
          name="learn/lesson/[lessonId]"
          options={{ title: "Lesson" }}
        />
        <Stack.Screen
          name="collection/[name]"
          options={{ title: "Collection" }}
        />
        <Stack.Screen
          name="redeem/index"
          options={{ title: "Redeem Code" }}
        />
        <Stack.Screen
          name="redeem/my-code"
          options={{ title: "My Referral Code" }}
        />
        <Stack.Screen
          name="quiz/[lessonId]"
          options={{ title: "Quiz" }}
        />
        <Stack.Screen
          name="notifications/index"
          options={{ title: "Notifications" }}
        />
        <Stack.Screen
          name="settings/notifications"
          options={{ title: "Notification Settings" }}
        />
        <Stack.Screen
          name="stories/index"
          options={{ title: "Stories" }}
        />
        <Stack.Screen
          name="stories/[slug]"
          options={{ title: "Story" }}
        />
        <Stack.Screen
          name="sunnah/index"
          options={{ title: "Sunnah" }}
        />
        <Stack.Screen
          name="topics/index"
          options={{ title: "Topics" }}
        />
        <Stack.Screen
          name="saved/index"
          options={{ title: "Saved" }}
        />
        <Stack.Screen
          name="reflections/index"
          options={{ title: "Reflections" }}
        />
        <Stack.Screen
          name="today/index"
          options={{ title: "Today" }}
        />
        <Stack.Screen
          name="pricing/index"
          options={{ title: "Pricing" }}
        />
        <Stack.Screen
          name="onboarding/index"
          options={{ headerShown: false }}
        />
      </Stack>
    </AuthProvider>
  );
}
