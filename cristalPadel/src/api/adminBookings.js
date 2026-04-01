import { apiFetch } from "./client.js";

export function getAdminGrid(date) {
  return apiFetch(`/api/admin/grid?date=${encodeURIComponent(date)}`);
}

export function getBookingsByDate(date) {
  return apiFetch(`/api/bookings?date=${encodeURIComponent(date)}`);
}

export function cancelAdminBooking(id, reason = "") {
  return apiFetch(`/api/admin/bookings/${id}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}