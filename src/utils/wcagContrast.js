/**
 * WCAG 2.1 Contrast Ratio & QR Code Scan Reliability Diagnostics
 */

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return { r: 0, g: 0, b: 0 };
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  if (c.length !== 6) return { r: 0, g: 0, b: 0 };
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function getRelativeLuminance({ r, g, b }) {
  const normalize = (val) => {
    const s = val / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const rLin = normalize(r);
  const gLin = normalize(g);
  const bLin = normalize(b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

export function calculateContrastRatio(fgHex, bgHex) {
  const rgb1 = hexToRgb(fgHex);
  const rgb2 = hexToRgb(bgHex);
  
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  return {
    ratio: Math.round(ratio * 100) / 100,
    fgLuminance: l1,
    bgLuminance: l2,
    isInverted: l1 > l2
  };
}

export function evaluateScanReliability({ fgColor, bgColor, size, margin, ecc, payloadData, qrError }) {
  const items = [];

  if (qrError) {
    items.push({
      type: 'error',
      title: 'Too much data',
      message: 'This text is too long to fit in a QR code. Try shortening it.'
    });
    return items;
  }

  const { ratio, isInverted } = calculateContrastRatio(fgColor, bgColor);

  if (ratio < 3.0) {
    items.push({
      type: 'error',
      title: 'Low contrast',
      message: `Contrast ratio is ${ratio}:1. Scanners won't be able to read this.`
    });
  } else if (ratio < 4.5) {
    items.push({
      type: 'warning',
      title: 'Medium contrast',
      message: `Contrast ratio is ${ratio}:1. Might be hard to scan in dim light.`
    });
  }

  if (isInverted) {
    items.push({
      type: 'warning',
      title: 'Inverted colours',
      message: 'Light QR code on a dark background. Some camera apps struggle with this.'
    });
  }

  if (margin < 2) {
    items.push({
      type: 'warning',
      title: 'Small margin',
      message: 'Margin is under 2. Cameras scan better with a bit of space around the code.'
    });
  }

  if (size < 160) {
    items.push({
      type: 'warning',
      title: 'Small size',
      message: 'Size is under 160px. Might be hard to scan when printed.'
    });
  }

  const dataLen = (payloadData || '').length;
  if (dataLen > 100 && (ecc === 'L' || ecc === 'M')) {
    items.push({
      type: 'warning',
      title: 'Low error correction',
      message: 'You have a lot of text with low error correction. Setting ECC to Q or H makes it safer.'
    });
  }

  if (dataLen > 300) {
    items.push({
      type: 'warning',
      title: 'Long data',
      message: 'The code is very detailed because of long text. Might take longer to scan.'
    });
  }

  if (items.length === 0) {
    items.push({
      type: 'success',
      title: 'Looks good',
      message: 'Good contrast and clean margin. Ready to use.'
    });
  }

  return items;
}
