import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";

import { theme, dangerColor, LEATHER_TEXTURE } from "../src/theme";
import { fetchEras, fetchStats, Era, Stats } from "../src/api";
import { useGame } from "../src/state";

export default function EraSelector() {
  const router = useRouter();
  const { setEra, reset } = useGame();

  const [eras, setEras] = useState<Era[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [e, s] = await Promise.all([fetchEras(), fetchStats()]);
      setEras(e);
      setStats(s);
    } catch (err: any) {
      setError("The time stream is unstable. Pull to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    reset();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const onPickEra = (era: Era) => {
    if (era.tier === "premium") return;
    setEra(era);
    router.push("/picker");
  };

  const free = eras.filter((e) => e.tier === "free");
  const premium = eras.filter((e) => e.tier === "premium");

  return (
    <ImageBackground
      source={{ uri: LEATHER_TEXTURE }}
      style={styles.bg}
      imageStyle={{ opacity: 0.18 }}
    >
      <LinearGradient
        colors={["#110e0aF0", "#110e0a"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.gold}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>⭐ RECOMMENDED</Text>
              <Text style={styles.title}>Epoch</Text>
              <Text style={styles.subtitle}>
                Would you survive the moment that changed everything?
              </Text>
            </View>
            <TouchableOpacity
              testID="open-history"
              onPress={() => router.push("/history")}
              style={styles.historyBtn}
            >
              <Ionicons name="time-outline" size={22} color={theme.colors.gold} />
            </TouchableOpacity>
          </View>

          {/* Stats Strip */}
          {stats && stats.total_games > 0 && (
            <Animated.View entering={FadeIn.duration(500)} style={styles.statsStrip}>
              <Stat label="Runs" value={stats.total_games} />
              <Divider />
              <Stat label="Survived" value={`${stats.survival_rate}%`} />
              <Divider />
              <Stat label="Best" value={stats.best_score} />
              <Divider />
              <Stat label="Streak" value={stats.current_streak} />
            </Animated.View>
          )}

          {error && (
            <Text style={styles.error} testID="home-error">
              {error}
            </Text>
          )}

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={theme.colors.gold} size="large" />
              <Text style={styles.loaderText}>
                Opening the chrono-ledger…
              </Text>
            </View>
          ) : (
            <>
              <SectionTitle label="Free Eras" count={free.length} />
              {free.map((era, i) => (
                <EraCard
                  key={era.id}
                  era={era}
                  index={i}
                  onPress={() => onPickEra(era)}
                />
              ))}

              <SectionTitle label="Premium Eras" count={premium.length} locked />
              {premium.map((era, i) => (
                <EraCard
                  key={era.id}
                  era={era}
                  index={i}
                  onPress={() => onPickEra(era)}
                />
              ))}

              <Text style={styles.footer}>
                More eras unlock as you survive enough runs.
              </Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function SectionTitle({
  label,
  count,
  locked,
}: {
  label: string;
  count: number;
  locked?: boolean;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionLabel}>
        {label}{" "}
        <Text style={styles.sectionCount}>
          {locked ? "· LOCKED · " : "· "}
          {count}
        </Text>
      </Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

function EraCard({
  era,
  index,
  onPress,
}: {
  era: Era;
  index: number;
  onPress: () => void;
}) {
  const locked = era.tier === "premium";
  return (
    <Animated.View entering={FadeInUp.delay(index * 80).springify()}>
      <TouchableOpacity
        testID={`era-card-${era.id}`}
        activeOpacity={locked ? 1 : 0.85}
        onPress={onPress}
        style={styles.card}
      >
        <Image
          source={{ uri: era.image }}
          style={[styles.cardImage, locked && { opacity: 0.35 }]}
        />
        <LinearGradient
          colors={["transparent", "rgba(17,14,10,0.92)"]}
          style={styles.cardGradient}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardYear}>{era.year}</Text>
            <View
              style={[
                styles.dangerPill,
                { borderColor: dangerColor(era.danger) },
              ]}
            >
              <Ionicons
                name="warning-outline"
                size={11}
                color={dangerColor(era.danger)}
              />
              <Text
                style={[
                  styles.dangerText,
                  { color: dangerColor(era.danger) },
                ]}
              >
                DANGER {era.danger}/10
              </Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>{era.name}</Text>
          <Text style={styles.cardTeaser} numberOfLines={2}>
            {era.teaser}
          </Text>
        </View>

        {locked && (
          <View style={styles.lockOverlay} pointerEvents="none">
            <View style={styles.lockBadge}>
              <Ionicons
                name="lock-closed"
                size={18}
                color={theme.colors.gold}
              />
              <Text style={styles.lockText}>LOCKED</Text>
            </View>
          </View>
        )}
        {!locked && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>FREE</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: theme.colors.bg },
  scroll: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.lg,
  },
  kicker: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 2.5,
    color: theme.colors.gold,
    marginBottom: 6,
  },
  title: {
    fontFamily: theme.fonts.heading,
    fontSize: 34,
    lineHeight: 38,
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  statsStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    marginBottom: theme.spacing.lg,
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: {
    fontFamily: theme.fonts.heading,
    fontSize: 22,
    color: theme.colors.parchment,
  },
  statLabel: {
    fontFamily: theme.fonts.body,
    fontSize: 9,
    letterSpacing: 2,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.borderSubtle,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
  },
  sectionLabel: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 3,
    color: theme.colors.parchment,
  },
  sectionCount: { color: theme.colors.textSecondary, letterSpacing: 1.5 },
  card: {
    height: 200,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.md,
  },
  cardImage: { width: "100%", height: "100%", position: "absolute" },
  cardGradient: { ...StyleSheet.absoluteFillObject },
  cardContent: { flex: 1, padding: 16, justifyContent: "flex-end" },
  cardTopRow: {
    position: "absolute",
    top: 14,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardYear: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.parchment,
    backgroundColor: "rgba(17,14,10,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dangerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "rgba(17,14,10,0.7)",
  },
  dangerText: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  cardTitle: {
    fontFamily: theme.fonts.heading,
    fontSize: 28,
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  cardTeaser: {
    marginTop: 4,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17,14,10,0.45)",
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    backgroundColor: "rgba(17,14,10,0.8)",
  },
  lockText: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.gold,
  },
  freeBadge: {
    position: "absolute",
    top: 14,
    right: 16,
    // overridden by cardTopRow danger pill; we don't render this anymore
    opacity: 0,
  },
  freeBadgeText: { display: "none" } as any,
  loaderWrap: {
    paddingVertical: theme.spacing.xxl,
    alignItems: "center",
    gap: 14,
  },
  loaderText: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.textSecondary,
    letterSpacing: 2,
  },
  error: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.danger,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  footer: {
    marginTop: theme.spacing.lg,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    letterSpacing: 1.5,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
});
