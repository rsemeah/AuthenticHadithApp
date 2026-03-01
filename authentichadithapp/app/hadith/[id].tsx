import React from 'react'
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useHadith } from '@/hooks/use-hadith'
import { useAuth } from '@/hooks/use-auth'
import { Ionicons } from '@expo/vector-icons'

export default function HadithDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  const { hadith, isLoading, isBookmarked, toggleBookmark, isTogglingBookmark } = useHadith(id, user?.id)

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { HadithCard } from '@/components/hadith/HadithCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { shareHadith } from '@/components/share/ShareSheet';
import { SaveHadithModal } from '@/components/my-hadith/SaveHadithModal';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/styles/colors';
import { Hadith } from '@/types/hadith';

export default function HadithDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [showSaveModal, setShowSaveModal] = useState(false);

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
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Hadith not found</Text>
      </View>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Hadith ${hadith.hadith_number}`,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => toggleBookmark()}
              disabled={isTogglingBookmark || !user}
              style={styles.bookmarkButton}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={isBookmarked ? '#1B5E43' : '#666'}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.collection}>{hadith.collection?.name || 'Unknown Collection'}</Text>
          <Text style={styles.hadithNumber}>Hadith #{hadith.hadith_number}</Text>
        </View>

        {hadith.narrator && (
          <View style={styles.section}>
            <Text style={styles.label}>Narrator:</Text>
            <Text style={styles.text}>{hadith.narrator}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Arabic Text:</Text>
          <Text style={[styles.text, styles.arabicText]}>{hadith.arabic_text}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>English Translation:</Text>
          <Text style={styles.text}>{hadith.english_text}</Text>
        </View>

        {hadith.grade && (
          <View style={styles.gradeContainer}>
            <Text style={styles.gradeLabel}>Grade:</Text>
            <Text style={styles.gradeText}>{hadith.grade}</Text>
          </View>
        )}
      </ScrollView>
    </>
  )
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
            title="💾 Save"
            onPress={() => setShowSaveModal(true)}
            variant="outline"
          />
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

      <SaveHadithModal
        visible={showSaveModal}
        hadithId={id}
        onClose={() => setShowSaveModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  bookmarkButton: {
    marginRight: 8,
    padding: 8,
  },
  header: {
    marginBottom: 24,
  },
  collection: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B5E43',
    marginBottom: 4,
  },
  hadithNumber: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  arabicText: {
    textAlign: 'right',
    fontSize: 18,
    lineHeight: 32,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F6F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  gradeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  gradeText: {
    fontSize: 14,
    color: '#1B5E43',
    fontWeight: '500',
  },
})
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
