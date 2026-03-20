import { apiFetch } from "./client.js";

export function getAvailability(date) {
  return apiFetch(`/api/availability?date=${encodeURIComponent(date)}`);
}