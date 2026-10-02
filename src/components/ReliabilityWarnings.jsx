import React from 'react';
import { evaluateScanReliability } from '../utils/wcagContrast';

export default function ReliabilityWarnings({ options, payloadData, qrError, isValid }) {
  if (!isValid || !payloadData) {
    return null;
  }

  const diagnostics = evaluateScanReliability({
    fgColor: options.fgColor,
    bgColor: options.bgColor,
    size: options.size,
    margin: options.margin,
    ecc: options.ecc,
    payloadData,
    qrError
  });

  const problemsOnly = diagnostics.filter(item => item.type === 'error' || item.type === 'warning');

  return (
    <div className="warnings-container">
      <h4 className="warnings-title">Warnings</h4>

      {problemsOnly.length === 0 ? (
        <p className="no-problems-text">No scan problems found.</p>
      ) : (
        <div className="warnings-list">
          {problemsOnly.map((item, idx) => (
            <div key={idx} className={`warning-line type-${item.type}`}>
              <span className="dot-mark">•</span>
              <span className="warning-text">{item.title}: {item.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
