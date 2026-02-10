/**
 * TalibBadge — Displays the user's Talib Rating tier with XP progress.
 */
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../lib/colors";
import { getXPProgress } from "../lib/xp";

interface Props {
  totalXP: number;
  tier: string;
  compact?: boolean;
}

export default function TalibBadge({ totalXP, tier, compact }: Props) {
  const { current, next, progress, xpInTier, xpNeeded } = getXPProgress(totalXP);

  if (compact) {
    return (
      <View style={[styles.compactContainer, { borderColor: current.color }]}>
        <Text style={[styles.compactArabic, { color: current.color }]}>
          {current.arabic}
        </Text>
        <Text style={[styles.compactName, { color: current.color }]}>
          {current.name}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tier display */}
      <View style={[styles.tierCircle, { borderColor: current.color }]}>
        <Text style={[styles.tierArabic, { color: current.color }]}>
          {current.arabic}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.tierName, { color: current.color }]}>
          {current.name}
        </Text>
        <Text style={styles.xpText}>{totalXP.toLocaleString()} XP</Text>

        {/* Progress bar to next tier */}
        {next && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round(progress * 100)}%`,
                    backgroundColor: current.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {xpInTier}/{xpNeeded} to {next.name}
            </Text>
          </View>
        )}

        {!next && (
          <View style={styles.maxRank}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.maxRankText}>Maximum rank achieved</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  tierCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  tierArabic: {
    fontSize: 22,
    fontWeight: "700",
  },
  info: {
    flex: 1,
  },
  tierName: {
    fontSize: 18,
    fontWeight: "800",
  },
  xpText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  maxRank: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  maxRankText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: "600",
  },

  // Compact variant
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  compactArabic: {
    fontSize: 14,
    fontWeight: "700",
  },
  compactName: {
    fontSize: 12,
    fontWeight: "600",
  },
});
