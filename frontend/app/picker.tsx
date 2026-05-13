import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";

import { theme } from "../src/theme";
import { fetchItems, Item } from "../src/api";
import { useGame } from "../src/state";
import PrimaryButton from "../src/components/PrimaryButton";

export default function ItemPickerScreen() {
  const router = useRouter();
  const { era, item, setItem } = useGame();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!era) {
      router.replace("/");
      return;
    }
    fetchItems()
      .then(setItems)
      .finally(() => setLoading(false));
  }, [era, router]);

  if (!era) return null;

  const onSelect = (it: Item) => {
    setItem(it);
  };

  const onNext = () => {
    if (!item) return;
    router.push("/action");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header image */}
      <View style={styles.heroWrap}>
        <Image source={{ uri: era.image }} style={styles.hero} />
        <LinearGradient
          colors={["transparent", "rgba(17,14,10,0.95)", "#110e0a"]}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity
          testID="back-to-home"
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.gold} />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <Text style={styles.heroYear}>{era.year}</Text>
          <Text style={styles.heroName}>{era.name}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <Text style={styles.kicker}>SCENARIO</Text>
          <Text style={styles.scenario}>{era.scenario}</Text>
        </Animated.View>

        <View style={styles.sectionRow}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionLabel}>Choose One Item</Text>
          <View style={styles.sectionLine} />
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.gold} style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.grid}>
            {items.map((it, i) => {
              const selected = item?.id === it.id;
              return (
                <Animated.View
                  key={it.id}
                  entering={FadeInUp.delay(i * 50).springify()}
                  style={styles.cellWrap}
                >
                  <TouchableOpacity
                    testID={`item-card-${it.id}`}
                    activeOpacity={0.85}
                    onPress={() => onSelect(it)}
                    style={[
                      styles.cell,
                      selected && styles.cellSelected,
                    ]}
                  >
                    <Ionicons
                      name={it.icon as any}
                      size={36}
                      color={selected ? theme.colors.gold : theme.colors.parchment}
                    />
                    <Text
                      style={[
                        styles.cellLabel,
                        selected && { color: theme.colors.gold },
                      ]}
                    >
                      {it.name}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          testID="enter-time-stream"
          label={item ? `Enter the Time Stream · ${item.name}` : "Select an item to continue"}
          onPress={onNext}
          disabled={!item}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  heroWrap: {
    height: 200,
    width: "100%",
    overflow: "hidden",
  },
  hero: { width: "100%", height: "100%", position: "absolute" },
  backBtn: {
    position: "absolute",
    top: 8,
    left: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    backgroundColor: "rgba(17,14,10,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    position: "absolute",
    bottom: 14,
    left: 24,
    right: 24,
  },
  heroYear: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    letterSpacing: 3,
    color: theme.colors.gold,
  },
  heroName: {
    fontFamily: theme.fonts.heading,
    fontSize: 30,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  scroll: { padding: theme.spacing.lg, paddingBottom: 24 },
  kicker: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 2.5,
    color: theme.colors.gold,
  },
  scenario: {
    marginTop: 8,
    fontFamily: theme.fonts.heading,
    fontSize: 18,
    lineHeight: 26,
    color: theme.colors.parchment,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: theme.colors.borderSubtle },
  sectionLabel: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 3,
    color: theme.colors.parchment,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  cellWrap: { width: "50%", padding: 6 },
  cell: {
    aspectRatio: 1.05,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
  },
  cellSelected: {
    borderColor: theme.colors.gold,
    backgroundColor: "rgba(200, 149, 58, 0.08)",
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  cellLabel: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: theme.colors.parchment,
    textAlign: "center",
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.bg,
  },
});
