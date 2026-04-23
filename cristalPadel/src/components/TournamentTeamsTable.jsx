import { useState } from "react";

const emptyForm = {
  player1Name: "",
  player2Name: "",
  phone: "",
  notes: "",
  seed: "",
};

function teamName(team, mode) {
  if (mode === "singles") return team.player1Name;
  return [team.player1Name, team.player2Name].filter(Boolean).join(" / ");
}

export default function TournamentTeamsTable({
  teams = [],
  mode = "doubles",
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam,
  onToggleTeam,
  saving = false,
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditingTeam(null);
    setForm(emptyForm);
    setSheetOpen(true);
  }

  function openEdit(team) {
    setEditingTeam(team);
    setForm({
      player1Name: team.player1Name || "",
      player2Name: team.player2Name || "",
      phone: team.phone || "",
      notes: team.notes || "",
      seed: team.seed || "",
    });
    setSheetOpen(true);
  }

  function closeSheet() {
    if (saving) return;
    setSheetOpen(false);
    setEditingTeam(null);
    setForm(emptyForm);
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      player2Name: mode === "singles" ? "" : form.player2Name,
    };

    const result = editingTeam
      ? await onUpdateTeam?.(editingTeam, payload)
      : await onAddTeam?.(payload);

    if (result?.ok !== false) {
      closeSheet();
    }
  }

  const title = mode === "singles" ? "Participantes" : "Parejas";

  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-900/95 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Participantes</h2>
          <p className="mt-1 text-sm text-slate-400">
            {teams.length ? `${teams.length} ${mode === "singles" ? "jugadores" : "parejas"} cargados` : "Todavia no hay participantes cargados"}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-white"
        >
          <span className="material-symbols-outlined text-[18px] notranslate" translate="no">
            add
          </span>
          Agregar
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
        {teams.length ? (
          <div className="divide-y divide-slate-800">
            {teams.map((team) => (
              <div key={team._id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-white">{teamName(team, mode)}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {[team.phone || "Sin telefono", team.seed ? `Seed ${team.seed}` : ""]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span className="rounded-xl bg-slate-800 px-2 py-1 text-xs font-bold uppercase text-slate-300">
                    {team.isApproved && team.isConfirmed ? "Confirmado" : "Pendiente"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(team)}
                    className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-white"
                  >
                    Editar
                  </button>
                  {onToggleTeam ? (
                    <button
                      type="button"
                      onClick={() => onToggleTeam(team)}
                      className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-white"
                    >
                      {team.isApproved && team.isConfirmed ? "Pausar" : "Confirmar"}
                    </button>
                  ) : null}
                  {onDeleteTeam ? (
                    <button
                      type="button"
                      onClick={() => onDeleteTeam(team)}
                      className="rounded-xl border border-red-500/40 px-3 py-2 text-xs font-bold text-red-300"
                    >
                      Eliminar
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <span className="material-symbols-outlined text-primary text-4xl notranslate" translate="no">
              groups
            </span>
            <p className="mt-3 text-sm text-slate-400">
              Usá el botón Agregar para cargar el primer participante.
            </p>
          </div>
        )}
      </div>

      {sheetOpen ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-[28px] border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  {editingTeam ? "Editar participante" : `Agregar ${mode === "singles" ? "participante" : "pareja"}`}
                </h3>
                <p className="mt-1 text-sm text-slate-400">{title}</p>
              </div>
              <button type="button" onClick={closeSheet} className="rounded-full p-1 text-slate-400">
                <span className="material-symbols-outlined notranslate" translate="no">
                  close
                </span>
              </button>
            </div>

            <TeamForm
              mode={mode}
              form={form}
              saving={saving}
              editing={Boolean(editingTeam)}
              onChange={update}
              onSubmit={handleSubmit}
              onCancel={closeSheet}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function TeamForm({ mode, form, saving, editing, onChange, onSubmit, onCancel }) {
  const input =
    "w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        value={form.player1Name}
        onChange={(e) => onChange("player1Name", e.target.value)}
        placeholder={mode === "singles" ? "Jugador" : "Jugador 1"}
        className={input}
      />
      {mode === "doubles" ? (
        <input
          value={form.player2Name}
          onChange={(e) => onChange("player2Name", e.target.value)}
          placeholder="Jugador 2"
          className={input}
        />
      ) : null}
      <input
        value={form.phone}
        onChange={(e) => onChange("phone", e.target.value)}
        placeholder="Telefono"
        className={input}
      />
      <input
        value={form.seed}
        onChange={(e) => onChange("seed", e.target.value)}
        placeholder="Seed"
        className={input}
      />

      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-primary px-4 py-3 font-bold text-white disabled:opacity-60"
        >
          {saving ? "Guardando..." : editing ? "Guardar" : "Agregar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-2xl border border-slate-700 px-4 py-3 font-bold text-white disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
