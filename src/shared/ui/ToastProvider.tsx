import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { Snackbar } from "@telegram-apps/telegram-ui";

type ToastState = {
  message: string;
  id: number;
};

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastId = 0;

export function ToastProvider({ children }: PropsWithChildren): JSX.Element {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string) => {
    toastId += 1;
    setToast({ message, id: toastId });
  }, []);

  const hideToast = useCallback(() => {
    setToast((current) => (current ? { ...current, message: "" } : null));
    window.setTimeout(() => setToast(null), 250);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && toast.message && (
        <Snackbar
          key={toast.id}
          onClose={hideToast}
          role="status"
          style={{ position: "fixed", bottom: 16, left: 16, right: 16, zIndex: 1000 }}
        >
          {toast.message}
        </Snackbar>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
