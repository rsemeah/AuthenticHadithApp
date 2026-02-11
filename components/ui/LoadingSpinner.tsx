import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Colors } from "../../lib/colors";

interface Props {
  size?: "small" | "large";
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = "large",
  fullScreen = false,
}: Props) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={Colors.primary} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={Colors.primary} />;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
});
