/**
 * Validation utilities for QR code inputs.
 * Returns an object mapping field names to error message strings (or empty string if valid).
 */

export function validateInputs(type, data) {
  const errors = {};

  if (!data) return { general: 'No data provided' };

  switch (type) {
    case 'url': {
      const url = (data.url || '').trim();
      if (!url) {
        errors.url = 'URL is required';
      } else if (/^ftp:\/\//i.test(url)) {
        errors.url = 'FTP URLs are not supported';
      } else {
        const fullUrl = /^https?:\/\//i.test(url) ? url : 'https://' + url;
        try {
          const parsed = new URL(fullUrl);
          const hostname = parsed.hostname;
          const isLocalhost = hostname === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
          
          if (!hostname || (!hostname.includes('.') && !isLocalhost)) {
            errors.url = 'Please enter a valid web domain or URL (e.g. example.com)';
          }
        } catch {
          errors.url = 'Please enter a valid web domain or URL (e.g. example.com)';
        }
      }
      break;
    }

    case 'text': {
      const text = (data.text || '').trim();
      if (!text) {
        errors.text = 'Plain text content cannot be empty';
      }
      break;
    }

    case 'email': {
      const email = (data.email || '').trim();
      if (!email) {
        errors.email = 'Email address is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.email = 'Please enter a valid email address (e.g. name@example.com)';
        }
      }
      break;
    }

    case 'phone': {
      const phone = (data.phone || '').trim();
      if (!phone) {
        errors.phone = 'Phone number is required';
      } else if (/[a-zA-Z]/.test(phone)) {
        errors.phone = 'Phone number cannot contain letters';
      } else {
        const digitsOnly = phone.replace(/\D/g, '');
        if (digitsOnly.length < 7) {
          errors.phone = 'Phone number must contain at least 7 digits';
        } else if (digitsOnly.length > 15) {
          errors.phone = 'Phone number must be 15 digits or fewer (E.164)';
        }
      }
      break;
    }

    case 'wifi': {
      const ssid = (data.ssid || '').trim();
      const security = data.security || 'WPA';
      const password = data.password || '';

      if (!ssid) {
        errors.ssid = 'Wi-Fi network name (SSID) is required';
      }

      if (security === 'WPA') {
        if (!password) {
          errors.password = 'Password is required for secured network';
        } else if (password.length < 8) {
          errors.password = 'WPA/WPA2 password must be at least 8 characters';
        }
      } else if (security === 'WEP') {
        if (!password) {
          errors.password = 'Password is required for secured network';
        } else if (password.length < 5) {
          errors.password = 'WEP password must be at least 5 characters';
        }
      }
      break;
    }

    default:
      break;
  }

  return errors;
}

export function isValidForm(errors) {
  return Object.keys(errors).length === 0;
}
