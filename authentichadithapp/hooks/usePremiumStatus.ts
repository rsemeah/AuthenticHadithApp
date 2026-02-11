import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../lib/auth/AuthProvider'

export function usePremiumStatus() {
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsPremium(false)
      setIsLoading(false)
      return
    }

    const checkPremiumStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_premium, subscription_status')
          .eq('id', user.id)
          .single()

        if (error) throw error

        const isActive = 
          data.is_premium === true && 
          (data.subscription_status === 'active' || data.subscription_status === null)

        setIsPremium(isActive)
      } catch (error) {
        console.error('Error checking premium status:', error)
        setIsPremium(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPremiumStatus()
  }, [user])

  return { isPremium, isLoading }
}
