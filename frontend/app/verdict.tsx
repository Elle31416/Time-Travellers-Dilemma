import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";

import { theme, verdictColor } from "../src/theme";
import { useGame } from "../src/state";
import PrimaryButton from "../src/components/PrimaryButton";
import VerdictBadge from "../src/components/VerdictBadge";
import ScoreMeter from "../src/components/ScoreMeter";

export default function VerdictScreen() {
  const router = useRouter();
  const { verdict, era, reset } = useGame();

  useEffect(() => {
    if (!verdict) router.replace("/");
  }, [verdict, router]);

  if (!verdict) return null;

  const color = verdictColor(verdict.verdict);

  const playAgain = () => {
    reset();
    router.replace("/");
  };

  const seeHistory = () => {
    router.push("/history");
  };

  return (
    <ImageBackground
      source={{ uri: era?.image }}
      style={styles.bg}
      imageStyle={{ opacity: 0.18 }}
      blurRadius={4}
    >
      <LinearGradient
        colors={["rgba(17,14,10,0.4)", "rgba(17,14,10,0.95)", "#110e0a"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.topRow}>
          <TouchableOpacity
            testID="verdict-back-home"
            onPress={playAgain}
            style={styles.iconBtn}
          >
            <Ionicons name="close" size={22} color={theme.colors.gold} />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: "center" }}>
            <Text style={styles.kicker}>VERDICT OF THE TIME JUDGE</Text>
            <Text style={styles.eraLine}>{verdict.era_name}</Text>
            <Text style={styles.itemLine}>· with the {verdict.item_name} ·</Text>
          </Animated.View>

          <View style={{ alignItems: "center", marginTop: theme.spacing.lg }}>
            <VerdictBadge verdict={verdict.verdict} survived={verdict.survived} />
          </View>

          <View style={styles.scoreWrap}>
            <ScoreMeter value={verdict.survival_score} color={color} />
          </View>

          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
            style={styles.narrativeCard}
          >
            <View style={[styles.cardAccent, { backgroundColor: color }]} />
            <Text style={styles.cardLabel}>THE TIME JUDGE NARRATES</Text>
            <Text style={styles.cardBody}>{verdict.narrative}</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(700).duration(600)}
            style={[styles.narrativeCard, { marginTop: theme.spacing.md }]}
          >
            <View style={[styles.cardAccent, { backgroundColor: theme.colors.gold }]} />
            <Text style={styles.cardLabel}>HISTORICAL TWIST</Text>
            <Text style={styles.cardBody}>{verdict.twist}</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(900).duration(600)}
            style={styles.planCard}
          >
            <Text style={styles.cardLabel}>YOUR PLAN</Text>
            <Text style={styles.planText} numberOfLines={4}>
              {`"${verdict.plan}"`}
            </Text>
          </Animated.View>

          <View style={styles.actions}>
            <PrimaryButton
              testID="play-again"
              label="Try another era"
              onPress={playAgain}
            />
            <View style={{ height: 12 }} />
            <PrimaryButton
              testID="view-logs"
              variant="ghost"
              label="View Time Logs"
              onPress={seeHistory}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: theme.colors.bg },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: theme.spacing.md,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  kicker: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 3,
    color: theme.colors.gold,
  },
  eraLine: {
    marginTop: 8,
    fontFamily: theme.fonts.heading,
    fontSize: 22,
    color: theme.colors.parchment,
  },
  itemLine: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    letterSpacing: 1.5,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scoreWrap: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  narrativeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    padding: 16,
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  cardLabel: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.5,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  cardBody: {
    fontFamily: theme.fonts.heading,
    fontSize: 17,
    lineHeight: 25,
    color: theme.colors.textPrimary,
  },
  planCard: {
    marginTop: theme.spacing.md,
    backgroundColor: "transparent",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderStyle: "dashed",
    padding: 14,
  },
  planText: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
  },
  actions: {
    marginTop: theme.spacing.xl,
  },
});
