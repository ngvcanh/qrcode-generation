/* eslint-disable @next/next/no-img-element */
import { ChangeEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface LogoUploadProps {
  value: string | null;
  onChange: (logo: string | null) => void;
  className?: string;
}

export function LogoUpload({ value, onChange, className = "" }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Logo (Optional)
      </label>
      
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {!value ? (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all
              ${dragOver 
                ? 'border-blue-400 bg-blue-900/20' 
                : 'border-slate-600 hover:border-blue-400 hover:bg-slate-800/50'
              }
            `}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-slate-700 rounded-full mb-3">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-white mb-1">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-slate-400">
                PNG, JPG, GIF up to 2MB
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative border-2 border-slate-700 rounded-xl p-4 bg-slate-800"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <img
                  src={value}
                  alt="Logo preview"
                  className="w-16 h-16 object-contain rounded-lg border border-slate-600 bg-white"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-sm font-medium ext-white truncate">
                    Logo uploaded
                  </p>
                </div>
                <p className="text-xs text-slate-400">
                  Will be centered in QR code
                </p>
              </div>
              <div className="flex-shrink-0 flex gap-2">
                <button
                  type="button"
                  onClick={handleClick}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Change logo"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Remove logo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-slate-400">
        <p>• Logo will be automatically resized to fit in the center</p>
        <p>• Recommended: Square images with transparent background</p>
        <p>• Supported formats: PNG, JPG, GIF</p>
      </div>
    </div>
  );
}
