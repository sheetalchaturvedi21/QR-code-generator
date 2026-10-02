import React from 'react';

const PRESETS = [
  { id: 'classic', name: 'Classic', fg: '#0f172a', bg: '#ffffff' },
  { id: 'ocean', name: 'Ocean', fg: '#0284c7', bg: '#f0f9ff' },
  { id: 'forest', name: 'Forest', fg: '#15803d', bg: '#f0fdf4' },
  { id: 'sunset', name: 'Sunset', fg: '#b91c1c', bg: '#fff1f2' },
  { id: 'berry', name: 'Berry', fg: '#7e22ce', bg: '#faf5ff' },
  { id: 'slate', name: 'Slate', fg: '#334155', bg: '#f8fafc' }
];

const DEFAULT_OPTIONS = {
  size: 256,
  margin: 4,
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  ecc: 'M'
};

export default function DesignerControls({ options, setOptions }) {
  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset) => {
    setOptions((prev) => ({
      ...prev,
      fgColor: preset.fg,
      bgColor: preset.bg
    }));
  };

  const swapColors = () => {
    setOptions((prev) => ({
      ...prev,
      fgColor: prev.bgColor,
      bgColor: prev.fgColor
    }));
  };

  const resetToDefaults = () => {
    setOptions(DEFAULT_OPTIONS);
  };

  return (
    <div className="designer-controls-container">
      {/* Header with Reset link */}
      <div className="flex-between">
        <h3 className="section-title">Design options</h3>
        <button type="button" className="btn-text-action" onClick={resetToDefaults}>
          Reset
        </button>
      </div>

      {/* Colour Presets & Custom Colours */}
      <div className="controls-block">
        <div className="flex-between">
          <label className="input-label">Presets</label>
          <button type="button" className="btn-text-action" onClick={swapColors}>
            Swap colours
          </button>
        </div>
        
        {/* Round Color Dots */}
        <div className="presets-dots-row">
          {PRESETS.map((p) => {
            const isSelected = options.fgColor.toLowerCase() === p.fg.toLowerCase() && 
                               options.bgColor.toLowerCase() === p.bg.toLowerCase();
            return (
              <button
                key={p.id}
                type="button"
                className={`preset-dot ${isSelected ? 'selected' : ''}`}
                title={p.name}
                onClick={() => applyPreset(p)}
                style={{ backgroundColor: p.bg }}
              >
                <span className="preset-dot-inner" style={{ backgroundColor: p.fg }} />
              </button>
            );
          })}
        </div>

        <div className="grid-2col margin-top-xs">
          <div className="color-picker-group">
            <span className="color-label">Foreground</span>
            <div className="color-input-wrapper">
              <input
                type="color"
                className="color-picker"
                value={options.fgColor}
                onChange={(e) => handleOptionChange('fgColor', e.target.value)}
              />
              <input
                type="text"
                className="hex-text-input"
                value={options.fgColor}
                onChange={(e) => handleOptionChange('fgColor', e.target.value)}
              />
            </div>
          </div>

          <div className="color-picker-group">
            <span className="color-label">Background</span>
            <div className="color-input-wrapper">
              <input
                type="color"
                className="color-picker"
                value={options.bgColor}
                onChange={(e) => handleOptionChange('bgColor', e.target.value)}
              />
              <input
                type="text"
                className="hex-text-input"
                value={options.bgColor}
                onChange={(e) => handleOptionChange('bgColor', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="section-divider" />

      {/* Size & Margin Sliders */}
      <div className="grid-2col">
        <div className="controls-block">
          <div className="flex-between">
            <label htmlFor="size-slider" className="input-label">Size</label>
            <div className="input-with-unit">
              <input
                type="number"
                min="128"
                max="512"
                step="8"
                className="number-input"
                value={options.size}
                onChange={(e) => {
                  const val = Math.min(512, Math.max(128, Number(e.target.value) || 128));
                  handleOptionChange('size', val);
                }}
              />
              <span className="unit-label">px</span>
            </div>
          </div>
          <input
            id="size-slider"
            type="range"
            min="128"
            max="512"
            step="8"
            className="range-slider"
            value={options.size}
            onChange={(e) => handleOptionChange('size', Number(e.target.value))}
          />
        </div>

        <div className="controls-block">
          <div className="flex-between">
            <label htmlFor="margin-slider" className="input-label">Margin</label>
            <div className="input-with-unit">
              <input
                type="number"
                min="0"
                max="10"
                step="1"
                className="number-input"
                value={options.margin}
                onChange={(e) => {
                  const val = Math.min(10, Math.max(0, Number(e.target.value) || 0));
                  handleOptionChange('margin', val);
                }}
              />
              <span className="unit-label">modules</span>
            </div>
          </div>
          <input
            id="margin-slider"
            type="range"
            min="0"
            max="10"
            step="1"
            className="range-slider"
            value={options.margin}
            onChange={(e) => handleOptionChange('margin', Number(e.target.value))}
          />
        </div>
      </div>

      {/* Error Correction Select right under Size & Margin */}
      <div className="controls-block margin-top-xs">
        <label htmlFor="ecc-select" className="input-label">Error correction</label>
        <select
          id="ecc-select"
          className="select-input"
          value={options.ecc}
          onChange={(e) => handleOptionChange('ecc', e.target.value)}
        >
          <option value="L">Low (7%)</option>
          <option value="M">Medium (15%)</option>
          <option value="Q">Quartile (25%)</option>
          <option value="H">High (30%)</option>
        </select>
      </div>
    </div>
  );
}
