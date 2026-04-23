import { useEffect, useState } from "react";
import { getActiveTournament, registerTournamentTeam } from "../api/tournaments.js";
import TournamentEmptyState from "../components/TournamentEmptyState.jsx";
import TournamentPublicHeader from "../components/TournamentPublicHeader.jsx";
import TournamentTabs from "../components/TournamentTabs.jsx";
import {
  TournamentGroupsSection,
  TournamentInfoSection,
  TournamentMatchesSection,
  TournamentRegistrationSection,
  TournamentResultsSection,
} from "../components/TournamentPublicSections.jsx";
import { tournamentMode } from "../utils/tournamentDisplay.js";

const PUBLIC_TABS = [
  { key: "info", label: "Info" },
  { key: "registration", label: "Inscripcion" },
  { key: "groups", label: "Grupos" },
  { key: "matches", label: "Partidos" },
  { key: "results", label: "Resultados" },
];

export default function TournamentPage() {
  const [activeTab, setActiveTab] = useState("info");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    player1Name: "",
    player2Name: "",
    phone: "",
    notes: "",
  });
  const [registering, setRegistering] = useState(false);
  const [registerMsg, setRegisterMsg] = useState("");
  const [registerError, setRegisterError] = useState("");

  async function loadTournament() {
    setLoading(true);
    setError("");
    try {
      const data = await getActiveTournament();
      setDetail(data.tournament ? data : null);
    } catch (err) {
      setError(err.message || "Error cargando torneo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTournament();
  }, []);

  const tournament = detail?.tournament;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!tournament) return;

    const mode = tournamentMode(tournament);

    setRegistering(true);
    setRegisterMsg("");
    setRegisterError("");

    try {
      await registerTournamentTeam(tournament._id, {
        ...form,
        player2Name: mode === "singles" ? "" : form.player2Name,
      });
      setRegisterMsg("Inscripcion recibida. El admin debe confirmarla.");
      setForm({ player1Name: "", player2Name: "", phone: "", notes: "" });
      await loadTournament();
    } catch (err) {
      setRegisterError(err?.data?.message || err.message || "No se pudo inscribir");
    } finally {
      setRegistering(false);
    }
  }

  function renderPanel() {
    if (!tournament) return null;

    if (activeTab === "registration") {
      return (
        <TournamentRegistrationSection
          tournament={tournament}
          teams={detail.teams || []}
          form={form}
          onChange={updateField}
          onSubmit={handleRegister}
          registering={registering}
          registerMsg={registerMsg}
          registerError={registerError}
        />
      );
    }

    if (activeTab === "groups") {
      return <TournamentGroupsSection tournament={tournament} groups={detail.groups || []} />;
    }

    if (activeTab === "matches") {
      return <TournamentMatchesSection tournament={tournament} matches={detail.matches || []} />;
    }

    if (activeTab === "results") {
      return <TournamentResultsSection tournament={tournament} matches={detail.matches || []} />;
    }

    return <TournamentInfoSection tournament={tournament} />;
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-background-light pb-10 font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <TournamentPublicHeader tournament={tournament} />

      <main className="mx-auto w-full max-w-5xl px-4 py-5">
        {loading ? (
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500">Cargando torneo...</p>
          </section>
        ) : error ? (
          <section className="rounded-[28px] border border-red-500/20 bg-red-500/10 p-5 text-red-400">
            {error}
          </section>
        ) : !tournament ? (
          <TournamentEmptyState icon="trophy" title="No hay torneo activo en este momento">
            Cuando el club publique un torneo, vas a poder verlo desde esta seccion.
          </TournamentEmptyState>
        ) : (
          <>
            <TournamentTabs
              tabs={PUBLIC_TABS}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
            <div className="pt-5">{renderPanel()}</div>
          </>
        )}
      </main>
    </div>
  );
}
