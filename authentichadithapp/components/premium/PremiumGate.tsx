import React from 'react'
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { COLORS, SPACING, FONT_SIZES } from '../../lib/styles/colors'
import { usePremiumStatus } from '../../hooks/usePremiumStatus'

interface PremiumGateProps {
  feature: string
  description?: string
  children: React.ReactNode
}

export function PremiumGate({ feature, description, children }: PremiumGateProps) {
  const { isPremium, isLoading } = usePremiumStatus()
  const [showModal, setShowModal] = React.useState(false)
  const router = useRouter()

  if (isLoading) {
    return null
  }

  if (isPremium) {
    return <>{children}</>
  }

  return (
    <>
      <Pressable onPress={() => setShowModal(true)}>
        <Card style={styles.lockedCard}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Premium Feature</Text>
          <Text style={styles.lockDescription}>
            {description || `Unlock ${feature} with a premium subscription`}
          </Text>
        </Card>
      </Pressable>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>Premium Required</Text>
            <Text style={styles.modalDescription}>
              This feature is only available to premium members. Upgrade now to access:
            </Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>✓ AI Assistant</Text>
              <Text style={styles.featureItem}>✓ Unlimited Learning Paths</Text>
              <Text style={styles.featureItem}>✓ Offline Mode</Text>
              <Text style={styles.featureItem}>✓ No Ads</Text>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="Redeem Code"
                variant="outline"
                onPress={() => {
                  setShowModal(false)
                  router.push('/redeem')
                }}
                style={styles.button}
              />
              <Button
                title="Close"
                variant="ghost"
                onPress={() => setShowModal(false)}
                style={styles.button}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  lockedCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    opacity: 0.6,
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  lockTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.bronzeText,
    marginBottom: SPACING.sm,
  },
  lockDescription: {
    fontSize: FONT_SIZES.base,
    color: COLORS.mutedText,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.bronzeText,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: FONT_SIZES.base,
    color: COLORS.mutedText,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  featureList: {
    marginBottom: SPACING.lg,
  },
  featureItem: {
    fontSize: FONT_SIZES.base,
    color: COLORS.bronzeText,
    marginBottom: SPACING.sm,
  },
  buttonContainer: {
    gap: SPACING.sm,
  },
  button: {
    width: '100%',
  },
})
