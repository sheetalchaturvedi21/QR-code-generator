# Manual Testing Checklist

Use this checklist to manually verify every capability of the **QR Code Generator** web application.

---

## 1. QR Types & Payloads
- [x] **Website URL**:
  - Enter `example.com`. Verify auto-prepend of `https://` in live preview payload.
  - Enter `https://mysite.org`. Verify payload matches `https://mysite.org`.
- [x] **Plain Text**:
  - Enter multiline text. Verify raw string rendering.
- [x] **Email**:
  - Enter `user@domain.com`, subject `Hello`, body `Testing`.
  - Verify payload: `mailto:user@domain.com?subject=Hello&body=Testing`.
- [x] **Phone**:
  - Enter `+91 (987) 654-3210`.
  - Verify payload: `tel:+919876543210`.
- [x] **Wi-Fi**:
  - Enter SSID `MyNet:5G;`, Password `pass,word"`, Security `WPA`.
  - Verify escaped payload: `WIFI:T:WPA;S:MyNet\:5G\;;P:pass\,word\";H:false;;`.
  - Select "No password". Verify password input disappears and payload matches `WIFI:T:nopass;S:MyNet\:5G\;;P:;H:false;;`.

---

## 2. Validation & Touched Field State
- [x] **Touched Field Tracking**:
  - Errors display under input fields in plain red text **only after** user focuses out or edits the field.
- [x] **URL Field**:
  - Empty field $\to$ Error: `"URL is required"`.
  - Type `not a url` $\to$ Error: `"Please enter a valid web domain or URL (e.g. example.com)"`.
  - Type `ftp://x.com` $\to$ Error: `"FTP URLs are not supported"`.
  - Type `example.com` $\to$ Valid state.
- [x] **Email Field**:
  - Type `abc` or `abc@` $\to$ Error: `"Please enter a valid email address (e.g. name@example.com)"`.
- [x] **Phone Field**:
  - Type `12ab` $\to$ Error: `"Phone number cannot contain letters"`.
  - Type `12345` $\to$ Error: `"Phone number must contain at least 7 digits"`.
- [x] **Wi-Fi Fields**:
  - Empty SSID $\to$ Error: `"Wi-Fi network name (SSID) is required"`.
  - Password $< 8$ chars under WPA $\to$ Error: `"WPA/WPA2 password must be at least 8 characters"`.
- [x] **Invalid Form Fallback**:
  - Download buttons disabled.
  - Preview area displays dashed box: `"Enter something to see your QR code"`.

---

## 3. Customization & Presets
- [x] **Presets**: Click round color dots. Verify colors update while input data remains intact. Active dot displays 2px blue outline.
- [x] **Reset**: Click "Reset". Verify size resets to `256px`, margin to `4 modules`, ECC to `M`, and colors to default.
- [x] **Sliders & Units**: Test number inputs alongside sliders (`px` and `modules`).

---

## 4. Export & Download Matching
- [x] **PNG Download**: Click "Download PNG". Open image and verify dimensions, colors, and margins match preview exactly.
- [x] **SVG Download**: Click "Download SVG". Open vector SVG and verify scaling and crisp resolution.
- [x] **Copy Image**: Click "Copy image". Verify toast feedback notice.

---

## 5. Scan Reliability Warnings
- [x] **Low Contrast**: Set foreground `#cccccc` on background `#ffffff`. Verify red warning line: `"Low contrast (1.6:1)..."`.
- [x] **Inverted Colors**: Set foreground `#ffffff` on background `#000000`. Verify warning: `"Inverted colours..."`.
- [x] **Margin / Size**: Set margin `1` or size `128px`. Verify corresponding warning lines.
- [x] **Clean State**: Reset options. Verify green text: `"No scan problems found."`.

---

## 6. Persistence & History
- [x] **Auto-Save**: Edit form. Wait 1.5 seconds. Verify new entry appears in bottom "Recent codes" list.
- [x] **Duplicates**: Edit existing payload. Verify item moves to top of list instead of duplicating.
- [x] **Wi-Fi Security**: Verify Wi-Fi items show SSID only (`SSID: MyNet`), never exposing passwords.
- [x] **Refresh**: Reload page. Verify recent items and dark/light theme preference persist via `localStorage`.

---

## 7. Responsiveness & Accessibility
- [x] **Desktop (1440px)**: 2-column layout with sticky right preview column.
- [x] **Tablet (768px)**: Responsive columns and clean spacing.
- [x] **Mobile (375px)**: Single column stack, buttons wrap vertically, zero horizontal scrolling.
- [x] **Accessibility**: Verify tab navigation and `aria-label="QR Code preview"` on canvas element.
