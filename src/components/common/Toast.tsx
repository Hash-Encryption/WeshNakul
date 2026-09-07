import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastProps {
  message: string | null;
  onClose?: () => void;
  warning?: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, warning = false }) => {
  React.useEffect(() => {
    if (!message || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, warning ? 8000 : 4000);
    return () => clearTimeout(timer);
  }, [message, onClose, warning]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role={warning ? "alert" : "status"}
          aria-live={warning ? "assertive" : "polite"}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto cursor-pointer"
          onClick={onClose}
        >
          <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-brand-ink text-white shadow-xl text-sm font-bold border border-white/10 backdrop-blur-md">
            <span className={warning ? "text-base text-amber-400" : "text-base text-brand-green"}>{warning ? "⚠" : "✓"}</span>
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
