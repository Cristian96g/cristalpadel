import { apiFetch } from "./client.js";

export async function createBooking(payload) {
  try {
    return await apiFetch(`/api/bookings`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // normalizamos 409
    if (err.status === 409) {
      const e = new Error(err.data?.message || "Slot already booked");
      e.code = 409;
      throw e;
    }
    throw err;
  }
}

export function getBooking(id) {
  return apiFetch(`/api/bookings/${id}`);
}
