import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 sm:top-6 right-0 left-0 sm:left-auto sm:right-6 z-[999999] flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 mx-auto sm:mx-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            let IconComponent = Info;
            let bgColor = 'bg-ink-900 border-ink-700 text-slate-100';
            let iconColor = 'text-blue-400';

            if (toast.type === 'success') {
              bgColor = 'bg-ink-900/95 border-teal-500/40 text-teal-100 shadow-teal-500/10';
              iconColor = 'text-teal-400';
              IconComponent = CheckCircle2;
            } else if (toast.type === 'error') {
              bgColor = 'bg-ink-900/95 border-coral-500/40 text-coral-100 shadow-coral-500/10';
              iconColor = 'text-coral-500';
              IconComponent = AlertCircle;
            } else if (toast.type === 'warning') {
              bgColor = 'bg-ink-900/95 border-amber-500/40 text-amber-100 shadow-amber-500/10';
              iconColor = 'text-amber-400';
              IconComponent = AlertCircle;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-center justify-between p-3.5 sm:p-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${bgColor}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <IconComponent className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
                  <p className="text-xs sm:text-sm font-semibold truncate leading-snug">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 ml-2.5 transition-colors shrink-0"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
