/**
 * RevenueCat integration for Apple In-App Purchases.
 *
 * SETUP REQUIRED:
 * 1. Install: npx expo install react-native-purchases react-native-purchases-ui
 * 2. Plugin is already added to app.json
 * 3. Create products in App Store Connect matching PRODUCT_IDS in lib/revenuecat/config.ts
 * 4. Configure products + entitlement in RevenueCat dashboard matching ENTITLEMENT_ID
 * 5. Set EAS secrets REVENUECAT_API_KEY_IOS / REVENUECAT_API_KEY_ANDROID
 *    then add to app.json extra (see lib/revenuecat/config.ts for the key names)
 *
 * This file provides a clean abstraction over the SDK so the rest of the
 * app doesn't import react-native-purchases directly.
 */

import { Platform } from 'react-native'
import Constants from 'expo-constants'
import { ENTITLEMENT_ID, PRODUCT_IDS } from '../revenuecat/config'

export { ENTITLEMENT_ID, PRODUCT_IDS }

// Lazy import — gracefully disabled if SDK not yet installed
let Purchases: typeof import('react-native-purchases').default | null = null

try {
  const mod = require('react-native-purchases')
  Purchases = mod.default
} catch {
  // SDK not installed — all functions below return safe defaults
  console.warn('[RevenueCat] react-native-purchases not installed. IAP disabled.')
}

// ─── Types ───
export type SubscriptionStatus = {
  isActive: boolean
  tier: 'free' | 'premium' | 'lifetime'
  expiresAt: string | null
  willRenew: boolean
}

// ─── Initialize ───
let isConfigured = false

export async function configureRevenueCat(supabaseUserId?: string): Promise<void> {
  if (!Purchases || isConfigured) return

  const extra = Constants.expoConfig?.extra ?? {}
  const apiKey = Platform.select({
    ios: extra.revenueCatApiKeyIos,
    android: extra.revenueCatApiKeyAndroid,
  })

  if (!apiKey) {
    console.warn('[RevenueCat] No API key found for platform:', Platform.OS)
    return
  }

  Purchases.configure({ apiKey })

  if (supabaseUserId) {
    await Purchases.logIn(supabaseUserId)
  }

  isConfigured = true
}

// ─── Set user identity (call on login) ───
export async function identifyUser(supabaseUserId: string): Promise<void> {
  if (!Purchases || !isConfigured) return
  await Purchases.logIn(supabaseUserId)
}

// ─── Clear identity (call on logout) ───
export async function resetUser(): Promise<void> {
  if (!Purchases || !isConfigured) return
  await Purchases.logOut()
}

// ─── Get available packages ───
export async function getOfferings() {
  if (!Purchases) return null

  try {
    const offerings = await Purchases.getOfferings()
    return offerings.current
  } catch (err) {
    console.error('[RevenueCat] Failed to get offerings:', err)
    return null
  }
}

// ─── Purchase a package ───
export async function purchasePackage(pkg: any): Promise<boolean> {
  if (!Purchases) return false

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg)
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined
  } catch (err: any) {
    if (err.userCancelled) return false
    console.error('[RevenueCat] Purchase error:', err)
    throw err
  }
}

// ─── Check current entitlement ───
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const defaultStatus: SubscriptionStatus = {
    isActive: false,
    tier: 'free',
    expiresAt: null,
    willRenew: false,
  }

  if (!Purchases) return defaultStatus

  try {
    const customerInfo = await Purchases.getCustomerInfo()
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID]

    if (!entitlement) return defaultStatus

    const isLifetime = entitlement.productIdentifier === PRODUCT_IDS.lifetime
    return {
      isActive: true,
      tier: isLifetime ? 'lifetime' : 'premium',
      expiresAt: entitlement.expirationDate,
      willRenew: entitlement.willRenew ?? false,
    }
  } catch (err) {
    console.error('[RevenueCat] Failed to get status:', err)
    return defaultStatus
  }
}

// ─── Restore purchases (Apple requires this button in the app) ───
export async function restorePurchases(): Promise<SubscriptionStatus> {
  const defaultStatus: SubscriptionStatus = {
    isActive: false,
    tier: 'free',
    expiresAt: null,
    willRenew: false,
  }

  if (!Purchases) return defaultStatus

  try {
    const customerInfo = await Purchases.restorePurchases()
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID]

    if (!entitlement) return defaultStatus

    const isLifetime = entitlement.productIdentifier === PRODUCT_IDS.lifetime
    return {
      isActive: true,
      tier: isLifetime ? 'lifetime' : 'premium',
      expiresAt: entitlement.expirationDate,
      willRenew: entitlement.willRenew ?? false,
    }
  } catch (err) {
    console.error('[RevenueCat] Restore error:', err)
    return defaultStatus
  }
}

// ─── Sync subscription status to Supabase profiles table ───
export async function syncSubscriptionToSupabase(
  supabase: any,
  userId: string,
): Promise<void> {
  const status = await getSubscriptionStatus()

  await supabase
    .from('profiles')
    .update({
      subscription_tier: status.tier,
      subscription_status: status.isActive ? 'active' : 'expired',
      subscription_expires_at: status.expiresAt,
    })
    .eq('user_id', userId)
}
