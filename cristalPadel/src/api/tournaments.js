import { apiFetch } from "./client.js";

export function getActiveTournament() {
  return apiFetch("/api/tournaments/active");
}

export function getPublicTournament(id) {
  return apiFetch(`/api/tournaments/${id}`);
}

export function registerTournamentTeam(id, payload) {
  return apiFetch(`/api/tournaments/${id}/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAdminTournaments() {
  return apiFetch("/api/admin/tournaments");
}

export function getAdminTournament(id) {
  return apiFetch(`/api/admin/tournaments/${id}`);
}

export function createAdminTournament(payload) {
  return apiFetch("/api/admin/tournaments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminTournament(id, payload) {
  return apiFetch(`/api/admin/tournaments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminTournament(id) {
  return apiFetch(`/api/admin/tournaments/${id}`, {
    method: "DELETE",
  });
}

export function activateTournament(id) {
  return apiFetch(`/api/admin/tournaments/${id}/activate`, { method: "PATCH" });
}

export function deactivateTournament(id) {
  return apiFetch(`/api/admin/tournaments/${id}/deactivate`, { method: "PATCH" });
}

export function publishTournament(id) {
  return apiFetch(`/api/admin/tournaments/${id}/publish`, { method: "PATCH" });
}

export function unpublishTournament(id) {
  return apiFetch(`/api/admin/tournaments/${id}/unpublish`, { method: "PATCH" });
}

export function addTournamentTeam(id, payload) {
  return apiFetch(`/api/admin/tournaments/${id}/teams`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTournamentTeam(id, teamId, payload) {
  return apiFetch(`/api/admin/tournaments/${id}/teams/${teamId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteTournamentTeam(id, teamId) {
  return apiFetch(`/api/admin/tournaments/${id}/teams/${teamId}`, {
    method: "DELETE",
  });
}

export function generateTournamentGroups(id, payload = {}) {
  return apiFetch(`/api/admin/tournaments/${id}/groups/generate`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function generateTournamentBracket(id) {
  return apiFetch(`/api/admin/tournaments/${id}/bracket/generate`, {
    method: "POST",
  });
}

export function updateTournamentMatch(id, matchId, payload) {
  return apiFetch(`/api/admin/tournaments/${id}/matches/${matchId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function setTournamentChampion(id, payload) {
  return apiFetch(`/api/admin/tournaments/${id}/champion`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
