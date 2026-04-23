const STORAGE_KEY = "cristal_pending_booking";

export function savePendingBooking(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function getPendingBooking() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPendingBooking() {
  localStorage.removeItem(STORAGE_KEY);
}
