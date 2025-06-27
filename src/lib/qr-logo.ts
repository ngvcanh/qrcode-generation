/**
 * Utility functions for combining QR codes with logos
 */

export interface LogoOptions {
  logo: string; // Base64 logo data
  logoSize?: number; // Logo size as percentage of QR code (default: 0.2)
  logoMargin?: number; // Logo margin as percentage of logo size (default: 0.1)
  logoBackground?: string; // Logo background color (default: white)
  logoRounding?: number; // Logo border radius (default: 8)
}

/**
 * Combines a QR code data URL with a logo
 */
export async function combineQRCodeWithLogo(
  qrDataURL: string,
  options: LogoOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }

      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      
      qrImg.onload = () => {
        try {
          // Set canvas size to match QR code
          canvas.width = qrImg.width;
          canvas.height = qrImg.height;
          
          // Draw QR code
          ctx.drawImage(qrImg, 0, 0);
          
          // Load and draw logo
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          
          logoImg.onload = () => {
            try {
              const {
                logoSize = 0.2,
                logoMargin = 0.1,
                logoBackground = '#ffffff',
                logoRounding = 8
              } = options;
              
              // Calculate logo dimensions
              const logoSizePx = Math.min(canvas.width, canvas.height) * logoSize;
              const logoMarginPx = logoSizePx * logoMargin;
              const logoTotalSize = logoSizePx + (logoMarginPx * 2);
              
              // Calculate logo position (center)
              const x = (canvas.width - logoTotalSize) / 2;
              const y = (canvas.height - logoTotalSize) / 2;
              
              // Save context
              ctx.save();
              
              // Create rounded rectangle for logo background
              ctx.beginPath();
              ctx.roundRect(x, y, logoTotalSize, logoTotalSize, logoRounding);
              ctx.fillStyle = logoBackground;
              ctx.fill();
              
              // Add subtle shadow
              ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
              ctx.shadowBlur = 4;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 2;
              ctx.fill();
              
              // Reset shadow
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              
              // Clip to rounded rectangle for logo
              ctx.clip();
              
              // Draw logo
              ctx.drawImage(
                logoImg,
                x + logoMarginPx,
                y + logoMarginPx,
                logoSizePx,
                logoSizePx
              );
              
              // Restore context
              ctx.restore();
              
              // Convert to data URL
              const result = canvas.toDataURL('image/png', 0.9);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          };
          
          logoImg.onerror = () => reject(new Error('Failed to load logo'));
          logoImg.src = options.logo;
          
        } catch (error) {
          reject(error);
        }
      };
      
      qrImg.onerror = () => reject(new Error('Failed to load QR code'));
      qrImg.src = qrDataURL;
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Creates a canvas-based QR code with embedded logo for better integration
 */
export async function createQRCodeWithLogo(
  qrCodeDataURL: string,
  logo: string
): Promise<string> {
  try {
    const result = await combineQRCodeWithLogo(qrCodeDataURL, {
      logo,
      logoSize: 0.2, // 20% of QR code size
      logoMargin: 0.1, // 10% margin around logo
      logoBackground: '#ffffff',
      logoRounding: 8
    });
    
    return result;
  } catch (error) {
    console.warn('Failed to create QR code with logo:', error);
    // Fallback to original QR code
    return qrCodeDataURL;
  }
}
