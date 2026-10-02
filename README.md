# QR Code Generator

A lightweight, high-performance, browser-based QR Code Generator and Designer built with React, Vite, Plain JavaScript, and Vanilla CSS. Operates 100% client-side with zero backend dependencies.

---

## 🚀 Features

- **5 QR Types**: Website URL (auto `https://`), Plain Text, Email (`mailto:` with subject & body), Phone (`tel:` with clean digits), and Wi-Fi (`WIFI:T:...;S:...;P:...;H:...;;` with special character escaping).
- **Validation**: Real-time validation with field-level touched state tracking. Displays clear error notices below fields and disables export buttons while inputs are invalid.
- **Customization & Presets**: Custom size (128-512px), quiet zone margin (0-10 modules), Error Correction Levels (L, M, Q, H), color pickers, and 6 preset color dots.
- **Scan Reliability Engine**: Real-time WCAG contrast ratio calculation, inverted color check, margin/size legibility warnings, and data overflow detection.
- **Exports**: Pixel-matched PNG export, vector SVG download, and direct image copying to clipboard.
- **Recent History**: 1.5-second debounced `localStorage` saving last 10 designs with thumbnail previews (Wi-Fi passwords hidden).
- **Accessibility & Themes**: Light & Dark mode supporting system preference, keyboard tab navigation, and `aria-label` tags.

---

## 💻 Local Development

### Installation
```bash
npm install
```

### Run Local Dev Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Run Unit Tests
```bash
npm test
```
Executes Node.js test runner covering formatting, Wi-Fi character escaping, validation rules, WCAG contrast calculations, and diagnostics warnings.

### Production Build
```bash
npm run build
```
Generates static assets in the `dist/` directory.

---

## 🌐 Deployment Instructions

### Deploy to Vercel
1. Push repository to GitHub/GitLab.
2. Import project into Vercel dashboard.
3. Vercel automatically detects the **Vite** framework preset.
4. Click **Deploy**.

### Deploy to Netlify
1. Connect your repository to Netlify.
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Click **Deploy site**.
