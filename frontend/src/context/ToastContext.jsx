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
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((toast) => {
            let IconComponent = Info;
            let bgColor = 'bg-ink-900 border-ink-700 text-slate-100';
            let iconColor = 'text-blue-400';

            if (toast.type === 'success') {
              bgColor = 'bg-ink-900 border-teal-500/30 text-teal-100';
              iconColor = 'text-teal-400';
              IconComponent = CheckCircle2;
            } else if (toast.type === 'error') {
              bgColor = 'bg-ink-900 border-coral-500/30 text-coral-100';
              iconColor = 'text-coral-500';
              IconComponent = AlertCircle;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-2xl border backdrop-blur-md ${bgColor}`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
                  <p className="text-sm font-medium">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-200 ml-3 transition-colors"
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
