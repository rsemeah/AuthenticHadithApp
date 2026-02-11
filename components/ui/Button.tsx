import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  PressableProps,
} from "react-native";
import { Colors } from "../../lib/colors";

interface Props extends Omit<PressableProps, "children"> {
  onPress: () => void;
  children: string;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
}

export default function Button({
  onPress,
  children,
  variant = "primary",
  loading,
  disabled,
  ...rest
}: Props) {
  const buttonStyles = {
    primary: styles.primaryButton,
    secondary: styles.secondaryButton,
    ghost: styles.ghostButton,
  };

  const textStyles = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    ghost: styles.ghostText,
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        buttonStyles[variant],
        (disabled || loading) && styles.disabled,
        { opacity: pressed && !disabled && !loading ? 0.85 : 1 },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#fff" : Colors.primary}
        />
      ) : (
        <Text style={[styles.text, textStyles[variant]]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: Colors.primary,
  },
  ghostText: {
    color: Colors.primary,
  },
});
