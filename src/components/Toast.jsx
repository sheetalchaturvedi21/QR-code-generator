import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-container toast-${type}`}>
      <span className="toast-text">{message}</span>
      <button type="button" className="toast-close" onClick={onClose}>
        &times;
      </button>
    </div>
  );
}
