/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_BACKEND_URL?: string;
    readonly VITE_ALLOWED_TELEGRAM_IDS?: string;
    readonly VITE_MOCK_TELEGRAM_ID?: string;
  }
}

export {};
