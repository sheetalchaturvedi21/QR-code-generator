/**
 * Utility functions to format raw form inputs into valid QR payload strings.
 */

// Helper to escape special characters for Wi-Fi QR format (WIFI:T:...;S:...;P:...;H:...;;)
export function escapeWifiString(str = '') {
  if (!str) return '';
  return str.replace(/([\\;,:"])/g, '\\$1');
}

/**
 * Format QR input data based on type
 * @param {'url'|'text'|'email'|'phone'|'wifi'} type 
 * @param {Object} data 
 * @returns {string} Formatted string ready for QR generation
 */
export function formatQRData(type, data) {
  if (!data) return '';

  switch (type) {
    case 'url': {
      let rawUrl = (data.url || '').trim();
      if (!rawUrl) return '';
      if (!/^(https?:\/\/|ftp:\/\/)/i.test(rawUrl)) {
        rawUrl = 'https://' + rawUrl;
      }
      return rawUrl;
    }

    case 'text': {
      return data.text || '';
    }

    case 'email': {
      const address = (data.email || '').trim();
      if (!address) return '';
      const params = [];
      if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
      if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
      const queryString = params.length > 0 ? `?${params.join('&')}` : '';
      return `mailto:${address}${queryString}`;
    }

    case 'phone': {
      const phoneRaw = (data.phone || '').trim();
      if (!phoneRaw) return '';
      const cleaned = phoneRaw.replace(/[\s\-()]/g, '');
      return `tel:${cleaned}`;
    }

    case 'wifi': {
      const ssid = escapeWifiString((data.ssid || '').trim());
      const security = data.security || 'WPA';
      const password = security === 'none' ? '' : escapeWifiString((data.password || '').trim());
      const hidden = !!data.hidden;
      
      const secType = security === 'none' ? 'nopass' : security;
      return `WIFI:T:${secType};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
    }

    default:
      return '';
  }
}
