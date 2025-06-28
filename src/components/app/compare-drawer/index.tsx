import { motion, AnimatePresence } from "framer-motion";
import { useQRCode } from "@/store/qrcode";
import { formatBytes, formatTime } from "@/lib/format";
import { useEffect, useState } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { cn } from "@/lib/cn";
import {
  X,
  BarChart3,
  Clock,
  MemoryStick,
  HardDrive,
  TrendingUp,
  Award,
  Zap,
  Lightbulb,
  Target,
  CheckCircle,
  AlertTriangle,
  ThumbsUp,
  Cpu,
  Layers,
  Shield,
  Globe,
  Smartphone,
  Users
} from "lucide-react";

interface CompareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompareDrawer({ isOpen, onClose }: CompareDrawerProps) {
  const { stacks } = useQRCode();
  const [activeTab, setActiveTab] = useState<'metrics' | 'analysis' | 'recommendations' | 'technical'>('metrics');
  const [chartMetric, setChartMetric] = useState<'renderTime' | 'memoryUsage' | 'fileSize'>('renderTime');

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

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const packages = [
    { name: 'qrcode', color: 'blue', fullName: 'qrcode' },
    { name: 'react-qr-code', color: 'purple', fullName: 'react-qr-code' },
    { name: 'qrcode.react', color: 'green', fullName: 'qrcode.react' }
  ];

  const getPackageData = (packageName: string) => {
    const packageStack = stacks[packageName];
    if (!packageStack || packageStack.stack.length === 0) {
      return null;
    }
    return packageStack.metrics;
  };

  const getBestPerformer = (metric: 'renderTime' | 'memoryUsage' | 'fileSize') => {
    const validPackages = packages
      .map(pkg => ({ ...pkg, data: getPackageData(pkg.name) }))
      .filter(pkg => pkg.data);

    if (validPackages.length === 0) return null;

    return validPackages.reduce((best, current) => {
      const bestValue = best.data![`average${metric.charAt(0).toUpperCase() + metric.slice(1)}` as keyof typeof best.data];
      const currentValue = current.data![`average${metric.charAt(0).toUpperCase() + metric.slice(1)}` as keyof typeof current.data];
      
      if (metric === 'fileSize') {
        // For file size, we want the last generation size, not average
        const bestSize = best.data!.lastGeneration?.fileSize || 0;
        const currentSize = current.data!.lastGeneration?.fileSize || 0;
        return currentSize < bestSize ? current : best;
      }
      
      return (currentValue as number) < (bestValue as number) ? current : best;
    });
  };

  const getPackageDescription = (packageName: string) => {
    switch (packageName) {
      case 'qrcode':
        return {
          description: 'Pure JavaScript QR code generator with excellent browser compatibility and Node.js support.',
          pros: ['Lightweight', 'No dependencies', 'Excellent browser support', 'Node.js compatible'],
          cons: ['Basic styling options', 'Canvas/SVG output only'],
          useCase: 'Best for server-side generation and simple client-side needs.',
          architecture: 'Canvas-based rendering with optional SVG output',
          bundleSize: '~42KB minified',
          compatibility: 'IE11+, Node.js 8+',
          maintenance: 'Active development, mature codebase'
        };
      case 'react-qr-code':
        return {
          description: 'React-specific QR code component with modern SVG output and clean API design.',
          pros: ['React optimized', 'SVG output', 'TypeScript support', 'Clean API'],
          cons: ['React dependency', 'Limited customization'],
          useCase: 'Perfect for React applications requiring clean SVG QR codes.',
          architecture: 'SVG-based React component with hooks integration',
          bundleSize: '~15KB minified',
          compatibility: 'React 16.8+, Modern browsers',
          maintenance: 'Active development, React-focused'
        };
      case 'qrcode.react':
        return {
          description: 'Feature-rich React QR code component with extensive customization options.',
          pros: ['Highly customizable', 'Multiple output formats', 'Rich feature set', 'Active development'],
          cons: ['Larger bundle size', 'More complex API'],
          useCase: 'Ideal for applications requiring custom styling and advanced features.',
          architecture: 'Multi-format rendering (Canvas/SVG) with extensive props',
          bundleSize: '~85KB minified',
          compatibility: 'React 16+, Modern browsers',
          maintenance: 'Very active development, feature-rich'
        };
      default:
        return null;
    }
  };

  const getPerformanceAnalysis = () => {
    const validPackages = packages
      .map(pkg => ({ ...pkg, data: getPackageData(pkg.name) }))
      .filter(pkg => pkg.data);

    if (validPackages.length === 0) return null;

    // Get actual data for analysis
    const fastestRender = getBestPerformer('renderTime');
    const lowestMemory = getBestPerformer('memoryUsage');
    const smallestFile = getBestPerformer('fileSize');
    
    // Calculate performance differences
    const renderTimes = validPackages.map(pkg => pkg.data!.averageRenderTime);
    const maxRenderTime = Math.max(...renderTimes);
    const minRenderTime = Math.min(...renderTimes);
    const renderDifference = ((maxRenderTime - minRenderTime) / minRenderTime * 100).toFixed(1);
    
    const memoryUsages = validPackages.map(pkg => pkg.data!.averageMemoryUsage);
    const maxMemory = Math.max(...memoryUsages);
    const minMemory = Math.min(...memoryUsages);
    const memoryDifference = ((maxMemory - minMemory) / minMemory * 100).toFixed(1);

    const analysis = {
      renderPerformance: {
        title: 'Render Performance Analysis',
        insights: [
          `${fastestRender?.fullName || 'Unknown'} shows the fastest average render time at ${formatTime(fastestRender?.data?.averageRenderTime || 0)}`,
          `Performance difference between fastest and slowest: ${renderDifference}%`,
          `Total generations tested: ${validPackages.reduce((sum, pkg) => sum + pkg.data!.totalGenerations, 0)} across all packages`,
          validPackages.length === 3 
            ? 'All three packages tested - comprehensive comparison available'
            : `${validPackages.length} package(s) tested - consider testing all packages for complete analysis`
        ],
        recommendations: [
          `Best for speed: ${fastestRender?.fullName || 'Test more packages'} with ${formatTime(fastestRender?.data?.averageRenderTime || 0)} average`,
          renderDifference > '20' 
            ? 'Significant performance differences detected - choose based on your priority'
            : 'Performance differences are minimal - other factors may be more important',
          validPackages.some(pkg => pkg.data!.totalGenerations < 10)
            ? 'Consider running more iterations for more reliable performance data'
            : 'Good sample size achieved for reliable performance comparison'
        ]
      },
      memoryUsage: {
        title: 'Memory Usage Analysis',
        insights: [
          `${lowestMemory?.fullName || 'Unknown'} has the lowest average memory usage at ${formatBytes(lowestMemory?.data?.averageMemoryUsage || 0)}`,
          `Memory difference between highest and lowest: ${memoryDifference}%`,
          `Peak memory usage observed: ${formatBytes(Math.max(...validPackages.map(pkg => {
            const packageStack = stacks[pkg.name];
            return packageStack ? Math.max(...packageStack.stack.map(m => m.memoryUsage)) : 0;
          })))}`,
          validPackages.every(pkg => pkg.data!.averageMemoryUsage < 5000000)
            ? 'All packages show efficient memory usage (< 5MB average)'
            : 'Some packages show high memory usage - monitor in production'
        ],
        recommendations: [
          `Most memory efficient: ${lowestMemory?.fullName || 'Test more packages'}`,
          memoryDifference > '50'
            ? 'Significant memory differences - important for high-volume applications'
            : 'Memory usage is fairly consistent across packages',
          'Monitor memory patterns during peak usage in production applications',
          'Consider cleanup strategies for applications generating many QR codes'
        ]
      },
      fileSize: {
        title: 'File Size Analysis',
        insights: [
          `${smallestFile?.fullName || 'Unknown'} produces the smallest files at ${formatBytes(smallestFile?.data?.lastGeneration?.fileSize || 0)}`,
          `File sizes tested with current settings: ${validPackages.map(pkg => 
            `${pkg.fullName}: ${formatBytes(pkg.data!.lastGeneration?.fileSize || 0)}`).join(', ')}`,
          validPackages.every(pkg => (pkg.data!.lastGeneration?.fileSize || 0) < 50000)
            ? 'All packages produce compact files (< 50KB)'
            : 'Some packages produce larger files - consider optimization',
          'File size may vary based on content complexity and QR code size settings'
        ],
        recommendations: [
          `Best for file size: ${smallestFile?.fullName || 'Test more packages'}`,
          'SVG-based outputs typically scale better for different sizes',
          'Consider the trade-off between quality and file size for your use case',
          'Test with your actual content as results may vary with different data'
        ]
      }
    };

    return analysis;
  };

  const getBestPractices = () => {
    const validPackages = packages
      .map(pkg => ({ ...pkg, data: getPackageData(pkg.name) }))
      .filter(pkg => pkg.data);

    const hasHighIterations = validPackages.some(pkg => pkg.data!.totalGenerations > 50);
    const hasMemoryData = validPackages.some(pkg => pkg.data!.averageMemoryUsage > 0);
    const hasVariablePerformance = validPackages.length > 1 && validPackages.some(pkg => {
      const others = validPackages.filter(p => p.name !== pkg.name);
      return others.some(other => 
        Math.abs(pkg.data!.averageRenderTime - other.data!.averageRenderTime) > 10
      );
    });

    return {
      performance: [
        hasVariablePerformance 
          ? `Based on your tests, performance varies significantly between packages - choose wisely for your use case`
          : 'Use error correction level "M" for most applications (balance between size and reliability)',
        hasHighIterations
          ? 'Your high iteration testing shows the importance of performance measurement'
          : 'Consider testing with more iterations (50+) for better performance insights',
        'Cache generated QR codes when possible to avoid regeneration',
        hasMemoryData && validPackages.some(pkg => pkg.data!.averageMemoryUsage > 5000000)
          ? 'Monitor memory usage - some tested packages show higher memory consumption'
          : 'Consider using Web Workers for bulk QR code generation',
        validPackages.length === 1
          ? 'Test multiple packages to compare performance characteristics'
          : 'Based on your testing, you can make informed performance decisions'
      ],
      accessibility: [
        'Always provide alt text describing the QR code content',
        'Ensure sufficient contrast ratio between foreground and background',
        'Provide alternative text-based access to the encoded information',
        'Test QR codes with various screen reader technologies',
        validPackages.some(pkg => pkg.name.includes('react'))
          ? 'React-based solutions offer better accessibility integration'
          : 'Consider accessibility implications when choosing QR code library'
      ],
      userExperience: [
        'Show loading states during QR code generation',
        hasVariablePerformance
          ? `Your tests show render times from ${formatTime(Math.min(...validPackages.map(p => p.data!.averageRenderTime)))} to ${formatTime(Math.max(...validPackages.map(p => p.data!.averageRenderTime)))} - consider user expectations`
          : 'Provide download/save functionality for generated codes',
        'Allow users to customize size and format when appropriate',
        'Include error handling for invalid input data',
        `Test QR codes with multiple scanning applications - file sizes in your tests: ${validPackages.map(pkg => formatBytes(pkg.data!.lastGeneration?.fileSize || 0)).join(', ')}`
      ],
      security: [
        'Validate and sanitize all input data before encoding',
        'Be cautious with dynamic content in QR codes',
        'Consider the privacy implications of encoded data',
        validPackages.length > 1
          ? 'Your testing approach shows good security practice - validate before choosing'
          : 'Implement rate limiting for QR code generation endpoints'
      ]
    };
  };

  const getTechnicalComparison = () => {
    // Base technical information
    const baseEcosystem = {
      qrcode: {
        downloads: '~2.5M weekly',
        github: '7k+ stars',
        issues: 'Low issue count, stable',
        community: 'Large general JavaScript community'
      },
      'react-qr-code': {
        downloads: '~400k weekly',
        github: '500+ stars',
        issues: 'Active issue resolution',
        community: 'React-focused community'
      },
      'qrcode.react': {
        downloads: '~1.2M weekly',
        github: '3k+ stars',
        issues: 'Moderate issue count',
        community: 'React community with customization focus'
      }
    };

    // Enhance with performance data
    const enhancedEcosystem: Record<string, unknown> = { title: 'Ecosystem & Performance Data' };
    
    packages.forEach(pkg => {
      const data = getPackageData(pkg.name);
      const baseInfo = baseEcosystem[pkg.name as keyof typeof baseEcosystem];
      
      enhancedEcosystem[pkg.name] = {
        ...baseInfo,
        ...(data && {
          testResults: `${data.totalGenerations} generations tested`,
          avgRenderTime: formatTime(data.averageRenderTime),
          avgMemoryUsage: formatBytes(data.averageMemoryUsage),
          lastFileSize: formatBytes(data.lastGeneration?.fileSize || 0)
        })
      };
    });

    return {
      architecture: {
        title: 'Architecture & Implementation',
        qrcode: {
          type: 'Canvas/SVG Library',
          approach: 'Direct canvas manipulation with optional SVG output',
          dependencies: 'Zero dependencies',
          rendering: 'Imperative API with manual DOM management'
        },
        'react-qr-code': {
          type: 'React Component',
          approach: 'SVG-based React component with declarative API',
          dependencies: 'React, prop-types',
          rendering: 'Declarative React rendering with hooks'
        },
        'qrcode.react': {
          type: 'React Component',
          approach: 'Multi-format rendering with extensive customization',
          dependencies: 'React, qrcode library',
          rendering: 'Flexible rendering with Canvas/SVG options'
        }
      },
      apiDesign: {
        title: 'API Design Philosophy',
        qrcode: 'Functional API with callback-based generation',
        'react-qr-code': 'Component props with sensible defaults',
        'qrcode.react': 'Comprehensive props API with fine-grained control'
      },
      ecosystem: enhancedEcosystem
    };
  };

  const getUseCaseRecommendations = () => {
    const validPackages = packages
      .map(pkg => ({ ...pkg, data: getPackageData(pkg.name) }))
      .filter(pkg => pkg.data);

    if (validPackages.length === 0) {
      return {
        scenarios: [{
          title: 'No Data Available',
          description: 'Generate QR codes to see personalized recommendations',
          recommended: 'Generate first',
          reasoning: 'Test all packages to get data-driven recommendations',
          considerations: ['Run performance tests', 'Compare actual metrics', 'Make informed decisions']
        }],
        migrationGuide: []
      };
    }

    const fastestRender = getBestPerformer('renderTime');
    const lowestMemory = getBestPerformer('memoryUsage');
    const smallestFile = getBestPerformer('fileSize');

    // Determine recommendations based on actual performance data
    const scenarios = [];
    
    if (fastestRender) {
      scenarios.push({
        title: 'High-Performance Applications',
        description: 'Applications requiring fastest QR code generation',
        recommended: fastestRender.fullName,
        reasoning: `Currently fastest at ${formatTime(fastestRender.data!.averageRenderTime)} average render time`,
        considerations: [
          `${fastestRender.data!.totalGenerations} generations tested`,
          `Performance advantage demonstrated in testing`,
          'Best for high-frequency generation scenarios'
        ]
      });
    }

    if (lowestMemory && lowestMemory.name !== fastestRender?.name) {
      scenarios.push({
        title: 'Memory-Constrained Environments',
        description: 'Mobile apps or environments with limited memory',
        recommended: lowestMemory.fullName,
        reasoning: `Lowest memory usage at ${formatBytes(lowestMemory.data!.averageMemoryUsage)} average`,
        considerations: [
          'Optimal for mobile applications',
          'Reduced memory pressure',
          'Better for batch processing'
        ]
      });
    }

    if (smallestFile && smallestFile.name !== fastestRender?.name && smallestFile.name !== lowestMemory?.name) {
      scenarios.push({
        title: 'Bandwidth-Sensitive Applications',
        description: 'Web apps prioritizing file size and transfer speed',
        recommended: smallestFile.fullName,
        reasoning: `Smallest output files at ${formatBytes(smallestFile.data!.lastGeneration?.fileSize || 0)}`,
        considerations: [
          'Reduced bandwidth usage',
          'Faster web delivery',
          'Better user experience on slow connections'
        ]
      });
    }

    // Add balanced recommendation if we have multiple packages
    if (validPackages.length > 1) {
      const allPerformanceGood = validPackages.every(pkg => 
        pkg.data!.averageRenderTime < 50 && // Less than 50ms
        pkg.data!.averageMemoryUsage < 10000000 // Less than 10MB
      );

      if (allPerformanceGood) {
        scenarios.push({
          title: 'General Purpose Applications',
          description: 'Most applications where performance differences are minimal',
          recommended: 'Any tested package',
          reasoning: 'All tested packages show good performance characteristics',
          considerations: [
            'Choose based on ecosystem fit',
            'Consider long-term maintenance',
            'Evaluate developer experience'
          ]
        });
      }
    }

    // If no packages tested yet
    if (scenarios.length === 0) {
      scenarios.push({
        title: 'Get Started',
        description: 'Run tests to see personalized recommendations',
        recommended: 'Test packages first',
        reasoning: 'Generate QR codes to see data-driven recommendations',
        considerations: [
          'Test with your typical content',
          'Use realistic iteration counts',
          'Consider your target environment'
        ]
      });
    }

    return {
      scenarios,
      migrationGuide: [
        {
          from: 'qrcode',
          to: 'react-qr-code',
          difficulty: 'Easy',
          steps: ['Replace function calls with JSX components', 'Convert options to props', 'Handle SVG output']
        },
        {
          from: 'react-qr-code',
          to: 'qrcode.react',
          difficulty: 'Easy',
          steps: ['Update component props', 'Configure output format', 'Adjust styling approach']
        },
        {
          from: 'qrcode.react',
          to: 'qrcode',
          difficulty: 'Medium',
          steps: ['Refactor to functional API', 'Handle canvas/SVG output', 'Implement React integration']
        }
      ]
    };
  };

  const getPerformanceChartData = (metric: 'renderTime' | 'memoryUsage' | 'fileSize') => {
    const maxDataPoints = 50;
    
    // Prepare data for each package separately
    const packageData: Record<string, Array<{ sequence: number; value: number }>> = {};
    
    packages.forEach((pkg) => {
      const packageStack = stacks[pkg.name];
      if (packageStack && packageStack.stack.length > 0) {
        // Get last 50 generations for this package
        const lastGenerations = packageStack.stack
          .slice(-maxDataPoints)
          .map((metricData, index) => {
            let value = 0;
            if (metric === 'renderTime') {
              value = metricData.renderTime;
            } else if (metric === 'memoryUsage') {
              value = metricData.memoryUsage;
            } else if (metric === 'fileSize') {
              value = metricData.fileSize;
            }
            
            return {
              sequence: index + 1,
              value: Math.round(value * 100) / 100
            };
          });
        
        packageData[pkg.name] = lastGenerations;
      }
    });

    // Find the maximum sequence number across all packages
    const maxSequence = Math.max(
      ...Object.values(packageData).map(data => data.length),
      0
    );

    if (maxSequence === 0) return [];

    // Build chart data with each sequence number
    const chartData: Array<{
      sequence: number;
      qrcode?: number;
      'react-qr-code'?: number;
      'qrcode.react'?: number;
    }> = [];

    for (let i = 1; i <= maxSequence; i++) {
      const dataPoint = {
        sequence: i,
        qrcode: undefined as number | undefined,
        'react-qr-code': undefined as number | undefined,
        'qrcode.react': undefined as number | undefined,
      };

      // Add data for each package if available at this sequence
      packages.forEach((pkg) => {
        const pkgData = packageData[pkg.name];
        if (pkgData && pkgData[i - 1]) {
          const value = pkgData[i - 1].value;
          
          if (pkg.name === 'qrcode') {
            dataPoint.qrcode = value;
          } else if (pkg.name === 'react-qr-code') {
            dataPoint['react-qr-code'] = value;
          } else if (pkg.name === 'qrcode.react') {
            dataPoint['qrcode.react'] = value;
          }
        }
      });

      chartData.push(dataPoint);
    }

    return chartData;
  };

  const hasData = packages.some(pkg => getPackageData(pkg.name));

  const tabs = [
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    { id: 'analysis', label: 'Analysis', icon: Lightbulb },
    { id: 'recommendations', label: 'Guide', icon: Target },
    { id: 'technical', label: 'Technical', icon: Cpu }
  ] as const;

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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-4xl bg-slate-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Performance Comparison
                  </h2>
                  <p className="text-sm text-slate-400">
                    Compare QR code libraries side by side
                  </p>
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
            <div className="flex-1 min-h-0 flex flex-col">
              {!hasData ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="p-4 bg-slate-800 rounded-full mb-4">
                    <BarChart3 className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Performance Data
                  </h3>
                  <p className="text-slate-400 max-w-md">
                    Generate some QR codes first to see performance comparison between the libraries.
                  </p>
                </div>
              ) : (
                <>
                  {/* Tab Navigation */}
                  <div className="border-b border-slate-700 bg-slate-800/30 flex-shrink-0">
                    <nav className="flex space-x-8 px-6">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'metrics' | 'analysis' | 'recommendations' | 'technical')}
                            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                              activeTab === tab.id
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="p-6 pb-12 min-h-full">
                      {activeTab === 'metrics' && (
                        <div className="space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Fastest Render */}
                          <div className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl border border-blue-800">
                            <div className="flex items-center gap-3 mb-3">
                              <Zap className="w-6 h-6 text-blue-400" />
                              <h3 className="font-semibold text-blue-200">Fastest Render</h3>
                            </div>
                            {(() => {
                              const best = getBestPerformer('renderTime');
                              return best ? (
                                <div>
                                  <div className="text-2xl font-bold text-blue-100">
                                    {best.fullName}
                                  </div>
                                  <div className="text-sm text-blue-400">
                                    {formatTime(best.data!.averageRenderTime)}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-blue-400">No data</div>
                              );
                            })()}
                          </div>

                          {/* Lowest Memory */}
                          <div className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-xl border border-purple-800">
                            <div className="flex items-center gap-3 mb-3">
                              <MemoryStick className="w-6 h-6 text-purple-400" />
                              <h3 className="font-semibold text-purple-200">Lowest Memory</h3>
                            </div>
                            {(() => {
                              const best = getBestPerformer('memoryUsage');
                              return best ? (
                                <div>
                                  <div className="text-2xl font-bold text-purple-100">
                                    {best.fullName}
                                  </div>
                                  <div className="text-sm text-purple-400">
                                    {formatBytes(best.data!.averageMemoryUsage)}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-purple-400">No data</div>
                              );
                            })()}
                          </div>

                          {/* Smallest Size */}
                          <div className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-xl border border-green-800">
                            <div className="flex items-center gap-3 mb-3">
                              <HardDrive className="w-6 h-6 text-green-400" />
                              <h3 className="font-semibold text-green-200">Smallest File</h3>
                            </div>
                            {(() => {
                              const best = getBestPerformer('fileSize');
                              return best ? (
                                <div>
                                  <div className="text-2xl font-bold text-green-100">
                                    {best.fullName}
                                  </div>
                                  <div className="text-sm text-green-400">
                                    {formatBytes(best.data!.lastGeneration?.fileSize || 0)}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-green-400">No data</div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Performance Trend Chart */}
                        {(() => {
                          const chartData = getPerformanceChartData(chartMetric);
                          
                          if (chartData.length === 0) {
                            return null;
                          }

                          const getMetricInfo = () => {
                            switch (chartMetric) {
                              case 'renderTime':
                                return {
                                  title: 'Render Time Trends',
                                  unit: 'ms',
                                  formatter: (value: number) => `${value}ms`,
                                  description: 'Lower values indicate better performance'
                                };
                              case 'memoryUsage':
                                return {
                                  title: 'Memory Usage Trends',
                                  unit: 'bytes',
                                  formatter: (value: number) => formatBytes(value),
                                  description: 'Lower values indicate better memory efficiency'
                                };
                              case 'fileSize':
                                return {
                                  title: 'File Size Trends',
                                  unit: 'bytes',
                                  formatter: (value: number) => formatBytes(value),
                                  description: 'Lower values indicate more compact output'
                                };
                            }
                          };

                          const metricInfo = getMetricInfo();

                          return (
                            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                  <TrendingUp className="w-6 h-6 text-blue-400" />
                                  <div>
                                    <h3 className="text-xl font-bold text-white">
                                      {metricInfo.title}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                      Comparison - each package shows its last {Math.min(Math.max(...packages.map(pkg => {
                                        const data = getPackageData(pkg.name);
                                        return data ? data.totalGenerations : 0;
                                      })), 50)} generations
                                    </p>
                                  </div>
                                </div>

                                {/* Metric Selector */}
                                <div className="flex bg-slate-700 rounded-lg p-0.5">
                                  <button
                                    onClick={() => setChartMetric('renderTime')}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                                      chartMetric === 'renderTime'
                                        ? 'bg-slate-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:hover:text-white'
                                    }`}
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                    Time
                                  </button>
                                  <button
                                    onClick={() => setChartMetric('memoryUsage')}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                                      chartMetric === 'memoryUsage'
                                        ? 'bg-slate-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:hover:text-white'
                                    }`}
                                  >
                                    <MemoryStick className="w-3.5 h-3.5" />
                                    Memory
                                  </button>
                                  <button
                                    onClick={() => setChartMetric('fileSize')}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                                      chartMetric === 'fileSize'
                                        ? 'bg-slate-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:hover:text-white'
                                    }`}
                                  >
                                    <HardDrive className="w-3.5 h-3.5" />
                                    Size
                                  </button>
                                </div>
                              </div>
                              
                              <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <defs>
                                      <linearGradient id="colorQrcode" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                                      </linearGradient>
                                      <linearGradient id="colorReactQrCode" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                                      </linearGradient>
                                      <linearGradient id="colorQrcodeReact" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis 
                                      dataKey="sequence" 
                                      className="text-xs text-slate-400"
                                      tick={{ fontSize: 12 }}
                                      label={{ value: 'Generation Sequence', position: 'insideBottom', offset: -5 }}
                                    />
                                    <YAxis 
                                      className="text-xs text-slate-400"
                                      tick={{ fontSize: 12 }}
                                      tickFormatter={(value) => metricInfo.formatter(value)}
                                    />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: 'rgb(30 41 59)',
                                        border: '1px solid rgb(51 65 85)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '12px'
                                      }}
                                      formatter={(value: number | string, name: string) => [
                                        metricInfo.formatter(Number(value)),
                                        name === 'qrcode' ? 'qrcode' : 
                                        name === 'react-qr-code' ? 'react-qr-code' : 'qrcode.react'
                                      ]}
                                      labelFormatter={(label) => `Generation #${label} (per package)`}
                                    />
                                    <Legend 
                                      wrapperStyle={{ fontSize: '14px' }}
                                      iconType="rect"
                                    />
                                    
                                    {getPackageData('qrcode') && (
                                      <Area
                                        type="monotone"
                                        dataKey="qrcode"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fill="url(#colorQrcode)"
                                        name="qrcode"
                                        connectNulls={false}
                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                                        activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
                                      />
                                    )}
                                    
                                    {getPackageData('react-qr-code') && (
                                      <Area
                                        type="monotone"
                                        dataKey="react-qr-code"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="url(#colorReactQrCode)"
                                        name="react-qr-code"
                                        connectNulls={false}
                                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                                        activeDot={{ r: 5, stroke: '#8b5cf6', strokeWidth: 2 }}
                                      />
                                    )}
                                    
                                    {getPackageData('qrcode.react') && (
                                      <Area
                                        type="monotone"
                                        dataKey="qrcode.react"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fill="url(#colorQrcodeReact)"
                                        name="qrcode.react"
                                        connectNulls={false}
                                        dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                                        activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
                                      />
                                    )}
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                              
                              <div className="mt-4 text-xs text-slate-400">
                                * Each line shows the last 50 generations for that specific package. {metricInfo.description}.
                              </div>
                            </div>
                          );
                        })()}

                        {/* Detailed Comparison Table */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                          <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">Detailed Metrics</h3>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-slate-700/50">
                                <tr>
                                  <th className="text-left p-4 font-semibold text-white">Library</th>
                                  <th className="text-center p-4 font-semibold text-white">
                                    <div className="flex items-center justify-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      Avg Render Time
                                    </div>
                                  </th>
                                  <th className="text-center p-4 font-semibold text-white">
                                    <div className="flex items-center justify-center gap-2">
                                      <MemoryStick className="w-4 h-4" />
                                      Avg Memory
                                    </div>
                                  </th>
                                  <th className="text-center p-4 font-semibold text-white">
                                    <div className="flex items-center justify-center gap-2">
                                      <HardDrive className="w-4 h-4" />
                                      File Size
                                    </div>
                                  </th>
                                  <th className="text-center p-4 font-semibold text-white">
                                    <div className="flex items-center justify-center gap-2">
                                      <TrendingUp className="w-4 h-4" />
                                      Generations
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {packages.map((pkg, index) => {
                                  const data = getPackageData(pkg.name);
                                  const isRenderBest = getBestPerformer('renderTime')?.name === pkg.name;
                                  const isMemoryBest = getBestPerformer('memoryUsage')?.name === pkg.name;
                                  const isFileBest = getBestPerformer('fileSize')?.name === pkg.name;

                                  return (
                                    <tr key={pkg.name} className={`border-b border-slate-700 ${
                                      index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-700/30'
                                    }`}>
                                      <td className="p-4">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-3 h-3 rounded-full bg-${pkg.color}-500`}></div>
                                          <div>
                                            <div className="font-semibold text-white">
                                              {pkg.fullName}
                                            </div>
                                            <div className="text-sm text-slate-400">
                                              {pkg.name}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-4 text-center">
                                        {data ? (
                                          <div className="flex items-center justify-center gap-2">
                                            {isRenderBest && <Award className="w-4 h-4 text-yellow-500" />}
                                            <span className={`font-semibold ${isRenderBest ? 'text-blue-400' : 'text-white'}`}>
                                              {formatTime(data.averageRenderTime)}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-slate-400">No data</span>
                                        )}
                                      </td>
                                      <td className="p-4 text-center">
                                        {data ? (
                                          <div className="flex items-center justify-center gap-2">
                                            {isMemoryBest && <Award className="w-4 h-4 text-yellow-500" />}
                                            <span className={`font-semibold ${isMemoryBest ? 'text-purple-400' : 'text-white'}`}>
                                              {formatBytes(data.averageMemoryUsage)}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-slate-400">No data</span>
                                        )}
                                      </td>
                                      <td className="p-4 text-center">
                                        {data ? (
                                          <div className="flex items-center justify-center gap-2">
                                            {isFileBest && <Award className="w-4 h-4 text-yellow-500" />}
                                            <span className={`font-semibold ${isFileBest ? 'text-green-400' : 'text-white'}`}>
                                              {formatBytes(data.lastGeneration?.fileSize || 0)}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-slate-400">No data</span>
                                        )}
                                      </td>
                                      <td className="p-4 text-center">
                                        {data ? (
                                          <span className="font-semibold text-white">
                                            {data.totalGenerations}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400">0</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'analysis' && (
                      <div className="space-y-8">
                        {(() => {
                          const analysis = getPerformanceAnalysis();
                          if (!analysis) return null;

                          return (
                            <>
                              {/* Performance Analysis */}
                              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                  <Lightbulb className="w-6 h-6 text-blue-400" />
                                  <h3 className="text-xl font-bold text-white">
                                    {analysis.renderPerformance.title}
                                  </h3>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-white mb-3">Key Insights</h4>
                                    <ul className="space-y-2">
                                      {analysis.renderPerformance.insights.map((insight, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                          <span className="text-slate-300">{insight}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-white mb-3">Recommendations</h4>
                                    <ul className="space-y-2">
                                      {analysis.renderPerformance.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                          <ThumbsUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                          <span className="text-slate-300">{rec}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              {/* Memory Usage Analysis */}
                              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                  <MemoryStick className="w-6 h-6 text-purple-400" />
                                  <h3 className="text-xl font-bold text-white">
                                    {analysis.memoryUsage.title}
                                  </h3>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-white mb-3">Key Insights</h4>
                                    <ul className="space-y-2">
                                      {analysis.memoryUsage.insights.map((insight, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                          <span className="text-slate-300">{insight}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-white mb-3">Recommendations</h4>
                                    <ul className="space-y-2">
                                      {analysis.memoryUsage.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                          <ThumbsUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                          <span className="text-slate-300">{rec}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              {/* File Size Analysis */}
                              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                  <HardDrive className="w-6 h-6 text-green-400" />
                                  <h3 className="text-xl font-bold text-white">
                                    {analysis.fileSize.title}
                                  </h3>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-white mb-3">Key Insights</h4>
                                    <ul className="space-y-2">
                                      {analysis.fileSize.insights.map((insight, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                          <span className="text-slate-300">{insight}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-white mb-3">Recommendations</h4>
                                    <ul className="space-y-2">
                                      {analysis.fileSize.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                          <ThumbsUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                          <span className="text-slate-300">{rec}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {activeTab === 'recommendations' && (
                      <div className="space-y-8">
                        {(() => {
                          const recommendations = getUseCaseRecommendations();
                          const bestPractices = getBestPractices();

                          return (
                            <>
                              {/* Use Case Scenarios */}
                              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                  <Target className="w-6 h-6 text-blue-400" />
                                  <h3 className="text-xl font-bold text-white">
                                    Use Case Recommendations
                                  </h3>
                                </div>
                                <div className="space-y-6">
                                  {recommendations.scenarios.map((scenario, index) => (
                                    <div key={index} className="border border-slate-700 rounded-lg p-4">
                                      <div className="flex items-start gap-4">
                                        <div 
                                          className={cn(
                                            "p-2 rounded-lg",
                                            {
                                              'bg-blue-900/20': scenario.recommended === 'qrcode',
                                              'bg-purple-900/20': scenario.recommended === 'react-qr-code',
                                              'bg-green-900/20': scenario.recommended === 'qrcode.react'
                                            },
                                          )}
                                        >
                                          <Award
                                            className={cn(
                                              "w-5 h-5",
                                              {
                                                'text-blue-400': scenario.recommended === 'qrcode',
                                                'text-purple-400': scenario.recommended === 'react-qr-code',
                                                'text-green-400': scenario.recommended === 'qrcode.react'
                                              },
                                            )}
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-white mb-2">
                                            {scenario.title}
                                          </h4>
                                          <p className="text-slate-300 mb-3">
                                            {scenario.description}
                                          </p>
                                          <div
                                            className={cn(
                                              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                                              {
                                                'bg-blue-900/20 text-blue-200': scenario.recommended === 'qrcode',
                                                'bg-purple-900/20 text-purple-200': scenario.recommended === 'react-qr-code',
                                                'bg-green-900/20 text-green-200': scenario.recommended === 'qrcode.react'
                                              },
                                            )}
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                            Recommended: {scenario.recommended}
                                          </div>
                                          <p className="text-sm text-slate-400 mt-2">
                                            {scenario.reasoning}
                                          </p>
                                          <ul className="text-sm text-slate-300 mt-2 space-y-1">
                                            {scenario.considerations.map((consideration, i) => (
                                              <li key={i} className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                                {consideration}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Best Practices */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                  <div className="flex items-center gap-3 mb-4">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    <h4 className="font-semibold text-white">Performance</h4>
                                  </div>
                                  <ul className="space-y-2">
                                    {bestPractices.performance.map((practice, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-slate-300">{practice}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                  <div className="flex items-center gap-3 mb-4">
                                    <Shield className="w-5 h-5 text-blue-400" />
                                    <h4 className="font-semibold text-white">Security</h4>
                                  </div>
                                  <ul className="space-y-2">
                                    {bestPractices.security.map((practice, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-slate-300">{practice}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                  <div className="flex items-center gap-3 mb-4">
                                    <Users className="w-5 h-5 text-purple-400" />
                                    <h4 className="font-semibold text-white">Accessibility</h4>
                                  </div>
                                  <ul className="space-y-2">
                                    {bestPractices.accessibility.map((practice, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-slate-300">{practice}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                  <div className="flex items-center gap-3 mb-4">
                                    <Smartphone className="w-5 h-5 text-green-400" />
                                    <h4 className="font-semibold text-white">User Experience</h4>
                                  </div>
                                  <ul className="space-y-2">
                                    {bestPractices.userExperience.map((practice, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-slate-300">{practice}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {activeTab === 'technical' && (
                      <div className="space-y-8">
                        {(() => {
                          const technical = getTechnicalComparison();

                          return (
                            <>
                              {/* Architecture Comparison */}
                              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                  <Layers className="w-6 h-6 text-blue-400" />
                                  <h3 className="text-xl font-bold text-white">
                                    {technical.architecture.title}
                                  </h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                  {packages.map((pkg) => {
                                    const archInfo = technical.architecture[pkg.name as keyof typeof technical.architecture];
                                    if (typeof archInfo === 'string') return null;
                                    
                                    return (
                                      <div key={pkg.name} className="border border-slate-700 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-4">
                                          <div className={`w-3 h-3 rounded-full bg-${pkg.color}-500`}></div>
                                          <h4 className="font-semibold text-white">{pkg.fullName}</h4>
                                        </div>
                                        <div className="space-y-3">
                                          <div>
                                            <span className="text-sm font-medium text-slate-400">Type:</span>
                                            <p className="text-sm text-white">{archInfo.type}</p>
                                          </div>
                                          <div>
                                            <span className="text-sm font-medium text-slate-400">Approach:</span>
                                            <p className="text-sm text-white">{archInfo.approach}</p>
                                          </div>
                                          <div>
                                            <span className="text-sm font-medium text-slate-400">Dependencies:</span>
                                            <p className="text-sm text-white">{archInfo.dependencies}</p>
                                          </div>
                                          <div>
                                            <span className="text-sm font-medium text-slate-400">Rendering:</span>
                                            <p className="text-sm text-white">{archInfo.rendering}</p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Package Details */}
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {packages.map((pkg) => {
                                  const desc = getPackageDescription(pkg.name);
                                  if (!desc) return null;

                                  return (
                                    <div key={pkg.name} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-4 h-4 rounded-full bg-${pkg.color}-500`}></div>
                                        <h4 className="font-semibold text-white">{pkg.fullName}</h4>
                                      </div>
                                      
                                      <div className="space-y-4">
                                        <p className="text-sm text-slate-300">{desc.description}</p>
                                        
                                        <div>
                                          <h5 className="text-sm font-medium text-white mb-2">Technical Details</h5>
                                          <div className="space-y-2 text-xs">
                                            <div className="flex justify-between">
                                              <span className="text-slate-400">Architecture:</span>
                                              <span className="text-white">{desc.architecture}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-slate-400">Bundle Size:</span>
                                              <span className="text-white">{desc.bundleSize}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-slate-400">Compatibility:</span>
                                              <span className="text-white">{desc.compatibility}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-slate-400">Maintenance:</span>
                                              <span className="text-white">{desc.maintenance}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <h5 className="text-sm font-medium text-green-400 mb-2">Pros</h5>
                                          <ul className="space-y-1">
                                            {desc.pros.map((pro, index) => (
                                              <li key={index} className="flex items-center gap-2 text-xs">
                                                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                                <span className="text-slate-300">{pro}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>

                                        <div>
                                          <h5 className="text-sm font-medium text-orange-400 mb-2">Cons</h5>
                                          <ul className="space-y-1">
                                            {desc.cons.map((con, index) => (
                                              <li key={index} className="flex items-center gap-2 text-xs">
                                                <AlertTriangle className="w-3 h-3 text-orange-500 flex-shrink-0" />
                                                <span className="text-slate-300">{con}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>

                                        <div className="pt-2 border-t border-slate-700">
                                          <p className="text-xs text-slate-400 italic">{desc.useCase}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Ecosystem Stats */}
                              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                  <Globe className="w-6 h-6 text-green-400" />
                                  <h3 className="text-xl font-bold text-white">
                                    {String(technical.ecosystem.title)}
                                  </h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                  {packages.map((pkg) => {
                                    const ecoInfo = technical.ecosystem[pkg.name];
                                    if (typeof ecoInfo === 'string' || !ecoInfo) return null;
                                    
                                    return (
                                      <div key={pkg.name} className="border border-slate-700 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-4">
                                          <div className={`w-3 h-3 rounded-full bg-${pkg.color}-500`}></div>
                                          <h4 className="font-semibold text-white">{pkg.fullName}</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                          {(ecoInfo as Record<string, string>).downloads && (
                                            <div className="flex justify-between">
                                              <span className="text-slate-400">Downloads:</span>
                                              <span className="font-medium text-white">{(ecoInfo as Record<string, string>).downloads}</span>
                                            </div>
                                          )}
                                          {(ecoInfo as Record<string, string>).github && (
                                            <div className="flex justify-between">
                                              <span className="text-slate-400">GitHub:</span>
                                              <span className="font-medium text-white">{(ecoInfo as Record<string, string>).github}</span>
                                            </div>
                                          )}
                                          {(ecoInfo as Record<string, string>).testResults && (
                                            <div className="flex justify-between">
                                              <span className="text-slate-400">Test Data:</span>
                                              <span className="font-medium text-blue-400">{(ecoInfo as Record<string, string>).testResults}</span>
                                            </div>
                                          )}
                                          {(ecoInfo as Record<string, string>).avgRenderTime && (
                                            <div className="flex justify-between">
                                              <span className="text-slate-400">Avg Render:</span>
                                              <span className="font-medium text-green-400">{(ecoInfo as Record<string, string>).avgRenderTime}</span>
                                            </div>
                                          )}
                                          {(ecoInfo as Record<string, string>).avgMemoryUsage && (
                                            <div className="flex justify-between">
                                              <span className="text-slate-400">Avg Memory:</span>
                                              <span className="font-medium text-purple-400">{(ecoInfo as Record<string, string>).avgMemoryUsage}</span>
                                            </div>
                                          )}
                                          {(ecoInfo as Record<string, string>).lastFileSize && (
                                            <div className="flex justify-between">
                                              <span className="text-slate-400">File Size:</span>
                                              <span className="font-medium text-orange-400">{(ecoInfo as Record<string, string>).lastFileSize}</span>
                                            </div>
                                          )}
                                          {(ecoInfo as Record<string, string>).community && (
                                            <div className="pt-2 border-t border-slate-700">
                                              <span className="text-xs text-slate-400">{(ecoInfo as Record<string, string>).community}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
