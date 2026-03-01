import React, { useState } from 'react'
import { StyleSheet, View, ScrollView, Text, Pressable, TextInput, Alert } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/lib/styles/colors'

const TOTAL_STEPS = 3

const SCHOOLS_OF_THOUGHT = ['Hanafi', 'Maliki', "Shafi'i", 'Hanbali', 'Other / Prefer not to say']

const COLLECTIONS = [
  { id: 'bukhari', name: 'Sahih Bukhari', count: '7,563 hadiths' },
  { id: 'muslim', name: 'Sahih Muslim', count: '7,500 hadiths' },
  { id: 'tirmidhi', name: 'Sunan at-Tirmidhi', count: '3,956 hadiths' },
  { id: 'abudawud', name: 'Sunan Abu Dawud', count: '5,274 hadiths' },
  { id: 'nasai', name: "Sunan an-Nasa'i", count: '5,761 hadiths' },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah', count: '4,341 hadiths' },
]

const LEARNING_LEVELS = ['Beginner', 'Intermediate', 'Advanced']

interface OnboardingData {
  name: string
  schoolOfThought: string
  collections: string[]
  learningLevel: string
  safetyAgreed: boolean
  termsAgreed: boolean
}

export default function OnboardingScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    name: '',
    schoolOfThought: '',
    collections: [],
    learningLevel: 'Intermediate',
    safetyAgreed: false,
    termsAgreed: false,
  })

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.name.trim().length >= 2
      case 2:
        return true
      case 3:
        return data.safetyAgreed && data.termsAgreed
      default:
        return false
    }
  }

  const handleComplete = async () => {
    if (!user) {
      await AsyncStorage.setItem('onboarded', '1')
      router.replace('/(tabs)')
      return
    }

    setLoading(true)
    try {
      // Update profile
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: data.name,
          school_of_thought: data.schoolOfThought || null,
        })

      // Update preferences
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          learning_level: data.learningLevel.toLowerCase(),
          collections_of_interest: data.collections,
          onboarded: true,
          safety_agreed_at: new Date().toISOString(),
        })

      await AsyncStorage.setItem('onboarded', '1')
      router.replace('/(tabs)')
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarded', '1')
    router.replace('/(tabs)')
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Progress Dots */}
      <View style={styles.progressRow}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View key={i} style={styles.progressDotRow}>
            <View
              style={[
                styles.progressDot,
                i + 1 < currentStep && styles.progressDotComplete,
                i + 1 === currentStep && styles.progressDotActive,
              ]}
            >
              {i + 1 < currentStep && <Text style={styles.progressCheck}>✓</Text>}
            </View>
            {i < TOTAL_STEPS - 1 && (
              <View style={[styles.progressLine, i + 1 < currentStep && styles.progressLineActive]} />
            )}
          </View>
        ))}
      </View>
      <Text style={styles.stepLabel}>
        Step {currentStep} of {TOTAL_STEPS}
      </Text>

      {/* Step 1: Profile */}
      {currentStep === 1 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Welcome! Let's set up your profile</Text>
          <Text style={styles.stepSubtitle}>
            Tell us a bit about yourself to personalize your experience
          </Text>

          <Text style={styles.label}>Your Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.mutedText}
            value={data.name}
            onChangeText={(text) => updateData({ name: text })}
            maxLength={50}
          />

          <Text style={styles.label}>School of Thought (Madhab)</Text>
          <View style={styles.optionsList}>
            {SCHOOLS_OF_THOUGHT.map((school) => (
              <Pressable
                key={school}
                style={[
                  styles.optionItem,
                  data.schoolOfThought === school && styles.optionItemActive,
                ]}
                onPress={() => updateData({ schoolOfThought: school })}
              >
                <Text
                  style={[
                    styles.optionText,
                    data.schoolOfThought === school && styles.optionTextActive,
                  ]}
                >
                  {school}
                </Text>
                {data.schoolOfThought === school && (
                  <Text style={styles.optionCheck}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Step 2: Preferences */}
      {currentStep === 2 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Customize your experience</Text>
          <Text style={styles.stepSubtitle}>
            Set your preferences to personalize your learning journey
          </Text>

          <Text style={styles.label}>Collections of Interest</Text>
          <View style={styles.collectionsGrid}>
            {COLLECTIONS.map((c) => {
              const isSelected = data.collections.includes(c.id)
              return (
                <Pressable
                  key={c.id}
                  style={[styles.collectionItem, isSelected && styles.collectionItemActive]}
                  onPress={() => {
                    const updated = isSelected
                      ? data.collections.filter((x) => x !== c.id)
                      : [...data.collections, c.id]
                    updateData({ collections: updated })
                  }}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <View>
                    <Text style={styles.collectionName}>{c.name}</Text>
                    <Text style={styles.collectionCount}>{c.count}</Text>
                  </View>
                </Pressable>
              )
            })}
          </View>

          <Text style={styles.label}>Learning Level</Text>
          <View style={styles.levelToggle}>
            {LEARNING_LEVELS.map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.levelOption,
                  data.learningLevel === level && styles.levelOptionActive,
                ]}
                onPress={() => updateData({ learningLevel: level })}
              >
                <Text
                  style={[
                    styles.levelText,
                    data.learningLevel === level && styles.levelTextActive,
                  ]}
                >
                  {level}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Step 3: Safety */}
      {currentStep === 3 && (
        <View style={styles.stepContent}>
          <View style={styles.shieldIcon}>
            <Text style={styles.shieldEmoji}>🛡️</Text>
          </View>
          <Text style={styles.stepTitle}>Safety & Community Guidelines</Text>
          <Text style={styles.stepSubtitle}>
            Authentic Hadith maintains the highest standards of Islamic scholarship and community respect.
          </Text>

          <Card style={styles.safetyPoint}>
            <Text style={styles.safetyTitle}>AI assistant filters inappropriate queries</Text>
            <Text style={styles.safetyDesc}>
              Our AI assistant is trained to provide only authentic Islamic knowledge from verified sources.
            </Text>
          </Card>

          <Card style={styles.safetyPoint}>
            <Text style={styles.safetyTitle}>Scholarly sources only</Text>
            <Text style={styles.safetyDesc}>
              All hadiths are sourced from authenticated collections by recognized Islamic scholars.
            </Text>
          </Card>

          <Pressable
            style={styles.agreementRow}
            onPress={() => updateData({ safetyAgreed: !data.safetyAgreed })}
          >
            <View style={[styles.checkbox, data.safetyAgreed && styles.checkboxActive]}>
              {data.safetyAgreed && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={styles.agreementText}>
              I understand and agree to the safety guidelines
            </Text>
          </Pressable>

          <Pressable
            style={styles.agreementRow}
            onPress={() => updateData({ termsAgreed: !data.termsAgreed })}
          >
            <View style={[styles.checkbox, data.termsAgreed && styles.checkboxActive]}>
              {data.termsAgreed && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={styles.agreementText}>
              I agree to the Terms of Service and Privacy Policy
            </Text>
          </Pressable>
        </View>
      )}

      {/* Navigation */}
      <View style={styles.navRow}>
        {currentStep === 1 ? (
          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        ) : (
          <Button
            title="Back"
            variant="outline"
            size="medium"
            onPress={() => setCurrentStep((s) => s - 1)}
          />
        )}

        {currentStep < TOTAL_STEPS ? (
          <Button
            title="Next"
            variant="primary"
            size="medium"
            onPress={() => setCurrentStep((s) => s + 1)}
            disabled={!canProceed()}
          />
        ) : (
          <Button
            title="Complete"
            variant="primary"
            size="medium"
            onPress={handleComplete}
            disabled={!canProceed()}
            isLoading={loading}
          />
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingTop: SPACING.xxl, paddingBottom: SPACING.xxl },
  progressRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  progressDotRow: { flexDirection: 'row', alignItems: 'center' },
  progressDot: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  progressDotActive: { backgroundColor: COLORS.goldMid },
  progressDotComplete: { backgroundColor: COLORS.emeraldMid },
  progressCheck: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  progressLine: { width: 40, height: 2, backgroundColor: COLORS.border },
  progressLineActive: { backgroundColor: COLORS.emeraldMid },
  stepLabel: { fontSize: FONT_SIZES.sm, color: COLORS.mutedText, textAlign: 'center', marginBottom: SPACING.xl },
  stepContent: { marginBottom: SPACING.xl },
  stepTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.bronzeText, textAlign: 'center', marginBottom: SPACING.sm },
  stepSubtitle: { fontSize: FONT_SIZES.base, color: COLORS.mutedText, textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 22 },
  label: { fontSize: FONT_SIZES.base, fontWeight: '600', color: COLORS.bronzeText, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  input: {
    height: 48, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.base, color: COLORS.bronzeText,
  },
  optionsList: { gap: SPACING.xs },
  optionItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.md, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  optionItemActive: { borderColor: COLORS.goldMid, backgroundColor: COLORS.goldMid + '10' },
  optionText: { fontSize: FONT_SIZES.base, color: COLORS.bronzeText },
  optionTextActive: { fontWeight: '600' },
  optionCheck: { color: COLORS.goldMid, fontWeight: '700' },
  collectionsGrid: { gap: SPACING.sm },
  collectionItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  collectionItemActive: { borderColor: COLORS.goldMid, backgroundColor: COLORS.goldMid + '10' },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: COLORS.goldMid, borderColor: COLORS.goldMid },
  checkboxCheck: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  collectionName: { fontSize: FONT_SIZES.base, fontWeight: '500', color: COLORS.bronzeText },
  collectionCount: { fontSize: FONT_SIZES.xs, color: COLORS.mutedText },
  levelToggle: {
    flexDirection: 'row', backgroundColor: COLORS.border + '50',
    borderRadius: BORDER_RADIUS.lg, padding: 4,
  },
  levelOption: {
    flex: 1, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md, alignItems: 'center',
  },
  levelOptionActive: { backgroundColor: COLORS.goldMid },
  levelText: { fontSize: FONT_SIZES.base, fontWeight: '500', color: COLORS.mutedText },
  levelTextActive: { color: COLORS.white },
  shieldIcon: { alignItems: 'center', marginBottom: SPACING.md },
  shieldEmoji: { fontSize: 48 },
  safetyPoint: { marginBottom: SPACING.sm },
  safetyTitle: { fontSize: FONT_SIZES.base, fontWeight: '600', color: COLORS.bronzeText, marginBottom: SPACING.xs },
  safetyDesc: { fontSize: FONT_SIZES.sm, color: COLORS.mutedText, lineHeight: 20 },
  agreementRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  agreementText: { flex: 1, fontSize: FONT_SIZES.base, color: COLORS.bronzeText, lineHeight: 22 },
  navRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  skipText: { fontSize: FONT_SIZES.base, color: COLORS.mutedText },
})
