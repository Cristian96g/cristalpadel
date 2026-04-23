import { useState } from "react";

function teamName(team) {
  if (!team) return "Por definir";
  return [team.player1Name, team.player2Name].filter(Boolean).join(" / ");
}

function scoreToText(match) {
  if (match?.score?.summary) return match.score.summary;
  const sets = match?.score?.sets || [];
  return sets.map((set) => `${set.teamAGames}-${set.teamBGames}`).join(" ");
}

export default function TournamentMatchesManager({ matches = [], onUpdateMatch, onGenerateBracket, busy = false }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    scheduledDate: "",
    scheduledTime: "",
    court: "",
    scoreSummary: "",
    winner: "",
    status: "scheduled",
  });

  function startEdit(match) {
    setEditingId(match._id);
    setForm({
      scheduledDate: match.scheduledDate || "",
      scheduledTime: match.scheduledTime || "",
      court: match.court || "",
      scoreSummary: match.score?.summary || scoreToText(match),
      winner: match.winner?._id || match.winner || "",
      status: match.status || "scheduled",
    });
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(match) {
    await onUpdateMatch?.(match, {
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      court: form.court,
      status: form.status,
      winner: form.winner,
      score: {
        summary: form.scoreSummary,
      },
    });
    setEditingId(null);
  }

  const groupMatches = matches.filter((match) => match.phase === "group");
  const bracketMatches = matches.filter((match) => match.phase !== "group");

  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-900/95 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Partidos</h2>
          <p className="mt-1 text-sm text-slate-400">Carga horarios, resultados y ganadores.</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onGenerateBracket}
          className="rounded-2xl bg-primary px-4 py-3 font-bold text-white disabled:opacity-60"
        >
          Generar llaves
        </button>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <MatchColumn
          title="Fase de grupos"
          matches={groupMatches}
          editingId={editingId}
          form={form}
          setEditingId={setEditingId}
          startEdit={startEdit}
          update={update}
          submit={submit}
          busy={busy}
        />
        <MatchColumn
          title="Eliminacion directa"
          matches={bracketMatches}
          editingId={editingId}
          form={form}
          setEditingId={setEditingId}
          startEdit={startEdit}
          update={update}
          submit={submit}
          busy={busy}
        />
      </div>
    </section>
  );
}

function MatchColumn({ title, matches, editingId, form, setEditingId, startEdit, update, submit, busy }) {
  const input = "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none";

  return (
    <div>
      <h3 className="font-extrabold text-white">{title}</h3>
      <div className="mt-3 space-y-3">
        {matches.length ? (
          matches.map((match) => (
            <div key={match._id} className="rounded-2xl border border-slate-800 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-white">{teamName(match.teamA)}</p>
                  <p className="font-bold text-white">{teamName(match.teamB)}</p>
                </div>
                <span className="rounded-xl bg-slate-800 px-2 py-1 text-xs font-bold uppercase text-slate-300">
                  {match.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {[match.phase, match.scheduledDate, match.scheduledTime, match.court ? `Cancha ${match.court}` : ""]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {scoreToText(match) ? (
                <p className="mt-2 text-sm font-bold text-primary">Resultado: {scoreToText(match)}</p>
              ) : null}
              {match.winner ? (
                <p className="mt-1 text-xs text-slate-400">Ganador: {teamName(match.winner)}</p>
              ) : null}

              {editingId === match._id ? (
                <div className="mt-4 grid gap-2">
                  <div className="grid grid-cols-3 gap-2">
                    <input type="date" value={form.scheduledDate} onChange={(e) => update("scheduledDate", e.target.value)} className={input} />
                    <input type="time" value={form.scheduledTime} onChange={(e) => update("scheduledTime", e.target.value)} className={input} />
                    <input value={form.court} onChange={(e) => update("court", e.target.value)} placeholder="Cancha" className={input} />
                  </div>
                  <input value={form.scoreSummary} onChange={(e) => update("scoreSummary", e.target.value)} placeholder="Resultado, ej: 6-4 6-3" className={input} />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={form.status} onChange={(e) => update("status", e.target.value)} className={input}>
                      <option value="pending">Pendiente</option>
                      <option value="scheduled">Programado</option>
                      <option value="finished">Finalizado</option>
                    </select>
                    <select value={form.winner} onChange={(e) => update("winner", e.target.value)} className={input}>
                      <option value="">Ganador</option>
                      {match.teamA ? <option value={match.teamA._id}>{teamName(match.teamA)}</option> : null}
                      {match.teamB ? <option value={match.teamB._id}>{teamName(match.teamB)}</option> : null}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button disabled={busy} onClick={() => submit(match)} className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white disabled:opacity-60">
                      Guardar
                    </button>
                    <button onClick={() => setEditingId(null)} className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-bold text-white">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => startEdit(match)} className="mt-3 rounded-xl border border-slate-700 px-3 py-2 text-sm font-bold text-white">
                  Editar partido
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Sin partidos.</p>
        )}
      </div>
    </div>
  );
}
