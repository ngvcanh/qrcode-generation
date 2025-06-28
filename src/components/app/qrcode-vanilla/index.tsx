import { motion } from "framer-motion";
import { useQRCode } from "@/store/qrcode";
import { QRCodeTitle } from "../qrcode-title";
import { Download, Eye } from "lucide-react";
import { downloadAsPNG, downloadAsSVG, showDownloadOptions, generateFilename } from "@/lib/download";
import { toast } from "@/lib/toast";

export interface QRCodeVanillaProps {
  onInfoClick?: (packageName: string) => void;
}

export function QRCodeVanilla({ onInfoClick }: QRCodeVanillaProps) {
  const { size, stacks, currentId, value, styleSettings } = useQRCode();
  const packageStack = stacks['qrcode'];
  const hasQRCode = packageStack && packageStack.stack.length > 0;
  
  // Get the current QR code data
  const currentQRCode = hasQRCode && currentId 
    ? packageStack.stack.find(item => item.id === currentId)
    : null;

  const handleDownload = async () => {
    if (!currentQRCode?.dataURL) {
      toast.error('No QR code to download');
      return;
    }

    try {
      const format = await showDownloadOptions();
      
      if (format === 'cancel') return;
      
      const filename = generateFilename('qrcode', value, !!currentQRCode.logo);
      
      if (format === 'png') {
        await downloadAsPNG(currentQRCode.dataURL, { filename });
        toast.success('QR code downloaded as PNG!');
      } else if (format === 'svg') {
        await downloadAsSVG(currentQRCode.dataURL, { filename });
        toast.success('QR code downloaded as SVG!');
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again.');
    }
  };

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <QRCodeTitle name="qrcode" onInfoClick={onInfoClick} />
      
      {/* QR Code Display Area */}
      <motion.div 
        className="mt-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col items-center">
          {/* QR Code Container */}
          <div className="relative mb-4">
            <div 
              className={`
                flex items-center justify-center rounded-xl shadow-inner
                ${hasQRCode 
                  ? 'border-2 border-slate-600' 
                  : 'bg-slate-700 border-2 border-dashed border-slate-600'
                }
              `}
              style={{ 
                width: size, 
                height: size,
                backgroundColor: hasQRCode ? styleSettings.backgroundColor : undefined
              }}
            >
              {hasQRCode && currentQRCode ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={currentQRCode.dataURL}
                    alt="QR Code generated with qrcode"
                    className="max-w-full h-auto rounded-lg"
                    style={{ width: size, height: size }}
                  />
                </div>
              ) : hasQRCode ? (
                <div className="text-blue-500 text-center p-4">
                  <div className="text-sm font-semibold mb-2">QR Code Generated</div>
                  <div className="text-xs text-slate-500">Package: qrcode</div>
                </div>
              ) : (
                <div className="text-slate-500 text-center p-4">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">
                    Click Generate to see QR Code
                  </div>
                </div>
              )}
            </div>
            
            {/* Generated indicator */}
            {hasQRCode && (
              <motion.div 
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, delay: 0.5 }}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </motion.div>
            )}
          </div>
          
          {/* Action Buttons */}
          {hasQRCode && (
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button 
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}