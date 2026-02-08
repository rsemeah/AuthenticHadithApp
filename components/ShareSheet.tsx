import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
  Clipboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../lib/colors";
import { Hadith } from "./HadithCard";
import { shareHadith, formatHadithShareText } from "../lib/share";

interface Props {
  visible: boolean;
  onClose: () => void;
  hadith: Hadith;
}

export default function ShareSheet({ visible, onClose, hadith }: Props) {
  const handleSharePrivately = async () => {
    onClose();
    await shareHadith(hadith);
  };

  const handleCopyLink = () => {
    const text = formatHadithShareText(hadith);
    Clipboard.setString(text);
    onClose();
  };

  const handleSystemShare = async () => {
    onClose();
    await shareHadith(hadith);
  };

  const sourceLine = [
    hadith.collection_name,
    hadith.reference,
    hadith.grading,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View />
      </Pressable>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Preview */}
        <View style={styles.preview}>
          <View style={styles.previewCard}>
            {hadith.arabic_text ? (
              <Text style={styles.previewArabic} numberOfLines={2}>
                {hadith.arabic_text}
              </Text>
            ) : null}
            {hadith.english_text ? (
              <Text style={styles.previewEnglish} numberOfLines={2}>
                {hadith.english_text}
              </Text>
            ) : null}
            {sourceLine ? (
              <Text style={styles.previewSource}>{sourceLine}</Text>
            ) : null}
            <View style={styles.verifiedRow}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={Colors.primary}
              />
              <Text style={styles.verifiedText}>Verified</Text>
              <Text style={styles.attribution}>Authentic Hadith</Text>
            </View>
          </View>
        </View>

        {/* Primary CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleSharePrivately}
        >
          <Ionicons name="paper-plane-outline" size={20} color="#fff" />
          <Text style={styles.primaryBtnText}>Share Privately</Text>
        </Pressable>

        {/* Secondary actions row */}
        <View style={styles.secondaryRow}>
          <Pressable style={styles.secondaryBtn} onPress={handleCopyLink}>
            <Ionicons name="copy-outline" size={22} color={Colors.text} />
            <Text style={styles.secondaryLabel}>Copy Text</Text>
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={handleSystemShare}>
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={Colors.text}
            />
            <Text style={styles.secondaryLabel}>More...</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Sharing knowledge is sadaqah.</Text>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  preview: {
    marginBottom: 16,
  },
  previewCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewArabic: {
    fontSize: 16,
    lineHeight: 28,
    color: Colors.textArabic,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 8,
  },
  previewEnglish: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
    marginBottom: 8,
  },
  previewSource: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  attribution: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: "auto",
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginBottom: 16,
  },
  secondaryBtn: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
});
