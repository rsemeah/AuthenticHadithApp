import { supabase } from '../supabase/client'

export async function checkPremiumFeature(userId: string | undefined): Promise<boolean> {
  if (!userId) return false

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_premium, subscription_status')
      .eq('id', userId)
      .single()

    if (error) return false

    return data.is_premium === true && 
           (data.subscription_status === 'active' || data.subscription_status === null)
  } catch {
    return false
  }
}

export function isPremiumRequired(feature: 'assistant' | 'unlimited_lessons' | 'offline_mode'): boolean {
  const premiumFeatures = ['assistant', 'unlimited_lessons']
  return premiumFeatures.includes(feature)
}
