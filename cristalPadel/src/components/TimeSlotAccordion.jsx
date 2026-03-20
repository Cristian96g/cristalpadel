function getAvailableCount(slot) {
  return slot.courts.filter((court) => court.status === "available").length;
}

function CourtButton({ courtNumber, available, onClick }) {
  if (!available) {
    return (
      <button
        disabled
        className="flex items-center justify-between p-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
      >
        <div className="text-left">
          <span className="block text-[10px] font-bold uppercase tracking-wider opacity-60" translate="no">
            Cancha {courtNumber}
          </span>
          <span className="text-lg font-bold" translate="no">Turno reservado</span>
        </div>
        <span className="material-symbols-outlined text-3xl opacity-30" translate="no">lock</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between p-5 rounded-2xl bg-available text-white shadow-lg shadow-available/25 active:scale-[0.98] transition-transform"
    >
      <div className="text-left">
        <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80" translate="no">
          Cancha {courtNumber}
        </span>
        <span className="text-lg font-bold" translate="no">Reservar</span>
      </div>
      <span className="material-symbols-outlined text-3xl" translate="no">chevron_right</span>
    </button>
  );
}

export default function TimeSlotAccordion({ slot, onPick }) {
  const availableCount = getAvailableCount(slot);

  if (availableCount === 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 opacity-60">
        <div className="flex items-center justify-between p-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-400 dark:text-slate-600" translate="no">
              {slot.startTime}
            </span>
            <span className="text-xs font-medium text-slate-400" translate="no">
              Completo
            </span>
          </div>
          <div className="size-12 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400" translate="no">lock</span>
          </div>
        </div>
      </div>
    );
  }

  const c1 = slot.courts.find((c) => c.court === 1);
  const c2 = slot.courts.find((c) => c.court === 2);

  return (
    <details className="group bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300">
      <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
        <div className="summary-content flex items-center justify-between w-full">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900 dark:text-white" translate="no">
              {slot.startTime}
            </span>
            <span className="text-xs font-medium text-available" translate="no">
              {availableCount} cancha{availableCount > 1 ? "s" : ""} disponible{availableCount > 1 ? "s" : ""}
            </span>
          </div>

          <div className="size-12 rounded-2xl bg-available/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-available font-bold" translate="no">
              sports_tennis
            </span>
          </div>
        </div>

        <div className="expanded-content w-full">
          <div className="flex items-center justify-between mb-6">
            <span className="text-2xl font-bold text-slate-900 dark:text-white" translate="no">
              {slot.startTime} Slot
            </span>
            <span className="material-symbols-outlined text-slate-400 rotate-180" translate="no">
              expand_more
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <CourtButton
              courtNumber={1}
              available={c1?.status === "available"}
              onClick={() =>
                onPick({
                  court: 1,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                })
              }
            />

            <CourtButton
              courtNumber={2}
              available={c2?.status === "available"}
              onClick={() =>
                onPick({
                  court: 2,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                })
              }
            />
          </div>
        </div>
      </summary>
    </details>
  );
}