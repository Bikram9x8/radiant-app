"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { IconCircleCheck, IconAlertCircle, IconX } from "@tabler/icons-react";

type ToastType = "success" | "error";
type ToastItem = { id: number; message: string; type: ToastType };

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: () => {} };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="glass rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-lg pointer-events-auto animate-toast-in"
            style={{ minWidth: "260px" }}
          >
            {t.type === "success" ? (
              <IconCircleCheck size={20} className="text-emerald-500 shrink-0" stroke={2} />
            ) : (
              <IconAlertCircle size={20} className="text-red-500 shrink-0" stroke={2} />
            )}
            <p className="text-sm font-medium text-zinc-900 dark:text-white flex-1">{t.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 shrink-0"
            >
              <IconX size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}