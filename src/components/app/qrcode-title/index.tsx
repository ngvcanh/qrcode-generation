import { motion } from "framer-motion";
import { Package, Clock, MemoryStick, HardDrive } from "lucide-react";
import { useQRCode } from "@/store/qrcode";
import { formatBytes, formatTime, getMemoryStatus } from "@/lib/format";

export interface QRCodeTitleProps {
  name: string;
  onInfoClick?: (packageName: string) => void;
}

export function QRCodeTitle(props: QRCodeTitleProps) {
  const { name, onInfoClick } = props;
  const { stacks } = useQRCode();
  
  const packageStack = stacks[name];
  const metrics = packageStack?.metrics;
  const hasData = metrics && metrics.totalGenerations > 0;

  const getPackageColor = (packageName: string) => {
    switch (packageName) {
      case 'qrcode':
        return 'from-blue-500 to-blue-600';
      case 'react-qr-code':
        return 'from-purple-500 to-purple-600';
      case 'qrcode.react':
        return 'from-pink-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-xl transition-shadow duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => onInfoClick?.(name)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Package Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-gradient-to-r ${getPackageColor(name)} rounded-lg shadow-lg`}>
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
              {name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              NPM Package
            </p>
          </div>
        </div>
        
        {hasData && (
          <div className="text-right">
            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
              {metrics.totalGenerations} generations
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      {hasData && (
        <motion.div 
          className="grid grid-cols-3 gap-3 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <Clock className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Avg Time
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {formatTime(metrics.averageRenderTime)}
            </div>
          </div>
          
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <MemoryStick className="w-4 h-4 mx-auto mb-1 text-purple-500" />
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Memory
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {formatBytes(metrics.averageMemoryUsage)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              {getMemoryStatus()}
            </div>
          </div>
          
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <HardDrive className="w-4 h-4 mx-auto mb-1 text-green-500" />
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Size
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {formatBytes(metrics.lastGeneration?.fileSize || 0)}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}