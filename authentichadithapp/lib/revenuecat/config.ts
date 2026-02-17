import { Platform } from 'react-native'
import Constants from 'expo-constants'

const extra = Constants.expoConfig?.extra ?? {}

/**
 * RevenueCat API key, resolved per platform.
 *
 * Set in EAS secrets (recommended):
 *   eas secret:create --name REVENUECAT_IOS_KEY   --value appl_...
 *   eas secret:create --name REVENUECAT_ANDROID_KEY --value goog_...
 *
 * Then expose via app.config.js:
 *   extra: {
 *     revenueCatApiKeyIos: process.env.REVENUECAT_IOS_KEY,
 *     revenueCatApiKeyAndroid: process.env.REVENUECAT_ANDROID_KEY,
 *   }
 */
export const REVENUECAT_API_KEY: string =
  Platform.select({
    ios: extra.revenueCatApiKeyIos,
    android: extra.revenueCatApiKeyAndroid,
  }) ?? extra.revenueCatApiKey ?? ''

export const ENTITLEMENT_ID = 'premium'

// Product IDs — must match App Store Connect, Google Play, and RevenueCat dashboard
export const PRODUCT_IDS = {
  monthly: Platform.select({
    ios: 'ah_monthly_999',
    android: 'ah_monthly_999',
    default: 'ah_monthly_999',
  }) as string,
  yearly: Platform.select({
    ios: 'ah_annual_4999',
    android: 'ah_annual_4999',
    default: 'ah_annual_4999',
  }) as string,
  lifetime: Platform.select({
    ios: 'ah_lifetime_9999',
    android: 'ah_lifetime_9999',
    default: 'ah_lifetime_9999',
  }) as string,
}
