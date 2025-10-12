import { Banner } from "@telegram-apps/telegram-ui";
import { useTranslation } from "react-i18next";

interface DemoBannerProps {
  visible: boolean;
}

export function DemoBanner({ visible }: DemoBannerProps): JSX.Element | null {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <Banner
      header={t("app.demo.title")}
      subheader={t("app.demo.description")}
      style={{ margin: "0 auto", maxWidth: 720 }}
    />
  );
}
