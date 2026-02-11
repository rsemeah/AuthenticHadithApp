import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../lib/colors";
import { PRODUCTS, formatPrice, type Product } from "../../lib/products";

const PLAN_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "monthly-intro": "flash",
  "monthly-premium": "star",
  "annual-premium": "ribbon",
  "lifetime-access": "infinite",
};

function PriceDisplay({ product }: { product: Product }) {
  if (product.interval === "year") {
    const monthly = (product.priceInCents / 100 / 12).toFixed(2);
    return (
      <View style={styles.priceCol}>
        <Text style={styles.priceMain}>{formatPrice(product.priceInCents)}</Text>
        <Text style={styles.priceSub}>${monthly}/mo</Text>
        <Text style={styles.priceBilledLabel}>billed yearly</Text>
      </View>
    );
  }
  if (product.interval === "month") {
    return (
      <View style={styles.priceCol}>
        <Text style={styles.priceMain}>{formatPrice(product.priceInCents)}</Text>
        <Text style={styles.priceBilledLabel}>per month</Text>
      </View>
    );
  }
  return (
    <View style={styles.priceCol}>
      <Text style={styles.priceMain}>{formatPrice(product.priceInCents)}</Text>
      <Text style={styles.priceBilledLabel}>one-time</Text>
    </View>
  );
}

export default function PricingScreen() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelect = (planId: string) => {
    // In the future, this will launch Stripe / RevenueCat checkout
    Alert.alert(
      "Coming Soon",
      "In-app purchases will be available in a future update. Thank you for your interest!",
      [{ text: "OK" }]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Choose Your Plan",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="star" size={32} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>
            Unlock Authentic Hadith Premium
          </Text>
          <Text style={styles.headerSub}>
            Get full access to AI explanations, advanced search, learning paths,
            and more.
          </Text>
        </View>

        {/* Plans */}
        {PRODUCTS.map((plan) => {
          const icon = PLAN_ICONS[plan.id] || "star";
          return (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                plan.highlighted && styles.planCardHighlighted,
              ]}
            >
              {plan.badge && (
                <View
                  style={[
                    styles.badge,
                    plan.highlighted
                      ? styles.badgeGold
                      : plan.id === "lifetime-access"
                        ? styles.badgeGreen
                        : styles.badgeGray,
                  ]}
                >
                  <Text style={styles.badgeText}>{plan.badge}</Text>
                </View>
              )}

              <View style={styles.planRow}>
                <View style={styles.planLeft}>
                  <View style={styles.planIconBox}>
                    <Ionicons name={icon} size={20} color={Colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDesc} numberOfLines={2}>
                      {plan.description}
                    </Text>
                  </View>
                </View>
                <PriceDisplay product={plan} />
              </View>

              {plan.features && (
                <View style={styles.featureList}>
                  {plan.features.map((f) => (
                    <View key={f} style={styles.featureRow}>
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary}
                      />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Pressable
                style={[
                  styles.subscribeBtn,
                  plan.highlighted && styles.subscribeBtnGold,
                  plan.id === "lifetime-access" && styles.subscribeBtnGreen,
                ]}
                onPress={() => handleSelect(plan.id)}
              >
                <Text
                  style={[
                    styles.subscribeBtnText,
                    (plan.highlighted || plan.id === "lifetime-access") && {
                      color: "#fff",
                    },
                  ]}
                >
                  {plan.mode === "payment"
                    ? "Buy Lifetime Access"
                    : "Subscribe Now"}
                </Text>
              </Pressable>
            </View>
          );
        })}

        {/* Free tier */}
        <View style={styles.freeCard}>
          <Text style={styles.freeTitle}>FREE TIER (CURRENT)</Text>
          {[
            "Browse all 8 hadith collections",
            "Basic search",
            "Save & bookmark hadiths",
            "AI assistant (limited)",
          ].map((f) => (
            <View key={f} style={styles.featureRow}>
              <Ionicons
                name="checkmark"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={[styles.featureText, { color: Colors.textSecondary }]}>
                {f}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 24 },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 300,
    lineHeight: 20,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planCardHighlighted: {
    borderColor: Colors.accent,
    borderWidth: 2,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  badge: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  badgeGold: { backgroundColor: Colors.accent },
  badgeGreen: { backgroundColor: Colors.primary },
  badgeGray: { backgroundColor: Colors.textSecondary },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  planRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    marginTop: 4,
  },
  planLeft: { flexDirection: "row", gap: 10, flex: 1 },
  planIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  planName: { fontSize: 16, fontWeight: "600", color: Colors.text },
  planDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  priceCol: { alignItems: "flex-end", marginLeft: 12 },
  priceMain: { fontSize: 22, fontWeight: "700", color: Colors.text },
  priceSub: { fontSize: 11, color: Colors.accent, fontWeight: "600" },
  priceBilledLabel: { fontSize: 10, color: Colors.textSecondary },
  featureList: { marginBottom: 14 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  featureText: { fontSize: 13, color: Colors.text },
  subscribeBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subscribeBtnGold: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  subscribeBtnGreen: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  subscribeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  freeCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 18,
    backgroundColor: Colors.surface + "80",
  },
  freeTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
  },
});
