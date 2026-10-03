import React, { useState } from 'react';

const BUILTIN_PRESETS = [
  { id: 'classic', name: 'Classic', fg: '#0f172a', bg: '#ffffff' },
  { id: 'ocean',   name: 'Ocean',   fg: '#0284c7', bg: '#f0f9ff' },
  { id: 'forest',  name: 'Forest',  fg: '#15803d', bg: '#f0fdf4' },
  { id: 'sunset',  name: 'Sunset',  fg: '#b91c1c', bg: '#fff1f2' },
  { id: 'berry',   name: 'Berry',   fg: '#7e22ce', bg: '#faf5ff' },
  { id: 'slate',   name: 'Slate',   fg: '#334155', bg: '#f8fafc' }
];

const DEFAULT_OPTIONS = {
  size: 256,
  margin: 4,
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  ecc: 'M'
};

const CUSTOM_PRESETS_KEY = 'qr_custom_presets_v1';

/** Return true if `hex` is a complete, valid CSS hex colour (#rgb or #rrggbb). */
function isValidHex(hex) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

function loadCustomPresets() {
  try {
    const raw = localStorage.getItem(CUSTOM_PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveCustomPresets(list) {
  try {
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export default function DesignerControls({ options, setOptions }) {
  // Local draft state for hex text inputs so partial typing (e.g. "#1", "#12")
  // never feeds an invalid colour into the QR renderer.
  // We track whether each input is currently focused via refs so we can
  // revert to the committed option value on blur without a useEffect.
  const [fgDraft, setFgDraft] = useState(options.fgColor);
  const [bgDraft, setBgDraft] = useState(options.bgColor);
  const [fgEditing, setFgEditing] = useState(false);
  const [bgEditing, setBgEditing] = useState(false);

  const [customPresets, setCustomPresets] = useState(loadCustomPresets);
  const [newPresetName, setNewPresetName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  // Called by colour picker (native picker always emits valid 7-char hex)
  const handleColorPickerChange = (key, setter, value) => {
    setter(value);
    handleOptionChange(key, value);
  };

  // Called by hex text input — only commit to options when fully valid
  const handleHexTextChange = (key, setter, value) => {
    setter(value);
    if (isValidHex(value)) {
      handleOptionChange(key, value);
    }
  };

  // On blur, if draft is invalid revert it to the last good committed value
  const handleHexBlur = (optionValue, isFg, setter) => {
    (isFg ? setFgEditing : setBgEditing)(false);
    if (!isValidHex(isFg ? fgDraft : bgDraft)) {
      setter(optionValue);
    }
  };

  const applyPreset = (preset) => {
    setFgDraft(preset.fg);
    setBgDraft(preset.bg);
    setOptions((prev) => ({ ...prev, fgColor: preset.fg, bgColor: preset.bg }));
  };

  const swapColors = () => {
    setOptions((prev) => {
      setFgDraft(prev.bgColor);
      setBgDraft(prev.fgColor);
      return { ...prev, fgColor: prev.bgColor, bgColor: prev.fgColor };
    });
  };

  const resetToDefaults = () => {
    setFgDraft(DEFAULT_OPTIONS.fgColor);
    setBgDraft(DEFAULT_OPTIONS.bgColor);
    setOptions(DEFAULT_OPTIONS);
  };

  // ---- Custom presets ----
  const handleSavePreset = () => {
    const name = newPresetName.trim();
    if (!name) return;
    const preset = {
      id: 'custom-' + Date.now(),
      name,
      fg: options.fgColor,
      bg: options.bgColor
    };
    const updated = [...customPresets, preset];
    setCustomPresets(updated);
    saveCustomPresets(updated);
    setNewPresetName('');
    setShowNameInput(false);
  };

  const handleDeleteCustomPreset = (id) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    saveCustomPresets(updated);
  };

  const allPresets = [...BUILTIN_PRESETS, ...customPresets];

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

        {/* Round Color Dots — built-in + custom */}
        <div className="presets-dots-row">
          {allPresets.map((p) => {
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

        {/* Custom preset management */}
        <div className="custom-preset-row">
          {showNameInput ? (
            <div className="custom-preset-name-row">
              <input
                type="text"
                className="text-input custom-preset-name-input"
                placeholder="Preset name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSavePreset(); if (e.key === 'Escape') setShowNameInput(false); }}
                autoFocus
                aria-label="New preset name"
              />
              <button type="button" className="btn-text-action" onClick={handleSavePreset}>Save</button>
              <button type="button" className="btn-text-action" onClick={() => setShowNameInput(false)}>Cancel</button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-text-action"
              onClick={() => setShowNameInput(true)}
              title="Save current colours as a named preset"
            >
              + Save as preset
            </button>
          )}

          {/* Delete custom presets */}
          {customPresets.length > 0 && (
            <div className="custom-preset-chips">
              {customPresets.map((p) => (
                <span key={p.id} className="custom-preset-chip">
                  <span
                    className="chip-dot"
                    style={{ background: p.fg, border: `2px solid ${p.bg}`, outline: '1px solid #ccc' }}
                  />
                  {p.name}
                  <button
                    type="button"
                    className="btn-icon-delete chip-delete"
                    onClick={() => handleDeleteCustomPreset(p.id)}
                    title={`Delete preset "${p.name}"`}
                    aria-label={`Delete preset ${p.name}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid-2col margin-top-xs">
          <div className="color-picker-group">
            <span className="color-label">Foreground</span>
            <div className="color-input-wrapper">
              <input
                type="color"
                className="color-picker"
                value={isValidHex(fgDraft) ? fgDraft : options.fgColor}
                onChange={(e) => handleColorPickerChange('fgColor', setFgDraft, e.target.value)}
                aria-label="Foreground colour picker"
              />
              <input
                type="text"
                className="hex-text-input"
                value={fgEditing ? fgDraft : options.fgColor}
                onFocus={() => { setFgEditing(true); setFgDraft(options.fgColor); }}
                onChange={(e) => handleHexTextChange('fgColor', setFgDraft, e.target.value)}
                onBlur={() => handleHexBlur(options.fgColor, true, setFgDraft)}
                aria-label="Foreground hex colour"
                maxLength={7}
              />
            </div>
          </div>

          <div className="color-picker-group">
            <span className="color-label">Background</span>
            <div className="color-input-wrapper">
              <input
                type="color"
                className="color-picker"
                value={isValidHex(bgDraft) ? bgDraft : options.bgColor}
                onChange={(e) => handleColorPickerChange('bgColor', setBgDraft, e.target.value)}
                aria-label="Background colour picker"
              />
              <input
                type="text"
                className="hex-text-input"
                value={bgEditing ? bgDraft : options.bgColor}
                onFocus={() => { setBgEditing(true); setBgDraft(options.bgColor); }}
                onChange={(e) => handleHexTextChange('bgColor', setBgDraft, e.target.value)}
                onBlur={() => handleHexBlur(options.bgColor, false, setBgDraft)}
                aria-label="Background hex colour"
                maxLength={7}
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
