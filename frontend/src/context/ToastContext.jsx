import { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";

const ToastContext = createContext(null);

const styles = {
  success: {
    icon: <FaCircleCheck />,
    bar: "bg-success",
    iconWrap: "bg-success-light text-success",
  },
  error: {
    icon: <FaCircleExclamation />,
    bar: "bg-danger",
    iconWrap: "bg-danger-light text-danger",
  },
  warning: {
    icon: <FaTriangleExclamation />,
    bar: "bg-warning",
    iconWrap: "bg-warning-light text-warning",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "success") => {
      const id = ++counter.current;
      setToasts((current) => [...current, { id, message, type }]);
      setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const toast = {
    success: (message) => push(message, "success"),
    error: (message) => push(message, "error"),
    warning: (message) => push(message, "warning"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-[calc(100%-2.5rem)] max-w-sm">
        {toasts.map((t) => {
          const s = styles[t.type] ?? styles.success;
          return (
            <div
              key={t.id}
              className="relative overflow-hidden rounded-xl bg-white shadow-2xl border border-line/70 pl-4 pr-9 py-3.5 flex items-start gap-3 reveal-up"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base ${s.iconWrap}`}>
                {s.icon}
              </span>
              <p className="text-sm font-medium text-ink pt-1 leading-5">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="absolute top-3 right-3 text-muted hover:text-ink transition-colors"
              >
                <FaXmark size={14} />
              </button>
              <span className={`absolute bottom-0 left-0 h-1 w-full ${s.bar} opacity-70`} />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
