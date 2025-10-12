import { Text } from "@telegram-apps/telegram-ui";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/app/providers/ThemeProvider";
import { LanguageToggle } from "@/shared/ui/LanguageToggle";

export function FooterBar(): JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <footer
      style={{
        borderTop: `1px solid ${theme.separator}`,
        background: theme.background,
      }}
    >
      <div
        style={{
          margin: "0 auto",
          maxWidth: 720,
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Text weight="2" style={{ color: theme.subtitle }}>
          {t("footer.languageLabel")}
        </Text>
        <LanguageToggle />
      </div>
    </footer>
  );
}
