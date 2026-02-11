import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { PremiumGate } from '@/components/premium/PremiumGate';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/styles/colors';

export default function AssistantScreen() {
  return (
    <PremiumGate feature="AI Assistant" description="Chat with TruthSerum v2 AI assistant">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>✨ AI Assistant</Text>
          <Text style={styles.subtitle}>
            Ask questions about Islamic teachings and get answers backed by authentic hadiths
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Card>
            <Text style={styles.comingSoon}>🚧 Coming Soon</Text>
            <Text style={styles.description}>
              The AI Assistant feature is currently in development. It will help you:
            </Text>
            <View style={styles.featureList}>
              <Text style={styles.feature}>• Ask questions about Islamic topics</Text>
              <Text style={styles.feature}>• Get answers with hadith references</Text>
              <Text style={styles.feature}>• Learn about specific narrators</Text>
              <Text style={styles.feature}>• Understand context and interpretations</Text>
            </View>
          </Card>
        </ScrollView>
      </View>
    </PremiumGate>
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
  },
  content: {
    padding: SPACING.md,
  },
  comingSoon: {
    fontSize: FONT_SIZES.xxl,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: FONT_SIZES.base,
    color: COLORS.bronzeText,
    marginBottom: SPACING.md,
  },
  featureList: {
    marginLeft: SPACING.md,
  },
  feature: {
    fontSize: FONT_SIZES.base,
    color: COLORS.mutedText,
    marginBottom: SPACING.sm,
  },
});
