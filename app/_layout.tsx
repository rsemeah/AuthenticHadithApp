import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../lib/colors";

export default function RootLayout() {
  return (
    <>
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
      </Stack>
    </>
  );
}
