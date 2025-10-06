import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  bindThemeParamsCssVars,
  bindViewportCssVars,
  expandViewport,
  init as initSDK,
  isTMA,
  miniAppReady,
  mountBackButton,
  mountMiniApp,
  mountMiniAppSync,
  mountViewport,
  retrieveLaunchParams,
  retrieveRawInitData,
  setDebug,
  themeParams,
  useSignal,
} from "@telegram-apps/sdk-react";
import {
  hideBackButton,
  offBackButtonClick,
  offMainButtonClick,
  onBackButtonClick,
  onMainButtonClick,
  setMainButtonParams,
  showBackButton,
} from "@telegram-apps/sdk";
import type { RetrieveLPResultCamelCased, ThemeParams } from "@telegram-apps/sdk";

const DEMO_BANNER_DELAY = 150;

export type TMAContextValue = {
  isTelegram: boolean;
  launchParams?: RetrieveLPResultCamelCased;
  initDataRaw?: string;
  theme?: ThemeParams | null;
  backButton: {
    show: () => void;
    hide: () => void;
    onClick: (listener: Parameters<typeof onBackButtonClick>[0]) => VoidFunction;
    offClick: (listener: Parameters<typeof offBackButtonClick>[0]) => void;
  };
  mainButton: {
    setParams: (updates: Parameters<typeof setMainButtonParams>[0]) => void;
    onClick: (listener: Parameters<typeof onMainButtonClick>[0]) => VoidFunction;
    offClick: (listener: Parameters<typeof offMainButtonClick>[0]) => void;
  };
};

const TMAContext = createContext<TMAContextValue | undefined>(undefined);

export function TMAProvider({ children }: PropsWithChildren): JSX.Element {
  const [isTelegram, setIsTelegram] = useState<boolean>(() => isTMA());
  const [launchParamsState, setLaunchParamsState] =
    useState<RetrieveLPResultCamelCased>();
  const [initData, setInitData] = useState<string>();
  const theme = useSignal(themeParams.state, () => themeParams.state());

  useEffect(() => {
    setDebug(import.meta.env.DEV);
    initSDK();

    const timer = window.setTimeout(() => {
      setIsTelegram(isTMA());
    }, DEMO_BANNER_DELAY);

    try {
      const lp = retrieveLaunchParams(true);
      setLaunchParamsState(lp);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Unable to retrieve launch params", error);
      }
    }

    try {
      const raw = retrieveRawInitData();
      if (raw) {
        setInitData(raw);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Unable to retrieve init data", error);
      }
    }

    const mount = async () => {
      try {
        if (mountMiniAppSync?.isAvailable?.()) {
          mountMiniAppSync();
        } else {
          await mountMiniApp();
        }
        miniAppReady();
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn("Mini App mount failed", error);
        }
      }

      try {
        await mountViewport();
        expandViewport();
        bindViewportCssVars();
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn("Viewport mount failed", error);
        }
      }

      try {
        bindThemeParamsCssVars();
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn("Theme binding failed", error);
        }
      }

      try {
        await mountBackButton();
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn("Back button mount failed", error);
        }
      }
    };

    void mount();

    if (import.meta.env.DEV) {
      void import("eruda").then(({ default: eruda }) => {
        if (typeof eruda.get === "function") {
          eruda.init();
          eruda.position({ x: window.innerWidth - 50, y: 16 });
        }
      });
    }

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const value = useMemo<TMAContextValue>(
    () => ({
      isTelegram,
      launchParams: launchParamsState,
      initDataRaw: initData,
      theme,
      backButton: {
        show: () => {
          if (showBackButton.isAvailable()) {
            showBackButton();
          }
        },
        hide: () => {
          if (hideBackButton.isAvailable()) {
            hideBackButton();
          }
        },
        onClick: (listener) =>
          onBackButtonClick.isAvailable() ? onBackButtonClick(listener) : () => {},
        offClick: (listener) => {
          if (offBackButtonClick.isAvailable()) {
            offBackButtonClick(listener);
          }
        },
      },
      mainButton: {
        setParams: (updates) => {
          if (setMainButtonParams.isAvailable()) {
            setMainButtonParams(updates);
          }
        },
        onClick: (listener) =>
          onMainButtonClick.isAvailable() ? onMainButtonClick(listener) : () => {},
        offClick: (listener) => {
          if (offMainButtonClick.isAvailable()) {
            offMainButtonClick(listener);
          }
        },
      },
    }),
    [initData, isTelegram, launchParamsState, theme],
  );

  return <TMAContext.Provider value={value}>{children}</TMAContext.Provider>;
}

export function useTMA(): TMAContextValue {
  const context = useContext(TMAContext);

  if (!context) {
    throw new Error("useTMA must be used inside TMAProvider");
  }

  return context;
}
