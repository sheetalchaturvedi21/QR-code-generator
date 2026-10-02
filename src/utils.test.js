import test from 'node:test';
import assert from 'node:assert/strict';

import {
  escapeWifiString,
  formatQRData,
  validateInputs,
  isValidForm,
  calculateContrastRatio,
  evaluateScanReliability
} from './utils.js';

// ==========================================
// 1. QR Payload Building & Escaping Tests
// ==========================================
test('formatQRData - URL auto prepends https:// if missing', () => {
  assert.equal(formatQRData('url', { url: 'example.com' }), 'https://example.com');
  assert.equal(formatQRData('url', { url: 'https://mysite.com' }), 'https://mysite.com');
});

test('formatQRData - Plain Text pass-through', () => {
  assert.equal(formatQRData('text', { text: 'Hello World 123' }), 'Hello World 123');
});

test('formatQRData - Email mailto formatting with URL-encoding', () => {
  const result = formatQRData('email', {
    email: 'user@test.com',
    subject: 'Hello World',
    body: 'How are you?'
  });
  assert.equal(result, 'mailto:user@test.com?subject=Hello%20World&body=How%20are%20you%3F');
});

test('formatQRData - Phone tel formatting with cleaned digits', () => {
  const result = formatQRData('phone', { phone: '+91 (987) 654-3210' });
  assert.equal(result, 'tel:+919876543210');
});

test('formatQRData - Wi-Fi string escaping and formatting', () => {
  const escaped = escapeWifiString('My\\Wifi;Net,Name:Sub"');
  assert.equal(escaped, 'My\\\\Wifi\\;Net\\,Name\\:Sub\\"');

  const wifiPayload = formatQRData('wifi', {
    ssid: 'Test:Net;',
    password: 'pass,word"',
    security: 'WPA',
    hidden: true
  });
  assert.equal(wifiPayload, 'WIFI:T:WPA;S:Test\\:Net\\;;P:pass\\,word\\";H:true;;');
});

test('formatQRData - Wi-Fi no password format', () => {
  const wifiPayload = formatQRData('wifi', {
    ssid: 'OpenNet',
    password: 'ignored',
    security: 'none',
    hidden: false
  });
  assert.equal(wifiPayload, 'WIFI:T:nopass;S:OpenNet;P:;H:false;;');
});

// ==========================================
// 2. Input Validation Tests
// ==========================================
test('validateInputs - URL validation rules', () => {
  assert.equal(isValidForm(validateInputs('url', { url: '' })), false);
  assert.equal(validateInputs('url', { url: 'not a url' }).url, 'Please enter a valid web domain or URL (e.g. example.com)');
  assert.equal(validateInputs('url', { url: 'ftp://x.com' }).url, 'FTP URLs are not supported');
  assert.equal(isValidForm(validateInputs('url', { url: 'example.com' })), true);
});

test('validateInputs - Email validation rules', () => {
  assert.equal(validateInputs('email', { email: 'abc' }).email, 'Please enter a valid email address (e.g. name@example.com)');
  assert.equal(validateInputs('email', { email: 'abc@' }).email, 'Please enter a valid email address (e.g. name@example.com)');
  assert.equal(isValidForm(validateInputs('email', { email: 'test@example.com' })), true);
});

test('validateInputs - Phone validation rules', () => {
  assert.equal(validateInputs('phone', { phone: '12ab' }).phone, 'Phone number cannot contain letters');
  assert.equal(validateInputs('phone', { phone: '12345' }).phone, 'Phone number must contain at least 7 digits');
  assert.equal(isValidForm(validateInputs('phone', { phone: '+91 98765 43210' })), true);
});

test('validateInputs - Wi-Fi validation rules', () => {
  assert.equal(validateInputs('wifi', { ssid: '' }).ssid, 'Wi-Fi network name (SSID) is required');
  assert.equal(validateInputs('wifi', { ssid: 'Home', security: 'WPA', password: 'short' }).password, 'WPA/WPA2 password must be at least 8 characters');
  assert.equal(isValidForm(validateInputs('wifi', { ssid: 'Home', security: 'WPA', password: 'validpassword123' })), true);
  assert.equal(isValidForm(validateInputs('wifi', { ssid: 'Home', security: 'none' })), true);
});

test('validateInputs - Text whitespace validation rules', () => {
  assert.equal(validateInputs('text', { text: '   ' }).text, 'Plain text content cannot be empty');
  assert.equal(isValidForm(validateInputs('text', { text: 'Valid content' })), true);
});

// ==========================================
// 3. WCAG Contrast Calculation Tests
// ==========================================
test('calculateContrastRatio - Black on White is 21:1', () => {
  const result = calculateContrastRatio('#000000', '#ffffff');
  assert.equal(result.ratio, 21);
  assert.equal(result.isInverted, false);
});

test('calculateContrastRatio - Inverted colors detection', () => {
  const result = calculateContrastRatio('#ffffff', '#000000');
  assert.equal(result.ratio, 21);
  assert.equal(result.isInverted, true);
});

// ==========================================
// 4. Scan Reliability Diagnostics Tests
// ==========================================
test('evaluateScanReliability - Diagnostics alerts', () => {
  // Low contrast (< 3.0)
  const lowContrast = evaluateScanReliability({
    fgColor: '#cccccc',
    bgColor: '#ffffff',
    size: 256,
    margin: 4,
    ecc: 'M',
    payloadData: 'https://example.com'
  });
  assert.ok(lowContrast.some(item => item.type === 'error' && item.title === 'Low contrast'));

  // Inverted colors & small size & small margin
  const warnings = evaluateScanReliability({
    fgColor: '#ffffff',
    bgColor: '#000000',
    size: 128,
    margin: 1,
    ecc: 'L',
    payloadData: 'x'.repeat(150)
  });
  assert.ok(warnings.some(item => item.title === 'Inverted colours'));
  assert.ok(warnings.some(item => item.title === 'Small margin'));
  assert.ok(warnings.some(item => item.title === 'Small size'));
  assert.ok(warnings.some(item => item.title === 'Low error correction'));

  // Clean good state
  const clean = evaluateScanReliability({
    fgColor: '#000000',
    bgColor: '#ffffff',
    size: 256,
    margin: 4,
    ecc: 'M',
    payloadData: 'https://example.com'
  });
  assert.equal(clean.length, 1);
  assert.equal(clean[0].type, 'success');
});
