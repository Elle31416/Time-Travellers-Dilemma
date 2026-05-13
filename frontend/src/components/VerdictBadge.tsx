import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { theme, verdictColor } from "../theme";

type Props = {
  verdict: string;
  survived: boolean;
};

export default function VerdictBadge({ verdict, survived }: Props) {
  const color = verdictColor(verdict);
  return (
    <Animated.View
      entering={ZoomIn.duration(700).springify()}
      style={[
        styles.badge,
        {
          borderColor: color,
          shadowColor: color,
          backgroundColor: color + "12",
        },
      ]}
      testID="verdict-badge"
    >
      <Text style={[styles.label, { color }]}>{verdict}</Text>
      <Text style={styles.sub}>
        {survived ? "You survived the time stream" : "The time stream consumed you"}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: "center",
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  sub: {
    marginTop: 6,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
