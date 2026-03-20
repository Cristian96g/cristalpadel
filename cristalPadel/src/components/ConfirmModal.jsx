import { useEffect, useState } from "react";

export default function ConfirmModal({ open, onClose, onConfirm, subtitle }) {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setLastName("");
      setPhone("");
      setErr("");
      setSaving(false);
    }
  }, [open]);

  async function handleConfirm() {
    setErr("");
    const n = name.trim();
    const l = lastName.trim();
    const p = phone.trim();

    if (n.length < 3) return setErr("Ingresá un nombre válido.");
    if (l.length < 3) return setErr("Ingresá un apellido válido.");
    if (p.length < 8) return setErr("Ingresá un teléfono válido.");

    setSaving(true);
    const res = await onConfirm({ name: n,lastName: l, phone: p });
    if (!res?.ok) {
      setErr(res?.message || "Error");
      setSaving(false);
      return;
    }
  }

  return (
    <div
      className={[
        "fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
      onMouseDown={() => !saving && onClose()}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold">Confirmar Reserva</h3>
          <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Nombre</label>
            <input
              className="w-full rounded-2xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cristian"
              autoFocus
            />
          </div>
 <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Apellido</label>
            <input
              className="w-full rounded-2xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ej: Gomez"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Teléfono</label>
            <input
              className="w-full rounded-2xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 2966xxxxxx"
              inputMode="tel"
            />
          </div>

          {err && (
            <div className="text-sm font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
              ⚠️ {err}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={saving}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 disabled:opacity-70"
          >
            {saving ? "Confirmando…" : "Confirmar Reserva"}
          </button>

          <button
            onClick={onClose}
            disabled={saving}
            className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-2xl"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}