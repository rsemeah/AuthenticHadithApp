import React from 'react'
import { Pressable, Text, StyleSheet, ActivityIndicator, PressableProps, ViewStyle } from 'react-native'
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../../lib/styles/colors'

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  isLoading?: boolean
  style?: ViewStyle
}

export function Button({ 
  title, 
  variant = 'primary', 
  size = 'medium',
  isLoading = false,
  disabled,
  style,
  ...props 
}: ButtonProps) {
  const sizeKey = `${size}Size` as 'smallSize' | 'mediumSize' | 'largeSize'
  const variantTextKey = `${variant}Text` as 'primaryText' | 'secondaryText' | 'outlineText' | 'ghostText'
  const sizeTextKey = `${size}Text` as 'smallText' | 'mediumText' | 'largeText'

  return (
    <Pressable
      style={[
        styles.base,
        styles[variant],
        styles[sizeKey],
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.white : COLORS.emeraldMid} />
      ) : (
        <Text style={[
          styles.text,
          styles[variantTextKey],
          styles[sizeTextKey],
        ]}>
          {title}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: COLORS.emeraldMid,
  },
  secondary: {
    backgroundColor: COLORS.goldMid,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.emeraldMid,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  smallSize: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 32,
  },
  mediumSize: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 44,
  },
  largeSize: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    minHeight: 52,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.emeraldMid,
  },
  ghostText: {
    color: COLORS.emeraldMid,
  },
  smallText: {
    fontSize: FONT_SIZES.sm,
  },
  mediumText: {
    fontSize: FONT_SIZES.base,
  },
  largeText: {
    fontSize: FONT_SIZES.md,
  },
})
