import { formatDisplayDate } from "../utils/dates.js";

export default function FixedBookingsList({ fixedBookings = [], loading = false }) {
  if (loading) {
    return <p className="px-4">Cargando turnos fijos...</p>;
  }

  if (!fixedBookings.length) {
    return <p className="px-4">No hay turnos fijos cargados.</p>;
  }

  return (
    <div className="px-4 space-y-3 pb-24">
      {fixedBookings.map((item) => (
        <div
          key={item._id}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {item.name} {item.lastName || ""}
              </p>
              <p className="text-sm text-slate-500">{item.phone}</p>
            </div>

            <span
              className={[
                "shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
                item.active
                  ? "bg-primary/15 border border-primary/30 text-primary"
                  : "bg-slate-500/15 border border-slate-500/30 text-slate-400",
              ].join(" ")}
            >
              {item.active ? "Activo" : "Inactivo"}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
            <p><strong>Días:</strong> {item.weekdayLabel}</p>
            <p><strong>Hora:</strong> {item.startTime}</p>
            <p><strong>Cancha:</strong> {item.court}</p>
            <p><strong>Desde:</strong> {formatDisplayDate(item.startDate)}</p>
            <p className="col-span-2">
              <strong>Hasta:</strong> {item.endDate ? formatDisplayDate(item.endDate) : "Sin fecha fin"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
