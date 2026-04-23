import { formatDisplayDate } from "../utils/dates.js";

const FILTERS = [
  { key: "all", label: "Todas" },
  { key: "pending_payment", label: "Pendientes" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "expired", label: "Vencidas" },
  { key: "cancelled", label: "Canceladas" },
];

export default function BookingsList({
  bookings = [],
  loading = false,
  statusFilter = "all",
  onChangeStatusFilter,
  onConfirmExpired,
}) {
  if (loading) {
    return <p className="px-4">Cargando turnos...</p>;
  }

  const visibleBookings =
    statusFilter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === statusFilter);

  return (
    <div className="px-4 space-y-3 pb-24">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => onChangeStatusFilter?.(filter.key)}
            className={[
              "shrink-0 rounded-2xl px-4 py-2 text-xs font-extrabold",
              statusFilter === filter.key
                ? "bg-primary text-white"
                : "bg-slate-900 text-slate-300 ring-1 ring-slate-800",
            ].join(" ")}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {!visibleBookings.length ? (
        <p className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
          No hay turnos para este filtro.
        </p>
      ) : null}

      {visibleBookings.map((booking) => (
        <div
          key={booking._id}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {booking.name} {booking.lastName || ""}
              </p>
              <p className="text-sm text-slate-500">{booking.phone}</p>
            </div>

            {booking.fixedBookingId && (
              <span className="shrink-0 rounded-full bg-primary/15 border border-primary/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                Turno fijo
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
            <p><strong>Fecha:</strong> {formatDisplayDate(booking.date)}</p>
            <p><strong>Hora:</strong> {booking.startTime}</p>
            <p><strong>Cancha:</strong> {booking.court}</p>
            <p>
              <strong>Estado:</strong>{" "}
              <span className={statusClass(booking.status)}>
                {statusLabel(booking.status)}
              </span>
            </p>
          </div>
          {booking.status === "expired" ? (
            <div className="mt-3 space-y-3">
              <p className="rounded-2xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400">
                Esta reserva vencio y ya no bloquea el horario.
              </p>
              <button
                type="button"
                onClick={() => onConfirmExpired?.(booking)}
                className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"
              >
                Confirmar manualmente
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function statusLabel(status) {
  if (status === "pending_payment") return "Pendiente de seña";
  if (status === "confirmed") return "Confirmada";
  if (status === "cancelled") return "Cancelada";
  if (status === "expired") return "Vencida";
  return status;
}

function statusClass(status) {
  if (status === "cancelled" || status === "expired") return "text-red-500 font-semibold";
  if (status === "pending_payment") return "text-amber-500 font-semibold";
  return "text-primary font-semibold";
}
