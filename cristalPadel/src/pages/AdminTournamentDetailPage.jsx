import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  activateTournament,
  addTournamentTeam,
  deleteAdminTournament,
  deleteTournamentTeam,
  deactivateTournament,
  generateTournamentBracket,
  generateTournamentGroups,
  getAdminTournament,
  publishTournament,
  setTournamentChampion,
  unpublishTournament,
  updateAdminTournament,
  updateTournamentMatch,
  updateTournamentTeam,
} from "../api/tournaments.js";
import ChampionCard from "../components/ChampionCard.jsx";
import TournamentAdminHeader from "../components/TournamentAdminHeader.jsx";
import TournamentGeneralSection from "../components/TournamentGeneralSection.jsx";
import TournamentGroupsManager from "../components/TournamentGroupsManager.jsx";
import TournamentMatchesManager from "../components/TournamentMatchesManager.jsx";
import TournamentTabs from "../components/TournamentTabs.jsx";
import TournamentTeamsTable from "../components/TournamentTeamsTable.jsx";
import UnsavedChangesModal from "../components/UnsavedChangesModal.jsx";
import useUnsavedChangesGuard from "../hooks/useUnsavedChangesGuard.js";
import { tournamentMode } from "../utils/tournamentDisplay.js";

const ADMIN_TABS = [
  { key: "general", label: "General" },
  { key: "participants", label: "Participantes" },
  { key: "groups", label: "Grupos" },
  { key: "matches", label: "Partidos" },
  { key: "champion", label: "Campeon" },
];

export default function AdminTournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [generalDirty, setGeneralDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  useUnsavedChangesGuard(generalDirty && !busy);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminTournament(id);
      setDetail(data);
    } catch (err) {
      setError(err?.data?.message || err.message || "Error cargando torneo");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action, success = "Cambios guardados") {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(success);
      await load();
      setGeneralDirty(false);
      return { ok: true };
    } catch (err) {
      setError(err?.data?.message || err.message || "No se pudo completar la accion");
      return { ok: false };
    } finally {
      setBusy(false);
    }
  }

  const tournament = detail?.tournament;
  const mode = tournamentMode(tournament);

  function renderPanel() {
    if (!tournament) return null;

    if (activeTab === "participants") {
      return (
        <TournamentTeamsTable
          teams={detail.teams || []}
          mode={mode}
          saving={busy}
          onAddTeam={(payload) =>
            run(
              () =>
                addTournamentTeam(id, {
                  ...payload,
                  player2Name: mode === "singles" ? "" : payload.player2Name,
                }),
              mode === "singles" ? "Participante agregado" : "Pareja agregada"
            )
          }
          onUpdateTeam={(team, payload) =>
            run(
              () =>
                updateTournamentTeam(id, team._id, {
                  ...payload,
                  player2Name: mode === "singles" ? "" : payload.player2Name,
                }),
              "Participante actualizado"
            )
          }
          onDeleteTeam={(team) => {
            const ok = window.confirm("¿Eliminar este participante del torneo?");
            if (!ok) return { ok: false };
            return run(() => deleteTournamentTeam(id, team._id), "Participante eliminado");
          }}
          onToggleTeam={(team) =>
            run(
              () =>
                updateTournamentTeam(id, team._id, {
                  isApproved: !(team.isApproved && team.isConfirmed),
                  isConfirmed: !(team.isApproved && team.isConfirmed),
                }),
              "Estado de participante actualizado"
            )
          }
        />
      );
    }

    if (activeTab === "groups") {
      return (
        <TournamentGroupsManager
          groups={detail.groups || []}
          groupCount={tournament.settings?.groupCount || 2}
          busy={busy}
          onGenerate={(groupCount) =>
            run(() => generateTournamentGroups(id, { groupCount }), "Grupos generados")
          }
        />
      );
    }

    if (activeTab === "matches") {
      return (
        <TournamentMatchesManager
          matches={detail.matches || []}
          busy={busy}
          onGenerateBracket={() => run(() => generateTournamentBracket(id), "Llaves generadas")}
          onUpdateMatch={(match, payload) =>
            run(() => updateTournamentMatch(id, match._id, payload), "Partido actualizado")
          }
        />
      );
    }

    if (activeTab === "champion") {
      return (
        <ChampionCard
          tournament={tournament}
          teams={detail.teams || []}
          busy={busy}
          onSaveChampion={(payload) => run(() => setTournamentChampion(id, payload), "Campeon publicado")}
        />
      );
    }

    return (
      <TournamentGeneralSection
        tournament={tournament}
        saving={busy}
        onDirtyChange={setGeneralDirty}
        onSave={(payload) => run(() => updateAdminTournament(id, payload))}
      />
    );
  }

  function requestTabChange(nextTab) {
    if (nextTab === activeTab) return;
    if (generalDirty) {
      setPendingTab(nextTab);
      return;
    }

    setActiveTab(nextTab);
  }

  function cancelPendingNavigation() {
    setPendingTab("");
  }

  function discardPendingNavigation() {
    setGeneralDirty(false);

    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab("");
    }
  }

  async function handleDeleteTournament() {
    const result = await run(() => deleteAdminTournament(id), "Torneo eliminado");
    if (result.ok) {
      navigate("/admin/torneos", { replace: true });
    }
  }

  return (
    <div>
      <div className="px-4 py-6 bg-gradient-to-b from-primary/5 to-transparent">
        {loading ? <p className="text-sm text-slate-500">Cargando torneo...</p> : null}

        {tournament ? (
          <TournamentAdminHeader
            tournament={tournament}
            busy={busy}
            onDelete={() => setDeleteModalOpen(true)}
            onActivate={() => run(() => activateTournament(id), "Torneo activado")}
            onDeactivate={() => run(() => deactivateTournament(id), "Torneo desactivado")}
            onPublish={() => run(() => publishTournament(id), "Torneo publicado")}
            onUnpublish={() => run(() => unpublishTournament(id), "Torneo oculto")}
          />
        ) : null}
      </div>

      <div className="px-4">
        {error ? <p className="mb-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p> : null}
        {message ? <p className="mb-4 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">{message}</p> : null}

        {tournament ? (
          <>
            <TournamentTabs
              tabs={ADMIN_TABS}
              activeTab={activeTab}
              onChange={requestTabChange}
              variant="admin"
            />
            <div className="pt-5">{renderPanel()}</div>
          </>
        ) : null}
      </div>

      <UnsavedChangesModal
        open={Boolean(pendingTab)}
        onCancel={cancelPendingNavigation}
        onDiscard={discardPendingNavigation}
      />

      {deleteModalOpen ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/75 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-[28px] border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <h2 className="text-xl font-extrabold text-white">¿Eliminar torneo?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Esta accion no se puede deshacer. Se eliminaran tambien participantes, grupos y partidos asociados.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-2xl border border-slate-700 px-4 py-3 font-bold text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleDeleteTournament}
                className="rounded-2xl bg-red-500 px-4 py-3 font-bold text-white disabled:opacity-60"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
