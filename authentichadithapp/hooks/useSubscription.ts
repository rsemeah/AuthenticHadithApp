import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../lib/auth/AuthProvider'

interface Subscription {
  id: string
  user_id: string
  status: 'active' | 'canceled' | 'past_due'
  current_period_end: string
  cancel_at_period_end: boolean
}

export function useSubscription() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data as Subscription | null
    },
    enabled: !!user,
  })
}
