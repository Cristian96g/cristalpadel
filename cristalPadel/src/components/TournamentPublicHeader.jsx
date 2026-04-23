import { Link } from "react-router-dom";
import {
  formatTournamentDate,
  TOURNAMENT_STATUS_LABELS,
  tournamentMode,
} from "../utils/tournamentDisplay.js";

export default function TournamentPublicHeader({ tournament }) {
  return (
    <>
      <header className="sticky top-0 z-40 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl notranslate" translate="no">
              sports_tennis
            </span>
            <span className="text-lg font-bold">Cristal Padel</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-2xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px] notranslate" translate="no">
              calendar_month
            </span>
            Reservas
          </Link>
        </div>
      </header>

      {tournament ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-primary text-sm font-semibold tracking-wider uppercase">
                Torneo activo
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{tournament.name}</h1>
            </div>
            <span className="rounded-2xl bg-primary/10 px-3 py-2 text-xs font-extrabold uppercase tracking-widest text-primary">
              {TOURNAMENT_STATUS_LABELS[tournament.status] || tournament.status}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoPill label="Fechas" value={`${formatTournamentDate(tournament.startDate)}${tournament.endDate ? ` - ${formatTournamentDate(tournament.endDate)}` : ""}`} />
            <InfoPill label="Categoria" value={tournament.category || "General"} />
            <InfoPill label="Formato" value={tournament.format || "Grupos + eliminacion"} />
            <InfoPill label="Modalidad" value={tournamentMode(tournament) === "singles" ? "Singles" : "Dobles"} />
          </div>
        </section>
      ) : null}
    </>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold">{value}</p>
    </div>
  );
}
