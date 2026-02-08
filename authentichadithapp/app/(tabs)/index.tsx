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

