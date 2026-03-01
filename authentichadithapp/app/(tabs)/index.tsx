import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/hooks/use-auth'

export default function HomeScreen() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Authentic Hadith</Text>
        <Text style={styles.subtitle}>
          Access 36,000+ verified hadiths from 6 major collections
        </Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/collections')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#1B5E43' }]}>
            <Ionicons name="book" size={32} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Collections</Text>
          <Text style={styles.cardSubtitle}>Browse hadith collections</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/bookmarks')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#C5A059' }]}>
            <Ionicons name="bookmark" size={32} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Bookmarks</Text>
          <Text style={styles.cardSubtitle}>Your saved hadiths</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/modal')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#6366F1' }]}>
            <Ionicons name="search" size={32} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Search</Text>
          <Text style={styles.cardSubtitle}>Find specific hadiths</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/modal')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#EC4899' }]}>
            <Ionicons name="person" size={32} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Profile</Text>
          <Text style={styles.cardSubtitle}>
            {isAuthenticated ? 'Manage account' : 'Sign in'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color="#1B5E43" />
        <View style={styles.infoText}>
          <Text style={styles.infoTitle}>Getting Started</Text>
          <Text style={styles.infoDescription}>
            This mobile app connects to the shared Supabase backend at authentichadith.app. 
            Configure your environment variables in .env to get started.
          </Text>
        </View>
      </View>

      {!isAuthenticated && (
        <View style={styles.authPrompt}>
          <Text style={styles.authText}>Sign in to bookmark hadiths and sync across devices</Text>
        </View>
      )}
    </ScrollView>
  )
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { HadithCard } from '@/components/hadith/HadithCard';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { LevelProgressBar } from '@/components/gamification/LevelProgressBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/lib/styles/colors';
import { getLevelInfo } from '@/lib/gamification/level-calculator';
import { Hadith } from '@/types/hadith';

const QUICK_ACTIONS = [
  { icon: '☀️', label: 'Today', route: '/(tabs)/today' },
  { icon: '🧠', label: 'Quiz', route: '/quiz' },
  { icon: '📖', label: 'Stories', route: '/stories' },
  { icon: '🕌', label: 'Sunnah', route: '/sunnah' },
  { icon: '📊', label: 'Progress', route: '/progress' },
  { icon: '🏆', label: 'Badges', route: '/achievements' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: hadith, isLoading, refetch } = useQuery({
    queryKey: ['random-hadith', refreshKey],
    queryFn: async () => {
      const offset = Math.floor(Math.random() * 1000);
      const { data, error } = await supabase
        .from('hadiths')
        .select('*')
        .limit(1)
        .order('id', { ascending: false })
        .range(offset, offset)
        .single();

      if (error) throw error;
      return data as Hadith;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: streak } = useQuery({
    queryKey: ['user-streak', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const levelInfo = getLevelInfo(stats?.xp || 0);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {user ? `Assalamu Alaikum${stats?.xp ? `, ${levelInfo.title}` : ''}` : 'Assalamu Alaikum'}
        </Text>
        <Text style={styles.title}>Authentic Hadith</Text>
      </View>

      {/* Level & Streak (logged in users) */}
      {user && stats && (
        <Card variant="elevated" style={styles.levelCard}>
          <LevelProgressBar levelInfo={levelInfo} />
        </Card>
      )}

      {user && streak && (
        <StreakCounter
          currentStreak={streak.current_streak || 0}
          longestStreak={streak.longest_streak || 0}
        />
      )}

      {/* Quick Actions Grid */}
      <View style={styles.quickActionsGrid}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.label}
            style={styles.quickAction}
            onPress={() => router.push(action.route as any)}
          >
            <Text style={styles.quickActionIcon}>{action.icon}</Text>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Hadith of the Moment */}
      <Text style={styles.sectionTitle}>Hadith of the Moment</Text>

      {hadith && (
        <HadithCard
          hadith={hadith}
          onPress={() => router.push(`/hadith/${hadith.id}`)}
        />
      )}

      <View style={styles.actions}>
        <Button
          title="Get Another Hadith"
          onPress={handleRefresh}
          variant="primary"
        />
        <Button
          title="Browse Collections"
          onPress={() => router.push('/(tabs)/collections')}
          variant="outline"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Access 36,246 authentic hadiths from 8 major collections
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F2',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1B5E43',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1B5E43',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  greeting: {
    fontSize: FONT_SIZES.base,
    color: COLORS.goldMid,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.bronzeText,
  },
  levelCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.bronzeText,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quickAction: {
    width: '31%',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.bronzeText,
  },
  actions: {
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  footer: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.mutedText,
    textAlign: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  authPrompt: {
    backgroundColor: '#1B5E43',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  authText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
})

