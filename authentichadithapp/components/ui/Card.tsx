import React from 'react'
import { View, StyleSheet, ViewProps } from 'react-native'
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/styles/colors'

interface CardProps extends ViewProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated'
}

export function Card({ children, variant = 'default', style, ...props }: CardProps) {
  return (
    <View 
      style={[
        styles.card, 
        variant === 'elevated' && styles.elevated,
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  elevated: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
})
