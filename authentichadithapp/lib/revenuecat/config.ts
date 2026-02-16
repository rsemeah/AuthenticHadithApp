import { Platform } from 'react-native'
import Constants from 'expo-constants'

const extra = Constants.expoConfig?.extra ?? {}

const rcKey = extra.revenueCatApiKey
if (!rcKey || rcKey.startsWith('test_')) {
  console.warn('[RevenueCat] Using test API key — payments will not work in production. Set REVENUECAT_IOS_KEY env var.')
}
export const REVENUECAT_API_KEY: string = rcKey ?? ''

export const ENTITLEMENT_ID = 'RedLantern Studios Pro'

export const PRODUCT_IDS = {
  monthly: Platform.select({
    ios: 'rc_monthly',
    android: 'rc_monthly',
    default: 'rc_monthly',
  }) as string,
  yearly: Platform.select({
    ios: 'rc_yearly',
    android: 'rc_yearly',
    default: 'rc_yearly',
  }) as string,
  lifetime: Platform.select({
    ios: 'rc_lifetime',
    android: 'rc_lifetime',
    default: 'rc_lifetime',
  }) as string,
}
