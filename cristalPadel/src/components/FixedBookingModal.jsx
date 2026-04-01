import { useState } from "react";
import { generateStartTimes } from "../utils/slots.js";

const WEEKDAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

const AVAILABLE_START_TIMES = generateStartTimes({
  openTime: "16:00",
  closeTime: "23:00",
  slotMinutes: 90,
});

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function FixedBookingModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    phone: "",
    court: "1",
    weekday: "3",
    startTime: AVAILABLE_START_TIMES[0] || "16:00",
    startDate: todayISO(),
    endDate: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await onSubmit({
        ...form,
        court: Number(form.court),
        weekday: Number(form.weekday),
        endDate: form.endDate || null,
      });

      if (result?.ok === false) {
        setError(result.message || "No se pudo crear el turno fijo");
        return;
      }

      setForm({
        name: "",
        lastName: "",
        phone: "",
        court: "1",
        weekday: "3",
        startTime: AVAILABLE_START_TIMES[0] || "16:00",
        startDate: todayISO(),
        endDate: "",
      });

      onClose();
    } catch (err) {
      setError(err.message || "No se pudo crear el turno fijo");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold">Crear turno fijo</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generá reservas automáticas para un jugador fijo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3"
              required
            />
            <input
              type="text"
              placeholder="Apellido"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3"
              required
            />
          </div>

          <input
            type="tel"
            placeholder="Teléfono"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.court}
              onChange={(e) => updateField("court", e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3"
            >
              <option value="1">Cancha 1</option>
              <option value="2">Cancha 2</option>
            </select>

            <select
              value={form.weekday}
              onChange={(e) => updateField("weekday", e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3"
            >
              {WEEKDAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={form.startTime}
            onChange={(e) => updateField("startTime", e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3"
            required
          >
            {AVAILABLE_START_TIMES.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Hasta (opcional)
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary font-bold px-4 py-3 disabled:opacity-60"
            >
              {submitting ? "Creando..." : "Crear turno fijo"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}