export const LIGHT_COLORS = {
  // Islamic emerald green shades
  emeraldShadow: '#0a2a1f',
  emeraldMid: '#1b5e43',
  emeraldHighlight: '#2d7a5b',
  
  // Gold accents
  goldShadow: '#8a6e3a',
  goldMid: '#c5a059',
  goldHighlight: '#e8c77d',
  
  // Marble base colors
  marbleBase: '#f8f6f2',
  
  // Text colors
  bronzeText: '#2c2416',
  mutedText: '#6b5d4d',
  
  // Hadith grades
  sahih: '#1b5e43',
  hasan: '#c5a059',
  daif: '#b91c1c',
  
  // UI colors
  background: '#f8f6f2',
  card: '#fffefb',
  border: '#d4cfc7',
  white: '#ffffff',
  black: '#000000',
  
  // Status colors
  success: '#1b5e43',
  warning: '#c5a059',
  error: '#b91c1c',
  info: '#2d7a5b',
  
  // Chat colors
  chatUserBubble: '#D4A574',
  chatAiBubble: '#50C878',
} as const

export const DARK_COLORS = {
  // Islamic emerald green shades (slightly brighter for dark mode)
  emeraldShadow: '#2d7a5b',
  emeraldMid: '#3a9270',
  emeraldHighlight: '#4caf84',
  
  // Gold accents (slightly brighter for dark mode)
  goldShadow: '#c5a059',
  goldMid: '#d4b76e',
  goldHighlight: '#e8c77d',
  
  // Dark marble base
  marbleBase: '#1a1a1a',
  
  // Text colors for dark mode
  bronzeText: '#e8e6e3',
  mutedText: '#a39d94',
  
  // Hadith grades (adjusted for dark mode)
  sahih: '#3a9270',
  hasan: '#d4b76e',
  daif: '#ef4444',
  
  // UI colors for dark mode
  background: '#121212',
  card: '#1e1e1e',
  border: '#2d2d2d',
  white: '#ffffff',
  black: '#000000',
  
  // Status colors (adjusted for dark mode)
  success: '#3a9270',
  warning: '#d4b76e',
  error: '#ef4444',
  info: '#4caf84',
  
  // Chat colors
  chatUserBubble: '#D4A574',
  chatAiBubble: '#50C878',
} as const

// Default to light colors for backward compatibility
export const COLORS = LIGHT_COLORS

/**
 * Get colors based on theme mode
 * @param isDark - Whether dark mode is active
 * @returns Color palette for the current theme
 */
export function getColors(isDark: boolean) {
  return isDark ? DARK_COLORS : LIGHT_COLORS
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
} as const

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const
