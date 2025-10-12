import {ReaderTheme} from "@/shared/lib";

export const themePalette: Record<ReaderTheme, { background: string; color: string; border: string }> = {
    light: {
        background: "#fdfdfd",
        color: "#1c1c1c",
        border: "rgba(15, 23, 42, 0.12)",
    },
    sepia: {
        background: "#f5ecd8",
        color: "#3f3120",
        border: "rgba(63, 49, 32, 0.18)",
    },
    dark: {
        background: "#121212",
        color: "#f1f5f9",
        border: "rgba(248, 250, 252, 0.16)",
    },
};