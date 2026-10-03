# QR Code Generator

A QR code generator I built with React and Vite. It runs fully in the browser, with no backend.

Live demo: https://qr-code-generator-one-ivory.vercel.app

## Features

- 5 QR types: URL, Text, Email, Phone, and Wi-Fi, each with its own inputs
- Live preview that updates as you type or change settings
- Custom colour, size, margin, and error correction level
- 6 colour presets
- Download as PNG or SVG (the file matches the preview)
- Copy the QR image to the clipboard
- Input validation with clear error messages under each field
- Scan reliability warnings for contrast, inverted colours, size, margin, and amount of data
- Recent codes saved in localStorage, reusable with one click, and kept after a refresh
- Dark and light theme toggle
- Welcome intro typing animation (plays once per session, can be skipped)

## Tech used

- React 19
- Vite
- qrcode (npm package) for generating the code
- Plain CSS with variables for the light and dark themes

## How it works

1. You pick a type and fill in the fields. The input is checked first, and errors only show once you have touched a field.
2. The text that goes inside the QR is built from your input: https:// is added to URLs if missing, email becomes a mailto: link, phone becomes tel:, and Wi-Fi becomes the WIFI:T:...;S:...;P:...;; format with special characters escaped.
3. The qrcode library draws it on a canvas. Size, colours, margin, and error correction are passed straight in, so the preview updates instantly.
4. The reliability checker works out the contrast ratio between the two colours and checks the margin, size, and data length, then shows warnings if the code may not scan.
5. PNG download uses the canvas, SVG download uses the library's SVG output, so both match the preview.
6. After about 1.5 seconds without changes, the code is saved to localStorage (latest 10, duplicates move to the top). Wi-Fi entries only show the network name, never the password.

## Project structure

    src/
      components/   UI pieces (type selector, form inputs, design controls, preview, warnings, recent codes, toast, intro)
      utils/        QR text builder, validators, contrast check, localStorage helpers
      App.jsx       puts everything together and holds the state
      index.css     all styles, including the dark theme
    TESTING.md      manual test checklist

## Run it locally

Install dependencies:

    npm install

Start the dev server:

    npm run dev

## Tests

    npm test

The tests cover the QR text for all 5 types, validation rules, contrast and warning logic, and a round trip that decodes generated codes with jsQR to confirm they actually scan. Lint and build checks:

    npm run lint
    npm run build

## Deployment

Deployed on Vercel from this GitHub repository using the build command npm run build and output directory dist.

## What I'd add next

- Logo in the centre of the QR code
- Gradient QR codes
- Custom dot patterns
