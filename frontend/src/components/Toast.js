import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, WarningCircle, Info, Bell } from "@phosphor-icons/react";

// ---- Imperative singleton bus (callable from anywhere, incl. realtime) ----
let _id = 0;
const subs = new Set();

function push(message, opts = {}) {
  const t = { id: ++_id, message, type: opts.type || "default", duration: opts.duration ?? 3800, ...opts };
  subs.forEach((fn) => fn(t));
  return t.id;
}

export const toast = {
  show: (m, o) => push(m, o),
  success: (m, o) => push(m, { ...o, type: "success" }),
  error: (m, o) => push(m, { ...o, type: "error" }),
  info: (m, o) => push(m, { ...o, type: "info" }),
};

const STYLES = {
  success: { ring: "ring-status-borrowed/30", icon: <CheckCircle size={20} weight="fill" className="text-status-borrowed" /> },
  error: { ring: "ring-status-cancelled/30", icon: <WarningCircle size={20} weight="fill" className="text-status-cancelled" /> },
  info: { ring: "ring-brand-400/40", icon: <Info size={20} weight="fill" className="text-brand-600" /> },
  default: { ring: "ring-line", icon: <Bell size={20} weight="fill" className="text-ink" /> },
};

function ToastCard({ t, onDismiss }) {
  const s = STYLES[t.type] || STYLES.default;
  useEffect(() => {
    if (!t.duration) return;
    const id = setTimeout(() => onDismiss(t.id), t.duration);
    return () => clearTimeout(id);
  }, [t, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      onClick={() => onDismiss(t.id)}
      data-testid="toast"
      className={`pointer-events-auto cursor-pointer w-[min(92vw,26rem)] glass rounded-2xl shadow-pop ring-1 ${s.ring} px-4 py-3 flex items-start gap-3`}
    >
      <span className="shrink-0 mt-0.5">{s.icon}</span>
      <div className="min-w-0">
        {t.title && <p className="font-head font-semibold text-sm text-ink leading-tight">{t.title}</p>}
        <p className="text-sm text-ink/80 leading-snug break-words">{t.message}</p>
      </div>
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const onPush = (t) => setToasts((cur) => [...cur.slice(-3), t]);
    subs.add(onPush);
    return () => subs.delete(onPush);
  }, []);

  const dismiss = (id) => setToasts((cur) => cur.filter((t) => t.id !== id));

  return (
    <>
      {children}
      <div className="fixed top-3 inset-x-0 z-[200] flex flex-col items-center gap-2 px-3 pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((t) => <ToastCard key={t.id} t={t} onDismiss={dismiss} />)}
        </AnimatePresence>
      </div>
    </>
  );
}
