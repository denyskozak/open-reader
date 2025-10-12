import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLaunchParams } from '@telegram-apps/sdk-react';

import { AppRoot } from "@telegram-apps/telegram-ui";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

import { TMAProvider, useTMA } from "./providers/TMAProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AppRouter } from "./router";
import { ToastProvider } from "@/shared/ui/ToastProvider";
import { DemoBanner } from "@/shared/ui/DemoBanner";
import { FooterBar } from "@/widgets/FooterBar/FooterBar";
import { HeaderBar } from "@/widgets/HeaderBar/HeaderBar";

const SPLASH_STORAGE_KEY = "open-reader:splash-screen-seen";

function SplashScreen({ visible }: { visible: boolean }): JSX.Element | null {
  if (!visible) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <img
        src="/logo.webp"
        alt="Open Reader logo"
        style={{
          width: 160,
          maxWidth: "60%",
          height: "auto",
        }}
      />
    </div>
  );
}

function NavigationControls(): null {
  const location = useLocation();
  const navigate = useNavigate();
  const { backButton, isTelegram } = useTMA();

  useEffect(() => {
    if (!isTelegram) {
      return;
    }

    const handleBack = () => {
      navigate(-1);
    };

    if (location.pathname === "/") {
      backButton.hide();
      backButton.offClick(handleBack);
    } else {
      backButton.show();
      backButton.offClick(handleBack);
      backButton.onClick(handleBack);
    }

    return () => {
      backButton.offClick(handleBack);
    };
  }, [backButton, isTelegram, location.pathname, navigate]);

  return null;
}

function AppContent(): JSX.Element {
  const { isTelegram } = useTMA();
  const { tgWebAppFullscreen } = useLaunchParams();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setIsSplashVisible(false);
        }, 2000);
        return () => { clearTimeout(timeoutId); };
    }, []);

  return (
    <AppRoot style={{ marginTop: tgWebAppFullscreen ? "10vh" : 0 }}>
      <ToastProvider>
        <div
          style={{
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <HeaderBar />
          <main style={{ flex: 1, width: "100%" }}>
            <DemoBanner visible={!isTelegram} />
            <div style={{ paddingBottom: 24 }}>
              <AppRouter />
            </div>
          </main>
          <FooterBar />
        </div>
        <NavigationControls />
      </ToastProvider>
      <SplashScreen visible={isSplashVisible} />
    </AppRoot>
  );
}

export default function App(): JSX.Element {
  const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;

  return (
    <BrowserRouter>
      <TonConnectUIProvider manifestUrl={manifestUrl} uiPreferences={{ theme: "SYSTEM" }}>
        <TMAProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </TMAProvider>
      </TonConnectUIProvider>
    </BrowserRouter>
  );
}
