import React from 'react';

const TYPES = [
  { id: 'url', label: 'URL' },
  { id: 'text', label: 'Text' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'wifi', label: 'Wi-Fi' }
];

export default function TypeSelector({ activeType, onChangeType }) {
  return (
    <div className="type-selector">
      <div className="type-tabs">
        {TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`tab-button ${activeType === type.id ? 'active' : ''}`}
            onClick={() => onChangeType(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}
