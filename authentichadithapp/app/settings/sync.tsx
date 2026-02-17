import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SPACING, FONT_SIZES } from '@/lib/styles/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { getColors } from '@/lib/styles/colors';

export default function SyncScreen() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Offline & Sync',
          headerShown: true,
          headerBackTitle: 'Settings',
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.emeraldMid,
          headerShadowVisible: false,
        }}
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.bronzeText }]}>Offline & Sync</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>
          Your saved hadiths and reading progress are automatically cached for
          offline access. Sync happens in the background whenever you are connected
          to the internet.
        </Text>
        <Text style={[styles.body, { color: colors.mutedText, marginTop: SPACING.md }]}>
          Advanced sync controls will be available in a future update.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  body: {
    fontSize: FONT_SIZES.base,
    lineHeight: 24,
  },
});
