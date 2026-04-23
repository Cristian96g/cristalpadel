export const TOURNAMENT_STATUS_LABELS = {
  draft: "Borrador",
  registration: "Inscripcion",
  in_progress: "En juego",
  finished: "Finalizado",
};

export function formatTournamentDate(date) {
  if (!date) return "-";
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function tournamentMode(tournament) {
  return tournament?.settings?.mode === "singles" ? "singles" : "doubles";
}

export function participantLabel(team, mode = "doubles") {
  if (!team) return "Por definir";
  if (mode === "singles") return team.player1Name || "Por definir";
  return [team.player1Name, team.player2Name].filter(Boolean).join(" / ");
}

export function scoreText(match) {
  if (match?.score?.summary) return match.score.summary;
  const sets = match?.score?.sets || [];
  if (!sets.length) return "";
  return sets.map((set) => `${set.teamAGames}-${set.teamBGames}`).join(" ");
}

export function splitMatches(matches = []) {
  return {
    groupMatches: matches.filter((match) => match.phase === "group"),
    playoffMatches: matches.filter((match) => match.phase !== "group"),
    finishedMatches: matches.filter((match) => match.status === "finished"),
  };
}
