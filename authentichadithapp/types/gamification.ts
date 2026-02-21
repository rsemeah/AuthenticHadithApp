export type ActivityType = 'read_hadith' | 'complete_story' | 'share' | 'bookmark' | 'note' | 'complete_quiz' | 'complete_lesson' | 'sunnah_practice'

export type AchievementCategory = 'learning' | 'streaks' | 'social' | 'mastery' | 'milestones'

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  tier: AchievementTier
  icon: string
  xp_reward: number
  criteria_type: string
  criteria_value: number
  is_active: boolean
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  is_new: boolean
  achievement?: Achievement
}

export interface UserStats {
  user_id: string
  xp: number
  hadiths_read: number
  notes_count: number
  bookmarks_count: number
  shares_count: number
  stories_completed: number
  quizzes_completed: number
  perfect_quizzes: number
  lessons_completed: number
  sunnah_streak: number
}

export interface UserStreak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_active_date: string
  active_days: string[]
}

export interface LevelInfo {
  level: number
  title: string
  tier: AchievementTier
  tierColor: string
  currentXp: number
  xpForCurrentLevel: number
  xpForNextLevel: number
  progress: number
}

export interface SunnahPractice {
  id: string
  category: string
  category_icon: string
  category_color: string
  title: string
  description: string
  hadith_reference?: string
  order_index: number
}

export interface SunnahCategory {
  id: string
  name: string
  icon: string
  color: string
  practices_count: number
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
  hadith_id?: string
  type: 'narrator' | 'collection' | 'grade' | 'completion'
}

export interface QuizAttempt {
  id: string
  user_id: string
  score: number
  total_questions: number
  time_seconds: number
  questions: QuizQuestion[]
  answers: number[]
  created_at: string
}

export interface ProphetStory {
  id: string
  slug: string
  name: string
  arabic_name?: string
  quran_mentions: number
  era?: string
  description: string
  content_parts: string[]
  read_time_minutes: number
  display_order: number
  theme_color?: string
}

export interface CompanionStory {
  id: string
  slug: string
  name: string
  arabic_name?: string
  notable_tags: string[]
  description: string
  content_parts: string[]
  read_time_minutes: number
}

export interface StoryReadingProgress {
  id: string
  user_id: string
  story_id: string
  story_type: 'prophet' | 'companion'
  parts_completed: number[]
  status: 'not_started' | 'in_progress' | 'completed'
  bookmarked: boolean
  updated_at: string
}
