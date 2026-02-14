import { Platform } from 'react-native'

export const REVENUECAT_API_KEY = 'test_gngYicqPNakjsEBKvUwfIlFHrUg'

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
