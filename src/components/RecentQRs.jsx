import React from 'react';
import { formatRelativeTime } from '../utils/storage';

export default function RecentQRs({ recentList, onLoadRecent, onDeleteRecent, onClearAll }) {
  if (!recentList || recentList.length === 0) {
    return (
      <div className="recent-section">
        <h4 className="section-title">Recent codes</h4>
        <p className="empty-text">No recent QR codes saved yet.</p>
      </div>
    );
  }

  const formatTypeLabel = (t) => {
    if (!t) return '';
    const lower = t.toLowerCase();
    if (lower === 'url') return 'URL';
    if (lower === 'wifi') return 'Wi-Fi';
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  const getContentDisplay = (item) => {
    if (!item) return '';
    if (item.type === 'wifi') {
      const ssid = item.rawInputs?.ssid || '';
      return ssid ? `SSID: ${ssid}` : 'Wi-Fi Network';
    }
    return item.formattedData || '';
  };

  const truncateContent = (str, len = 30) => {
    if (!str) return '';
    if (str.length <= len) return str;
    return str.substring(0, len) + '...';
  };

  return (
    <div className="recent-section">
      <div className="flex-between margin-bottom-sm">
        <h4 className="section-title">Recent codes ({recentList.length})</h4>
        <button type="button" className="btn-text-action danger" onClick={onClearAll}>
          Clear all
        </button>
      </div>

      <div className="recent-horizontal-list">
        {recentList.map((item) => {
          const displayContent = getContentDisplay(item);
          return (
            <div key={item.id} className="recent-inline-item">
              <div
                className="recent-thumb-plain"
                onClick={() => onLoadRecent(item)}
                title={`Click to load: ${displayContent}`}
              >
                {item.dataUrl ? (
                  <img src={item.dataUrl} alt={item.type} className="recent-img" />
                ) : (
                  <span className="recent-fallback">QR</span>
                )}
              </div>

              <div className="recent-meta" onClick={() => onLoadRecent(item)} style={{ cursor: 'pointer' }}>
                <span className="recent-type-label">{formatTypeLabel(item.type)}</span>
                <span className="recent-snippet" title={displayContent}>
                  {truncateContent(displayContent, 30)}
                </span>
                <span className="recent-time-rel">{formatRelativeTime(item.timestamp)}</span>
              </div>

              <button
                type="button"
                className="btn-icon-delete"
                onClick={() => onDeleteRecent(item.id)}
                title="Delete"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
