export function formatDisplayDate(dateStr) {
  if (!dateStr) return "-";
  const [y, m, d] = String(dateStr).split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

export function formatLongDate(dateStr) {
  if (!dateStr) return "-";
  const [y, m, d] = String(dateStr).split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function isPastSlot(dateStr, startTime) {
  if (!dateStr || !startTime) return false;
  const [y, m, d] = String(dateStr).split("-").map(Number);
  const [hh, mm] = String(startTime).split(":").map(Number);
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return false;
  return new Date(y, m - 1, d, hh, mm).getTime() < Date.now();
}
