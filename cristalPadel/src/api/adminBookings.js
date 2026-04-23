import { apiFetch } from "./client.js";

export function getAdminGrid(date) {
  return apiFetch(`/api/admin/grid?date=${encodeURIComponent(date)}`);
}

export function getBookingsByDate(date) {
  return apiFetch(`/api/admin/bookings?date=${encodeURIComponent(date)}`);
}

export function createAdminBooking(payload) {
  return apiFetch(`/api/admin/bookings`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function cancelAdminBooking(id, reason = "") {
  return apiFetch(`/api/admin/bookings/${id}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

export function confirmAdminBooking(id) {
  return apiFetch(`/api/admin/bookings/${id}/confirm`, {
    method: "PATCH",
  });
}
