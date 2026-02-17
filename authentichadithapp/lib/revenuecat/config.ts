import { Platform } from 'react-native'
import Constants from 'expo-constants'

const extra = Constants.expoConfig?.extra ?? {}

/**
 * Platform-specific RevenueCat API keys.
 * iOS keys start with "appl_", Android keys start with "goog_".
 *
 * Set these as EAS secrets, then expose them in app.json > extra:
 *   eas secret:create --scope project --name REVENUECAT_API_KEY_APPLE --value appl_...
 *   eas secret:create --scope project --name REVENUECAT_API_KEY_GOOGLE --value goog_...
 * app.json extra:
 *   "revenueCatApiKeyApple":  "$REVENUECAT_API_KEY_APPLE",
 *   "revenueCatApiKeyGoogle": "$REVENUECAT_API_KEY_GOOGLE"
 *
 * Key names intentionally match expo-wrapper/providers/RevenueCatProvider.tsx
 * in the v0 web repo so both apps share the same EAS secret names.
 */
export const REVENUECAT_API_KEY: string = Platform.select({
  ios: extra.revenueCatApiKeyApple ?? '',
  android: extra.revenueCatApiKeyGoogle ?? '',
  default: '',
}) as string

/**
 * Entitlement identifier — must match RevenueCat dashboard > Entitlements exactly.
 * Configurable via app.json extra.revenueCatEntitlementId (mirrors v0 expo-wrapper).
 */
export const ENTITLEMENT_ID: string =
  extra.revenueCatEntitlementId ?? 'RedLantern Studios Pro'

/**
 * Product identifiers — must match App Store Connect + RevenueCat dashboard Products.
 * These match the revenuecatProductId values defined in v0/lib/products.ts.
 */
export const PRODUCT_IDS = {
  monthly:  'ah_monthly_999',
  yearly:   'ah_annual_4999',
  lifetime: 'ah_lifetime_9999',
} as const
