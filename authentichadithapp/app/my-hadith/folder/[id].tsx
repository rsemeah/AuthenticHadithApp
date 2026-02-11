import React from 'react'
import { StyleSheet, View, Text, FlatList, Pressable, Share } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useFolderHadiths } from '@/hooks/useMyHadith'
import { HadithCard } from '@/components/hadith/HadithCard'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { COLORS, SPACING, FONT_SIZES } from '@/lib/styles/colors'

export default function FolderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: hadiths, isLoading } = useFolderHadiths(id)

  const handleShare = async () => {
    // TODO: Generate share link
    await Share.share({
      message: `Check out my hadith collection on Authentic Hadith App`,
      url: `https://authentichadith.app/shared/${id}`
    })
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="← Back"
          onPress={() => router.back()}
          variant="ghost"
        />
        <Button
          title="Share"
          onPress={handleShare}
          variant="outline"
        />
      </View>

      <FlatList
        data={hadiths}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/hadith/${item.hadith_id}`)}
          >
            <HadithCard hadith={item.hadith} />
            {item.notes && (
              <View style={styles.notes}>
                <Text style={styles.notesLabel}>My Notes:</Text>
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            )}
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hadiths in this folder yet</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  notes: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    marginHorizontal: SPACING.md,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.emeraldMid,
  },
  notesLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.emeraldMid,
    marginBottom: SPACING.xs,
  },
  notesText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.bronzeText,
    lineHeight: 20,
  },
  empty: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.mutedText,
    textAlign: 'center',
  },
})
