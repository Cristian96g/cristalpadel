import { useState } from "react";
import TournamentForm from "./TournamentForm.jsx";
import UnsavedChangesModal from "./UnsavedChangesModal.jsx";
import {
  formatTournamentDate,
  TOURNAMENT_STATUS_LABELS,
  tournamentMode,
} from "../utils/tournamentDisplay.js";

export default function TournamentGeneralSection({
  tournament,
  saving = false,
  onSave,
  onDirtyChange,
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const mode = tournamentMode(tournament);

  async function handleSubmit(payload) {
    const result = await onSave?.(payload);
    if (result?.ok !== false) {
      updateDirty(false);
      setEditOpen(false);
    }
  }

  function updateDirty(nextDirty) {
    setIsDirty(nextDirty);
    onDirtyChange?.(nextDirty);
  }

  function requestClose() {
    if (isDirty) {
      setConfirmCloseOpen(true);
      return;
    }

    setEditOpen(false);
  }

  function discardClose() {
    updateDirty(false);
    setConfirmCloseOpen(false);
    setEditOpen(false);
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-primary text-sm font-semibold tracking-wider uppercase">
          Torneos
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-white">
          Configuracion del torneo
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Administra la configuracion general del torneo activo.
        </p>
      </div>

      <div className="rounded-[28px] border border-slate-800 bg-slate-900/95 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-2xl font-extrabold tracking-tight text-white">
              {tournament.name}
            </h3>
            {tournament.description ? (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                {tournament.description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              updateDirty(false);
              setEditOpen(true);
            }}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-white"
          >
            <span className="material-symbols-outlined text-[18px] notranslate" translate="no">
              edit
            </span>
            Editar
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone={tournament.isActive ? "green" : "muted"}>
            {tournament.isActive ? "Activo" : "Inactivo"}
          </Badge>
          <Badge tone={tournament.isPublished ? "blue" : "muted"}>
            {tournament.isPublished ? "Publicado" : "Oculto"}
          </Badge>
          <Badge tone={tournament.registrationOpen ? "green" : "muted"}>
            {tournament.registrationOpen ? "Inscripcion abierta" : "Inscripcion cerrada"}
          </Badge>
          <Badge>{TOURNAMENT_STATUS_LABELS[tournament.status] || tournament.status}</Badge>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <SummaryItem label="Categoria" value={tournament.category || "General"} />
          <SummaryItem label="Modalidad" value={mode === "singles" ? "Singles" : "Dobles"} />
          <SummaryItem label="Formato" value={tournament.format || "Grupos + eliminacion"} wide />
          <SummaryItem
            label="Fechas"
            value={`${formatTournamentDate(tournament.startDate)}${tournament.endDate ? ` - ${formatTournamentDate(tournament.endDate)}` : ""}`}
            wide
          />
        </div>
      </div>

      {editOpen ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-white">Editar torneo</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Modifica los datos generales y guarda los cambios.
                </p>
              </div>

              <button
                type="button"
                onClick={requestClose}
                className="rounded-full p-1 text-slate-400"
              >
                <span className="material-symbols-outlined notranslate" translate="no">
                  close
                </span>
              </button>
            </div>

            <TournamentForm
              key={`${tournament._id}-${tournament.updatedAt || ""}`}
              initialData={tournament}
              saving={saving}
              submitLabel="Guardar cambios"
              onCancel={requestClose}
              onDirtyChange={updateDirty}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      ) : null}

      <UnsavedChangesModal
        open={confirmCloseOpen}
        onCancel={() => setConfirmCloseOpen(false)}
        onDiscard={discardClose}
      />
    </section>
  );
}

function SummaryItem({ label, value, wide = false }) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-950/60 p-3 ${wide ? "col-span-2" : ""}`}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-100">{value || "-"}</p>
    </div>
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
