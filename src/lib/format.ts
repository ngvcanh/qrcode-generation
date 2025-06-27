// Utility functions for formatting metrics

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatTime = (ms: number): string => {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(Math.round(num));
};

export const getMemoryStatus = (): string => {
  try {
    if (performance.memory && typeof performance.memory.usedJSHeapSize === 'number') {
      return 'Chrome Memory API';
    }
    return 'Estimated (Fallback)';
  } catch {
    return 'Simulated';
  }
};
