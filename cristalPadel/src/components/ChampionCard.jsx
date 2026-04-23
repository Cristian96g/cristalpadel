import { useState } from "react";

function teamName(team) {
  if (!team) return "";
  return [team.player1Name, team.player2Name].filter(Boolean).join(" / ");
}

export default function ChampionCard({ tournament, teams = [], onSaveChampion, busy = false }) {
  const [teamId, setTeamId] = useState(tournament?.champion?.teamId || "");
  const [text, setText] = useState(tournament?.champion?.text || "");

  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-900/95 p-5">
      <h2 className="text-xl font-extrabold text-white">Campeon</h2>
      <p className="mt-1 text-sm text-slate-400">
        Se puede publicar manualmente o queda cargado al cerrar una final.
      </p>

      {tournament?.champion?.text ? (
        <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Publicado</p>
          <p className="mt-1 text-lg font-extrabold text-white">{tournament.champion.text}</p>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <select
          value={teamId}
          onChange={(e) => {
            setTeamId(e.target.value);
            const selected = teams.find((team) => team._id === e.target.value);
            if (selected) setText(teamName(selected));
          }}
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
        >
          <option value="">Elegir pareja</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {teamName(team)}
            </option>
          ))}
        </select>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Texto del campeon"
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => onSaveChampion?.({ teamId, text })}
          className="rounded-2xl bg-primary px-4 py-3 font-bold text-white disabled:opacity-60"
        >
          Publicar
        </button>
      </div>
    </section>
  );
}
