import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
  runOnJS,
  useDerivedValue,
} from "react-native-reanimated";
import { theme } from "../theme";

type Props = {
  value: number; // 0..100
  color: string;
};

export default function ScoreMeter({ value, color }: Props) {
  const progress = useSharedValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(value, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, progress]);

  useDerivedValue(() => {
    runOnJS(setDisplay)(Math.round(progress.value));
  });

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.wrap} testID="score-meter">
      <View style={styles.numberRow}>
        <Text style={[styles.number, { color }]} testID="score-value">
          {display}
        </Text>
        <Text style={styles.outOf}>/100</Text>
      </View>
      <View style={styles.barBg}>
        <Animated.View
          style={[
            styles.barFill,
            {
              backgroundColor: color,
              shadowColor: color,
            },
            fillStyle,
          ]}
        />
      </View>
      <Text style={styles.caption}>SURVIVAL SCORE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", width: "100%", gap: 10 },
  numberRow: { flexDirection: "row", alignItems: "flex-end" },
  number: {
    fontFamily: theme.fonts.heading,
    fontSize: 88,
    lineHeight: 92,
    minWidth: 110,
    textAlign: "right",
  },
  outOf: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 18,
    marginLeft: 6,
    marginBottom: 18,
  },
  barBg: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(200, 149, 58, 0.15)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  caption: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 3,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});
