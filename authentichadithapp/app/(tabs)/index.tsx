import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { HadithCard } from '@/components/hadith/HadithCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/styles/colors';
import { Hadith } from '@/types/hadith';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: hadith, isLoading, refetch } = useQuery({
    queryKey: ['random-hadith', refreshKey],
    queryFn: async () => {
      // Get a random hadith
      const { data, error } = await supabase
        .from('hadiths')
        .select('*')
        .limit(1)
        .order('id', { ascending: false })
        .range(Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000) + 1)
        .single();

      if (error) throw error;
      return data as Hadith;
    },
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

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
        <Text style={styles.title}>🌙 Hadith of the Moment</Text>
        <Text style={styles.subtitle}>
          Discover authentic sayings of Prophet Muhammad ﷺ
        </Text>
      </View>

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
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.bronzeText,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.mutedText,
    lineHeight: 22,
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
});
