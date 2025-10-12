import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import {useEffect, useState, type TransitionEvent, useMemo} from "react";
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
import {themePalette} from "@/shared/config";
import {getSystemTheme, ReaderTheme} from "@/shared/lib";

function SplashScreen({ visible }: { visible: boolean }): JSX.Element | null {
  const [shouldRender, setShouldRender] = useState(visible);
    const theme = useMemo<ReaderTheme>(() => getSystemTheme(), []);

    console.log("theme: ", theme);
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    }
  }, [visible]);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName === "opacity" && !visible) {
      setShouldRender(false);
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themePalette[theme].background,
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transition: "opacity 400ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        style={{
          width: 126,
          height: 126,
          borderRadius: "50%",
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="/logo.webp"
          alt="Open Reader logo"
          style={{
            width: 96,
            height: 96,
            objectFit: "contain",
          }}
        />
      </div>
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
        }, 1500);
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
