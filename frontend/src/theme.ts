export const theme = {
  colors: {
    bg: "#110e0a",
    surface: "#1c1712",
    surfaceAlt: "#241d15",
    gold: "#c8953a",
    goldGlow: "rgba(200, 149, 58, 0.4)",
    parchment: "#d4c090",
    textPrimary: "#f2ebda",
    textSecondary: "#a6957a",
    textMuted: "#6f5f4a",
    borderSubtle: "rgba(200, 149, 58, 0.25)",
    borderActive: "#c8953a",
    danger: "#b35939",
    catastrophic: "#8c2626",
    survived: "#2d7a5b",
    barely: "#d9a05b",
    legendary: "#e6b800",
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: 6, md: 10, lg: 14, xl: 20 },
  fonts: {
    heading: "CormorantGaramond_700Bold",
    headingItalic: "CormorantGaramond_500Medium_Italic",
    body: "SpaceMono_400Regular",
    bodyBold: "SpaceMono_700Bold",
  },
};

export const verdictColor = (verdict: string): string => {
  switch (verdict) {
    case "LEGENDARY":
      return theme.colors.legendary;
    case "SURVIVED":
      return theme.colors.survived;
    case "BARELY MADE IT":
      return theme.colors.barely;
    case "PERISHED":
      return theme.colors.danger;
    case "CATASTROPHIC":
      return theme.colors.catastrophic;
    default:
      return theme.colors.gold;
  }
};

export const dangerColor = (level: number): string => {
  if (level <= 3) return "#2d7a5b";
  if (level <= 6) return "#d9a05b";
  return "#b35939";
};

export const LEATHER_TEXTURE =
  "https://images.unsplash.com/photo-1755541608110-3440a0f168ed?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHwyfHxkYXJrJTIwbGVhdGhlciUyMHRleHR1cmUlMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3ODY1MDg0M3ww&ixlib=rb-4.1.0&q=85";
