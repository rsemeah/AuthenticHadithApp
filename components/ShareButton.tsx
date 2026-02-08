import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../lib/colors";

interface Props {
  onPress: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
  variant?: "subtle" | "filled";
}

export default function ShareButton({
  onPress,
  size = 22,
  color,
  style,
  variant = "subtle",
}: Props) {
  const isFilled = variant === "filled";
  const iconColor = color ?? (isFilled ? "#fff" : Colors.primary);

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Share"
      accessibilityRole="button"
      style={({ pressed }) => [
        isFilled ? styles.filled : styles.subtle,
        { opacity: pressed ? 0.6 : 1 },
        style,
      ]}
      hitSlop={8}
    >
      <Ionicons
        name="share-outline"
        size={size}
        color={iconColor}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  subtle: {
    padding: 6,
  },
  filled: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 20,
  },
});
