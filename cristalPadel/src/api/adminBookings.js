import { apiFetch } from "./client.js";

const ADMIN_TOKEN = "cristal_admin_123";

export function getAdminGrid(date) {
  return apiFetch(`/api/admin/grid?date=${encodeURIComponent(date)}`, {
    headers: {
      "x-admin-token": ADMIN_TOKEN,
    },
  });
}

export function getBookingsByDate(date) {
  return apiFetch(`/api/bookings?date=${encodeURIComponent(date)}`, {
    headers: {
      "x-admin-token": ADMIN_TOKEN,
    },
  });
}

export function cancelAdminBooking(id, reason = "") {
  return apiFetch(`/api/admin/bookings/${id}/cancel`, {
    method: "PATCH",
    headers: {
      "x-admin-token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ reason }),
  });
}