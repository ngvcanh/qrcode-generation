import { createElement, useCallback, useRef } from "react";
import { GenerationMetric, useQRCode } from "@/store/qrcode";
import { uid } from "@/lib/uid";
import QRCode from "qrcode";
import dynamic from "next/dynamic";
import { loading } from "@/lib/loading";
import { createQRCodeWithLogo } from "@/lib/qr-logo";

// Dynamic imports to avoid SSR issues
const QRCodeReact = dynamic(() => import("react-qr-code").then(mod => ({ default: mod.default })), { ssr: false });
const QRCodeSVG = dynamic(() => import("qrcode.react").then(mod => ({ default: mod.QRCodeSVG })), { ssr: false });

// Only import renderToString on client side
let renderToString: ((element: React.ReactElement) => string) | null = null;
if (typeof window !== 'undefined') {
  import("react-dom/server").then(mod => {
    renderToString = mod.renderToString;
  });
}

declare global {
  interface Performance {
    memory?: {
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
      usedJSHeapSize: number;
    };
  }
}

// Helper function to get memory usage
const getMemoryUsage = (): number => {
  try {
    // Chrome/Chromium-based browsers
    if (performance.memory && typeof performance.memory.usedJSHeapSize === 'number') {
      const memory = performance.memory.usedJSHeapSize;
      return isNaN(memory) ? 0 : memory;
    }
    
    // Fallback: use estimated memory based on elements count (rough estimation)
    const elementsCount = document.querySelectorAll('*').length;
    const estimate = elementsCount * 100; // Very rough estimate: ~100 bytes per element
    return isNaN(estimate) ? 0 : estimate;
  } catch (error) {
    console.warn('Memory measurement not available:', error);
    // Return a consistent fallback value
    return 1000000; // 1MB as default
  }
};

// Helper function to validate and sanitize metric values
const sanitizeMetric = (value: number, fallback: number = 0): number => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return fallback;
  }
  return Math.max(0, value); // Ensure non-negative
};

export function useGeneration() {
  const { value, size, iterations, logo, addMetric, setCurrentId } = useQRCode();

  const waiting = useRef<string[]>([]);

  const waitFor = (name: string) => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (waiting.current.includes(name)) {
          resolve(true);
          clearInterval(interval);
        }
      }, 1);
    });
  };

  const generateAndWait = useCallback(async (name: string, fn: (id: string) => void, id: string) => {
    if (waiting.current.includes(name)) {
      return;
    }
    
    await Promise.all([
      fn(id),
      waitFor(name),
    ]);
  }, []);

  const generateVanilla = useCallback(async (id: string) => {
    const startTime = performance.now();
    const startMemory = getMemoryUsage();

    try {
      let dataURL = await QRCode.toDataURL(value, {
        width: size,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      // If logo is present, combine it with QR code
      if (logo) {
        try {
          dataURL = await createQRCodeWithLogo(dataURL, logo);
        } catch (error) {
          console.warn('Failed to add logo to QR code:', error);
          // Continue with original QR code without logo
        }
      }

      const base64Data = dataURL.split(",")[1];
      const rawFileSize = base64Data ? base64Data.length * 0.75 : 0;

      const endTime = performance.now();
      const endMemory = getMemoryUsage();

      const metric: GenerationMetric = {
        id,
        renderTime: sanitizeMetric(endTime - startTime),
        memoryUsage: sanitizeMetric(endMemory - startMemory),
        fileSize: sanitizeMetric(rawFileSize),
        timestamp: Date.now(),
        value,
        size,
        logo,
        dataURL,
      };

      addMetric(metric, "qrcode");
    } catch (e) {
      console.warn("GENERATE VANILLA ERROR ::", e);
    }

    waiting.current.push("qrcode");
  }, [value, size, logo, addMetric]);

  const generateReact = useCallback(async (id: string) => {
    // Skip if not on client side or renderToString not available
    if (typeof window === 'undefined' || !renderToString) {
      console.warn('renderToString not available, skipping react-qr-code generation');
      return;
    }

    const startTime = performance.now();
    const startMemory = getMemoryUsage();

    try {
      const element = createElement(QRCodeReact, {
        value,
        size,
        level: "M",
        style: {
          height: 'auto',
          maxWidth: '100%',
          width: '100%',
        },
      });

      const svg = renderToString(element);
      let dataURL = `data:image/svg+xml;base64,${btoa(svg)}`;

      // If logo is present, combine it with QR code
      if (logo) {
        try {
          dataURL = await createQRCodeWithLogo(dataURL, logo);
        } catch (error) {
          console.warn('Failed to add logo to QR code:', error);
          // Continue with original QR code without logo
        }
      }

      const rawFileSize = new Blob([dataURL]).size;
      const endTime = performance.now();
      const endMemory = getMemoryUsage();

      const metric: GenerationMetric = {
        id,
        renderTime: sanitizeMetric(endTime - startTime),
        memoryUsage: sanitizeMetric(endMemory - startMemory),
        fileSize: sanitizeMetric(rawFileSize),
        timestamp: Date.now(),
        value,
        size,
        logo,
        dataURL,
      };

      addMetric(metric, "react-qr-code");
    } catch (e) {
      console.warn("GENERATE REACT ERROR ::", e);
    }

    waiting.current.push("react-qr-code");
  }, [value, size, logo, addMetric]);

  const generateReactDot = useCallback(async (id: string) => {
    // Skip if not on client side or renderToString not available
    if (typeof window === 'undefined' || !renderToString) {
      console.warn('renderToString not available, skipping qrcode.react generation');
      return;
    }

    const startTime = performance.now();
    const startMemory = getMemoryUsage();

    try {
      const element = createElement(QRCodeSVG, {
        value,
        size,
        level: "M",
        includeMargin: true,
        fgColor: "#000000",
        bgColor: "#ffffff",
      });

      const svg = renderToString(element);
      let dataURL = `data:image/svg+xml;base64,${btoa(svg)}`;

      // If logo is present, combine it with QR code
      if (logo) {
        try {
          dataURL = await createQRCodeWithLogo(dataURL, logo);
        } catch (error) {
          console.warn('Failed to add logo to QR code:', error);
          // Continue with original QR code without logo
        }
      }

      const rawFileSize = new Blob([dataURL]).size;
      const endTime = performance.now();
      const endMemory = getMemoryUsage();

      const metric: GenerationMetric = {
        id,
        renderTime: sanitizeMetric(endTime - startTime),
        memoryUsage: sanitizeMetric(endMemory - startMemory),
        fileSize: sanitizeMetric(rawFileSize),
        timestamp: Date.now(),
        value,
        size,
        logo,
        dataURL,
      };

      addMetric(metric, "qrcode.react");
    } catch (e) {
      console.warn("GENERATE REACT DOT ERROR ::", e);
    }

    waiting.current.push("qrcode.react");
  }, [value, size, logo, addMetric]);

  const generate = useCallback(async () => {
    const items = [
      { name: "qrcode", fn: generateVanilla },
      { name: "react-qr-code", fn: generateReact },
      { name: "qrcode.react", fn: generateReactDot },
    ];
    
    loading.show({ message: `Generating QR codes... (${iterations} iterations)` });
    
    try {
      let lastId = "";

      // Run multiple iterations
      for (let i = 0; i < iterations; i++) {
        // Update progress message with percentage
        const progress = Math.round(((i + 1) / iterations) * 100);
        loading.show({ 
          message: `Generating QR codes... (${i + 1}/${iterations}) - ${progress}%` 
        });
        
        // Generate new ID for each iteration
        const id = uid();
        lastId = id;
        
        for (const item of items) {
          await generateAndWait(item.name, item.fn, id);
        }
        
        // Reset waiting array for next iteration
        waiting.current = [];
      }

      // Set the last generated ID as current
      setCurrentId(lastId);
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      loading.hide();
    }
  }, [generateVanilla, generateReact, generateReactDot, generateAndWait, setCurrentId, iterations]);

  return generate;
}