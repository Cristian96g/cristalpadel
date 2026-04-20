import { apiFetch } from "./client.js";

export function login(email, password) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getMe() {
  return apiFetch("/api/auth/me");
}

export function updateMe(payload) {
  return apiFetch("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function changePassword(payload) {
  return apiFetch("/api/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}