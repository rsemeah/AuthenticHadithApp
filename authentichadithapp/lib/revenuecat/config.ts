import { Platform } from 'react-native'
import Constants from 'expo-constants'

const extra = Constants.expoConfig?.extra ?? {}

/**
 * Platform-specific RevenueCat API keys.
 * iOS keys start with "appl_", Android keys start with "goog_".
 *
 * Set these as EAS secrets and expose them in app.json > extra:
 *   eas secret:create --scope project --name REVENUECAT_API_KEY_IOS --value appl_...
 *   eas secret:create --scope project --name REVENUECAT_API_KEY_ANDROID --value goog_...
 * Then reference them in app.json extra:
 *   "revenueCatApiKeyIos":     "$REVENUECAT_API_KEY_IOS",
 *   "revenueCatApiKeyAndroid": "$REVENUECAT_API_KEY_ANDROID"
 */
export const REVENUECAT_API_KEY: string = Platform.select({
  ios: extra.revenueCatApiKeyIos ?? '',
  android: extra.revenueCatApiKeyAndroid ?? '',
  default: '',
}) as string

/**
 * The entitlement identifier created in the RevenueCat dashboard.
 * Must match exactly — copy/paste from dashboard > Entitlements.
 */
export const ENTITLEMENT_ID = 'premium'

/**
 * App Store Connect / Google Play product identifiers.
 * Must match exactly what is configured in both stores and in the
 * RevenueCat dashboard under Products.
 */
export const PRODUCT_IDS = {
  monthly: Platform.select({
    ios: 'ah_premium_monthly',
    android: 'ah_premium_monthly',
    default: 'ah_premium_monthly',
  }) as string,
  yearly: Platform.select({
    ios: 'ah_premium_annual',
    android: 'ah_premium_annual',
    default: 'ah_premium_annual',
  }) as string,
  lifetime: Platform.select({
    ios: 'ah_lifetime',
    android: 'ah_lifetime',
    default: 'ah_lifetime',
  }) as string,
}
