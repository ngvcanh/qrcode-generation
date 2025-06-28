/**
 * Download utilities for QR codes and data export
 */

import { GenerationMetric } from "@/store/qrcode";

export interface DownloadOptions {
  filename?: string;
  quality?: number; // For PNG export (0-1)
}

/**
 * Download QR code as PNG
 */
export async function downloadAsPNG(dataURL: string, options: DownloadOptions = {}) {
  try {
    const { filename = 'qrcode', quality = 0.9 } = options;
    
    // If it's already a PNG data URL, use it directly
    if (dataURL.startsWith('data:image/png')) {
      downloadDataURL(dataURL, `${filename}.png`);
      return;
    }
    
    // Convert to PNG using canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Cannot get canvas context');
    }
    
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Fill white background for better compatibility
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the QR code
          ctx.drawImage(img, 0, 0);
          
          // Convert to PNG and download
          const pngDataURL = canvas.toDataURL('image/png', quality);
          downloadDataURL(pngDataURL, `${filename}.png`);
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataURL;
    });
  } catch (error) {
    console.error('Failed to download as PNG:', error);
    throw error;
  }
}

/**
 * Download QR code as SVG
 */
export async function downloadAsSVG(dataURL: string, options: DownloadOptions = {}) {
  try {
    const { filename = 'qrcode' } = options;
    
    // If it's already an SVG data URL, extract and download
    if (dataURL.startsWith('data:image/svg+xml')) {
      const svgContent = decodeURIComponent(dataURL.split(',')[1]);
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      downloadBlob(svgBlob, `${filename}.svg`);
      return;
    }
    
    // For non-SVG data URLs (like PNG), we need to embed it in an SVG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Cannot get canvas context');
    }
    
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const { width, height } = img;
          
          // Create SVG with embedded image
          const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>QR Code</title>
  <desc>QR Code generated with qrcode-generation tool</desc>
  <rect width="100%" height="100%" fill="white"/>
  <image x="0" y="0" width="${width}" height="${height}" xlink:href="${dataURL}"/>
</svg>`;
          
          const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
          downloadBlob(svgBlob, `${filename}.svg`);
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataURL;
    });
  } catch (error) {
    console.error('Failed to download as SVG:', error);
    throw error;
  }
}

/**
 * Download performance data as JSON
 */
export function downloadPerformanceData(
  metrics: GenerationMetric[],
  packageName: string,
  options: DownloadOptions = {}
) {
  try {
    const { filename = `${packageName}-performance-data` } = options;
    
    const data = {
      packageName,
      exportDate: new Date().toISOString(),
      totalGenerations: metrics.length,
      metrics: metrics.map(metric => ({
        id: metric.id,
        renderTime: metric.renderTime,
        memoryUsage: metric.memoryUsage,
        fileSize: metric.fileSize,
        timestamp: metric.timestamp,
        value: metric.value,
        size: metric.size,
        hasLogo: !!metric.logo
      })),
      summary: {
        averageRenderTime: metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length,
        averageMemoryUsage: metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length,
        averageFileSize: metrics.reduce((sum, m) => sum + m.fileSize, 0) / metrics.length,
        minRenderTime: Math.min(...metrics.map(m => m.renderTime)),
        maxRenderTime: Math.max(...metrics.map(m => m.renderTime)),
      }
    };
    
    const jsonContent = JSON.stringify(data, null, 2);
    const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
    downloadBlob(jsonBlob, `${filename}.json`);
  } catch (error) {
    console.error('Failed to download performance data:', error);
    throw error;
  }
}

/**
 * Download performance data as CSV
 */
export function downloadPerformanceCSV(
  metrics: GenerationMetric[],
  packageName: string,
  options: DownloadOptions = {}
) {
  try {
    const { filename = `${packageName}-performance-data` } = options;
    
    // CSV headers
    const headers = [
      'ID',
      'Package',
      'Render Time (ms)',
      'Memory Usage (bytes)',
      'File Size (bytes)',
      'Timestamp',
      'Content Length',
      'QR Size',
      'Has Logo'
    ];
    
    // CSV rows
    const rows = metrics.map(metric => [
      metric.id,
      packageName,
      metric.renderTime.toFixed(3),
      metric.memoryUsage.toString(),
      metric.fileSize.toString(),
      new Date(metric.timestamp).toISOString(),
      metric.value.length.toString(),
      metric.size.toString(),
      metric.logo ? 'Yes' : 'No'
    ]);
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
    downloadBlob(csvBlob, `${filename}.csv`);
  } catch (error) {
    console.error('Failed to download CSV:', error);
    throw error;
  }
}

/**
 * Show download options modal/dropdown
 */
export function showDownloadOptions() {
  return new Promise<'png' | 'svg' | 'cancel'>((resolve) => {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    backdrop.style.zIndex = '9999';
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-2xl max-w-sm w-full mx-4';
    
    modal.innerHTML = `
      <div class="text-center">
        <h3 class="text-lg font-bold text-slate-200 mb-2">Download QR Code</h3>
        <p class="text-slate-400 text-sm mb-6">Choose your preferred format</p>
        
        <div class="space-y-3">
          <button id="download-png" class="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Download as PNG
            <span class="text-xs opacity-75">(Raster Image)</span>
          </button>
          
          <button id="download-svg" class="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Download as SVG
            <span class="text-xs opacity-75">(Vector Graphics)</span>
          </button>
          
          <button id="download-cancel" class="w-full px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
        
        <div class="mt-4 p-3 bg-slate-700 rounded-lg">
          <p class="text-xs text-slate-400">
            <strong class="text-slate-300">PNG:</strong> Best for sharing and printing<br>
            <strong class="text-slate-300">SVG:</strong> Best for web and scalability
          </p>
        </div>
      </div>
    `;
    
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    
    // Add event listeners
    const pngBtn = modal.querySelector('#download-png');
    const svgBtn = modal.querySelector('#download-svg');
    const cancelBtn = modal.querySelector('#download-cancel');
    
    const cleanup = () => {
      document.body.removeChild(backdrop);
    };
    
    pngBtn?.addEventListener('click', () => {
      cleanup();
      resolve('png');
    });
    
    svgBtn?.addEventListener('click', () => {
      cleanup();
      resolve('svg');
    });
    
    cancelBtn?.addEventListener('click', () => {
      cleanup();
      resolve('cancel');
    });
    
    // Close on backdrop click
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        cleanup();
        resolve('cancel');
      }
    });
    
    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup();
        document.removeEventListener('keydown', handleEscape);
        resolve('cancel');
      }
    };
    document.addEventListener('keydown', handleEscape);
  });
}

/**
 * Utility function to download a data URL
 */
function downloadDataURL(dataURL: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Utility function to download a blob
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate safe filename from package name and content
 */
export function generateFilename(packageName: string, content: string, hasLogo: boolean = false): string {
  // Clean package name
  const cleanPackageName = packageName.replace(/[^a-zA-Z0-9]/g, '-');
  
  // Create content preview (first 20 chars, safe for filename)
  const contentPreview = content
    .substring(0, 20)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Add timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Combine parts
  const parts = [
    'qrcode',
    cleanPackageName,
    contentPreview,
    hasLogo ? 'with-logo' : null,
    timestamp
  ].filter(Boolean);
  
  return parts.join('-');
}
