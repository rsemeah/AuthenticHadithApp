import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PremiumGate } from '@/components/premium/PremiumGate';
import { useAuth } from '@/lib/auth/AuthProvider';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/styles/colors';

interface LearningPath {
  id: string;
  slug: string;
  title: string;
  name?: string;
  description: string | null;
  level: string | null;
  difficulty?: string;
  estimated_days?: number;
  is_premium: boolean;
  sort_order: number;
  order_index?: number;
}

interface PathProgress {
  path_id: string;
  status: string;
  last_lesson_id: string | null;
  last_activity_at: string | null;
}

interface LessonProgress {
  lesson_id: string;
  state: string;
  path_id: string;
}

export default function LearnScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: paths, isLoading: pathsLoading } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data ?? []) as LearningPath[];
    },
  });

  const pathIds = useMemo(() => (paths ?? []).map(p => p.id), [paths]);

  const { data: lessonCounts } = useQuery({
    queryKey: ['learning-lesson-counts', pathIds],
    enabled: pathIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_path_lessons')
        .select('path_id')
        .in('path_id', pathIds);

      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const l of data ?? []) {
        counts[l.path_id] = (counts[l.path_id] ?? 0) + 1;
      }
      return counts;
    },
  });

  const { data: pathProgress } = useQuery({
    queryKey: ['learning-path-progress', user?.id, pathIds],
    enabled: !!user && pathIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_learning_path_progress')
        .select('path_id, status, last_lesson_id, last_activity_at')
        .eq('user_id', user!.id)
        .in('path_id', pathIds);

      if (error) throw error;
      const map: Record<string, PathProgress> = {};
      for (const p of data ?? []) {
        map[p.path_id] = p;
      }
      return map;
    },
  });

  const { data: lessonProgressCounts } = useQuery({
    queryKey: ['learning-lesson-progress', user?.id, pathIds],
    enabled: !!user && pathIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, state, path_id')
        .eq('user_id', user!.id)
        .in('path_id', pathIds)
        .eq('state', 'completed');

      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const l of (data ?? []) as LessonProgress[]) {
        counts[l.path_id] = (counts[l.path_id] ?? 0) + 1;
      }
      return counts;
    },
  });

  const getPercent = useCallback((pathId: string) => {
    const total = lessonCounts?.[pathId] ?? 0;
    const completed = lessonProgressCounts?.[pathId] ?? 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [lessonCounts, lessonProgressCounts]);

  if (pathsLoading) {
    return <LoadingSpinner />;
  }

  const freePaths = paths?.filter(p => !p.is_premium) || [];
  const premiumPaths = paths?.filter(p => p.is_premium) || [];

  const renderPathCard = (item: LearningPath) => {
    const pp = pathProgress?.[item.id];
    const percent = getPercent(item.id);
    const total = lessonCounts?.[item.id] ?? 0;
    const completed = lessonProgressCounts?.[item.id] ?? 0;
    const isComplete = pp?.status === 'completed';
    const isActive = pp?.status === 'active';

    return (
      <Pressable onPress={() => router.push(`/learn/${item.id}`)}>
        <Card variant="elevated" style={styles.pathCard}>
          <View style={styles.pathHeader}>
            <Text style={styles.pathName}>{item.title || item.name}</Text>
            <Text style={styles.difficultyBadge}>{item.level || item.difficulty}</Text>
          </View>
          <Text style={styles.pathDescription}>{item.description}</Text>

          {user && (isActive || isComplete) && (
            <View style={styles.progressSection}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${percent}%` as any,
                      backgroundColor: isComplete ? COLORS.emeraldMid : '#C5A059',
                    },
                  ]}
                />
              </View>
              <View style={styles.progressMeta}>
                <Text style={styles.progressText}>
                  {isComplete ? 'Completed' : `${percent}% complete`}
                </Text>
                <Text style={styles.progressCount}>
                  {completed}/{total} lessons
                </Text>
              </View>
            </View>
          )}

          {user && !isComplete && (
            <View style={styles.ctaRow}>
              <Text style={[styles.ctaText, { color: isActive ? '#C5A059' : COLORS.emeraldMid }]}>
                {isActive ? 'Resume →' : 'Start Learning →'}
              </Text>
            </View>
          )}

          {!user && (
            <Text style={styles.pathDuration}>
              {total > 0 ? `${total} lessons` : `${item.estimated_days ?? '?'} days`}
            </Text>
          )}
        </Card>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎓 Learning Paths</Text>
        <Text style={styles.subtitle}>
          Structured curriculum from beginner to scholar
        </Text>
      </View>

      <FlatList
        data={freePaths}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderPathCard(item)}
        ListFooterComponent={() => (
          premiumPaths.length > 0 ? (
            <PremiumGate
              feature="Premium Learning Paths"
              description="Unlock advanced and scholar-level paths with premium"
            >
              {premiumPaths.map((item) => (
                <View key={item.id}>{renderPathCard(item)}</View>
              ))}
            </PremiumGate>
          ) : null
        )}
        contentContainerStyle={styles.content}
      />
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
  content: {
    padding: SPACING.md,
  },
  pathCard: {
    marginBottom: SPACING.md,
  },
  pathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pathName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.bronzeText,
    flex: 1,
  },
  difficultyBadge: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.emeraldMid,
    backgroundColor: COLORS.emeraldHighlight + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
    overflow: 'hidden',
  },
  pathDescription: {
    fontSize: FONT_SIZES.base,
    color: COLORS.mutedText,
    marginBottom: SPACING.sm,
  },
  pathDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.mutedText,
  },
  progressSection: {
    marginTop: SPACING.xs,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.mutedText,
  },
  progressCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.mutedText,
  },
  ctaRow: {
    marginTop: SPACING.sm,
  },
  ctaText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
