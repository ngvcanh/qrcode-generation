import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Clock, MemoryStick, HardDrive, Info, FileText, Zap, Copy, Check, ExternalLink, User, Github } from "lucide-react";
import { usePackageInfo } from "@/hooks/use-package-info";
import { useQRCode } from "@/store/qrcode";
import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { formatBytes, formatTime, getMemoryStatus } from "@/lib/format";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { DownloadChart } from "@/components/app/download-chart";

export interface PackageInfoDialogProps {
  packageName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface CodeComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export function PackageInfoDialog({ packageName, isOpen, onClose }: PackageInfoDialogProps) {
  const { packageInfo, loading, error } = usePackageInfo(packageName || "");
  const { stacks } = useQRCode();
  const [activeTab, setActiveTab] = useState<'overview' | 'readme' | 'performance'>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const packageStack = packageName ? stacks[packageName] : null;
  const metrics = packageStack?.metrics;
  const hasPerformanceData = metrics && metrics.totalGenerations > 0;

  // Helper functions for external links
  const getNpmUrl = (packageName: string) => `https://www.npmjs.com/package/${packageName}`;
  
  const getGithubUrl = (repositoryUrl?: string) => {
    if (!repositoryUrl) return null;
    const cleanUrl = repositoryUrl.replace(/^git\+/, '').replace(/\.git$/, '');
    if (cleanUrl.includes('github.com')) {
      return cleanUrl;
    }
    return null;
  };

  const getAuthorUrl = (author?: string | { name: string; email?: string }, homepage?: string) => {
    // First try homepage
    if (homepage) return homepage;
    
    if (!author) return null;
    if (typeof author === 'string') {
      // Try to extract URL from string format like "Author Name <email> (url)"
      const urlMatch = author.match(/\(([^)]+)\)/);
      if (urlMatch) return urlMatch[1];
      
      // Try to extract email and convert to mailto
      const emailMatch = author.match(/<([^>]+@[^>]+)>/);
      if (emailMatch) return `mailto:${emailMatch[1]}`;
      
      return null;
    }
    
    // For object format, try email
    if (author.email) {
      return `mailto:${author.email}`;
    }
    
    return null;
  };

  // Copy code to clipboard
  const copyToClipboard = async (code: string, codeId: string) => {
    try {
      let success = false;
      
      // Method 1: Try modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(code);
          success = true;
        } catch (clipboardError) {
          console.warn('Clipboard API failed:', clipboardError);
        }
      }
      
      // Method 2: Try legacy execCommand
      if (!success) {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = code;
          textArea.style.position = 'absolute';
          textArea.style.left = '-9999px';
          textArea.style.top = '-9999px';
          textArea.style.opacity = '0';
          textArea.setAttribute('readonly', '');
          textArea.setAttribute('tabindex', '-1');
          
          document.body.appendChild(textArea);
          
          // For mobile browsers
          if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
            const range = document.createRange();
            range.selectNodeContents(textArea);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
            textArea.setSelectionRange(0, 999999);
          } else {
            textArea.select();
            textArea.setSelectionRange(0, textArea.value.length);
          }
          
          success = document.execCommand('copy');
          document.body.removeChild(textArea);
        } catch (execError) {
          console.warn('execCommand failed:', execError);
        }
      }
      
      // Method 3: Manual selection fallback
      if (!success) {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = code;
          textArea.style.position = 'fixed';
          textArea.style.left = '50%';
          textArea.style.top = '50%';
          textArea.style.transform = 'translate(-50%, -50%)';
          textArea.style.width = '300px';
          textArea.style.height = '100px';
          textArea.style.zIndex = '9999';
          textArea.style.background = 'white';
          textArea.style.border = '2px solid #3b82f6';
          textArea.style.borderRadius = '8px';
          textArea.style.padding = '8px';
          textArea.setAttribute('readonly', '');
          
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          textArea.setSelectionRange(0, textArea.value.length);
          
          // Show manual instruction
          const instruction = document.createElement('div');
          instruction.textContent = 'Press Ctrl+C (or Cmd+C) to copy, then click anywhere to close';
          instruction.style.position = 'fixed';
          instruction.style.left = '50%';
          instruction.style.top = 'calc(50% + 70px)';
          instruction.style.transform = 'translateX(-50%)';
          instruction.style.background = '#1f2937';
          instruction.style.color = 'white';
          instruction.style.padding = '8px 16px';
          instruction.style.borderRadius = '6px';
          instruction.style.fontSize = '14px';
          instruction.style.zIndex = '10000';
          
          document.body.appendChild(instruction);
          
          // Remove elements on click or escape
          const cleanup = () => {
            if (document.body.contains(textArea)) document.body.removeChild(textArea);
            if (document.body.contains(instruction)) document.body.removeChild(instruction);
            document.removeEventListener('click', cleanup);
            document.removeEventListener('keydown', escapeHandler);
          };
          
          const escapeHandler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
              cleanup();
            }
          };
          
          setTimeout(() => {
            document.addEventListener('click', cleanup);
            document.addEventListener('keydown', escapeHandler);
          }, 100);
          
          // Consider this a success since user can manually copy
          success = true;
        } catch (manualError) {
          console.warn('Manual copy setup failed:', manualError);
        }
      }
      
      if (success) {
        setCopiedCode(codeId);
        setTimeout(() => setCopiedCode(null), 2000);
        // Show success toast
        toast.success('Code copied to clipboard!', 2000);
      } else {
        throw new Error('All copy methods failed');
      }
      
    } catch (err) {
      console.error('Failed to copy code:', err);
      // Show error toast with helpful message
      toast.error('Copy failed. Please select and copy the code manually.');
    }
  };

  // Decode HTML entities and unicode escape sequences in README
  const decodeReadme = (readme: string): string => {
    try {
      // First decode unicode escape sequences like \u003C
      let decoded = readme.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => {
        return String.fromCharCode(parseInt(grp, 16));
      });
      
      // Decode common HTML entities
      const htmlEntities: Record<string, string> = {
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'",
        '&nbsp;': ' '
      };
      
      Object.entries(htmlEntities).forEach(([entity, char]) => {
        decoded = decoded.replace(new RegExp(entity, 'g'), char);
      });
      
      return decoded;
    } catch (e) {
      console.warn('Failed to decode README:', e);
      return readme;
    }
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const getPackageColor = (name: string) => {
    switch (name) {
      case 'qrcode':
        return { 
          primary: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-500',
          gradient: 'from-blue-400 to-blue-500',
          light: 'bg-blue-50/70 dark:bg-blue-900/15'
        };
      case 'react-qr-code':
        return { 
          primary: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-500',
          gradient: 'from-purple-400 to-purple-500',
          light: 'bg-purple-50/70 dark:bg-purple-900/15'
        };
      case 'qrcode.react':
        return { 
          primary: 'text-pink-600 dark:text-pink-400',
          bg: 'bg-pink-500',
          gradient: 'from-pink-400 to-pink-500',
          light: 'bg-pink-50/70 dark:bg-pink-900/15'
        };
      default:
        return { 
          primary: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-500',
          gradient: 'from-gray-400 to-gray-500',
          light: 'bg-gray-50/70 dark:bg-gray-900/15'
        };
    }
  };

  const colors = packageName ? getPackageColor(packageName) : getPackageColor('');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          style={{ width: '100dvw', height: '100dvh' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog Container - True Fullscreen */}
          <motion.div
            className="relative w-full h-full bg-white dark:bg-slate-800 overflow-hidden flex flex-col md:flex-col"
            style={{ width: '100dvw', height: '100dvh' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className={`px-4 md:px-6 py-4 md:py-5 bg-gradient-to-r ${colors.gradient} text-white flex-shrink-0`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 md:p-2.5 bg-white/20 rounded-lg">
                    <Package className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold">{packageName}</h2>
                    <p className="text-white/80 text-xs md:text-sm">NPM Package Information</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 md:p-2.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-600 order-2 md:order-1">
              <div className="px-6 md:px-6">
                <nav className="flex -mx-6 md:mx-0 md:space-x-8 overflow-x-auto scrollbar-hide">
                  {[
                    { id: 'overview', label: 'Overview', icon: Info },
                    { id: 'performance', label: 'Performance', icon: Zap },
                    { id: 'readme', label: 'README', icon: FileText }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'overview' | 'performance' | 'readme')}
                        className={`py-2 md:py-4 px-4 md:px-1 border-t-2 md:border-t-0 md:border-b-2 font-medium flex flex-col md:flex-row items-center gap-0.5 md:gap-2 transition-colors whitespace-nowrap min-w-0 flex-grow md:flex-none ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="text-[11px] md:text-sm leading-tight">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto order-1 md:order-2">
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Package Info</div>
                    <p className="text-slate-600 dark:text-slate-400">{error}</p>
                  </div>
                </div>
              )}

              {packageInfo && (
                <div className="p-6">
                  <div className="max-w-7xl mx-auto">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                      >
                        {/* External Links */}
                        <div className="flex items-center justify-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-600">
                          {/* NPM Link */}
                          <a
                            href={getNpmUrl(packageName || '')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors group"
                            title="View on NPM"
                          >
                            <Package className="w-4 h-4" />
                            <span className="text-sm font-medium">NPM</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>

                          {/* GitHub Link */}
                          {getGithubUrl(packageInfo?.repository?.url) && (
                            <a
                              href={getGithubUrl(packageInfo?.repository?.url) || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded-lg transition-colors group"
                              title="View on GitHub"
                            >
                              <Github className="w-4 h-4" />
                              <span className="text-sm font-medium">GitHub</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          )}

                          {/* Author Link */}
                          {getAuthorUrl(packageInfo?.author, packageInfo?.homepage) && (
                            <a
                              href={getAuthorUrl(packageInfo?.author, packageInfo?.homepage) || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors group"
                              title="Visit Author"
                            >
                              <User className="w-4 h-4" />
                              <span className="text-sm font-medium">Author</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          )}
                        </div>

                        {/* Package Info Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Basic Info */}
                          <div className={`p-6 ${colors.light} rounded-xl`}>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                              Package Details
                            </h3>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Version:</span>
                                <span className="font-semibold">{packageInfo.version}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">License:</span>
                                <span className="font-semibold">{packageInfo.license || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Size:</span>
                                <span className="font-semibold">
                                  {packageInfo.unpackedSize 
                                    ? `${(packageInfo.unpackedSize / 1024).toFixed(1)} KB`
                                    : 'N/A'
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Weekly Downloads:</span>
                                <span className="font-semibold">
                                  {packageInfo.weeklyDownloads?.toLocaleString() || 'N/A'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Download Chart */}
                            {packageInfo.downloadStats && (
                              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
                                <DownloadChart 
                                  data={packageInfo.downloadStats} 
                                  color={colors.bg === 'bg-blue-500' ? '#3b82f6' : 
                                         colors.bg === 'bg-purple-500' ? '#8b5cf6' : 
                                         colors.bg === 'bg-pink-500' ? '#ec4899' : '#6b7280'} 
                                />
                              </div>
                            )}
                          </div>

                          {/* Quick Stats */}
                          <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                              Quick Stats
                            </h3>
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-blue-500" />
                                <div>
                                  <div className="text-sm text-slate-600 dark:text-slate-400">Repository</div>
                                  <div className="font-bold text-sm">
                                    {packageInfo.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '') || 'N/A'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <HardDrive className="w-5 h-5 text-green-500" />
                                <div>
                                  <div className="text-sm text-slate-600 dark:text-slate-400">Dependencies</div>
                                  <div className="font-bold">
                                    {packageInfo.dependencies ? Object.keys(packageInfo.dependencies).length : 0}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-purple-500" />
                                <div>
                                  <div className="text-sm text-slate-600 dark:text-slate-400">Keywords</div>
                                  <div className="font-bold">
                                    {packageInfo.keywords?.length || 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Description */}
                            {packageInfo.description && (
                              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
                                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                                  Description
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                  {packageInfo.description}
                                </p>
                              </div>
                            )}

                            {/* Keywords */}
                            {packageInfo.keywords && packageInfo.keywords.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                                  Keywords
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {packageInfo.keywords.slice(0, 8).map((keyword) => (
                                    <span
                                      key={keyword}
                                      className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-xs rounded text-slate-700 dark:text-slate-300"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                  {packageInfo.keywords.length > 8 && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">
                                      +{packageInfo.keywords.length - 8} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Dependencies */}
                        {packageInfo.dependencies && Object.keys(packageInfo.dependencies).length > 0 && (
                          <div className="p-6 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                              Dependencies
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {Object.entries(packageInfo.dependencies).map(([dep, version]) => (
                                <div key={dep} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-600/50 rounded-lg">
                                  <span className="font-mono text-sm">{dep}</span>
                                  <span className="text-sm text-slate-600 dark:text-slate-400">{version}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Performance Tab */}
                    {activeTab === 'performance' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                      >
                        {hasPerformanceData ? (
                          <>
                            {/* Performance Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-3 mb-2">
                                  <Clock className="w-6 h-6 text-blue-500" />
                                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Render Time</span>
                                </div>
                                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                  {formatTime(metrics.averageRenderTime)}
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Average</div>
                              </div>

                              <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-3 mb-2">
                                  <MemoryStick className="w-6 h-6 text-purple-500" />
                                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Memory Usage</span>
                                </div>
                                <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                                  {formatBytes(metrics.averageMemoryUsage)}
                                </div>
                                <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                                  {getMemoryStatus()}
                                </div>
                                <div className="text-sm text-purple-600 dark:text-purple-400">Average</div>
                              </div>

                              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-3 mb-2">
                                  <HardDrive className="w-6 h-6 text-green-500" />
                                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Generations</span>
                                </div>
                                <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                                  {metrics.totalGenerations}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">Total</div>
                              </div>
                            </div>

                            {/* Performance History */}
                            {packageStack.stack.length > 0 && (
                              <div className="p-6 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                                  Recent Performance History
                                </h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                  {packageStack.stack.slice(-15).reverse().map((metric, index) => (
                                    <div key={metric.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-600/50 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                          {index + 1}
                                        </div>
                                        <div>
                                          <span className="text-sm font-mono font-medium">
                                            {new Date(metric.timestamp).toLocaleString()}
                                          </span>
                                          <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Value: {metric.value} | Size: {metric.size}px
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-6 text-sm">
                                        <div className="text-center">
                                          <div className="font-bold text-blue-600 dark:text-blue-400">
                                            {formatTime(metric.renderTime)}
                                          </div>
                                          <div className="text-xs text-slate-500">Render</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-bold text-purple-600 dark:text-purple-400">
                                            {formatBytes(metric.memoryUsage)}
                                          </div>
                                          <div className="text-xs text-slate-500">Memory</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-bold text-green-600 dark:text-green-400">
                                            {(metric.fileSize / 1024).toFixed(1)}KB
                                          </div>
                                          <div className="text-xs text-slate-500">Size</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-12">
                            <Zap className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">
                              No Performance Data
                            </h3>
                            <p className="text-slate-500 dark:text-slate-500">
                              Generate some QR codes to see performance metrics for this package.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* README Tab */}
                    {activeTab === 'readme' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        {packageInfo.readme ? (
                          <div className="bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
                            <div className="p-4 bg-slate-50 dark:bg-slate-600/50 border-b border-slate-200 dark:border-slate-600">
                              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                README.md
                              </h3>
                            </div>
                            <div className="p-6 max-w-none">
                              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeRaw]}
                                  components={{
                                    h1: ({ children }) => (
                                      <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-6 pb-3 border-b-2 border-slate-200 dark:border-slate-600">
                                        {children}
                                      </h1>
                                    ),
                                    h2: ({ children }) => (
                                      <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 mt-8 flex items-center gap-3">
                                        <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                                        {children}
                                      </h2>
                                    ),
                                    h3: ({ children }) => (
                                      <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-3 mt-6 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></span>
                                        {children}
                                      </h3>
                                    ),
                                    h4: ({ children }) => (
                                      <h4 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2 mt-4 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></span>
                                        {children}
                                      </h4>
                                    ),
                                    p: ({ children }) => (
                                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                        {children}
                                      </p>
                                    ),
                                    a: ({ children, href }) => (
                                      <a 
                                        href={href} 
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-400 dark:decoration-blue-500 underline-offset-2 transition-colors font-medium"
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                      >
                                        {children}
                                      </a>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-bold text-slate-800 dark:text-slate-100">
                                        {children}
                                      </strong>
                                    ),
                                    em: ({ children }) => (
                                      <em className="italic text-slate-600 dark:text-slate-400">
                                        {children}
                                      </em>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="list-none space-y-2 mb-4 ml-4">
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="list-none space-y-2 mb-4 ml-4 counter-reset-list">
                                        {children}
                                      </ol>
                                    ),
                                    li: ({ children, ...props }) => (
                                      <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300" {...props}>
                                        <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span>{children}</span>
                                      </li>
                                    ),
                                    code: ({ children, className, ...props }: CodeComponentProps & React.HTMLAttributes<HTMLElement>) => {
                                      const match = /language-(\w+)/.exec(className || '');
                                      const language = match ? match[1] : '';
                                      const isInline = !className || !className.includes('language-');
                                      const codeContent = String(children).replace(/\n$/, '');
                                      const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
                                      
                                      return isInline ? (
                                        <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded text-sm font-mono" {...props}>
                                          {children}
                                        </code>
                                      ) : (
                                        <div className="relative my-6">
                                          {/* Mac-style window controls and copy button */}
                                          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                                            {/* Copy button */}
                                            <button
                                              onClick={() => copyToClipboard(codeContent, codeId)}
                                              className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 hover:text-white transition-colors group mr-2"
                                              title="Copy code"
                                            >
                                              {copiedCode === codeId ? (
                                                <Check className="w-3 h-3 text-green-400" />
                                              ) : (
                                                <Copy className="w-3 h-3" />
                                              )}
                                            </button>
                                            
                                            {/* Window controls */}
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                          </div>
                                          
                                          {/* Language label */}
                                          {language ? (
                                            <div className="absolute top-3 left-4 text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded z-10">
                                              {language}
                                            </div>
                                          ) : null}
                                          
                                          <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={language || 'text'}
                                            customStyle={{
                                              margin: 0,
                                              borderRadius: '0.75rem',
                                              border: '1px solid #374151',
                                              paddingTop: language ? '3rem' : '2.5rem',
                                              paddingBottom: '1.5rem',
                                              paddingLeft: '1.5rem',
                                              paddingRight: '1.5rem',
                                              fontSize: '0.875rem',
                                              lineHeight: '1.5'
                                            }}
                                          >
                                            {codeContent}
                                          </SyntaxHighlighter>
                                        </div>
                                      );
                                    },
                                    pre: ({ children }) => (
                                      <div className="my-6">
                                        {children}
                                      </div>
                                    ),
                                    blockquote: ({ children }) => (
                                      <blockquote className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 pl-6 pr-4 py-4 italic text-slate-700 dark:text-slate-300 my-6 rounded-r-lg">
                                        <div className="flex items-start gap-3">
                                          <span className="text-2xl text-blue-500 dark:text-blue-400 leading-none">&ldquo;</span>
                                          <div>{children}</div>
                                        </div>
                                      </blockquote>
                                    ),
                                    table: ({ children }) => (
                                      <div className="overflow-x-auto my-6 rounded-lg border border-slate-300 dark:border-slate-600 shadow-sm">
                                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                          {children}
                                        </table>
                                      </div>
                                    ),
                                    thead: ({ children }) => (
                                      <thead className="bg-slate-50 dark:bg-slate-800">
                                        {children}
                                      </thead>
                                    ),
                                    tbody: ({ children }) => (
                                      <tbody className="bg-white dark:bg-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
                                        {children}
                                      </tbody>
                                    ),
                                    th: ({ children }) => (
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-600">
                                        {children}
                                      </th>
                                    ),
                                    td: ({ children }) => (
                                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700/50">
                                        {children}
                                      </td>
                                    ),
                                    hr: () => (
                                      <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
                                    ),
                                    img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
                                      // Convert relative GitHub URLs to absolute URLs
                                      const processImageSrc = (originalSrc: string): string => {
                                        if (!originalSrc) return originalSrc;
                                        
                                        // If already absolute URL, return as is
                                        if (originalSrc.startsWith('http://') || originalSrc.startsWith('https://')) {
                                          return originalSrc;
                                        }
                                        
                                        // Check if we have repository info to construct GitHub URLs
                                        const repoUrl = packageInfo?.repository?.url;
                                        if (repoUrl) {
                                          // Extract GitHub username and repo name  
                                          // Use split method instead of regex to handle repo names with dots
                                          const repoUrlParts = repoUrl.replace(/^git\+/, '').replace(/\.git$/, '').split('/');
                                          if (repoUrlParts.length >= 2) {
                                            const username = repoUrlParts[repoUrlParts.length - 2];
                                            const repo = repoUrlParts[repoUrlParts.length - 1];
                                            
                                            // Determine default branch based on repo name (not package name)
                                            const defaultBranch = repo === 'qrcode.react' ? 'trunk' : 'main';
                                            
                                            // Handle relative paths
                                            if (originalSrc.startsWith('./') || originalSrc.startsWith('../')) {
                                              return `https://raw.githubusercontent.com/${username}/${repo}/${defaultBranch}/${originalSrc.replace(/^\.\//, '')}`;
                                            }
                                            
                                            // Handle root relative paths
                                            if (originalSrc.startsWith('/')) {
                                              return `https://raw.githubusercontent.com/${username}/${repo}/${defaultBranch}${originalSrc}`;
                                            }
                                            
                                            // Handle simple filenames
                                            return `https://raw.githubusercontent.com/${username}/${repo}/${defaultBranch}/${originalSrc}`;
                                          }
                                        }
                                        
                                        return originalSrc;
                                      };

                                      const processedSrc = processImageSrc(typeof src === 'string' ? src : '');

                                      return (
                                        <div className="my-6 text-center">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img 
                                            src={processedSrc}
                                            alt={alt || 'README Image'}
                                            className="max-w-full h-auto rounded-lg border border-slate-200 dark:border-slate-600 shadow-lg inline-block"
                                            loading="lazy"
                                            {...props}
                                          />
                                          {alt && (
                                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 italic">
                                              {alt}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    },
                                  }}
                                >
                                  {decodeReadme(packageInfo.readme)}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">
                              No README Available
                            </h3>
                            <p className="text-slate-500 dark:text-slate-500">
                              This package doesn&apos;t have a README file or it couldn&apos;t be loaded.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
