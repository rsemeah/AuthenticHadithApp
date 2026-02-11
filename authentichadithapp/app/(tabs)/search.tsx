import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { HadithList } from '@/components/hadith/HadithList';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { expandSearchQuery } from '@/lib/search/topics';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/styles/colors';
import { Hadith } from '@/types/hadith';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebouncedValue(searchQuery, 500);

  const { data: hadiths = [], isLoading } = useQuery({
    queryKey: ['search-hadiths', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];

      const expandedTerms = expandSearchQuery(debouncedQuery);
      const searchPattern = expandedTerms.join(' | ');

      const { data, error } = await supabase
        .from('hadiths')
        .select('*')
        .or(`english_text.ilike.%${debouncedQuery}%,arabic_text.ilike.%${debouncedQuery}%`)
        .limit(50);

      if (error) throw error;
      return data as Hadith[];
    },
    enabled: debouncedQuery.length > 2,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Search Hadiths</Text>
        <Text style={styles.subtitle}>TruthSerum v2 with synonym expansion</Text>
        
        <Input
          placeholder="Search by keyword, topic, or narrator..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {debouncedQuery.length > 2 ? (
        <HadithList
          hadiths={hadiths}
          isLoading={isLoading}
          onHadithPress={(hadith) => router.push(`/hadith/${hadith.id}`)}
          emptyMessage="No hadiths found. Try different keywords."
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Enter at least 3 characters to search
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
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
    marginBottom: SPACING.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.mutedText,
    textAlign: 'center',
  },
});
