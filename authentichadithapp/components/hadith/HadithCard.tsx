import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Card } from '../ui/Card'
import { GradeBadge } from './GradeBadge'
import { COLORS, SPACING, FONT_SIZES } from '../../lib/styles/colors'
import { Hadith } from '../../types/hadith'

interface HadithCardProps {
  hadith: Hadith
  onPress?: () => void
  compact?: boolean
}

export function HadithCard({ hadith, onPress, compact = false }: HadithCardProps) {
  const content = (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <GradeBadge grade={hadith.grade} size={compact ? 'small' : 'medium'} />
        <Text style={styles.reference}>
          {hadith.collection_slug} {hadith.hadith_number}
        </Text>
      </View>

      {/* Arabic Text - RTL */}
      <Text style={styles.arabicText} numberOfLines={compact ? 3 : undefined}>
        {hadith.arabic_text}
      </Text>

      {/* English Translation */}
      <Text style={styles.englishText} numberOfLines={compact ? 4 : undefined}>
        {hadith.english_text}
      </Text>

      {hadith.narrator && (
        <Text style={styles.narrator}>
          Narrated by {hadith.narrator}
        </Text>
      )}
    </Card>
  )

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    )
  }

  return content
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  reference: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.mutedText,
    fontWeight: '500',
  },
  arabicText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.bronzeText,
    lineHeight: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: SPACING.md,
    fontFamily: 'System',
  },
  englishText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.bronzeText,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  narrator: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.mutedText,
    fontStyle: 'italic',
  },
})
