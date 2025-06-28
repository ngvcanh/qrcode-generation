import { motion, AnimatePresence } from "framer-motion";
import { useQRCode, QRStyleSettings } from "@/store/qrcode";
import { useEffect, useState } from "react";
import { X, Settings, Circle, Square, Star, Diamond } from "lucide-react";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const dotStyles = [
  { id: 'square', name: 'Square', icon: Square, description: 'Classic square dots' },
  { id: 'circle', name: 'Circle', icon: Circle, description: 'Rounded circle dots' },
  { id: 'rounded', name: 'Rounded', icon: Square, description: 'Rounded square dots' },
  { id: 'dots', name: 'Dots', icon: Circle, description: 'Small circular dots' },
  { id: 'star', name: 'Star', icon: Star, description: 'Star-shaped dots' },
  { id: 'diamond', name: 'Diamond', icon: Diamond, description: 'Diamond-shaped dots' },
] as const;

const cornerStyles = [
  { id: 'square', name: 'Square', description: 'Square corners' },
  { id: 'circle', name: 'Circle', description: 'Circular corners' },
  { id: 'rounded', name: 'Rounded', description: 'Rounded corners' },
] as const;

const logoStyles = [
  { id: 'square', name: 'Square', description: 'Square logo background' },
  { id: 'circle', name: 'Circle', description: 'Circular logo background' },
  { id: 'rounded', name: 'Rounded', description: 'Rounded logo background' },
] as const;

const presetColors = [
  { name: 'Classic', bg: '#ffffff', fg: '#000000' },
  { name: 'Blue', bg: '#dbeafe', fg: '#1e40af' },
  { name: 'Green', bg: '#dcfce7', fg: '#166534' },
  { name: 'Purple', bg: '#f3e8ff', fg: '#7c3aed' },
  { name: 'Red', bg: '#fee2e2', fg: '#dc2626' },
  { name: 'Orange', bg: '#fed7aa', fg: '#ea580c' },
  { name: 'Pink', bg: '#fce7f3', fg: '#be185d' },
  { name: 'Dark', bg: '#1f2937', fg: '#ffffff' },
];

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { styleSettings, setStyleSettings } = useQRCode();
  const [localSettings, setLocalSettings] = useState<QRStyleSettings>(
    styleSettings || {
      dotStyle: 'square',
      cornerStyle: 'square',
      backgroundColor: '#ffffff',
      foregroundColor: '#000000',
      logoStyle: 'rounded',
    }
  );

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSave = () => {
    setStyleSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: QRStyleSettings = {
      dotStyle: 'square',
      cornerStyle: 'square',
      backgroundColor: '#ffffff',
      foregroundColor: '#000000',
      logoStyle: 'rounded',
    };
    setLocalSettings(defaultSettings);
    setStyleSettings(defaultSettings);
  };

  const handlePresetColor = (preset: typeof presetColors[0]) => {
    setLocalSettings(prev => ({
      ...prev,
      backgroundColor: preset.bg,
      foregroundColor: preset.fg,
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-full max-w-md bg-slate-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">QR Code Settings</h2>
                  <p className="text-sm text-slate-400">Customize QR code appearance</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Dot Style */}
              <div>
                <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <Circle className="w-5 h-5" />
                  Dot Style
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {dotStyles.map((style) => {
                    const IconComponent = style.icon;
                    return (
                      <motion.button
                        key={style.id}
                        onClick={() => setLocalSettings(prev => ({ ...prev, dotStyle: style.id }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          localSettings.dotStyle === style.id
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-600 hover:border-slate-500 bg-slate-800'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconComponent className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                        <div className="text-sm font-medium text-slate-200">{style.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{style.description}</div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Corner Style */}
              <div>
                <h3 className="text-lg font-bold text-slate-200 mb-4">Corner Style</h3>
                <div className="grid grid-cols-3 gap-3">
                  {cornerStyles.map((style) => (
                    <motion.button
                      key={style.id}
                      onClick={() => setLocalSettings(prev => ({ ...prev, cornerStyle: style.id }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        localSettings.cornerStyle === style.id
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-800'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-sm font-medium text-slate-200">{style.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{style.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className="text-lg font-bold text-slate-200 mb-4">Colors</h3>
                
                {/* Color Presets */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Presets</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {presetColors.map((preset) => (
                      <motion.button
                        key={preset.name}
                        onClick={() => handlePresetColor(preset)}
                        className="p-3 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div 
                          className="w-8 h-8 rounded mx-auto mb-1 border"
                          style={{ 
                            backgroundColor: preset.bg,
                            borderColor: preset.fg 
                          }}
                        >
                          <div 
                            className="w-4 h-4 m-2 rounded-sm"
                            style={{ backgroundColor: preset.fg }}
                          />
                        </div>
                        <div className="text-xs text-slate-300">{preset.name}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={localSettings.backgroundColor}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-12 h-10 rounded border border-slate-600 bg-slate-800"
                      />
                      <input
                        type="text"
                        value={localSettings.backgroundColor}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-200 text-sm"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Foreground Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={localSettings.foregroundColor}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, foregroundColor: e.target.value }))}
                        className="w-12 h-10 rounded border border-slate-600 bg-slate-800"
                      />
                      <input
                        type="text"
                        value={localSettings.foregroundColor}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, foregroundColor: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-200 text-sm"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Style */}
              <div>
                <h3 className="text-lg font-bold text-slate-200 mb-4">Logo Background Style</h3>
                <div className="grid grid-cols-3 gap-3">
                  {logoStyles.map((style) => (
                    <motion.button
                      key={style.id}
                      onClick={() => setLocalSettings(prev => ({ ...prev, logoStyle: style.id }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        localSettings.logoStyle === style.id
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-800'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-sm font-medium text-slate-200">{style.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{style.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                Reset to Default
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg transition-colors font-medium"
              >
                Apply Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
