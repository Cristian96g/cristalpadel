import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminTournaments } from "../api/tournaments.js";

function formatDate(date) {
  if (!date) return "-";
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR");
}

export default function AdminTournamentsPage() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getAdminTournaments();
        setTournaments(data.tournaments || []);
      } catch (err) {
        setError(err.message || "Error cargando torneos");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div>
      <div className="px-4 py-6 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-primary text-sm font-semibold tracking-wider uppercase">Gestion</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Torneos</h1>
          </div>
          <Link
            to="/admin/torneos/nuevo"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-bold text-white"
          >
            <span className="material-symbols-outlined text-[20px] notranslate" translate="no">add</span>
            Nuevo torneo
          </Link>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {loading ? <p className="text-sm text-slate-500">Cargando torneos...</p> : null}
        {error ? <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p> : null}

        {!loading && !tournaments.length ? (
          <section className="rounded-[28px] border border-slate-800 bg-slate-900/95 p-5">
            <p className="text-slate-400">Todavia no hay torneos creados.</p>
          </section>
        ) : null}

        {tournaments.map((tournament) => (
          <button
            key={tournament._id}
            type="button"
            onClick={() => navigate(`/admin/torneos/${tournament._id}`)}
            className="w-full rounded-[28px] border border-slate-800 bg-slate-900/95 p-5 text-left transition hover:border-primary/60"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">{tournament.name}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {formatDate(tournament.startDate)} {tournament.endDate ? `- ${formatDate(tournament.endDate)}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${tournament.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                  {tournament.isActive ? "Activo" : "Inactivo"}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${tournament.isPublished ? "bg-primary/20 text-primary" : "bg-slate-800 text-slate-400"}`}>
                  {tournament.isPublished ? "Publicado" : "Oculto"}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
