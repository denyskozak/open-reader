export type ReaderTheme = "light" | "sepia" | "dark";

export const getSystemTheme = (): ReaderTheme => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return "dark";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};
