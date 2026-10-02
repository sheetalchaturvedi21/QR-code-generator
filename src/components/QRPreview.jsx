import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

export default function QRPreview({
  activeType,
  formattedData,
  isValid,
  options,
  onQRError,
  onGeneratedSuccess,
  showToast
}) {
  const canvasRef = useRef(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    if (!isValid || !formattedData) {
      setRenderError(null);
      onQRError(null);
      return;
    }

    setIsRendering(true);

    const qrOpts = {
      width: options.size,
      margin: options.margin,
      color: {
        dark: options.fgColor,
        light: options.bgColor
      },
      errorCorrectionLevel: options.ecc
    };

    QRCode.toCanvas(canvasRef.current, formattedData, qrOpts, (err) => {
      if (!isMounted) return;
      setIsRendering(false);
      
      if (err) {
        setRenderError(err.message || 'Error generating QR code');
        onQRError(err.message || 'Error generating QR code');
      } else {
        setRenderError(null);
        onQRError(null);
        if (canvasRef.current) {
          const dataUrl = canvasRef.current.toDataURL('image/png');
          onGeneratedSuccess(dataUrl);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [formattedData, isValid, options.size, options.margin, options.fgColor, options.bgColor, options.ecc]);

  const handleDownloadPNG = () => {
    if (!isValid || renderError || !canvasRef.current) return;

    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      const timeStr = new Date().toISOString().slice(0, 10);
      link.download = `qrcode-${activeType}-${timeStr}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('PNG downloaded!', 'success');
    } catch (e) {
      showToast('Failed to download PNG', 'error');
    }
  };

  const handleDownloadSVG = () => {
    if (!isValid || renderError || !formattedData) return;

    const qrOpts = {
      type: 'svg',
      width: options.size,
      margin: options.margin,
      color: {
        dark: options.fgColor,
        light: options.bgColor
      },
      errorCorrectionLevel: options.ecc
    };

    QRCode.toString(formattedData, qrOpts, (err, svgString) => {
      if (err || !svgString) {
        showToast('Failed to generate SVG', 'error');
        return;
      }
      try {
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timeStr = new Date().toISOString().slice(0, 10);
        link.download = `qrcode-${activeType}-${timeStr}.svg`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('SVG downloaded!', 'success');
      } catch (e) {
        showToast('Download SVG failed', 'error');
      }
    });
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current || !isValid) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          showToast('Could not copy image to clipboard', 'error');
          return;
        }
        try {
          if (!navigator.clipboard || !navigator.clipboard.write) {
            showToast('Clipboard access is restricted by your browser', 'error');
            return;
          }
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showToast('Image copied to clipboard', 'info');
        } catch (err) {
          showToast('Clipboard permission blocked by browser', 'error');
        }
      });
    } catch (e) {
      showToast('Could not copy image to clipboard', 'error');
    }
  };

  return (
    <div className="preview-container">
      <div className="canvas-wrapper-direct">
        <canvas
          ref={canvasRef}
          aria-label="QR Code preview"
          role="img"
          className={`qr-canvas-direct ${!isValid || renderError ? 'canvas-hidden' : ''}`}
          style={{ maxWidth: '100%', height: 'auto' }}
        />

        {(!isValid || !formattedData) && (
          <div className="dashed-placeholder">
            <p className="placeholder-text">Enter something to see your QR code</p>
          </div>
        )}

        {renderError && (
          <div className="canvas-error">
            <p className="error-title">Could not render QR code</p>
            <p className="error-detail">{renderError}</p>
          </div>
        )}
      </div>

      <div className="button-row">
        <button
          type="button"
          className="btn-primary"
          onClick={handleDownloadPNG}
          disabled={!isValid || !!renderError || !formattedData}
        >
          Download PNG
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={handleDownloadSVG}
          disabled={!isValid || !!renderError || !formattedData}
        >
          Download SVG
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={handleCopyImage}
          disabled={!isValid || !!renderError || !formattedData}
        >
          Copy image
        </button>
      </div>
    </div>
  );
}
