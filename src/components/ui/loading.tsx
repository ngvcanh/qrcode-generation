import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingEventDetail {
  message?: string;
}

export function Loading() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    const handleShowLoading = (event: CustomEvent<LoadingEventDetail>) => {
      setMessage(event.detail?.message || "Loading...");
      setIsVisible(true);
    };

    const handleHideLoading = () => {
      setIsVisible(false);
    };

    // Listen for custom events
    window.addEventListener('loading:show', handleShowLoading as EventListener);
    window.addEventListener('loading:hide', handleHideLoading);

    return () => {
      window.removeEventListener('loading:show', handleShowLoading as EventListener);
      window.removeEventListener('loading:hide', handleHideLoading);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-xl max-w-sm mx-4"
          >
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Processing...
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {message}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
