import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Tabs } from "@/components/ui/tabs";
import { Package, QrCode, Loader2 } from "lucide-react";
import { useQRCode } from "@/store/qrcode";
import { useGeneration } from "@/hooks/use-generation";

const QRCodeReact = dynamic(() => import("@/components/app/qrcode-react").then(mod => ({ default: mod.QRCodeReact })), { ssr: false });
const QRCodeReactDot = dynamic(() => import("@/components/app/qrcode-react-dot").then(mod => ({ default: mod.QRCodeReactDot })), { ssr: false });
const QRCodeVanilla = dynamic(() => import("@/components/app/qrcode-vanilla").then(mod => ({ default: mod.QRCodeVanilla })), { ssr: false });
const QRCodeStyled = dynamic(() => import("@/components/app/qrcode-styled").then(mod => ({ default: mod.QRCodeStyled })), { ssr: false });

interface TabResultsProps {
  onPackageInfoClick: (packageName: string) => void;
}

export function TabResults({ onPackageInfoClick }: TabResultsProps) {
  const [activeTab, setActiveTab] = useState<'qrcode' | 'react-qr-code' | 'qrcode.react' | 'qr-code-styling'>('qrcode');
  const [isGenerating, setIsGenerating] = useState(false);
  const { value } = useQRCode();
  const generate = useGeneration();

  const tabs = [
    { id: 'qrcode', label: 'qrcode', icon: Package },
    { id: 'react-qr-code', label: 'react-qr-code', icon: Package },
    { id: 'qrcode.react', label: 'qrcode.react', icon: Package },
    { id: 'qr-code-styling', label: 'qr-code-styling', icon: Package }
  ];

  const handleGenerate = async () => {
    if (!value.trim()) return;
    
    setIsGenerating(true);
    try {
      // Only generate for the active tab
      await generate(activeTab);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderQRComponent = () => {
    switch (activeTab) {
      case 'qrcode':
        return <QRCodeVanilla onInfoClick={onPackageInfoClick} />;
      case 'react-qr-code':
        return <QRCodeReact onInfoClick={onPackageInfoClick} />;
      case 'qrcode.react':
        return <QRCodeReactDot onInfoClick={onPackageInfoClick} />;
      case 'qr-code-styling':
        return <QRCodeStyled onInfoClick={onPackageInfoClick} />;
      default:
        return <QRCodeVanilla onInfoClick={onPackageInfoClick} />;
    }
  };

  return (
    <div className="container mx-auto px-4 pt-12 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-200 mb-2">
            QR Code Results & Performance
          </h2>
          <p className="text-slate-400">
            Select a library to generate QR codes and view performance metrics
          </p>
        </div>

        {/* Package Tabs */}
        <div className="flex justify-center mb-8">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
            mode="filled"
            variant="default"
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-600"
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-8">
          <motion.button
            onClick={handleGenerate}
            disabled={!value.trim() || isGenerating}
            className={`
              relative flex items-center gap-4 px-10 py-5 rounded-2xl font-semibold text-lg
              transition-all duration-300 shadow-2xl min-w-[280px] justify-center
              ${!value.trim() || isGenerating
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed shadow-slate-300/20'
                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-blue-500/30 hover:shadow-blue-500/50'
              }
            `}
            whileHover={!isGenerating && value.trim() ? { 
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            } : {}}
            whileTap={!isGenerating && value.trim() ? { scale: 0.98 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <motion.div
              animate={isGenerating ? { rotate: 360 } : { rotate: 0 }}
              transition={isGenerating ? { 
                duration: 1, 
                repeat: Infinity, 
                ease: "linear" 
              } : { duration: 0.3 }}
            >
              {isGenerating ? (
                <Loader2 className="w-7 h-7" />
              ) : (
                <QrCode className="w-7 h-7" />
              )}
            </motion.div>
            
            <span className="font-bold truncate">
              {isGenerating ? 'Generating QR Codes...' : `Generate with ${activeTab}`}
            </span>
          </motion.button>
        </div>

        {/* Active QR Component */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center"
        >
          <div className="w-full max-w-md">
            {renderQRComponent()}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
