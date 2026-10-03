# QR Code Generator

A QR code generator I built with React and Vite. It runs fully in the browser, with no backend.

Live demo: https://qr-code-generator-one-ivory.vercel.app

## Screenshot

![screenshot](screenshot.png)

## Features

- 5 QR types: URL, Text, Email, Phone, and Wi-Fi
- Live preview that updates as you type or change settings
- Custom colour, size, margin, and error correction settings
- 6 colour presets
- Download as PNG or SVG
- Copy QR image directly to clipboard
- Input validation with clear error messages under fields
- Scan reliability warnings for contrast, size, margin, and data length
- Recent QR codes saved in localStorage
- Dark and light theme toggle
- Welcome intro typing animation

## Tech used

- React
- Vite
- qrcode library
- Plain CSS

## Run it locally

Install dependencies:
```bash
npm install
```

Start the dev server:
```bash
npm run dev
```

## Tests

Run the test suite:
```bash
npm test
```

## Deployment

Deployed on Vercel from this GitHub repository using the build command `npm run build` and output directory `dist`.

## What I'd add next

- Logo in the centre of the QR code
- Gradient QR codes
- Custom dot patterns
