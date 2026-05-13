import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { theme } from "../theme";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "ghost";
  testID?: string;
  style?: ViewStyle;
};

export default function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
  testID,
  style,
}: Props) {
  const isGhost = variant === "ghost";
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.btn,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.gold} />
      ) : (
        <Text style={[styles.label, isGhost && styles.ghostLabel]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: theme.colors.gold,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  ghost: {
    borderColor: theme.colors.borderSubtle,
    shadowOpacity: 0,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: theme.colors.gold,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  ghostLabel: {
    color: theme.colors.textSecondary,
  },
});
