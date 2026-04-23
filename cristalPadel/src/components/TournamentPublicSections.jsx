import TournamentEmptyState from "./TournamentEmptyState.jsx";
import {
  formatTournamentDate,
  participantLabel,
  scoreText,
  splitMatches,
  TOURNAMENT_STATUS_LABELS,
  tournamentMode,
} from "../utils/tournamentDisplay.js";

export function TournamentInfoSection({ tournament }) {
  return (
    <section className="space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-extrabold">Informacion</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoRow label="Estado" value={TOURNAMENT_STATUS_LABELS[tournament.status] || tournament.status} />
          <InfoRow label="Categoria" value={tournament.category || "General"} />
          <InfoRow label="Fechas" value={`${formatTournamentDate(tournament.startDate)}${tournament.endDate ? ` - ${formatTournamentDate(tournament.endDate)}` : ""}`} />
          <InfoRow label="Formato" value={tournament.format || "Grupos + eliminacion"} />
          <InfoRow label="Modalidad" value={tournamentMode(tournament) === "singles" ? "Singles" : "Dobles"} />
        </div>

        {tournament.description ? (
          <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {tournament.description}
          </p>
        ) : null}
      </div>

      {tournament.rules ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-extrabold">Reglamento</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
            {tournament.rules}
          </p>
        </div>
      ) : null}
    </section>
  );
}

export function TournamentRegistrationSection({
  tournament,
  teams = [],
  form,
  onChange,
  onSubmit,
  registering,
  registerMsg,
  registerError,
}) {
  const mode = tournamentMode(tournament);
  const isClosed = tournament.status === "in_progress" || tournament.status === "finished";

  return (
    <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-extrabold">Inscripcion</h2>

        {tournament.registrationOpen && !isClosed ? (
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <input
              value={form.player1Name}
              onChange={(e) => onChange("player1Name", e.target.value)}
              placeholder={mode === "singles" ? "Jugador" : "Jugador 1"}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-950"
            />
            {mode === "doubles" ? (
              <input
                value={form.player2Name}
                onChange={(e) => onChange("player2Name", e.target.value)}
                placeholder="Jugador 2"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-950"
              />
            ) : null}
            <input
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="Telefono"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-950"
            />
            <textarea
              value={form.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              placeholder="Notas"
              rows={3}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-950"
            />
            {registerMsg ? <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">{registerMsg}</p> : null}
            {registerError ? <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{registerError}</p> : null}
            <button
              type="submit"
              disabled={registering}
              className="w-full rounded-2xl bg-primary px-4 py-3.5 font-bold text-white disabled:opacity-60"
            >
              {registering ? "Enviando..." : mode === "singles" ? "Inscribirme" : "Inscribir pareja"}
            </button>
          </form>
        ) : (
          <p className="mt-3 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {isClosed
              ? "La inscripcion ya no esta disponible porque el torneo esta en juego o finalizado."
              : "La inscripcion no esta abierta en este momento."}
          </p>
        )}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-extrabold">
          {mode === "singles" ? "Participantes" : "Parejas inscriptas"}
        </h2>
        <div className="mt-4 space-y-2">
          {teams.length ? (
            teams.map((team) => (
              <div key={team._id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                <p className="font-bold">{participantLabel(team, mode)}</p>
                <p className="text-xs text-slate-500">
                  {team.isApproved && team.isConfirmed ? "Confirmado" : "Pendiente de confirmacion"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Todavia no hay participantes visibles.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export function TournamentGroupsSection({ tournament, groups = [] }) {
  const mode = tournamentMode(tournament);

  if (!groups.length) {
    return (
      <TournamentEmptyState icon="groups" title="Grupos sin publicar">
        Cuando el admin genere los grupos, van a aparecer aca.
      </TournamentEmptyState>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {groups.map((group) => (
        <div key={group._id} className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-extrabold">{group.name}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="py-2 text-left">Participante</th>
                  <th>Pts</th>
                  <th>PJ</th>
                  <th>G</th>
                </tr>
              </thead>
              <tbody>
                {(group.standings || []).map((row) => (
                  <tr key={row.teamId?._id || row.teamId} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-2 pr-2 font-semibold">{participantLabel(row.teamId, mode)}</td>
                    <td className="text-center">{row.points}</td>
                    <td className="text-center">{row.played}</td>
                    <td className="text-center">{row.won}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}

export function TournamentMatchesSection({ tournament, matches = [] }) {
  const mode = tournamentMode(tournament);
  const { groupMatches, playoffMatches } = splitMatches(matches);

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <PublicMatchList title="Fase de grupos" matches={groupMatches} mode={mode} />
      <PublicMatchList title="Eliminacion directa" matches={playoffMatches} mode={mode} />
    </section>
  );
}

export function TournamentResultsSection({ tournament, matches = [] }) {
  const mode = tournamentMode(tournament);
  const { finishedMatches } = splitMatches(matches);

  return (
    <section className="space-y-4">
      {tournament.champion?.text ? (
        <div className="rounded-[28px] border border-amber-400/30 bg-amber-400/10 p-5">
          <p className="text-sm font-bold uppercase tracking-widest text-amber-500">Campeon</p>
          <h2 className="mt-1 text-2xl font-extrabold">{tournament.champion.text}</h2>
        </div>
      ) : null}

      {finishedMatches.length ? (
        <PublicMatchList title="Resultados cargados" matches={finishedMatches} mode={mode} />
      ) : (
        <TournamentEmptyState icon="scoreboard" title="Sin resultados">
          Cuando se carguen resultados, van a quedar disponibles en esta seccion.
        </TournamentEmptyState>
      )}
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

function PublicMatchList({ title, matches, mode }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-extrabold">{title}</h2>
      <div className="mt-3 space-y-2">
        {matches.length ? (
          matches.map((match) => (
            <div key={match._id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{participantLabel(match.teamA, mode)}</p>
                  <p className="font-bold">{participantLabel(match.teamB, mode)}</p>
                </div>
                <span className="rounded-xl bg-slate-100 px-2 py-1 text-xs font-bold uppercase dark:bg-slate-800">
                  {match.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {[match.scheduledDate, match.scheduledTime, match.court ? `Cancha ${match.court}` : ""]
                  .filter(Boolean)
                  .join(" · ") || "Horario a confirmar"}
              </p>
              {scoreText(match) ? (
                <p className="mt-2 text-sm font-bold text-primary">Resultado: {scoreText(match)}</p>
              ) : null}
              {match.winner ? (
                <p className="mt-1 text-xs text-slate-500">Ganador: {participantLabel(match.winner, mode)}</p>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Sin partidos cargados.</p>
        )}
      </div>
    </div>
  );
}
