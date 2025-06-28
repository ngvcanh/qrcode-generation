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

// Types for qr-code-styling library
interface QRCodeStylingOptions {
  width: number;
  height: number;
  type: "canvas" | "svg";
  data: string;
  margin: number;
  qrOptions: {
    typeNumber: 0;
    mode: "Byte";
    errorCorrectionLevel: "M";
  };
  dotsOptions: {
    color: string;
    type: 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
  };
  backgroundOptions: {
    color: string;
  };
  cornersSquareOptions: {
    color: string;
    type: 'dot' | 'square' | 'extra-rounded' | 'rounded' | 'dots' | 'classy' | 'classy-rounded';
  };
  cornersDotOptions: {
    color: string;
    type: 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
  };
}

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
  const { value, size, iterations, logo, styleSettings, addMetric, setCurrentId } = useQRCode();

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
        margin: styleSettings.margin,
        color: {
          dark: styleSettings.foregroundColor,
          light: styleSettings.backgroundColor,
        },
      });

      // If logo is present, combine it with QR code
      if (logo) {
        try {
          dataURL = await createQRCodeWithLogo(dataURL, logo, styleSettings);
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
  }, [value, size, logo, styleSettings, addMetric]);

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
        bgColor: styleSettings.backgroundColor,
        fgColor: styleSettings.foregroundColor,
      });

      const svg = renderToString(element);
      let dataURL = `data:image/svg+xml;base64,${btoa(svg)}`;

      // If logo is present, combine it with QR code
      if (logo) {
        try {
          dataURL = await createQRCodeWithLogo(dataURL, logo, styleSettings);
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
  }, [value, size, logo, styleSettings, addMetric]);

  const generateReactDot = useCallback(async (id: string) => {
    // Skip if not on client side or renderToString not available
    if (typeof window === 'undefined' || !renderToString) {
      console.warn('renderToString not available, skipping qrcode.react generation');
      return;
    }

    const startTime = performance.now();
    const startMemory = getMemoryUsage();

    try {
      // Note: qrcode.react only supports basic styling (colors)
      // Advanced dot/corner styles are not supported by this library
      const element = createElement(QRCodeSVG, {
        value,
        size,
        level: "M",
        includeMargin: true,
        fgColor: styleSettings.foregroundColor,
        bgColor: styleSettings.backgroundColor,
        style: { maxWidth: "100%", width: "100%" },
        marginSize: styleSettings.margin,
      });

      const svg = renderToString(element);
      let dataURL = `data:image/svg+xml;base64,${btoa(svg)}`;

      // If logo is present, combine it with QR code
      if (logo) {
        try {
          dataURL = await createQRCodeWithLogo(dataURL, logo, styleSettings);
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
  }, [value, size, logo, styleSettings, addMetric]);

  const generateStyled = useCallback(async (id: string) => {
    // Skip if not on client side
    if (typeof window === 'undefined') {
      console.warn('generateStyled: Not on client side, skipping');
      return;
    }

    const startTime = performance.now();
    const startMemory = getMemoryUsage();

    try {
      console.log('generateStyled: Starting generation...');

      // Try dynamic import with error handling
      let QRCodeStyling;
      try {
        const qrModule = await import("qr-code-styling");
        QRCodeStyling = qrModule.default;
        console.log('generateStyled: QRCodeStyling imported successfully');
      } catch (importError) {
        console.error('generateStyled: Failed to import qr-code-styling:', importError);
        return;
      }

      if (!QRCodeStyling) {
        console.error('generateStyled: QRCodeStyling is null/undefined');
        return;
      }

      console.log('generateStyled: Creating QR code with style:', styleSettings);

      // Map style settings to qr-code-styling options  
      const getDotType = (style: string): 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded' => {
        switch (style) {
          case 'circle': return 'dots';
          case 'rounded': return 'rounded';
          case 'dots': return 'dots';
          case 'star': return 'extra-rounded';
          case 'diamond': return 'classy';
          default: return 'square';
        }
      };

      const getCornerType = (style: string): 'dot' | 'square' | 'extra-rounded' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' => {
        switch (style) {
          case 'circle': return 'dot';
          case 'rounded': return 'rounded';
          default: return 'square';
        }
      };

      const dotType = getDotType(styleSettings.dotStyle);
      const cornerType = getCornerType(styleSettings.cornerStyle);
      
      console.log('QR Code Styling - Dot Style:', styleSettings.dotStyle, '-> Type:', dotType);
      console.log('QR Code Styling - Corner Style:', styleSettings.cornerStyle, '-> Type:', cornerType);
      console.log('QR Code Styling - Margin Setting:', styleSettings.margin);

      // Create QR code with advanced styling
      // qr-code-styling margin is in pixels, use the margin setting directly
      const qrCodeConfig: QRCodeStylingOptions = {
        width: size,
        height: size,
        type: "canvas" as const, // Changed to canvas for better compatibility
        data: value,
        margin: styleSettings.margin,
        qrOptions: {
          typeNumber: 0 as const,
          mode: "Byte" as const,
          errorCorrectionLevel: "M" as const
        },
        dotsOptions: {
          color: styleSettings.foregroundColor,
          type: dotType
        },
        backgroundOptions: {
          color: styleSettings.backgroundColor,
        },
        cornersSquareOptions: {
          color: styleSettings.foregroundColor,
          type: cornerType
        },
        cornersDotOptions: {
          color: styleSettings.foregroundColor,
          type: dotType
        }
      };

      console.log('generateStyled: QR code config with margin pixels:', styleSettings.margin);

      const qrCode = new QRCodeStyling(qrCodeConfig);

      console.log('generateStyled: QR code created, generating data URL...');

      // Generate as data URL using canvas (without logo first)
      let dataURL = await new Promise<string>((resolve, reject) => {
        // Create a temporary container
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        document.body.appendChild(container);
        
        try {
          qrCode.append(container);
          
          // Wait a bit for rendering
          setTimeout(() => {
            const canvas = container.querySelector('canvas');
            if (canvas) {
              const dataURL = canvas.toDataURL('image/png');
              document.body.removeChild(container);
              resolve(dataURL);
            } else {
              document.body.removeChild(container);
              reject(new Error('Canvas not found'));
            }
          }, 100);
        } catch (error) {
          document.body.removeChild(container);
          reject(error);
        }
      });

      // Add logo using our existing logo logic (if present)
      if (logo) {
        console.log('generateStyled: Adding logo using existing logo logic');
        try {
          dataURL = await createQRCodeWithLogo(dataURL, logo, styleSettings);
        } catch (error) {
          console.warn('generateStyled: Failed to add logo:', error);
          // Continue with QR code without logo
        }
      }

      console.log('generateStyled: Data URL generated successfully');

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

      console.log('generateStyled: Adding metric to store...', metric);
      addMetric(metric, "qr-code-styling");
      console.log('generateStyled: Metric added successfully');
    } catch (e) {
      console.error("GENERATE STYLED ERROR ::", e);
    }

    waiting.current.push("qr-code-styling");
  }, [value, size, logo, styleSettings, addMetric]);

  const generate = useCallback(async (packageName?: string) => {
    const allItems = [
      { name: "qrcode", fn: generateVanilla },
      { name: "react-qr-code", fn: generateReact },
      { name: "qrcode.react", fn: generateReactDot },
      { name: "qr-code-styling", fn: generateStyled },
    ];
    
    // If packageName is specified, only generate for that package
    const items = packageName 
      ? allItems.filter(item => item.name === packageName)
      : allItems;
    
    if (items.length === 0) {
      console.warn(`Package "${packageName}" not found`);
      return;
    }
    
    const isGeneratingAll = !packageName;
    const message = isGeneratingAll 
      ? `Generating QR codes... (${iterations} iterations)`
      : `Generating ${packageName}... (${iterations} iterations)`;
    
    loading.show({ message });
    
    try {
      let lastId = "";

      // Run multiple iterations
      for (let i = 0; i < iterations; i++) {
        // Update progress message with percentage
        const progress = Math.round(((i + 1) / iterations) * 100);
        const progressMessage = isGeneratingAll
          ? `Generating QR codes... (${i + 1}/${iterations}) - ${progress}%`
          : `Generating ${packageName}... (${i + 1}/${iterations}) - ${progress}%`;
        
        loading.show({ message: progressMessage });
        
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
  }, [generateVanilla, generateReact, generateReactDot, generateStyled, generateAndWait, setCurrentId, iterations]);

  return generate;
}