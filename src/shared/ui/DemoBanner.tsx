import { Banner } from "@telegram-apps/telegram-ui";

interface DemoBannerProps {
  visible: boolean;
}

export function DemoBanner({ visible }: DemoBannerProps): JSX.Element | null {
  if (!visible) {
    return null;
  }

  return (
    <Banner
      header="Демо-режим"
      subheader="Вы находитесь вне Telegram. Некоторые возможности ограничены."
      style={{ margin: "0 auto", maxWidth: 720 }}
    />
  );
}
