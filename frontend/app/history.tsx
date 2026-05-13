import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { theme, verdictColor } from "../src/theme";
import {
  fetchGames,
  fetchStats,
  clearGames,
  GameRecord,
  Stats,
} from "../src/api";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function HistoryScreen() {
  const router = useRouter();
  const [games, setGames] = useState<GameRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [g, s] = await Promise.all([fetchGames(), fetchStats()]);
      setGames(g);
      setStats(s);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onClear = () => {
    Alert.alert(
      "Erase the chronicle?",
      "All your past time travels will be lost to the void.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Erase",
          style: "destructive",
          onPress: async () => {
            await clearGames();
            load();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          testID="history-back"
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.gold} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>YOUR CHRONICLE</Text>
          <Text style={styles.title}>Time Logs</Text>
        </View>
        {games.length > 0 && (
          <TouchableOpacity
            testID="history-clear"
            onPress={onClear}
            style={styles.backBtn}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={theme.colors.gold}
          />
        }
      >
        {stats && (
          <View style={styles.bento}>
            <BentoCell label="Total Runs" value={stats.total_games} />
            <BentoCell label="Survival" value={`${stats.survival_rate}%`} accent />
            <BentoCell label="Best Score" value={stats.best_score} />
            <BentoCell label="Streak" value={stats.current_streak} />
            <BentoCell
              label="Legendary"
              value={stats.legendary_count}
              full
            />
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={theme.colors.gold} style={{ marginTop: 24 }} />
        ) : games.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="hourglass-outline"
              size={42}
              color={theme.colors.textMuted}
            />
            <Text style={styles.emptyText}>
              The chronicle is empty.{"\n"}Travel through time to leave your mark.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {games.map((g, i) => (
              <Animated.View
                key={g.id}
                entering={FadeInUp.delay(i * 60).springify()}
                style={[
                  styles.row,
                  { borderLeftColor: verdictColor(g.verdict) },
                ]}
              >
                <View style={styles.rowTop}>
                  <Text style={styles.rowEra}>{g.era_name}</Text>
                  <Text
                    style={[
                      styles.rowVerdict,
                      { color: verdictColor(g.verdict) },
                    ]}
                  >
                    {g.verdict}
                  </Text>
                </View>
                <Text style={styles.rowMeta}>
                  {g.item_name} · {formatDate(g.created_at)}
                </Text>
                <View style={styles.rowFoot}>
                  <Text style={styles.rowScore}>
                    {g.survival_score}
                    <Text style={styles.rowScoreSmall}>/100</Text>
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BentoCell({
  label,
  value,
  accent,
  full,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  full?: boolean;
}) {
  return (
    <View
      style={[
        styles.bentoCell,
        full && { width: "100%" },
        accent && {
          borderColor: theme.colors.gold,
          shadowColor: theme.colors.gold,
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
      ]}
    >
      <Text
        style={[
          styles.bentoValue,
          accent && { color: theme.colors.gold },
        ]}
      >
        {value}
      </Text>
      <Text style={styles.bentoLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 2.5,
    color: theme.colors.gold,
  },
  title: {
    fontFamily: theme.fonts.heading,
    fontSize: 26,
    color: theme.colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  bento: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: theme.spacing.lg,
  },
  bentoCell: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    padding: 14,
    alignItems: "flex-start",
  },
  bentoValue: {
    fontFamily: theme.fonts.heading,
    fontSize: 28,
    color: theme.colors.parchment,
  },
  bentoLabel: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 2,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  list: { gap: 10 },
  row: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderLeftWidth: 4,
    padding: 14,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowEra: {
    flex: 1,
    fontFamily: theme.fonts.heading,
    fontSize: 17,
    color: theme.colors.textPrimary,
  },
  rowVerdict: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  rowMeta: {
    marginTop: 4,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  rowFoot: { marginTop: 8 },
  rowScore: {
    fontFamily: theme.fonts.heading,
    fontSize: 22,
    color: theme.colors.parchment,
  },
  rowScoreSmall: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    textAlign: "center",
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 20,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
});
