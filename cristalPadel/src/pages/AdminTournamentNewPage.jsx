import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TournamentForm from "../components/TournamentForm.jsx";
import { createAdminTournament } from "../api/tournaments.js";
import TournamentAppHeader from "../components/TournamentAppHeader.jsx";
import UnsavedChangesModal from "../components/UnsavedChangesModal.jsx";
import useUnsavedChangesGuard from "../hooks/useUnsavedChangesGuard.js";

export default function AdminTournamentNewPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [backConfirmOpen, setBackConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  useUnsavedChangesGuard(isDirty && !saving);

  async function handleSubmit(payload) {
    setSaving(true);
    setError("");
    try {
      const data = await createAdminTournament(payload);
      setIsDirty(false);
      setTimeout(() => navigate(`/admin/torneos/${data.tournament._id}`), 0);
    } catch (err) {
      setError(err?.data?.message || err.message || "No se pudo crear el torneo");
    } finally {
      setSaving(false);
    }
  }

  function requestBack() {
    if (isDirty) {
      setBackConfirmOpen(true);
      return;
    }

    navigate("/admin/torneos");
  }

  function discardAndGoBack() {
    setIsDirty(false);
    setBackConfirmOpen(false);
    setTimeout(() => navigate("/admin/torneos"), 0);
  }

  return (
    <div>
      <div className="px-4 py-6 bg-gradient-to-b from-primary/5 to-transparent">
        <TournamentAppHeader title="Nuevo torneo" onBack={requestBack} />
      </div>

      <div className="px-4">
        <section className="rounded-[28px] border border-slate-800 bg-slate-900/95 p-5">
          {error ? <p className="mb-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p> : null}
          <TournamentForm
            onSubmit={handleSubmit}
            saving={saving}
            onDirtyChange={setIsDirty}
          />
        </section>
      </div>

      <UnsavedChangesModal
        open={backConfirmOpen}
        onCancel={() => {
          setBackConfirmOpen(false);
        }}
        onDiscard={discardAndGoBack}
      />
    </div>
  );
}
