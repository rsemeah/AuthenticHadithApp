import React from 'react';
import { StyleSheet, View, Text, ScrollView, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useRevenueCatSubscription } from '@/hooks/useRevenueCatSubscription';
import { PaywallScreen } from '@/components/premium/PaywallScreen';
import { CustomerCenterScreen } from '@/components/premium/CustomerCenterScreen';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/styles/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isGuest, signOut } = useAuth();
  const { isPremium } = usePremiumStatus();
  const { restorePurchases, expirationDate, productIdentifier } = useRevenueCatSubscription();
  const [showPaywall, setShowPaywall] = React.useState(false);
  const [showCustomerCenter, setShowCustomerCenter] = React.useState(false);
  const [restoring, setRestoring] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restorePurchases();
      Alert.alert('Restore Complete', 'Your purchases have been restored.');
    } catch (error: any) {
      Alert.alert('Restore Failed', error.message || 'Could not restore purchases.');
    } finally {
      setRestoring(false);
    }
  };

  if (isGuest) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
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
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <Text style={styles.email}>{user?.email}</Text>
          {isPremium ? (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>Pro Member</Text>
            </View>
          ) : (
            <Button
              title="Upgrade to Pro"
              variant="primary"
              onPress={() => setShowPaywall(true)}
              style={styles.upgradeButton}
            />
          )}
        </Card>

        {isPremium && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription</Text>
            {productIdentifier && (
              <Text style={styles.subscriptionDetail}>
                Plan: {productIdentifier}
              </Text>
            )}
            {expirationDate && (
              <Text style={styles.subscriptionDetail}>
                Renews: {new Date(expirationDate).toLocaleDateString()}
              </Text>
            )}
            <Button
              title="Manage Subscription"
              onPress={() => setShowCustomerCenter(true)}
              variant="outline"
            />
          </Card>
        )}

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>My Account</Text>
          {!isPremium && (
            <Button
              title="Restore Purchases"
              onPress={handleRestore}
              variant="outline"
              disabled={restoring}
            />
          )}
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

      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaywall(false)}
      >
        <PaywallScreen
          onDismiss={() => setShowPaywall(false)}
          onPurchaseCompleted={() => setShowPaywall(false)}
          onRestoreCompleted={() => setShowPaywall(false)}
        />
      </Modal>

      <Modal
        visible={showCustomerCenter}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCustomerCenter(false)}
      >
        <CustomerCenterScreen
          onDismiss={() => setShowCustomerCenter(false)}
        />
      </Modal>
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
  upgradeButton: {
    marginTop: SPACING.sm,
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
  subscriptionDetail: {
    fontSize: FONT_SIZES.base,
    color: COLORS.mutedText,
    marginBottom: SPACING.xs,
  },
});
