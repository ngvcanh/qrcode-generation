'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { pubsub, TOAST_EVENTS, type ToastData } from '@/lib/pubsub';

interface Toast extends ToastData {
  id: string;
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = pubsub.subscribe(TOAST_EVENTS.SHOW_TOAST, (toastData: unknown) => {
      const toast: Toast = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'success',
        duration: 3000,
        ...(toastData as ToastData),
      };

      setToasts(prev => [...prev, toast]);

      // Auto remove toast
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, toast.duration);
    });

    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'error':
        return <X className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
      default:
        return <Check className="w-4 h-4" />;
    }
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/80 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/80 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/80 border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/80 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100';
      default:
        return 'bg-green-100 dark:bg-green-900/80 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100';
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              mass: 0.8
            }}
            whileHover={{ 
              scale: 1.01,
              transition: { duration: 0.15, ease: "easeOut" }
            }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md
              pointer-events-auto cursor-pointer min-w-[300px] max-w-[400px] mx-auto
              ${getToastStyles(toast.type || 'success')}
            `}
            onClick={() => removeToast(toast.id)}
          >
            <div className="flex-shrink-0">
              {getToastIcon(toast.type || 'success')}
            </div>
            <div className="flex-1 text-sm font-medium">
              {toast.message}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
