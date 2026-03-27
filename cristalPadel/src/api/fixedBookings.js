import { apiFetch } from "./client.js";

const ADMIN_TOKEN = "cristal_admin_123";

export function createFixedBooking(payload) {
  return apiFetch("/api/fixed-bookings", {
    method: "POST",
    headers: {
      "x-admin-token": ADMIN_TOKEN,
    },
    body: JSON.stringify(payload),
  });
}
export function getFixedBookings() {
  return apiFetch("/api/fixed-bookings", {
    method: "GET",
    headers: {
      "x-admin-token": ADMIN_TOKEN,
    },
  });
}