import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SPACING, FONT_SIZES } from '@/lib/styles/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { getColors } from '@/lib/styles/colors';

export default function NotificationsScreen() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
          headerBackTitle: 'Settings',
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.emeraldMid,
          headerShadowVisible: false,
        }}
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.bronzeText }]}>Notifications</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>
          Push notification preferences will be available in a future update.
          You can manage app notifications at any time in your device Settings.
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
