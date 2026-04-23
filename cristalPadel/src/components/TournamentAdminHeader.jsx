import TournamentAppHeader from "./TournamentAppHeader.jsx";
import { TOURNAMENT_STATUS_LABELS } from "../utils/tournamentDisplay.js";

export default function TournamentAdminHeader({
  tournament,
  busy = false,
  onActivate,
  onDeactivate,
  onPublish,
  onUnpublish,
  onDelete,
}) {
  if (!tournament) return null;

  const activeLabel = tournament.isActive ? "Activo" : "Inactivo";
  const publishedLabel = tournament.isPublished ? "Publicado" : "Oculto";

  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-900/95 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <TournamentAppHeader title={tournament.name} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone={tournament.isActive ? "green" : "muted"}>{activeLabel}</Badge>
            <Badge tone={tournament.isPublished ? "blue" : "muted"}>{publishedLabel}</Badge>
            <Badge>{TOURNAMENT_STATUS_LABELS[tournament.status] || tournament.status}</Badge>
            {tournament.registrationOpen ? <Badge tone="green">Inscripcion abierta</Badge> : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          {tournament.isActive && tournament.isPublished ? (
            <button
              type="button"
              onClick={() => window.open("/torneo", "_blank")}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-3 py-2.5 text-sm font-bold text-white"
            >
              Ver publico
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={tournament.isActive ? onDeactivate : onActivate}
            className="rounded-2xl border border-slate-700 px-3 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {tournament.isActive ? "Desactivar" : "Activar"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={tournament.isPublished ? onUnpublish : onPublish}
            className="rounded-2xl bg-primary px-3 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {tournament.isPublished ? "Ocultar" : "Publicar"}
          </button>
          {onDelete ? (
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="col-span-2 rounded-2xl border border-red-500/40 px-3 py-2.5 text-sm font-bold text-red-300 disabled:opacity-60 sm:col-span-1"
            >
              Eliminar torneo
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    green: "bg-emerald-500/10 text-emerald-400",
    blue: "bg-primary/20 text-primary",
    muted: "bg-slate-800 text-slate-400",
    slate: "bg-slate-800 text-slate-300",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${tones[tone]}`}>
      {children}
    </span>
  );
}
