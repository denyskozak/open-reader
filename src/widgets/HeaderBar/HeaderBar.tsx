import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Modal, Title } from "@telegram-apps/telegram-ui";
import { TonConnectButton } from "@tonconnect/ui-react";

import { useTheme } from "@/app/providers/ThemeProvider";
import { useToast } from "@/shared/ui/ToastProvider";

const WALLETS = ["Tonkeeper", "Wallet", "MyTonWallet"];

export function HeaderBar(): JSX.Element {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const theme = useTheme();
  const [isModalOpen, setModalOpen] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);

  const handleSelect = (name: string) => {
    setWallet(name);
    setModalOpen(false);
    showToast(`Кошелёк ${name} подключен (демо)`);
  };

  return (
    <header
      style={{
        position: "absolute",
        top: 0,
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
        <Title level="2" weight="2" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          Open Reader
        </Title>
        <div style={{ position: "relative" }}>
          <TonConnectButton style={{ opacity: 0, pointerEvents: "none" }} />
          <Button
            size="s"
            mode="outline"
            style={{ position: "absolute", inset: 0 }}
            onClick={() => setModalOpen(true)}
          >
            {wallet ? `Кошелёк: ${wallet}` : "Подключить кошелёк"}
          </Button>
        </div>
      </div>
      <Modal open={isModalOpen} onOpenChange={setModalOpen}>
        <Modal.Header>Выберите кошелёк</Modal.Header>
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
