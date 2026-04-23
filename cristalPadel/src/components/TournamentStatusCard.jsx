export default function TournamentStatusCard({
  tournament,
  onActivate,
  onDeactivate,
  onPublish,
  onUnpublish,
  busy = false,
}) {
  if (!tournament) return null;

  const pill = "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest";

  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-900/95 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">{tournament.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`${pill} ${tournament.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
              {tournament.isActive ? "Activo" : "Inactivo"}
            </span>
            <span className={`${pill} ${tournament.isPublished ? "bg-primary/20 text-primary" : "bg-slate-800 text-slate-400"}`}>
              {tournament.isPublished ? "Publicado" : "Oculto"}
            </span>
            <span className={`${pill} bg-slate-800 text-slate-300`}>{tournament.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:min-w-64">
          <button
            type="button"
            disabled={busy}
            onClick={tournament.isActive ? onDeactivate : onActivate}
            className="rounded-2xl border border-slate-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {tournament.isActive ? "Desactivar" : "Activar"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={tournament.isPublished ? onUnpublish : onPublish}
            className="rounded-2xl bg-primary px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {tournament.isPublished ? "Ocultar" : "Publicar"}
          </button>
        </div>
      </div>
    </section>
  );
}
