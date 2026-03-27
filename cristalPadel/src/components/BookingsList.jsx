export default function BookingsList({ bookings = [], loading = false }) {
  if (loading) {
    return <p className="px-4">Cargando turnos...</p>;
  }

  if (!bookings.length) {
    return <p className="px-4">No hay turnos cargados.</p>;
  }

  return (
    <div className="px-4 space-y-3 pb-24">
      {bookings.map((booking) => (
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
            <p><strong>Fecha:</strong> {booking.date}</p>
            <p><strong>Hora:</strong> {booking.startTime}</p>
            <p><strong>Cancha:</strong> {booking.court}</p>
            <p>
              <strong>Estado:</strong>{" "}
              <span
                className={
                  booking.status === "cancelled"
                    ? "text-red-500 font-semibold"
                    : "text-primary font-semibold"
                }
              >
                {booking.status}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}