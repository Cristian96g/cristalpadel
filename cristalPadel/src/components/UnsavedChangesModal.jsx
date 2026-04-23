export default function UnsavedChangesModal({ open, onCancel, onDiscard }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/75 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-[28px] border border-slate-800 bg-slate-900 p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
            <span className="material-symbols-outlined notranslate" translate="no">
              warning
            </span>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">¿Descartar cambios?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Tenés cambios sin guardar. ¿Querés salir sin guardar?
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-700 px-4 py-3 font-bold text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-2xl bg-red-500 px-4 py-3 font-bold text-white"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
}
