import { Link } from "react-router-dom";

export default function TournamentAppHeader({ title, to = "/admin/torneos", label = "Torneos", onBack }) {
  const content = (
    <>
      <span className="material-symbols-outlined text-[22px] notranslate" translate="no">
        arrow_back
      </span>
      {label}
    </>
  );

  return (
    <div className="mb-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-sm font-extrabold text-white transition hover:border-primary/60"
        >
          {content}
        </button>
      ) : (
        <Link
          to={to}
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-sm font-extrabold text-white transition hover:border-primary/60"
          aria-label={`Volver a ${label.toLowerCase()}`}
        >
          {content}
        </Link>
      )}

      {title ? (
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white">{title}</h1>
      ) : null}
    </div>
  );
}
