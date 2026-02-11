import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { HadithCard } from '@/components/hadith/HadithCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { shareHadith } from '@/components/share/ShareSheet';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/styles/colors';
import { Hadith } from '@/types/hadith';

export default function HadithDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: hadith, isLoading } = useQuery({
    queryKey: ['hadith', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hadiths')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Hadith;
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!hadith) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>Hadith not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Button
          title="← Back"
          onPress={() => router.back()}
          variant="ghost"
        />

        <HadithCard hadith={hadith} />

        <View style={styles.actions}>
          <Button
            title="Share"
            onPress={() => shareHadith(hadith)}
            variant="primary"
          />
          <Button
            title="View Collection"
            onPress={() => router.push(`/collection/${hadith.collection_slug}`)}
            variant="outline"
          />
        </View>
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
  actions: {
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.mutedText,
  },
});
