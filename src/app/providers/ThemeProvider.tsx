import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";

import type { ThemeParams } from "@telegram-apps/types";

import { useTMA } from "./TMAProvider";

export type ThemeColors = {
  background: string;
  text: string;
  subtitle: string;
  hint: string;
  accent: string;
  section: string;
  separator: string;
};

const defaultColors: ThemeColors = {
  background: "#ffffff",
  text: "#0f0f0f",
  subtitle: "#7f7f81",
  hint: "#7f7f81",
  accent: "#3390ff",
  section: "#f3f3f5",
  separator: "#d3d3d7",
};

const ThemeContext = createContext<ThemeColors>(defaultColors);

function mapTheme(theme?: ThemeParams | null): ThemeColors {
  if (!theme) {
    return defaultColors;
  }

  return {
    background: theme.bg_color ?? defaultColors.background,
    text: theme.text_color ?? defaultColors.text,
    subtitle: theme.subtitle_text_color ?? theme.hint_color ?? defaultColors.subtitle,
    hint: theme.hint_color ?? defaultColors.hint,
    accent: theme.button_color ?? defaultColors.accent,
    section: theme.secondary_bg_color ?? defaultColors.section,
    separator: theme.section_separator_color ?? defaultColors.separator,
  };
}

export function ThemeProvider({ children }: PropsWithChildren): JSX.Element {
  const { theme } = useTMA();
  const colors = useMemo(() => mapTheme(theme), [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--app-bg-color", colors.background);
    root.style.setProperty("--app-text-color", colors.text);
    root.style.setProperty("--app-subtitle-color", colors.subtitle);
    root.style.setProperty("--app-hint-color", colors.hint);
    root.style.setProperty("--app-accent-color", colors.accent);
    root.style.setProperty("--app-section-color", colors.section);
    root.style.setProperty("--app-separator-color", colors.separator);
  }, [colors]);

  return (
    <ThemeContext.Provider value={colors}>
      <div
        style={{
          background: colors.background,
          color: colors.text,
          minHeight: "100vh",
          transition: "background 0.3s ease, color 0.3s ease",
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeColors {
  return useContext(ThemeContext);
}
