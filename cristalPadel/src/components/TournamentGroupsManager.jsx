function teamName(team) {
  if (!team) return "-";
  return [team.player1Name, team.player2Name].filter(Boolean).join(" / ");
}

export default function TournamentGroupsManager({ groups = [], groupCount = 2, onGenerate, busy = false }) {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-900/95 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Grupos</h2>
          <p className="mt-1 text-sm text-slate-400">Genera zonas y partidos todos contra todos.</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => onGenerate?.(groupCount)}
          className="rounded-2xl bg-primary px-4 py-3 font-bold text-white disabled:opacity-60"
        >
          Generar grupos
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {groups.length ? (
          groups.map((group) => (
            <div key={group._id} className="rounded-2xl border border-slate-800 p-4">
              <h3 className="font-extrabold text-white">{group.name}</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="py-2 text-left">Pareja</th>
                      <th>Pts</th>
                      <th>PJ</th>
                      <th>G</th>
                      <th>DG</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    {(group.standings || []).map((row) => (
                      <tr key={row.teamId?._id || row.teamId} className="border-t border-slate-800">
                        <td className="py-2 pr-2 font-semibold">{teamName(row.teamId)}</td>
                        <td className="text-center">{row.points}</td>
                        <td className="text-center">{row.played}</td>
                        <td className="text-center">{row.won}</td>
                        <td className="text-center">{(row.gamesWon || 0) - (row.gamesLost || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Todavia no hay grupos generados.</p>
        )}
      </div>
    </section>
  );
}
