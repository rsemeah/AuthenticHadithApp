import React, { useCallback } from 'react'
import { StyleSheet, View, ScrollView, Text, Pressable, Share, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthProvider'
import { HadithCard } from '@/components/hadith/HadithCard'
import { StreakCounter } from '@/components/gamification/StreakCounter'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/lib/styles/colors'
import { trackActivity } from '@/lib/gamification/track-activity'
import { Hadith } from '@/types/hadith'

// Sunnah practices rotate daily
const DAILY_ACTIONS = [
  { action: 'Say Bismillah before eating', reference: 'Sahih al-Bukhari 5376' },
  { action: 'Pray two rak\'ahs of Duha', reference: 'Sahih Muslim 748' },
  { action: 'Read Surah al-Mulk before sleeping', reference: 'Jami at-Tirmidhi 2891' },
  { action: 'Make dhikr after Fajr until sunrise', reference: 'Sahih Muslim 2137' },
  { action: 'Smile at your brother/sister', reference: 'Jami at-Tirmidhi 1956' },
  { action: 'Use the miswak', reference: 'Sahih al-Bukhari 887' },
  { action: 'Drink water in three sips', reference: 'Sahih Muslim 2028' },
  { action: 'Say the morning and evening adhkar', reference: 'Sunan Abu Dawud 5068' },
  { action: 'Give charity, even if small', reference: 'Sahih al-Bukhari 1417' },
  { action: 'Visit a sick person', reference: 'Sahih al-Bukhari 5649' },
  { action: 'Make istighfar 100 times', reference: 'Sahih Muslim 2702' },
  { action: 'Pray Witr before sleeping', reference: 'Sahih al-Bukhari 998' },
  { action: 'Eat dates in odd numbers', reference: 'Sahih al-Bukhari 5445' },
  { action: 'Send salawat upon the Prophet ﷺ', reference: 'Sahih Muslim 408' },
]

const REFLECTION_PROMPTS = [
  'How can I apply this hadith in my daily life?',
  'What lesson does this hadith teach about character?',
  'How does this hadith relate to my current situation?',
  'What would the Prophet ﷺ advise in my circumstances?',
]

function getDailyIndex(date: Date, max: number): number {
  const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % max
}

export default function TodayScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const today = new Date()
  const dailyActionIndex = getDailyIndex(today, DAILY_ACTIONS.length)
  const reflectionIndex = getDailyIndex(today, REFLECTION_PROMPTS.length)
  const todayAction = DAILY_ACTIONS[dailyActionIndex]
  const todayReflection = REFLECTION_PROMPTS[reflectionIndex]

  const { data: dailyHadith, isLoading: hadithLoading, refetch } = useQuery({
    queryKey: ['daily-hadith', today.toDateString()],
    queryFn: async () => {
      const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
      let hash = 0
      for (let i = 0; i < dateStr.length; i++) {
        hash = (hash << 5) - hash + dateStr.charCodeAt(i)
        hash |= 0
      }
      const seed = Math.abs(hash)

      const { count } = await supabase
        .from('hadiths')
        .select('id', { count: 'exact', head: true })
        .eq('grade', 'sahih')

      if (!count) return null

      const offset = seed % count
      const { data } = await supabase
        .from('hadiths')
        .select('*')
        .eq('grade', 'sahih')
        .range(offset, offset)
        .single()

      return data as Hadith | null
    },
  })

  const { data: streakData } = useQuery({
    queryKey: ['user-streak', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single()
      return data
    },
    enabled: !!user,
  })

  const handleShare = useCallback(async () => {
    if (!dailyHadith) return
    try {
      const text = dailyHadith.english_text || dailyHadith.arabic_text
      await Share.share({
        message: `Daily Hadith:\n\n${text}\n\n— ${dailyHadith.collection_slug} ${dailyHadith.hadith_number}\n\nShared from Authentic Hadith`,
      })
      if (user) {
        trackActivity(user.id, 'share')
      }
    } catch {}
  }, [dailyHadith, user])

  const handleSave = useCallback(async () => {
    if (!dailyHadith || !user) return
    await supabase.from('saved_hadiths').upsert({
      user_id: user.id,
      hadith_id: dailyHadith.id,
    })
    trackActivity(user.id, 'bookmark')
  }, [dailyHadith, user])

  if (hadithLoading) {
    return <LoadingSpinner />
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => refetch()} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.dateText}>
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        <Text style={styles.title}>Today's Hadith</Text>
      </View>

      {/* Streak */}
      {streakData && (
        <StreakCounter
          currentStreak={streakData.current_streak || 0}
          longestStreak={streakData.longest_streak || 0}
        />
      )}

      {/* Daily Hadith */}
      {dailyHadith && (
        <View>
          <HadithCard
            hadith={dailyHadith}
            onPress={() => router.push(`/hadith/${dailyHadith.id}`)}
          />
          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton} onPress={handleSave}>
              <Text style={styles.actionIcon}>🔖</Text>
              <Text style={styles.actionLabel}>Save</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleShare}>
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionLabel}>Share</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Reflection Prompt */}
      <Card variant="elevated" style={styles.reflectionCard}>
        <Text style={styles.sectionTitle}>💭 Today's Reflection</Text>
        <Text style={styles.reflectionText}>{todayReflection}</Text>
        <Button
          title="Write a Reflection"
          variant="outline"
          size="small"
          onPress={() => router.push('/reflections')}
        />
      </Card>

      {/* Today's Sunnah Action */}
      <Card variant="elevated" style={styles.sunnahCard}>
        <Text style={styles.sectionTitle}>☀️ Today's Small Action</Text>
        <Text style={styles.sunnahAction}>{todayAction.action}</Text>
        <Text style={styles.sunnahReference}>{todayAction.reference}</Text>
      </Card>

      {/* Quick Links */}
      <View style={styles.quickLinks}>
        <Pressable style={styles.quickLink} onPress={() => router.push('/sunnah')}>
          <Text style={styles.quickLinkIcon}>🕌</Text>
          <Text style={styles.quickLinkText}>All Sunnah</Text>
        </Pressable>
        <Pressable style={styles.quickLink} onPress={() => router.push('/stories')}>
          <Text style={styles.quickLinkIcon}>📖</Text>
          <Text style={styles.quickLinkText}>Stories</Text>
        </Pressable>
        <Pressable style={styles.quickLink} onPress={() => router.push('/quiz')}>
          <Text style={styles.quickLinkIcon}>🧠</Text>
          <Text style={styles.quickLinkText}>Quiz</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    paddingTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.goldMid,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.bronzeText,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.mutedText,
    fontWeight: '500',
  },
  reflectionCard: {
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.bronzeText,
    marginBottom: SPACING.xs,
  },
  reflectionText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.mutedText,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  sunnahCard: {
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.goldMid,
  },
  sunnahAction: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.bronzeText,
    marginBottom: SPACING.xs,
  },
  sunnahReference: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.mutedText,
  },
  quickLinks: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  quickLink: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickLinkIcon: {
    fontSize: 24,
  },
  quickLinkText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.bronzeText,
  },
})
