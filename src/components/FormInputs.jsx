import React from 'react';

export default function FormInputs({ activeType, formData, setFormData, errors, touched, setTouched }) {

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [activeType]: {
        ...(prev[activeType] || {}),
        [field]: value
      }
    }));
  };

  const currentData = formData[activeType] || {};

  return (
    <div className="form-inputs-container">
      {activeType === 'url' && (
        <div className="input-group">
          <label htmlFor="url-input" className="input-label">
            URL
          </label>
          <input
            id="url-input"
            type="text"
            className={`text-input ${touched.url && errors.url ? 'has-error' : ''}`}
            placeholder="https://example.com"
            value={currentData.url || ''}
            onChange={(e) => handleChange('url', e.target.value)}
            onBlur={() => handleBlur('url')}
          />
          {touched.url && errors.url ? (
            <p className="field-error-msg">{errors.url}</p>
          ) : (
            <p className="field-hint">https:// will be added automatically if missing.</p>
          )}
        </div>
      )}

      {activeType === 'text' && (
        <div className="input-group">
          <label htmlFor="text-input" className="input-label">
            Text
          </label>
          <textarea
            id="text-input"
            rows="4"
            className={`text-input textarea-input ${touched.text && errors.text ? 'has-error' : ''}`}
            placeholder="Enter your text here..."
            value={currentData.text || ''}
            onChange={(e) => handleChange('text', e.target.value)}
            onBlur={() => handleBlur('text')}
          />
          {touched.text && errors.text && (
            <p className="field-error-msg">{errors.text}</p>
          )}
        </div>
      )}

      {activeType === 'email' && (
        <div className="email-inputs">
          <div className="input-group">
            <label htmlFor="email-input" className="input-label">
              Email address
            </label>
            <input
              id="email-input"
              type="email"
              className={`text-input ${touched.email && errors.email ? 'has-error' : ''}`}
              placeholder="name@example.com"
              value={currentData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
            />
            {touched.email && errors.email && (
              <p className="field-error-msg">{errors.email}</p>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="email-subject" className="input-label">
              Subject (optional)
            </label>
            <input
              id="email-subject"
              type="text"
              className="text-input"
              placeholder="Inquiry about project"
              value={currentData.subject || ''}
              onChange={(e) => handleChange('subject', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="email-body" className="input-label">
              Message (optional)
            </label>
            <textarea
              id="email-body"
              rows="3"
              className="text-input textarea-input"
              placeholder="Hi, I wanted to reach out..."
              value={currentData.body || ''}
              onChange={(e) => handleChange('body', e.target.value)}
            />
          </div>
        </div>
      )}

      {activeType === 'phone' && (
        <div className="input-group">
          <label htmlFor="phone-input" className="input-label">
            Phone number
          </label>
          <input
            id="phone-input"
            type="tel"
            className={`text-input ${touched.phone && errors.phone ? 'has-error' : ''}`}
            placeholder="+91 98765 43210"
            value={currentData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
          />
          {touched.phone && errors.phone ? (
            <p className="field-error-msg">{errors.phone}</p>
          ) : (
            <p className="field-hint">Spaces and dashes will be cleaned automatically.</p>
          )}
        </div>
      )}

      {activeType === 'wifi' && (
        <div className="wifi-inputs">
          <div className="input-group">
            <label htmlFor="wifi-ssid" className="input-label">
              Network name (SSID)
            </label>
            <input
              id="wifi-ssid"
              type="text"
              className={`text-input ${touched.ssid && errors.ssid ? 'has-error' : ''}`}
              placeholder="Home_WiFi"
              value={currentData.ssid || ''}
              onChange={(e) => handleChange('ssid', e.target.value)}
              onBlur={() => handleBlur('ssid')}
            />
            {touched.ssid && errors.ssid && (
              <p className="field-error-msg">{errors.ssid}</p>
            )}
          </div>

          <div className="grid-2col">
            <div className="input-group">
              <label htmlFor="wifi-security" className="input-label">
                Security
              </label>
              <select
                id="wifi-security"
                className="select-input"
                value={currentData.security || 'WPA'}
                onChange={(e) => handleChange('security', e.target.value)}
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="none">No password</option>
              </select>
            </div>

            {(currentData.security || 'WPA') !== 'none' && (
              <div className="input-group">
                <label htmlFor="wifi-password" className="input-label">
                  Password
                </label>
                <input
                  id="wifi-password"
                  type="password"
                  className={`text-input ${touched.password && errors.password ? 'has-error' : ''}`}
                  placeholder="password123"
                  value={currentData.password || ''}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                />
                {touched.password && errors.password && (
                  <p className="field-error-msg">{errors.password}</p>
                )}
              </div>
            )}
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-custom"
                checked={!!currentData.hidden}
                onChange={(e) => handleChange('hidden', e.target.checked)}
              />
              <span>Hidden network</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
