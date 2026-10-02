/**
 * LocalStorage manager for saving and retrieving recent QR designs.
 */

const STORAGE_KEY = 'qr_designer_recent_history_v1';
const MAX_ITEMS = 10;

export function getRecentQRs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read recent QRs from localStorage', e);
    return [];
  }
}

export function saveRecentQR(item) {
  try {
    const list = getRecentQRs();
    const filtered = list.filter(x => x.formattedData !== item.formattedData);

    const newItem = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      timestamp: Date.now(),
      ...item
    };

    const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save QR to localStorage', e);
    return getRecentQRs();
  }
}

export function deleteRecentQR(id) {
  try {
    const list = getRecentQRs();
    const updated = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete QR from localStorage', e);
    return getRecentQRs();
  }
}

export function clearAllRecentQRs() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (e) {
    console.error('Failed to clear recent QRs', e);
    return [];
  }
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const elapsedSec = Math.floor((Date.now() - timestamp) / 1000);
  
  if (elapsedSec < 60) return 'just now';
  const mins = Math.floor(elapsedSec / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} d ago`;
}
