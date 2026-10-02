import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Header from './components/Header';
import TypeSelector from './components/TypeSelector';
import FormInputs from './components/FormInputs';
import DesignerControls from './components/DesignerControls';
import QRPreview from './components/QRPreview';
import ReliabilityWarnings from './components/ReliabilityWarnings';
import RecentQRs from './components/RecentQRs';
import Toast from './components/Toast';

import { formatQRData } from './utils/qrcodeFormatter';
import { validateInputs, isValidForm } from './utils/validators';
import { getRecentQRs, saveRecentQR, deleteRecentQR, clearAllRecentQRs } from './utils/storage';

const DEFAULT_FORM_DATA = {
  url: { url: 'https://example.com' },
  text: { text: '' },
  email: { email: '', subject: '', body: '' },
  phone: { phone: '' },
  wifi: { ssid: '', password: '', security: 'WPA', hidden: false }
};

const DEFAULT_OPTIONS = {
  size: 256,
  margin: 4,
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  ecc: 'M'
};

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('qr_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) {}
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [activeType, setActiveType] = useState('url');
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [touched, setTouched] = useState({});
  const [options, setOptions] = useState(DEFAULT_OPTIONS);

  const [qrError, setQrError] = useState(null);
  const [lastGeneratedDataUrl, setLastGeneratedDataUrl] = useState(null);
  const [recentList, setRecentList] = useState([]);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setRecentList(getRecentQRs());
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('qr_theme', next);
      } catch (e) {}
      return next;
    });
  };

  const currentInputData = formData[activeType] || {};
  const errors = useMemo(() => validateInputs(activeType, currentInputData), [activeType, currentInputData]);
  const formattedData = useMemo(() => formatQRData(activeType, currentInputData), [activeType, currentInputData]);
  const isValid = useMemo(() => isValidForm(errors), [errors]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const handleChangeType = (newType) => {
    setActiveType(newType);
    setTouched({});
    setQrError(null);
  };

  // 1.5-second debounced auto-save to localStorage
  useEffect(() => {
    if (!isValid || !formattedData || !lastGeneratedDataUrl) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const updated = saveRecentQR({
        type: activeType,
        formattedData,
        rawInputs: currentInputData,
        options,
        dataUrl: lastGeneratedDataUrl
      });
      setRecentList(updated);
    }, 1500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [activeType, formattedData, isValid, lastGeneratedDataUrl, options, currentInputData]);

  const handleLoadRecent = (item) => {
    setActiveType(item.type);
    if (item.rawInputs) {
      setFormData((prev) => ({
        ...prev,
        [item.type]: item.rawInputs
      }));
    }
    if (item.options) {
      setOptions(item.options);
    }
    setTouched({});
    showToast(`Loaded ${item.type} from history`, 'info');
  };

  const handleDeleteRecent = (id) => {
    const updated = deleteRecentQR(id);
    setRecentList(updated);
    showToast('Deleted item', 'info');
  };

  const handleClearAllRecent = () => {
    const updated = clearAllRecentQRs();
    setRecentList(updated);
    showToast('Cleared recent codes', 'info');
  };

  return (
    <div className="app-root" data-theme={theme}>
      <div className="app-container">
        <Header theme={theme} onToggleTheme={toggleTheme} />

        <main className="app-grid">
          {/* Left Column */}
          <section className="column-editor">
            <div className="card-panel">
              <TypeSelector
                activeType={activeType}
                onChangeType={handleChangeType}
              />

              <FormInputs
                activeType={activeType}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                touched={touched}
                setTouched={setTouched}
              />

              <hr className="section-divider" />

              <DesignerControls
                options={options}
                setOptions={setOptions}
              />
            </div>
          </section>

          {/* Right Column */}
          <section className="column-preview sticky-preview">
            <QRPreview
              activeType={activeType}
              formattedData={formattedData}
              isValid={isValid}
              options={options}
              onQRError={setQrError}
              onGeneratedSuccess={setLastGeneratedDataUrl}
              showToast={showToast}
            />

            <ReliabilityWarnings
              options={options}
              payloadData={formattedData}
              qrError={qrError}
              isValid={isValid}
            />
          </section>
        </main>

        {/* Full-width Bottom Row for Recent Codes */}
        <footer className="app-footer-recent">
          <RecentQRs
            recentList={recentList}
            onLoadRecent={handleLoadRecent}
            onDeleteRecent={handleDeleteRecent}
            onClearAll={handleClearAllRecent}
          />
        </footer>

        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'info' })}
        />
      </div>
    </div>
  );
}
