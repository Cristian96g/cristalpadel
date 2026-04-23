import BookingSlotRow from "./BookingSlotRow.jsx";

export default function BookingHome({ loading, error, data, onPick }) {
  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        Cargando disponibilidad…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-semibold">
        ⚠️ {error}
      </div>
    );
  }

  if (data?.closed) {
    return (
      <main className="px-4 pb-24 max-w-2xl mx-auto">
        <div className="rounded-[28px] border border-slate-800 bg-slate-900 p-5 text-center">
          <span className="material-symbols-outlined text-primary text-4xl notranslate" translate="no">
            event_busy
          </span>
          <h2 className="mt-3 text-xl font-extrabold text-white">
            No hay reservas online
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {data.message || "Este dia no esta disponible para reserva online."}
          </p>
        </div>
      </main>
    );
  }

  if (!data || !data.slots?.length) {
    return (
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        No hay horarios disponibles.
      </div>
    );
  }

  return (
    <main className="flex-1 px-4 pb-24 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="px-1">
          <h2 className="text-[12px] font-bold text-slate-400 py-2 uppercase tracking-[0.2em]">
            Seleccioná un horario
          </h2>
        </div>

        <div className="flex gap-4 mb-2">
          <div className="w-16"></div>
          <div className="flex-1 text-center font-bold text-primary/70 text-sm">
            CANCHA 1
          </div>
          <div className="flex-1 text-center font-bold text-primary/70 text-sm">
            CANCHA 2
          </div>
        </div>

        {data.slots.map((slot) => (
          <BookingSlotRow
            key={slot.startTime}
            slot={slot}
            date={data.date}
            onPick={onPick}
          />
        ))}
      </div>
    </main>
  );
}
