import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { theme } from "../src/theme";
import { useGame } from "../src/state";
import { judge } from "../src/api";
import PrimaryButton from "../src/components/PrimaryButton";

const MAX = 300;
const PROMPTS = [
  "Try to blend in. Speak softly. Avoid eye contact.",
  "Use the item to forge a path no one expects.",
  "Befriend a local who can vouch for me.",
  "Hide. Wait. Strike when the moment is right.",
];

export default function ActionScreen() {
  const router = useRouter();
  const { era, item, plan, setPlan, setVerdict } = useGame();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!era || !item) {
      router.replace("/");
    }
  }, [era, item, router]);

  if (!era || !item) return null;

  const onSubmit = async () => {
    if (!plan.trim()) return;
    Keyboard.dismiss();
    setError(null);
    setLoading(true);
    try {
      const result = await judge(era.id, item.id, plan.trim());
      setVerdict(result);
      router.replace("/verdict");
    } catch (e: any) {
      setError(
        e?.response?.data?.detail || "The time stream is unstable. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const onPromptTap = (p: string) => {
    setPlan(p);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                testID="back-to-picker"
                onPress={() => router.back()}
                style={styles.backBtn}
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={theme.colors.gold}
                />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.kicker}>YOUR PLAN</Text>
                <Text style={styles.title}>What will you do?</Text>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
            >
              {/* Era + item summary */}
              <Animated.View
                entering={FadeInUp.duration(400)}
                style={styles.summary}
              >
                <View style={styles.summaryRow}>
                  <Ionicons
                    name="hourglass-outline"
                    size={16}
                    color={theme.colors.gold}
                  />
                  <Text style={styles.summaryLabel}>ERA</Text>
                  <Text style={styles.summaryValue}>
                    {era.name} · {era.year}
                  </Text>
                </View>
                <View style={[styles.summaryRow, { marginTop: 8 }]}>
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={theme.colors.gold}
                  />
                  <Text style={styles.summaryLabel}>ITEM</Text>
                  <Text style={styles.summaryValue}>{item.name}</Text>
                </View>
              </Animated.View>

              {/* Plan input */}
              <Animated.View
                entering={FadeInUp.delay(120).duration(400)}
                style={styles.inputCard}
              >
                <TextInput
                  testID="plan-input"
                  value={plan}
                  onChangeText={(v) => setPlan(v.slice(0, MAX))}
                  multiline
                  textAlignVertical="top"
                  placeholder="Describe your survival plan. Be specific. Be brave. The Time Judge listens."
                  placeholderTextColor={theme.colors.textMuted}
                  style={styles.input}
                />
                <Text
                  style={[
                    styles.counter,
                    plan.length >= MAX && { color: theme.colors.danger },
                  ]}
                  testID="plan-counter"
                >
                  {plan.length}/{MAX}
                </Text>
              </Animated.View>

              {/* Quick prompts */}
              <Text style={styles.promptHint}>Quick starts</Text>
              <View style={styles.promptRow}>
                {PROMPTS.map((p, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => onPromptTap(p)}
                    style={styles.prompt}
                    testID={`prompt-${i}`}
                  >
                    <Text style={styles.promptText} numberOfLines={1}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {error && (
                <Text style={styles.error} testID="action-error">
                  {error}
                </Text>
              )}
            </ScrollView>

            <View style={styles.footer}>
              <PrimaryButton
                testID="submit-plan"
                label={loading ? "The Time Judge deliberates…" : "Submit to the Time Judge"}
                onPress={onSubmit}
                disabled={!plan.trim()}
                loading={loading}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingBottom: theme.spacing.lg,
  },
  summary: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    padding: 14,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryLabel: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: theme.colors.textSecondary,
    width: 38,
  },
  summaryValue: {
    flex: 1,
    fontFamily: theme.fonts.heading,
    fontSize: 17,
    color: theme.colors.parchment,
  },
  inputCard: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    padding: 14,
    minHeight: 180,
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textPrimary,
    minHeight: 150,
  },
  counter: {
    alignSelf: "flex-end",
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 1.5,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  promptHint: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    marginBottom: 8,
  },
  promptRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  prompt: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: 999,
    maxWidth: "100%",
  },
  promptText: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  error: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.danger,
    textAlign: "center",
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.bg,
  },
});
