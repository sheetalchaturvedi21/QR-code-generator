import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

import {
  escapeWifiString,
  formatQRData,
  validateInputs,
  isValidForm,
  calculateContrastRatio,
  evaluateScanReliability,
  getRecentQRs,
  saveRecentQR,
  deleteRecentQR,
  clearAllRecentQRs,
  formatRelativeTime
} from './utils.js';

// Mock localStorage for storage unit testing
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = new MockLocalStorage();
}

// ==========================================
// 1. QR Payload Building & Escaping Tests
// ==========================================
test('formatQRData - URL with and without https://', () => {
  assert.equal(formatQRData('url', { url: 'example.com' }), 'https://example.com');
  assert.equal(formatQRData('url', { url: 'https://mysite.com' }), 'https://mysite.com');
  assert.equal(formatQRData('url', { url: 'http://localhost:3000' }), 'http://localhost:3000');
});

test('formatQRData - Plain Text pass-through', () => {
  assert.equal(formatQRData('text', { text: 'Hello World 123' }), 'Hello World 123');
  assert.equal(formatQRData('text', { text: '<script>alert(1)</script>' }), '<script>alert(1)</script>');
});

test('formatQRData - Email mailto with and without subject/body', () => {
  assert.equal(formatQRData('email', { email: 'user@test.com' }), 'mailto:user@test.com');
  const full = formatQRData('email', {
    email: 'user@test.com',
    subject: 'Hello World',
    body: 'How are you?'
  });
  assert.equal(full, 'mailto:user@test.com?subject=Hello%20World&body=How%20are%20you%3F');
});

test('formatQRData - Phone tel with spaces, dashes, parentheses', () => {
  const result = formatQRData('phone', { phone: '+91 (987) 654-3210' });
  assert.equal(result, 'tel:+919876543210');
});

test('formatQRData - Wi-Fi WPA / WEP / nopass / hidden', () => {
  const wpa = formatQRData('wifi', { ssid: 'Home', password: 'secretpassword', security: 'WPA', hidden: false });
  assert.equal(wpa, 'WIFI:T:WPA;S:Home;P:secretpassword;H:false;;');

  const wep = formatQRData('wifi', { ssid: 'Office', password: 'wepkey12345', security: 'WEP', hidden: true });
  assert.equal(wep, 'WIFI:T:WEP;S:Office;P:wepkey12345;H:true;;');

  const nopass = formatQRData('wifi', { ssid: 'OpenCafe', password: 'ignored', security: 'none', hidden: false });
  assert.equal(nopass, 'WIFI:T:nopass;S:OpenCafe;P:;H:false;;');
});

test('formatQRData - Wi-Fi character escaping for \\ ; , : "', () => {
  const escaped = escapeWifiString('SSID\\;,: "');
  assert.equal(escaped, 'SSID\\\\\\;\\,\\:\\ \\"'.replace('\\ ', ' '));

  const wifiPayload = formatQRData('wifi', {
    ssid: 'Net\\:5G;',
    password: 'pass\\,word"',
    security: 'WPA',
    hidden: true
  });
  assert.equal(wifiPayload, 'WIFI:T:WPA;S:Net\\\\\\:5G\\;;P:pass\\\\\\,word\\";H:true;;');
});

// ==========================================
// 2. Regression Tests
// ==========================================
test('Regression - Wi-Fi nopass produces P:;', () => {
  const res = formatQRData('wifi', { ssid: 'Guest', security: 'none' });
  assert.ok(res.includes('P:;'));
});

test('Regression - Localhost and IP URLs are valid', () => {
  assert.equal(isValidForm(validateInputs('url', { url: 'localhost' })), true);
  assert.equal(isValidForm(validateInputs('url', { url: 'http://localhost:8080' })), true);
  assert.equal(isValidForm(validateInputs('url', { url: '127.0.0.1' })), true);
});

test('Regression - ftp:// gets its own error message', () => {
  const err = validateInputs('url', { url: 'ftp://files.example.com' });
  assert.equal(err.url, 'FTP URLs are not supported');
});

test('Regression - Malformed hex colours do not produce NaN', () => {
  const res = calculateContrastRatio('#xyz', '#12345');
  assert.ok(!isNaN(res.ratio));
  assert.ok(res.ratio >= 1);
});

test('Regression - Favicon stroke color in index.html is #2563eb', () => {
  const indexPath = path.join(process.cwd(), 'index.html');
  const htmlContent = fs.readFileSync(indexPath, 'utf-8');
  assert.ok(htmlContent.includes('%232563eb'), 'index.html SVG favicon stroke must be %232563eb');
});

// ==========================================
// 3. Validation Rules & Exact Boundaries
// ==========================================
test('validateInputs - Whitespace-only input validation', () => {
  assert.equal(isValidForm(validateInputs('text', { text: '   ' })), false);
  assert.equal(isValidForm(validateInputs('url', { url: '   ' })), false);
  assert.equal(isValidForm(validateInputs('email', { email: '   ' })), false);
});

test('validateInputs - Phone digit boundaries (6 vs 7 vs 15 vs 16)', () => {
  // 6 digits -> Invalid
  assert.equal(validateInputs('phone', { phone: '123456' }).phone, 'Phone number must contain at least 7 digits');
  // 7 digits -> Valid
  assert.equal(isValidForm(validateInputs('phone', { phone: '1234567' })), true);
  // 15 digits -> Valid (E.164 max)
  assert.equal(isValidForm(validateInputs('phone', { phone: '123456789012345' })), true);
  // 16 digits -> Invalid
  assert.ok(validateInputs('phone', { phone: '1234567890123456' }).phone.includes('15 digits'));
  // Phone containing letters -> Invalid
  assert.equal(validateInputs('phone', { phone: '1234567a' }).phone, 'Phone number cannot contain letters');
});

test('validateInputs - WPA Password boundaries (7 vs 8 vs 63 vs 64)', () => {
  // 7 chars -> Invalid for WPA
  assert.equal(validateInputs('wifi', { ssid: 'Net', security: 'WPA', password: '1234567' }).password, 'WPA/WPA2 password must be at least 8 characters');
  // 8 chars -> Valid
  assert.equal(isValidForm(validateInputs('wifi', { ssid: 'Net', security: 'WPA', password: '12345678' })), true);
  // 63 & 64 chars -> Valid
  assert.equal(isValidForm(validateInputs('wifi', { ssid: 'Net', security: 'WPA', password: 'x'.repeat(63) })), true);
  assert.equal(isValidForm(validateInputs('wifi', { ssid: 'Net', security: 'WPA', password: 'x'.repeat(64) })), true);
});

test('validateInputs - WEP Password boundary (4 vs 5 chars)', () => {
  // 4 chars -> Invalid for WEP
  assert.equal(validateInputs('wifi', { ssid: 'Net', security: 'WEP', password: '1234' }).password, 'WEP password must be at least 5 characters');
  // 5 chars -> Valid
  assert.equal(isValidForm(validateInputs('wifi', { ssid: 'Net', security: 'WEP', password: '12345' })), true);
});

// ==========================================
// 4. Contrast Ratio & Scan Diagnostics
// ==========================================
test('calculateContrastRatio - Black on White = 21, Same colour = 1', () => {
  const bw = calculateContrastRatio('#000000', '#ffffff');
  assert.equal(bw.ratio, 21);

  const same = calculateContrastRatio('#ffffff', '#ffffff');
  assert.equal(same.ratio, 1);
});

test('evaluateScanReliability - All warning conditions', () => {
  // Low contrast (< 3.0)
  const low = evaluateScanReliability({ fgColor: '#cccccc', bgColor: '#ffffff', size: 256, margin: 4, ecc: 'M', payloadData: 'https://example.com' });
  assert.ok(low.some(i => i.type === 'error' && i.title === 'Low contrast'));

  // Medium contrast (3.0 <= ratio < 4.5)
  const med = evaluateScanReliability({ fgColor: '#888888', bgColor: '#ffffff', size: 256, margin: 4, ecc: 'M', payloadData: 'https://example.com' });
  assert.ok(med.some(i => i.type === 'warning' && i.title === 'Medium contrast'));

  // Inverted colours
  const inv = evaluateScanReliability({ fgColor: '#ffffff', bgColor: '#000000', size: 256, margin: 4, ecc: 'M', payloadData: 'https://example.com' });
  assert.ok(inv.some(i => i.title === 'Inverted colours'));

  // Small margin (< 2)
  const smallMargin = evaluateScanReliability({ fgColor: '#000000', bgColor: '#ffffff', size: 256, margin: 1, ecc: 'M', payloadData: 'https://example.com' });
  assert.ok(smallMargin.some(i => i.title === 'Small margin'));

  // Small size (< 160)
  const smallSize = evaluateScanReliability({ fgColor: '#000000', bgColor: '#ffffff', size: 128, margin: 4, ecc: 'M', payloadData: 'https://example.com' });
  assert.ok(smallSize.some(i => i.title === 'Small size'));

  // Low ECC with long data
  const lowEccLong = evaluateScanReliability({ fgColor: '#000000', bgColor: '#ffffff', size: 256, margin: 4, ecc: 'L', payloadData: 'x'.repeat(150) });
  assert.ok(lowEccLong.some(i => i.title === 'Low error correction'));

  // Too much data error
  const overflow = evaluateScanReliability({ fgColor: '#000000', bgColor: '#ffffff', size: 256, margin: 4, ecc: 'M', payloadData: 'x', qrError: 'Buffer overflow' });
  assert.ok(overflow.some(i => i.type === 'error' && i.title === 'Too much data'));

  // Clean
  const clean = evaluateScanReliability({ fgColor: '#000000', bgColor: '#ffffff', size: 256, margin: 4, ecc: 'M', payloadData: 'https://example.com' });
  assert.equal(clean.length, 1);
  assert.equal(clean[0].type, 'success');
});

// ==========================================
// 5. Storage Tests
// ==========================================
test('Storage - saving, max 10 items, duplicates move to top, delete, clearAll & corrupted JSON', () => {
  localStorage.clear();

  // Save 12 items
  for (let i = 1; i <= 12; i++) {
    saveRecentQR({ formattedData: `https://site${i}.com`, type: 'url' });
  }
  const list = getRecentQRs();
  assert.equal(list.length, 10);
  assert.equal(list[0].formattedData, 'https://site12.com');

  // Move duplicate to top
  saveRecentQR({ formattedData: 'https://site5.com', type: 'url' });
  const updatedList = getRecentQRs();
  assert.equal(updatedList.length, 10);
  assert.equal(updatedList[0].formattedData, 'https://site5.com');

  // Delete single item
  const afterDelete = deleteRecentQR(updatedList[0].id);
  assert.equal(afterDelete.length, 9);
  assert.notEqual(afterDelete[0].formattedData, 'https://site5.com');

  // Clear all
  const afterClear = clearAllRecentQRs();
  assert.equal(afterClear.length, 0);

  // Corrupted JSON returns empty array without throwing
  localStorage.setItem('qr_designer_recent_history_v1', '{corrupted_json_syntax');
  assert.deepEqual(getRecentQRs(), []);

  // Format relative time test
  assert.equal(formatRelativeTime(Date.now()), 'just now');
});

// ==========================================
// 6. Round-Trip Decoder Tests (jsQR + PNG)
// ==========================================
test('Round-trip - Generate QR and decode with jsQR for all 5 types', async () => {
  const payloads = [
    { type: 'url', data: { url: 'https://example.com/path?a=1#sec' }, expected: 'https://example.com/path?a=1#sec' },
    { type: 'text', data: { text: 'Hello Unicode 🚀 नमस्ते' }, expected: 'Hello Unicode 🚀 नमस्ते' },
    { type: 'email', data: { email: 'user@test.com', subject: 'Subject Line', body: 'Body' }, expected: 'mailto:user@test.com?subject=Subject%20Line&body=Body' },
    { type: 'phone', data: { phone: '+91 (987) 654-3210' }, expected: 'tel:+919876543210' },
    { type: 'wifi', data: { ssid: 'Home:WiFi;', password: 'secret,pass"', security: 'WPA', hidden: false }, expected: 'WIFI:T:WPA;S:Home\\:WiFi\\;;P:secret\\,pass\\";H:false;;' }
  ];

  for (const item of payloads) {
    const formatted = formatQRData(item.type, item.data);
    assert.equal(formatted, item.expected);

    const dataUrl = await QRCode.toDataURL(formatted, {
      width: 256,
      margin: 4,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    });

    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const png = PNG.sync.read(buffer);

    const code = jsQR(Uint8ClampedArray.from(png.data), png.width, png.height);
    assert.ok(code, `jsQR failed to decode QR for ${item.type}`);
    assert.equal(code.data, item.expected, `Decoded text mismatch for ${item.type}`);
  }
});
