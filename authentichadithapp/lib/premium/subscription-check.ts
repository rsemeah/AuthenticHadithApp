import { supabase } from '../supabase/client'

export async function checkPremiumFeature(userId: string | undefined): Promise<boolean> {
  if (!userId) return false

  try {
    // Try with user_id first (web-created profiles)
    let { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('user_id', userId)
      .single()

    // Fallback to id (mobile-created profiles)
    if (error || !data) {
      const fallback = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', userId)
        .single()
      data = fallback.data
    }

    if (!data) return false

    const tier = data.subscription_tier || 'free'
    const status = data.subscription_status

    return tier !== 'free' && (status === 'active' || status === 'trialing' || status === null)
  } catch {
    return false
  }
}

export function isPremiumRequired(feature: 'assistant' | 'unlimited_lessons' | 'offline_mode'): boolean {
  const premiumFeatures = ['assistant', 'unlimited_lessons']
  return premiumFeatures.includes(feature)
}
