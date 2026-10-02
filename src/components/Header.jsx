import React from 'react';

export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="app-header">
      <div className="header-text">
        <h1 className="header-title">QR Code Generator</h1>
        <p className="header-subtitle">Make a QR code, style it, download it.</p>
      </div>
      <button 
        type="button" 
        className="btn-theme-toggle"
        onClick={onToggleTheme}
      >
        {theme === 'light' ? 'Dark mode' : 'Light mode'}
      </button>
    </header>
  );
}
