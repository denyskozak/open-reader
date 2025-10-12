import { Button } from "@telegram-apps/telegram-ui";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGE_LABELS: Record<string, string> = {
  en: "EN",
  ru: "RU",
};

export function LanguageToggle(): JSX.Element {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;
  const normalizedLanguage = currentLanguage.slice(0, 2);

  const label = LANGUAGE_LABELS[normalizedLanguage] ?? normalizedLanguage.toUpperCase();

  const ariaLabel = useMemo(() => {
    const languageNameKey = normalizedLanguage === "ru" ? "languages.ru" : "languages.en";
    return t("header.languageToggle", { language: t(languageNameKey) });
  }, [normalizedLanguage, t]);

  const handleToggle = () => {
    const nextLanguage = normalizedLanguage === "ru" ? "en" : "ru";
    void i18n.changeLanguage(nextLanguage);
  };

  return (
    <Button
      size="s"
      mode="plain"
      onClick={handleToggle}
      aria-label={ariaLabel}
      style={{ minWidth: 44 }}
    >
      {label}
    </Button>
  );
}
