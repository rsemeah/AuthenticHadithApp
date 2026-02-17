import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';
import Purchases from 'react-native-purchases';

import { AuthProvider } from '@/lib/auth/AuthProvider';
import { REVENUECAT_API_KEY } from '@/lib/revenuecat/config';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeProvider';
import { RevenueCatProvider } from '@/lib/revenuecat/RevenueCatProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppContent() {
  const { isDark } = useTheme();

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="hadith" options={{ headerShown: false }} />
        <Stack.Screen name="collection" options={{ headerShown: false }} />
        <Stack.Screen name="learn" options={{ headerShown: false }} />
        <Stack.Screen name="redeem" options={{ headerShown: false }} />
        <Stack.Screen name="my-hadith" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    if (REVENUECAT_API_KEY) {
      Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RevenueCatProvider>
              <AppContent />
            </RevenueCatProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
