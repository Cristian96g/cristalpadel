import { useEffect, useMemo, useState } from "react";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  format: "Grupos + eliminacion",
  startDate: "",
  endDate: "",
  status: "draft",
  registrationOpen: false,
  rules: "",
  settings: {
    mode: "doubles",
    groupCount: 2,
    playoffQualifiersPerGroup: 2,
    hasThirdPlaceMatch: false,
    showSchedulePublicly: true,
  },
};

export default function TournamentForm({
  initialData,
  onSubmit,
  onCancel,
  onDirtyChange,
  saving = false,
  submitLabel = "Guardar torneo",
}) {
  const initialForm = useMemo(() => normalizeTournamentForm(initialData), [initialData]);
  const [form, setForm] = useState(initialForm);
  const isDirty = useMemo(
    () => JSON.stringify(normalizeTournamentForm(form)) !== JSON.stringify(initialForm),
    [form, initialForm]
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateSetting(field, value) {
    setForm((prev) => ({
      ...prev,
      settings: { ...prev.settings, [field]: value },
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit?.(form);
  }

  const input =
    "w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold">Nombre</label>
        <input value={form.name} onChange={(e) => update("name", e.target.value)} className={input} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Descripcion</label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          className={input}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold">Categoria</label>
          <input value={form.category} onChange={(e) => update("category", e.target.value)} className={input} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Formato</label>
          <input value={form.format} onChange={(e) => update("format", e.target.value)} className={input} />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Modalidad</label>
        <select
          value={form.settings.mode || "doubles"}
          onChange={(e) => updateSetting("mode", e.target.value)}
          className={input}
        >
          <option value="doubles">Dobles</option>
          <option value="singles">Singles</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-semibold">Inicio</label>
          <input type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} className={input} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Fin</label>
          <input type="date" value={form.endDate || ""} onChange={(e) => update("endDate", e.target.value)} className={input} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Estado</label>
          <select value={form.status} onChange={(e) => update("status", e.target.value)} className={input}>
            <option value="draft">Borrador</option>
            <option value="registration">Inscripcion</option>
            <option value="in_progress">En juego</option>
            <option value="finished">Finalizado</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center justify-between rounded-2xl border border-slate-300 dark:border-slate-700 px-4 py-3">
          <span className="font-semibold">Inscripcion abierta</span>
          <input
            type="checkbox"
            checked={form.registrationOpen}
            onChange={(e) => update("registrationOpen", e.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between rounded-2xl border border-slate-300 dark:border-slate-700 px-4 py-3">
          <span className="font-semibold">Mostrar horarios</span>
          <input
            type="checkbox"
            checked={form.settings.showSchedulePublicly}
            onChange={(e) => updateSetting("showSchedulePublicly", e.target.checked)}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold">Cantidad de grupos</label>
          <input
            type="number"
            min="1"
            value={form.settings.groupCount}
            onChange={(e) => updateSetting("groupCount", Number(e.target.value))}
            className={input}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Clasifican por grupo</label>
          <input
            type="number"
            min="1"
            value={form.settings.playoffQualifiersPerGroup}
            onChange={(e) => updateSetting("playoffQualifiersPerGroup", Number(e.target.value))}
            className={input}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Reglamento</label>
        <textarea value={form.rules} onChange={(e) => update("rules", e.target.value)} rows={4} className={input} />
      </div>

      <div className={onCancel ? "grid gap-3 sm:grid-cols-2" : ""}>
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-primary px-4 py-3.5 font-bold text-white disabled:opacity-60"
        >
          {saving ? "Guardando..." : submitLabel}
        </button>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="w-full rounded-2xl border border-slate-700 px-4 py-3.5 font-bold text-white disabled:opacity-60"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}

function normalizeTournamentForm(value) {
  const source = value
    ? {
        ...emptyForm,
        ...value,
        settings: {
          ...emptyForm.settings,
          ...(value.settings || {}),
        },
      }
    : emptyForm;

  return {
    name: source.name || "",
    description: source.description || "",
    category: source.category || "",
    format: source.format || "",
    startDate: source.startDate || "",
    endDate: source.endDate || "",
    status: source.status || "draft",
    registrationOpen: Boolean(source.registrationOpen),
    rules: source.rules || "",
    settings: {
      mode: source.settings?.mode || "doubles",
      groupCount: Number(source.settings?.groupCount || 2),
      playoffQualifiersPerGroup: Number(source.settings?.playoffQualifiersPerGroup || 2),
      hasThirdPlaceMatch: Boolean(source.settings?.hasThirdPlaceMatch),
      showSchedulePublicly:
        source.settings?.showSchedulePublicly === undefined
          ? true
          : Boolean(source.settings.showSchedulePublicly),
    },
  };
}
