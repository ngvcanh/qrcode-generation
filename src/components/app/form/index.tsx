import { NumberInput } from "@/components/ui/number-input";
import { TextInput } from "@/components/ui/text-input"
import { LogoUpload } from "@/components/ui/logo-upload";
import { useQRCode } from "@/store/qrcode";
import { useGeneration } from "@/hooks/use-generation";
import { ChangeEvent, useState } from "react";
import { motion } from "framer-motion";
import { QrCode, Play, Loader2 } from "lucide-react";

export function Form() {
  const { value, size, iterations, logo, setValue, setSize, setIterations, setLogo } = useQRCode();
  const generate = useGeneration();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleChangeSize = (e: ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value, 10);
    if (!isNaN(newSize)) {
      setSize(newSize);
    }
  };

  const handleGenerate = async () => {
    if (!value.trim()) return;
    
    setIsGenerating(true);
    try {
      await generate();
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChangeIterations = (e: ChangeEvent<HTMLInputElement>) => {
    const newIterations = parseInt(e.target.value, 10);
    if (!isNaN(newIterations) && newIterations >= 20 && newIterations <= 200) {
      setIterations(newIterations);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              QR Code Generator
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Compare performance across multiple QR code libraries. Generate QR codes with qrcode, react-qr-code, and qrcode.react.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8">
            {/* Form Fields */}
            <div className="space-y-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <TextInput
                  label="QR Code Content"
                  placeholder="Enter URL, text, or any content to generate QR code"
                  value={value}
                  onChange={handleChangeValue}
                  className="w-full"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setValue("https://github.com/ngvcanh/qrcode-generation")}
                    className="px-3 py-1.5 text-xs bg-blue-900/30 text-blue-300 rounded-lg hover:bg-blue-900/50 transition-colors"
                  >
                    Sample URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("Hello World! This is a QR code test.")}
                    className="px-3 py-1.5 text-xs bg-purple-900/30 text-purple-300 rounded-lg hover:bg-purple-900/50 transition-colors"
                  >
                    Sample Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("mailto:hello@example.com?subject=Hello")}
                    className="px-3 py-1.5 text-xs bg-green-900/30 text-green-300 rounded-lg hover:bg-green-900/50 transition-colors"
                  >
                    Email
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <NumberInput
                  label="QR Code Size"
                  placeholder="Enter size in pixels (e.g., 256)"
                  value={size}
                  onChange={handleChangeSize}
                  className="w-full"
                />
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-slate-400">
                    Recommended: 128px - 512px for optimal quality
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[128, 256, 384, 512].map((sizeOption) => (
                      <button
                        key={sizeOption}
                        type="button"
                        onClick={() => setSize(sizeOption)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          size === sizeOption
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                      >
                        {sizeOption}px
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300">
                    Logo for QR Code (Optional)
                  </label>
                  <LogoUpload
                    value={logo}
                    onChange={setLogo}
                    className="w-full"
                  />
                  <p className="text-sm text-slate-400">
                    Upload a logo to embed in the center of your QR codes (PNG, JPG, GIF - max 5MB)
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
              >
                <NumberInput
                  label="Iterations (Performance Test)"
                  placeholder="Number of iterations per library (20-200)"
                  value={iterations}
                  onChange={handleChangeIterations}
                  className="w-full"
                />
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-slate-400">
                    More iterations = better performance data & longer loading time (max 200)
                  </p>
                  {iterations > 100 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <p className="text-sm text-yellow-300">
                        High iteration count may take longer to process (est. {Math.ceil(iterations * 0.1)}s)
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {[20, 50, 100, 150, 200].map((iterOption) => (
                      <button
                        key={iterOption}
                        type="button"
                        onClick={() => setIterations(iterOption)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          iterations === iterOption
                            ? 'bg-purple-500 text-white'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                      >
                        {iterOption}x
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
              <div className="px-4">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
            </div>

            {/* Generate Button */}
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
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
                
                <span className="font-bold">
                  {isGenerating ? 'Generating QR Codes...' : 'Generate & Compare'}
                </span>
                
                {!isGenerating && (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Play className="w-6 h-6" />
                  </motion.div>
                )}
              </motion.button>
            </motion.div>

            {/* Info Cards */}
            {!isGenerating && (
              <motion.div 
                className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div className="text-center p-4 bg-slate-700/50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-400">3</div>
                  <div className="text-sm text-slate-400">Libraries</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-400">⚡</div>
                  <div className="text-sm text-slate-400">Performance</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-xl">
                  <div className="text-2xl font-bold text-pink-400">📊</div>
                  <div className="text-sm text-slate-400">Analytics</div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}