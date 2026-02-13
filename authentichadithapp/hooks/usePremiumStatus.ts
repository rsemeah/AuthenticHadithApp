import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../lib/auth/AuthProvider'

export type SubscriptionTier = 'free' | 'premium' | 'lifetime'

export function usePremiumStatus() {
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [tier, setTier] = useState<SubscriptionTier>('free')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsPremium(false)
      setTier('free')
      setIsLoading(false)
      return
    }

    const checkPremiumStatus = async () => {
      try {
        // Try with user_id first (web-created profiles)
        let { data, error } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status')
          .eq('user_id', user.id)
          .single()

        // Fallback to id (mobile-created profiles)
        if (error || !data) {
          const fallback = await supabase
            .from('profiles')
            .select('subscription_tier, subscription_status')
            .eq('id', user.id)
            .single()
          data = fallback.data
        }

        if (!data) {
          setIsPremium(false)
          setTier('free')
          return
        }

        const userTier = (data.subscription_tier as SubscriptionTier) || 'free'
        const status = data.subscription_status

        const isActive =
          userTier !== 'free' &&
          (status === 'active' || status === 'trialing' || status === null)

        setIsPremium(isActive)
        setTier(userTier)
      } catch (error) {
        console.error('Error checking premium status:', error)
        setIsPremium(false)
        setTier('free')
      } finally {
        setIsLoading(false)
      }
    }

    checkPremiumStatus()
  }, [user])

  return { isPremium, tier, isLoading }
}
