import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Modal, Title } from "@telegram-apps/telegram-ui";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/app/providers/ThemeProvider";
import { useToast } from "@/shared/ui/ToastProvider";

const WALLETS = ["Tonkeeper", "Wallet", "MyTonWallet"];

export function HeaderBar(): JSX.Element {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const theme = useTheme();
  const [isModalOpen, setModalOpen] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSelect = (name: string) => {
    setWallet(name);
    setModalOpen(false);
    showToast(t("header.wallet.connectedToast", { wallet: name }));
  };

  return (
    <header
      style={{
        // position: "absolute",
        // top: 0,
        zIndex: 9,
        background: theme.background,
        borderBottom: `1px solid ${theme.separator}`,
      }}
    >
      <div
        style={{
          margin: "0 auto",
          maxWidth: 720,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="/logo.webp"
            alt={t("app.name")}
            style={{ width: 32, height: 32, borderRadius: 8 }}
          />
          <Title level="2" weight="2" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            {t("app.name")}
          </Title>
        </div>
        <div style={{ position: "relative" }}>
          <TonConnectButton style={{ opacity: 0, pointerEvents: "none" }} />
          <Button
            size="s"
            mode="outline"
            style={{ position: "absolute", inset: 0 }}
            onClick={() => setModalOpen(true)}
          >
            {wallet ? t("header.wallet.connected", { wallet }) : t("header.wallet.connect")}
          </Button>
        </div>
      </div>
      <Modal open={isModalOpen} onOpenChange={setModalOpen}>
        <Modal.Header>{t("header.wallet.select")}</Modal.Header>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {WALLETS.map((name) => (
            <Button key={name} size="m" mode="filled" onClick={() => handleSelect(name)}>
              {name}
            </Button>
          ))}
        </div>
      </Modal>
    </header>
  );
}
