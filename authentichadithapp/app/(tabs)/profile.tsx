import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/styles/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isGuest, signOut } = useAuth();
  const { isPremium } = usePremiumStatus();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  if (isGuest) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>👤 Profile</Text>
        </View>
        <View style={styles.guestContainer}>
          <Text style={styles.guestText}>
            Sign in to save hadiths, track progress, and access premium features
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/auth/login')}
            variant="primary"
          />
          <Button
            title="Create Account"
            onPress={() => router.push('/auth/signup')}
            variant="outline"
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👤 Profile</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <Text style={styles.email}>{user?.email}</Text>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>⭐ Premium Member</Text>
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>My Account</Text>
          <Button
            title="Redeem Promo Code"
            onPress={() => router.push('/redeem')}
            variant="outline"
          />
          <Button
            title="My Referral Code"
            onPress={() => router.push('/redeem/my-code')}
            variant="outline"
          />
        </Card>

        <Card style={styles.section}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="ghost"
          />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.bronzeText,
    marginBottom: SPACING.sm,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  guestText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.mutedText,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  content: {
    padding: SPACING.md,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  email: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.bronzeText,
    marginBottom: SPACING.sm,
  },
  premiumBadge: {
    backgroundColor: COLORS.goldMid,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  premiumText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.bronzeText,
    marginBottom: SPACING.sm,
  },
});
